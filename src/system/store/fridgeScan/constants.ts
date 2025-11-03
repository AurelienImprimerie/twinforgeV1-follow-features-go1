import { FridgeScanStepData } from './types';

// Seuil minimum d'ingrédients pour déclencher les suggestions
export const MINIMUM_ITEMS_THRESHOLD = 10;

// Configuration des étapes de l'Atelier de Recettes
export const FRIDGE_SCAN_STEPS: FridgeScanStepData[] = [
  {
    id: 'photo',
    title: 'Capture Photos',
    subtitle: 'Capturez vos ingrédients disponibles',
    icon: 'Camera',
    color: '#EC4899',
    startProgress: 0
  },
  {
    id: 'analyze',
    title: 'Analyse IA',
    subtitle: 'La Forge Spatiale analyse vos ingrédients',
    icon: 'Zap',
    color: '#18E3FF',
    startProgress: 33
  },
  {
    id: 'complement',
    title: 'Suggestions IA',
    subtitle: 'Ajoutez des ingrédients complémentaires recommandés',
    icon: 'Plus',
    color: '#8B5CF6',
    startProgress: 66
  },
  {
    id: 'validation',
    title: 'Validation Client',
    subtitle: 'Confirmez et ajustez les ingrédients détectés',
    icon: 'Edit',
    color: '#F59E0B',
    startProgress: 100
  },
  {
    id: 'generating_recipes',
    title: 'Génération IA',
    subtitle: 'La Forge Spatiale crée vos recettes personnalisées',
    icon: 'Zap',
    color: '#10B981',
    startProgress: 120
  },
  {
    id: 'recipes',
    title: 'Recettes Générées',
    subtitle: 'Découvrez vos recettes personnalisées',
    icon: 'ChefHat',
    color: '#F59E0B',
    startProgress: 140
  }
];

// Étapes de chargement pour l'analyse IA
export const FRIDGE_ANALYSIS_LOADING_STEPS = [
  { message: 'Téléchargement des photos...', duration: 3000, icon: 'Upload' },
  { message: 'Analyse IA des ingrédients...', duration: 12000, icon: 'Zap' },
  { message: 'Détection des aliments...', duration: 8000, icon: 'Search' },
  { message: 'Évaluation de la fraîcheur...', duration: 6000, icon: 'Heart' },
  { message: 'Normalisation des données...', duration: 4000, icon: 'Settings' },
  { message: 'Préparation de l\'inventaire...', duration: 3000, icon: 'Check' }
];

// Stable storage key
export const STORAGE_KEY = 'twinforge:fridge-scan:pipeline';