/**
 * Illustration Cache Context
 * Shared context for managing illustration generation state across Step 2 and Step 3
 * Enables smooth transitions and prevents duplicate generations
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import logger from '../../lib/utils/logger';

interface IllustrationCacheItem {
  exerciseName: string;
  queueId: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  illustrationId?: string;
  timestamp: number;
}

interface IllustrationCacheContextValue {
  // Get cached illustration info
  getCachedIllustration: (exerciseName: string) => IllustrationCacheItem | null;

  // Set/update cached illustration
  setCachedIllustration: (exerciseName: string, data: Partial<IllustrationCacheItem>) => void;

  // Remove from cache
  removeCachedIllustration: (exerciseName: string) => void;

  // Check if exercise is currently being generated
  isGenerating: (exerciseName: string) => boolean;

  // Get all cached items
  getAllCached: () => Map<string, IllustrationCacheItem>;

  // Clear all cache
  clearCache: () => void;

  // Get generation stats
  getStats: () => {
    total: number;
    queued: number;
    generating: number;
    completed: number;
    failed: number;
  };
}

const IllustrationCacheContext = createContext<IllustrationCacheContextValue | null>(null);

interface IllustrationCacheProviderProps {
  children: ReactNode;
}

export function IllustrationCacheProvider({ children }: IllustrationCacheProviderProps) {
  const [cache, setCache] = useState<Map<string, IllustrationCacheItem>>(new Map());

  // Normalize exercise name for consistent caching
  const normalizeExerciseName = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }, []);

  const getCachedIllustration = useCallback((exerciseName: string): IllustrationCacheItem | null => {
    const normalized = normalizeExerciseName(exerciseName);
    return cache.get(normalized) || null;
  }, [cache, normalizeExerciseName]);

  const setCachedIllustration = useCallback((exerciseName: string, data: Partial<IllustrationCacheItem>) => {
    const normalized = normalizeExerciseName(exerciseName);

    setCache(prev => {
      const newCache = new Map(prev);
      const existing = newCache.get(normalized);

      const updated: IllustrationCacheItem = {
        exerciseName: existing?.exerciseName || exerciseName,
        queueId: data.queueId || existing?.queueId || '',
        status: data.status || existing?.status || 'queued',
        imageUrl: data.imageUrl || existing?.imageUrl,
        illustrationId: data.illustrationId || existing?.illustrationId,
        timestamp: data.timestamp || existing?.timestamp || Date.now()
      };

      newCache.set(normalized, updated);

      logger.debug('ILLUSTRATION_CACHE', 'Updated cache', {
        exerciseName,
        status: updated.status,
        hasImageUrl: !!updated.imageUrl
      });

      return newCache;
    });
  }, [normalizeExerciseName]);

  const removeCachedIllustration = useCallback((exerciseName: string) => {
    const normalized = normalizeExerciseName(exerciseName);

    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(normalized);

      logger.debug('ILLUSTRATION_CACHE', 'Removed from cache', {
        exerciseName
      });

      return newCache;
    });
  }, [normalizeExerciseName]);

  const isGenerating = useCallback((exerciseName: string): boolean => {
    const cached = getCachedIllustration(exerciseName);
    return cached?.status === 'queued' || cached?.status === 'generating';
  }, [getCachedIllustration]);

  const getAllCached = useCallback((): Map<string, IllustrationCacheItem> => {
    return new Map(cache);
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache(new Map());
    logger.info('ILLUSTRATION_CACHE', 'Cache cleared');
  }, []);

  const getStats = useCallback(() => {
    const stats = {
      total: cache.size,
      queued: 0,
      generating: 0,
      completed: 0,
      failed: 0
    };

    cache.forEach(item => {
      switch (item.status) {
        case 'queued':
          stats.queued++;
          break;
        case 'generating':
          stats.generating++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }
    });

    return stats;
  }, [cache]);

  const value: IllustrationCacheContextValue = {
    getCachedIllustration,
    setCachedIllustration,
    removeCachedIllustration,
    isGenerating,
    getAllCached,
    clearCache,
    getStats
  };

  return (
    <IllustrationCacheContext.Provider value={value}>
      {children}
    </IllustrationCacheContext.Provider>
  );
}

export function useIllustrationCache(): IllustrationCacheContextValue {
  const context = useContext(IllustrationCacheContext);

  if (!context) {
    throw new Error('useIllustrationCache must be used within IllustrationCacheProvider');
  }

  return context;
}
