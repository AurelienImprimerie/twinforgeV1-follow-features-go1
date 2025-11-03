import React, { useEffect } from 'react';
import { wearableAutoSyncService } from '../system/services/wearableAutoSyncService';
import { useToast } from '../ui/components/ToastProvider';
import logger from '../lib/utils/logger';

interface UseAutoSyncOptions {
  enabled?: boolean;
  intervalMinutes?: number;
}

export function useAutoSync(userId: string | null, options: UseAutoSyncOptions = {}) {
  const { enabled = true, intervalMinutes = 60 } = options;
  const { showToast } = useToast();
  const showToastRef = React.useRef(showToast);

  React.useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    if (!userId || !enabled) {
      logger.info('AUTO_SYNC_HOOK', 'Auto sync not enabled', { userId, enabled });
      return;
    }

    logger.info('AUTO_SYNC_HOOK', 'Initializing auto sync', { userId, intervalMinutes });

    wearableAutoSyncService.startAutoSync(userId, intervalMinutes);

    const handleSync = async () => {
      try {
        const results = await wearableAutoSyncService.performAutoSync(userId);
        const successfulSyncs = results.filter((r) => r.success);
        const totalActivities = successfulSyncs.reduce(
          (sum, r) => sum + r.activitiesImported,
          0
        );

        if (totalActivities > 0) {
          showToastRef.current({
            type: 'success',
            title: 'Synchronisation réussie',
            message: `${totalActivities} nouvelle${totalActivities > 1 ? 's' : ''} activité${totalActivities > 1 ? 's' : ''} importée${totalActivities > 1 ? 's' : ''}`,
            duration: 5000,
          });

          logger.info('AUTO_SYNC_HOOK', 'Auto sync completed with new activities', {
            userId,
            totalActivities,
            devicesCount: successfulSyncs.length,
          });
        }
      } catch (error) {
        logger.error('AUTO_SYNC_HOOK', 'Auto sync failed', { error, userId });
      }
    };

    const syncCheckInterval = setInterval(handleSync, intervalMinutes * 60 * 1000);

    return () => {
      wearableAutoSyncService.stopAutoSync();
      clearInterval(syncCheckInterval);
      logger.info('AUTO_SYNC_HOOK', 'Auto sync stopped', { userId });
    };
  }, [userId, enabled, intervalMinutes]);
}
