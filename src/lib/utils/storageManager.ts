/**
 * Storage Manager
 * Utilities for managing localStorage quota and preventing QuotaExceededError
 */

import logger from './logger';

interface StorageStats {
  used: number;
  available: number;
  percentage: number;
  items: { key: string; size: number }[];
}

/**
 * Calculate the size of a string in bytes
 */
function getStringSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * Get detailed storage statistics
 */
export function getStorageStats(): StorageStats {
  const items: { key: string; size: number }[] = [];
  let totalSize = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = getStringSize(key + value);
        items.push({ key, size });
        totalSize += size;
      }
    }
  } catch (error) {
    logger.error('STORAGE_MANAGER', 'Failed to calculate storage stats', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Sort by size descending
  items.sort((a, b) => b.size - a.size);

  // Estimate available space (5-10MB typical localStorage limit)
  const estimatedLimit = 10 * 1024 * 1024; // 10MB
  const available = estimatedLimit - totalSize;
  const percentage = (totalSize / estimatedLimit) * 100;

  return {
    used: totalSize,
    available: Math.max(0, available),
    percentage,
    items,
  };
}

/**
 * Log storage usage with detailed breakdown
 */
export function logStorageUsage(context: string = 'STORAGE_USAGE'): void {
  const stats = getStorageStats();

  logger.info(context, 'Storage usage', {
    usedMB: (stats.used / (1024 * 1024)).toFixed(2),
    availableMB: (stats.available / (1024 * 1024)).toFixed(2),
    percentage: stats.percentage.toFixed(1),
    itemCount: stats.items.length,
    largestItems: stats.items.slice(0, 5).map(item => ({
      key: item.key,
      sizeMB: (item.size / (1024 * 1024)).toFixed(2),
    })),
  });
}

/**
 * Clean up React Query cache from localStorage
 */
export function cleanReactQueryCache(): number {
  let cleanedSize = 0;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('REACT_QUERY_')) {
        const value = localStorage.getItem(key) || '';
        cleanedSize += getStringSize(key + value);
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    logger.info('STORAGE_CLEANUP', 'React Query cache cleaned', {
      keysRemoved: keysToRemove.length,
      spaceFreesMB: (cleanedSize / (1024 * 1024)).toFixed(2),
    });
  } catch (error) {
    logger.error('STORAGE_CLEANUP', 'Failed to clean React Query cache', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return cleanedSize;
}

/**
 * Clean up old data from specific stores
 */
export function cleanOldStoreData(storePrefix: string, maxAgeDays: number = 7): number {
  let cleanedSize = 0;

  try {
    const now = Date.now();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(storePrefix)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const data = JSON.parse(value);
            const state = data.state;

            // Check if data has a timestamp and is old
            if (state?.timestamp) {
              const age = now - new Date(state.timestamp).getTime();
              if (age > maxAgeMs) {
                cleanedSize += getStringSize(key + value);
                keysToRemove.push(key);
              }
            }
          }
        } catch (parseError) {
          // Invalid JSON, consider removing
          logger.warn('STORAGE_CLEANUP', 'Invalid JSON in localStorage, removing', { key });
          const value = localStorage.getItem(key) || '';
          cleanedSize += getStringSize(key + value);
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    if (keysToRemove.length > 0) {
      logger.info('STORAGE_CLEANUP', 'Old store data cleaned', {
        storePrefix,
        keysRemoved: keysToRemove.length,
        spaceFreesMB: (cleanedSize / (1024 * 1024)).toFixed(2),
      });
    }
  } catch (error) {
    logger.error('STORAGE_CLEANUP', 'Failed to clean old store data', {
      storePrefix,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return cleanedSize;
}

/**
 * Aggressively clean up localStorage to free space
 * Returns the amount of space freed in bytes
 */
export function aggressiveCleanup(): number {
  logger.info('STORAGE_CLEANUP', 'Starting aggressive cleanup');

  const statsBeforeCleanup = getStorageStats();

  let totalFreed = 0;

  // 1. Clean React Query cache (largest contributor)
  totalFreed += cleanReactQueryCache();

  // 2. Clean old chat store data
  totalFreed += cleanOldStoreData('fastlift:chat:', 7);

  // 3. Clean old coach chat store data
  totalFreed += cleanOldStoreData('fastlift:coach-chat:', 7);

  // 4. Clean old meal plan store data
  totalFreed += cleanOldStoreData('fastlift:meal-plan:', 7);

  // 5. Clean old fridge scan data
  totalFreed += cleanOldStoreData('fastlift:fridge-scan:', 7);

  const statsAfter = getStorageStats();

  logger.info('STORAGE_CLEANUP', 'Aggressive cleanup completed', {
    freedMB: (totalFreed / (1024 * 1024)).toFixed(2),
    usageBeforePercent: statsBeforeCleanup.percentage.toFixed(1),
    usageAfterPercent: statsAfter.percentage.toFixed(1),
    improvement: (statsBeforeCleanup.percentage - statsAfter.percentage).toFixed(1),
  });

  return totalFreed;
}

/**
 * Check if localStorage has enough space for an operation
 */
export function hasEnoughSpace(requiredBytes: number): boolean {
  const stats = getStorageStats();
  return stats.available >= requiredBytes;
}

/**
 * Attempt to free space if needed, then execute a storage operation
 */
export async function safeStorageOperation<T>(
  operation: () => T,
  context: string = 'SAFE_STORAGE_OP'
): Promise<T> {
  try {
    return operation();
  } catch (error) {
    // Check if it's a QuotaExceededError
    if (
      error instanceof Error &&
      (error.name === 'QuotaExceededError' ||
        error.message.includes('quota') ||
        error.message.includes('QuotaExceededError'))
    ) {
      logger.warn(context, 'QuotaExceededError detected, attempting cleanup', {
        error: error.message,
      });

      // Perform aggressive cleanup
      const freedSpace = aggressiveCleanup();

      if (freedSpace > 0) {
        logger.info(context, 'Retrying operation after cleanup', {
          freedMB: (freedSpace / (1024 * 1024)).toFixed(2),
        });

        // Retry operation
        try {
          return operation();
        } catch (retryError) {
          logger.error(context, 'Operation failed even after cleanup', {
            error: retryError instanceof Error ? retryError.message : String(retryError),
          });
          throw retryError;
        }
      } else {
        logger.error(context, 'No space could be freed, operation failed', {
          error: error.message,
        });
        throw error;
      }
    }

    // Not a quota error, rethrow
    throw error;
  }
}

/**
 * Monitor storage usage and warn if approaching limit
 */
export function monitorStorageUsage(): void {
  const stats = getStorageStats();

  if (stats.percentage > 90) {
    logger.error('STORAGE_MONITOR', 'Storage critically full', {
      percentage: stats.percentage.toFixed(1),
      usedMB: (stats.used / (1024 * 1024)).toFixed(2),
    });
  } else if (stats.percentage > 75) {
    logger.warn('STORAGE_MONITOR', 'Storage usage high', {
      percentage: stats.percentage.toFixed(1),
      usedMB: (stats.used / (1024 * 1024)).toFixed(2),
    });
  }
}
