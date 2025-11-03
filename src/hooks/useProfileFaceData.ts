// src/hooks/useProfileFaceData.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../system/store/userStore';
import logger from '../lib/utils/logger';

export interface FaceData {
  final_face_params: Record<string, number>;
  skin_tone?: any;
  resolved_gender?: 'male' | 'female';
  last_face_scan_id?: string;
  updated_at?: string;
}

/**
 * Hook to fetch and cache user's face scan data from profile
 * Uses React Query for caching and automatic refetching
 */
export function useProfileFaceData() {
  const { profile } = useUserStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile-face-data', profile?.userId],
    queryFn: async (): Promise<FaceData | null> => {
      if (!profile?.preferences?.face) {
        logger.debug('USE_PROFILE_FACE_DATA', 'No face data in profile', {
          userId: profile?.userId,
          hasPreferences: !!profile?.preferences,
          philosophy: 'no_face_data'
        });
        return null;
      }

      const faceData = profile.preferences.face as FaceData;

      logger.info('USE_PROFILE_FACE_DATA', 'Face data loaded from profile', {
        userId: profile?.userId,
        hasFinalFaceParams: !!faceData.final_face_params,
        faceParamsCount: Object.keys(faceData.final_face_params || {}).length,
        hasSkinTone: !!faceData.skin_tone,
        lastScanId: faceData.last_face_scan_id,
        lastUpdate: faceData.updated_at,
        philosophy: 'face_data_loaded'
      });

      return faceData;
    },
    enabled: !!profile?.userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - face data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnMount: 'always', // Always check for fresh data on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus (not needed for face data)
  });

  // Helper function to invalidate the cache (call after a new face scan)
  const invalidateFaceData = () => {
    logger.info('USE_PROFILE_FACE_DATA', 'Invalidating face data cache', {
      userId: profile?.userId,
      philosophy: 'cache_invalidation'
    });
    queryClient.invalidateQueries({ queryKey: ['profile-face-data', profile?.userId] });
  };

  // Helper function to manually update the cache
  const updateFaceDataCache = (newFaceData: FaceData) => {
    logger.info('USE_PROFILE_FACE_DATA', 'Updating face data cache manually', {
      userId: profile?.userId,
      faceParamsCount: Object.keys(newFaceData.final_face_params || {}).length,
      philosophy: 'manual_cache_update'
    });
    queryClient.setQueryData(['profile-face-data', profile?.userId], newFaceData);
  };

  return {
    faceData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidateFaceData,
    updateFaceDataCache,
  };
}
