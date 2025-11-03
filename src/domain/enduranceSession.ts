/**
 * Endurance Session Domain Types
 * Core types for endurance training sessions (running, cycling, swimming, triathlon, cardio)
 */

export type EnduranceDiscipline = 'running' | 'cycling' | 'swimming' | 'triathlon' | 'cardio';

export type HeartRateZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';

export type EnduranceBlockType = 'warmup' | 'continuous' | 'intervals' | 'tempo' | 'cooldown';

export type IntervalPhaseType = 'work' | 'rest';

export interface HeartRateZoneConfig {
  zone: HeartRateZone;
  label: string;
  description: string;
  minPercent: number;
  maxPercent: number;
  color: string;
}

export interface EnduranceBlock {
  id: string;
  type: EnduranceBlockType;
  name: string;
  description?: string;
  duration: number;
  distance?: number;
  targetZone: string;
  targetPace?: string;
  targetHR?: string;
  targetPower?: string;
  targetCadence?: string;
  intervals?: {
    work: {
      duration: number;
      intensity: string;
      pace?: string;
      hr?: string;
    };
    rest: {
      duration: number;
      intensity: string;
      type: string;
    };
    repeats: number;
  };
  cues?: string[];
  coachNotes?: string;
  rpeTarget: number;
}

export interface EnduranceSessionPrescription {
  sessionName: string;
  sessionSummary?: string;
  discipline: EnduranceDiscipline;
  durationTarget: number;
  distanceTarget?: number;
  focusZones?: string[];
  warmup?: {
    duration: number;
    description: string;
    instructions: string;
    targetZone: string;
    targetHR?: string;
  };
  mainWorkout?: EnduranceBlock[];
  cooldown?: {
    duration: number;
    description?: string;
    instructions: string;
    targetZone: string;
    dynamicDrills?: string[];
  };
  metrics?: {
    estimatedTSS?: number;
    estimatedCalories?: number;
    estimatedAvgHR?: number;
    estimatedAvgPace?: string;
    estimatedAvgPower?: string;
  };
  coachRationale?: string;
  nutritionAdvice?: string;
  recoveryAdvice?: string;
}

export interface EnduranceSessionState {
  phase: 'PRE_SESSION_BRIEFING' | 'WARMUP' | 'BLOCK_TRANSITION' | 'CONTINUOUS_ACTIVE' |
         'INTERVAL_WORK' | 'INTERVAL_REST' | 'TEMPO_ACTIVE' | 'COOLDOWN' | 'PAUSED' | 'COMPLETED';
  currentBlockIndex: number;
  currentIntervalIndex: number;
  currentIntervalRepeat: number;
  sessionTime: number;
  blockTime: number;
  intervalTime: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface EnduranceBlockTracking {
  blockId: string;
  sessionId: string;
  blockIndex: number;
  blockType: EnduranceBlockType;
  blockName: string;
  durationTarget: number;
  durationActual?: number;
  zoneTarget: string;
  avgHeartRate?: number;
  rpe?: number;
  completed: boolean;
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface EnduranceIntervalTracking {
  intervalId: string;
  blockId: string;
  intervalIndex: number;
  phaseType: IntervalPhaseType;
  durationTarget: number;
  durationActual?: number;
  zoneTarget: string;
  avgHeartRate?: number;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface EnduranceSessionMetrics {
  totalDuration: number;
  totalDistance?: number;
  avgHeartRate?: number;
  estimatedTSS?: number;
  estimatedCalories?: number;
  zonesDistribution: Record<HeartRateZone, number>;
  blocksCompleted: number;
  intervalsCompleted: number;
}

export interface EnduranceSessionFeedback {
  sessionId: string;
  rpeGlobal: number;
  zonesRespected: 'yes' | 'partially' | 'no';
  hydrationOk: boolean;
  nutritionOk: boolean;
  fatigueLevel: 'low' | 'medium' | 'high';
  notes?: string;
  achievements?: string[];
}

export interface DisciplineConfig {
  discipline: EnduranceDiscipline;
  label: string;
  icon: string;
  color: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  technicalCues: string[];
}

export const HEART_RATE_ZONES: Record<HeartRateZone, HeartRateZoneConfig> = {
  Z1: {
    zone: 'Z1',
    label: 'Récupération Active',
    description: 'Très facile, conversation fluide',
    minPercent: 50,
    maxPercent: 60,
    color: '#10B981', // green
  },
  Z2: {
    zone: 'Z2',
    label: 'Endurance Fondamentale',
    description: 'Facile, respiration confortable',
    minPercent: 60,
    maxPercent: 70,
    color: '#22C55E', // light green
  },
  Z3: {
    zone: 'Z3',
    label: 'Tempo/Seuil Aérobie',
    description: 'Modérément difficile, "comfortably hard"',
    minPercent: 70,
    maxPercent: 80,
    color: '#F59E0B', // amber
  },
  Z4: {
    zone: 'Z4',
    label: 'Seuil Lactique',
    description: 'Difficile, conversation impossible',
    minPercent: 80,
    maxPercent: 90,
    color: '#F97316', // orange
  },
  Z5: {
    zone: 'Z5',
    label: 'VO2Max',
    description: 'Très difficile à maximal',
    minPercent: 90,
    maxPercent: 100,
    color: '#EF4444', // red
  },
};

export const DISCIPLINE_CONFIGS: Record<EnduranceDiscipline, DisciplineConfig> = {
  running: {
    discipline: 'running',
    label: 'Course à pied',
    icon: 'Footprints',
    color: '#10B981',
    primaryMetric: 'Allure (min/km)',
    secondaryMetrics: ['Cadence (pas/min)', 'Distance', 'Zone FC'],
    technicalCues: [
      'Cadence haute, foulées légères',
      'Relâche les épaules',
      'Regarde devant toi',
      'Respire profondément',
    ],
  },
  cycling: {
    discipline: 'cycling',
    label: 'Cyclisme',
    icon: 'Bike',
    color: '#F59E0B',
    primaryMetric: 'Puissance (watts)',
    secondaryMetrics: ['Cadence (RPM)', 'Distance', 'Zone FC'],
    technicalCues: [
      'Cadence 85-95 RPM optimale',
      'Reste aéro, dos plat',
      'Pédalage fluide et rond',
      'Gestion de l\'effort',
    ],
  },
  swimming: {
    discipline: 'swimming',
    label: 'Natation',
    icon: 'Waves',
    color: '#06B6D4',
    primaryMetric: 'Allure (/100m)',
    secondaryMetrics: ['Stroke count', 'Distance', 'Zone effort'],
    technicalCues: [
      'Allonge ton bras, glisse',
      'Expire sous l\'eau',
      'Rotation du corps',
      'Jambes équilibrées',
    ],
  },
  triathlon: {
    discipline: 'triathlon',
    label: 'Triathlon',
    icon: 'Trophy',
    color: '#8B5CF6',
    primaryMetric: 'Discipline actuelle',
    secondaryMetrics: ['Temps total', 'Transitions', 'Zone FC'],
    technicalCues: [
      'Gestion des transitions',
      'Économie d\'énergie',
      'Nutrition et hydratation',
      'Adaptation multi-sports',
    ],
  },
  cardio: {
    discipline: 'cardio',
    label: 'Cardio général',
    icon: 'Heart',
    color: '#EF4444',
    primaryMetric: 'Zone cardiaque',
    secondaryMetrics: ['Temps', 'Calories', 'Intensité'],
    technicalCues: [
      'Respiration contrôlée',
      'Intensité adaptée',
      'Variations d\'effort',
      'Écoute du corps',
    ],
  },
};

export function calculateHeartRateZone(heartRate: number, maxHeartRate: number): HeartRateZone {
  const percentage = (heartRate / maxHeartRate) * 100;

  if (percentage < 60) return 'Z1';
  if (percentage < 70) return 'Z2';
  if (percentage < 80) return 'Z3';
  if (percentage < 90) return 'Z4';
  return 'Z5';
}

export function calculateMaxHeartRate(age: number): number {
  return 220 - age;
}

export function getZoneHeartRateRange(zone: HeartRateZone, maxHeartRate: number): { min: number; max: number } {
  const config = HEART_RATE_ZONES[zone];
  return {
    min: Math.round((config.minPercent / 100) * maxHeartRate),
    max: Math.round((config.maxPercent / 100) * maxHeartRate),
  };
}

export function estimateTSS(durationMinutes: number, averageIntensity: number): number {
  const intensityFactor = averageIntensity / 100;
  const durationHours = durationMinutes / 60;
  return Math.round(durationHours * intensityFactor * intensityFactor * 100);
}

export function estimateCalories(durationMinutes: number, weight: number, averageZone: number): number {
  const metValues: Record<number, number> = {
    1: 3.5,
    2: 5.0,
    3: 7.5,
    4: 9.5,
    5: 12.0,
  };

  const met = metValues[averageZone] || 5.0;
  const durationHours = durationMinutes / 60;
  return Math.round(met * weight * durationHours);
}
