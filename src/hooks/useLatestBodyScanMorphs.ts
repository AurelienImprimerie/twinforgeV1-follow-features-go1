// src/hooks/useLatestBodyScanMorphs.ts
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../system/store/userStore';
import { bodyScanRepo } from '../system/data/repositories/bodyScanRepo';
import logger from '../lib/utils/logger';

export interface BodyScanMorphData {
  morph_values: Record<string, number>;
  limb_masses: Record<string, number>;
  scan_id: string;
  created_at: string;
  resolved_gender?: string;
  weight?: number;
  skin_tone?: any;
}

/**
 * Hook to fetch and cache the latest body scan morph values
 * Used to integrate body morphology keys (like pearFigure) into face viewer
 */
export function useLatestBodyScanMorphs() {
  const { profile } = useUserStore();

  const query = useQuery({
    queryKey: ['latest-body-scan-morphs', profile?.userId],
    queryFn: async (): Promise<BodyScanMorphData | null> => {
      if (!profile?.userId) {
        logger.debug('USE_LATEST_BODY_SCAN_MORPHS', 'No user ID available', {
          philosophy: 'no_user_id'
        });
        return null;
      }

      logger.info('USE_LATEST_BODY_SCAN_MORPHS', 'Fetching latest body scan morph data', {
        userId: profile.userId,
        philosophy: 'fetch_latest_body_scan'
      });

      try {
        const latestScan = await bodyScanRepo.getLatestWithMorphData(profile.userId);

        if (!latestScan) {
          logger.info('USE_LATEST_BODY_SCAN_MORPHS', 'No body scan found for user', {
            userId: profile.userId,
            philosophy: 'no_body_scan_found'
          });
          return null;
        }

        // Validate morph_values structure
        if (!latestScan.morph_values || typeof latestScan.morph_values !== 'object') {
          logger.warn('USE_LATEST_BODY_SCAN_MORPHS', 'Body scan has invalid or missing morph_values', {
            userId: profile.userId,
            scanId: latestScan.id,
            hasMorphValues: !!latestScan.morph_values,
            morphValuesType: typeof latestScan.morph_values,
            philosophy: 'invalid_morph_values'
          });
          return null;
        }

        // Filter to only numeric values
        const validMorphValues: Record<string, number> = {};
        Object.entries(latestScan.morph_values).forEach(([key, value]) => {
          if (typeof value === 'number' && Number.isFinite(value)) {
            validMorphValues[key] = value;
          }
        });

        // Filter limb_masses to only numeric values
        const validLimbMasses: Record<string, number> = {};
        if (latestScan.limb_masses && typeof latestScan.limb_masses === 'object') {
          Object.entries(latestScan.limb_masses).forEach(([key, value]) => {
            if (typeof value === 'number' && Number.isFinite(value)) {
              validLimbMasses[key] = value;
            }
          });
        }

        logger.info('USE_LATEST_BODY_SCAN_MORPHS', 'Body scan morph data loaded successfully', {
          userId: profile.userId,
          scanId: latestScan.id,
          morphValuesCount: Object.keys(validMorphValues).length,
          limbMassesCount: Object.keys(validLimbMasses).length,
          hasWeight: !!latestScan.weight,
          hasSkinTone: !!latestScan.skin_tone,
          resolvedGender: latestScan.resolved_gender,
          createdAt: latestScan.created_at,
          sampleMorphKeys: Object.keys(validMorphValues).slice(0, 10),
          philosophy: 'body_scan_morphs_loaded'
        });

        return {
          morph_values: validMorphValues,
          limb_masses: validLimbMasses,
          scan_id: latestScan.id,
          created_at: latestScan.created_at || latestScan.timestamp,
          resolved_gender: latestScan.resolved_gender,
          weight: latestScan.weight,
          skin_tone: latestScan.skin_tone
        };
      } catch (error) {
        logger.error('USE_LATEST_BODY_SCAN_MORPHS', 'Error fetching body scan morph data', {
          userId: profile.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          philosophy: 'fetch_error'
        });
        return null;
      }
    },
    enabled: !!profile?.userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - body scan data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnMount: false, // Don't refetch on every mount (use cache)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1, // Retry once on failure
  });

  return {
    bodyScanMorphData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
