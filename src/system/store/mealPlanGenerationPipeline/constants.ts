import { MealPlanGenerationStepData } from './types';

// Configuration de la pipeline de génération de plans alimentaires
// 3 étapes optimisées avec agents parallèles
export const MEAL_PLAN_GENERATION_STEPS: MealPlanGenerationStepData[] = [
  {
    id: 'configuration',
    title: 'Configuration',
    subtitle: 'Sélectionnez vos préférences de planification',
    icon: 'Settings',
    color: '#8B5CF6',
    startProgress: 0
  },
  {
    id: 'generating',
    title: 'Génération et Enrichissement',
    subtitle: '3 agents travaillent ensemble en temps réel',
    icon: 'Sparkles',
    color: '#A855F7',
    startProgress: 33
  },
  {
    id: 'validation',
    title: 'Validation Finale',
    subtitle: 'Revoyez votre plan complet avec recettes détaillées',
    icon: 'Check',
    color: '#10B981',
    startProgress: 66
  }
];

// Nombre de semaines par défaut
export const DEFAULT_WEEK_COUNT = 1;

// Options pour le nombre de semaines
export const WEEK_COUNT_OPTIONS = [
  { value: 1, label: '1 semaine' },
  { value: 2, label: '2 semaines (recommandé)' },
  { value: 3, label: '3 semaines' },
  { value: 4, label: '4 semaines (1 mois)' }
];

// Storage key pour la persistence
export const STORAGE_KEY = 'twinforge:meal-plan-generation:pipeline';
