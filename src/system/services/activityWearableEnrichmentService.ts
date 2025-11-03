/**
 * Activity Wearable Enrichment Service
 * Service pour enrichir automatiquement les activités avec les données des objets connectés
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type { Activity } from '../data/activitiesRepository';

export interface WearableEnrichmentResult {
  activityId: string;
  enriched: boolean;
  fieldsEnriched: string[];
  dataSource: string;
  confidence: number;
}

export interface WearableDataPoint {
  dataType: string;
  timestamp: string;
  valueNumeric?: number;
  valueText?: string;
  valueJson?: Record<string, any>;
  unit?: string;
  deviceId: string;
  provider: string;
}

class ActivityWearableEnrichmentService {
  /**
   * Enrichir une activité avec les données wearables correspondantes
   */
  async enrichActivity(activityId: string, userId: string): Promise<WearableEnrichmentResult> {
    try {
      logger.info('WEARABLE_ENRICHMENT', 'Starting activity enrichment', {
        activityId,
        userId,
        timestamp: new Date().toISOString()
      });

      // 1. Récupérer l'activité
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .eq('user_id', userId)
        .single();

      if (activityError || !activity) {
        throw new Error(`Activity not found: ${activityError?.message}`);
      }

      // Si déjà enrichie, skip
      if (activity.wearable_device_id) {
        logger.info('WEARABLE_ENRICHMENT', 'Activity already enriched', { activityId });
        return {
          activityId,
          enriched: false,
          fieldsEnriched: [],
          dataSource: 'existing',
          confidence: 100
        };
      }

      // 2. Récupérer les devices connectés de l'utilisateur
      const { data: devices, error: devicesError } = await supabase
        .from('connected_devices')
        .select('id, provider, status')
        .eq('user_id', userId)
        .eq('status', 'connected');

      if (devicesError || !devices || devices.length === 0) {
        logger.info('WEARABLE_ENRICHMENT', 'No connected devices found', { userId });
        return {
          activityId,
          enriched: false,
          fieldsEnriched: [],
          dataSource: 'none',
          confidence: 0
        };
      }

      // 3. Rechercher les données wearables correspondantes
      const activityTimestamp = new Date(activity.timestamp);
      const startWindow = new Date(activityTimestamp.getTime() - 5 * 60 * 1000); // 5 min avant
      const endWindow = new Date(activityTimestamp.getTime() + activity.duration_min * 60 * 1000 + 5 * 60 * 1000); // durée + 5 min après

      const { data: wearableData, error: wearableError } = await supabase
        .from('wearable_health_data')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startWindow.toISOString())
        .lte('timestamp', endWindow.toISOString())
        .order('timestamp', { ascending: true });

      if (wearableError || !wearableData || wearableData.length === 0) {
        logger.info('WEARABLE_ENRICHMENT', 'No wearable data found in time window', {
          activityId,
          startWindow: startWindow.toISOString(),
          endWindow: endWindow.toISOString()
        });
        return {
          activityId,
          enriched: false,
          fieldsEnriched: [],
          dataSource: 'none',
          confidence: 0
        };
      }

      // 4. Agréger et enrichir
      const enrichmentData = this.aggregateWearableData(wearableData, activity);

      // 5. Mettre à jour l'activité
      const { error: updateError } = await supabase
        .from('activities')
        .update({
          ...enrichmentData.fields,
          wearable_device_id: enrichmentData.primaryDeviceId,
          wearable_synced_at: new Date().toISOString(),
          wearable_raw_data: enrichmentData.rawData
        })
        .eq('id', activityId)
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      logger.info('WEARABLE_ENRICHMENT', 'Activity enriched successfully', {
        activityId,
        fieldsEnriched: enrichmentData.fieldsEnriched,
        confidence: enrichmentData.confidence
      });

      return {
        activityId,
        enriched: true,
        fieldsEnriched: enrichmentData.fieldsEnriched,
        dataSource: enrichmentData.primaryProvider,
        confidence: enrichmentData.confidence
      };
    } catch (error) {
      logger.error('WEARABLE_ENRICHMENT', 'Failed to enrich activity', {
        error: error instanceof Error ? error.message : 'Unknown error',
        activityId,
        userId
      });
      throw error;
    }
  }

  /**
   * Agréger les données wearables pour une activité
   */
  private aggregateWearableData(wearableData: any[], activity: Activity) {
    const fields: Record<string, any> = {};
    const fieldsEnriched: string[] = [];
    let primaryDeviceId: string | null = null;
    let primaryProvider = 'unknown';
    const rawData: Record<string, any> = {};

    // Grouper par type de données
    const dataByType: Record<string, any[]> = {};
    wearableData.forEach((dp) => {
      if (!dataByType[dp.data_type]) {
        dataByType[dp.data_type] = [];
      }
      dataByType[dp.data_type].push(dp);
    });

    // Prendre le premier device comme référence
    if (wearableData.length > 0) {
      primaryDeviceId = wearableData[0].device_id;
    }

    // Heart Rate
    if (dataByType['heart_rate']) {
      const hrValues = dataByType['heart_rate'].map(d => d.value_numeric).filter(v => v);
      if (hrValues.length > 0) {
        fields.hr_avg = Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length);
        fields.hr_max = Math.max(...hrValues);
        fields.hr_min = Math.min(...hrValues);
        fieldsEnriched.push('hr_avg', 'hr_max', 'hr_min');
        rawData.heart_rate = hrValues;
      }
    }

    // Calories
    if (dataByType['calories']) {
      const caloriesValue = dataByType['calories'][0]?.value_numeric;
      if (caloriesValue) {
        // Mettre à jour les calories de l'activité si disponibles
        fields.calories_est = Math.round(caloriesValue);
        fieldsEnriched.push('calories_est');
        rawData.calories = caloriesValue;
      }
    }

    // Distance
    if (dataByType['distance']) {
      const distanceValue = dataByType['distance'][0]?.value_numeric;
      if (distanceValue) {
        fields.distance_meters = distanceValue;
        fieldsEnriched.push('distance_meters');
        rawData.distance = distanceValue;

        // Calculer la vitesse moyenne si durée disponible
        if (activity.duration_min > 0) {
          const speedKmh = (distanceValue / 1000) / (activity.duration_min / 60);
          fields.avg_speed_kmh = Math.round(speedKmh * 100) / 100;
          fieldsEnriched.push('avg_speed_kmh');
        }
      }
    }

    // Steps
    if (dataByType['steps']) {
      const stepsValue = dataByType['steps'][0]?.value_numeric;
      if (stepsValue) {
        rawData.steps = stepsValue;
      }
    }

    // VO2max
    if (dataByType['vo2max']) {
      const vo2maxValue = dataByType['vo2max'][0]?.value_numeric;
      if (vo2maxValue) {
        fields.vo2max_estimated = vo2maxValue;
        fieldsEnriched.push('vo2max_estimated');
        rawData.vo2max = vo2maxValue;
      }
    }

    // HRV
    if (dataByType['hrv']) {
      const hrvValues = dataByType['hrv'].map(d => d.value_numeric).filter(v => v);
      if (hrvValues.length > 0) {
        // Prendre la première valeur comme HRV pré-activité
        fields.hrv_pre_activity = hrvValues[0];
        // Prendre la dernière comme post-activité
        if (hrvValues.length > 1) {
          fields.hrv_post_activity = hrvValues[hrvValues.length - 1];
        }
        fieldsEnriched.push('hrv_pre_activity');
        rawData.hrv = hrvValues;
      }
    }

    // Elevation
    if (dataByType['elevation']) {
      const elevationValue = dataByType['elevation'][0]?.value_numeric;
      if (elevationValue) {
        fields.elevation_gain_meters = elevationValue;
        fieldsEnriched.push('elevation_gain_meters');
        rawData.elevation = elevationValue;
      }
    }

    // Cadence
    if (dataByType['cadence']) {
      const cadenceValues = dataByType['cadence'].map(d => d.value_numeric).filter(v => v);
      if (cadenceValues.length > 0) {
        fields.avg_cadence_rpm = Math.round(cadenceValues.reduce((a, b) => a + b, 0) / cadenceValues.length);
        fields.max_cadence_rpm = Math.max(...cadenceValues);
        fieldsEnriched.push('avg_cadence_rpm', 'max_cadence_rpm');
        rawData.cadence = cadenceValues;
      }
    }

    // Power
    if (dataByType['power']) {
      const powerValues = dataByType['power'].map(d => d.value_numeric).filter(v => v);
      if (powerValues.length > 0) {
        fields.avg_power_watts = Math.round(powerValues.reduce((a, b) => a + b, 0) / powerValues.length);
        fields.max_power_watts = Math.max(...powerValues);
        fieldsEnriched.push('avg_power_watts', 'max_power_watts');
        rawData.power = powerValues;
      }
    }

    // Calculer la confiance basée sur le nombre de champs enrichis
    const confidence = Math.min(100, (fieldsEnriched.length / 10) * 100);

    return {
      fields,
      fieldsEnriched,
      primaryDeviceId,
      primaryProvider,
      rawData,
      confidence
    };
  }

  /**
   * Enrichir toutes les activités d'un utilisateur qui n'ont pas encore été enrichies
   */
  async enrichAllUserActivities(userId: string, limit: number = 100): Promise<WearableEnrichmentResult[]> {
    try {
      logger.info('WEARABLE_ENRICHMENT', 'Starting bulk enrichment', {
        userId,
        limit,
        timestamp: new Date().toISOString()
      });

      // Récupérer les activités sans enrichissement
      const { data: activities, error } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', userId)
        .is('wearable_device_id', null)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      if (!activities || activities.length === 0) {
        logger.info('WEARABLE_ENRICHMENT', 'No activities to enrich', { userId });
        return [];
      }

      // Enrichir chaque activité
      const results: WearableEnrichmentResult[] = [];
      for (const activity of activities) {
        try {
          const result = await this.enrichActivity(activity.id, userId);
          results.push(result);
        } catch (error) {
          logger.error('WEARABLE_ENRICHMENT', 'Failed to enrich activity in bulk', {
            activityId: activity.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      logger.info('WEARABLE_ENRICHMENT', 'Bulk enrichment completed', {
        userId,
        totalActivities: activities.length,
        enrichedCount: results.filter(r => r.enriched).length
      });

      return results;
    } catch (error) {
      logger.error('WEARABLE_ENRICHMENT', 'Failed to bulk enrich activities', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur a des données wearables non exploitées
   */
  async checkUnusedWearableData(userId: string): Promise<{
    hasUnusedData: boolean;
    unusedDataCount: number;
    potentialActivitiesCount: number;
  }> {
    try {
      // Compter les activités sans enrichissement
      const { count: activitiesCount, error: activitiesError } = await supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('wearable_device_id', null);

      if (activitiesError) {
        throw activitiesError;
      }

      // Compter les données wearables
      const { count: wearableCount, error: wearableError } = await supabase
        .from('wearable_health_data')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (wearableError) {
        throw wearableError;
      }

      const hasUnusedData = (wearableCount || 0) > 0 && (activitiesCount || 0) > 0;

      return {
        hasUnusedData,
        unusedDataCount: wearableCount || 0,
        potentialActivitiesCount: activitiesCount || 0
      };
    } catch (error) {
      logger.error('WEARABLE_ENRICHMENT', 'Failed to check unused wearable data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }
}

export const activityWearableEnrichmentService = new ActivityWearableEnrichmentService();
