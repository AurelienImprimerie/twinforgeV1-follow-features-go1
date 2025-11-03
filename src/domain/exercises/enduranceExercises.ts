/**
 * Endurance Exercises Database
 * Comprehensive library of running, cycling, swimming, triathlon workouts
 */

export interface EnduranceWorkout {
  id: string;
  name: string;
  discipline: 'running' | 'cycling' | 'swimming' | 'triathlon';
  type: 'recovery' | 'easy' | 'tempo' | 'intervals' | 'long' | 'speed';
  zones: string[];
  description: string;
  benefits: string[];
  suitableFor: ('beginner' | 'intermediate' | 'advanced' | 'elite')[];
  estimatedTSS: number;
  durationMin: number;
  durationMax: number;
}

export const RUNNING_WORKOUTS: EnduranceWorkout[] = [
  {
    id: 'run-easy',
    name: 'Easy Run',
    discipline: 'running',
    type: 'easy',
    zones: ['Z1', 'Z2'],
    description: 'Course facile en zone aérobie, conversation fluide possible',
    benefits: ['Développement base aérobie', 'Récupération active', 'Économie de course'],
    suitableFor: ['beginner', 'intermediate', 'advanced', 'elite'],
    estimatedTSS: 45,
    durationMin: 30,
    durationMax: 60
  },
  {
    id: 'run-long',
    name: 'Long Run',
    discipline: 'running',
    type: 'long',
    zones: ['Z2'],
    description: 'Sortie longue en endurance fondamentale pour construire capacité aérobie',
    benefits: ['Augmentation capacité aérobie', 'Endurance musculaire', 'Adaptation métabolique'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 120,
    durationMin: 90,
    durationMax: 180
  },
  {
    id: 'run-tempo',
    name: 'Tempo Run',
    discipline: 'running',
    type: 'tempo',
    zones: ['Z3', 'Z4'],
    description: 'Allure soutenue "comfortably hard", seuil aérobie',
    benefits: ['Amélioration seuil lactique', 'Endurance à allure course', 'Mental'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 75,
    durationMin: 30,
    durationMax: 50
  },
  {
    id: 'run-threshold-intervals',
    name: 'Threshold Intervals',
    discipline: 'running',
    type: 'intervals',
    zones: ['Z4'],
    description: 'Intervalles au seuil lactique avec récupération active',
    benefits: ['Puissance seuil', 'Tolérance lactate', 'Vitesse soutenue'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 85,
    durationMin: 40,
    durationMax: 60
  },
  {
    id: 'run-vo2max-intervals',
    name: 'VO2Max Intervals',
    discipline: 'running',
    type: 'intervals',
    zones: ['Z5'],
    description: 'Intervalles courts haute intensité pour VO2Max',
    benefits: ['Capacité aérobie maximale', 'Puissance', 'Économie vitesse élevée'],
    suitableFor: ['advanced', 'elite'],
    estimatedTSS: 95,
    durationMin: 45,
    durationMax: 60
  },
  {
    id: 'run-fartlek',
    name: 'Fartlek',
    discipline: 'running',
    type: 'intervals',
    zones: ['Z2', 'Z4', 'Z5'],
    description: 'Jeu d\'allures spontané ou structuré',
    benefits: ['Adaptabilité', 'Mental', 'Variations allures'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 70,
    durationMin: 40,
    durationMax: 60
  },
  {
    id: 'run-hill-repeats',
    name: 'Hill Repeats',
    discipline: 'running',
    type: 'speed',
    zones: ['Z4', 'Z5'],
    description: 'Répétitions en côte pour force et puissance',
    benefits: ['Force spécifique', 'Puissance jambes', 'Technique montée'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 80,
    durationMin: 45,
    durationMax: 60
  }
];

export const CYCLING_WORKOUTS: EnduranceWorkout[] = [
  {
    id: 'bike-recovery',
    name: 'Recovery Ride',
    discipline: 'cycling',
    type: 'recovery',
    zones: ['Z1'],
    description: 'Sortie très facile pour récupération active',
    benefits: ['Circulation sanguine', 'Récupération', 'Mobilité'],
    suitableFor: ['beginner', 'intermediate', 'advanced', 'elite'],
    estimatedTSS: 30,
    durationMin: 30,
    durationMax: 60
  },
  {
    id: 'bike-endurance',
    name: 'Endurance Ride',
    discipline: 'cycling',
    type: 'easy',
    zones: ['Z2'],
    description: 'Sortie longue en endurance pour base aérobie',
    benefits: ['Capacité aérobie', 'Efficience pédalage', 'Endurance musculaire'],
    suitableFor: ['beginner', 'intermediate', 'advanced', 'elite'],
    estimatedTSS: 100,
    durationMin: 90,
    durationMax: 240
  },
  {
    id: 'bike-sweet-spot',
    name: 'Sweet Spot Intervals',
    discipline: 'cycling',
    type: 'tempo',
    zones: ['Z3', 'Z4'],
    description: 'Intervalles dans la zone optimale 88-94% FTP',
    benefits: ['Seuil FTP', 'Efficience énergétique', 'Meilleur ratio effort/fatigue'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 85,
    durationMin: 60,
    durationMax: 90
  },
  {
    id: 'bike-threshold',
    name: 'Threshold Intervals',
    discipline: 'cycling',
    type: 'intervals',
    zones: ['Z4'],
    description: 'Intervalles au seuil FTP',
    benefits: ['Puissance seuil', 'Tolérance lactate', 'Efficience haute puissance'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 90,
    durationMin: 60,
    durationMax: 90
  },
  {
    id: 'bike-vo2max',
    name: 'VO2Max Intervals',
    discipline: 'cycling',
    type: 'intervals',
    zones: ['Z5'],
    description: 'Intervalles courts haute puissance 105-120% FTP',
    benefits: ['VO2Max', 'Puissance maximale', 'Capacité efforts intenses'],
    suitableFor: ['advanced', 'elite'],
    estimatedTSS: 100,
    durationMin: 60,
    durationMax: 75
  },
  {
    id: 'bike-sprints',
    name: 'Sprint Intervals',
    discipline: 'cycling',
    type: 'speed',
    zones: ['Z5'],
    description: 'Sprints maximaux 10-30 secondes',
    benefits: ['Puissance neuromusculaire', 'Force explosive', 'Recrutement fibres'],
    suitableFor: ['advanced', 'elite'],
    estimatedTSS: 70,
    durationMin: 45,
    durationMax: 60
  }
];

export const SWIMMING_WORKOUTS: EnduranceWorkout[] = [
  {
    id: 'swim-technique',
    name: 'Technique Drills',
    discipline: 'swimming',
    type: 'easy',
    zones: ['Z1', 'Z2'],
    description: 'Éducatifs techniques pour améliorer nage',
    benefits: ['Technique', 'Coordination', 'Efficience nage'],
    suitableFor: ['beginner', 'intermediate', 'advanced', 'elite'],
    estimatedTSS: 40,
    durationMin: 30,
    durationMax: 60
  },
  {
    id: 'swim-endurance',
    name: 'Endurance Swim',
    discipline: 'swimming',
    type: 'easy',
    zones: ['Z2'],
    description: 'Nage continue en endurance aérobie',
    benefits: ['Endurance natation', 'Technique sous fatigue', 'Capacité aérobie'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 65,
    durationMin: 45,
    durationMax: 90
  },
  {
    id: 'swim-css',
    name: 'CSS Intervals',
    discipline: 'swimming',
    type: 'tempo',
    zones: ['Z3', 'Z4'],
    description: 'Intervalles à Critical Swim Speed',
    benefits: ['Seuil natation', 'Vitesse soutenue', 'Puissance bras'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 75,
    durationMin: 45,
    durationMax: 60
  },
  {
    id: 'swim-intervals',
    name: 'Speed Intervals',
    discipline: 'swimming',
    type: 'intervals',
    zones: ['Z4', 'Z5'],
    description: 'Séries rapides 50-200m avec repos',
    benefits: ['Vitesse natation', 'Puissance', 'Technique vitesse élevée'],
    suitableFor: ['advanced', 'elite'],
    estimatedTSS: 80,
    durationMin: 45,
    durationMax: 60
  },
  {
    id: 'swim-sprints',
    name: 'Sprint Sets',
    discipline: 'swimming',
    type: 'speed',
    zones: ['Z5'],
    description: 'Sprints maximaux 25-50m',
    benefits: ['Vitesse maximale', 'Puissance explosive', 'Turn speed'],
    suitableFor: ['advanced', 'elite'],
    estimatedTSS: 70,
    durationMin: 40,
    durationMax: 60
  }
];

export const TRIATHLON_WORKOUTS: EnduranceWorkout[] = [
  {
    id: 'tri-brick-basic',
    name: 'Brick Workout (Bike-Run)',
    discipline: 'triathlon',
    type: 'tempo',
    zones: ['Z3'],
    description: 'Enchaînement vélo-course pour habituer transition',
    benefits: ['Transition T2', 'Jambes lourdes', 'Spécifique triathlon'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 95,
    durationMin: 90,
    durationMax: 120
  },
  {
    id: 'tri-swim-bike',
    name: 'Swim-Bike Transition',
    discipline: 'triathlon',
    type: 'tempo',
    zones: ['Z2', 'Z3'],
    description: 'Natation suivie de vélo pour T1',
    benefits: ['Transition T1', 'Adaptation cardio', 'Gestion effort'],
    suitableFor: ['intermediate', 'advanced', 'elite'],
    estimatedTSS: 85,
    durationMin: 75,
    durationMax: 105
  },
  {
    id: 'tri-multisport',
    name: 'Full Multisport',
    discipline: 'triathlon',
    type: 'long',
    zones: ['Z2', 'Z3'],
    description: 'Nage-Vélo-Course enchaînés',
    benefits: ['Simulation course', 'Gestion fatigue cumulée', 'Transitions'],
    suitableFor: ['advanced', 'elite'],
    estimatedTSS: 140,
    durationMin: 120,
    durationMax: 180
  }
];

export const ALL_ENDURANCE_WORKOUTS = [
  ...RUNNING_WORKOUTS,
  ...CYCLING_WORKOUTS,
  ...SWIMMING_WORKOUTS,
  ...TRIATHLON_WORKOUTS
];

export function getWorkoutsByDiscipline(
  discipline: 'running' | 'cycling' | 'swimming' | 'triathlon'
): EnduranceWorkout[] {
  return ALL_ENDURANCE_WORKOUTS.filter(w => w.discipline === discipline);
}

export function getWorkoutsByLevel(
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite'
): EnduranceWorkout[] {
  return ALL_ENDURANCE_WORKOUTS.filter(w => w.suitableFor.includes(level));
}

export function getWorkoutsByType(
  type: EnduranceWorkout['type']
): EnduranceWorkout[] {
  return ALL_ENDURANCE_WORKOUTS.filter(w => w.type === type);
}

export function selectWorkout(
  discipline: 'running' | 'cycling' | 'swimming' | 'triathlon',
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite',
  intensity: 'recovery' | 'easy' | 'moderate' | 'hard',
  duration: number
): EnduranceWorkout | null {
  const typeMapping: Record<string, EnduranceWorkout['type'][]> = {
    'recovery': ['recovery'],
    'easy': ['easy', 'recovery'],
    'moderate': ['tempo', 'easy'],
    'hard': ['intervals', 'speed']
  };

  const candidateTypes = typeMapping[intensity] || ['easy'];

  const candidates = ALL_ENDURANCE_WORKOUTS.filter(w =>
    w.discipline === discipline &&
    w.suitableFor.includes(level) &&
    candidateTypes.includes(w.type) &&
    duration >= w.durationMin &&
    duration <= w.durationMax
  );

  if (candidates.length === 0) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
