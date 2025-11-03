/**
 * Profile Mappers
 * Data transformation functions between store format (camelCase) and database format (snake_case)
 */

import logger from '../../lib/utils/logger';
import { emptyStringToNull } from './storeUtils';
import type { UserProfile } from '../../domain/profile';

// Profile type with extended fields
export interface Profile extends UserProfile {
  id: string;
  displayName?: string;
  phoneNumber?: string;
  avatarStatus?: 'none' | 'pending' | 'ready' | 'error';
  avatarUrl?: string;
  avatarOnboardingCompleted?: boolean;
  portraitUrl?: string;
  portraitSource?: string;
  // Legacy fields for backward compatibility
  preferences?: any;
}

// Database columns whitelist
const DB_COLUMNS = new Set([
  'user_id', 'display_name', 'birthdate', 'sex', 'height_cm', 'weight_kg',
  'target_weight_kg', 'body_fat_perc', 'activity_level', 'job_category', 'phone_number',
  'objective', 'avatar_status', 'avatar_url', 'created_at', 'updated_at',
  'goals', 'constraints', 'preferences', 'emotion_baseline', 'role',
  'emotions', 'nutrition', 'health', 'avatar_onboarding_completed',
  'portrait_url', 'portrait_source',
  'household_details', 'meal_prep_preferences', 'kitchen_equipment',
  'food_preferences', 'sensory_preferences', 'macro_targets', 'shopping_preferences'
]);

// Text fields that should be null instead of empty strings
const TEXT_FIELDS = new Set([
  'display_name', 'sex', 'activity_level', 'job_category', 'objective', 
  'avatar_status', 'avatar_url', 'portrait_url', 'portrait_source', 'phone_number'
]);

/**
 * Map camelCase profile updates to snake_case database columns
 */
export function mapProfileUpdatesToDb(updates: Partial<Profile>): any {
  // Enhanced DEBUG: Log mapping input
  logger.info('USER_STORE_MAPPING_INPUT', 'mapProfileUpdatesToDb input', {
    inputUpdates: updates,
    inputKeys: Object.keys(updates),
    inputSnapshot: {
      phoneNumber: updates.phoneNumber,
      activity_level: updates.activity_level,
      objective: updates.objective,
      job_category: updates.job_category,
    },
    inputUpdatesComplete: {
      displayName: updates.displayName,
      phoneNumber: updates.phoneNumber,
      birthdate: updates.birthdate,
      sex: updates.sex,
      height_cm: updates.height_cm,
      weight_kg: updates.weight_kg,
      target_weight_kg: updates.target_weight_kg,
      activity_level: updates.activity_level,
      objective: updates.objective,
      job_category: updates.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  const dbUpdates: any = {};

  for (const [key, value] of Object.entries(updates)) {
    let dbKey = key;
    let dbValue = value;

    // Convert camelCase to snake_case
    if (key === 'displayName') dbKey = 'display_name';
    else if (key === 'phoneNumber') dbKey = 'phone_number';
    else if (key === 'bodyFatPerc') dbKey = 'body_fat_perc';
    else if (key === 'avatarStatus') dbKey = 'avatar_status';
    else if (key === 'avatarUrl') dbKey = 'avatar_url';
    else if (key === 'avatarOnboardingCompleted') dbKey = 'avatar_onboarding_completed';
    else if (key === 'portraitUrl') dbKey = 'portrait_url';
    else if (key === 'portraitSource') dbKey = 'portrait_source';
    else if (key === 'emotionBaseline') dbKey = 'emotion_baseline';
    else if (key === 'householdDetails') dbKey = 'household_details';
    else if (key === 'mealPrepPreferences') dbKey = 'meal_prep_preferences';
    else if (key === 'kitchenEquipment') dbKey = 'kitchen_equipment';
    else if (key === 'foodPreferences') dbKey = 'food_preferences';
    else if (key === 'sensoryPreferences') dbKey = 'sensory_preferences';
    else if (key === 'macroTargets') dbKey = 'macro_targets';
    else if (key === 'shoppingPreferences') dbKey = 'shopping_preferences';

    // Only include valid database columns
    if (DB_COLUMNS.has(dbKey)) {
      // Convert empty strings to null for text fields
      if (TEXT_FIELDS.has(dbKey) && typeof dbValue === 'string' && dbValue.trim() === '') {
        dbValue = null;
      }

      dbUpdates[dbKey] = dbValue;

      // CRITICAL: Enhanced logging for avatar payload updates
      if (value && typeof value === 'object' && (value.avatar_version || value.final_shape_params || value.final_limb_masses || value.skin_tone)) {
        logger.debug('USER_STORE', 'Avatar payload update detected in preferences', {
          avatarVersion: value.avatar_version,
          hasFinalShapeParams: !!value.final_shape_params,
          finalShapeParamsCount: value.final_shape_params ? Object.keys(value.final_shape_params).length : 0,
          hasFinalLimbMasses: !!value.final_limb_masses,
          finalLimbMassesCount: value.final_limb_masses ? Object.keys(value.final_limb_masses).length : 0,
          hasSkinTone: !!value.skin_tone,
          skinToneRGB: value.skin_tone?.rgb ? `rgb(${value.skin_tone.rgb.r}, ${value.skin_tone.rgb.g}, ${value.skin_tone.rgb.b})` : 'none',
          hasResolvedGender: !!value.resolved_gender,
          resolvedGender: value.resolved_gender,
          gltfModelId: value.gltf_model_id,
          materialConfigVersion: value.material_config_version,
          mappingVersion: value.mapping_version,
          philosophy: 'avatar_payload_preferences_update'
        });
      }
    }
  }
  
  // Enhanced DEBUG: Log mapping output
  logger.info('USER_STORE_MAPPING_OUTPUT', 'mapProfileUpdatesToDb output', {
    outputUpdates: dbUpdates,
    outputKeys: Object.keys(dbUpdates),
    outputSnapshot: {
      phone_number: dbUpdates.phone_number,
      activity_level: dbUpdates.activity_level,
      objective: dbUpdates.objective,
      job_category: dbUpdates.job_category,
    },
    outputUpdatesComplete: {
      user_id: dbUpdates.user_id,
      display_name: dbUpdates.display_name,
      phone_number: dbUpdates.phone_number,
      birthdate: dbUpdates.birthdate,
      sex: dbUpdates.sex,
      height_cm: dbUpdates.height_cm,
      weight_kg: dbUpdates.weight_kg,
      target_weight_kg: dbUpdates.target_weight_kg,
      activity_level: dbUpdates.activity_level,
      objective: dbUpdates.objective,
      job_category: dbUpdates.job_category,
    },
    mappingResults: Object.entries(updates).map(([key, value]) => ({
      originalKey: key,
      mappedKey: key === 'displayName' ? 'display_name' :
                 key === 'phoneNumber' ? 'phone_number' :
                 key === 'bodyFatPerc' ? 'body_fat_perc' :
                 key === 'avatarStatus' ? 'avatar_status' :
                 key === 'avatarUrl' ? 'avatar_url' :
                 key === 'avatarOnboardingCompleted' ? 'avatar_onboarding_completed' :
                 key === 'portraitUrl' ? 'portrait_url' :
                 key === 'portraitSource' ? 'portrait_source' :
                 key === 'emotionBaseline' ? 'emotion_baseline' : key,
      originalValue: value,
      wasIncluded: DB_COLUMNS.has(key === 'displayName' ? 'display_name' :
                                  key === 'phoneNumber' ? 'phone_number' :
                                  key === 'bodyFatPerc' ? 'body_fat_perc' :
                                  key === 'avatarStatus' ? 'avatar_status' :
                                  key === 'avatarUrl' ? 'avatar_url' :
                                  key === 'avatarOnboardingCompleted' ? 'avatar_onboarding_completed' :
                                  key === 'portraitUrl' ? 'portrait_url' :
                                  key === 'portraitSource' ? 'portrait_source' :
                                  key === 'emotionBaseline' ? 'emotion_baseline' : key)
    })),
    timestamp: new Date().toISOString()
  });
  
  return dbUpdates;
}

/**
 * Map database profile to store profile format
 */
export async function mapDbProfileToProfile(dbProfile: any): Promise<Profile> {
  // CRITICAL DEBUG: Log the raw DB profile being mapped
  logger.info('USER_STORE_MAP_DB_TO_PROFILE_INPUT', 'Raw DB profile being mapped', {
    dbProfile: dbProfile,
    dbProfileKeys: Object.keys(dbProfile || {}),
    dbProfileSnapshot: {
      phone_number: dbProfile?.phone_number,
      activity_level: dbProfile?.activity_level,
      objective: dbProfile?.objective,
      job_category: dbProfile?.job_category,
    },
    dbProfileComplete: {
      user_id: dbProfile?.user_id,
      display_name: dbProfile?.display_name,
      phone_number: dbProfile?.phone_number,
      birthdate: dbProfile?.birthdate,
      sex: dbProfile?.sex,
      height_cm: dbProfile?.height_cm,
      weight_kg: dbProfile?.weight_kg,
      target_weight_kg: dbProfile?.target_weight_kg,
      activity_level: dbProfile?.activity_level,
      objective: dbProfile?.objective,
      job_category: dbProfile?.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  logger.info('USER_STORE_DB_TO_PROFILE_MAPPING', 'Mapping DB profile to store profile', {
    dbProfileSnapshot: {
      phone_number: dbProfile.phone_number,
      activity_level: dbProfile.activity_level,
      objective: dbProfile.objective,
      job_category: dbProfile.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  // Simplified preferences handling for meal scanner
  const correctedPreferences = dbProfile.preferences || {};
  
  const mappedProfile = {
    userId: dbProfile.user_id,
    id: dbProfile.user_id,
    displayName: emptyStringToNull(dbProfile.display_name),
    phoneNumber: emptyStringToNull(dbProfile.phone_number),
    birthdate: emptyStringToNull(dbProfile.birthdate || dbProfile.dob),
    sex: emptyStringToNull(dbProfile.sex),
    height_cm: dbProfile.height_cm,
    weight_kg: dbProfile.weight_kg,
    target_weight_kg: dbProfile.target_weight_kg,
    bodyFatPerc: dbProfile.body_fat_perc,
    activity_level: emptyStringToNull(dbProfile.activity_level),
    job_category: emptyStringToNull(dbProfile.job_category),
    objective: emptyStringToNull(dbProfile.objective),
    nutrition: {
      ...(dbProfile.nutrition || {}),
      allergies: Array.isArray(dbProfile.nutrition?.allergies) ? dbProfile.nutrition.allergies : [],
      intolerances: Array.isArray(dbProfile.nutrition?.intolerances) ? dbProfile.nutrition.intolerances : [],
    },
    householdDetails: dbProfile.household_details ? {
      adults: dbProfile.household_details.adults ?? 1,
      children: dbProfile.household_details.children ?? 0,
      dietaryRestrictions: dbProfile.household_details.dietaryRestrictions || []
    } : { adults: 1, children: 0, dietaryRestrictions: [] },
    mealPrepPreferences: dbProfile.meal_prep_preferences || {},
    kitchenEquipment: dbProfile.kitchen_equipment || {},
    foodPreferences: dbProfile.food_preferences || {},
    sensoryPreferences: dbProfile.sensory_preferences || {},
    macroTargets: dbProfile.macro_targets || {},
    shoppingPreferences: dbProfile.shopping_preferences || {},
    health: dbProfile.health || {},
    emotions: dbProfile.emotions || {},
    // Legacy support
    goals: dbProfile.goals || {},
    constraints: dbProfile.constraints || {},
    preferences: correctedPreferences,
    emotionBaseline: dbProfile.emotion_baseline || {},
    avatarStatus: emptyStringToNull(dbProfile.avatar_status),
    avatarUrl: emptyStringToNull(dbProfile.avatar_url),
    avatarOnboardingCompleted: dbProfile.avatar_onboarding_completed,
    portraitUrl: emptyStringToNull(dbProfile.portrait_url),
    portraitSource: emptyStringToNull(dbProfile.portrait_source),
  };
  
  // CRITICAL DEBUG: Log the final mapped profile
  logger.info('USER_STORE_MAP_DB_TO_PROFILE_OUTPUT', 'Final mapped profile output', {
    mappedProfile: mappedProfile,
    mappedProfileKeys: Object.keys(mappedProfile),
    mappedProfileSnapshot: {
      phoneNumber: mappedProfile.phoneNumber,
      activity_level: mappedProfile.activity_level,
      objective: mappedProfile.objective,
      job_category: mappedProfile.job_category,
    },
    mappedProfileComplete: {
      userId: mappedProfile.userId,
      displayName: mappedProfile.displayName,
      phoneNumber: mappedProfile.phoneNumber,
      birthdate: mappedProfile.birthdate,
      sex: mappedProfile.sex,
      height_cm: mappedProfile.height_cm,
      weight_kg: mappedProfile.weight_kg,
      target_weight_kg: mappedProfile.target_weight_kg,
      activity_level: mappedProfile.activity_level,
      objective: mappedProfile.objective,
      job_category: mappedProfile.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  logger.info('USER_STORE_MAPPING_RESULT', 'Final mapped profile', {
    mappedProfileSnapshot: {
      phoneNumber: mappedProfile.phoneNumber,
      activity_level: mappedProfile.activity_level,
      objective: mappedProfile.objective,
      job_category: mappedProfile.job_category,
    },
    mappedProfileComplete: {
      displayName: mappedProfile.displayName,
      sex: mappedProfile.sex,
      height_cm: mappedProfile.height_cm,
      weight_kg: mappedProfile.weight_kg,
      birthdate: mappedProfile.birthdate,
      target_weight_kg: mappedProfile.target_weight_kg,
      phoneNumber: mappedProfile.phoneNumber,
      activity_level: mappedProfile.activity_level,
      objective: mappedProfile.objective,
      job_category: mappedProfile.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  return mappedProfile;
}

/**
 * Map store profile to database format
 */
export function mapProfileToDb(profile: Profile, userId: string): any {
  // CRITICAL DEBUG: Log the profile being mapped to DB format
  logger.info('USER_STORE_MAP_PROFILE_TO_DB_INPUT', 'Profile being mapped to DB format', {
    profile: profile,
    profileKeys: Object.keys(profile),
    profileSnapshot: {
      phoneNumber: profile.phoneNumber,
      activity_level: profile.activity_level,
      objective: profile.objective,
      job_category: profile.job_category,
    },
    profileComplete: {
      userId: profile.userId,
      displayName: profile.displayName,
      phoneNumber: profile.phoneNumber,
      birthdate: profile.birthdate,
      sex: profile.sex,
      height_cm: profile.height_cm,
      weight_kg: profile.weight_kg,
      target_weight_kg: profile.target_weight_kg,
      activity_level: profile.activity_level,
      objective: profile.objective,
      job_category: profile.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  const dbProfile = {
    user_id: userId,
    display_name: profile.displayName,
    phone_number: profile.phoneNumber,
    birthdate: profile.birthdate,
    sex: profile.sex,
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    target_weight_kg: profile.target_weight_kg,
    activity_level: profile.activity_level,
    job_category: profile.job_category,
    objective: profile.objective,
    portrait_url: profile.portraitUrl,
    portrait_source: profile.portraitSource,
    preferences: profile.preferences || {},
    avatar_status: profile.avatarStatus,
    avatar_url: profile.avatarUrl,
    avatar_onboarding_completed: profile.avatarOnboardingCompleted,
    role: 'user', // Force user role for MVP
  };
  
  // CRITICAL DEBUG: Log the final DB profile being returned
  logger.info('USER_STORE_MAP_PROFILE_TO_DB_OUTPUT', 'Final DB profile being returned', {
    dbProfile: dbProfile,
    dbProfileKeys: Object.keys(dbProfile),
    dbProfileSnapshot: {
      phone_number: dbProfile.phone_number,
      activity_level: dbProfile.activity_level,
      objective: dbProfile.objective,
      job_category: dbProfile.job_category,
    },
    dbProfileComplete: {
      user_id: dbProfile.user_id,
      display_name: dbProfile.display_name,
      phone_number: dbProfile.phone_number,
      birthdate: dbProfile.birthdate,
      sex: dbProfile.sex,
      height_cm: dbProfile.height_cm,
      weight_kg: dbProfile.weight_kg,
      target_weight_kg: dbProfile.target_weight_kg,
      activity_level: dbProfile.activity_level,
      objective: dbProfile.objective,
      job_category: dbProfile.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  return dbProfile;
}