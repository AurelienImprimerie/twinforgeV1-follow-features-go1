import { supabase } from '../supabase/client';
import { wearableDataService } from './wearableDataService';
import logger from '../../lib/utils/logger';

export interface SyncResult {
  success: boolean;
  deviceId: string;
  activitiesImported: number;
  lastSyncTime: string;
  error?: string;
}

class WearableAutoSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private syncInProgress = new Set<string>();

  async performAutoSync(userId: string): Promise<SyncResult[]> {
    try {
      logger.info('WEARABLE_AUTO_SYNC', 'Starting automatic sync', { userId });

      const devices = await wearableDataService.getConnectedDevices(userId);
      const activeDevices = devices.filter((d) => d.connected && !d.revoked);

      if (activeDevices.length === 0) {
        logger.info('WEARABLE_AUTO_SYNC', 'No active devices to sync', { userId });
        return [];
      }

      const results: SyncResult[] = [];

      for (const device of activeDevices) {
        if (this.syncInProgress.has(device.id)) {
          logger.info('WEARABLE_AUTO_SYNC', 'Sync already in progress for device', {
            deviceId: device.id,
          });
          continue;
        }

        try {
          this.syncInProgress.add(device.id);

          const lastSync = device.last_sync ? new Date(device.last_sync) : null;
          const now = new Date();

          const hoursSinceSync = lastSync
            ? (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
            : Infinity;

          if (hoursSinceSync < 1) {
            logger.info('WEARABLE_AUTO_SYNC', 'Device synced recently, skipping', {
              deviceId: device.id,
              hoursSinceSync,
            });
            this.syncInProgress.delete(device.id);
            continue;
          }

          logger.info('WEARABLE_AUTO_SYNC', 'Triggering sync for device', {
            deviceId: device.id,
            provider: device.provider,
            hoursSinceSync,
          });

          await wearableDataService.triggerSync(device.id);

          const { data: newActivities, error: activitiesError } = await supabase
            .from('activities')
            .select('id')
            .eq('user_id', userId)
            .eq('wearable_device_id', device.id)
            .gte('created_at', lastSync?.toISOString() || new Date(0).toISOString());

          if (activitiesError) throw activitiesError;

          results.push({
            success: true,
            deviceId: device.id,
            activitiesImported: newActivities?.length || 0,
            lastSyncTime: now.toISOString(),
          });

          logger.info('WEARABLE_AUTO_SYNC', 'Sync completed successfully', {
            deviceId: device.id,
            activitiesImported: newActivities?.length || 0,
          });
        } catch (error) {
          logger.error('WEARABLE_AUTO_SYNC', 'Sync failed for device', {
            deviceId: device.id,
            error,
          });

          results.push({
            success: false,
            deviceId: device.id,
            activitiesImported: 0,
            lastSyncTime: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } finally {
          this.syncInProgress.delete(device.id);
        }
      }

      return results;
    } catch (error) {
      logger.error('WEARABLE_AUTO_SYNC', 'Auto sync failed', { error, userId });
      throw error;
    }
  }

  startAutoSync(userId: string, intervalMinutes: number = 60): void {
    if (this.syncInterval) {
      logger.warn('WEARABLE_AUTO_SYNC', 'Auto sync already running, clearing previous interval');
      this.stopAutoSync();
    }

    logger.info('WEARABLE_AUTO_SYNC', 'Starting auto sync scheduler', {
      userId,
      intervalMinutes,
    });

    this.performAutoSync(userId).catch((error) => {
      logger.error('WEARABLE_AUTO_SYNC', 'Initial auto sync failed', { error });
    });

    this.syncInterval = setInterval(() => {
      this.performAutoSync(userId).catch((error) => {
        logger.error('WEARABLE_AUTO_SYNC', 'Scheduled auto sync failed', { error });
      });
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('WEARABLE_AUTO_SYNC', 'Auto sync scheduler stopped');
    }
  }

  async checkForNewActivities(userId: string, deviceId: string): Promise<number> {
    try {
      const device = await wearableDataService.getConnectedDevices(userId);
      const targetDevice = device.find((d) => d.id === deviceId);

      if (!targetDevice) {
        throw new Error('Device not found');
      }

      const lastSync = targetDevice.last_sync ? new Date(targetDevice.last_sync) : new Date(0);

      const { data: activities, error } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', userId)
        .eq('wearable_device_id', deviceId)
        .gte('timestamp', lastSync.toISOString());

      if (error) throw error;

      return activities?.length || 0;
    } catch (error) {
      logger.error('WEARABLE_AUTO_SYNC', 'Failed to check for new activities', {
        error,
        userId,
        deviceId,
      });
      throw error;
    }
  }

  async intelligentDataFusion(
    userId: string,
    manualActivityId: string,
    wearableActivityId: string
  ): Promise<void> {
    try {
      logger.info('WEARABLE_AUTO_SYNC', 'Starting intelligent data fusion', {
        userId,
        manualActivityId,
        wearableActivityId,
      });

      const { data: manualActivity, error: manualError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', manualActivityId)
        .maybeSingle();

      const { data: wearableActivity, error: wearableError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', wearableActivityId)
        .maybeSingle();

      if (manualError || wearableError) {
        throw manualError || wearableError;
      }

      if (!manualActivity || !wearableActivity) {
        throw new Error('Activity not found');
      }

      const fusedData: Record<string, any> = {
        ...manualActivity,
      };

      const wearableFields = [
        'hr_avg',
        'hr_max',
        'hr_min',
        'hr_zone1_minutes',
        'hr_zone2_minutes',
        'hr_zone3_minutes',
        'hr_zone4_minutes',
        'hr_zone5_minutes',
        'hrv_avg',
        'hrv_rmssd',
        'vo2max_est',
        'distance_km',
        'pace_avg',
        'speed_avg',
        'elevation_gain',
        'cadence_avg',
        'power_avg',
        'calories_measured',
        'recovery_score',
        'training_effect',
        'trimp_score',
      ];

      wearableFields.forEach((field) => {
        if (wearableActivity[field] !== null && wearableActivity[field] !== undefined) {
          fusedData[field] = wearableActivity[field];
        }
      });

      const { error: updateError } = await supabase
        .from('activities')
        .update(fusedData)
        .eq('id', manualActivityId);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('id', wearableActivityId);

      if (deleteError) throw deleteError;

      logger.info('WEARABLE_AUTO_SYNC', 'Data fusion completed successfully', {
        manualActivityId,
        wearableActivityId,
        fusedFields: wearableFields.filter((f) => fusedData[f] !== null).length,
      });
    } catch (error) {
      logger.error('WEARABLE_AUTO_SYNC', 'Data fusion failed', {
        error,
        userId,
        manualActivityId,
        wearableActivityId,
      });
      throw error;
    }
  }
}

export const wearableAutoSyncService = new WearableAutoSyncService();
