// src/app/pages/Meals/components/MealPhotoCaptureStep/benefitsConfig.ts
/**
 * Benefits configuration for meal scanning modes
 */

import type { Benefit } from '../../../../../ui/cards/BenefitsInfoCard';

export const mealScanBenefits: Benefit[] = [
  {
    id: 'nutrition-tracking',
    icon: 'TrendingUp',
    color: '#22C55E',
    title: 'Suivi Nutritionnel',
    description: 'Analysez vos apports en macronutriments et calories'
  },
  {
    id: 'ai-detection',
    icon: 'Zap',
    color: '#10B981',
    title: 'Détection IA',
    description: 'Identification automatique des aliments et portions'
  },
  {
    id: 'personalized-insights',
    icon: 'Target',
    color: '#059669',
    title: 'Conseils Personnalisés',
    description: 'Recommandations adaptées à vos objectifs'
  }
];

export const barcodeScanBenefits: Benefit[] = [
  {
    id: 'instant-analysis',
    icon: 'Zap',
    color: '#6366F1',
    title: 'Analyse Instantanée',
    description: 'Récupération immédiate des données nutritionnelles'
  },
  {
    id: 'accurate-data',
    icon: 'Database',
    color: '#818CF8',
    title: 'Données Précises',
    description: 'Informations officielles des fabricants via OpenFoodFacts'
  },
  {
    id: 'easy-tracking',
    icon: 'Package',
    color: '#4F46E5',
    title: 'Suivi Simplifié',
    description: 'Idéal pour les produits emballés et transformés'
  }
];
