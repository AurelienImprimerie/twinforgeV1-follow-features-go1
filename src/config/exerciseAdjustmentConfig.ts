/**
 * Exercise Adjustment CTA Configuration
 * Advanced granular options for modifying exercises
 */

export type ExerciseAdjustmentCategory =
  | 'volume'
  | 'intensity'
  | 'technique'
  | 'equipment'
  | 'substitution'
  | 'timing';

export interface ExerciseAdjustmentButton {
  id: string;
  label: string;
  icon: string;
  color: string;
  category: ExerciseAdjustmentCategory;
  action: 'increase' | 'decrease' | 'modify' | 'substitute' | 'info';
  description: string;
  shortMessage: string;
}

export const EXERCISE_ADJUSTMENT_BUTTONS: ExerciseAdjustmentButton[] = [
  {
    id: 'increase-sets',
    label: '+1 Série',
    icon: 'Plus',
    color: '#10B981',
    category: 'volume',
    action: 'increase',
    description: 'Ajouter une série supplémentaire',
    shortMessage: 'J\'aimerais ajouter une série supplémentaire'
  },
  {
    id: 'decrease-sets',
    label: '-1 Série',
    icon: 'Minus',
    color: '#F59E0B',
    category: 'volume',
    action: 'decrease',
    description: 'Retirer une série',
    shortMessage: 'J\'aimerais retirer une série'
  },
  {
    id: 'increase-reps',
    label: '+2 Reps',
    icon: 'TrendingUp',
    color: '#22C55E',
    category: 'volume',
    action: 'increase',
    description: 'Augmenter le nombre de répétitions',
    shortMessage: 'J\'aimerais faire plus de répétitions'
  },
  {
    id: 'decrease-reps',
    label: '-2 Reps',
    icon: 'TrendingDown',
    color: '#EF4444',
    category: 'volume',
    action: 'decrease',
    description: 'Diminuer le nombre de répétitions',
    shortMessage: 'J\'aimerais faire moins de répétitions'
  },
  {
    id: 'increase-load',
    label: 'Charge +',
    icon: 'ChevronUp',
    color: '#8B5CF6',
    category: 'intensity',
    action: 'increase',
    description: 'Augmenter la charge',
    shortMessage: 'C\'est trop léger, je peux mettre plus lourd'
  },
  {
    id: 'decrease-load',
    label: 'Charge -',
    icon: 'ChevronDown',
    color: '#EC4899',
    category: 'intensity',
    action: 'decrease',
    description: 'Diminuer la charge',
    shortMessage: 'C\'est trop lourd, je dois alléger'
  },
  {
    id: 'adjust-tempo',
    label: 'Tempo',
    icon: 'Timer',
    color: '#06B6D4',
    category: 'technique',
    action: 'modify',
    description: 'Modifier le tempo d\'exécution',
    shortMessage: 'Je veux ajuster le tempo de cet exercice'
  },
  {
    id: 'adjust-rest',
    label: 'Repos',
    icon: 'Clock',
    color: '#3B82F6',
    category: 'timing',
    action: 'modify',
    description: 'Modifier le temps de repos',
    shortMessage: 'Je voudrais ajuster le temps de repos'
  },
  {
    id: 'increase-rest',
    label: 'Repos +30s',
    icon: 'PlusCircle',
    color: '#14B8A6',
    category: 'timing',
    action: 'increase',
    description: 'Augmenter le temps de repos de 30 secondes',
    shortMessage: 'J\'ai besoin de plus de repos entre les séries'
  },
  {
    id: 'decrease-rest',
    label: 'Repos -30s',
    icon: 'MinusCircle',
    color: '#F97316',
    category: 'timing',
    action: 'decrease',
    description: 'Diminuer le temps de repos de 30 secondes',
    shortMessage: 'Je peux réduire le temps de repos'
  },
  {
    id: 'easier-variant',
    label: 'Variante Facile',
    icon: 'ArrowDown',
    color: '#84CC16',
    category: 'substitution',
    action: 'substitute',
    description: 'Proposer une variante plus facile',
    shortMessage: 'Cet exercice est trop difficile, tu as une variante plus facile ?'
  },
  {
    id: 'harder-variant',
    label: 'Variante Difficile',
    icon: 'ArrowUp',
    color: '#DC2626',
    category: 'substitution',
    action: 'substitute',
    description: 'Proposer une variante plus difficile',
    shortMessage: 'Cet exercice est trop facile, tu as une variante plus difficile ?'
  },
  {
    id: 'change-equipment',
    label: 'Changer Équipement',
    icon: 'Settings',
    color: '#6366F1',
    category: 'equipment',
    action: 'substitute',
    description: 'Utiliser un autre équipement',
    shortMessage: 'Je n\'ai pas cet équipement, on peut adapter ?'
  },
  {
    id: 'bodyweight-variant',
    label: 'Poids Corps',
    icon: 'User',
    color: '#A855F7',
    category: 'equipment',
    action: 'substitute',
    description: 'Version au poids du corps',
    shortMessage: 'Je préférerais une version au poids du corps'
  },
  {
    id: 'technique-help',
    label: 'Aide Technique',
    icon: 'HelpCircle',
    color: '#0EA5E9',
    category: 'technique',
    action: 'info',
    description: 'Obtenir des conseils techniques',
    shortMessage: 'Je voudrais des conseils sur la technique de cet exercice'
  },
  {
    id: 'substitute-exercise',
    label: 'Autre Exercice',
    icon: 'RefreshCw',
    color: '#F59E0B',
    category: 'substitution',
    action: 'substitute',
    description: 'Remplacer complètement l\'exercice',
    shortMessage: 'Je voudrais remplacer cet exercice par un autre'
  }
];

export const ADJUSTMENT_CATEGORIES = [
  {
    id: 'volume',
    label: 'Volume',
    icon: 'BarChart3',
    color: '#10B981',
    description: 'Séries et répétitions'
  },
  {
    id: 'intensity',
    label: 'Intensité',
    icon: 'Zap',
    color: '#8B5CF6',
    description: 'Charge et difficulté'
  },
  {
    id: 'technique',
    label: 'Technique',
    icon: 'Target',
    color: '#06B6D4',
    description: 'Exécution et tempo'
  },
  {
    id: 'equipment',
    label: 'Équipement',
    icon: 'Wrench',
    color: '#6366F1',
    description: 'Matériel utilisé'
  },
  {
    id: 'substitution',
    label: 'Substitution',
    icon: 'Repeat',
    color: '#F59E0B',
    description: 'Variantes et alternatives'
  },
  {
    id: 'timing',
    label: 'Timing',
    icon: 'Clock',
    color: '#3B82F6',
    description: 'Temps de repos'
  }
] as const;

export function getAdjustmentButtonsByCategory(category: ExerciseAdjustmentCategory) {
  return EXERCISE_ADJUSTMENT_BUTTONS.filter(btn => btn.category === category);
}

export function getAdjustmentButtonById(id: string) {
  return EXERCISE_ADJUSTMENT_BUTTONS.find(btn => btn.id === id);
}
