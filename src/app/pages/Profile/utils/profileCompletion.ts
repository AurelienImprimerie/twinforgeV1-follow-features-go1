import type { UserProfile } from '../../../../domain/profile';
import { calculateRecipeWorkshopCompletion } from '../../../../system/profile/profileCompletionService';

/**
 * Vérifie si un champ possède une valeur "valide" et "significative".
 * - Chaîne : non vide
 * - Tableau : length > 0
 * - Objet : au moins 1 clé
 * - Nombre : > 0, sauf exceptions où 0 est acceptable (ex: enfants, piment)
 * - Booléen : toujours valide (true/false)
 */
function hasValidValue(profile: any, fieldKey: string): boolean {
  const keys = fieldKey.split('.');
  let current = profile;

  for (const key of keys) {
    if (!current || current[key] === undefined || current[key] === null) {
      return false;
    }
    current = current[key];
  }

  // Special handling for allergies - complete if noKnownAllergies is true OR allergies array has items
  if (fieldKey === 'nutrition.allergies') {
    const noKnownAllergies = profile?.nutrition?.noKnownAllergies;
    if (noKnownAllergies === true) {
      return true; // User explicitly stated no allergies
    }
    // Otherwise check if allergies array has items
    return Array.isArray(current) && current.length > 0;
  }

  // Special handling for intolerances - complete if it's an array (even empty means "no intolerances")
  if (fieldKey === 'nutrition.intolerances') {
    return Array.isArray(current); // Empty array is valid (means no intolerances)
  }

  // Chaînes non vides
  if (typeof current === 'string') {
    return current.trim() !== '';
  }

  // Tableaux non vides
  if (Array.isArray(current)) {
    return current.length > 0;
  }

  // Booléens : true/false sont considérés comme des valeurs "renseignées"
  if (typeof current === 'boolean') {
    return true;
  }

  // Objets non vides
  if (typeof current === 'object') {
    return Object.keys(current).length > 0;
  }

  // Nombres
  if (typeof current === 'number') {
    // Champs pour lesquels 0 est une valeur valide
    const zeroAllowed = new Set<string>([
      'householdDetails.children',
      'sensoryPreferences.spiceTolerance',
    ]);

    if (zeroAllowed.has(fieldKey)) {
      return Number.isFinite(current) && current >= 0;
    }
    return Number.isFinite(current) && current > 0;
  }

  // Par défaut, on considère valide
  return true;
}

/**
 * Complétion de l'onglet Identité
 */
export function calculateIdentityCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  const identityFields = [
    'displayName',
    'sex',
    'height_cm',
    'weight_kg',
    'birthdate',
    'target_weight_kg',
    'activity_level',
    'objective',
    'job_category',
    'phoneNumber',
  ];

  const completedFields = identityFields.filter((field) => hasValidValue(profile, field));
  return Math.round((completedFields.length / identityFields.length) * 100);
}

/**
 * Complétion de l'onglet Nutrition
 * - Retire les champs vraiment optionnels du dénominateur (ex: macroTargets.kcal)
 * - Allergies : considéré "complété" si tableau rempli OU noKnownAllergies = true
 * - Intolérances : si vide, ne pénalise pas (ne compte pas dans le dénominateur)
 * - Gère correctement les valeurs 0 (enfants, tolérance au piment)
 */
export function calculateNutritionCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  // Champs essentiels réellement requis pour finaliser l'onglet
  const requiredFields: string[] = [
    'nutrition.diet',
    'nutrition.budgetLevel',
    'nutrition.allergies', // Now handled by hasValidValue with special logic
    'nutrition.intolerances', // Now handled by hasValidValue with special logic

    'householdDetails.adults',
    'householdDetails.children',

    'mealPrepPreferences.weekdayTimeMin',
    'mealPrepPreferences.weekendTimeMin',
    'mealPrepPreferences.cookingSkill',

    // Équipement de base
    'kitchenEquipment.oven',
    'kitchenEquipment.stove',
    'kitchenEquipment.microwave',

    // Préférences utiles
    'foodPreferences.cuisines',
    'foodPreferences.ingredients',

    // Échelle 0–3 : 0 est valide
    'sensoryPreferences.spiceTolerance',

    'shoppingPreferences.frequencyPerWeek',
  ];

  let completed = 0;
  const total = requiredFields.length;

  // Check all required fields using the enhanced hasValidValue function
  for (const field of requiredFields) {
    if (hasValidValue(profile, field)) completed++;
  }

  const pct = Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
  return pct;
}

/**
 * Complétion de l'onglet Jeûne
 */
export function calculateFastingCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  const fastingFields = [
    'fastingWindow.protocol',
    'fastingWindow.start',
    'fastingWindow.end',
    'fastingWindow.windowHours',
    'fastingWindow.mealsPerDay',
    'nutrition.proteinTarget_g',
    'macroTargets.kcal',
  ];

  const completedFields = fastingFields.filter((field) => hasValidValue(profile, field));
  return Math.round((completedFields.length / fastingFields.length) * 100);
}

/**
 * Complétion de l'onglet Santé
 * Supports both V1 (basic) and V2 (enriched) schemas
 */
export function calculateHealthCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  const health = (profile as any).health;

  if (!health) {
    return 0;
  }

  if (health.version === '2.0') {
    const v2Fields = [
      'health.basic.bloodType',
      'health.medical_history.conditions',
      'health.medical_history.medications',
      'health.medical_history.family_history',
      'health.vital_signs.blood_pressure_systolic',
      'health.vital_signs.resting_heart_rate',
      'health.lifestyle.smoking_status',
      'health.lifestyle.alcohol_frequency',
      'health.lifestyle.sleep_hours_avg',
      'health.lifestyle.stress_level',
      'health.lifestyle.physical_activity_level',
      'health.vaccinations.up_to_date',
      'health.physical_limitations',
      'health.last_checkup_date',
    ];

    const completedFields = v2Fields.filter((field) => hasValidValue(profile, field));
    return Math.round((completedFields.length / v2Fields.length) * 100);
  }

  const v1Fields = [
    'health.bloodType',
    'health.conditions',
    'health.medications',
    'health.physicalLimitations',
    'constraints',
  ];

  const completedFields = v1Fields.filter((field) => hasValidValue(profile, field));
  return Math.round((completedFields.length / v1Fields.length) * 100);
}


/**
 * Complétion de l'onglet Avatar
 */
export function calculateAvatarCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  const avatarFields = [
    'avatarStatus',
    'avatarUrl',
    'preferences.final_shape_params',
    'preferences.final_limb_masses',
    'preferences.skin_tone',
    'preferences.avatar_version',
  ];

  const completedFields = avatarFields.filter((field) => hasValidValue(profile, field));
  return Math.round((completedFields.length / avatarFields.length) * 100);
}

/**
 * @deprecated Utiliser calculateRecipeWorkshopCompletion de profileCompletionService
 * Calcule un pourcentage global via le nouveau service (préserve l'API existante)
 */
export function calculateProfileCompletion(profile: UserProfile | null): number {
  const completion = calculateRecipeWorkshopCompletion(profile);
  return completion.completionPercentage;
}

/**
 * Complétion de l'onglet Training
 */
export function calculateTrainingCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  const trainingFields = [
    'preferences.workout.type',
    'preferences.workout.fitnessLevel',
    'preferences.workout.sessionsPerWeek',
    'preferences.workout.preferredDuration',
  ];

  const completedFields = trainingFields.filter((field) => hasValidValue(profile, field));
  return Math.round((completedFields.length / trainingFields.length) * 100);
}

/**
 * @deprecated Utiliser calculateRecipeWorkshopCompletion du service
 */
export function calculateRecipeWorkshopCompletionLegacy(profile: UserProfile | null): number {
  const completion = calculateRecipeWorkshopCompletion(profile);
  return completion.completionPercentage;
}