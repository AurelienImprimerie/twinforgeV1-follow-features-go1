import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/system/supabase/client';
import { useEffect } from 'react';
import logger from '@/lib/utils/logger';

export interface WeeklyActionsAvailability {
  bodyScanAvailable: boolean;
  weightUpdateAvailable: boolean;
  daysUntilBodyScan: number;
  daysUntilWeightUpdate: number;
  lastBodyScanDate: string | null;
  lastWeightUpdateDate: string | null;
}

/**
 * Hook to check availability of weekly actions (body scan and weight update)
 * Uses React Query for caching and automatic refetching
 * Subscribes to realtime updates on body_scans and weight_updates_history tables
 */
export function useWeeklyActions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['weekly-actions-availability'],
    queryFn: async (): Promise<WeeklyActionsAvailability> => {
      logger.info('USE_WEEKLY_ACTIONS', 'Fetching weekly actions availability', {
        philosophy: 'weekly_actions_check'
      });

      const { data, error } = await supabase.rpc('check_weekly_actions_availability');

      if (error) {
        logger.error('USE_WEEKLY_ACTIONS', 'Error fetching weekly actions availability', {
          error: error.message,
          philosophy: 'weekly_actions_error'
        });
        throw error;
      }

      if (!data || data.length === 0) {
        logger.warn('USE_WEEKLY_ACTIONS', 'No availability data returned', {
          philosophy: 'no_availability_data'
        });

        // Return default values if no data
        return {
          bodyScanAvailable: true, // Available by default if never done
          weightUpdateAvailable: false, // Not available until first weight logged
          daysUntilBodyScan: 0,
          daysUntilWeightUpdate: 7,
          lastBodyScanDate: null,
          lastWeightUpdateDate: null
        };
      }

      const result = data[0];

      logger.info('USE_WEEKLY_ACTIONS', 'Weekly actions availability retrieved', {
        bodyScanAvailable: result.body_scan_available,
        weightUpdateAvailable: result.weight_update_available,
        daysUntilBodyScan: result.days_until_body_scan,
        daysUntilWeightUpdate: result.days_until_weight_update,
        lastBodyScanDate: result.last_body_scan_date,
        lastWeightUpdateDate: result.last_weight_update_date,
        philosophy: 'weekly_actions_loaded'
      });

      return {
        bodyScanAvailable: result.body_scan_available,
        weightUpdateAvailable: result.weight_update_available,
        daysUntilBodyScan: result.days_until_body_scan,
        daysUntilWeightUpdate: result.days_until_weight_update,
        lastBodyScanDate: result.last_body_scan_date,
        lastWeightUpdateDate: result.last_weight_update_date
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute - check frequently for real-time updates
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
    refetchOnMount: 'always', // Always check on mount
    refetchOnWindowFocus: true, // Check when window regains focus
  });

  // Subscribe to realtime updates for body_scans
  useEffect(() => {
    logger.info('USE_WEEKLY_ACTIONS', 'Setting up realtime subscription for body_scans', {
      philosophy: 'realtime_setup'
    });

    const bodyScanChannel = supabase
      .channel('weekly-actions-body-scans')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'body_scans',
        },
        (payload) => {
          logger.info('USE_WEEKLY_ACTIONS', 'Body scan inserted, invalidating cache', {
            userId: payload.new?.user_id,
            philosophy: 'realtime_body_scan_update'
          });
          queryClient.invalidateQueries({ queryKey: ['weekly-actions-availability'] });
        }
      )
      .subscribe();

    return () => {
      logger.info('USE_WEEKLY_ACTIONS', 'Cleaning up body_scans subscription', {
        philosophy: 'realtime_cleanup'
      });
      supabase.removeChannel(bodyScanChannel);
    };
  }, [queryClient]);

  // Subscribe to realtime updates for weight_updates_history
  useEffect(() => {
    logger.info('USE_WEEKLY_ACTIONS', 'Setting up realtime subscription for weight_updates_history', {
      philosophy: 'realtime_setup'
    });

    const weightUpdateChannel = supabase
      .channel('weekly-actions-weight-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weight_updates_history',
        },
        (payload) => {
          logger.info('USE_WEEKLY_ACTIONS', 'Weight update inserted, invalidating cache', {
            userId: payload.new?.user_id,
            philosophy: 'realtime_weight_update_update'
          });
          queryClient.invalidateQueries({ queryKey: ['weekly-actions-availability'] });
        }
      )
      .subscribe();

    return () => {
      logger.info('USE_WEEKLY_ACTIONS', 'Cleaning up weight_updates_history subscription', {
        philosophy: 'realtime_cleanup'
      });
      supabase.removeChannel(weightUpdateChannel);
    };
  }, [queryClient]);

  return {
    availability: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Helper hook to check if body scan is available
 */
export function useIsBodyScanAvailable() {
  const { availability } = useWeeklyActions();
  return availability?.bodyScanAvailable ?? true; // Default to available
}

/**
 * Helper hook to check if weight update is available
 */
export function useIsWeightUpdateAvailable() {
  const { availability } = useWeeklyActions();
  return availability?.weightUpdateAvailable ?? false; // Default to not available
}

/**
 * Helper hook to get days until next body scan availability
 */
export function useDaysUntilBodyScan() {
  const { availability } = useWeeklyActions();
  return availability?.daysUntilBodyScan ?? 0;
}

/**
 * Helper hook to get days until next weight update availability
 */
export function useDaysUntilWeightUpdate() {
  const { availability } = useWeeklyActions();
  return availability?.daysUntilWeightUpdate ?? 7;
}
