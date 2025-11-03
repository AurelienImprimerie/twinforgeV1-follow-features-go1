/**
 * Country Health Data Hook
 * Fetches and caches country health data based on user location
 */

import React from 'react';
import { supabase } from '../../../../system/supabase/client';
import logger from '../../../../lib/utils/logger';
import type { CountryHealthData } from '../../../../domain/health';

export function useCountryHealthData(countryCode?: string): CountryHealthData | null {
  const [countryData, setCountryData] = React.useState<CountryHealthData | null>(null);

  React.useEffect(() => {
    if (!countryCode) {
      setCountryData(null);
      return;
    }

    const fetchCountryData = async () => {
      try {
        logger.info('COUNTRY_HEALTH', 'Fetching country health data', { countryCode });

        const { data, error } = await supabase
          .from('country_health_data')
          .select('*')
          .eq('country_code', countryCode)
          .maybeSingle();

        if (error) {
          logger.error('COUNTRY_HEALTH', 'Failed to fetch country health data', {
            error: error.message,
            countryCode,
          });
          return;
        }

        if (data) {
          setCountryData(data as CountryHealthData);
          logger.info('COUNTRY_HEALTH', 'Country health data loaded', {
            countryCode,
            countryName: data.country_name,
          });
        }
      } catch (error) {
        logger.error('COUNTRY_HEALTH', 'Error fetching country health data', {
          error: error instanceof Error ? error.message : 'Unknown error',
          countryCode,
        });
      }
    };

    fetchCountryData();
  }, [countryCode]);

  return countryData;
}
