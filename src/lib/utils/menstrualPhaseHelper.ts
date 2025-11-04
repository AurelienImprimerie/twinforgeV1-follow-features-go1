/**
 * Menstrual Phase Helper
 * Shared utility functions for calculating menstrual cycle phases and providing context
 */

export type MenstrualPhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';
export type EnergyLevel = 'low' | 'moderate' | 'high' | 'peak';
export type MetabolicRate = 'reduced' | 'normal' | 'elevated';

export interface MenstrualPhaseData {
  currentPhase: MenstrualPhase;
  dayInCycle: number;
  cycleLength: number;
  cycleRegularity: 'regular' | 'irregular' | 'very_irregular';
  daysUntilNextPeriod: number;
  energyLevel: EnergyLevel;
  metabolicRate: MetabolicRate;
  phaseDescription: string;
}

/**
 * Calculate current menstrual phase from cycle data
 */
export function calculateMenstrualPhase(
  cycleStartDate: string,
  cycleLength: number,
  cycleRegularity: 'regular' | 'irregular' | 'very_irregular'
): MenstrualPhaseData | null {
  if (!cycleStartDate || !cycleLength) return null;

  const today = new Date();
  const lastPeriod = new Date(cycleStartDate);
  const dayInCycle = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // If cycle data is outdated (more than 2 cycles), return null
  if (dayInCycle > cycleLength * 2) return null;

  const ovulationDay = Math.floor(cycleLength / 2);
  const daysUntilNextPeriod = cycleLength - dayInCycle;

  let phase: MenstrualPhase;
  let energyLevel: EnergyLevel;
  let metabolicRate: MetabolicRate;
  let phaseDescription: string;

  if (dayInCycle <= 5) {
    phase = 'menstruation';
    energyLevel = 'low';
    metabolicRate = 'reduced';
    phaseDescription = 'Phase menstruelle en cours';
  } else if (dayInCycle < ovulationDay - 2) {
    phase = 'follicular';
    energyLevel = 'high';
    metabolicRate = 'elevated';
    phaseDescription = 'Énergie croissante, bon moment pour l\'entraînement';
  } else if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) {
    phase = 'ovulation';
    energyLevel = 'peak';
    metabolicRate = 'elevated';
    phaseDescription = 'Pic d\'énergie, performances maximales possibles';
  } else {
    phase = 'luteal';
    energyLevel = dayInCycle < cycleLength - 5 ? 'moderate' : 'low';
    metabolicRate = 'reduced';
    phaseDescription = 'Énergie décroissante, privilégiez la récupération';
  }

  return {
    currentPhase: phase,
    dayInCycle,
    cycleLength,
    cycleRegularity,
    daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod),
    energyLevel,
    metabolicRate,
    phaseDescription,
  };
}

/**
 * Get phase emoji for UI display
 */
export function getPhaseEmoji(phase: MenstrualPhase): string {
  const emojiMap: Record<MenstrualPhase, string> = {
    menstruation: '🔴',
    follicular: '🌱',
    ovulation: '✨',
    luteal: '🌙',
  };
  return emojiMap[phase];
}

/**
 * Get phase color for UI styling
 */
export function getPhaseColor(phase: MenstrualPhase): string {
  const colorMap: Record<MenstrualPhase, string> = {
    menstruation: '#EF4444',
    follicular: '#10B981',
    ovulation: '#F59E0B',
    luteal: '#8B5CF6',
  };
  return colorMap[phase];
}

/**
 * Get nutrition recommendations for current phase
 */
export function getNutritionRecommendations(phase: MenstrualPhase): string[] {
  const recommendations: Record<MenstrualPhase, string[]> = {
    menstruation: [
      'Augmentez votre apport en fer (viandes rouges, lentilles, épinards)',
      'Consommez de la vitamine C pour l\'absorption du fer',
      'Magnésium pour réduire les crampes (chocolat noir, bananes)',
      'Restez bien hydratée',
    ],
    follicular: [
      'Protéines maigres pour la reconstruction',
      'Glucides complexes pour l\'énergie',
      'Légumes crucifères (brocoli, chou-fleur)',
      'Graines de lin pour l\'équilibre hormonal',
    ],
    ovulation: [
      'Aliments riches en antioxydants (baies, légumes colorés)',
      'Fibres pour la régulation hormonale',
      'Zinc (fruits de mer, graines de courge)',
      'Maintenez une alimentation équilibrée',
    ],
    luteal: [
      'Glucides complexes pour la sérotonine',
      'Magnésium (avocats, chocolat noir)',
      'Vitamine B6 (poulet, patates douces)',
      'Limitez le sel pour éviter la rétention d\'eau',
    ],
  };
  return recommendations[phase];
}

/**
 * Get training recommendations for current phase
 */
export function getTrainingRecommendations(phase: MenstrualPhase): string[] {
  const recommendations: Record<MenstrualPhase, string[]> = {
    menstruation: [
      'Privilégiez les exercices d\'intensité modérée',
      'Yoga, stretching, cardio léger',
      'Écoutez votre corps, le repos est OK',
      'Focus sur la récupération active',
    ],
    follicular: [
      'Phase optimale pour les entraînements intenses',
      'Excellent moment pour les PRs en force',
      'Tolérance élevée au volume et à l\'intensité',
      'Progressez sur vos objectifs',
    ],
    ovulation: [
      'Pic de performance attendu',
      'Coordination neuromusculaire optimale',
      'Bon timing pour tester vos limites',
      'Force maximale accessible',
    ],
    luteal: [
      'Maintenez plutôt que de progresser',
      'Priorisez la récupération',
      'Bon pour l\'endurance et le cardio modéré',
      'Augmentez les temps de repos entre séries',
    ],
  };
  return recommendations[phase];
}

/**
 * Get fasting recommendations for current phase
 */
export function getFastingRecommendations(phase: MenstrualPhase): string[] {
  const recommendations: Record<MenstrualPhase, string[]> = {
    menstruation: [
      'Jeûnes plus courts recommandés (12-14h)',
      'Soyez flexible avec votre fenêtre',
      'Priorité à l\'écoute de votre corps',
      'Breaking du jeûne OK si nécessaire',
    ],
    follicular: [
      'Phase optimale pour les jeûnes prolongés (16-18h)',
      'Meilleure tolérance hormonale',
      'Métabolisme favorable',
      'Bon timing pour OMAD si pratiqué',
    ],
    ovulation: [
      'Excellente adaptation au jeûne',
      'Jeûnes standards très bien tolérés',
      'Performance énergétique optimale',
      'Maintenez votre protocole habituel',
    ],
    luteal: [
      'Raccourcissez légèrement votre fenêtre (-1 à -2h)',
      'Sensibilité accrue possible',
      'Priorisez votre confort',
      'Variation naturelle de tolérance',
    ],
  };
  return recommendations[phase];
}

/**
 * Format phase data for AI context (used in edge functions)
 */
export function formatPhaseForAI(data: MenstrualPhaseData): string {
  return `
## CYCLE MENSTRUEL

Phase actuelle: ${data.currentPhase}
Jour du cycle: J${data.dayInCycle}/${data.cycleLength}
Régularité: ${data.cycleRegularity}
Prochaines règles dans: ${data.daysUntilNextPeriod} jours
Niveau d'énergie: ${data.energyLevel}
Métabolisme: ${data.metabolicRate}

${data.phaseDescription}
  `.trim();
}
