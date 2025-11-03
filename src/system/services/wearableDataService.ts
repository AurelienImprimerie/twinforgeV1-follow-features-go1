/**
 * Wearable Data Service
 * Handles fetching, normalizing, and managing wearable device data
 */

import { supabase } from '../supabase/client';
import type {
  ConnectedDevice,
  DeviceSyncHistory,
  WearableHealthData,
  SyncPreferences,
  Provider,
  HealthDataType,
  NormalizedWorkout,
} from '../../domain/connectedDevices';
import logger from '../../lib/utils/logger';

export class WearableDataService {
  async getConnectedDevices(userId: string): Promise<ConnectedDevice[]> {
    const { data, error } = await supabase
      .from('connected_devices')
      .select('*')
      .eq('user_id', userId)
      .order('connected_at', { ascending: false });

    if (error) {
      logger.error('WEARABLE', 'Failed to fetch connected devices', { error });
      throw error;
    }

    return data.map(this.mapDevice);
  }

  async getDevice(deviceId: string): Promise<ConnectedDevice | null> {
    const { data, error } = await supabase
      .from('connected_devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (error) {
      logger.error('WEARABLE', 'Failed to fetch device', { error, deviceId });
      return null;
    }

    return this.mapDevice(data);
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    const { error } = await supabase
      .from('connected_devices')
      .update({ status: 'disconnected' })
      .eq('id', deviceId);

    if (error) {
      logger.error('WEARABLE', 'Failed to disconnect device', { error, deviceId });
      throw error;
    }

    logger.info('WEARABLE', 'Device disconnected successfully', { deviceId });
  }

  async deleteDevice(deviceId: string): Promise<void> {
    const { error } = await supabase.from('connected_devices').delete().eq('id', deviceId);

    if (error) {
      logger.error('WEARABLE', 'Failed to delete device', { error, deviceId });
      throw error;
    }

    logger.info('WEARABLE', 'Device deleted successfully', { deviceId });
  }

  async getSyncHistory(
    deviceId: string,
    limit = 20
  ): Promise<DeviceSyncHistory[]> {
    const { data, error } = await supabase
      .from('device_sync_history')
      .select('*')
      .eq('device_id', deviceId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('WEARABLE', 'Failed to fetch sync history', { error, deviceId });
      throw error;
    }

    return data.map(this.mapSyncHistory);
  }

  async triggerSync(deviceId: string, dataTypes?: HealthDataType[]): Promise<void> {
    const startTime = Date.now();

    logger.info('WEARABLE_SYNC', 'Starting sync request', {
      deviceId,
      dataTypes,
      timestamp: new Date().toISOString(),
    });

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      logger.error('WEARABLE_SYNC', 'Sync failed: Not authenticated', { deviceId });
      throw new Error('Not authenticated');
    }

    logger.debug('WEARABLE_SYNC', 'Session verified', {
      deviceId,
      userId: session.session.user.id,
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wearable-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            deviceId,
            dataTypes,
          }),
        }
      );

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText };
        }

        logger.error('WEARABLE_SYNC', 'Sync failed with HTTP error', {
          deviceId,
          status: response.status,
          statusText: response.statusText,
          error,
          duration,
        });

        throw new Error(error.error || 'Sync failed');
      }

      const result = await response.json();

      logger.info('WEARABLE_SYNC', 'Sync completed successfully', {
        deviceId,
        dataTypes,
        duration,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('WEARABLE_SYNC', 'Sync request failed', {
        deviceId,
        dataTypes,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  }

  async getHealthData(
    userId: string,
    dataType: HealthDataType,
    startDate?: Date,
    endDate?: Date
  ): Promise<WearableHealthData[]> {
    let query = supabase
      .from('wearable_health_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', dataType)
      .order('timestamp', { ascending: false });

    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }

    const { data, error } = await query.limit(1000);

    if (error) {
      logger.error('WEARABLE', 'Failed to fetch health data', { error, dataType });
      throw error;
    }

    return data.map(this.mapHealthData);
  }

  async getSyncPreferences(deviceId: string): Promise<SyncPreferences | null> {
    const { data, error } = await supabase
      .from('sync_preferences')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (error) {
      logger.error('WEARABLE', 'Failed to fetch sync preferences', { error, deviceId });
      return null;
    }

    return this.mapSyncPreferences(data);
  }

  async updateSyncPreferences(
    deviceId: string,
    preferences: Partial<SyncPreferences>
  ): Promise<void> {
    const { error } = await supabase
      .from('sync_preferences')
      .update({
        auto_sync_enabled: preferences.autoSyncEnabled,
        sync_frequency_minutes: preferences.syncFrequencyMinutes,
        data_types_enabled: preferences.dataTypesEnabled,
        sync_only_wifi: preferences.syncOnlyWifi,
        notify_on_sync: preferences.notifyOnSync,
        notify_on_error: preferences.notifyOnError,
        backfill_days: preferences.backfillDays,
      })
      .eq('device_id', deviceId);

    if (error) {
      logger.error('WEARABLE', 'Failed to update sync preferences', { error, deviceId });
      throw error;
    }

    logger.info('WEARABLE', 'Sync preferences updated', { deviceId });
  }

  async getLatestWorkouts(userId: string, limit = 10): Promise<NormalizedWorkout[]> {
    const { data, error } = await supabase
      .from('wearable_health_data')
      .select('*')
      .eq('user_id', userId)
      .eq('data_type', 'workout')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('WEARABLE', 'Failed to fetch workouts', { error });
      return [];
    }

    return data
      .map((item) => this.normalizeWorkout(item))
      .filter((w): w is NormalizedWorkout => w !== null);
  }

  async getAggregatedData(
    userId: string,
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date
  ): Promise<{ date: string; value: number }[]> {
    const data = await this.getHealthData(userId, dataType, startDate, endDate);

    const aggregated = new Map<string, number[]>();

    for (const item of data) {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      const value = item.valueNumeric || 0;

      if (!aggregated.has(date)) {
        aggregated.set(date, []);
      }
      aggregated.get(date)!.push(value);
    }

    return Array.from(aggregated.entries())
      .map(([date, values]) => ({
        date,
        value: values.reduce((sum, v) => sum + v, 0) / values.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private mapDevice(data: any): ConnectedDevice {
    return {
      id: data.id,
      userId: data.user_id,
      provider: data.provider,
      providerUserId: data.provider_user_id,
      displayName: data.display_name,
      deviceType: data.device_type,
      status: data.status,
      scopes: data.scopes || [],
      lastSyncAt: data.last_sync_at,
      lastError: data.last_error,
      errorCount: data.error_count || 0,
      metadata: data.metadata || {},
      connectedAt: data.connected_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSyncHistory(data: any): DeviceSyncHistory {
    return {
      id: data.id,
      deviceId: data.device_id,
      userId: data.user_id,
      syncType: data.sync_type,
      status: data.status,
      dataTypesSynced: data.data_types_synced || [],
      recordsFetched: data.records_fetched || 0,
      recordsStored: data.records_stored || 0,
      durationMs: data.duration_ms,
      errorMessage: data.error_message,
      errorCode: data.error_code,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
    };
  }

  private mapHealthData(data: any): WearableHealthData {
    return {
      id: data.id,
      userId: data.user_id,
      deviceId: data.device_id,
      dataType: data.data_type,
      timestamp: data.timestamp,
      valueNumeric: data.value_numeric,
      valueText: data.value_text,
      valueJson: data.value_json,
      unit: data.unit,
      qualityScore: data.quality_score,
      sourceWorkoutId: data.source_workout_id,
      rawData: data.raw_data,
      syncedAt: data.synced_at,
      createdAt: data.created_at,
    };
  }

  private mapSyncPreferences(data: any): SyncPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      deviceId: data.device_id,
      autoSyncEnabled: data.auto_sync_enabled,
      syncFrequencyMinutes: data.sync_frequency_minutes,
      dataTypesEnabled: data.data_types_enabled || [],
      syncOnlyWifi: data.sync_only_wifi,
      notifyOnSync: data.notify_on_sync,
      notifyOnError: data.notify_on_error,
      backfillDays: data.backfill_days,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private normalizeWorkout(data: WearableHealthData): NormalizedWorkout | null {
    if (!data.valueJson) return null;

    const raw = data.valueJson;

    return {
      id: data.id,
      userId: data.userId,
      deviceId: data.deviceId,
      provider: 'unknown' as Provider,
      startTime: data.timestamp,
      endTime: raw.endTime || data.timestamp,
      durationSeconds: raw.durationSeconds || 0,
      activityType: raw.activityType || 'unknown',
      distanceMeters: raw.distanceMeters,
      caloriesBurned: raw.caloriesBurned,
      avgHeartRate: raw.avgHeartRate,
      maxHeartRate: raw.maxHeartRate,
      elevationGainMeters: raw.elevationGainMeters,
      avgPace: raw.avgPace,
      avgCadence: raw.avgCadence,
      avgPower: raw.avgPower,
      zones: raw.zones,
      rawData: data.rawData || {},
    };
  }
}

export const wearableDataService = new WearableDataService();
