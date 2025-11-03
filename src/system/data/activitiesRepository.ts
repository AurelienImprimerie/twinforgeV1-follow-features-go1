/**
 * Activities Repository
 * Gestion centralisée des données d'activité avec Supabase
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
  timestamp: string;
  created_at: string;

  // Wearable enriched metrics
  hr_avg?: number | null;
  hr_max?: number | null;
  hr_min?: number | null;
  hr_resting_pre?: number | null;
  hr_recovery_1min?: number | null;
  hr_zone1_minutes?: number | null;
  hr_zone2_minutes?: number | null;
  hr_zone3_minutes?: number | null;
  hr_zone4_minutes?: number | null;
  hr_zone5_minutes?: number | null;
  hrv_pre_activity?: number | null;
  hrv_post_activity?: number | null;
  hrv_avg_overnight?: number | null;
  vo2max_estimated?: number | null;
  training_load_score?: number | null;
  efficiency_score?: number | null;
  fatigue_index?: number | null;
  distance_meters?: number | null;
  avg_pace?: string | null;
  avg_speed_kmh?: number | null;
  elevation_gain_meters?: number | null;
  avg_cadence_rpm?: number | null;
  avg_power_watts?: number | null;
  sleep_quality_score?: number | null;
  sleep_duration_hours?: number | null;
  recovery_score?: number | null;
  stress_level_pre?: number | null;
  body_battery_pre?: number | null;
  wearable_device_id?: string | null;
  data_completeness_score?: number | null;
}

export interface ActivityStats {
  totalCalories: number;
  activitiesCount: number;
  totalDuration: number;
  averageIntensity?: string;
  mostFrequentType?: string;
  lastActivityTime?: Date;
}

/**
 * Récupérer les activités d'un utilisateur pour une date donnée
 */
export async function fetchActivitiesForDate(userId: string, date: Date = new Date()): Promise<Activity[]> {
  const startDate = startOfDay(date).toISOString();
  const endDate = endOfDay(date).toISOString();

  logger.info('ACTIVITIES_REPO', 'Fetching activities for date', {
    userId,
    date: format(date, 'yyyy-MM-dd'),
    startDate,
    endDate,
    timestamp: new Date().toISOString()
  });

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: false });

    if (error) {
      logger.error('ACTIVITIES_REPO', 'Failed to fetch activities', {
        error: error.message,
        errorCode: error.code,
        userId,
        date: format(date, 'yyyy-MM-dd'),
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    logger.info('ACTIVITIES_REPO', 'Activities fetched successfully', {
      userId,
      date: format(date, 'yyyy-MM-dd'),
      activitiesCount: data?.length || 0,
      timestamp: new Date().toISOString()
    });

    return data || [];
  } catch (error) {
    logger.error('ACTIVITIES_REPO', 'Exception during activities fetch', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      date: format(date, 'yyyy-MM-dd'),
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Calculer les statistiques d'activité pour une liste d'activités
 */
export function calculateActivityStats(activities: Activity[]): ActivityStats {
  if (activities.length === 0) {
    return {
      totalCalories: 0,
      activitiesCount: 0,
      totalDuration: 0,
      averageIntensity: undefined,
      mostFrequentType: undefined,
      lastActivityTime: undefined,
    };
  }

  const totalCalories = activities.reduce((sum, activity) => sum + activity.calories_est, 0);
  const totalDuration = activities.reduce((sum, activity) => sum + activity.duration_min, 0);

  // Calculer l'intensité moyenne
  const intensityValues = { low: 1, medium: 2, high: 3, very_high: 4 };
  const intensityLabels = { 1: 'low', 2: 'medium', 3: 'high', 4: 'very_high' };
  const avgIntensityValue = activities.reduce((sum, activity) => 
    sum + intensityValues[activity.intensity], 0) / activities.length;
  const averageIntensity = intensityLabels[Math.round(avgIntensityValue) as keyof typeof intensityLabels];

  // Trouver le type d'activité le plus fréquent
  const typeFrequency: Record<string, number> = {};
  activities.forEach(activity => {
    typeFrequency[activity.type] = (typeFrequency[activity.type] || 0) + 1;
  });
  const mostFrequentType = Object.entries(typeFrequency)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Dernière activité
  const lastActivityTime = activities.length > 0 ? new Date(activities[0].timestamp) : undefined;

  return {
    totalCalories,
    activitiesCount: activities.length,
    totalDuration,
    averageIntensity,
    mostFrequentType,
    lastActivityTime,
  };
}

/**
 * Récupérer les activités récentes d'un utilisateur (dernières 10)
 */
export async function fetchRecentActivities(userId: string, limit: number = 10): Promise<Activity[]> {
  logger.info('ACTIVITIES_REPO', 'Fetching recent activities', {
    userId,
    limit,
    timestamp: new Date().toISOString()
  });

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('ACTIVITIES_REPO', 'Failed to fetch recent activities', {
        error: error.message,
        errorCode: error.code,
        userId,
        limit,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    logger.info('ACTIVITIES_REPO', 'Recent activities fetched successfully', {
      userId,
      activitiesCount: data?.length || 0,
      limit,
      timestamp: new Date().toISOString()
    });

    return data || [];
  } catch (error) {
    logger.error('ACTIVITIES_REPO', 'Exception during recent activities fetch', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      limit,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Supprimer une activité
 */
export async function deleteActivity(activityId: string, userId: string): Promise<void> {
  logger.info('ACTIVITIES_REPO', 'Deleting activity', {
    activityId,
    userId,
    timestamp: new Date().toISOString()
  });

  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)
      .eq('user_id', userId); // Sécurité : s'assurer que l'utilisateur ne peut supprimer que ses propres activités

    if (error) {
      logger.error('ACTIVITIES_REPO', 'Failed to delete activity', {
        error: error.message,
        errorCode: error.code,
        activityId,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    logger.info('ACTIVITIES_REPO', 'Activity deleted successfully', {
      activityId,
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('ACTIVITIES_REPO', 'Exception during activity deletion', {
      error: error instanceof Error ? error.message : 'Unknown error',
      activityId,
      userId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Récupérer les statistiques globales d'un utilisateur
 */
export async function fetchGlobalActivityStats(userId: string): Promise<{
  totalSessions: number;
  totalCalories: number;
  totalMinutes: number;
  favoriteActivity?: string;
}> {
  logger.info('ACTIVITIES_REPO', 'Fetching global activity stats', {
    userId,
    timestamp: new Date().toISOString()
  });

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('type, duration_min, calories_est')
      .eq('user_id', userId);

    if (error) {
      logger.error('ACTIVITIES_REPO', 'Failed to fetch global stats', {
        error: error.message,
        errorCode: error.code,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    const activities = data || [];
    const totalSessions = activities.length;
    const totalCalories = activities.reduce((sum, activity) => sum + activity.calories_est, 0);
    const totalMinutes = activities.reduce((sum, activity) => sum + activity.duration_min, 0);

    // Calculer l'activité favorite
    const typeFrequency: Record<string, number> = {};
    activities.forEach(activity => {
      typeFrequency[activity.type] = (typeFrequency[activity.type] || 0) + 1;
    });
    const favoriteActivity = Object.entries(typeFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const stats = {
      totalSessions,
      totalCalories,
      totalMinutes,
      favoriteActivity,
    };

    logger.info('ACTIVITIES_REPO', 'Global stats calculated successfully', {
      userId,
      stats,
      timestamp: new Date().toISOString()
    });

    return stats;
  } catch (error) {
    logger.error('ACTIVITIES_REPO', 'Exception during global stats fetch', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Récupérer les activités d'un utilisateur pour une plage de dates
 */
export async function getUserActivities(
  userId: string, 
  startDate: Date, 
  endDate: Date, 
  limit: number = 100
): Promise<Activity[]> {
  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();

  logger.info('ACTIVITIES_REPO', 'Fetching user activities for date range', {
    userId,
    startDate: startDateISO,
    endDate: endDateISO,
    limit,
    timestamp: new Date().toISOString()
  });

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDateISO)
      .lte('timestamp', endDateISO)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('ACTIVITIES_REPO', 'Failed to fetch user activities', {
        error: error.message,
        errorCode: error.code,
        userId,
        startDate: startDateISO,
        endDate: endDateISO,
        limit,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    logger.info('ACTIVITIES_REPO', 'User activities fetched successfully', {
      userId,
      activitiesCount: data?.length || 0,
      startDate: startDateISO,
      endDate: endDateISO,
      limit,
      timestamp: new Date().toISOString()
    });

    return data || [];
  } catch (error) {
    logger.error('ACTIVITIES_REPO', 'Exception during user activities fetch', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      startDate: startDateISO,
      endDate: endDateISO,
      limit,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Valider les données d'activité avant insertion
 */
export function validateActivityData(activity: Partial<Activity>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!activity.type || activity.type.trim().length === 0) {
    errors.push('Le type d\'activité est requis');
  }

  if (!activity.duration_min || activity.duration_min <= 0) {
    errors.push('La durée doit être supérieure à 0 minutes');
  }

  if (activity.duration_min && activity.duration_min > 600) {
    errors.push('La durée ne peut pas dépasser 10 heures (600 minutes)');
  }

  if (!activity.intensity || !['low', 'medium', 'high', 'very_high'].includes(activity.intensity)) {
    errors.push('L\'intensité doit être low, medium, high ou very_high');
  }

  if (!activity.calories_est || activity.calories_est < 0) {
    errors.push('Les calories estimées doivent être supérieures ou égales à 0');
  }

  if (activity.calories_est && activity.calories_est > 2000) {
    errors.push('Les calories estimées semblent trop élevées (max 2000 kcal par activité)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}