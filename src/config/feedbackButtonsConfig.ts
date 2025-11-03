/**
 * Feedback Buttons Configuration
 * Predefined feedback options for coach interaction
 */

import type { FeedbackButton } from '../domain/coachChat';

export const FEEDBACK_BUTTONS: FeedbackButton[] = [
  {
    id: 'intensity-too-easy',
    label: 'Trop Facile',
    icon: 'ChevronDown',
    color: '#10B981',
    category: 'intensity',
    message: 'Je trouve la séance un peu trop facile. On peut augmenter l\'intensité ?'
  },
  {
    id: 'intensity-perfect',
    label: 'Parfait',
    icon: 'Check',
    color: '#22C55E',
    category: 'intensity',
    message: 'L\'intensité est parfaite pour moi, ça me convient totalement !'
  },
  {
    id: 'intensity-too-hard',
    label: 'Trop Dur',
    icon: 'ChevronUp',
    color: '#EF4444',
    category: 'intensity',
    message: 'C\'est un peu trop intense pour aujourd\'hui. On peut baisser un peu ?'
  },
  {
    id: 'time-shorter',
    label: 'Plus Court',
    icon: 'Minus',
    color: '#F59E0B',
    category: 'time',
    message: 'J\'ai moins de temps que prévu. On peut raccourcir la séance ?'
  },
  {
    id: 'time-ok',
    label: 'Durée OK',
    icon: 'Clock',
    color: '#3B82F6',
    category: 'time',
    message: 'La durée me convient parfaitement, on garde ça !'
  },
  {
    id: 'time-longer',
    label: 'Plus Long',
    icon: 'Plus',
    color: '#8B5CF6',
    category: 'time',
    message: 'J\'ai du temps en plus. On peut ajouter du volume ?'
  },
  {
    id: 'exercise-change',
    label: 'Changer Exercice',
    icon: 'RefreshCw',
    color: '#06B6D4',
    category: 'exercise',
    message: 'J\'aimerais remplacer un exercice. Tu peux me proposer des alternatives ?'
  },
  {
    id: 'exercise-remove',
    label: 'Retirer',
    icon: 'X',
    color: '#EF4444',
    category: 'exercise',
    message: 'Je voudrais retirer un exercice de la séance.'
  },
  {
    id: 'exercise-add-cardio',
    label: 'Ajouter Cardio',
    icon: 'Heart',
    color: '#EC4899',
    category: 'exercise',
    message: 'Je veux ajouter du cardio à la fin. Tu as des suggestions ?'
  },
  {
    id: 'equipment-missing',
    label: 'Équipement Manquant',
    icon: 'AlertTriangle',
    color: '#F59E0B',
    category: 'equipment',
    message: 'Je n\'ai pas accès à un équipement nécessaire. On peut adapter ?'
  },
  {
    id: 'equipment-prefer',
    label: 'Autre Équipement',
    icon: 'Settings',
    color: '#6366F1',
    category: 'equipment',
    message: 'Je préférerais utiliser un autre équipement pour cet exercice.'
  }
];

export const FEEDBACK_CATEGORIES = [
  {
    id: 'intensity',
    label: 'Intensité',
    icon: 'Zap',
    color: '#22C55E'
  },
  {
    id: 'time',
    label: 'Durée',
    icon: 'Clock',
    color: '#3B82F6'
  },
  {
    id: 'exercise',
    label: 'Exercices',
    icon: 'Dumbbell',
    color: '#06B6D4'
  },
  {
    id: 'equipment',
    label: 'Équipement',
    icon: 'Wrench',
    color: '#F59E0B'
  }
] as const;
