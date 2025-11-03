/**
 * Profile Validation Service
 * Validates user profile completeness for different features (training, nutrition, etc.)
 */

import type { UserProfile } from '../../domain/profile';
import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

export interface ValidationResult {
  valid: boolean;
  missingFields: MissingField[];
  missingTabs: string[];
}

export interface MissingField {
  field: string;
  label: string;
  tab: 'identity' | 'training' | 'health' | 'locations';
  section: string;
  required: boolean;
}

/**
 * Validate profile for Training Generation
 * Requires: Identity essentials, fitness goals, training profile, locations, health
 */
export async function validateProfileForTraining(
  userId: string,
  profile: any
): Promise<ValidationResult> {
  const missingFields: MissingField[] = [];
  const missingTabs = new Set<string>();

  logger.info('PROFILE_VALIDATION', 'Validating profile for training generation', {
    userId,
    hasProfile: !!profile
  });

  // 1. Identity Tab - Informations Essentielles (REQUIRED)
  if (!profile?.displayName || profile.displayName.trim() === '') {
    missingFields.push({
      field: 'displayName',
      label: 'Nom d\'affichage',
      tab: 'identity',
      section: 'Informations Essentielles',
      required: true
    });
    missingTabs.add('identity');
  }

  if (!profile?.sex || profile.sex === '') {
    missingFields.push({
      field: 'sex',
      label: 'Genre',
      tab: 'identity',
      section: 'Informations Essentielles',
      required: true
    });
    missingTabs.add('identity');
  }

  if (!profile?.height_cm || profile.height_cm <= 0) {
    missingFields.push({
      field: 'height_cm',
      label: 'Taille (cm)',
      tab: 'identity',
      section: 'Informations Essentielles',
      required: true
    });
    missingTabs.add('identity');
  }

  if (!profile?.weight_kg || profile.weight_kg <= 0) {
    missingFields.push({
      field: 'weight_kg',
      label: 'Poids (kg)',
      tab: 'identity',
      section: 'Informations Essentielles',
      required: true
    });
    missingTabs.add('identity');
  }

  // 2. Identity Tab - Objectifs Fitness (REQUIRED)
  if (!profile?.activity_level || profile.activity_level === '') {
    missingFields.push({
      field: 'activity_level',
      label: 'Niveau d\'activité',
      tab: 'identity',
      section: 'Objectifs Fitness',
      required: true
    });
    missingTabs.add('identity');
  }

  if (!profile?.objective || profile.objective === '') {
    missingFields.push({
      field: 'objective',
      label: 'Objectif principal',
      tab: 'identity',
      section: 'Objectifs Fitness',
      required: true
    });
    missingTabs.add('identity');
  }

  // 3. Training Tab - Profil Sportif (REQUIRED)
  if (!profile?.preferences?.workout?.fitnessLevel || profile.preferences.workout.fitnessLevel === '') {
    missingFields.push({
      field: 'preferences.workout.fitnessLevel',
      label: 'Niveau de forme physique',
      tab: 'training',
      section: 'Profil Sportif',
      required: true
    });
    missingTabs.add('training');
  }

  if (!profile?.preferences?.workout?.type || profile.preferences.workout.type === '') {
    missingFields.push({
      field: 'preferences.workout.type',
      label: 'Type d\'entraînement préféré',
      tab: 'training',
      section: 'Profil Sportif',
      required: true
    });
    missingTabs.add('training');
  }

  if (!profile?.preferences?.workout?.sessionsPerWeek || profile.preferences.workout.sessionsPerWeek <= 0) {
    missingFields.push({
      field: 'preferences.workout.sessionsPerWeek',
      label: 'Séances par semaine',
      tab: 'training',
      section: 'Profil Sportif',
      required: true
    });
    missingTabs.add('training');
  }

  if (!profile?.preferences?.workout?.preferredDuration || profile.preferences.workout.preferredDuration <= 0) {
    missingFields.push({
      field: 'preferences.workout.preferredDuration',
      label: 'Durée préférée par séance',
      tab: 'training',
      section: 'Profil Sportif',
      required: true
    });
    missingTabs.add('training');
  }

  // 4. Training Tab - Lieux d'Entraînement (REQUIRED - at least 1 location)
  try {
    const { data: locations, error } = await supabase
      .from('training_locations')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      logger.error('PROFILE_VALIDATION', 'Error fetching training locations', { error });
    }

    if (!locations || locations.length === 0) {
      missingFields.push({
        field: 'training_locations',
        label: 'Lieux d\'entraînement',
        tab: 'training',
        section: 'Mes Lieux d\'Entraînement',
        required: true
      });
      missingTabs.add('training');
    }
  } catch (error) {
    logger.error('PROFILE_VALIDATION', 'Exception checking training locations', { error });
  }

  // 5. Health Tab - Conditions & Médicaments (REQUIRED - must be explicitly declared)
  // User must either have data OR explicitly declare no issues
  const hasHealthConditions = profile?.health?.conditions && Array.isArray(profile.health.conditions);
  const hasMedications = profile?.health?.medications && Array.isArray(profile.health.medications);
  const hasPhysicalLimitations = profile?.health?.physicalLimitations && Array.isArray(profile.health.physicalLimitations);
  const hasDeclaredNoIssues = profile?.health?.declaredNoIssues === true;

  if (!hasHealthConditions && !hasMedications && !hasPhysicalLimitations && !hasDeclaredNoIssues) {
    missingFields.push({
      field: 'health.declaredNoIssues',
      label: 'Déclaration de santé',
      tab: 'health',
      section: 'Conditions & Médicaments',
      required: true
    });
    missingTabs.add('health');
  }

  const result: ValidationResult = {
    valid: missingFields.length === 0,
    missingFields,
    missingTabs: Array.from(missingTabs)
  };

  logger.info('PROFILE_VALIDATION', 'Training validation complete', {
    userId,
    valid: result.valid,
    missingFieldsCount: missingFields.length,
    missingTabs: result.missingTabs
  });

  return result;
}

/**
 * Validate profile for Nutrition Generation
 * Requires: Identity essentials, nutrition preferences
 */
export async function validateProfileForNutrition(
  userId: string,
  profile: any
): Promise<ValidationResult> {
  const missingFields: MissingField[] = [];
  const missingTabs = new Set<string>();

  logger.info('PROFILE_VALIDATION', 'Validating profile for nutrition generation', {
    userId,
    hasProfile: !!profile
  });

  // 1. Identity essentials (same as training)
  if (!profile?.sex || profile.sex === '') {
    missingFields.push({
      field: 'sex',
      label: 'Genre',
      tab: 'identity',
      section: 'Informations Essentielles',
      required: true
    });
    missingTabs.add('identity');
  }

  if (!profile?.height_cm || profile.height_cm <= 0) {
    missingFields.push({
      field: 'height_cm',
      label: 'Taille (cm)',
      tab: 'identity',
      section: 'Informations Essentielles',
      required: true
    });
    missingTabs.add('identity');
  }

  if (!profile?.weight_kg || profile.weight_kg <= 0) {
    missingFields.push({
      field: 'weight_kg',
      label: 'Poids (kg)',
      tab: 'identity',
      section: 'Informations Essentielles',
      required: true
    });
    missingTabs.add('identity');
  }

  if (!profile?.activity_level || profile.activity_level === '') {
    missingFields.push({
      field: 'activity_level',
      label: 'Niveau d\'activité',
      tab: 'identity',
      section: 'Objectifs Fitness',
      required: true
    });
    missingTabs.add('identity');
  }

  // 2. Nutrition preferences
  if (!profile?.nutrition?.diet || profile.nutrition.diet === '') {
    missingFields.push({
      field: 'nutrition.diet',
      label: 'Régime alimentaire',
      tab: 'identity',
      section: 'Nutrition',
      required: false
    });
  }

  const result: ValidationResult = {
    valid: missingFields.filter(f => f.required).length === 0,
    missingFields,
    missingTabs: Array.from(missingTabs)
  };

  logger.info('PROFILE_VALIDATION', 'Nutrition validation complete', {
    userId,
    valid: result.valid,
    missingFieldsCount: missingFields.length,
    missingTabs: result.missingTabs
  });

  return result;
}

/**
 * Get user-friendly message for missing fields
 */
export function getMissingFieldsMessage(validation: ValidationResult): string {
  if (validation.valid) {
    return 'Profil complet';
  }

  const requiredFields = validation.missingFields.filter(f => f.required);
  if (requiredFields.length === 0) {
    return 'Profil valide';
  }

  const fieldsByTab: Record<string, MissingField[]> = {};
  for (const field of requiredFields) {
    if (!fieldsByTab[field.tab]) {
      fieldsByTab[field.tab] = [];
    }
    fieldsByTab[field.tab].push(field);
  }

  const messages: string[] = [];
  for (const [tab, fields] of Object.entries(fieldsByTab)) {
    const tabName = getTabDisplayName(tab);
    const fieldNames = fields.map(f => f.label).join(', ');
    messages.push(`${tabName}: ${fieldNames}`);
  }

  return `Champs manquants:\n${messages.join('\n')}`;
}

function getTabDisplayName(tab: string): string {
  const tabNames: Record<string, string> = {
    'identity': 'Onglet Identité',
    'training': 'Onglet Training',
    'health': 'Onglet Santé',
    'locations': 'Lieux d\'Entraînement'
  };
  return tabNames[tab] || tab;
}
