/**
 * Signed URL Service
 * Manages signed URLs for private storage buckets
 *
 * Best Practice: URLs expire after 1 hour for security
 * Cache signed URLs in memory to reduce Supabase calls
 */

import { supabase } from '../../system/supabase/client';
import logger from '../utils/logger';

// URL cache to avoid regenerating signed URLs
interface SignedUrlCacheEntry {
  url: string;
  expiresAt: number; // timestamp in ms
}

const signedUrlCache = new Map<string, SignedUrlCacheEntry>();

// Default expiration: 1 hour (3600 seconds)
const DEFAULT_EXPIRY_SECONDS = 3600;

// Cache cleanup interval: every 5 minutes
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start cache cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupExpiredUrls();
  }, CACHE_CLEANUP_INTERVAL);
}

/**
 * Clean up expired URLs from cache
 */
function cleanupExpiredUrls(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, entry] of signedUrlCache.entries()) {
    if (entry.expiresAt < now) {
      signedUrlCache.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.debug('SIGNED_URL_SERVICE', `Cleaned up ${cleanedCount} expired URLs from cache`);
  }
}

/**
 * Generate cache key for a storage path
 */
function getCacheKey(bucket: string, path: string): string {
  return `${bucket}:${path}`;
}

/**
 * Check if cached URL is still valid
 */
function getCachedUrl(bucket: string, path: string): string | null {
  const cacheKey = getCacheKey(bucket, path);
  const cached = signedUrlCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  // Check if URL has expired (with 5 minute buffer)
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000; // 5 minutes

  if (cached.expiresAt - bufferMs < now) {
    // URL expired or close to expiring, remove from cache
    signedUrlCache.delete(cacheKey);
    return null;
  }

  logger.debug('SIGNED_URL_SERVICE', 'Using cached signed URL', {
    bucket,
    path,
    expiresIn: Math.round((cached.expiresAt - now) / 1000) + 's'
  });

  return cached.url;
}

/**
 * Cache a signed URL
 */
function cacheUrl(bucket: string, path: string, url: string, expirySeconds: number): void {
  const cacheKey = getCacheKey(bucket, path);
  const expiresAt = Date.now() + (expirySeconds * 1000);

  signedUrlCache.set(cacheKey, {
    url,
    expiresAt
  });

  logger.debug('SIGNED_URL_SERVICE', 'Cached signed URL', {
    bucket,
    path,
    expiresIn: expirySeconds + 's'
  });
}

/**
 * Generate a signed URL for a private storage object
 *
 * @param bucket - Storage bucket name
 * @param path - Path to the object within the bucket
 * @param expirySeconds - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null if error
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expirySeconds: number = DEFAULT_EXPIRY_SECONDS
): Promise<string | null> {
  try {
    // Check cache first
    const cachedUrl = getCachedUrl(bucket, path);
    if (cachedUrl) {
      return cachedUrl;
    }

    logger.debug('SIGNED_URL_SERVICE', 'Generating signed URL', {
      bucket,
      path,
      expirySeconds
    });

    // Generate new signed URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expirySeconds);

    if (error) {
      logger.error('SIGNED_URL_SERVICE', 'Failed to generate signed URL', {
        bucket,
        path,
        error: error.message,
        errorDetails: error,
        statusCode: (error as any).statusCode,
        hint: 'Check if the file exists and RLS policies allow access'
      });
      return null;
    }

    if (!data?.signedUrl) {
      logger.error('SIGNED_URL_SERVICE', 'No signed URL returned', {
        bucket,
        path
      });
      return null;
    }

    // Cache the URL
    cacheUrl(bucket, path, data.signedUrl, expirySeconds);

    logger.info('SIGNED_URL_SERVICE', 'Signed URL generated successfully', {
      bucket,
      path,
      expiresIn: expirySeconds + 's'
    });

    return data.signedUrl;
  } catch (error) {
    logger.error('SIGNED_URL_SERVICE', 'Error generating signed URL', {
      bucket,
      path,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Generate signed URLs for multiple objects
 *
 * @param bucket - Storage bucket name
 * @param paths - Array of paths to objects
 * @param expirySeconds - URL expiration time in seconds (default: 1 hour)
 * @returns Map of path to signed URL (null if error for specific path)
 */
export async function getSignedUrls(
  bucket: string,
  paths: string[],
  expirySeconds: number = DEFAULT_EXPIRY_SECONDS
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  // Process in parallel for better performance
  const promises = paths.map(async (path) => {
    const url = await getSignedUrl(bucket, path, expirySeconds);
    results.set(path, url);
  });

  await Promise.all(promises);

  return results;
}

/**
 * Extract bucket and path from a public URL
 * Useful for migrating from public to private URLs
 *
 * @param publicUrl - The public storage URL
 * @returns Object with bucket and path, or null if invalid
 */
export function parseStorageUrl(publicUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/');

    // Expected format: /storage/v1/object/public/{bucket}/{path}
    if (pathParts[1] === 'storage' && pathParts[2] === 'v1' && pathParts[3] === 'object') {
      const bucket = pathParts[5]; // Skip 'public'
      const path = pathParts.slice(6).join('/');

      if (bucket && path) {
        return { bucket, path };
      }
    }

    return null;
  } catch (error) {
    logger.error('SIGNED_URL_SERVICE', 'Failed to parse storage URL', {
      publicUrl,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Convert a public URL to a signed URL
 * Useful for migrating existing code from public to private buckets
 *
 * @param publicUrl - The public storage URL
 * @param expirySeconds - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null if error
 */
export async function publicUrlToSignedUrl(
  publicUrl: string,
  expirySeconds: number = DEFAULT_EXPIRY_SECONDS
): Promise<string | null> {
  const parsed = parseStorageUrl(publicUrl);
  if (!parsed) {
    return null;
  }

  return getSignedUrl(parsed.bucket, parsed.path, expirySeconds);
}

/**
 * Clear the entire signed URL cache
 * Useful for debugging or when signing out
 */
export function clearSignedUrlCache(): void {
  const size = signedUrlCache.size;
  signedUrlCache.clear();
  logger.info('SIGNED_URL_SERVICE', `Cleared ${size} URLs from cache`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: Array<{ bucket: string; path: string; expiresIn: number }> } {
  const now = Date.now();
  const entries: Array<{ bucket: string; path: string; expiresIn: number }> = [];

  for (const [key, entry] of signedUrlCache.entries()) {
    const [bucket, ...pathParts] = key.split(':');
    const path = pathParts.join(':');
    const expiresIn = Math.round((entry.expiresAt - now) / 1000);

    entries.push({ bucket, path, expiresIn });
  }

  return {
    size: signedUrlCache.size,
    entries
  };
}

// Export private bucket names for reference
export const PRIVATE_BUCKETS = {
  BODY_SCANS: 'body-scans',
  MODELS_3D: '3d-models',
  SILHOUETTES: 'silhouettes',
  FAST_ARCHETYPE: 'fast-archetype',
  MEAL_PHOTOS: 'meal-photos',
  TRAINING_LOCATIONS: 'training-locations',
} as const;

// Export public bucket names for reference
export const PUBLIC_BUCKETS = {
  TRAINING_ILLUSTRATIONS: 'training-illustrations',
} as const;
