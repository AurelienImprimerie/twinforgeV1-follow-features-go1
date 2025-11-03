/**
 * Fasting Phases Module
 * Defines metabolic phases during intermittent fasting
 */

export interface FastingPhase {
  id: string;
  name: string;
  startHours: number;
  endHours: number;
  durationRange: [number, number]; // [startHours, endHours] for compatibility
  description: string;
  benefits: string[];
  color: string;
  icon: string;
  metabolicState: string;
  caloriesBurnRate: 'low' | 'medium' | 'high' | 'very_high';
}

/**
 * Metabolic phases during fasting
 */
export const FASTING_PHASES: FastingPhase[] = [
  {
    id: 'anabolic',
    name: 'Phase Anabolique',
    startHours: 0,
    endHours: 4,
    durationRange: [0, 4],
    description: 'Digestion et absorption des nutriments',
    benefits: [
      'Pic d\'insuline',
      'Stockage des nutriments',
      'Anabolisme musculaire'
    ],
    color: '#10B981',
    icon: 'Sprout',
    metabolicState: 'Anabolisme',
    caloriesBurnRate: 'low'
  },
  {
    id: 'postabsorptive',
    name: 'Phase Post-Absorptive',
    startHours: 4,
    endHours: 8,
    durationRange: [4, 8],
    description: 'Épuisement du glucose sanguin',
    benefits: [
      'Transition métabolique',
      'Début du catabolisme',
      'Utilisation des réserves de glycogène'
    ],
    color: '#F59E0B',
    icon: 'BatteryCharging',
    metabolicState: 'Transition',
    caloriesBurnRate: 'medium'
  },
  {
    id: 'gluconeogenesis',
    name: 'Gluconéogenèse',
    startHours: 8,
    endHours: 12,
    durationRange: [8, 12],
    description: 'Production de glucose à partir des protéines',
    benefits: [
      'Synthèse de glucose',
      'Épargne musculaire progressive',
      'Début de la cétose'
    ],
    color: '#EF4444',
    icon: 'Flame',
    metabolicState: 'Gluconéogenèse',
    caloriesBurnRate: 'medium'
  },
  {
    id: 'ketosis',
    name: 'Cétose',
    startHours: 12,
    endHours: 18,
    durationRange: [12, 18],
    description: 'Utilisation des graisses comme source d\'énergie',
    benefits: [
      'Production de cétones',
      'Combustion des graisses',
      'Clarté mentale',
      'Énergie stable'
    ],
    color: '#8B5CF6',
    icon: 'Zap',
    metabolicState: 'Cétose',
    caloriesBurnRate: 'high'
  },
  {
    id: 'deep_ketosis',
    name: 'Cétose Profonde',
    startHours: 18,
    endHours: 24,
    durationRange: [18, 24],
    description: 'Optimisation de la combustion des graisses',
    benefits: [
      'Autophagie cellulaire',
      'Régénération cellulaire',
      'Maximisation de la perte de graisse',
      'Boost de l\'hormone de croissance'
    ],
    color: '#EC4899',
    icon: 'Sparkles',
    metabolicState: 'Cétose Profonde',
    caloriesBurnRate: 'very_high'
  },
  {
    id: 'extended',
    name: 'Jeûne Étendu',
    startHours: 24,
    endHours: Infinity,
    durationRange: [24, Infinity],
    description: 'Bénéfices thérapeutiques avancés',
    benefits: [
      'Autophagie maximale',
      'Réparation tissulaire profonde',
      'Régénération du système immunitaire',
      'Neurogenèse'
    ],
    color: '#06B6D4',
    icon: 'Dna',
    metabolicState: 'Jeûne Étendu',
    caloriesBurnRate: 'very_high'
  }
];

/**
 * Get current fasting phase based on elapsed hours
 */
export function getCurrentFastingPhase(elapsedHours: number): FastingPhase {
  for (const phase of FASTING_PHASES) {
    if (elapsedHours >= phase.startHours && elapsedHours < phase.endHours) {
      return phase;
    }
  }

  // Return last phase if beyond all ranges
  return FASTING_PHASES[FASTING_PHASES.length - 1];
}

/**
 * Get progress percentage within current phase
 */
export function getPhaseProgress(elapsedHours: number, phase?: FastingPhase): number {
  const currentPhase = phase || getCurrentFastingPhase(elapsedHours);

  if (currentPhase.endHours === Infinity) {
    return 100;
  }

  const phaseDuration = currentPhase.endHours - currentPhase.startHours;
  const timeInPhase = elapsedHours - currentPhase.startHours;

  return Math.min(100, Math.max(0, (timeInPhase / phaseDuration) * 100));
}

/**
 * Get the next fasting phase
 */
export function getNextFastingPhase(phase: FastingPhase): FastingPhase | null {
  const currentPhaseIndex = FASTING_PHASES.findIndex(p => p.id === phase.id);

  if (currentPhaseIndex === -1 || currentPhaseIndex === FASTING_PHASES.length - 1) {
    return null;
  }

  return FASTING_PHASES[currentPhaseIndex + 1];
}

/**
 * Estimate calories burned based on phase and user weight
 */
export function estimateCaloriesBurnedInPhase(
  phase: FastingPhase,
  elapsedHours: number,
  weightKg: number = 70
): number {
  const baseMetabolicRate = 1.2; // kcal per kg per hour (resting)

  // Multipliers for different phases
  const phaseMultipliers: Record<string, number> = {
    anabolic: 1.0,
    postabsorptive: 1.1,
    gluconeogenesis: 1.15,
    ketosis: 1.2,
    deep_ketosis: 1.25,
    extended: 1.3
  };

  const multiplier = phaseMultipliers[phase.id] || 1.0;
  const phaseDuration = phase.endHours === Infinity ?
    8 : // Assume 8 hours for extended phase calculation
    phase.endHours - phase.startHours;

  return Math.round(baseMetabolicRate * weightKg * phaseDuration * multiplier);
}

/**
 * Get motivational message based on current phase
 */
export function getMotivationalMessage(phase: FastingPhase, elapsedHours: number): string {
  const messages: Record<string, string> = {
    anabolic: 'La digestion est en cours. Votre corps assimile les nutriments.',
    postabsorptive: 'Transition métabolique en cours. Votre corps commence à puiser dans ses réserves.',
    gluconeogenesis: 'Vous entrez en gluconéogenèse ! La combustion des graisses commence.',
    ketosis: 'Bravo ! Vous êtes en cétose. Les bénéfices s\'intensifient.',
    deep_ketosis: 'Cétose profonde atteinte ! L\'autophagie cellulaire est maximale.',
    extended: 'Jeûne étendu : bénéfices thérapeutiques avancés en cours.'
  };

  return messages[phase.id] || 'Continuez votre excellent travail !';
}

/**
 * Calculate estimated time to reach next phase
 */
export function getTimeToNextPhase(elapsedHours: number): number | null {
  const nextPhase = getNextFastingPhase(elapsedHours);

  if (!nextPhase) {
    return null;
  }

  return nextPhase.startHours - elapsedHours;
}

/**
 * Format elapsed hours to readable string
 */
export function formatElapsedTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h${minutes}min`;
}
