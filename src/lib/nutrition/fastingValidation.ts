/**
 * Fasting Validation Module
 * Seuils scientifiques et validation des sessions de jeûne
 * Basé sur les recherches 2024 sur le jeûne intermittent
 */

/**
 * Seuils scientifiques pour le jeûne intermittent (en heures)
 * Références: Études 2024 sur les bénéfices métaboliques du jeûne
 */
export const FASTING_THRESHOLDS = {
  // Durée minimale pour enregistrer une session (évite les erreurs)
  MINIMUM_RECORDABLE: 0.5, // 30 minutes

  // Seuils scientifiques basés sur les bénéfices métaboliques
  MINIMUM_LIGHT: 8, // Début des bénéfices métaboliques légers
  MINIMUM_MODERATE: 12, // Bascule métabolique, début de la cétose
  MINIMUM_EFFECTIVE: 16, // Durée optimale scientifiquement prouvée (16:8)
  OPTIMAL_ADVANCED: 18, // Bénéfices avancés (cétose profonde)

  // Durée maximale sécuritaire sans supervision
  MAXIMUM_SAFE: 48, // Au-delà nécessite supervision médicale
} as const;

/**
 * Paliers de qualité basés sur le % de complétion du protocole
 */
export const QUALITY_THRESHOLDS = {
  EXCELLENT: 90, // ≥90% du protocole
  GOOD: 70, // 70-89% du protocole
  FAIR: 50, // 50-69% du protocole
  // < 50% = poor
} as const;

/**
 * Types de résultat de session
 */
export type FastingOutcomeQuality = 'excellent' | 'good' | 'fair' | 'poor';
export type FastingMetabolicPhase =
  | 'anabolic'
  | 'postabsorptive'
  | 'gluconeogenesis'
  | 'ketosis'
  | 'deep_ketosis'
  | 'extended';

/**
 * Résultat de validation d'une session
 */
export interface FastingValidationResult {
  isValid: boolean;
  canSave: boolean;
  isScientificallyValid: boolean;
  outcomeQuality: FastingOutcomeQuality | null;
  completionPercentage: number;
  metabolicPhaseReached: FastingMetabolicPhase;
  warnings: string[];
  recommendations: string[];
  benefitsMissed?: string[];
  timeToNextThreshold?: {
    hours: number;
    threshold: keyof typeof FASTING_THRESHOLDS;
    benefits: string[];
  };
}

/**
 * Valider une session de jeûne
 */
export function validateFastingSession(
  actualDurationHours: number,
  targetHours: number
): FastingValidationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const benefitsMissed: string[] = [];

  // Vérification durée minimale enregistrable
  const canSave = actualDurationHours >= FASTING_THRESHOLDS.MINIMUM_RECORDABLE;
  if (!canSave) {
    warnings.push('La durée est trop courte pour être enregistrée (minimum 30 minutes)');
  }

  // Vérification durée maximale sécuritaire
  if (actualDurationHours >= FASTING_THRESHOLDS.MAXIMUM_SAFE) {
    warnings.push('Attention : jeûne prolongé. Supervision médicale recommandée au-delà de 48h.');
  }

  // Calcul du % de complétion
  const completionPercentage = (actualDurationHours / targetHours) * 100;

  // Détermination de la qualité
  let outcomeQuality: FastingOutcomeQuality | null = null;
  if (canSave) {
    if (completionPercentage >= QUALITY_THRESHOLDS.EXCELLENT) {
      outcomeQuality = 'excellent';
    } else if (completionPercentage >= QUALITY_THRESHOLDS.GOOD) {
      outcomeQuality = 'good';
    } else if (completionPercentage >= QUALITY_THRESHOLDS.FAIR) {
      outcomeQuality = 'fair';
    } else {
      outcomeQuality = 'poor';
    }
  }

  // Validation scientifique
  const isScientificallyValid = actualDurationHours >= FASTING_THRESHOLDS.MINIMUM_LIGHT;

  // Phase métabolique atteinte
  const metabolicPhaseReached = determineMetabolicPhase(actualDurationHours);

  // Recommandations basées sur la durée
  if (actualDurationHours < FASTING_THRESHOLDS.MINIMUM_LIGHT) {
    recommendations.push(
      `Visez au moins ${FASTING_THRESHOLDS.MINIMUM_LIGHT}h pour des bénéfices métaboliques significatifs`
    );
    benefitsMissed.push('Bascule métabolique non atteinte');
    benefitsMissed.push('Combustion des graisses limitée');
  } else if (actualDurationHours < FASTING_THRESHOLDS.MINIMUM_MODERATE) {
    recommendations.push(
      `Atteignez ${FASTING_THRESHOLDS.MINIMUM_MODERATE}h pour entrer en cétose`
    );
    benefitsMissed.push('Cétose non atteinte');
    benefitsMissed.push('Autophagie limitée');
  } else if (actualDurationHours < FASTING_THRESHOLDS.MINIMUM_EFFECTIVE) {
    recommendations.push(
      `Visez ${FASTING_THRESHOLDS.MINIMUM_EFFECTIVE}h pour des bénéfices optimaux`
    );
    benefitsMissed.push('Autophagie profonde non atteinte');
  }

  // Calcul du temps jusqu'au prochain seuil
  let timeToNextThreshold: FastingValidationResult['timeToNextThreshold'];
  if (actualDurationHours < FASTING_THRESHOLDS.MINIMUM_LIGHT) {
    timeToNextThreshold = {
      hours: FASTING_THRESHOLDS.MINIMUM_LIGHT - actualDurationHours,
      threshold: 'MINIMUM_LIGHT',
      benefits: ['Début des bénéfices métaboliques', 'Gluconéogenèse active']
    };
  } else if (actualDurationHours < FASTING_THRESHOLDS.MINIMUM_MODERATE) {
    timeToNextThreshold = {
      hours: FASTING_THRESHOLDS.MINIMUM_MODERATE - actualDurationHours,
      threshold: 'MINIMUM_MODERATE',
      benefits: ['Entrée en cétose', 'Combustion des graisses optimale']
    };
  } else if (actualDurationHours < FASTING_THRESHOLDS.MINIMUM_EFFECTIVE) {
    timeToNextThreshold = {
      hours: FASTING_THRESHOLDS.MINIMUM_EFFECTIVE - actualDurationHours,
      threshold: 'MINIMUM_EFFECTIVE',
      benefits: ['Bénéfices optimaux prouvés', 'Autophagie cellulaire maximale']
    };
  } else if (actualDurationHours < FASTING_THRESHOLDS.OPTIMAL_ADVANCED) {
    timeToNextThreshold = {
      hours: FASTING_THRESHOLDS.OPTIMAL_ADVANCED - actualDurationHours,
      threshold: 'OPTIMAL_ADVANCED',
      benefits: ['Cétose profonde', 'Régénération cellulaire avancée']
    };
  }

  return {
    isValid: canSave && !warnings.some(w => w.includes('trop courte')),
    canSave,
    isScientificallyValid,
    outcomeQuality,
    completionPercentage,
    metabolicPhaseReached,
    warnings,
    recommendations,
    benefitsMissed: benefitsMissed.length > 0 ? benefitsMissed : undefined,
    timeToNextThreshold
  };
}

/**
 * Déterminer la phase métabolique basée sur la durée
 */
export function determineMetabolicPhase(durationHours: number): FastingMetabolicPhase {
  if (durationHours >= 24) return 'extended';
  if (durationHours >= 18) return 'deep_ketosis';
  if (durationHours >= 12) return 'ketosis';
  if (durationHours >= 8) return 'gluconeogenesis';
  if (durationHours >= 4) return 'postabsorptive';
  return 'anabolic';
}

/**
 * Obtenir le message éducatif pour une durée donnée
 */
export function getEducationalMessage(durationHours: number): string {
  if (durationHours < FASTING_THRESHOLDS.MINIMUM_LIGHT) {
    return `Votre jeûne de ${durationHours.toFixed(1)}h est trop court pour des bénéfices métaboliques significatifs. Les études scientifiques 2024 montrent que les bénéfices commencent réellement à partir de ${FASTING_THRESHOLDS.MINIMUM_LIGHT}h.`;
  }
  if (durationHours < FASTING_THRESHOLDS.MINIMUM_MODERATE) {
    return `Bon début ! Votre jeûne de ${durationHours.toFixed(1)}h apporte des bénéfices métaboliques. Pour entrer en cétose et maximiser la combustion des graisses, visez ${FASTING_THRESHOLDS.MINIMUM_MODERATE}h.`;
  }
  if (durationHours < FASTING_THRESHOLDS.MINIMUM_EFFECTIVE) {
    return `Très bien ! Vous êtes en cétose. Pour atteindre les bénéfices optimaux scientifiquement prouvés, continuez jusqu'à ${FASTING_THRESHOLDS.MINIMUM_EFFECTIVE}h (protocole 16:8).`;
  }
  if (durationHours < FASTING_THRESHOLDS.OPTIMAL_ADVANCED) {
    return `Excellent ! Vous avez atteint la durée optimale de ${FASTING_THRESHOLDS.MINIMUM_EFFECTIVE}h. Les bénéfices métaboliques sont maximaux : autophagie, régénération cellulaire, clarté mentale.`;
  }
  return `Remarquable ! Votre jeûne de ${durationHours.toFixed(1)}h est en cétose profonde. Vous bénéficiez de tous les avantages du jeûne intermittent, incluant l'autophagie maximale et la régénération cellulaire avancée.`;
}

/**
 * Vérifier si une durée est suffisante pour être sauvegardée
 */
export function canSaveSession(durationHours: number): boolean {
  return durationHours >= FASTING_THRESHOLDS.MINIMUM_RECORDABLE;
}

/**
 * Vérifier si une durée atteint le seuil scientifique minimal
 */
export function isScientificallyValid(durationHours: number): boolean {
  return durationHours >= FASTING_THRESHOLDS.MINIMUM_LIGHT;
}

/**
 * Calculer le pourcentage de complétion
 */
export function calculateCompletionPercentage(
  actualHours: number,
  targetHours: number
): number {
  return Math.round((actualHours / targetHours) * 100 * 100) / 100;
}

/**
 * Obtenir la couleur du palier pour l'UI
 */
export function getThresholdColor(durationHours: number): string {
  if (durationHours >= FASTING_THRESHOLDS.OPTIMAL_ADVANCED) return '#8B5CF6'; // purple
  if (durationHours >= FASTING_THRESHOLDS.MINIMUM_EFFECTIVE) return '#22C55E'; // green
  if (durationHours >= FASTING_THRESHOLDS.MINIMUM_MODERATE) return '#06B6D4'; // cyan
  if (durationHours >= FASTING_THRESHOLDS.MINIMUM_LIGHT) return '#F59E0B'; // amber
  return '#EF4444'; // red
}

/**
 * Obtenir le label du palier pour l'UI
 */
export function getThresholdLabel(durationHours: number): string {
  if (durationHours >= FASTING_THRESHOLDS.OPTIMAL_ADVANCED) return 'Cétose Profonde';
  if (durationHours >= FASTING_THRESHOLDS.MINIMUM_EFFECTIVE) return 'Optimal Scientifique';
  if (durationHours >= FASTING_THRESHOLDS.MINIMUM_MODERATE) return 'Cétose Active';
  if (durationHours >= FASTING_THRESHOLDS.MINIMUM_LIGHT) return 'Bénéfices Métaboliques';
  return 'Trop Court';
}
