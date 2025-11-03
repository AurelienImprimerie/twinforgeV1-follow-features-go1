/**
 * Functional Training & CrossTraining Domain Types
 * Type definitions for Functional, CrossFit, HIIT, and Circuit Training
 */

// ============================================================================
// WOD (Workout of the Day) Types
// ============================================================================

export type WodFormat =
  | 'amrap'        // As Many Rounds As Possible
  | 'forTime'      // Complete work as fast as possible
  | 'emom'         // Every Minute On the Minute
  | 'tabata'       // 8 rounds of 20sec work / 10sec rest
  | 'chipper'      // Long list of movements done once
  | 'ladder'       // Progressive increase/decrease pattern
  | 'other';       // Custom format

export type ScalingLevel =
  | 'rx'           // As prescribed (standard CrossFit weights/movements)
  | 'scaled'       // Modified weights, movements, or reps
  | 'foundations'; // Beginner-appropriate modifications

export type MovementCategory =
  | 'olympic'           // Olympic lifts (snatch, clean & jerk)
  | 'gymnastic'         // Bodyweight skills (muscle-ups, HSPU)
  | 'monostructural'    // Cardio (row, bike, ski, run)
  | 'weighted'          // Weighted movements (thrusters, wall balls)
  | 'bodyweight'        // Basic bodyweight (push-ups, burpees)
  | 'other';

export type BenchmarkType =
  | 'girl'    // Classic short intense WODs (Fran, Grace, etc.)
  | 'hero'    // Tribute WODs, often longer (Murph, DT, etc.)
  | 'custom'  // User-defined benchmarks
  | 'open'    // CrossFit Open workouts
  | 'games';  // CrossFit Games workouts

export type TechniqueLevel =
  | 'learning'    // Still learning the movement
  | 'developing'  // Can perform but needs work
  | 'proficient'  // Good technique, consistent
  | 'mastered';   // Expert level execution

export type MetabolicIntensity =
  | 'low'      // Recovery pace, conversational
  | 'moderate' // Sustainable, breathing heavy
  | 'high'     // Near max effort, limited speech
  | 'extreme'; // All-out, cannot sustain

export type ConsistencyRating =
  | 'excellent'    // No breaks, perfect pacing
  | 'good'         // Minor breaks, good overall
  | 'inconsistent' // Multiple breaks, struggling
  | 'poor';        // Major breaks, technique breakdown

// ============================================================================
// Functional Skill (Personal Records and Proficiency)
// ============================================================================

export interface FunctionalSkill {
  id: string;
  userId: string;
  movementName: string;
  movementCategory: MovementCategory;

  // PR tracking (use appropriate field based on movement type)
  prWeightKg: number;      // For weighted movements (e.g., 100kg clean)
  prReps: number;          // For bodyweight (e.g., 20 unbroken pull-ups)
  prTimeSeconds: number;   // For timed movements (e.g., 500m row in 90s)
  prDate?: string;

  // Technique and scaling
  techniqueLevel: TechniqueLevel;
  scalingUsed: ScalingLevel;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Benchmark WOD Tracking
// ============================================================================

export interface FunctionalBenchmark {
  id: string;
  userId: string;
  benchmarkName: string;        // e.g., "Fran", "Murph", "My Custom WOD"
  benchmarkType: BenchmarkType;
  wodFormat: WodFormat;
  wodDescription: string;       // Full WOD description

  // Best score tracking
  bestScore?: string;           // Human-readable (e.g., "3:45", "12 rounds + 5 reps")
  bestScoreNumeric?: number;    // For comparisons (seconds or total reps)
  scalingLevel: ScalingLevel;

  // Attempt tracking
  attemptCount: number;
  lastAttemptDate?: string;
  prDate?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WOD Session Data (per session detailed tracking)
// ============================================================================

export interface MovementPerformed {
  name: string;
  category: MovementCategory;
  sets?: number;
  reps?: number;
  weightKg?: number;
  distance?: number;       // For running, rowing (meters)
  calories?: number;       // For bike, ski erg
  timeSeconds?: number;    // For time-based movements
  notes?: string;
}

export interface ScalingModification {
  originalMovement: string;
  modifiedTo: string;
  reason: string;  // e.g., "Weight reduced", "Ring rows instead of pull-ups"
}

export interface FunctionalWodData {
  id: string;
  sessionId: string;
  userId: string;

  // WOD identification
  wodFormat: WodFormat;
  wodName?: string;  // If it's a named benchmark
  timeCapMinutes?: number;

  // Performance metrics (format-specific)
  roundsCompleted: number;       // For AMRAP, Chipper
  additionalReps: number;        // Reps beyond last full round
  completionTimeSeconds?: number; // For "For Time" WODs
  totalReps: number;
  caloriesBurned: number;

  // Movement details
  movementsPerformed: MovementPerformed[];
  scalingModifications: ScalingModification[];

  // Execution quality
  techniqueBreaks: number;  // Times had to stop due to technique issues
  averageHeartRate?: number;
  peakHeartRate?: number;
  perceivedDifficulty: number;  // 1-10
  metabolicIntensity: MetabolicIntensity;

  // Flags
  olympicLiftsPerformed: boolean;
  gymnasticSkillsPerformed: boolean;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Session Summary Analytics
// ============================================================================

export interface MovementsByCategory {
  olympic?: {
    movements: string[];
    totalVolumeKg: number;
    avgWeightKg: number;
  };
  gymnastic?: {
    movements: string[];
    totalReps: number;
    skillsAttempted: string[];
  };
  monostructural?: {
    movements: string[];
    totalCalories: number;
    totalDistanceMeters: number;
  };
  weighted?: {
    movements: string[];
    totalVolumeKg: number;
  };
  bodyweight?: {
    movements: string[];
    totalReps: number;
  };
}

export interface PrAchieved {
  movementName: string;
  prType: 'weight' | 'reps' | 'time' | 'benchmark';
  previousValue?: number | string;
  newValue: number | string;
  improvement?: string;  // e.g., "+10kg", "-15 seconds"
  celebrationLevel: 'minor' | 'major' | 'epic';
}

export interface FunctionalSessionData {
  id: string;
  sessionId: string;
  userId: string;

  // Volume metrics
  totalVolumeKg: number;
  olympicVolumeKg: number;
  gymnasticVolumeReps: number;
  monostructuralCalories: number;

  // Detailed breakdown
  movementsByCategory: MovementsByCategory;
  prsAchieved: PrAchieved[];

  // Quality metrics
  techniqueQualityScore: number;  // 1-10
  consistencyRating: ConsistencyRating;

  // Recovery recommendations
  recommendedRestHours: number;
  nextFocusAreas: string[];

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Functional Exercise Prescription (for AI generation)
// ============================================================================

export interface FunctionalExercise {
  id: string;
  name: string;
  variant?: string;
  category: MovementCategory;

  // Prescription (format-dependent)
  sets?: number;
  reps?: number | string;  // Can be "Max reps" or "10-15"
  weightKg?: number | string;  // Can be percentage like "70% 1RM"
  distanceMeters?: number;
  calories?: number;
  timeSeconds?: number;

  // Execution
  tempo?: string;
  rest?: number;  // Rest between sets or movements
  rpeTarget?: number;

  // Technique
  techniqueLevel: TechniqueLevel;
  scalingOptions: ScalingOption[];
  commonFaults: string[];
  executionCues: string[];

  // Safety
  safetyNotes: string[];
  prerequisites?: string[];

  // Metadata
  coachNotes: string;
  coachTips: string[];
}

export interface ScalingOption {
  level: ScalingLevel;
  modification: string;
  description: string;
}

// ============================================================================
// WOD Prescription (AI-generated workout)
// ============================================================================

export interface WodPrescription {
  sessionId: string;
  sessionName: string;
  type: string;
  category: 'functional-crosstraining';

  // WOD details
  wodFormat: WodFormat;
  wodName?: string;  // If it's a benchmark
  timeCapMinutes?: number;
  targetRounds?: number;  // For AMRAP suggestions
  targetTimeMinutes?: number;  // For "For Time" estimates

  // Session structure
  durationTarget: number;
  focus: string[];
  sessionSummary: string;

  warmup: {
    duration: number;
    isOptional: boolean;
    exercises: WarmupExercise[];
    notes: string;
  };

  // Main WOD
  exercises: FunctionalExercise[];
  wodStructure: string;  // e.g., "AMRAP 20min: 5-10-15 pattern"

  cooldown: {
    duration: number;
    exercises: string[];
    notes: string;
  };

  // Scaling guidance
  rxVersion: ExerciseVariation[];
  scaledVersion: ExerciseVariation[];
  foundationsVersion: ExerciseVariation[];

  // Metadata
  overallNotes: string;
  expectedRpe: number;
  expectedIntensity: MetabolicIntensity;
  coachRationale: string;
}

export interface WarmupExercise {
  id: string;
  name: string;
  duration?: number;
  sets?: number;
  reps?: number;
  instructions: string;
  targetAreas: string[];
}

export interface ExerciseVariation {
  movementName: string;
  prescription: string;  // e.g., "95lbs thrusters" or "Ring rows"
}

// ============================================================================
// Famous Benchmark WODs (Pre-defined)
// ============================================================================

export interface BenchmarkWodDefinition {
  name: string;
  type: BenchmarkType;
  format: WodFormat;
  description: string;
  rxPrescription: {
    maleWeights?: Record<string, number>;
    femaleWeights?: Record<string, number>;
    movements: string[];
  };
  timeCap?: number;
  notes?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
}

// ============================================================================
// Constants and Reference Data
// ============================================================================

export const WOD_FORMAT_INFO: Record<WodFormat, { label: string; description: string; icon: string }> = {
  amrap: {
    label: 'AMRAP',
    description: 'As Many Rounds As Possible dans le temps imparti',
    icon: 'Repeat'
  },
  forTime: {
    label: 'For Time',
    description: 'Complète le WOD le plus vite possible',
    icon: 'Timer'
  },
  emom: {
    label: 'EMOM',
    description: 'Every Minute On the Minute - travail structuré',
    icon: 'Clock'
  },
  tabata: {
    label: 'Tabata',
    description: '8 rounds: 20sec travail / 10sec repos',
    icon: 'Zap'
  },
  chipper: {
    label: 'Chipper',
    description: 'Longue liste de mouvements à compléter une fois',
    icon: 'List'
  },
  ladder: {
    label: 'Ladder',
    description: 'Progression croissante ou décroissante',
    icon: 'TrendingUp'
  },
  other: {
    label: 'Autre',
    description: 'Format personnalisé',
    icon: 'MoreHorizontal'
  }
};

export const SCALING_LEVEL_INFO: Record<ScalingLevel, { label: string; description: string; color: string }> = {
  rx: {
    label: 'Rx',
    description: 'Comme prescrit - poids et mouvements standards',
    color: '#DC2626'
  },
  scaled: {
    label: 'Scaled',
    description: 'Modifications poids, mouvements ou reps',
    color: '#F59E0B'
  },
  foundations: {
    label: 'Foundations',
    description: 'Version débutant avec adaptations',
    color: '#10B981'
  }
};

export const MOVEMENT_CATEGORY_INFO: Record<MovementCategory, { label: string; icon: string; color: string }> = {
  olympic: {
    label: 'Olympic Lifts',
    icon: 'Dumbbell',
    color: '#DC2626'
  },
  gymnastic: {
    label: 'Gymnastique',
    icon: 'Users',
    color: '#06B6D4'
  },
  monostructural: {
    label: 'Cardio',
    icon: 'Activity',
    color: '#22C55E'
  },
  weighted: {
    label: 'Lesté',
    icon: 'Weight',
    color: '#F59E0B'
  },
  bodyweight: {
    label: 'Poids du corps',
    icon: 'User',
    color: '#8B5CF6'
  },
  other: {
    label: 'Autre',
    icon: 'MoreHorizontal',
    color: '#6B7280'
  }
};

export const BENCHMARK_TYPE_INFO: Record<BenchmarkType, { label: string; description: string }> = {
  girl: {
    label: 'Girl WOD',
    description: 'WODs classiques courts et intenses'
  },
  hero: {
    label: 'Hero WOD',
    description: 'WODs hommage, souvent plus longs et difficiles'
  },
  custom: {
    label: 'Personnalisé',
    description: 'Benchmark créé par l\'utilisateur'
  },
  open: {
    label: 'CrossFit Open',
    description: 'Workouts de la compétition Open'
  },
  games: {
    label: 'CrossFit Games',
    description: 'Workouts des Games'
  }
};
