/**
 * Calisthenics Exercise Database
 * Comprehensive catalog of calisthenics movements with progressions
 */

import type { SkillLevel, SkillCategory } from './calisthenicsTypes';

export interface CalisthenicsExerciseDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  skillLevel: SkillLevel;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  progressionPath?: string[];
  regressionPath?: string[];
  coachingCues: string[];
  commonMistakes: string[];
  safetyNotes: string[];
}

export const PULL_EXERCISES: CalisthenicsExerciseDefinition[] = [
  {
    id: 'scapula-pull-ups',
    name: 'Scapula Pull-ups',
    category: 'pull',
    skillLevel: 'beginner',
    description: 'Activation scapulaire sans flexion des coudes',
    primaryMuscles: ['Trapezius', 'Rhomboids', 'Serratus anterior'],
    secondaryMuscles: ['Lats'],
    equipment: ['pull-up-bar'],
    progressionPath: ['Negative pull-ups', 'Pull-ups'],
    regressionPath: [],
    coachingCues: ['Déprimer les épaules', 'Élever le corps sans plier coudes', 'Contracter scapulas'],
    commonMistakes: ['Plier les coudes', 'Hausser les épaules', 'Mouvement trop ample'],
    safetyNotes: ['Mouvement essentiel avant tractions']
  },
  {
    id: 'negative-pull-ups',
    name: 'Negative Pull-ups',
    category: 'pull',
    skillLevel: 'beginner',
    description: 'Descente contrôlée de 5 secondes depuis position haute',
    primaryMuscles: ['Lats', 'Biceps', 'Trapezius'],
    secondaryMuscles: ['Forearms', 'Core'],
    equipment: ['pull-up-bar'],
    progressionPath: ['Band-assisted pull-ups', 'Pull-ups'],
    regressionPath: ['Scapula pull-ups'],
    coachingCues: ['Descente de 5 secondes minimum', 'Contrôle total', 'Ne pas lâcher brusquement'],
    commonMistakes: ['Descente trop rapide', 'Perte de tension', 'Épaules haussées'],
    safetyNotes: ['Excellent pour renforcer excentrique']
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'pull',
    skillLevel: 'intermediate',
    description: 'Traction complète menton au-dessus de la barre',
    primaryMuscles: ['Lats', 'Biceps', 'Trapezius'],
    secondaryMuscles: ['Forearms', 'Core', 'Rhomboids'],
    equipment: ['pull-up-bar'],
    progressionPath: ['Archer pull-ups', 'Weighted pull-ups', 'One-arm assisted'],
    regressionPath: ['Negative pull-ups', 'Band-assisted'],
    coachingCues: ['Full ROM', 'Menton au-dessus barre', 'Descente contrôlée', 'Core engagé'],
    commonMistakes: ['Kipping excessif', 'ROM partiel', 'Épaules vers oreilles'],
    safetyNotes: ['Échauffement scapulaire obligatoire', 'Progression graduelle']
  },
  {
    id: 'archer-pull-ups',
    name: 'Archer Pull-ups',
    category: 'pull',
    skillLevel: 'advanced',
    description: 'Pull-up avec un bras dominant, un bras tendu latéralement',
    primaryMuscles: ['Lats', 'Biceps'],
    secondaryMuscles: ['Core', 'Obliques'],
    equipment: ['pull-up-bar'],
    progressionPath: ['Typewriter pull-ups', 'One-arm assisted'],
    regressionPath: ['Pull-ups', 'Wide grip pull-ups'],
    coachingCues: ['Un bras tire, un guide', 'Bras tendu reste tendu', 'Alterner côtés'],
    commonMistakes: ['Plier bras passif', 'Rotation excessive', 'Perte forme'],
    safetyNotes: ['Prérequis: 10+ pull-ups stricts']
  },
  {
    id: 'one-arm-pull-up',
    name: 'One-arm Pull-up',
    category: 'pull',
    skillLevel: 'elite',
    description: 'Traction à un bras complet',
    primaryMuscles: ['Lats', 'Biceps'],
    secondaryMuscles: ['Core', 'Obliques', 'Grip'],
    equipment: ['pull-up-bar'],
    progressionPath: [],
    regressionPath: ['One-arm assisted', 'Archer pull-ups'],
    coachingCues: ['Core ultra-stable', 'Éviter rotation', 'Pull explosif initial'],
    commonMistakes: ['Trop de rotation', 'Manque de force', 'ROM partiel'],
    safetyNotes: ['Skill élite: 20+ pull-ups, 5+ archer requis']
  }
];

export const PUSH_EXERCISES: CalisthenicsExerciseDefinition[] = [
  {
    id: 'wall-push-ups',
    name: 'Wall Push-ups',
    category: 'push',
    skillLevel: 'beginner',
    description: 'Pompes debout contre un mur',
    primaryMuscles: ['Pectoraux', 'Triceps', 'Deltoïdes'],
    secondaryMuscles: ['Core'],
    equipment: ['wall'],
    progressionPath: ['Incline push-ups', 'Push-ups'],
    regressionPath: [],
    coachingCues: ['Corps aligné', 'Descente contrôlée', 'Coudes 45°'],
    commonMistakes: ['Fesses en arrière', 'Coudes trop écartés', 'ROM partiel'],
    safetyNotes: ['Idéal débutants absolus']
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'push',
    skillLevel: 'intermediate',
    description: 'Pompes classiques au sol',
    primaryMuscles: ['Pectoraux', 'Triceps', 'Deltoïdes'],
    secondaryMuscles: ['Core', 'Serratus'],
    equipment: [],
    progressionPath: ['Diamond push-ups', 'Archer push-ups', 'One-arm assisted'],
    regressionPath: ['Knee push-ups', 'Incline push-ups'],
    coachingCues: ['Planche parfaite', 'Coudes 45°', 'Poitrine au sol', 'Core serré'],
    commonMistakes: ['Hanches qui tombent', 'Coudes trop larges', 'Tête vers sol'],
    safetyNotes: ['Fondation essentielle']
  },
  {
    id: 'pike-push-ups',
    name: 'Pike Push-ups',
    category: 'push',
    skillLevel: 'intermediate',
    description: 'Push-ups en V inversé, progressions handstand',
    primaryMuscles: ['Deltoïdes', 'Triceps'],
    secondaryMuscles: ['Trapezius', 'Core'],
    equipment: [],
    progressionPath: ['Elevated pike push-ups', 'Wall HSPU', 'Handstand push-ups'],
    regressionPath: ['Push-ups'],
    coachingCues: ['Hanches hautes', 'Tête vers sol', 'Coudes serrés', 'Poids sur épaules'],
    commonMistakes: ['Hanches trop basses', 'Coudes trop larges', 'ROM partiel'],
    safetyNotes: ['Excellent pour développer épaules']
  },
  {
    id: 'handstand-push-ups',
    name: 'Handstand Push-ups',
    category: 'push',
    skillLevel: 'advanced',
    description: 'HSPU complet mur ou freestanding',
    primaryMuscles: ['Deltoïdes', 'Triceps'],
    secondaryMuscles: ['Trapezius', 'Core'],
    equipment: ['wall'],
    progressionPath: ['Freestanding HSPU', 'Deficit HSPU'],
    regressionPath: ['Pike push-ups elevated', 'Wall HSPU partial'],
    coachingCues: ['Descente contrôlée', 'Tête touche sol', 'Push explosif', 'Corps aligné'],
    commonMistakes: ['ROM partiel', 'Dos arqué', 'Perte équilibre'],
    safetyNotes: ['Prérequis: handstand hold 45s+']
  }
];

export const DIPS_EXERCISES: CalisthenicsExerciseDefinition[] = [
  {
    id: 'bench-dips',
    name: 'Bench Dips',
    category: 'push',
    skillLevel: 'beginner',
    description: 'Dips sur banc ou chaise',
    primaryMuscles: ['Triceps', 'Pectoraux'],
    secondaryMuscles: ['Deltoïdes'],
    equipment: ['bench'],
    progressionPath: ['Parallel bar dips'],
    regressionPath: [],
    coachingCues: ['Coudes vers arrière', 'Épaules basses', 'Descente contrôlée'],
    commonMistakes: ['Épaules haussées', 'Descente trop profonde', 'Coudes écartés'],
    safetyNotes: ['Attention épaules']
  },
  {
    id: 'parallel-bar-dips',
    name: 'Parallel Bar Dips',
    category: 'push',
    skillLevel: 'intermediate',
    description: 'Dips sur barres parallèles',
    primaryMuscles: ['Triceps', 'Pectoraux', 'Deltoïdes'],
    secondaryMuscles: ['Core'],
    equipment: ['parallel-bars'],
    progressionPath: ['Ring dips', 'Weighted dips'],
    regressionPath: ['Bench dips', 'Negative dips'],
    coachingCues: ['Descendre 90° coudes', 'Corps légèrement penché', 'Push explosif'],
    commonMistakes: ['Épaules vers oreilles', 'Pas assez profond', 'Trop de lean'],
    safetyNotes: ['Échauffement épaules obligatoire']
  },
  {
    id: 'ring-dips',
    name: 'Ring Dips',
    category: 'push',
    skillLevel: 'advanced',
    description: 'Dips sur anneaux de gymnastique',
    primaryMuscles: ['Triceps', 'Pectoraux', 'Deltoïdes'],
    secondaryMuscles: ['Core', 'Stabilisateurs'],
    equipment: ['gymnastic-rings'],
    progressionPath: ['Weighted ring dips'],
    regressionPath: ['Parallel bar dips', 'Ring support hold'],
    coachingCues: ['Stabiliser anneaux', 'Coudes serrés', 'Core ultra-serré'],
    commonMistakes: ['Anneaux instables', 'Perte contrôle', 'ROM partiel'],
    safetyNotes: ['Prérequis: 10+ bar dips stricts']
  }
];

export const CORE_EXERCISES: CalisthenicsExerciseDefinition[] = [
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    skillLevel: 'beginner',
    description: 'Gainage ventral statique',
    primaryMuscles: ['Core', 'Abs'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    equipment: [],
    progressionPath: ['RKC plank', 'Weighted plank'],
    regressionPath: [],
    coachingCues: ['Corps aligné', 'Core serré', 'Glutes contractés', 'Respiration normale'],
    commonMistakes: ['Hanches qui tombent', 'Fesses hautes', 'Tête vers sol'],
    safetyNotes: ['Fondation core essentielle']
  },
  {
    id: 'l-sit-tucked',
    name: 'L-sit Tucked',
    category: 'core',
    skillLevel: 'intermediate',
    description: 'L-sit genoux repliés vers poitrine',
    primaryMuscles: ['Hip flexors', 'Abs', 'Serratus'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: ['parallettes'],
    progressionPath: ['L-sit one leg', 'Full L-sit'],
    regressionPath: ['Knee raises'],
    coachingCues: ['Épaules déprimées', 'Bassin rétroversion', 'Genoux serrés'],
    commonMistakes: ['Épaules haussées', 'Dos rond', 'Respiration bloquée'],
    safetyNotes: ['Poignets échauffés obligatoire']
  },
  {
    id: 'full-l-sit',
    name: 'Full L-sit',
    category: 'core',
    skillLevel: 'advanced',
    description: 'L-sit jambes tendues horizontales',
    primaryMuscles: ['Hip flexors', 'Abs', 'Serratus'],
    secondaryMuscles: ['Quads', 'Triceps'],
    equipment: ['parallettes', 'parallel-bars'],
    progressionPath: ['V-sit', 'Manna progressions'],
    regressionPath: ['L-sit one leg', 'L-sit tucked'],
    coachingCues: ['Compression maximale', 'Jambes verrouillées', 'Orteils pointés'],
    commonMistakes: ['Genoux pliés', 'Jambes qui tombent', 'Perte position'],
    safetyNotes: ['Skill compression critique']
  },
  {
    id: 'dragon-flag',
    name: 'Dragon Flag',
    category: 'core',
    skillLevel: 'elite',
    description: 'Corps tendu horizontal seulement épaules au support',
    primaryMuscles: ['Abs', 'Core'],
    secondaryMuscles: ['Hip flexors', 'Lats'],
    equipment: ['bench'],
    progressionPath: [],
    regressionPath: ['Negative dragon flag', 'Tuck dragon flag'],
    coachingCues: ['Corps rigide', 'Contrôle excentrique', 'Lats activés'],
    commonMistakes: ['Hanches qui cassent', 'Trop rapide', 'Perte tension'],
    safetyNotes: ['Skill élite: core extrêmement fort requis']
  }
];

export const SKILLS_EXERCISES: CalisthenicsExerciseDefinition[] = [
  {
    id: 'front-lever-tuck',
    name: 'Front Lever Tuck',
    category: 'skills',
    skillLevel: 'intermediate',
    description: 'Front lever genoux vers poitrine',
    primaryMuscles: ['Lats', 'Core', 'Shoulders'],
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: ['pull-up-bar'],
    progressionPath: ['Advanced tuck', 'Straddle', 'Full front lever'],
    regressionPath: ['Tuck dragon flag'],
    coachingCues: ['Corps horizontal', 'Genoux serrés', 'Lats activés', 'Regard neutre'],
    commonMistakes: ['Hanches trop hautes', 'Épaules pas engagées', 'Tête qui lève'],
    safetyNotes: ['Prérequis: 10+ pull-ups']
  },
  {
    id: 'full-front-lever',
    name: 'Full Front Lever',
    category: 'skills',
    skillLevel: 'elite',
    description: 'Corps complètement horizontal jambes tendues',
    primaryMuscles: ['Lats', 'Core', 'Shoulders'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Glutes'],
    equipment: ['pull-up-bar'],
    progressionPath: ['Front lever pull-ups', 'Front lever touch'],
    regressionPath: ['Straddle', 'One leg'],
    coachingCues: ['Corps rigide planche', 'Lats pull down', 'Glutes serrés'],
    commonMistakes: ['Hanches cassent', 'Jambes tombent', 'Épaules perdent position'],
    safetyNotes: ['Skill élite: patience de 1-2 ans']
  },
  {
    id: 'muscle-up',
    name: 'Muscle-up',
    category: 'skills',
    skillLevel: 'advanced',
    description: 'Transition pull-up vers dip en un mouvement',
    primaryMuscles: ['Lats', 'Pectoraux', 'Triceps'],
    secondaryMuscles: ['Core', 'Shoulders'],
    equipment: ['pull-up-bar'],
    progressionPath: ['Ring muscle-up', 'Weighted muscle-up'],
    regressionPath: ['High pull-ups', 'Negative muscle-up'],
    coachingCues: ['Pull explosif sternum', 'Transition rapide', 'Push agressif'],
    commonMistakes: ['Pas assez haut pull', 'Transition lente', 'Kip excessif'],
    safetyNotes: ['Prérequis: 10 pull-ups + 15 dips']
  },
  {
    id: 'human-flag',
    name: 'Human Flag',
    category: 'skills',
    skillLevel: 'elite',
    description: 'Corps horizontal perpendiculaire au poteau',
    primaryMuscles: ['Lats', 'Obliques', 'Shoulders'],
    secondaryMuscles: ['Core', 'Grip'],
    equipment: ['pole'],
    progressionPath: [],
    regressionPath: ['Tuck flag', 'Straddle flag'],
    coachingCues: ['Bras bas pousse', 'Bras haut tire', 'Corps rigide'],
    commonMistakes: ['Grip inadéquat', 'Corps pas rigide', 'Hanches cassent'],
    safetyNotes: ['Skill spectaculaire mais difficile']
  }
];

export const ALL_CALISTHENICS_EXERCISES: CalisthenicsExerciseDefinition[] = [
  ...PULL_EXERCISES,
  ...PUSH_EXERCISES,
  ...DIPS_EXERCISES,
  ...CORE_EXERCISES,
  ...SKILLS_EXERCISES
];

export const getExercisesBySkillLevel = (level: SkillLevel): CalisthenicsExerciseDefinition[] => {
  return ALL_CALISTHENICS_EXERCISES.filter(ex => ex.skillLevel === level);
};

export const getExercisesByCategory = (category: SkillCategory): CalisthenicsExerciseDefinition[] => {
  return ALL_CALISTHENICS_EXERCISES.filter(ex => ex.category === category);
};

export const getExerciseById = (id: string): CalisthenicsExerciseDefinition | undefined => {
  return ALL_CALISTHENICS_EXERCISES.find(ex => ex.id === id);
};
