// src/hooks/useBodyScanData.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../system/store/userStore';
import logger from '../lib/utils/logger';
import { supabase } from '../system/supabase/client';

export interface BodyScanData {
  id: string;
  user_id: string;
  timestamp: string;
  created_at: string;
  weight?: number;
  body_fat_percentage?: number;
  morph_values?: Record<string, number>;
  limb_masses?: Record<string, number>;
  skin_tone?: any;
  resolved_gender?: 'male' | 'female';
  bmi?: number;
  waist_circumference?: number;
  raw_measurements?: any;
}

/**
 * Hook to fetch and cache user's latest body scan data
 * Uses React Query for caching and automatic refetching
 */
export function useBodyScanData() {
  const { profile } = useUserStore();
  const queryClient = useQueryClient();
  const userId = profile?.userId;

  const query = useQuery({
    queryKey: ['body-scan-data', userId],
    queryFn: async (): Promise<BodyScanData | null> => {
      if (!userId) {
        logger.debug('USE_BODY_SCAN_DATA', 'No user ID available', {
          philosophy: 'no_user_id'
        });
        return null;
      }

      logger.info('USE_BODY_SCAN_DATA', 'Fetching latest body scan', {
        userId,
        philosophy: 'body_scan_fetch_start'
      });

      const { data, error } = await supabase
        .from('body_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('USE_BODY_SCAN_DATA', 'Error fetching body scan', {
          userId,
          error: error.message,
          philosophy: 'body_scan_fetch_error'
        });
        throw error;
      }

      if (!data) {
        logger.info('USE_BODY_SCAN_DATA', 'No body scan found', {
          userId,
          philosophy: 'no_body_scan'
        });
        return null;
      }

      // CRITICAL: Extract data from direct columns OR fallback to metrics JSONB
      const metrics = data.metrics || {};

      // Priority: direct columns > metrics.final_shape_params > metrics.morph_values
      const morphValues = data.morph_values ||
                         data.morph3d ||
                         metrics.final_shape_params ||
                         {};

      // Priority: direct column > metrics.final_limb_masses
      const limbMasses = data.limb_masses ||
                        metrics.final_limb_masses ||
                        {};

      // Priority: skin_tone_map_v2 > metrics.skin_tone > legacy skin_tone
      const skinTone = data.skin_tone_map_v2 ||
                      metrics.skin_tone ||
                      data.skin_tone ||
                      null;

      // Priority: direct column > metrics.resolved_gender
      const resolvedGender = data.resolved_gender ||
                            metrics.resolved_gender ||
                            null;

      // Extract metrics with fallback logic
      const extractedData = metrics.estimate_result?.extracted_data || {};
      const rawMeasurements = data.raw_measurements ||
                             extractedData.raw_measurements ||
                             {};

      const weight = data.weight ||
                    rawMeasurements.weight_kg ||
                    extractedData.weight_kg ||
                    null;

      const bodyFatPercentage = data.body_fat_percentage ||
                               extractedData.estimated_body_fat_perc ||
                               null;

      const bmi = data.bmi ||
                 extractedData.estimated_bmi ||
                 null;

      const waistCircumference = data.waist_circumference ||
                                rawMeasurements.waist_cm ||
                                null;

      logger.info('USE_BODY_SCAN_DATA', 'Body scan loaded successfully', {
        userId,
        scanId: data.id,
        timestamp: data.timestamp,
        // Morphological data
        hasMorphValues: !!morphValues && Object.keys(morphValues).length > 0,
        morphValuesCount: Object.keys(morphValues).length,
        morphValuesSource: data.morph_values ? 'direct_column' : (metrics.final_shape_params ? 'metrics_jsonb' : 'none'),
        hasLimbMasses: !!limbMasses && Object.keys(limbMasses).length > 0,
        limbMassesCount: Object.keys(limbMasses).length,
        limbMassesSource: data.limb_masses ? 'direct_column' : (metrics.final_limb_masses ? 'metrics_jsonb' : 'none'),
        // Skin tone
        hasSkinTone: !!skinTone,
        skinToneSource: data.skin_tone_map_v2 ? 'v2_direct_column' : (metrics.skin_tone ? 'metrics_jsonb' : (data.skin_tone ? 'legacy_column' : 'none')),
        // Gender
        hasResolvedGender: !!resolvedGender,
        resolvedGenderValue: resolvedGender,
        resolvedGenderSource: data.resolved_gender ? 'direct_column' : (metrics.resolved_gender ? 'metrics_jsonb' : 'none'),
        // Body metrics
        hasWeight: !!weight,
        weight,
        hasBodyFat: !!bodyFatPercentage,
        bodyFatPercentage,
        hasBMI: !!bmi,
        bmi,
        hasWaist: !!waistCircumference,
        waistCircumference,
        // Version info
        avatarVersion: data.avatar_version || metrics.avatar_version || 'unknown',
        gltfModelId: data.gltf_model_id || metrics.gltf_model_id || 'unknown',
        philosophy: 'body_scan_loaded_with_extraction'
      });

      // Return enriched data with all extracted fields
      return {
        ...data,
        morph_values: morphValues,
        limb_masses: limbMasses,
        skin_tone: skinTone,
        resolved_gender: resolvedGender,
        weight,
        body_fat_percentage: bodyFatPercentage,
        bmi,
        waist_circumference: waistCircumference,
        raw_measurements: rawMeasurements
      } as BodyScanData;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - body scan data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnMount: 'always', // Always check for fresh data on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Helper function to invalidate the cache (call after a new body scan)
  const invalidateBodyScanData = () => {
    logger.info('USE_BODY_SCAN_DATA', 'Invalidating body scan data cache', {
      userId,
      philosophy: 'cache_invalidation'
    });
    queryClient.invalidateQueries({ queryKey: ['body-scan-data', userId] });
  };

  // Helper function to manually update the cache
  const updateBodyScanDataCache = (newBodyScanData: BodyScanData) => {
    logger.info('USE_BODY_SCAN_DATA', 'Updating body scan data cache manually', {
      userId,
      scanId: newBodyScanData.id,
      philosophy: 'manual_cache_update'
    });
    queryClient.setQueryData(['body-scan-data', userId], newBodyScanData);
  };

  return {
    bodyScanData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateBodyScanData,
    updateBodyScanDataCache,
  };
}
