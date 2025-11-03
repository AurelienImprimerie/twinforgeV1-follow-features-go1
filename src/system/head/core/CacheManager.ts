/**
 * CacheManager - Intelligent Caching System
 * Manages cache with TTL and smart invalidation
 */

import logger from '../../../lib/utils/logger';
import type { CacheEntry, ForgeType, CacheInvalidationRule } from '../types';

const DEFAULT_TTLS: Record<ForgeType, number> = {
  training: 5 * 60 * 1000, // 5 minutes
  equipment: 30 * 60 * 1000, // 30 minutes
  nutrition: 10 * 60 * 1000, // 10 minutes
  fasting: 10 * 60 * 1000, // 10 minutes
  'body-scan': 60 * 60 * 1000 // 1 hour
};

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private invalidationRules: CacheInvalidationRule[];

  constructor() {
    this.cache = new Map();
    this.invalidationRules = this.initializeInvalidationRules();
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      logger.debug('CACHE_MANAGER', 'Cache entry expired', { key });
      this.cache.delete(key);
      return null;
    }

    logger.debug('CACHE_MANAGER', 'Cache hit', { key });
    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 5 * 60 * 1000, // Default 5 minutes
      key
    };

    this.cache.set(key, entry);

    logger.debug('CACHE_MANAGER', 'Cache set', { key, ttl: entry.ttl });
  }

  /**
   * Invalidate cache for specific forge
   */
  invalidateForge(forgeType: ForgeType): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(forgeType)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    logger.info('CACHE_MANAGER', 'Forge cache invalidated', {
      forgeType,
      keysDeleted: keysToDelete.length
    });
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();

    logger.info('CACHE_MANAGER', 'All cache cleared', { entriesCleared: size });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let freshEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp <= entry.ttl) {
        freshEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      total: this.cache.size,
      fresh: freshEntries,
      expired: expiredEntries
    };
  }

  /**
   * Check if cache is healthy
   */
  isHealthy(): boolean {
    const stats = this.getStats();
    return stats.fresh > 0 || stats.total === 0;
  }

  /**
   * Initialize invalidation rules
   */
  private initializeInvalidationRules(): CacheInvalidationRule[] {
    return [
      {
        forge: 'training',
        events: ['training_sessions', 'training_feedbacks'],
        ttl: DEFAULT_TTLS.training
      },
      {
        forge: 'equipment',
        events: ['training_locations', 'equipment_detections'],
        ttl: DEFAULT_TTLS.equipment
      },
      {
        forge: 'nutrition',
        events: ['meals', 'meal_plans'],
        ttl: DEFAULT_TTLS.nutrition
      },
      {
        forge: 'fasting',
        events: ['fasting_sessions'],
        ttl: DEFAULT_TTLS.fasting
      },
      {
        forge: 'body-scan',
        events: ['body_scans'],
        ttl: DEFAULT_TTLS['body-scan']
      }
    ];
  }
}
