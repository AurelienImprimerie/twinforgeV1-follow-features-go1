/**
 * useAvatarData Hook
 * Fetches real body scan data and face scan data from Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../../system/supabase/client';
import { useUserStore } from '../../../../system/store/userStore';
import logger from '../../../../lib/utils/logger';

export interface BodyScanData {
  id: string;
  created_at: string;
  timestamp?: string;
  user_id: string;
  // Morphological data (correct column names from body_scans table)
  morph_values?: Record<string, number> | null;
  limb_masses?: Record<string, number> | null;
  skin_tone?: any;
  skin_tone_map_v2?: any;
  resolved_gender?: string | null;
  // Body metrics
  weight?: number | null;
  body_fat_percentage?: number | null;
  bmi?: number | null;
  waist_circumference?: number | null;
  raw_measurements?: Record<string, any> | null;
  // Version info
  avatar_version?: string | null;
  gltf_model_id?: string | null;
  material_config_version?: string | null;
  mapping_version?: string | null;
  // Legacy/fallback field
  metrics?: any;
}

export interface FaceScanData {
  id: string;
  created_at: string;
  photo_url: string | null;
  final_face_params: Record<string, number> | null;
  skin_tone_v2: {
    hex?: string;
    multi_zone_map?: Record<string, string>;
  } | null;
}

export interface AvatarData {
  hasBodyScan: boolean;
  hasFaceScan: boolean;
  latestBodyScan: BodyScanData | null;
  latestFaceScan: FaceScanData | null;
  bodyScanCount: number;
  faceScanCount: number;
  lastScanDate: Date | null;
  completionPercentage: number;
}

export function useAvatarData() {
  const { user } = useUserStore();
  const [data, setData] = useState<AvatarData>({
    hasBodyScan: false,
    hasFaceScan: false,
    latestBodyScan: null,
    latestFaceScan: null,
    bodyScanCount: 0,
    faceScanCount: 0,
    lastScanDate: null,
    completionPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function fetchAvatarData() {
      try {
        setLoading(true);
        setError(null);

        logger.info('AVATAR_DATA', 'Fetching latest body scan', {
          userId: user.id,
          philosophy: 'avatar_data_fetch_start'
        });

        // Fetch latest body scan - use SELECT * to get all columns
        const { data: bodyScansRaw, error: bodyScanError } = await supabase
          .from('body_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (bodyScanError) {
          logger.error('AVATAR_DATA', 'Error fetching body scan', {
            userId: user.id,
            error: bodyScanError.message,
            philosophy: 'body_scan_fetch_error'
          });
          throw bodyScanError;
        }

        // Face scans are no longer used - removed

        // Count total body scans
        const { count: bodyCount, error: bodyCountError } = await supabase
          .from('body_scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (bodyCountError) throw bodyCountError;

        // Extract and enrich body scan data with fallback logic (similar to useBodyScanData.ts)
        let latestBodyScan: BodyScanData | null = null;

        if (bodyScansRaw && bodyScansRaw.length > 0) {
          const rawScan = bodyScansRaw[0];
          const metrics = rawScan.metrics || {};

          // Priority: direct columns > metrics JSONB > empty object
          const morphValues = rawScan.morph_values ||
                             rawScan.morph3d ||
                             metrics.final_shape_params ||
                             null;

          const limbMasses = rawScan.limb_masses ||
                            metrics.final_limb_masses ||
                            null;

          const skinTone = rawScan.skin_tone_map_v2 ||
                          metrics.skin_tone ||
                          rawScan.skin_tone ||
                          null;

          const resolvedGender = rawScan.resolved_gender ||
                                metrics.resolved_gender ||
                                null;

          // Extract metrics with fallback logic
          const extractedData = metrics.estimate_result?.extracted_data || {};
          const rawMeasurements = rawScan.raw_measurements ||
                                 extractedData.raw_measurements ||
                                 {};

          const weight = rawScan.weight ||
                        rawMeasurements.weight_kg ||
                        extractedData.weight_kg ||
                        null;

          const bodyFatPercentage = rawScan.body_fat_percentage ||
                                   extractedData.estimated_body_fat_perc ||
                                   null;

          const bmi = rawScan.bmi ||
                     extractedData.estimated_bmi ||
                     null;

          const waistCircumference = rawScan.waist_circumference ||
                                    rawMeasurements.waist_cm ||
                                    null;

          latestBodyScan = {
            id: rawScan.id,
            created_at: rawScan.created_at,
            timestamp: rawScan.timestamp,
            user_id: rawScan.user_id,
            morph_values: morphValues,
            limb_masses: limbMasses,
            skin_tone: skinTone,
            skin_tone_map_v2: rawScan.skin_tone_map_v2,
            resolved_gender: resolvedGender,
            weight,
            body_fat_percentage: bodyFatPercentage,
            bmi,
            waist_circumference: waistCircumference,
            raw_measurements: rawMeasurements,
            avatar_version: rawScan.avatar_version || metrics.avatar_version || null,
            gltf_model_id: rawScan.gltf_model_id || metrics.gltf_model_id || null,
            material_config_version: rawScan.material_config_version || null,
            mapping_version: rawScan.mapping_version || null,
            metrics: rawScan.metrics
          };

          logger.info('AVATAR_DATA', 'Body scan data extracted and enriched', {
            userId: user.id,
            scanId: rawScan.id,
            hasMorphValues: !!morphValues && Object.keys(morphValues).length > 0,
            morphValuesCount: morphValues ? Object.keys(morphValues).length : 0,
            morphValuesSource: rawScan.morph_values ? 'direct_column' : (metrics.final_shape_params ? 'metrics_jsonb' : 'none'),
            hasLimbMasses: !!limbMasses && Object.keys(limbMasses).length > 0,
            limbMassesCount: limbMasses ? Object.keys(limbMasses).length : 0,
            limbMassesSource: rawScan.limb_masses ? 'direct_column' : (metrics.final_limb_masses ? 'metrics_jsonb' : 'none'),
            hasSkinTone: !!skinTone,
            skinToneSource: rawScan.skin_tone_map_v2 ? 'v2_direct_column' : (metrics.skin_tone ? 'metrics_jsonb' : (rawScan.skin_tone ? 'legacy_column' : 'none')),
            hasResolvedGender: !!resolvedGender,
            resolvedGenderValue: resolvedGender,
            hasWeight: !!weight,
            weight,
            hasBMI: !!bmi,
            bmi,
            avatarVersion: latestBodyScan.avatar_version,
            philosophy: 'body_scan_enriched'
          });
        }

        // Determine last scan date
        const lastScanDate: Date | null = latestBodyScan
          ? new Date(latestBodyScan.created_at)
          : null;

        // Calculate completion percentage (only body scan required)
        const completion = latestBodyScan ? 100 : 0;

        setData({
          hasBodyScan: !!latestBodyScan,
          hasFaceScan: false,
          latestBodyScan,
          latestFaceScan: null,
          bodyScanCount: bodyCount || 0,
          faceScanCount: 0,
          lastScanDate,
          completionPercentage: completion,
        });

        logger.info('AVATAR_DATA', 'Avatar data fetch completed successfully', {
          userId: user.id,
          hasBodyScan: !!latestBodyScan,
          bodyScanCount: bodyCount,
          completionPercentage: completion,
          philosophy: 'avatar_data_fetch_complete'
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch avatar data');
        setError(error);
        logger.error('AVATAR_DATA', 'Error fetching avatar data', {
          userId: user?.id,
          error: error.message,
          errorStack: error.stack,
          philosophy: 'avatar_data_fetch_error'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAvatarData();
  }, [user?.id]);

  const refresh = () => {
    if (user?.id) {
      setLoading(true);
      setError(null);
      // Trigger re-fetch by clearing and re-setting
      setData({
        hasBodyScan: false,
        hasFaceScan: false,
        latestBodyScan: null,
        latestFaceScan: null,
        bodyScanCount: 0,
        faceScanCount: 0,
        lastScanDate: null,
        completionPercentage: 0,
      });
    }
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}
