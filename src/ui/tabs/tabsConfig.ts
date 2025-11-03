/**
 * Configuration centralisée pour les onglets
 * Couleurs, animations et variantes uniformisées pour toute l'application
 */

import { Variants } from 'framer-motion';

/**
 * Mapping des couleurs par type d'onglet
 * Utilisé pour le fond dégradé et l'icône active
 */
export const TAB_COLORS: Record<string, string> = {
  // Profil - Utilise le contexte "profile"
  'profile:identity': '#60A5FA',    // Bleu pour identité
  'profile:nutrition': '#10B981',   // Vert pour nutrition
  'profile:health': '#EF4444',      // Rouge pour santé
  'profile:fasting': '#F59E0B',     // Orange pour jeûne
  'profile:preferences': '#18E3FF', // Cyan pour training
  'profile:geo': '#EC4899',         // Rose pour géographique
  'profile:avatar': '#A855F7',      // Violet pour avatar

  // Atelier de Recettes (Fridge)
  'scanner': '#EC4899',     // Rose pour scanner
  'inventaire': '#06B6D4',  // Cyan pour inventaire
  'recipes': '#10B981',     // Vert pour recettes
  'plan': '#8B5CF6',        // Violet pour plan
  'courses': '#F59E0B',     // Orange pour courses

  // Meals (Forge Nutritionnelle) - Utilise le contexte "meals"
  'meals:daily': '#10B981',       // Vert pour aujourd'hui (nutrition quotidienne)
  'meals:insights': '#F59E0B',    // Orange pour insights nutritionnels
  'meals:progression': '#06B6D4', // Cyan pour progression nutritionnelle
  'meals:history': '#8B5CF6',     // Violet pour historique nutritionnel
  'journal': '#10B981',           // Vert pour journal (legacy)
  'statistiques': '#06B6D4',      // Cyan pour statistiques (legacy)

  // Fasting (Forge du Temps) - Utilise le contexte "fasting"
  'fasting:daily': '#F59E0B',     // Orange pour aujourd'hui
  'fasting:insights': '#10B981',  // Vert pour insights
  'fasting:progression': '#06B6D4', // Cyan pour progression
  'fasting:history': '#8B5CF6',   // Violet pour historique
  'timer': '#F59E0B',             // Orange pour timer (legacy)
  'protocoles': '#06B6D4',        // Cyan pour protocoles (legacy)

  // Activity (Forge Énergétique) - Utilise le contexte "activity"
  'activity:daily': '#3B82F6',       // Bleu pour aujourd'hui activité
  'activity:insights': '#F59E0B',    // Orange pour insights énergétiques
  'activity:progression': '#10B981', // Vert pour progression énergétique
  'activity:history': '#8B5CF6',     // Violet pour historique énergétique
  'activity:input': '#3B82F6',       // Bleu pour saisie (legacy)

  // Body Scan (Forge Corporelle) - Utilise le contexte "avatar"
  'avatar:scanCta': '#8B5CF6',     // Violet pour scanner
  'avatar:avatar': '#06B6D4',      // Cyan pour avatar
  'avatar:projection': '#10B981',  // Vert pour projection
  'avatar:insights': '#F59E0B',    // Orange pour insights avatar
  'avatar:history': '#8B5CF6',     // Violet pour historique avatar
  'avatar:face': '#EC4899',        // Rose pour visage
  'avatar:comparaison': '#A855F7', // Violet pour comparaison

  // Training (Atelier de Training)
  'aujourd hui': '#18E3FF', // Cyan pour aujourd'hui
  'conseils': '#10B981',    // Vert pour conseils
  'progressionTraining': '#F59E0B', // Jaune/Orange pour progression training (distinct de progression activity)
  'records': '#EF4444',     // Rouge pour records
  'historiqueTraining': '#8B5CF6',  // Violet pour historique training (distinct de historique activity)
  'programmes': '#18E3FF',  // Cyan pour programmes
  'exercices': '#06B6D4',   // Cyan pour exercices

  // Settings - Couleurs harmonisées avec les pages correspondantes
  'account': '#10B981',       // Vert pour forfaits
  'performance': '#F59E0B',   // Jaune/Orange pour performance
  'preferences': '#8B5CF6',   // Violet pour préférences
  'general': '#8B5CF6',       // Violet pour général (legacy)
  'notifications': '#EC4899', // Rose pour notifications
  'confidentialite': '#3B82F6', // Bleu pour confidentialité
  'appareils': '#06B6D4',     // Cyan pour appareils connectés

  // Notifications
  'recentes': '#EC4899',    // Rose pour récentes
  'parametres': '#8B5CF6',  // Violet pour paramètres

  // Health Profile (Profil de Santé) - Utilise le contexte "health"
  'health:overview': '#EF4444',      // Rouge pour vue d'ensemble
  'health:basic-info': '#EF4444',    // Rouge pour informations de base
  'health:lifestyle': '#F59E0B',     // Jaune pour style de vie
  'health:intimacy': '#EC4899',      // Rose pour intimité
  'health:family-history': '#06B6D4', // Cyan pour famille
  'health:vital-signs': '#8B5CF6',   // Violet pour signes vitaux
  'health:geographic': '#3B82F6',    // Bleu pour géographique
};

/**
 * Animation d'entrée uniforme pour tous les onglets
 * Remplace les animations incohérentes
 */
export const uniformTabPanelVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      mass: 0.8,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

/**
 * Animation de carte de section uniforme
 * Utilisée pour les GlassCard dans les onglets
 */
export const uniformSectionCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Container stagger pour animer plusieurs cartes séquentiellement
 */
export const uniformStaggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Variant pour les éléments dans un container stagger
 */
export const uniformStaggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

/**
 * Animation fade simple pour les boutons et actions
 */
export const uniformFadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Récupère la couleur d'un onglet
 */
export function getTabColor(tabValue: string): string | undefined {
  return TAB_COLORS[tabValue];
}

/**
 * Vérifie si l'animation réduite est activée
 */
export function shouldReduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Retourne les variants appropriés en fonction des préférences
 */
export function getOptimizedVariants(variants: Variants): Variants {
  if (shouldReduceMotion()) {
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = {
        ...(variants[key] as object),
        transition: { duration: 0 },
      };
      return acc;
    }, {} as Variants);
  }
  return variants;
}

/**
 * Récupère la couleur d'un onglet avec support du contexte de forge
 */
export function getTabColorWithContext(tabValue: string, forgeContext?: string): string | undefined {
  if (forgeContext) {
    const contextualKey = `${forgeContext}:${tabValue}`;
    const contextualColor = getTabColor(contextualKey);
    if (contextualColor) return contextualColor;
  }
  return getTabColor(tabValue);
}
