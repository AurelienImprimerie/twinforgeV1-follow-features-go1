/**
 * Profile Completeness Utilities
 * Functions for checking profile completeness across different forges
 */

import type { UserProfile } from '../../domain/profile';

export interface ProfileCompletenessResult {
  percentage: number;
  missingFields: string[];
  missingCritical: string[];
  isComplete: boolean;
  canProvideAccurateAnalysis: boolean;
}

export interface ProfileStatusMessage {
  title: string;
  type: 'error' | 'warning' | 'info' | 'success';
  actionText?: string;
}

export type ForgeContext = 'activity' | 'meals' | 'fasting' | 'culinary' | 'avatar';

interface FieldConfig {
  key: string;
  label: string;
}

/**
 * Configuration des champs critiques par forge
 * Chaque forge définit uniquement les champs ESSENTIELS pour fonctionner correctement
 */
const FORGE_CRITICAL_FIELDS: Record<ForgeContext, FieldConfig[]> = {
  // Forge Énergétique (Activités) - Besoin de calculer les dépenses caloriques
  activity: [
    { key: 'sex', label: 'Genre' },
    { key: 'height_cm', label: 'Taille' },
    { key: 'weight_kg', label: 'Poids' }
  ],

  // Forge Nutritionnelle (Repas) - Besoin de calculer les besoins caloriques et macros
  meals: [
    { key: 'sex', label: 'Genre' },
    { key: 'weight_kg', label: 'Poids' },
    { key: 'height_cm', label: 'Taille' },
    { key: 'objective', label: 'Objectif' }
  ],

  // Forge Temporelle (Jeûne) - Besoin de calculer les besoins et adapter les protocoles
  fasting: [
    { key: 'weight_kg', label: 'Poids' },
    { key: 'objective', label: 'Objectif' },
    { key: 'activity_level', label: 'Niveau d\'activité' }
  ],

  // Forge Culinaire (Scanner Frigo) - Besoin de recommandations adaptées
  culinary: [
    { key: 'weight_kg', label: 'Poids' },
    { key: 'objective', label: 'Objectif' }
  ],

  // Forge Corporelle (Body Scan) - Besoin des données de base pour le scan
  avatar: [
    { key: 'sex', label: 'Genre' },
    { key: 'height_cm', label: 'Taille' },
    { key: 'weight_kg', label: 'Poids' },
    { key: 'birthdate', label: 'Date de naissance' }
  ]
};

/**
 * Messages contextualisés par forge
 */
const FORGE_MESSAGES: Record<ForgeContext, { incomplete: string; complete: string }> = {
  activity: {
    incomplete: 'Profil incomplet pour le tracking d\'activité',
    complete: 'Profil optimisé pour le tracking d\'activité'
  },
  meals: {
    incomplete: 'Profil incomplet - Analyses nutritionnelles limitées',
    complete: 'Profil complet pour l\'analyse nutritionnelle'
  },
  fasting: {
    incomplete: 'Profil incomplet pour le suivi du jeûne',
    complete: 'Profil complet pour le jeûne intermittent'
  },
  culinary: {
    incomplete: 'Profil incomplet pour les recommandations culinaires',
    complete: 'Profil complet pour vos recommandations'
  },
  avatar: {
    incomplete: 'Profil incomplet pour le scan corporel',
    complete: 'Profil complet pour le scan 3D'
  }
};

/**
 * Calculate profile completeness for a specific forge context
 */
export function calculateProfileCompletenessForForge(
  profile: UserProfile | null,
  forgeContext: ForgeContext
): ProfileCompletenessResult {
  if (!profile) {
    const defaultCritical = FORGE_CRITICAL_FIELDS[forgeContext].map(f => f.label);
    return {
      percentage: 0,
      missingFields: ['Profil non chargé'],
      missingCritical: defaultCritical,
      isComplete: false,
      canProvideAccurateAnalysis: false
    };
  }

  // Get critical fields for this forge
  const criticalFields = FORGE_CRITICAL_FIELDS[forgeContext];

  // Check which critical fields are missing
  const missingCritical = criticalFields
    .filter(field => {
      const value = (profile as any)[field.key];
      return value === null || value === undefined || value === '';
    })
    .map(field => field.label);

  // Calculate percentage based only on critical fields for this forge
  const completedCriticalFields = criticalFields.filter(field => {
    const value = (profile as any)[field.key];
    return value !== null && value !== undefined && value !== '';
  });

  const percentage = criticalFields.length > 0
    ? Math.round((completedCriticalFields.length / criticalFields.length) * 100)
    : 100;

  return {
    percentage,
    missingFields: missingCritical, // Only critical fields matter
    missingCritical,
    isComplete: percentage === 100,
    canProvideAccurateAnalysis: missingCritical.length === 0
  };
}

/**
 * Legacy function for backward compatibility - defaults to 'meals' context
 * @deprecated Use calculateProfileCompletenessForForge instead
 */
export function calculateProfileCompleteness(profile: UserProfile | null): ProfileCompletenessResult {
  return calculateProfileCompletenessForForge(profile, 'meals');
}

/**
 * Get a status message based on profile completeness for a specific forge
 */
export function getProfileStatusMessageForForge(
  completeness: ProfileCompletenessResult,
  forgeContext: ForgeContext
): ProfileStatusMessage {
  const messages = FORGE_MESSAGES[forgeContext];

  // Profil complet - on n'affiche pas l'alerte
  if (completeness.isComplete || completeness.canProvideAccurateAnalysis) {
    return {
      title: messages.complete,
      type: 'success',
      actionText: 'Voir le profil'
    };
  }

  // Champs critiques manquants - afficher l'alerte
  if (completeness.missingCritical.length > 0) {
    return {
      title: messages.incomplete,
      type: 'error',
      actionText: 'Compléter'
    };
  }

  // Par défaut - ne devrait pas arriver avec notre logique
  return {
    title: messages.incomplete,
    type: 'warning',
    actionText: 'Compléter'
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getProfileStatusMessageForForge instead
 */
export function getProfileStatusMessage(completeness: ProfileCompletenessResult): ProfileStatusMessage {
  return getProfileStatusMessageForForge(completeness, 'meals');
}

/**
 * Get the most important missing fields
 */
export function getMostImportantMissingFields(profile: UserProfile | null): string[] {
  const completeness = calculateProfileCompleteness(profile);
  return completeness.missingCritical.length > 0
    ? completeness.missingCritical
    : completeness.missingFields.slice(0, 3);
}
