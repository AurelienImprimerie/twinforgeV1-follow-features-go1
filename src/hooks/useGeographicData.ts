/**
 * useGeographicData Hook
 * Manages geographic, weather, and air quality data for user's location
 */

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../system/store/userStore';
import { getGeographicData } from '../system/services/geographicDataService';
import { getCountryISOCode } from '../system/services/countryCodeMapping';
import type { GeographicData, PhysicalActivityLevel } from '../domain/health';
import logger from '../lib/utils/logger';

interface UseGeographicDataReturn {
  data: GeographicData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

export function useGeographicData(): UseGeographicDataReturn {
  const { profile } = useUserStore();
  const [data, setData] = useState<GeographicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!profile?.userId || !profile?.country) {
      setLoading(false);
      setError(new Error('User profile or country not available'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert country name to ISO code
      const countryCode = getCountryISOCode(profile.country);
      if (!countryCode) {
        throw new Error(`Le pays "${profile.country}" n'est pas encore supporté pour les données météo.`);
      }

      logger.info('USE_GEOGRAPHIC_DATA', 'Fetching geographic data', {
        userId: profile.userId,
        countryName: profile.country,
        countryCode,
      });

      // Extract user data for hydration calculations
      const userWeightKg = (profile as any)?.weight_kg || (profile as any)?.health?.basic?.weight_kg;

      // Try to get activity level from profile
      const activityLevel: PhysicalActivityLevel | undefined =
        (profile as any)?.health?.lifestyle?.physical_activity_level ||
        (profile as any)?.training?.physical_activity_level;

      const geoData = await getGeographicData(
        profile.userId,
        countryCode,
        userWeightKg,
        activityLevel
      );

      setData(geoData);
      setLastUpdated(geoData.last_updated);
      logger.info('USE_GEOGRAPHIC_DATA', 'Geographic data loaded successfully', {
        userId: profile.userId,
        countryName: profile.country,
        countryCode,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch geographic data');
      setError(error);
      logger.error('USE_GEOGRAPHIC_DATA', 'Failed to fetch geographic data', {
        error: error.message,
        userId: profile?.userId,
        countryName: profile?.country,
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.userId, profile?.country]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}
