import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../system/store/userStore';
import { supabase } from '../system/supabase/client';
import logger from '../lib/utils/logger';

interface UseHasConnectedWearableReturn {
  hasConnectedWearable: boolean;
  connectedDevicesCount: number;
  loading: boolean;
  error: Error | null;
}

export function useHasConnectedWearable(): UseHasConnectedWearableReturn {
  const { session } = useUserStore();
  const userId = session?.user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['connected-wearables', userId],
    queryFn: async () => {
      if (!userId) {
        return { hasConnectedWearable: false, connectedDevicesCount: 0 };
      }

      try {
        const { data: devices, error: queryError } = await supabase
          .from('connected_devices')
          .select('id, status, provider')
          .eq('user_id', userId)
          .eq('status', 'connected');

        if (queryError) {
          logger.error('USE_HAS_CONNECTED_WEARABLE', 'Failed to fetch connected devices', {
            error: queryError.message,
            userId,
            timestamp: new Date().toISOString()
          });
          throw queryError;
        }

        const connectedCount = devices?.length || 0;
        const hasConnected = connectedCount > 0;

        logger.info('USE_HAS_CONNECTED_WEARABLE', 'Connected devices checked', {
          hasConnectedWearable: hasConnected,
          connectedDevicesCount: connectedCount,
          userId,
          timestamp: new Date().toISOString()
        });

        return {
          hasConnectedWearable: hasConnected,
          connectedDevicesCount: connectedCount
        };
      } catch (err) {
        logger.error('USE_HAS_CONNECTED_WEARABLE', 'Error checking connected devices', {
          error: err instanceof Error ? err.message : 'Unknown error',
          userId,
          timestamp: new Date().toISOString()
        });
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2
  });

  return {
    hasConnectedWearable: data?.hasConnectedWearable || false,
    connectedDevicesCount: data?.connectedDevicesCount || 0,
    loading: isLoading,
    error: error as Error | null
  };
}
