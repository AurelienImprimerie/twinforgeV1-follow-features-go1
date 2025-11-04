import { MealPlanGenerationStepData } from './types';

// Configuration de la pipeline de génération de plans alimentaires
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
    title: 'Forge des Plans',
    subtitle: 'La Forge Nutritionnelle crée vos plans alimentaires',
    icon: 'Sparkles',
    color: '#A855F7',
    startProgress: 20
  },
  {
    id: 'validation',
    title: 'Validation des Plans',
    subtitle: 'Vérifiez et validez vos plans hebdomadaires',
    icon: 'Calendar',
    color: '#8B5CF6',
    startProgress: 40
  },
  {
    id: 'recipe_details_generating',
    title: 'Forge des Recettes',
    subtitle: 'Génération des recettes détaillées pour vos plans',
    icon: 'ChefHat',
    color: '#A855F7',
    startProgress: 60
  },
  {
    id: 'recipe_details_validation',
    title: 'Validation Finale',
    subtitle: 'Vos plans alimentaires complets sont prêts',
    icon: 'Check',
    color: '#8B5CF6',
    startProgress: 80
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
