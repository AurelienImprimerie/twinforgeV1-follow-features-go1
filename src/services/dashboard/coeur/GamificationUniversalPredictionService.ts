/**
 * GamificationUniversalPredictionService
 *
 * Service de prédiction universelle basé sur le rythme de points actuel de l'utilisateur.
 * Fonctionne pour tous les utilisateurs, même sans données de transformation.
 */

import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';

export interface UniversalPrediction {
  current: {
    level: number;
    xp: number;
    xpToNext: number;
    totalXp: number;
  };
  predictions: {
    days30: PredictionData;
    days60: PredictionData;
    days90: PredictionData;
  };
  confidence: 'low' | 'medium' | 'high';
  averageDailyXp: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  message: string;
  encouragement: string;
}

export interface PredictionData {
  estimatedLevel: number;
  estimatedXp: number;
  daysToReach: number;
  confidenceScore: number;
}

class GamificationUniversalPredictionService {
  /**
   * Calculer la prédiction universelle basée sur l'activité XP
   */
  async calculateUniversalPrediction(userId: string): Promise<UniversalPrediction | null> {
    try {
      logger.info('GAMIFICATION_PREDICTION', 'Calculating universal prediction', { userId });

      // Récupérer les données actuelles de gamification
      const { data: currentData, error: currentError } = await supabase
        .from('user_gamification_progress')
        .select('current_level, current_xp, total_xp_earned')
        .eq('user_id', userId)
        .single();

      if (currentError || !currentData) {
        logger.warn('GAMIFICATION_PREDICTION', 'No gamification data found', { userId });
        return null;
      }

      // Récupérer l'historique XP des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: xpHistory, error: historyError } = await supabase
        .from('xp_events_log')
        .select('final_xp, created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (historyError) {
        logger.error('GAMIFICATION_PREDICTION', 'Failed to fetch XP history', { error: historyError });
        return null;
      }

      const history = xpHistory || [];

      // Si pas assez de données (moins de 3 jours d'activité)
      if (history.length < 3) {
        logger.info('GAMIFICATION_PREDICTION', 'Not enough XP history for prediction', {
          userId,
          historyLength: history.length
        });
        return null;
      }

      // Calculer la moyenne quotidienne et la tendance
      const { averageDailyXp, trendDirection } = this.calculateXpTrend(history);

      // Calculer le niveau de confiance
      const confidence = this.calculateConfidence(history, averageDailyXp);

      // Récupérer la courbe XP pour les calculs de niveau
      const { data: levels, error: levelsError } = await supabase
        .from('level_milestones')
        .select('level, xp_required')
        .order('level', { ascending: true });

      if (levelsError || !levels) {
        logger.error('GAMIFICATION_PREDICTION', 'Failed to fetch levels', { error: levelsError });
        return null;
      }

      // Calculer XP nécessaire pour prochain niveau
      const currentLevel = currentData.current_level;
      const currentXp = currentData.current_xp;
      const nextLevelData = levels.find(l => l.level === currentLevel + 1);
      const xpToNext = nextLevelData ? nextLevelData.xp_required - currentXp : 0;

      // Générer les prédictions à 30, 60, 90 jours
      const predictions = {
        days30: this.predictLevel(currentLevel, currentXp, averageDailyXp * 30, levels),
        days60: this.predictLevel(currentLevel, currentXp, averageDailyXp * 60, levels),
        days90: this.predictLevel(currentLevel, currentXp, averageDailyXp * 90, levels),
      };

      // Générer les messages contextuels
      const message = this.generatePredictionMessage(predictions, currentLevel, confidence);
      const encouragement = this.generateEncouragement(averageDailyXp, trendDirection, confidence);

      return {
        current: {
          level: currentLevel,
          xp: currentXp,
          xpToNext,
          totalXp: currentData.total_xp_earned,
        },
        predictions,
        confidence,
        averageDailyXp,
        trendDirection,
        message,
        encouragement,
      };
    } catch (error) {
      logger.error('GAMIFICATION_PREDICTION', 'Error calculating universal prediction', { userId, error });
      return null;
    }
  }

  /**
   * Calculer la tendance XP sur l'historique
   */
  private calculateXpTrend(history: any[]): {
    averageDailyXp: number;
    trendDirection: 'increasing' | 'stable' | 'decreasing';
  } {
    if (history.length === 0) {
      return { averageDailyXp: 0, trendDirection: 'stable' };
    }

    // Grouper par jour et calculer total quotidien
    const dailyTotals: Record<string, number> = {};
    history.forEach(entry => {
      const date = entry.created_at.split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + entry.final_xp;
    });

    const days = Object.keys(dailyTotals).sort();
    const xpValues = days.map(day => dailyTotals[day]);

    // Moyenne quotidienne
    const totalXp = xpValues.reduce((sum, xp) => sum + xp, 0);
    const averageDailyXp = Math.round(totalXp / days.length);

    // Calculer la tendance (première moitié vs deuxième moitié)
    if (days.length >= 6) {
      const halfPoint = Math.floor(days.length / 2);
      const firstHalf = xpValues.slice(0, halfPoint);
      const secondHalf = xpValues.slice(halfPoint);

      const avgFirst = firstHalf.reduce((sum, xp) => sum + xp, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, xp) => sum + xp, 0) / secondHalf.length;

      const diff = avgSecond - avgFirst;
      const threshold = avgFirst * 0.2; // 20% de différence

      if (diff > threshold) {
        return { averageDailyXp, trendDirection: 'increasing' };
      } else if (diff < -threshold) {
        return { averageDailyXp, trendDirection: 'decreasing' };
      }
    }

    return { averageDailyXp, trendDirection: 'stable' };
  }

  /**
   * Calculer le niveau de confiance de la prédiction
   */
  private calculateConfidence(
    history: any[],
    averageDailyXp: number
  ): 'low' | 'medium' | 'high' {
    // Facteurs de confiance:
    // 1. Nombre de jours d'activité
    // 2. Régularité de l'activité
    // 3. Volume XP moyen

    const dailyTotals: Record<string, number> = {};
    history.forEach(entry => {
      const date = entry.created_at.split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + entry.final_xp;
    });

    const activeDays = Object.keys(dailyTotals).length;
    const xpValues = Object.values(dailyTotals);

    // Calculer l'écart-type pour mesurer la régularité
    const mean = xpValues.reduce((sum, xp) => sum + xp, 0) / xpValues.length;
    const variance = xpValues.reduce((sum, xp) => sum + Math.pow(xp - mean, 2), 0) / xpValues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;

    // Scoring
    let confidenceScore = 0;

    // Points pour nombre de jours actifs
    if (activeDays >= 20) confidenceScore += 3;
    else if (activeDays >= 10) confidenceScore += 2;
    else if (activeDays >= 5) confidenceScore += 1;

    // Points pour régularité (coefficient de variation faible = régulier)
    if (coefficientOfVariation < 0.3) confidenceScore += 3;
    else if (coefficientOfVariation < 0.5) confidenceScore += 2;
    else if (coefficientOfVariation < 0.7) confidenceScore += 1;

    // Points pour volume XP
    if (averageDailyXp >= 100) confidenceScore += 2;
    else if (averageDailyXp >= 50) confidenceScore += 1;

    // Déterminer confiance
    if (confidenceScore >= 6) return 'high';
    if (confidenceScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Prédire le niveau futur selon XP gagné
   */
  private predictLevel(
    currentLevel: number,
    currentXp: number,
    additionalXp: number,
    levels: any[]
  ): PredictionData {
    let level = currentLevel;
    let xp = currentXp + additionalXp;

    // Trouver le niveau correspondant au XP total
    for (const levelData of levels) {
      if (xp >= levelData.xp_required) {
        level = levelData.level;
      } else {
        break;
      }
    }

    // Calculer XP restant après atteinte du niveau
    const levelData = levels.find(l => l.level === level);
    const remainingXp = levelData ? xp - levelData.xp_required : xp;

    // Calculer jours pour atteindre ce niveau (estimation)
    const daysToReach = additionalXp > 0 ? Math.round(additionalXp / (additionalXp / 30)) : 0;

    return {
      estimatedLevel: level,
      estimatedXp: Math.round(remainingXp),
      daysToReach,
      confidenceScore: 0.8, // Sera ajusté par le niveau de confiance global
    };
  }

  /**
   * Générer message de prédiction contextuel
   */
  private generatePredictionMessage(
    predictions: {
      days30: PredictionData;
      days60: PredictionData;
      days90: PredictionData;
    },
    currentLevel: number,
    confidence: 'low' | 'medium' | 'high'
  ): string {
    const { days30, days60, days90 } = predictions;

    // Messages selon confiance
    const prefix = {
      high: 'À ce rythme, tu atteindras',
      medium: 'Si tu maintiens ton activité, tu pourrais atteindre',
      low: 'Avec plus de régularité, tu pourrais viser',
    }[confidence];

    // Choisir la prédiction la plus pertinente
    if (days30.estimatedLevel > currentLevel) {
      return `${prefix} le niveau ${days30.estimatedLevel} dans 30 jours`;
    } else if (days60.estimatedLevel > currentLevel + 1) {
      return `${prefix} le niveau ${days60.estimatedLevel} dans 60 jours`;
    } else if (days90.estimatedLevel > currentLevel + 2) {
      return `${prefix} le niveau ${days90.estimatedLevel} dans 90 jours`;
    }

    return `Continue de gagner des points pour progresser plus rapidement!`;
  }

  /**
   * Générer message d'encouragement
   */
  private generateEncouragement(
    averageDailyXp: number,
    trendDirection: 'increasing' | 'stable' | 'decreasing',
    confidence: 'low' | 'medium' | 'high'
  ): string {
    if (trendDirection === 'increasing') {
      return `Excellent! Ton rythme de points s'améliore. Continue comme ça!`;
    }

    if (trendDirection === 'decreasing' && confidence !== 'low') {
      return `Ton rythme ralentit légèrement. Complète tes actions quotidiennes pour remonter!`;
    }

    if (averageDailyXp < 30) {
      return `Commence par scanner un repas et logger une activité chaque jour pour booster tes points!`;
    }

    if (averageDailyXp < 60) {
      return `Tu gagnes ${Math.round(averageDailyXp)} pts/jour. Complète toutes tes actions quotidiennes pour doubler!`;
    }

    if (confidence === 'low') {
      return `Plus d'activité régulière améliorerait ta progression. Vise 3 actions par jour!`;
    }

    return `Tu maintiens un excellent rythme de ${Math.round(averageDailyXp)} pts/jour!`;
  }


  /**
   * Obtenir message selon objectif utilisateur
   */
  getObjectiveSpecificMessage(
    objective: 'fat_loss' | 'muscle_gain' | 'recomp' | null,
    prediction: UniversalPrediction
  ): string {
    if (!objective) return prediction.message;

    const level30 = prediction.predictions.days30.estimatedLevel;

    const messages = {
      fat_loss: `Niveau ${level30} dans 30 jours = meilleure discipline nutrition pour ton déficit!`,
      muscle_gain: `Niveau ${level30} dans 30 jours = gains musculaires optimisés avec ton surplus!`,
      recomp: `Niveau ${level30} dans 30 jours = recomposition corporelle maîtrisée!`,
    };

    return messages[objective] || prediction.message;
  }
}

export const gamificationUniversalPredictionService = new GamificationUniversalPredictionService();
