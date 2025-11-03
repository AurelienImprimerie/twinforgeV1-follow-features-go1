/**
 * useCountryHealthData Hook
 * Manages country health data enrichment and caching
 */

import { useState, useEffect } from 'react';
import { useUserStore } from '../system/store/userStore';
import { countryHealthService } from '../system/services/countryHealthEnrichmentService';
import type { CountryHealthData } from '../domain/health';
import logger from '../lib/utils/logger';

interface UseCountryHealthDataReturn {
  countryData: CountryHealthData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCountryHealthData(): UseCountryHealthDataReturn {
  const { profile } = useUserStore();
  const [countryData, setCountryData] = useState<CountryHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCountryData = async () => {
    if (!profile?.userId) {
      logger.warn('COUNTRY_HEALTH_HOOK', 'No user ID available');
      return;
    }

    if (!profile.country) {
      logger.info('COUNTRY_HEALTH_HOOK', 'No country selected', { userId: profile.userId });
      setCountryData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.info('COUNTRY_HEALTH_HOOK', 'Fetching country health data', {
        userId: profile.userId,
        country: profile.country,
      });

      const data = await countryHealthService.getUserCountryHealthData(profile.userId);

      if (data) {
        setCountryData(data);
        logger.info('COUNTRY_HEALTH_HOOK', 'Country data loaded', {
          country: data.country_name,
          lastUpdated: data.last_updated,
          source: data.data_source,
        });
      } else {
        setCountryData(null);
        logger.info('COUNTRY_HEALTH_HOOK', 'No country data available', {
          country: profile.country,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('COUNTRY_HEALTH_HOOK', 'Failed to fetch country data', {
        error: error.message,
        userId: profile.userId,
        country: profile.country,
      });
      setCountryData(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!profile?.userId || !profile.country) return;

    try {
      setLoading(true);
      setError(null);

      logger.info('COUNTRY_HEALTH_HOOK', 'Refreshing country health data', {
        userId: profile.userId,
        country: profile.country,
      });

      await countryHealthService.updateUserCountryCache(profile.userId, profile.country);

      const data = await countryHealthService.getUserCountryHealthData(profile.userId);
      setCountryData(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('COUNTRY_HEALTH_HOOK', 'Failed to refresh country data', {
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountryData();
  }, [profile?.userId, profile?.country]);

  return {
    countryData,
    loading,
    error,
    refresh,
  };
}
