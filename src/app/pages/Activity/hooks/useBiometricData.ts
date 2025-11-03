/**
 * Hook pour gérer les données biométriques avec gestion d'erreur améliorée
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../system/supabase/client';
import { useUserStore } from '../../../../system/store/userStore';
import logger from '../../../../lib/utils/logger';

interface BiometricDataStats {
  hasEnrichedActivities: boolean;
  enrichedCount: number;
  totalCount: number;
  enrichmentRate: number;
  latestEnrichedActivity: any | null;
}

/**
 * Hook pour vérifier la disponibilité des données biométriques
 */
export function useBiometricDataAvailability(period: 'week' | 'month' | 'quarter' = 'week') {
  const { session } = useUserStore();

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  return useQuery({
    queryKey: ['biometric-availability', session?.user?.id, period],
    queryFn: async (): Promise<BiometricDataStats> => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const since = new Date();
      since.setDate(since.getDate() - periodDays);

      logger.info('BIOMETRIC_AVAILABILITY', 'Checking biometric data availability', {
        userId: session.user.id,
        period,
        since: since.toISOString(),
        timestamp: new Date().toISOString(),
      });

      // Récupérer toutes les activités de la période
      const { data: allActivities, error: allError } = await supabase
        .from('activities')
        .select('id, type, timestamp, wearable_device_id, hr_avg')
        .eq('user_id', session.user.id)
        .gte('timestamp', since.toISOString())
        .order('timestamp', { ascending: false });

      if (allError) {
        logger.error('BIOMETRIC_AVAILABILITY', 'Failed to fetch all activities', {
          error: allError.message,
          userId: session.user.id,
        });
        throw allError;
      }

      const totalCount = allActivities?.length || 0;

      // Récupérer les activités enrichies (avec données biométriques)
      const { data: enrichedActivities, error: enrichedError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('timestamp', since.toISOString())
        .not('wearable_device_id', 'is', null)
        .order('timestamp', { ascending: false });

      if (enrichedError) {
        logger.error('BIOMETRIC_AVAILABILITY', 'Failed to fetch enriched activities', {
          error: enrichedError.message,
          userId: session.user.id,
        });
        throw enrichedError;
      }

      const enrichedCount = enrichedActivities?.length || 0;
      const hasEnrichedActivities = enrichedCount > 0;
      const enrichmentRate = totalCount > 0 ? (enrichedCount / totalCount) * 100 : 0;
      const latestEnrichedActivity = enrichedActivities?.[0] || null;

      const stats: BiometricDataStats = {
        hasEnrichedActivities,
        enrichedCount,
        totalCount,
        enrichmentRate,
        latestEnrichedActivity,
      };

      logger.info('BIOMETRIC_AVAILABILITY', 'Biometric data availability check completed', {
        userId: session.user.id,
        period,
        ...stats,
        timestamp: new Date().toISOString(),
      });

      return stats;
    },
    enabled: !!session?.user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
