/**
 * Step 5 Recommendation Logic
 * Configuration and business logic for determining next action recommendations
 */

export const RECOMMENDATION_THRESHOLDS = {
  DELOAD_RPE: 8.5,
  TEST_INTERVAL_SESSIONS: 4,
  UPGRADE_CONSISTENCY_SESSIONS: 3,
  RECOVERY_HOURS_MIN: 48,
  RECOVERY_HOURS_MAX: 72,
  HIGH_FATIGUE_ENERGY: 4,
  OPTIMAL_RPE_MIN: 7,
  OPTIMAL_RPE_MAX: 8,
  HIGH_VOLUME_MULTIPLIER: 1.2
} as const;

export const RECOVERY_COLORS = {
  CRITICAL: '#EF4444',    // 0-50%
  WARNING: '#F59E0B',     // 51-75%
  GOOD: '#EAB308',        // 76-90%
  OPTIMAL: '#22C55E'      // 91-100%
} as const;

export type RecommendationType =
  | 'next_session'
  | 'test'
  | 'upgrade'
  | 'deload'
  | 'active_recovery';

export interface RecommendationContext {
  sessionFeedback: any;
  preparerData: any | null;
  userStats: {
    sessionsSinceTest: number;
    consecutiveSessions: number;
    avgRecentRpe: number;
    avgRecentTechnique: number;
    totalSessions: number;
  };
}

export interface Recommendation {
  type: RecommendationType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  recommendedDate: Date | null;
  confidence: number;
  reasoning: string[];
}

/**
 * Determine the next recommended action based on session data and user stats
 */
export const determineNextAction = (context: RecommendationContext): Recommendation => {
  const { sessionFeedback, preparerData, userStats } = context;
  const { overallRpe } = sessionFeedback;
  const { sessionsSinceTest, consecutiveSessions, avgRecentRpe, avgRecentTechnique } = userStats;

  // Priority 1: Deload if high RPE or fatigue
  if (overallRpe >= RECOMMENDATION_THRESHOLDS.DELOAD_RPE ||
      (preparerData && preparerData.energyLevel <= RECOMMENDATION_THRESHOLDS.HIGH_FATIGUE_ENERGY && preparerData.hasFatigue)) {
    const recommendedDate = new Date();
    recommendedDate.setHours(recommendedDate.getHours() + RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MAX);

    return {
      type: 'deload',
      title: 'Semaine de Récupération',
      subtitle: `Dans ${RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MAX}h minimum`,
      description: 'Ton corps a besoin de récupérer. Programme une semaine allégée pour revenir plus fort.',
      icon: 'Heart',
      color: '#F59E0B',
      recommendedDate,
      confidence: 0.9,
      reasoning: [
        `RPE élevé (${overallRpe}/10)`,
        'Fatigue détectée',
        'Récupération prioritaire'
      ]
    };
  }

  // Priority 2: Test if interval reached
  if (sessionsSinceTest >= RECOMMENDATION_THRESHOLDS.TEST_INTERVAL_SESSIONS) {
    const recommendedDate = new Date();
    recommendedDate.setHours(recommendedDate.getHours() + RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MIN);

    return {
      type: 'test',
      title: 'Test Étalon',
      subtitle: 'Mesure tes progrès',
      description: `${sessionsSinceTest} séances complétées. C\'est le moment idéal pour tester ta force maximale.`,
      icon: 'Star',
      color: '#EAB308',
      recommendedDate,
      confidence: 0.85,
      reasoning: [
        `${sessionsSinceTest} séances depuis dernier test`,
        'Progression à valider',
        'Benchmark recommandé'
      ]
    };
  }

  // Priority 3: Level upgrade if consistent progression
  if (consecutiveSessions >= RECOMMENDATION_THRESHOLDS.UPGRADE_CONSISTENCY_SESSIONS &&
      avgRecentRpe >= RECOMMENDATION_THRESHOLDS.OPTIMAL_RPE_MIN &&
      avgRecentRpe <= RECOMMENDATION_THRESHOLDS.OPTIMAL_RPE_MAX &&
      avgRecentTechnique >= 8) {
    const recommendedDate = new Date();
    recommendedDate.setHours(recommendedDate.getHours() + RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MIN);

    return {
      type: 'upgrade',
      title: 'Passage de Palier',
      subtitle: 'Prêt pour le niveau suivant',
      description: 'Ta constance et ta technique sont excellentes. Passons au niveau supérieur !',
      icon: 'TrendingUp',
      color: '#8B5CF6',
      recommendedDate,
      confidence: 0.8,
      reasoning: [
        `${consecutiveSessions} séances consécutives`,
        `RPE optimal moyen (${avgRecentRpe.toFixed(1)}/10)`,
        `Technique excellente (${avgRecentTechnique.toFixed(1)}/10)`
      ]
    };
  }

  // Priority 4: Active recovery if pain or injury
  if (preparerData && preparerData.hasPain) {
    const recommendedDate = new Date();
    recommendedDate.setHours(recommendedDate.getHours() + RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MAX);

    return {
      type: 'active_recovery',
      title: 'Récupération Active',
      subtitle: 'Gestion de la douleur',
      description: 'Douleur signalée. Séance de récupération douce recommandée avec exercices adaptés.',
      icon: 'Activity',
      color: '#10B981',
      recommendedDate,
      confidence: 0.95,
      reasoning: [
        'Douleur signalée',
        'Prévention des blessures',
        'Récupération active recommandée'
      ]
    };
  }

  // Default: Next regular session
  const recommendedDate = new Date();
  recommendedDate.setHours(recommendedDate.getHours() + RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MIN);

  return {
    type: 'next_session',
    title: 'Prochaine Séance d\'Entraînement',
    subtitle: `Dans ${RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MIN}h`,
    description: 'Continue sur ta lancée ! Ton corps est prêt pour une nouvelle séance progressive.',
    icon: 'Dumbbell',
    color: '#22C55E',
    recommendedDate,
    confidence: 0.75,
    reasoning: [
      'Récupération standard',
      'Progression régulière',
      'Continuité recommandée'
    ]
  };
};

/**
 * Calculate recovery percentage based on time elapsed and session intensity
 */
export const calculateRecoveryPercentage = (
  lastSessionDate: Date,
  lastSessionRpe: number,
  currentDate: Date = new Date()
): { muscular: number; systemic: number } => {
  const hoursElapsed = (currentDate.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60);

  // Base recovery rate (faster for lower RPE)
  const baseRecoveryHours = RECOMMENDATION_THRESHOLDS.RECOVERY_HOURS_MIN;
  const rpeMultiplier = 1 + ((lastSessionRpe - 5) / 10); // 1.0 for RPE 5, 1.5 for RPE 10
  const adjustedRecoveryHours = baseRecoveryHours * rpeMultiplier;

  // Muscular recovery (faster)
  const muscularRecoveryRate = hoursElapsed / adjustedRecoveryHours;
  const muscular = Math.min(100, Math.round(muscularRecoveryRate * 100));

  // Systemic recovery (slightly faster)
  const systemicRecoveryRate = hoursElapsed / (adjustedRecoveryHours * 0.8);
  const systemic = Math.min(100, Math.round(systemicRecoveryRate * 100));

  return { muscular, systemic };
};

/**
 * Get color for recovery percentage
 */
export const getRecoveryColor = (percentage: number): string => {
  if (percentage >= 91) return RECOVERY_COLORS.OPTIMAL;
  if (percentage >= 76) return RECOVERY_COLORS.GOOD;
  if (percentage >= 51) return RECOVERY_COLORS.WARNING;
  return RECOVERY_COLORS.CRITICAL;
};

/**
 * Get recovery status label
 */
export const getRecoveryLabel = (percentage: number): string => {
  if (percentage >= 91) return 'Optimal';
  if (percentage >= 76) return 'Presque prêt';
  if (percentage >= 51) return 'En cours';
  return 'Repos nécessaire';
};

/**
 * Calculate optimal session windows (morning and evening)
 */
export const calculateOptimalWindows = (nextSessionDate: Date): { morning: { start: Date; end: Date }; evening: { start: Date; end: Date } } => {
  const morningStart = new Date(nextSessionDate);
  morningStart.setHours(8, 0, 0, 0);

  const morningEnd = new Date(nextSessionDate);
  morningEnd.setHours(10, 0, 0, 0);

  const eveningStart = new Date(nextSessionDate);
  eveningStart.setHours(18, 0, 0, 0);

  const eveningEnd = new Date(nextSessionDate);
  eveningEnd.setHours(20, 0, 0, 0);

  return {
    morning: { start: morningStart, end: morningEnd },
    evening: { start: eveningStart, end: eveningEnd }
  };
};
