/**
 * Quick Actions Configuration
 * Configuration centralisée pour les actions rapides du panneau central
 */

import { ICONS } from '../ui/icons/registry';

export interface QuickAction {
  id: string;
  label: string;
  subtitle: string;
  icon: keyof typeof ICONS;
  route?: string;
  color: string;
  available: boolean;
  description: string;
  comingSoon?: boolean;
  onClick?: () => void;
}

export interface QuickActionSection {
  key?: string; // facilite la sélection robuste côté UI
  title: string;
  actions: QuickAction[];
}

/**
 * Configuration des sections d'actions rapides
 */
export const QUICK_ACTION_SECTIONS: QuickActionSection[] = [
  {
    key: 'navigation',
    title: 'Navigation Principale',
    actions: [
      {
        id: 'home',
        label: 'Tableau de Bord',
        subtitle: 'Vue d\'ensemble TwinForge',
        icon: 'Home',
        route: '/',
        color: '#F7931E',
        available: true,
        description: 'Retourner au tableau de bord principal'
      }
    ]
  },

  // ==================== CATÉGORIE: ALIMENTATION ====================
  {
    key: 'alimentation',
    title: 'Alimentation',
    actions: [
      {
        id: 'scan-meal',
        label: 'Scanner de Repas',
        subtitle: 'Analysez vos repas',
        icon: 'Camera',
        route: '/meals/scan',
        color: '#10B981',
        available: true,
        description: 'Analyser un repas avec précision'
      },
      {
        id: 'generate-recipe',
        label: 'Générateur de Recettes',
        subtitle: 'Recettes personnalisées',
        icon: 'ChefHat',
        route: '/fridge#recipes',
        color: '#EC4899',
        available: true,
        description: 'Générer des recettes personnalisées'
      },
      {
        id: 'generate-meal-plan',
        label: 'Générateur de Plans',
        subtitle: 'Plan alimentaire hebdo',
        icon: 'Calendar',
        route: '/fridge#plan',
        color: '#8B5CF6',
        available: true,
        description: 'Générer un plan de repas personnalisé'
      },
      {
        id: 'generate-shopping-list',
        label: 'Générateur de Courses',
        subtitle: 'Liste optimisée',
        icon: 'ShoppingCart',
        route: '/fridge#courses',
        color: '#F59E0B',
        available: true,
        description: 'Créer une liste de courses optimisée'
      },
      {
        id: 'scan-fridge',
        label: 'Scanner de Frigo',
        subtitle: 'Inventaire intelligent',
        icon: 'Scan',
        route: '/fridge/scan',
        color: '#06B6D4',
        available: true,
        description: 'Scanner votre frigo pour créer un inventaire'
      }
    ]
  },

  // ==================== CATÉGORIE: ACTIVITÉ ====================
  {
    key: 'activite',
    title: 'Activité',
    actions: [
      {
        id: 'coach-training',
        label: 'Coach Training',
        subtitle: 'Live Training',
        icon: 'Dumbbell',
        route: '/training',
        color: '#18E3FF', // Cyan - harmonisé avec Forge Corporelle
        available: true,
        description: 'Accéder à la pipeline de training avec coaching en direct'
      },
      {
        id: 'track-activity',
        label: "Tracker d'Activité",
        subtitle: "Enregistrez vos séances",
        icon: 'Activity',
        route: '/activity/input',
        color: '#3B82F6',
        available: true,
        description: "Enregistrer une nouvelle séance d'activité"
      }
    ]
  },

  // ==================== CATÉGORIE: SANTÉ ====================
  {
    key: 'sante',
    title: 'Santé',
    actions: [
      {
        id: 'start-fasting',
        label: 'Tracker de Jeûne',
        subtitle: 'Gérez vos sessions',
        icon: 'Timer',
        route: '/fasting/input',
        color: '#F59E0B',
        available: true,
        description: 'Commencer une période de jeûne'
      },
      {
        id: 'forge-vitale',
        label: 'Forge Vitale',
        subtitle: 'Bientôt disponible',
        icon: 'HeartPulse', // Harmonisé avec navigation.ts
        color: '#EF4444', // Rouge - harmonisé avec Forge Vitale
        available: false,
        comingSoon: true,
        description: 'Suivi de santé complet (bientôt disponible)'
      }
    ]
  },

  // ==================== BOUTON PRINCIPAL: AVATAR TWIN ====================
  {
    key: 'avatar-twin',
    title: 'TwinForge Avatar',
    actions: [
      {
        id: 'avatar-scan',
        label: 'Mon Avatar en 3D',
        subtitle: 'Créez votre jumeau numérique',
        icon: 'Scan',
        route: '/body-scan',
        color: '#A855F7', // Violet - harmonisé avec Mon Twin
        available: true,
        description: 'Scanner et créer votre avatar 3D personnalisé'
      }
    ]
  }
];