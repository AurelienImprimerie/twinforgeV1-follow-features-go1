/**
 * useWearableSync Hook
 * Manages wearable device synchronization with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { wearableDataService } from '../system/services/wearableDataService';
import type {
  ConnectedDevice,
  DeviceSyncHistory,
  SyncPreferences,
  HealthDataType,
} from '../domain/connectedDevices';
import logger from '../lib/utils/logger';

export interface UseWearableSyncReturn {
  devices: ConnectedDevice[];
  loading: boolean;
  syncing: boolean;
  error: Error | null;
  refreshDevices: () => Promise<void>;
  syncDevice: (deviceId: string, dataTypes?: HealthDataType[]) => Promise<void>;
  disconnectDevice: (deviceId: string) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  getSyncHistory: (deviceId: string) => Promise<DeviceSyncHistory[]>;
  getSyncPreferences: (deviceId: string) => Promise<SyncPreferences | null>;
  updateSyncPreferences: (deviceId: string, prefs: Partial<SyncPreferences>) => Promise<void>;
}

export function useWearableSync(userId: string | null): UseWearableSyncReturn {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshDevices = useCallback(async () => {
    if (!userId) {
      setDevices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedDevices = await wearableDataService.getConnectedDevices(userId);
      setDevices(fetchedDevices);
      logger.info('WEARABLE_HOOK', 'Devices refreshed', { count: fetchedDevices.length });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch devices');
      setError(error);
      logger.error('WEARABLE_HOOK', 'Failed to refresh devices', { error: err });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const syncDevice = useCallback(
    async (deviceId: string, dataTypes?: HealthDataType[]) => {
      try {
        setSyncing(true);
        setError(null);
        logger.info('WEARABLE_HOOK', 'Starting sync', { deviceId, dataTypes });

        await wearableDataService.triggerSync(deviceId, dataTypes);

        await refreshDevices();

        logger.info('WEARABLE_HOOK', 'Sync completed successfully', { deviceId });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sync failed');
        setError(error);
        logger.error('WEARABLE_HOOK', 'Sync failed', { error: err, deviceId });
        throw error;
      } finally {
        setSyncing(false);
      }
    },
    [refreshDevices]
  );

  const disconnectDevice = useCallback(
    async (deviceId: string) => {
      try {
        setError(null);
        logger.info('WEARABLE_HOOK', 'Disconnecting device', { deviceId });

        await wearableDataService.disconnectDevice(deviceId);
        await refreshDevices();

        logger.info('WEARABLE_HOOK', 'Device disconnected', { deviceId });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to disconnect device');
        setError(error);
        logger.error('WEARABLE_HOOK', 'Failed to disconnect device', { error: err, deviceId });
        throw error;
      }
    },
    [refreshDevices]
  );

  const deleteDevice = useCallback(
    async (deviceId: string) => {
      try {
        setError(null);
        logger.info('WEARABLE_HOOK', 'Deleting device', { deviceId });

        await wearableDataService.deleteDevice(deviceId);
        await refreshDevices();

        logger.info('WEARABLE_HOOK', 'Device deleted', { deviceId });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete device');
        setError(error);
        logger.error('WEARABLE_HOOK', 'Failed to delete device', { error: err, deviceId });
        throw error;
      }
    },
    [refreshDevices]
  );

  const getSyncHistory = useCallback(async (deviceId: string) => {
    try {
      logger.info('WEARABLE_HOOK', 'Fetching sync history', { deviceId });
      const history = await wearableDataService.getSyncHistory(deviceId);
      return history;
    } catch (err) {
      logger.error('WEARABLE_HOOK', 'Failed to fetch sync history', { error: err, deviceId });
      throw err;
    }
  }, []);

  const getSyncPreferences = useCallback(async (deviceId: string) => {
    try {
      logger.info('WEARABLE_HOOK', 'Fetching sync preferences', { deviceId });
      const prefs = await wearableDataService.getSyncPreferences(deviceId);
      return prefs;
    } catch (err) {
      logger.error('WEARABLE_HOOK', 'Failed to fetch sync preferences', {
        error: err,
        deviceId,
      });
      throw err;
    }
  }, []);

  const updateSyncPreferences = useCallback(
    async (deviceId: string, prefs: Partial<SyncPreferences>) => {
      try {
        logger.info('WEARABLE_HOOK', 'Updating sync preferences', { deviceId, prefs });
        await wearableDataService.updateSyncPreferences(deviceId, prefs);
        await refreshDevices();
      } catch (err) {
        logger.error('WEARABLE_HOOK', 'Failed to update sync preferences', {
          error: err,
          deviceId,
        });
        throw err;
      }
    },
    [refreshDevices]
  );

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return {
    devices,
    loading,
    syncing,
    error,
    refreshDevices,
    syncDevice,
    disconnectDevice,
    deleteDevice,
    getSyncHistory,
    getSyncPreferences,
    updateSyncPreferences,
  };
}
