import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

export interface HRPerformanceCorrelation {
  avgHeartRate: number;
  avgPace?: number;
  avgPower?: number;
  avgCadence?: number;
  efficiency: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface OvertrainingIndicator {
  severity: 'none' | 'low' | 'moderate' | 'high';
  indicators: string[];
  hrvTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
  score: number;
}

export interface OptimalTrainingWindow {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  avgPerformance: number;
  avgRecovery: number;
  recommendation: string;
  confidence: number;
}

class BiometricAnalysisService {
  async analyzeHRPerformanceCorrelation(
    userId: string,
    days: number = 30
  ): Promise<HRPerformanceCorrelation | null> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: activities, error } = await supabase
        .from('activities')
        .select('hr_avg, avg_pace, avg_power_watts, avg_cadence_rpm, efficiency_score')
        .eq('user_id', userId)
        .gte('timestamp', since.toISOString())
        .not('hr_avg', 'is', null)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      if (!activities || activities.length === 0) return null;

      const validActivities = activities.filter((a) => a.hr_avg && a.efficiency_score);
      if (validActivities.length < 5) return null;

      const avgHeartRate =
        validActivities.reduce((sum, a) => sum + (a.hr_avg || 0), 0) / validActivities.length;
      const avgPace = this.calculateAverage(validActivities.map((a) => a.avg_pace));
      const avgPower = this.calculateAverage(validActivities.map((a) => a.avg_power_watts));
      const avgCadence = this.calculateAverage(validActivities.map((a) => a.avg_cadence_rpm));
      const avgEfficiency =
        validActivities.reduce((sum, a) => sum + (a.efficiency_score || 0), 0) /
        validActivities.length;

      const recentActivities = validActivities.slice(-10);
      const olderActivities = validActivities.slice(0, 10);

      const recentEfficiency =
        recentActivities.reduce((sum, a) => sum + (a.efficiency_score || 0), 0) /
        recentActivities.length;
      const olderEfficiency =
        olderActivities.reduce((sum, a) => sum + (a.efficiency_score || 0), 0) /
        olderActivities.length;

      let trend: 'improving' | 'stable' | 'declining';
      const efficiencyDiff = recentEfficiency - olderEfficiency;
      if (efficiencyDiff > 5) trend = 'improving';
      else if (efficiencyDiff < -5) trend = 'declining';
      else trend = 'stable';

      return {
        avgHeartRate,
        avgPace,
        avgPower,
        avgCadence,
        efficiency: avgEfficiency,
        trend,
      };
    } catch (error) {
      logger.error('BIOMETRIC_ANALYSIS', 'Failed to analyze HR/Performance correlation', {
        error,
        userId,
      });
      throw error;
    }
  }

  async detectOvertraining(userId: string): Promise<OvertrainingIndicator> {
    try {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const { data: recentActivities, error: recentError } = await supabase
        .from('activities')
        .select('hrv_pre_activity, recovery_score, hr_resting_pre, sleep_quality_score, stress_level_pre, training_load_score')
        .eq('user_id', userId)
        .gte('timestamp', last7Days.toISOString())
        .not('hrv_pre_activity', 'is', null);

      const { data: olderActivities, error: olderError } = await supabase
        .from('activities')
        .select('hrv_pre_activity, recovery_score, hr_resting_pre')
        .eq('user_id', userId)
        .gte('timestamp', last30Days.toISOString())
        .lt('timestamp', last7Days.toISOString())
        .not('hrv_pre_activity', 'is', null);

      if (recentError || olderError) throw recentError || olderError;
      if (!recentActivities || recentActivities.length === 0) {
        return {
          severity: 'none',
          indicators: ['Données insuffisantes pour analyser le surentraînement'],
          hrvTrend: 'stable',
          recommendations: ['Connectez un objet pour suivre votre récupération'],
          score: 0,
        };
      }

      const indicators: string[] = [];
      let overtrainingScore = 0;

      const recentHRV =
        recentActivities.reduce((sum, a) => sum + (a.hrv_pre_activity || 0), 0) /
        recentActivities.length;
      const olderHRV =
        olderActivities && olderActivities.length > 0
          ? olderActivities.reduce((sum, a) => sum + (a.hrv_pre_activity || 0), 0) / olderActivities.length
          : recentHRV;

      const hrvChange = ((recentHRV - olderHRV) / olderHRV) * 100;
      let hrvTrend: 'improving' | 'stable' | 'declining';

      if (hrvChange < -10) {
        indicators.push('HRV en baisse significative (-' + Math.abs(hrvChange).toFixed(1) + '%)');
        overtrainingScore += 30;
        hrvTrend = 'declining';
      } else if (hrvChange > 10) {
        hrvTrend = 'improving';
      } else {
        hrvTrend = 'stable';
      }

      const avgRecovery =
        recentActivities.reduce((sum, a) => sum + (a.recovery_score || 0), 0) /
        recentActivities.length;
      if (avgRecovery < 50) {
        indicators.push('Score de récupération faible (' + avgRecovery.toFixed(0) + '%)');
        overtrainingScore += 25;
      }

      const recentRestingHR =
        recentActivities.reduce((sum, a) => sum + (a.hr_resting_pre || 0), 0) /
        recentActivities.length;
      const olderRestingHR =
        olderActivities && olderActivities.length > 0
          ? olderActivities.reduce((sum, a) => sum + (a.hr_resting_pre || 0), 0) /
            olderActivities.length
          : recentRestingHR;

      if (recentRestingHR > olderRestingHR + 5) {
        indicators.push(
          'Fréquence cardiaque au repos élevée (+' + (recentRestingHR - olderRestingHR).toFixed(0) + ' bpm)'
        );
        overtrainingScore += 20;
      }

      const avgSleep =
        recentActivities.reduce((sum, a) => sum + (a.sleep_quality_score || 0), 0) /
        recentActivities.length;
      if (avgSleep > 0 && avgSleep < 60) {
        indicators.push('Qualité de sommeil dégradée (' + avgSleep.toFixed(0) + '%)');
        overtrainingScore += 15;
      }

      const avgStress =
        recentActivities.reduce((sum, a) => sum + (a.stress_level_pre || 0), 0) /
        recentActivities.length;
      if (avgStress > 70) {
        indicators.push('Niveau de stress élevé (' + avgStress.toFixed(0) + '%)');
        overtrainingScore += 10;
      }

      let severity: 'none' | 'low' | 'moderate' | 'high';
      const recommendations: string[] = [];

      if (overtrainingScore >= 60) {
        severity = 'high';
        recommendations.push('Repos complet recommandé pendant 3-5 jours');
        recommendations.push('Consultez un professionnel de santé si les symptômes persistent');
        recommendations.push('Évitez tout entraînement intense');
      } else if (overtrainingScore >= 40) {
        severity = 'moderate';
        recommendations.push('Réduisez l\'intensité d\'entraînement de 50%');
        recommendations.push('Privilégiez la récupération active (marche, yoga, étirements)');
        recommendations.push('Assurez-vous de dormir 8h+ par nuit');
      } else if (overtrainingScore >= 20) {
        severity = 'low';
        recommendations.push('Intégrez une journée de repos supplémentaire cette semaine');
        recommendations.push('Surveillez votre récupération de près');
        recommendations.push('Évitez d\'augmenter votre charge d\'entraînement');
      } else {
        severity = 'none';
        recommendations.push('Votre récupération est bonne, continuez ainsi');
        recommendations.push('Maintenez une progression progressive');
      }

      if (indicators.length === 0) {
        indicators.push('Aucun signe de surentraînement détecté');
      }

      return {
        severity,
        indicators,
        hrvTrend,
        recommendations,
        score: overtrainingScore,
      };
    } catch (error) {
      logger.error('BIOMETRIC_ANALYSIS', 'Failed to detect overtraining', { error, userId });
      throw error;
    }
  }

  async findOptimalTrainingWindows(
    userId: string,
    days: number = 60
  ): Promise<OptimalTrainingWindow[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: activities, error } = await supabase
        .from('activities')
        .select('timestamp, efficiency_score, recovery_score, avg_power_watts, avg_pace')
        .eq('user_id', userId)
        .gte('timestamp', since.toISOString())
        .not('efficiency_score', 'is', null);

      if (error) throw error;
      if (!activities || activities.length < 10) return [];

      const windowStats = {
        morning: { performances: [] as number[], recoveries: [] as number[], count: 0 },
        afternoon: { performances: [] as number[], recoveries: [] as number[], count: 0 },
        evening: { performances: [] as number[], recoveries: [] as number[], count: 0 },
      };

      activities.forEach((activity) => {
        const hour = new Date(activity.timestamp).getHours();
        let window: 'morning' | 'afternoon' | 'evening';

        if (hour >= 5 && hour < 12) window = 'morning';
        else if (hour >= 12 && hour < 18) window = 'afternoon';
        else window = 'evening';

        windowStats[window].performances.push(activity.efficiency_score || 0);
        windowStats[window].recoveries.push(activity.recovery_score || 0);
        windowStats[window].count++;
      });

      const results: OptimalTrainingWindow[] = [];

      for (const [timeOfDay, stats] of Object.entries(windowStats)) {
        if (stats.count < 3) continue;

        const avgPerformance =
          stats.performances.reduce((sum, p) => sum + p, 0) / stats.performances.length;
        const avgRecovery =
          stats.recoveries.reduce((sum, r) => sum + r, 0) / stats.recoveries.length;
        const confidence = Math.min(stats.count / 10, 1);

        let recommendation = '';
        if (avgPerformance > 75 && avgRecovery > 70) {
          recommendation = 'Fenêtre optimale pour entraînements intensifs';
        } else if (avgPerformance > 60) {
          recommendation = 'Bon moment pour entraînements modérés';
        } else {
          recommendation = 'Privilégier récupération active ou repos';
        }

        results.push({
          timeOfDay: timeOfDay as 'morning' | 'afternoon' | 'evening',
          avgPerformance,
          avgRecovery,
          recommendation,
          confidence,
        });
      }

      return results.sort((a, b) => b.avgPerformance - a.avgPerformance);
    } catch (error) {
      logger.error('BIOMETRIC_ANALYSIS', 'Failed to find optimal training windows', {
        error,
        userId,
      });
      throw error;
    }
  }

  private calculateAverage(values: (number | null | undefined)[]): number | undefined {
    const validValues = values.filter((v) => v !== null && v !== undefined) as number[];
    if (validValues.length === 0) return undefined;
    return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  }
}

export const biometricAnalysisService = new BiometricAnalysisService();
