/**
 * Local Activity Insights Processor
 * Generates basic activity insights locally without requiring edge function calls
 * Used as fallback when edge function is unavailable (e.g., in StackBlitz environment)
 */

import { format, subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import logger from '../../../../lib/utils/logger';

interface Activity {
  id: string;
  user_id: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
  timestamp: string;
  created_at: string;
  wearable_device_id?: string;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  distance_km?: number;
  elevation_gain_m?: number;
}

interface ActivityInsight {
  type: 'success' | 'warning' | 'info' | 'recommendation';
  title: string;
  message: string;
  metric?: string;
  value?: string | number;
  change?: number;
}

interface ActivitySummary {
  total_activities: number;
  total_duration_min: number;
  total_calories: number;
  avg_duration_min: number;
  avg_calories_per_activity: number;
  most_common_activity: string;
  most_intense_workout?: {
    type: string;
    calories: number;
    date: string;
  };
  consistency_score: number;
  days_with_activity: number;
  total_days_in_period: number;
}

interface LocalInsightsResponse {
  insights: ActivityInsight[];
  summary: ActivitySummary;
  current_activities: number;
  required_activities: number;
  insufficient_data: boolean;
  fallback: boolean;
  cached: boolean;
  period: string;
}

/**
 * Get minimum activities required for a period
 */
export function getMinimumActivitiesForPeriod(period: string): number {
  switch (period) {
    case 'last7Days':
      return 3;
    case 'last30Days':
      return 8;
    case 'last3Months':
      return 20;
    case 'last6Months':
      return 35;
    case 'last1Year':
      return 60;
    default:
      return 3;
  }
}

/**
 * Calculate date range for period
 */
function getDateRangeForPeriod(period: string): { startDate: Date; endDate: Date; totalDays: number } {
  const endDate = endOfDay(new Date());
  let startDate: Date;
  let totalDays: number;

  switch (period) {
    case 'last7Days':
      startDate = startOfDay(subDays(endDate, 6));
      totalDays = 7;
      break;
    case 'last30Days':
      startDate = startOfDay(subDays(endDate, 29));
      totalDays = 30;
      break;
    case 'last3Months':
      startDate = startOfDay(subDays(endDate, 89));
      totalDays = 90;
      break;
    case 'last6Months':
      startDate = startOfDay(subDays(endDate, 179));
      totalDays = 180;
      break;
    case 'last1Year':
      startDate = startOfDay(subDays(endDate, 364));
      totalDays = 365;
      break;
    default:
      startDate = startOfDay(subDays(endDate, 6));
      totalDays = 7;
  }

  return { startDate, endDate, totalDays };
}

/**
 * Generate activity summary statistics
 */
function generateActivitySummary(activities: Activity[], totalDays: number): ActivitySummary {
  const totalActivities = activities.length;
  const totalDuration = activities.reduce((sum, a) => sum + a.duration_min, 0);
  const totalCalories = activities.reduce((sum, a) => sum + a.calories_est, 0);

  // Find most common activity type
  const activityCounts: Record<string, number> = {};
  activities.forEach(a => {
    activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
  });
  const mostCommonActivity = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Aucune';

  // Find most intense workout
  const mostIntenseWorkout = activities.reduce((max, a) => {
    return (!max || a.calories_est > max.calories_est) ? a : max;
  }, null as Activity | null);

  // Calculate consistency (days with activity / total days)
  const uniqueDays = new Set(
    activities.map(a => format(new Date(a.timestamp), 'yyyy-MM-dd'))
  );
  const daysWithActivity = uniqueDays.size;
  const consistencyScore = Math.round((daysWithActivity / totalDays) * 100);

  return {
    total_activities: totalActivities,
    total_duration_min: totalDuration,
    total_calories: totalCalories,
    avg_duration_min: totalActivities > 0 ? Math.round(totalDuration / totalActivities) : 0,
    avg_calories_per_activity: totalActivities > 0 ? Math.round(totalCalories / totalActivities) : 0,
    most_common_activity: mostCommonActivity,
    most_intense_workout: mostIntenseWorkout ? {
      type: mostIntenseWorkout.type,
      calories: mostIntenseWorkout.calories_est,
      date: format(new Date(mostIntenseWorkout.timestamp), 'dd/MM/yyyy')
    } : undefined,
    consistency_score: consistencyScore,
    days_with_activity: daysWithActivity,
    total_days_in_period: totalDays
  };
}

/**
 * Generate activity insights based on patterns
 */
function generateInsights(activities: Activity[], summary: ActivitySummary, period: string): ActivityInsight[] {
  const insights: ActivityInsight[] = [];

  // Consistency insight
  if (summary.consistency_score >= 70) {
    insights.push({
      type: 'success',
      title: 'Excellente régularité',
      message: `Vous avez été actif ${summary.days_with_activity} jours sur ${summary.total_days_in_period}. Votre constance est remarquable !`,
      metric: 'consistency_score',
      value: summary.consistency_score
    });
  } else if (summary.consistency_score >= 40) {
    insights.push({
      type: 'info',
      title: 'Régularité modérée',
      message: `Vous avez été actif ${summary.days_with_activity} jours sur ${summary.total_days_in_period}. Essayez d'augmenter votre fréquence pour de meilleurs résultats.`,
      metric: 'consistency_score',
      value: summary.consistency_score
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Activité irrégulière',
      message: `Vous avez été actif seulement ${summary.days_with_activity} jours sur ${summary.total_days_in_period}. Une pratique plus régulière améliorerait vos progrès.`,
      metric: 'consistency_score',
      value: summary.consistency_score
    });
  }

  // Duration insight
  const targetDurationPerWeek = 150; // WHO recommendation
  const weeksInPeriod = summary.total_days_in_period / 7;
  const avgDurationPerWeek = summary.total_duration_min / weeksInPeriod;

  if (avgDurationPerWeek >= targetDurationPerWeek) {
    insights.push({
      type: 'success',
      title: 'Objectif hebdomadaire atteint',
      message: `Vous faites en moyenne ${Math.round(avgDurationPerWeek)} minutes d'activité par semaine, dépassant l'objectif recommandé de ${targetDurationPerWeek} minutes.`,
      metric: 'weekly_duration',
      value: Math.round(avgDurationPerWeek)
    });
  } else {
    const deficit = targetDurationPerWeek - avgDurationPerWeek;
    insights.push({
      type: 'recommendation',
      title: 'Augmentez votre volume d\'entraînement',
      message: `Vous faites ${Math.round(avgDurationPerWeek)} minutes par semaine. Ajoutez ${Math.round(deficit)} minutes pour atteindre l'objectif recommandé.`,
      metric: 'weekly_duration',
      value: Math.round(avgDurationPerWeek)
    });
  }

  // Variety insight
  const uniqueActivityTypes = new Set(activities.map(a => a.type)).size;
  if (uniqueActivityTypes >= 4) {
    insights.push({
      type: 'success',
      title: 'Excellente variété d\'activités',
      message: `Vous pratiquez ${uniqueActivityTypes} types d'activités différents. Cette diversité est excellente pour votre condition physique globale.`,
      metric: 'activity_variety',
      value: uniqueActivityTypes
    });
  } else if (uniqueActivityTypes <= 2) {
    insights.push({
      type: 'recommendation',
      title: 'Diversifiez vos activités',
      message: `Vous pratiquez principalement ${summary.most_common_activity}. Essayez d'ajouter d'autres types d'exercices pour un entraînement plus complet.`,
      metric: 'activity_variety',
      value: uniqueActivityTypes
    });
  }

  // Intensity insight
  const highIntensityCount = activities.filter(a =>
    a.intensity === 'high' || a.intensity === 'very_high'
  ).length;
  const highIntensityPercentage = (highIntensityCount / activities.length) * 100;

  if (highIntensityPercentage >= 30) {
    insights.push({
      type: 'success',
      title: 'Bon équilibre d\'intensité',
      message: `${Math.round(highIntensityPercentage)}% de vos séances sont à haute intensité. Cet équilibre favorise les progrès cardiovasculaires.`,
      metric: 'high_intensity_percentage',
      value: Math.round(highIntensityPercentage)
    });
  } else if (highIntensityPercentage < 15) {
    insights.push({
      type: 'recommendation',
      title: 'Augmentez l\'intensité',
      message: `Seulement ${Math.round(highIntensityPercentage)}% de vos séances sont intenses. Intégrez des entraînements à haute intensité pour optimiser vos résultats.`,
      metric: 'high_intensity_percentage',
      value: Math.round(highIntensityPercentage)
    });
  }

  // Wearable insight
  const wearableActivities = activities.filter(a => a.wearable_device_id).length;
  if (wearableActivities > 0) {
    const wearablePercentage = (wearableActivities / activities.length) * 100;
    insights.push({
      type: 'info',
      title: 'Données biométriques enrichies',
      message: `${Math.round(wearablePercentage)}% de vos activités sont synchronisées avec votre montre. Les données cardiaques enrichissent l'analyse.`,
      metric: 'wearable_percentage',
      value: Math.round(wearablePercentage)
    });
  }

  return insights;
}

/**
 * Main function: Generate local insights for activities
 */
export async function generateLocalActivityInsights(
  userId: string,
  period: 'last7Days' | 'last30Days' | 'last3Months' | 'last6Months' | 'last1Year',
  supabase: any
): Promise<LocalInsightsResponse> {
  logger.info('LOCAL_INSIGHTS_PROCESSOR', 'Generating local fallback insights', {
    userId,
    period,
    timestamp: new Date().toISOString()
  });

  try {
    const { startDate, endDate, totalDays } = getDateRangeForPeriod(period);
    const minActivities = getMinimumActivitiesForPeriod(period);

    // Fetch activities from database
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      logger.error('LOCAL_INSIGHTS_PROCESSOR', 'Failed to fetch activities', {
        error: error.message,
        userId,
        period,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    const currentActivities = activities?.length || 0;

    logger.info('LOCAL_INSIGHTS_PROCESSOR', 'Activities fetched successfully', {
      userId,
      period,
      currentActivities,
      minActivities,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timestamp: new Date().toISOString()
    });

    // Check if sufficient data
    if (currentActivities < minActivities) {
      return {
        insights: [],
        summary: {
          total_activities: currentActivities,
          total_duration_min: 0,
          total_calories: 0,
          avg_duration_min: 0,
          avg_calories_per_activity: 0,
          most_common_activity: 'Aucune',
          consistency_score: 0,
          days_with_activity: 0,
          total_days_in_period: totalDays
        },
        current_activities: currentActivities,
        required_activities: minActivities,
        insufficient_data: true,
        fallback: true,
        cached: false,
        period
      };
    }

    // Generate summary and insights
    const summary = generateActivitySummary(activities, totalDays);
    const insights = generateInsights(activities, summary, period);

    logger.info('LOCAL_INSIGHTS_PROCESSOR', 'Local insights generated successfully', {
      userId,
      period,
      currentActivities,
      insightsCount: insights.length,
      summaryStats: {
        totalActivities: summary.total_activities,
        totalDuration: summary.total_duration_min,
        totalCalories: summary.total_calories,
        consistencyScore: summary.consistency_score
      },
      timestamp: new Date().toISOString()
    });

    return {
      insights,
      summary,
      current_activities: currentActivities,
      required_activities: minActivities,
      insufficient_data: false,
      fallback: true,
      cached: false,
      period
    };

  } catch (error) {
    logger.error('LOCAL_INSIGHTS_PROCESSOR', 'Failed to generate local insights', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      period,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
