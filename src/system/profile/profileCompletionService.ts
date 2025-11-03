/**
 * Profile Completion Service
 * Service for checking profile completeness and providing guidance for Recipe Workshop
 */

import type { UserProfile } from '../../domain/profile';
import logger from '../../lib/utils/logger';

export interface CriticalField {
  key: string;
  label: string;
  description: string;
  profileTab: 'identity' | 'nutrition' | 'health' | 'fasting' | 'preferences' | 'avatar';
  sectionHash?: string; // Optional hash to scroll to specific section
  priority: 'high' | 'medium' | 'low';
}

export interface ProfileCompletionResult {
  isSufficient: boolean;
  completionPercentage: number;
  missingCriticalFields: CriticalField[];
  missingHighPriorityFields: CriticalField[];
  suggestedMessage: string;
  nextAction: {
    label: string;
    route: string;
  } | null;
}

/**
 * Critical fields required for optimal Recipe Workshop experience
 */
const CRITICAL_FIELDS: CriticalField[] = [
  // High Priority - Essential for basic functionality
  {
    key: 'sex',
    label: 'Genre',
    description: 'Nécessaire pour calculer les besoins nutritionnels',
    profileTab: 'identity',
    priority: 'high'
  },
  {
    key: 'weight_kg',
    label: 'Poids',
    description: 'Essentiel pour les portions et calories',
    profileTab: 'identity',
    priority: 'high'
  },
  {
    key: 'height_cm',
    label: 'Taille',
    description: 'Nécessaire pour les calculs métaboliques',
    profileTab: 'identity',
    priority: 'high'
  },
  {
    key: 'nutrition.allergies',
    label: 'Allergies',
    description: 'Important pour la sécurité alimentaire',
    profileTab: 'nutrition',
    sectionHash: 'restrictions-section',
    priority: 'medium'
  },
  {
    key: 'householdDetails.adults',
    label: 'Nombre d\'adultes',
    description: 'Pour adapter les portions des recettes',
    profileTab: 'nutrition',
    sectionHash: 'essentials-section',
    priority: 'high'
  },
  
  // Medium Priority - Important for personalization
  {
    key: 'nutrition.diet',
    label: 'Régime alimentaire',
    description: 'Pour des recettes adaptées à votre style',
    profileTab: 'nutrition',
    sectionHash: 'diet-section',
    priority: 'medium'
  },
  {
    key: 'mealPrepPreferences.cookingSkill',
    label: 'Niveau de cuisine',
    description: 'Pour adapter la complexité des recettes',
    profileTab: 'nutrition',
    sectionHash: 'essentials-section',
    priority: 'medium'
  },
  {
    key: 'kitchenEquipment',
    label: 'Équipement de cuisine',
    description: 'Pour des recettes réalisables chez vous',
    profileTab: 'nutrition',
    sectionHash: 'essentials-section',
    priority: 'medium'
  },
  {
    key: 'objective',
    label: 'Objectif fitness',
    description: 'Pour des recettes alignées sur vos objectifs',
    profileTab: 'identity',
    priority: 'medium'
  },
  
  // Low Priority - Nice to have for advanced personalization
  {
    key: 'nutrition.intolerances',
    label: 'Intolérances',
    description: 'Pour éviter les inconforts digestifs',
    profileTab: 'nutrition',
    sectionHash: 'restrictions-section',
    priority: 'low'
  },
  {
    key: 'foodPreferences.cuisines',
    label: 'Cuisines préférées',
    description: 'Pour des recettes qui vous plaisent',
    profileTab: 'nutrition',
    sectionHash: 'preferences-section',
    priority: 'low'
  },
  {
    key: 'macroTargets.kcal',
    label: 'Objectif calories',
    description: 'Pour des recettes équilibrées',
    profileTab: 'nutrition',
    sectionHash: 'macros-section',
    priority: 'low'
  }
];

/**
 * Check if a field exists and has a meaningful value
 */
function hasValidValue(profile: any, fieldKey: string): boolean {
  // Special case for allergies - if user explicitly said they have no allergies, consider it valid
  if (fieldKey === 'nutrition.allergies') {
    const hasAllergies = profile?.nutrition?.allergies && Array.isArray(profile.nutrition.allergies) && profile.nutrition.allergies.length > 0;
    const noKnownAllergies = profile?.nutrition?.noKnownAllergies === true;
    return hasAllergies || noKnownAllergies;
  }
  
  const keys = fieldKey.split('.');
  let current = profile;
  
  for (const key of keys) {
    if (!current || current[key] === undefined || current[key] === null) {
      return false;
    }
    current = current[key];
  }
  
  // Additional checks for meaningful values
  if (typeof current === 'string' && current.trim() === '') {
    return false;
  }
  
  if (Array.isArray(current) && current.length === 0) {
    return false;
  }
  
  if (typeof current === 'object' && Object.keys(current).length === 0) {
    return false;
  }

  // Special handling for householdDetails.adults: accept values >= 1
  if (fieldKey === 'householdDetails.adults') {
    return typeof current === 'number' && current >= 1;
  }

  if (typeof current === 'number' && current <= 0) {
    return false;
  }

  return true;
}

/**
 * Calculate profile completion for Recipe Workshop
 */
export function calculateRecipeWorkshopCompletion(profile: UserProfile | null): ProfileCompletionResult {
  if (!profile) {
    return {
      isSufficient: false,
      completionPercentage: 0,
      missingCriticalFields: CRITICAL_FIELDS,
      missingHighPriorityFields: CRITICAL_FIELDS.filter(f => f.priority === 'high'),
      suggestedMessage: 'Créez votre profil pour des recettes personnalisées',
      nextAction: {
        label: 'Créer mon profil',
        route: '/profile#identity'
      }
    };
  }

  logger.debug('PROFILE_COMPLETION_SERVICE', 'Calculating Recipe Workshop completion', {
    userId: profile.userId,
    hasBasicInfo: !!(profile.sex && profile.weight_kg && profile.height_cm),
    hasNutritionInfo: !!(profile.nutrition),
    hasHouseholdInfo: !!(profile.householdDetails),
    timestamp: new Date().toISOString()
  });

  const missingFields: CriticalField[] = [];
  const missingHighPriorityFields: CriticalField[] = [];
  
  // Check each critical field
  CRITICAL_FIELDS.forEach(field => {
    if (!hasValidValue(profile, field.key)) {
      missingFields.push(field);
      if (field.priority === 'high') {
        missingHighPriorityFields.push(field);
      }
    }
  });

  // Calculate completion percentage
  const totalFields = CRITICAL_FIELDS.length;
  const completedFields = totalFields - missingFields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  // Determine if profile is sufficient for recipe generation
  // Require at least all high priority fields + 50% of medium priority fields
  const highPriorityFields = CRITICAL_FIELDS.filter(f => f.priority === 'high');
  const mediumPriorityFields = CRITICAL_FIELDS.filter(f => f.priority === 'medium');
  const missingMediumFields = missingFields.filter(f => f.priority === 'medium');
  
  const hasAllHighPriority = missingHighPriorityFields.length === 0;
  const hasEnoughMediumPriority = missingMediumFields.length <= Math.floor(mediumPriorityFields.length * 0.5);
  
  const isSufficient = hasAllHighPriority && hasEnoughMediumPriority;

  // Generate guidance message and next action
  let suggestedMessage: string;
  let nextAction: { label: string; route: string } | null = null;

  if (missingHighPriorityFields.length > 0) {
    const firstMissing = missingHighPriorityFields[0];
    suggestedMessage = `Complétez votre ${firstMissing.label.toLowerCase()} pour des recettes personnalisées`;
    const hashPart = firstMissing.sectionHash ? `#${firstMissing.sectionHash}` : '';
    nextAction = {
      label: `Ajouter ${firstMissing.label}`,
      route: `/profile?tab=${firstMissing.profileTab}${hashPart}`
    };
  } else if (missingFields.length > 0) {
    const firstMissing = missingFields[0];
    suggestedMessage = `Ajoutez votre ${firstMissing.label.toLowerCase()} pour une meilleure personnalisation`;
    const hashPart = firstMissing.sectionHash ? `#${firstMissing.sectionHash}` : '';
    nextAction = {
      label: `Compléter ${firstMissing.label}`,
      route: `/profile?tab=${firstMissing.profileTab}${hashPart}`
    };
  } else {
    suggestedMessage = 'Profil complet ! Recettes ultra-personnalisées disponibles';
    nextAction = null;
  }

  logger.debug('PROFILE_COMPLETION_SERVICE', 'Recipe Workshop completion calculated', {
    userId: profile.userId,
    isSufficient,
    completionPercentage,
    missingHighPriorityCount: missingHighPriorityFields.length,
    missingTotalCount: missingFields.length,
    hasAllHighPriority,
    hasEnoughMediumPriority,
    timestamp: new Date().toISOString()
  });

  return {
    isSufficient,
    completionPercentage,
    missingCriticalFields: missingFields,
    missingHighPriorityFields,
    suggestedMessage,
    nextAction
  };
}

/**
 * Get specific guidance for a particular Recipe Workshop feature
 */
export function getFeatureSpecificGuidance(
  profile: UserProfile | null,
  feature: 'recipes' | 'shopping' | 'planning'
): {
  canProceed: boolean;
  warningMessage?: string;
  missingForFeature: CriticalField[];
} {
  const completion = calculateRecipeWorkshopCompletion(profile);
  
  // Feature-specific requirements
  const featureRequirements = {
    recipes: ['sex', 'weight_kg', 'nutrition.allergies', 'householdDetails.adults'],
    shopping: ['householdDetails.adults', 'nutrition.allergies', 'shoppingPreferences.frequencyPerWeek'],
    planning: ['householdDetails.adults', 'mealPrepPreferences.cookingSkill', 'macroTargets.kcal']
  };

  const requiredFields = featureRequirements[feature] || [];
  const missingForFeature = completion.missingCriticalFields.filter(field => 
    requiredFields.includes(field.key)
  );

  const canProceed = missingForFeature.length === 0 || completion.isSufficient;
  
  let warningMessage = '';
  if (!canProceed && missingForFeature.length > 0) {
    const fieldNames = missingForFeature.slice(0, 2).map(f => f.label.toLowerCase()).join(' et ');
    warningMessage = `Ajoutez votre ${fieldNames} pour une ${feature === 'recipes' ? 'génération' : feature === 'shopping' ? 'liste' : 'planification'} optimale`;
  }

  return {
    canProceed,
    warningMessage,
    missingForFeature
  };
}

/**
 * Check if user has minimum data for any Recipe Workshop functionality
 */
export function hasMinimumDataForRecipeWorkshop(profile: UserProfile | null): boolean {
  if (!profile) return false;

  // Absolute minimum: at least basic identity info
  return !!(profile.sex && profile.weight_kg && profile.height_cm);
}

/**
 * Calculate profile completion for Meal Tracking (Meals Forge)
 */
export function calculateMealTrackingCompletion(profile: UserProfile | null): ProfileCompletionResult {
  const requiredFields: CriticalField[] = [
    {
      key: 'sex',
      label: 'Genre',
      description: 'Pour calculer vos besoins caloriques',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'weight_kg',
      label: 'Poids',
      description: 'Essentiel pour le suivi nutritionnel',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'height_cm',
      label: 'Taille',
      description: 'Pour calculer votre métabolisme de base',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'nutrition.allergies',
      label: 'Allergies',
      description: 'Important pour la sécurité alimentaire',
      profileTab: 'nutrition',
      sectionHash: 'restrictions-section',
      priority: 'medium'
    },
    {
      key: 'macroTargets.kcal',
      label: 'Objectif calories',
      description: 'Pour suivre vos apports quotidiens',
      profileTab: 'nutrition',
      sectionHash: 'macros-section',
      priority: 'medium'
    }
  ];

  return calculateCompletion(profile, requiredFields, 'Scannez votre premier repas');
}

/**
 * Calculate profile completion for Activity Tracking
 */
export function calculateActivityTrackingCompletion(profile: UserProfile | null): ProfileCompletionResult {
  const requiredFields: CriticalField[] = [
    {
      key: 'sex',
      label: 'Genre',
      description: 'Pour calculer vos dépenses caloriques',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'weight_kg',
      label: 'Poids',
      description: 'Essentiel pour le calcul des calories brûlées',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'height_cm',
      label: 'Taille',
      description: 'Pour les calculs métaboliques',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'objective',
      label: 'Objectif fitness',
      description: 'Pour des recommandations adaptées',
      profileTab: 'identity',
      priority: 'medium'
    }
  ];

  return calculateCompletion(profile, requiredFields, 'Enregistrez votre première activité');
}

/**
 * Calculate profile completion for Fasting Tracking
 */
export function calculateFastingTrackingCompletion(profile: UserProfile | null): ProfileCompletionResult {
  const requiredFields: CriticalField[] = [
    {
      key: 'sex',
      label: 'Genre',
      description: 'Pour des recommandations de jeûne adaptées',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'weight_kg',
      label: 'Poids',
      description: 'Pour suivre l\'impact du jeûne',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'fastingPreferences.experience',
      label: 'Expérience jeûne',
      description: 'Pour des protocoles adaptés à votre niveau',
      profileTab: 'fasting',
      priority: 'medium'
    },
    {
      key: 'objective',
      label: 'Objectif',
      description: 'Pour optimiser votre stratégie de jeûne',
      profileTab: 'identity',
      priority: 'medium'
    }
  ];

  return calculateCompletion(profile, requiredFields, 'Commencez votre premier jeûne');
}

/**
 * Calculate profile completion for Body/Avatar Scanning
 */
export function calculateAvatarScanCompletion(profile: UserProfile | null): ProfileCompletionResult {
  const requiredFields: CriticalField[] = [
    {
      key: 'sex',
      label: 'Genre',
      description: 'Essentiel pour la génération de l\'avatar',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'weight_kg',
      label: 'Poids',
      description: 'Pour calibrer les proportions',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'height_cm',
      label: 'Taille',
      description: 'Base pour les dimensions corporelles',
      profileTab: 'identity',
      priority: 'high'
    }
  ];

  return calculateCompletion(profile, requiredFields, 'Scannez votre corps en 3D');
}

/**
 * Generic completion calculator helper
 */
function calculateCompletion(
  profile: UserProfile | null,
  requiredFields: CriticalField[],
  defaultAction: string
): ProfileCompletionResult {
  if (!profile) {
    return {
      isSufficient: false,
      completionPercentage: 0,
      missingCriticalFields: requiredFields,
      missingHighPriorityFields: requiredFields.filter(f => f.priority === 'high'),
      suggestedMessage: 'Complétez votre profil pour commencer',
      nextAction: {
        label: 'Compléter mon profil',
        route: '/profile#identity'
      }
    };
  }

  const missingFields: CriticalField[] = [];
  const missingHighPriorityFields: CriticalField[] = [];

  requiredFields.forEach(field => {
    if (!hasValidValue(profile, field.key)) {
      missingFields.push(field);
      if (field.priority === 'high') {
        missingHighPriorityFields.push(field);
      }
    }
  });

  const totalFields = requiredFields.length;
  const completedFields = totalFields - missingFields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const highPriorityFields = requiredFields.filter(f => f.priority === 'high');
  const mediumPriorityFields = requiredFields.filter(f => f.priority === 'medium');
  const missingMediumFields = missingFields.filter(f => f.priority === 'medium');

  const hasAllHighPriority = missingHighPriorityFields.length === 0;
  const hasEnoughMediumPriority = missingMediumFields.length <= Math.floor(mediumPriorityFields.length * 0.5);

  const isSufficient = hasAllHighPriority && hasEnoughMediumPriority;

  let suggestedMessage: string;
  let nextAction: { label: string; route: string } | null = null;

  if (missingHighPriorityFields.length > 0) {
    const firstMissing = missingHighPriorityFields[0];
    suggestedMessage = `Ajoutez votre ${firstMissing.label.toLowerCase()} pour ${defaultAction.toLowerCase()}`;
    const hashPart = firstMissing.sectionHash ? `#${firstMissing.sectionHash}` : '';
    nextAction = {
      label: `Ajouter ${firstMissing.label}`,
      route: `/profile?tab=${firstMissing.profileTab}${hashPart}`
    };
  } else if (missingFields.length > 0) {
    const firstMissing = missingFields[0];
    suggestedMessage = `Complétez votre ${firstMissing.label.toLowerCase()} pour une meilleure expérience`;
    const hashPart = firstMissing.sectionHash ? `#${firstMissing.sectionHash}` : '';
    nextAction = {
      label: `Compléter ${firstMissing.label}`,
      route: `/profile?tab=${firstMissing.profileTab}${hashPart}`
    };
  } else {
    suggestedMessage = 'Profil complet ! Toutes les fonctionnalités sont disponibles';
    nextAction = null;
  }

  return {
    isSufficient,
    completionPercentage,
    missingCriticalFields: missingFields,
    missingHighPriorityFields,
    suggestedMessage,
    nextAction
  };
}

/**
 * Calculate profile completion for Training/Coaching
 */
export function calculateTrainingCompletion(profile: UserProfile | null): ProfileCompletionResult {
  const requiredFields: CriticalField[] = [
    {
      key: 'sex',
      label: 'Genre',
      description: 'Pour des programmes d\'entraînement adaptés',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'weight_kg',
      label: 'Poids',
      description: 'Essentiel pour calibrer les charges',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'height_cm',
      label: 'Taille',
      description: 'Pour adapter les mouvements',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'objective',
      label: 'Objectif fitness',
      description: 'Pour construire le programme optimal',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'trainingPreferences.experienceLevel',
      label: 'Niveau d\'expérience',
      description: 'Pour adapter la complexité des exercices',
      profileTab: 'identity',
      priority: 'high'
    },
    {
      key: 'trainingPreferences.availableEquipment',
      label: 'Équipement disponible',
      description: 'Pour générer des séances réalisables',
      profileTab: 'identity',
      priority: 'high'
    }
  ];

  return calculateCompletion(profile, requiredFields, 'Démarrez votre coaching');
}

/**
 * Profile Completion Service Object
 * Convenient wrapper for all profile completion functions
 */
export const profileCompletionService = {
  checkCompleteness: calculateRecipeWorkshopCompletion,
  getFeatureGuidance: getFeatureSpecificGuidance,
  hasMinimumData: hasMinimumDataForRecipeWorkshop,
  checkMealTracking: calculateMealTrackingCompletion,
  checkActivityTracking: calculateActivityTrackingCompletion,
  checkFastingTracking: calculateFastingTrackingCompletion,
  checkAvatarScan: calculateAvatarScanCompletion,
  checkTraining: calculateTrainingCompletion
};