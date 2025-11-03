/**
 * Functional Training Exercise Catalog
 * Comprehensive library of Functional/CrossFit movements and benchmark WODs
 */

import type { BenchmarkWodDefinition, MovementCategory, ScalingOption } from './functionalTypes';

// ============================================================================
// OLYMPIC LIFTS - Technical Barbell Movements
// ============================================================================

export const OLYMPIC_LIFTS = [
  {
    name: 'Snatch',
    category: 'olympic' as MovementCategory,
    description: 'Single movement from ground to overhead',
    progressions: [
      'PVC snatch',
      'Hang power snatch',
      'Power snatch',
      'Hang snatch',
      'Full snatch (squat snatch)'
    ],
    rxWeights: { male: 43, female: 29 },  // kg (95lbs / 65lbs)
    commonFaults: ['Early arm bend', 'Jumping forward', 'Soft elbows overhead'],
    prerequisites: ['Overhead squat proficiency', 'Hip mobility'],
    techniqueComplexity: 'very-high'
  },
  {
    name: 'Clean & Jerk',
    category: 'olympic' as MovementCategory,
    description: 'Two-part movement: ground to shoulders, then overhead',
    progressions: [
      'Hang power clean',
      'Power clean',
      'Hang clean',
      'Full clean (squat clean)',
      'Push jerk',
      'Split jerk'
    ],
    rxWeights: { male: 60, female: 43 },  // kg (135lbs / 95lbs)
    commonFaults: ['Early arm pull', 'No hip extension', 'Soft front rack'],
    prerequisites: ['Front squat', 'Shoulder mobility'],
    techniqueComplexity: 'very-high'
  },
  {
    name: 'Clean',
    category: 'olympic' as MovementCategory,
    description: 'Ground to front rack position',
    variations: ['Power clean', 'Hang clean', 'Squat clean'],
    rxWeights: { male: 60, female: 43 },
    commonFaults: ['Reverse curl', 'No hip contact', 'Soft catch'],
    techniqueComplexity: 'high'
  },
  {
    name: 'Jerk',
    category: 'olympic' as MovementCategory,
    description: 'Shoulders to overhead',
    variations: ['Push jerk', 'Push press', 'Split jerk'],
    rxWeights: { male: 60, female: 43 },
    commonFaults: ['Press out', 'No dip drive', 'Soft lockout'],
    techniqueComplexity: 'high'
  },
  {
    name: 'Overhead Squat',
    category: 'olympic' as MovementCategory,
    description: 'Squat with bar overhead',
    rxWeights: { male: 43, female: 29 },
    commonFaults: ['Soft lockout', 'Forward torso', 'Heels lifting'],
    prerequisites: ['Shoulder mobility', 'Ankle mobility'],
    techniqueComplexity: 'high'
  }
];

// ============================================================================
// GYMNASTIC MOVEMENTS - Bodyweight Skills
// ============================================================================

export const GYMNASTIC_MOVEMENTS = [
  {
    name: 'Muscle-up',
    category: 'gymnastic' as MovementCategory,
    variations: ['Bar muscle-up', 'Ring muscle-up', 'Strict', 'Kipping'],
    description: 'Pull-up to dip transition',
    prerequisites: ['10+ strict pull-ups', '15+ ring dips'],
    scalingOptions: [
      { level: 'foundations', option: 'Jumping muscle-up' },
      { level: 'scaled', option: 'Band-assisted muscle-up' },
      { level: 'rx', option: 'Strict or kipping muscle-up' }
    ] as ScalingOption[],
    techniqueComplexity: 'very-high'
  },
  {
    name: 'Handstand Push-up',
    category: 'gymnastic' as MovementCategory,
    variations: ['Strict HSPU', 'Kipping HSPU', 'Deficit HSPU'],
    description: 'Vertical push-up in handstand',
    prerequisites: ['Wall handstand 30s', 'Pike push-ups proficient'],
    scalingOptions: [
      { level: 'foundations', option: 'Pike push-ups' },
      { level: 'scaled', option: 'Box HSPU' },
      { level: 'rx', option: 'Full range HSPU' }
    ] as ScalingOption[],
    techniqueComplexity: 'high'
  },
  {
    name: 'Toes-to-Bar',
    category: 'gymnastic' as MovementCategory,
    variations: ['Strict', 'Kipping', 'Butterfly'],
    description: 'Hanging toes touch bar',
    scalingOptions: [
      { level: 'foundations', option: 'Knee raises' },
      { level: 'scaled', option: 'Knees to elbows' },
      { level: 'rx', option: 'Toes-to-bar' }
    ] as ScalingOption[],
    techniqueComplexity: 'medium'
  },
  {
    name: 'Chest-to-Bar Pull-up',
    category: 'gymnastic' as MovementCategory,
    variations: ['Strict', 'Kipping', 'Butterfly'],
    description: 'Pull-up with chest touching bar',
    scalingOptions: [
      { level: 'foundations', option: 'Ring rows' },
      { level: 'scaled', option: 'Chin over bar pull-ups' },
      { level: 'rx', option: 'Chest-to-bar' }
    ] as ScalingOption[],
    techniqueComplexity: 'medium'
  },
  {
    name: 'Rope Climb',
    category: 'gymnastic' as MovementCategory,
    variations: ['Legless', 'With legs', 'From seated'],
    description: 'Climb 15ft rope to touch',
    scalingOptions: [
      { level: 'foundations', option: 'Rope pulls lying down' },
      { level: 'scaled', option: 'Partial rope climb' },
      { level: 'rx', option: 'Full 15ft rope climb' }
    ] as ScalingOption[],
    techniqueComplexity: 'high'
  },
  {
    name: 'Bar/Ring Dips',
    category: 'gymnastic' as MovementCategory,
    variations: ['Strict', 'Kipping', 'Ring dips'],
    description: 'Dips on bars or rings',
    scalingOptions: [
      { level: 'foundations', option: 'Bench dips' },
      { level: 'scaled', option: 'Band-assisted dips' },
      { level: 'rx', option: 'Full range dips' }
    ] as ScalingOption[],
    techniqueComplexity: 'medium'
  },
  {
    name: 'Pull-ups',
    category: 'gymnastic' as MovementCategory,
    variations: ['Strict', 'Kipping', 'Butterfly', 'Chest-to-bar'],
    description: 'Chin over bar pull-up',
    scalingOptions: [
      { level: 'foundations', option: 'Ring rows' },
      { level: 'scaled', option: 'Band-assisted pull-ups' },
      { level: 'rx', option: 'Full pull-ups' }
    ] as ScalingOption[],
    techniqueComplexity: 'medium'
  }
];

// ============================================================================
// WEIGHTED MOVEMENTS - Barbell, Dumbbell, Kettlebell
// ============================================================================

export const WEIGHTED_MOVEMENTS = [
  {
    name: 'Thruster',
    category: 'weighted' as MovementCategory,
    description: 'Front squat to overhead press',
    rxWeights: { male: 43, female: 29 },  // kg (95lbs / 65lbs)
    variations: ['Barbell', 'Dumbbell'],
    commonFaults: ['No full depth squat', 'Press out', 'Slow transition'],
    techniqueComplexity: 'medium'
  },
  {
    name: 'Wall Ball',
    category: 'weighted' as MovementCategory,
    description: 'Squat and throw medicine ball to target',
    rxWeights: { male: 9, female: 6 },  // kg (20lbs / 14lbs)
    targetHeight: { male: 10, female: 9 },  // feet
    commonFaults: ['No depth', 'Low throw', 'Catching too low'],
    techniqueComplexity: 'low'
  },
  {
    name: 'Kettlebell Swing',
    category: 'weighted' as MovementCategory,
    description: 'Hip-driven swing to eye level or overhead',
    variations: ['Russian swing (eye level)', 'American swing (overhead)'],
    rxWeights: { male: 24, female: 16 },  // kg (53lbs / 35lbs)
    commonFaults: ['Squatting', 'Arm lifting', 'Incomplete hip extension'],
    techniqueComplexity: 'medium'
  },
  {
    name: 'Goblet Squat',
    category: 'weighted' as MovementCategory,
    description: 'Front squat holding single weight',
    variations: ['Kettlebell', 'Dumbbell'],
    commonFaults: ['Knees caving', 'Heels lifting', 'No depth'],
    techniqueComplexity: 'low'
  },
  {
    name: 'Dumbbell Snatch',
    category: 'weighted' as MovementCategory,
    description: 'Single arm snatch ground to overhead',
    rxWeights: { male: 22.5, female: 15 },  // kg (50lbs / 35lbs)
    commonFaults: ['Arm curl', 'No hip extension', 'Soft lockout'],
    techniqueComplexity: 'medium'
  },
  {
    name: 'Devil Press',
    category: 'weighted' as MovementCategory,
    description: 'Burpee with double dumbbell snatch',
    rxWeights: { male: 22.5, female: 15 },
    commonFaults: ['Poor landing', 'Incomplete lockout', 'Slow pace'],
    techniqueComplexity: 'medium'
  },
  {
    name: 'Deadlift',
    category: 'weighted' as MovementCategory,
    description: 'Ground to standing hip extension',
    rxWeights: { male: 102, female: 70 },  // kg (225lbs / 155lbs)
    variations: ['Conventional', 'Sumo'],
    commonFaults: ['Rounded back', 'Soft lockout', 'Hitching'],
    techniqueComplexity: 'medium'
  }
];

// ============================================================================
// MONOSTRUCTURAL - Cardio Movements
// ============================================================================

export const MONOSTRUCTURAL_MOVEMENTS = [
  {
    name: 'Rowing',
    category: 'monostructural' as MovementCategory,
    description: 'Concept2 rower',
    metrics: ['meters', 'calories', 'time'],
    commonDistances: [500, 1000, 2000, 5000],
    commonFaults: ['Pulling with arms first', 'Rushing the recovery', 'No leg drive'],
    calorieConversion: {
      base: 1,  // 1:1 ratio
      male: 1.0,
      female: 1.0
    }
  },
  {
    name: 'Assault Bike / Air Bike',
    category: 'monostructural' as MovementCategory,
    description: 'Fan bike with arms and legs',
    metrics: ['calories', 'time'],
    commonFaults: ['Not using arms', 'Unsteady pace', 'Lazy legs'],
    calorieConversion: {
      base: 1,
      male: 1.0,
      female: 1.0
    }
  },
  {
    name: 'Ski Erg',
    category: 'monostructural' as MovementCategory,
    description: 'Rope pull machine',
    metrics: ['meters', 'calories', 'time'],
    commonDistances: [500, 1000, 2000],
    commonFaults: ['All arms', 'No core engagement', 'Poor rhythm'],
    calorieConversion: {
      base: 1,
      male: 1.0,
      female: 1.0
    }
  },
  {
    name: 'Running',
    category: 'monostructural' as MovementCategory,
    description: 'Outdoor or treadmill running',
    metrics: ['meters', 'time'],
    commonDistances: [400, 800, 1600, 5000],
    substitution: {
      row: 1.0,  // 1:1 meter conversion
      bike: 3.0, // 3x meters on bike
      ski: 1.0
    }
  }
];

// ============================================================================
// BODYWEIGHT MOVEMENTS - Basic Calisthenics
// ============================================================================

export const BODYWEIGHT_MOVEMENTS = [
  {
    name: 'Burpee',
    category: 'bodyweight' as MovementCategory,
    variations: ['Standard', 'Over box', 'Bar-facing', 'Lateral'],
    description: 'Chest to ground, jump up',
    commonFaults: ['No chest touch', 'Slow transition', 'Incomplete hip extension'],
    techniqueComplexity: 'low'
  },
  {
    name: 'Box Jump',
    category: 'bodyweight' as MovementCategory,
    variations: ['Jump up', 'Step down', 'Jump over'],
    rxHeights: { male: 24, female: 20 },  // inches
    description: 'Jump onto box, full hip extension',
    commonFaults: ['Soft landing', 'No extension on top', 'Hesitation'],
    techniqueComplexity: 'low'
  },
  {
    name: 'Air Squat',
    category: 'bodyweight' as MovementCategory,
    description: 'Bodyweight squat below parallel',
    commonFaults: ['Shallow depth', 'Knees caving', 'Heels lifting'],
    techniqueComplexity: 'low'
  },
  {
    name: 'Push-up',
    category: 'bodyweight' as MovementCategory,
    variations: ['Standard', 'Hand-release', 'Deficit'],
    description: 'Chest to ground push-up',
    scalingOptions: [
      { level: 'foundations', option: 'Elevated push-ups' },
      { level: 'scaled', option: 'Knee push-ups' },
      { level: 'rx', option: 'Full push-ups' }
    ] as ScalingOption[],
    techniqueComplexity: 'low'
  },
  {
    name: 'Sit-up',
    category: 'bodyweight' as MovementCategory,
    variations: ['Abmat sit-up', 'GHD sit-up'],
    description: 'Shoulders touch ground to sitting',
    commonFaults: ['Not reaching full range', 'Using momentum', 'Poor posture'],
    techniqueComplexity: 'low'
  },
  {
    name: 'Double Under',
    category: 'bodyweight' as MovementCategory,
    description: 'Jump rope passes twice under feet',
    scalingOptions: [
      { level: 'foundations', option: 'Single unders × 3' },
      { level: 'scaled', option: 'Single unders × 2' },
      { level: 'rx', option: 'Double unders' }
    ] as ScalingOption[],
    techniqueComplexity: 'medium'
  }
];

// ============================================================================
// FAMOUS BENCHMARK WODS
// ============================================================================

export const GIRL_WODS: BenchmarkWodDefinition[] = [
  {
    name: 'Fran',
    type: 'girl',
    format: 'forTime',
    description: '21-15-9 reps for time of: Thrusters, Pull-ups',
    rxPrescription: {
      maleWeights: { thruster: 43 },  // 95lbs
      femaleWeights: { thruster: 29 },  // 65lbs
      movements: ['Thrusters', 'Pull-ups']
    },
    notes: 'Classic sprint WOD. Elite time: sub 2 minutes. Good time: sub 5 minutes.',
    difficulty: 'advanced'
  },
  {
    name: 'Grace',
    type: 'girl',
    format: 'forTime',
    description: '30 Clean & Jerks for time',
    rxPrescription: {
      maleWeights: { cleanJerk: 60 },  // 135lbs
      femaleWeights: { cleanJerk: 43 },  // 95lbs
      movements: ['Clean & Jerk']
    },
    notes: 'Pure power endurance. Elite: sub 90 seconds. Good: sub 3 minutes.',
    difficulty: 'advanced'
  },
  {
    name: 'Diane',
    type: 'girl',
    format: 'forTime',
    description: '21-15-9 reps for time of: Deadlifts, Handstand Push-ups',
    rxPrescription: {
      maleWeights: { deadlift: 102 },  // 225lbs
      femaleWeights: { deadlift: 70 },  // 155lbs
      movements: ['Deadlifts', 'Handstand Push-ups']
    },
    notes: 'Tests posterior chain and pressing. Elite: sub 2 minutes.',
    difficulty: 'advanced'
  },
  {
    name: 'Cindy',
    type: 'girl',
    format: 'amrap',
    description: 'AMRAP 20min: 5 Pull-ups, 10 Push-ups, 15 Air Squats',
    rxPrescription: {
      movements: ['Pull-ups', 'Push-ups', 'Air Squats']
    },
    notes: 'Bodyweight endurance. Elite: 25+ rounds. Good: 15-20 rounds.',
    difficulty: 'intermediate'
  },
  {
    name: 'Annie',
    type: 'girl',
    format: 'forTime',
    description: '50-40-30-20-10 reps for time of: Double Unders, Sit-ups',
    rxPrescription: {
      movements: ['Double Unders', 'Sit-ups']
    },
    notes: 'Skill and core endurance. Elite: sub 5 minutes. Good: sub 10 minutes.',
    difficulty: 'intermediate'
  },
  {
    name: 'Karen',
    type: 'girl',
    format: 'forTime',
    description: '150 Wall Balls for time',
    rxPrescription: {
      maleWeights: { wallBall: 9 },  // 20lbs to 10ft
      femaleWeights: { wallBall: 6 },  // 14lbs to 9ft
      movements: ['Wall Balls']
    },
    notes: 'Pure leg endurance. Elite: sub 5 minutes. Good: sub 10 minutes.',
    difficulty: 'intermediate'
  },
  {
    name: 'Helen',
    type: 'girl',
    format: 'forTime',
    description: '3 rounds for time: 400m Run, 21 Kettlebell Swings, 12 Pull-ups',
    rxPrescription: {
      maleWeights: { kettlebell: 24 },  // 53lbs
      femaleWeights: { kettlebell: 16 },  // 35lbs
      movements: ['Run', 'Kettlebell Swings', 'Pull-ups']
    },
    notes: 'Mixed modal endurance. Elite: sub 8 minutes. Good: sub 12 minutes.',
    difficulty: 'intermediate'
  }
];

export const HERO_WODS: BenchmarkWodDefinition[] = [
  {
    name: 'Murph',
    type: 'hero',
    format: 'forTime',
    description: 'For time: 1 mile Run, 100 Pull-ups, 200 Push-ups, 300 Air Squats, 1 mile Run (wear 20lb vest if prescribed)',
    rxPrescription: {
      movements: ['Run', 'Pull-ups', 'Push-ups', 'Air Squats']
    },
    timeCap: 60,  // minutes
    notes: 'The ultimate Hero WOD. Elite: sub 35 minutes. Good: sub 50 minutes.',
    difficulty: 'elite'
  },
  {
    name: 'DT',
    type: 'hero',
    format: 'forTime',
    description: '5 rounds for time: 12 Deadlifts, 9 Hang Power Cleans, 6 Push Jerks',
    rxPrescription: {
      maleWeights: { barbell: 70 },  // 155lbs
      femaleWeights: { barbell: 47.5 },  // 105lbs
      movements: ['Deadlifts', 'Hang Power Cleans', 'Push Jerks']
    },
    notes: 'Barbell complex endurance. Elite: sub 5 minutes. Good: sub 10 minutes.',
    difficulty: 'advanced'
  },
  {
    name: 'Angie',
    type: 'hero',
    format: 'forTime',
    description: 'For time: 100 Pull-ups, 100 Push-ups, 100 Sit-ups, 100 Air Squats',
    rxPrescription: {
      movements: ['Pull-ups', 'Push-ups', 'Sit-ups', 'Air Squats']
    },
    notes: 'High volume bodyweight. Elite: sub 15 minutes. Good: sub 25 minutes.',
    difficulty: 'advanced'
  },
  {
    name: 'The Seven',
    type: 'hero',
    format: 'forTime',
    description: '7 rounds for time: 7 Handstand Push-ups, 7 Thrusters (135/95), 7 Knees-to-Elbows, 7 Deadlifts (245/165), 7 Burpees, 7 Kettlebell Swings (2/1.5 pood), 7 Pull-ups',
    rxPrescription: {
      maleWeights: { thruster: 61, deadlift: 111, kettlebell: 32 },
      femaleWeights: { thruster: 43, deadlift: 75, kettlebell: 24 },
      movements: ['HSPU', 'Thrusters', 'Knees-to-Elbows', 'Deadlifts', 'Burpees', 'KB Swings', 'Pull-ups']
    },
    notes: 'Chipper style with heavy weights. Very challenging.',
    difficulty: 'elite'
  }
];

// ============================================================================
// EXERCISE CATALOG EXPORTS
// ============================================================================

export const ALL_FUNCTIONAL_MOVEMENTS = [
  ...OLYMPIC_LIFTS,
  ...GYMNASTIC_MOVEMENTS,
  ...WEIGHTED_MOVEMENTS,
  ...MONOSTRUCTURAL_MOVEMENTS,
  ...BODYWEIGHT_MOVEMENTS
];

export const ALL_BENCHMARK_WODS = [
  ...GIRL_WODS,
  ...HERO_WODS
];

export const MOVEMENT_BY_CATEGORY = {
  olympic: OLYMPIC_LIFTS,
  gymnastic: GYMNASTIC_MOVEMENTS,
  weighted: WEIGHTED_MOVEMENTS,
  monostructural: MONOSTRUCTURAL_MOVEMENTS,
  bodyweight: BODYWEIGHT_MOVEMENTS
};
