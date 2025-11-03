/**
 * Activity Conflict Resolver Service
 * Handles conflicts between manual activities and wearable-synced activities
 *
 * Priority Rules (as per user preference):
 * 1. Manual activities have priority over wearable activities for same time/type
 * 2. If overlap detected, keep manual data but try to enrich with wearable biometrics
 * 3. Wearable activities without conflict are automatically created
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type { Activity } from '../../system/data/activitiesRepository';

interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingActivity?: Activity;
  canMerge: boolean;
  suggestedAction: 'keep_manual' | 'keep_wearable' | 'merge' | 'create_both';
}

/**
 * Check if a new activity conflicts with existing activities
 * Time window: ±10 minutes
 */
export async function checkActivityConflict(
  userId: string,
  newActivity: {
    timestamp: string;
    type: string;
    duration_min: number;
  },
  source: 'manual' | 'wearable'
): Promise<ConflictCheckResult> {
  try {
    const activityTime = new Date(newActivity.timestamp);
    const startWindow = new Date(activityTime.getTime() - 10 * 60 * 1000); // 10 min before
    const endWindow = new Date(activityTime.getTime() + 10 * 60 * 1000); // 10 min after

    logger.info('ACTIVITY_CONFLICT', 'Checking for conflicts', {
      userId,
      newActivityType: newActivity.type,
      newActivityTime: newActivity.timestamp,
      source,
      timeWindow: {
        start: startWindow.toISOString(),
        end: endWindow.toISOString(),
      },
    });

    // Fetch potentially conflicting activities
    const { data: existingActivities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startWindow.toISOString())
      .lte('timestamp', endWindow.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      logger.error('ACTIVITY_CONFLICT', 'Failed to check conflicts', {
        error: error.message,
        userId,
      });
      throw error;
    }

    if (!existingActivities || existingActivities.length === 0) {
      return {
        hasConflict: false,
        canMerge: false,
        suggestedAction: source === 'manual' ? 'keep_manual' : 'keep_wearable',
      };
    }

    // Check for same activity type in time window
    const conflictingActivity = existingActivities.find((activity) => {
      const isSimilarType = normalizeActivityType(activity.type) === normalizeActivityType(newActivity.type);
      const timeDiffMs = Math.abs(new Date(activity.timestamp).getTime() - activityTime.getTime());
      const isCloseInTime = timeDiffMs < 10 * 60 * 1000; // Within 10 minutes

      return isSimilarType && isCloseInTime;
    });

    if (conflictingActivity) {
      logger.info('ACTIVITY_CONFLICT', 'Conflict detected', {
        userId,
        newActivityType: newActivity.type,
        conflictingActivityId: conflictingActivity.id,
        conflictingActivityType: conflictingActivity.type,
        conflictingActivitySource: conflictingActivity.wearable_device_id ? 'wearable' : 'manual',
        newActivitySource: source,
      });

      // Determine suggested action based on priority rules
      const existingIsManual = !conflictingActivity.wearable_device_id;
      const newIsManual = source === 'manual';

      let suggestedAction: 'keep_manual' | 'keep_wearable' | 'merge' | 'create_both';

      if (newIsManual && !existingIsManual) {
        // New manual activity conflicts with wearable -> keep manual, try to merge biometrics
        suggestedAction = 'merge';
      } else if (!newIsManual && existingIsManual) {
        // New wearable activity conflicts with manual -> enrich manual with wearable data
        suggestedAction = 'merge';
      } else if (newIsManual && existingIsManual) {
        // Both manual -> user entered twice, keep existing
        suggestedAction = 'keep_manual';
      } else {
        // Both wearable -> keep existing (already synced)
        suggestedAction = 'keep_wearable';
      }

      return {
        hasConflict: true,
        conflictingActivity,
        canMerge: true,
        suggestedAction,
      };
    }

    return {
      hasConflict: false,
      canMerge: false,
      suggestedAction: source === 'manual' ? 'keep_manual' : 'keep_wearable',
    };
  } catch (error) {
    logger.error('ACTIVITY_CONFLICT', 'Conflict check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
    });
    throw error;
  }
}

/**
 * Merge wearable biometric data into existing manual activity
 */
export async function enrichManualActivityWithWearable(
  activityId: string,
  wearableData: {
    hr_avg?: number;
    hr_max?: number;
    hr_min?: number;
    hr_zone1_minutes?: number;
    hr_zone2_minutes?: number;
    hr_zone3_minutes?: number;
    hr_zone4_minutes?: number;
    hr_zone5_minutes?: number;
    hrv_pre_activity?: number;
    hrv_post_activity?: number;
    vo2max_estimated?: number;
    distance_meters?: number;
    avg_speed_kmh?: number;
    elevation_gain_meters?: number;
    wearable_device_id: string;
  }
): Promise<void> {
  try {
    logger.info('ACTIVITY_CONFLICT', 'Enriching manual activity with wearable data', {
      activityId,
      hasHeartRate: !!wearableData.hr_avg,
      hasHRV: !!wearableData.hrv_pre_activity,
      hasVO2max: !!wearableData.vo2max_estimated,
      wearableDeviceId: wearableData.wearable_device_id,
    });

    const { error } = await supabase
      .from('activities')
      .update({
        ...wearableData,
        wearable_synced_at: new Date().toISOString(),
      })
      .eq('id', activityId);

    if (error) {
      logger.error('ACTIVITY_CONFLICT', 'Failed to enrich activity', {
        error: error.message,
        activityId,
      });
      throw error;
    }

    logger.info('ACTIVITY_CONFLICT', 'Activity enriched successfully', {
      activityId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('ACTIVITY_CONFLICT', 'Enrichment failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      activityId,
    });
    throw error;
  }
}

/**
 * Normalize activity type for comparison
 */
function normalizeActivityType(type: string): string {
  const normalized = type.toLowerCase().trim();

  // Map common variations
  const typeMapping: Record<string, string> = {
    course: 'running',
    running: 'running',
    run: 'running',
    jogging: 'running',
    velo: 'cycling',
    cycling: 'cycling',
    bike: 'cycling',
    natation: 'swimming',
    swimming: 'swimming',
    swim: 'swimming',
    marche: 'walking',
    walking: 'walking',
    walk: 'walking',
    musculation: 'strength',
    strength: 'strength',
    'weight training': 'strength',
    yoga: 'yoga',
  };

  return typeMapping[normalized] || normalized;
}

/**
 * Get activity source information
 */
export function getActivitySource(activity: Activity): {
  source: 'manual' | 'wearable' | 'enriched';
  provider?: string;
  isEnriched: boolean;
} {
  const hasWearableId = !!activity.wearable_device_id;
  const hasWearableSyncTime = !!activity.wearable_synced_at;
  const hasBiometrics = !!(activity.hr_avg || activity.hrv_pre_activity || activity.vo2max_estimated);

  if (hasWearableId && hasBiometrics) {
    // Activity created from wearable sync
    return {
      source: 'wearable',
      provider: extractProviderName(activity.wearable_device_id),
      isEnriched: true,
    };
  } else if (!hasWearableId && hasBiometrics && hasWearableSyncTime) {
    // Manual activity enriched with wearable data
    return {
      source: 'enriched',
      isEnriched: true,
    };
  } else {
    // Pure manual activity
    return {
      source: 'manual',
      isEnriched: false,
    };
  }
}

/**
 * Extract provider name from wearable device ID
 */
function extractProviderName(deviceId?: string): string | undefined {
  if (!deviceId) return undefined;

  // Device ID format: provider_userId_deviceId or UUID
  if (deviceId.includes('_')) {
    const parts = deviceId.split('_');
    return parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1);
  }

  return 'Montre';
}
