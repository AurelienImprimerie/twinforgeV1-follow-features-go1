/**
 * Illustration Matching Service
 * Intelligent matching algorithm to find the best illustration for exercises and sessions
 * Multi-level fallback: exact match → similar → generic → generation queue
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

export interface IllustrationMatch {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  matchScore: number;
  matchType: 'exact' | 'variant' | 'pattern' | 'generic' | 'fallback';
  source: string;
  isDiptych?: boolean;
  aspectRatio?: string;
}

export interface ExerciseMatchCriteria {
  exerciseName: string;
  discipline: string;
  muscleGroups?: string[];
  equipment?: string[];
  movementPattern?: string;
}

export interface SessionMatchCriteria {
  discipline: string;
  focus?: string[];
  equipment?: string[];
  durationType?: string;
}

interface IllustrationRecord {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  exercise_name: string;
  exercise_name_normalized: string;
  discipline: string;
  muscle_groups: string[];
  equipment_tags: string[];
  movement_pattern?: string;
  generation_source: string;
  is_diptych?: boolean;
  image_aspect_ratio?: string;
}

class IllustrationMatchingService {
  private cache: Map<string, IllustrationMatch> = new Map();
  private readonly CACHE_TTL_MS = 3600000; // 1 hour
  private cacheTimestamps: Map<string, number> = new Map();
  private tablesAvailable: boolean = true;
  private tablesCheckDone: boolean = false;

  /**
   * Check if illustration tables are available
   */
  private async checkTablesAvailability(): Promise<boolean> {
    if (this.tablesCheckDone) {
      return this.tablesAvailable;
    }

    try {
      const { error } = await supabase
        .from('illustration_library')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST205') {
        logger.warn('ILLUSTRATION_MATCHING', 'Illustration tables not found in database', {
          message: 'Running in degraded mode without illustrations'
        });
        this.tablesAvailable = false;
      } else {
        this.tablesAvailable = true;
      }
    } catch (error) {
      logger.warn('ILLUSTRATION_MATCHING', 'Failed to check tables availability', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.tablesAvailable = false;
    }

    this.tablesCheckDone = true;
    return this.tablesAvailable;
  }

  /**
   * Find best matching illustration for an exercise
   * SIMPLIFIED: Only exact match or return null (no fallback matching)
   */
  async findExerciseIllustration(
    criteria: ExerciseMatchCriteria
  ): Promise<IllustrationMatch | null> {
    const available = await this.checkTablesAvailability();
    if (!available) {
      return null;
    }

    const cacheKey = this.getCacheKey('exercise', criteria.exerciseName, criteria.discipline);

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // ONLY exact name match
      const exactMatch = await this.findExactMatch(criteria);
      if (exactMatch) {
        this.setCache(cacheKey, exactMatch);
        await this.incrementUsage(exactMatch.id);
        return exactMatch;
      }

      // No match found - caller will handle queueing if needed
      return null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('PGRST205')) {
        this.tablesAvailable = false;
      }
      return null;
    }
  }

  /**
   * Find illustration for training session
   */
  async findSessionIllustration(
    criteria: SessionMatchCriteria
  ): Promise<IllustrationMatch | null> {
    const available = await this.checkTablesAvailability();
    if (!available) {
      return null;
    }

    const cacheKey = this.getCacheKey('session', criteria.discipline, JSON.stringify(criteria.focus));

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    logger.debug('ILLUSTRATION_MATCHING', 'Finding session illustration', {
      discipline: criteria.discipline,
      focus: criteria.focus
    });

    try {
      const { data, error } = await supabase
        .from('illustration_library')
        .select('*')
        .eq('type', 'session')
        .eq('discipline', criteria.discipline)
        .order('usage_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST205') {
          this.tablesAvailable = false;
        }
        logger.debug('ILLUSTRATION_MATCHING', 'No session illustration available', {
          discipline: criteria.discipline
        });
        return null;
      }

      if (!data) {
        logger.debug('ILLUSTRATION_MATCHING', 'No session illustration found', {
          discipline: criteria.discipline
        });
        return null;
      }

      const match: IllustrationMatch = {
        id: data.id,
        imageUrl: data.image_url,
        thumbnailUrl: data.thumbnail_url,
        matchScore: 100,
        matchType: 'exact',
        source: data.generation_source,
        isDiptych: data.is_diptych,
        aspectRatio: data.image_aspect_ratio
      };

      this.setCache(cacheKey, match);
      await this.incrementUsage(data.id);

      return match;
    } catch (error) {
      if (error instanceof Error && error.message.includes('PGRST205')) {
        this.tablesAvailable = false;
      }
      logger.debug('ILLUSTRATION_MATCHING', 'Session illustration unavailable');
      return null;
    }
  }

  /**
   * Level 1: Exact name match
   */
  private async findExactMatch(
    criteria: ExerciseMatchCriteria
  ): Promise<IllustrationMatch | null> {
    const normalizedName = this.normalizeExerciseName(criteria.exerciseName);

    const { data, error } = await supabase
      .from('illustration_library')
      .select('*')
      .eq('type', 'exercise')
      .eq('discipline', criteria.discipline)
      .eq('exercise_name_normalized', normalizedName)
      .order('quality_score', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    logger.info('ILLUSTRATION_MATCHING', 'Exact match found', {
      exerciseName: criteria.exerciseName,
      illustrationId: data.id
    });

    return {
      id: data.id,
      imageUrl: data.image_url,
      thumbnailUrl: data.thumbnail_url,
      matchScore: 100,
      matchType: 'exact',
      source: data.generation_source,
      isDiptych: data.is_diptych,
      aspectRatio: data.image_aspect_ratio
    };
  }

  // REMOVED: Variant matching - too complex and unreliable

  // REMOVED: Pattern matching - too complex and unreliable

  // REMOVED: Generic matching - not needed with queue-based generation

  // REMOVED: Queue generation moved to illustrationGenerationService

  /**
   * Increment usage count
   */
  private async incrementUsage(illustrationId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_illustration_usage', {
        illustration_id: illustrationId
      });

      if (error) {
        logger.warn('ILLUSTRATION_MATCHING', 'Failed to increment usage', {
          error: error.message
        });
      }
    } catch (error) {
      // Non-critical, just log
      logger.debug('ILLUSTRATION_MATCHING', 'Usage increment error', {
        illustrationId
      });
    }
  }

  /**
   * Utility: Normalize exercise name with enhanced synonyms
   */
  private normalizeExerciseName(name: string): string {
    let normalized = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .trim();

    // Remove common articles and prepositions
    const articlesToRemove = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'a', 'au', 'aux', 'the', 'a', 'an'];
    articlesToRemove.forEach(article => {
      const regex = new RegExp(`\\b${article}\\b`, 'gi');
      normalized = normalized.replace(regex, ' ');
    });

    // Apply common synonyms and translations
    const synonymMap: Record<string, string> = {
      // French → English common terms
      'squat barre': 'back squat',
      'squat arriere': 'back squat',
      'developpe couche': 'bench press',
      'developpe militaire': 'military press',
      'developpe epaules': 'shoulder press',
      'tractions': 'pull up',
      'tirage': 'pull',
      'soulevé de terre': 'deadlift',
      'souleve terre': 'deadlift',
      'fentes': 'lunge',
      'pompes': 'push up',
      'dips': 'dip',
      'flexions': 'curl',
      'extensions': 'extension',
      'abdos': 'abs',
      'abdominaux': 'abs',
      'gainage': 'plank',
      // Common variations
      'barre': 'barbell',
      'halteres': 'dumbbell',
      'haltere': 'dumbbell',
      'kettlebell': 'kettlebell',
      'poids corps': 'bodyweight',
      'poids de corps': 'bodyweight',
      // Equipment synonyms
      'barre olympique': 'barbell',
      'barre ez': 'ez bar',
    };

    // Apply synonym mapping
    for (const [key, value] of Object.entries(synonymMap)) {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      normalized = normalized.replace(regex, value);
    }

    // Clean up extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  // REMOVED: Utility functions for fuzzy matching (no longer needed)

  /**
   * Cache management
   */
  private getCacheKey(...parts: string[]): string {
    return parts.join('::');
  }

  private getFromCache(key: string): IllustrationMatch | null {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp || Date.now() - timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  private setCache(key: string, value: IllustrationMatch): void {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());

    // Limit cache size to 100 items
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.cacheTimestamps.delete(firstKey);
      }
    }
  }

  /**
   * Clear cache (useful for testing/debugging)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
    logger.info('ILLUSTRATION_MATCHING', 'Cache cleared');
  }
}

export const illustrationMatchingService = new IllustrationMatchingService();
