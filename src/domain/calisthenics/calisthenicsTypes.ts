/**
 * Calisthenics & Street Workout Domain Types
 * Type definitions for calisthenics-specific training data
 */

export type SkillLevel =
  | 'beginner'
  | 'novice'
  | 'intermediate'
  | 'advanced'
  | 'elite'
  | 'master';

export type SkillCategory =
  | 'pull'
  | 'push'
  | 'core'
  | 'legs'
  | 'skills'
  | 'flexibility'
  | 'general';

export type ProgressionStage =
  | 'tuck'
  | 'advanced-tuck'
  | 'one-leg'
  | 'straddle'
  | 'half-lay'
  | 'full'
  | 'weighted'
  | 'assisted'
  | 'negative'
  | 'regular'
  | 'advanced';

export interface CalisthenicsSkill {
  id: string;
  userId: string;
  skillName: string;
  skillCategory: SkillCategory;
  currentLevel: SkillLevel;
  currentVariant?: string;
  maxReps: number;
  maxHoldTime: number;
  lastPerformedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalisthenicsProgression {
  id: string;
  userId: string;
  skillName: string;
  progressionStage: ProgressionStage;
  achieved: boolean;
  achievedAt?: string;
  targetReps?: number;
  targetHoldTime?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalisthenicsSessionData {
  id: string;
  sessionId: string;
  userId: string;
  totalVolumeReps: number;
  skillsPracticed: SkillPracticed[];
  skillsAchieved: SkillAchieved[];
  averageRpe?: number;
  difficultyRating?: 'easy' | 'moderate' | 'challenging' | 'hard' | 'extreme';
  formQualityScore?: number;
  favoriteExercise?: string;
  hardestExercise?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillPracticed {
  skillName: string;
  variant: string;
  sets: number;
  totalReps?: number;
  totalHoldTime?: number;
  maxRepsInSet?: number;
  maxHoldTimeInSet?: number;
  rpeAverage?: number;
  formQuality?: number;
}

export interface SkillAchieved {
  skillName: string;
  achievementType: 'first_time' | 'new_pr' | 'progression_unlock' | 'hold_time_pr';
  previousValue?: number;
  newValue: number;
  notes?: string;
  celebrationLevel: 'minor' | 'major' | 'epic';
}

export interface CalisthenicsExercise {
  id: string;
  name: string;
  variant?: string;
  sets: number;
  reps?: number;
  holdTime?: number;
  repsProgression?: number[];
  load?: number;
  tempo?: string;
  rest: number;
  rpeTarget: number;
  movementPattern: string;
  skillLevel?: SkillLevel;
  progressionStage?: ProgressionStage;
  substitutions: string[];
  intensificationTechnique: string;
  intensificationDetails?: string;
  executionCues: string[];
  coachNotes: string;
  coachTips?: string[];
  safetyNotes?: string[];
  commonMistakes?: string[];
}

export interface CalisthenicsSessionPrescription {
  sessionId: string;
  sessionName: string;
  type: string;
  category: 'calisthenics-street';
  durationTarget: number;
  focus: string[];
  sessionSummary: string;
  warmup: {
    duration: number;
    isOptional: boolean;
    exercises: WarmupExercise[];
    notes: string;
  };
  exercises: CalisthenicsExercise[];
  cooldown: {
    duration: number;
    exercises: string[];
    notes: string;
  };
  overallNotes: string;
  expectedRpe: number;
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

export interface SkillProgressionPath {
  skillName: string;
  currentStage: ProgressionStage;
  stages: {
    stage: ProgressionStage;
    name: string;
    description: string;
    prerequisites: string[];
    targetCriteria: {
      reps?: number;
      holdTime?: number;
      formQuality?: number;
    };
    estimatedTimeWeeks?: number;
  }[];
}

export const SKILL_LEVELS: Record<SkillLevel, { label: string; description: string }> = {
  beginner: {
    label: 'Débutant',
    description: 'Fondations et mouvements de base'
  },
  novice: {
    label: 'Novice',
    description: 'Variations basiques maîtrisées'
  },
  intermediate: {
    label: 'Intermédiaire',
    description: 'Skills intermédiaires et volume solide'
  },
  advanced: {
    label: 'Avancé',
    description: 'Skills avancés et force importante'
  },
  elite: {
    label: 'Élite',
    description: 'Skills élite et maîtrise technique'
  },
  master: {
    label: 'Master',
    description: 'Freestyle et combinaisons créatives'
  }
};

export const SKILL_CATEGORIES_INFO: Record<SkillCategory, { label: string; icon: string; color: string }> = {
  pull: {
    label: 'Traction',
    icon: 'ArrowUp',
    color: '#06B6D4'
  },
  push: {
    label: 'Poussée',
    icon: 'ArrowDown',
    color: '#10B981'
  },
  core: {
    label: 'Core',
    icon: 'Target',
    color: '#F59E0B'
  },
  legs: {
    label: 'Jambes',
    icon: 'Footprints',
    color: '#8B5CF6'
  },
  skills: {
    label: 'Skills',
    icon: 'Star',
    color: '#EC4899'
  },
  flexibility: {
    label: 'Flexibilité',
    icon: 'Waves',
    color: '#14B8A6'
  },
  general: {
    label: 'Général',
    icon: 'Circle',
    color: '#6B7280'
  }
};

export const PROGRESSION_PATHS: Record<string, SkillProgressionPath> = {
  'pull-ups': {
    skillName: 'Pull-ups',
    currentStage: 'regular',
    stages: [
      {
        stage: 'negative',
        name: 'Negative Pull-ups',
        description: 'Descente contrôlée 5 secondes',
        prerequisites: ['Dead hang 30s'],
        targetCriteria: { reps: 5, holdTime: 5 },
        estimatedTimeWeeks: 2
      },
      {
        stage: 'assisted',
        name: 'Band-Assisted Pull-ups',
        description: 'Avec élastique pour assistance',
        prerequisites: ['Negative pull-ups 3x5'],
        targetCriteria: { reps: 8 },
        estimatedTimeWeeks: 4
      },
      {
        stage: 'regular',
        name: 'Regular Pull-ups',
        description: 'Pull-ups stricts complets',
        prerequisites: ['Band-assisted 3x8'],
        targetCriteria: { reps: 10 },
        estimatedTimeWeeks: 6
      },
      {
        stage: 'advanced',
        name: 'Weighted Pull-ups',
        description: 'Pull-ups avec charge additionnelle',
        prerequisites: ['Regular pull-ups 3x12'],
        targetCriteria: { reps: 8 },
        estimatedTimeWeeks: 12
      }
    ]
  },
  'muscle-up': {
    skillName: 'Muscle-up',
    currentStage: 'assisted',
    stages: [
      {
        stage: 'negative',
        name: 'Negative Muscle-up',
        description: 'Descente contrôlée from top position',
        prerequisites: ['Pull-ups 10 reps', 'Dips 15 reps'],
        targetCriteria: { reps: 3, holdTime: 5 },
        estimatedTimeWeeks: 4
      },
      {
        stage: 'assisted',
        name: 'Band-Assisted Muscle-up',
        description: 'Avec élastique pour transition',
        prerequisites: ['Explosive pull-ups', 'Negative muscle-up 5 reps'],
        targetCriteria: { reps: 5 },
        estimatedTimeWeeks: 6
      },
      {
        stage: 'regular',
        name: 'Strict Bar Muscle-up',
        description: 'Muscle-up strict sans kip',
        prerequisites: ['Band-assisted 3x5'],
        targetCriteria: { reps: 3 },
        estimatedTimeWeeks: 8
      },
      {
        stage: 'advanced',
        name: 'Ring Muscle-up',
        description: 'Muscle-up sur anneaux (instabilité)',
        prerequisites: ['Bar muscle-up 3x5'],
        targetCriteria: { reps: 3 },
        estimatedTimeWeeks: 12
      }
    ]
  },
  'front-lever': {
    skillName: 'Front Lever',
    currentStage: 'tuck',
    stages: [
      {
        stage: 'tuck',
        name: 'Tuck Front Lever',
        description: 'Genoux vers poitrine, corps horizontal',
        prerequisites: ['Pull-ups 8 reps', 'Hollow body 30s'],
        targetCriteria: { holdTime: 15 },
        estimatedTimeWeeks: 4
      },
      {
        stage: 'advanced-tuck',
        name: 'Advanced Tuck',
        description: 'Cuisses horizontales, genoux pliés',
        prerequisites: ['Tuck hold 20s'],
        targetCriteria: { holdTime: 12 },
        estimatedTimeWeeks: 6
      },
      {
        stage: 'one-leg',
        name: 'One Leg Extended',
        description: 'Une jambe tendue, une pliée',
        prerequisites: ['Advanced tuck 15s'],
        targetCriteria: { holdTime: 10 },
        estimatedTimeWeeks: 8
      },
      {
        stage: 'straddle',
        name: 'Straddle Front Lever',
        description: 'Jambes écartées, corps horizontal',
        prerequisites: ['One leg 12s chaque côté'],
        targetCriteria: { holdTime: 8 },
        estimatedTimeWeeks: 12
      },
      {
        stage: 'full',
        name: 'Full Front Lever',
        description: 'Corps complètement horizontal, jambes jointes',
        prerequisites: ['Straddle 10s'],
        targetCriteria: { holdTime: 5 },
        estimatedTimeWeeks: 16
      }
    ]
  },
  'handstand': {
    skillName: 'Handstand',
    currentStage: 'assisted',
    stages: [
      {
        stage: 'assisted',
        name: 'Wall Handstand Hold',
        description: 'Dos au mur, corps aligné',
        prerequisites: ['Pike push-ups 3x10'],
        targetCriteria: { holdTime: 60 },
        estimatedTimeWeeks: 2
      },
      {
        stage: 'regular',
        name: 'Freestanding Handstand',
        description: 'Équilibre sans support',
        prerequisites: ['Wall handstand 60s'],
        targetCriteria: { holdTime: 30 },
        estimatedTimeWeeks: 12
      },
      {
        stage: 'advanced',
        name: 'Handstand Push-up',
        description: 'HSPU complet freestanding',
        prerequisites: ['Freestanding 45s', 'Pike HSPU 3x8'],
        targetCriteria: { reps: 5 },
        estimatedTimeWeeks: 20
      }
    ]
  }
};
