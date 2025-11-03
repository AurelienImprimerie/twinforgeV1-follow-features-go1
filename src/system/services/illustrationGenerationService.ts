/**
 * Illustration Generation Service
 * Manages async generation queue and coordinates with Edge Function
 * Uses OpenAI DALL-E 3 for image generation
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

export interface GenerationRequest {
  type: 'exercise' | 'session';
  exerciseName?: string;
  discipline: string;
  muscleGroups?: string[];
  equipment?: string[];
  movementPattern?: string;
  style?: 'technical' | 'dynamic' | 'minimalist';
  viewAngle?: 'front' | 'side' | '3d' | 'top';
  priority?: number;
}

export interface GenerationResult {
  success: boolean;
  illustrationId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  cost?: number;
}

class IllustrationGenerationService {
  /**
   * NOTE: This service is now only used for queue status checking.
   * Direct generation is now handled by ExerciseIllustration component calling
   * the Edge Function directly for immediate results.
   *
   * The queue system (queueGeneration method) has been removed as it caused
   * unnecessary delays (waiting for cron job to run every 2 minutes).
   */

  /**
   * Check queue status for a specific request
   */
  async checkQueueStatus(queueId: string): Promise<{
    status: string;
    result?: GenerationResult;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('illustration_generation_queue')
        .select('*')
        .eq('id', queueId)
        .single();

      if (error || !data) {
        logger.debug('ILLUSTRATION_POLLING', 'Queue item not found or error', {
          queueId,
          error: error?.message,
          errorCode: error?.code,
          errorDetails: error?.details
        });
        return null;
      }

      logger.debug('ILLUSTRATION_POLLING', 'Queue status checked', {
        queueId,
        status: data.status,
        attempts: data.attempts,
        hasResultId: !!data.result_illustration_id,
        resultId: data.result_illustration_id,
        createdAt: data.created_at,
        startedAt: data.started_at,
        completedAt: data.completed_at
      });

      const result: {
        status: string;
        result?: GenerationResult;
      } = {
        status: data.status
      };

      if (data.status === 'completed' && data.result_illustration_id) {
        const { data: illustration, error: illustrationError } = await supabase
          .from('illustration_library')
          .select('image_url, thumbnail_url')
          .eq('id', data.result_illustration_id)
          .single();

        if (illustrationError) {
          logger.error('ILLUSTRATION_POLLING', 'Failed to fetch illustration from library', {
            queueId,
            illustrationId: data.result_illustration_id,
            error: illustrationError.message,
            errorCode: illustrationError.code
          });
        }

        if (illustration) {
          result.result = {
            success: true,
            illustrationId: data.result_illustration_id,
            imageUrl: illustration.image_url,
            thumbnailUrl: illustration.thumbnail_url
          };
          logger.info('ILLUSTRATION_POLLING', 'Illustration ready', {
            queueId,
            illustrationId: data.result_illustration_id,
            hasImageUrl: !!illustration.image_url,
            hasThumbnailUrl: !!illustration.thumbnail_url
          });
        } else {
          logger.warn('ILLUSTRATION_POLLING', 'Queue marked completed but illustration not found in library', {
            queueId,
            illustrationId: data.result_illustration_id
          });
        }
      } else if (data.status === 'failed') {
        result.result = {
          success: false,
          error: data.error_message || 'Generation failed'
        };
        logger.warn('ILLUSTRATION_POLLING', 'Generation failed', {
          queueId,
          error: data.error_message,
          attempts: data.attempts
        });
      } else if (data.status === 'pending') {
        logger.debug('ILLUSTRATION_POLLING', 'Still pending - waiting for cron job', {
          queueId,
          attempts: data.attempts,
          note: 'Cron job runs every 2 minutes'
        });
      }

      return result;
    } catch (error) {
      logger.error('ILLUSTRATION_GENERATION', 'Error checking queue status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        queueId
      });
      return null;
    }
  }

  // REMOVED: Queue management methods (getPendingQueue, updateQueueStatus)
  // These are only used by the cron job processor which is now deprecated
  // in favor of direct generation.

  // REMOVED: Prompt generation methods
  // These are now handled by the Edge Function directly

  // REMOVED: Queue cleanup method
  // This can be handled by a database trigger or manual cleanup script
}

export const illustrationGenerationService = new IllustrationGenerationService();
