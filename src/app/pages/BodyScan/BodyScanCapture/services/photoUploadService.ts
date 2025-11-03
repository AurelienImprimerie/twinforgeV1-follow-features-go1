// src/app/pages/BodyScan/BodyScanCapture/services/photoUploadService.ts
/**
 * Photo Upload Service
 * Handles secure photo upload to Supabase Storage
 */

import { supabase } from '../../../../../system/supabase/client';
import { getSignedUrl, PRIVATE_BUCKETS } from '../../../../../lib/storage/signedUrlService';
import logger from '../../../../../lib/utils/logger';
import type { CapturedPhotoEnhanced } from '../../../../../domain/types';

export interface UploadedPhoto {
  view: string;
  url: string;
  report?: any;
}

export interface PhotoUploadProgress {
  current: number;
  total: number;
  currentView: string;
}

/**
 * Upload photos to Supabase Storage with signed URLs
 */
export async function uploadPhotosToStorage(
  userId: string,
  clientScanId: string,
  capturedPhotos: CapturedPhotoEnhanced[],
  onProgress?: (progress: PhotoUploadProgress) => void
): Promise<UploadedPhoto[]> {
  logger.info('PHOTO_UPLOAD_SERVICE', 'Starting photo upload', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    photosCount: capturedPhotos.length
  });

  const uploadedPhotos = await Promise.all(
    capturedPhotos.map(async (photo, index) => {
      try {
        // Notify progress
        if (onProgress) {
          onProgress({
            current: index + 1,
            total: capturedPhotos.length,
            currentView: photo.type
          });
        }

        // Convert blob URL to file
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const file = new File(
          [blob],
          `scan-${clientScanId}-${photo.type}.jpg`,
          { type: 'image/jpeg' }
        );

        // Upload to storage
        const filePath = `scans/${userId}/${clientScanId}/${photo.type}.jpg`;
        const { data, error } = await supabase.storage
          .from('body-scans')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw new Error(`Upload failed for ${photo.type}: ${error.message}`);
        }

        // Get signed URL for private storage (1 hour expiry)
        const signedUrl = await getSignedUrl(PRIVATE_BUCKETS.BODY_SCANS, filePath);

        if (!signedUrl) {
          throw new Error(`Failed to get signed URL for ${photo.type}`);
        }

        logger.info('PHOTO_UPLOAD_SERVICE', `Photo uploaded: ${photo.type}`, {
          clientScanId,
          view: photo.type,
          urlLength: signedUrl.length
        });

        return {
          view: photo.type,
          url: signedUrl,
          report: photo.captureReport
        };
      } catch (error) {
        logger.error('PHOTO_UPLOAD_SERVICE', `Failed to upload ${photo.type} photo`, {
          clientScanId,
          view: photo.type,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    })
  );

  logger.info('PHOTO_UPLOAD_SERVICE', 'Photo upload completed', {
    clientScanId,
    uploadedCount: uploadedPhotos.length,
    views: uploadedPhotos.map(p => p.view)
  });

  return uploadedPhotos;
}

/**
 * Delete photos from Supabase Storage
 */
export async function deletePhotosFromStorage(
  userId: string,
  clientScanId: string,
  photoTypes: string[]
): Promise<void> {
  logger.info('PHOTO_UPLOAD_SERVICE', 'Starting photo deletion', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    photoTypes
  });

  const filePaths = photoTypes.map(type =>
    `scans/${userId}/${clientScanId}/${type}.jpg`
  );

  const { data, error } = await supabase.storage
    .from('body-scans')
    .remove(filePaths);

  if (error) {
    logger.error('PHOTO_UPLOAD_SERVICE', 'Photo deletion failed', {
      clientScanId,
      error: error.message
    });
    throw error;
  }

  logger.info('PHOTO_UPLOAD_SERVICE', 'Photo deletion completed', {
    clientScanId,
    deletedCount: filePaths.length
  });
}

/**
 * Validate photo before upload
 */
export function validatePhoto(photo: CapturedPhotoEnhanced): boolean {
  if (!photo.url || !photo.type) {
    logger.warn('PHOTO_UPLOAD_SERVICE', 'Invalid photo: missing url or type', {
      hasUrl: !!photo.url,
      hasType: !!photo.type
    });
    return false;
  }

  if (!photo.url.startsWith('blob:')) {
    logger.warn('PHOTO_UPLOAD_SERVICE', 'Invalid photo: URL is not a blob', {
      urlPrefix: photo.url.substring(0, 10)
    });
    return false;
  }

  return true;
}
