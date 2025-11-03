/**
 * Profile Repository
 * Database operations for user profiles
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

/**
 * Fetch user profile from database
 */
export async function fetchUserProfileFromDb(userId: string) {
  logger.info('USER_STORE_FETCH_PROFILE', 'Starting profile fetch from database', {
    userId: userId,
    reason: 'explicit_fetch_call',
    timestamp: new Date().toISOString(),
    philosophy: 'profile_fetch_audit'
  });
  
  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', userId)
    .limit(1);
  
  // DEBUG: Log raw database response
  logger.info('USER_STORE_FETCH_PROFILE', 'Raw DB response received', { 
    hasData: !!data, 
    dataLength: data?.length || 0,
    hasError: !!error,
    errorMessage: error?.message,
    fetchReason: 'profile_sync_after_update',
    rawProfileData: data && data.length > 0 ? {
      user_id: data[0].user_id,
      display_name: data[0].display_name,
      sex: data[0].sex,
      height_cm: data[0].height_cm,
      weight_kg: data[0].weight_kg,
      target_weight_kg: data[0].target_weight_kg,
      activity_level: data[0].activity_level,
      objective: data[0].objective,
      birthdate: data[0].birthdate,
      job_category: data[0].job_category,
      phone_number: data[0].phone_number,
      hasPreferences: !!data[0].preferences,
      preferencesKeys: data[0].preferences ? Object.keys(data[0].preferences) : []
    } : null,
    philosophy: 'raw_db_response_audit'
  });
  
  return { data: data && data.length > 0 ? data[0] : null, error };
}

/**
 * Create new user profile in database
 */
export async function createUserProfileInDb(userId: string, userEmail?: string, displayName?: string) {
  logger.info('USER_STORE_FETCH_PROFILE', 'No existing profile found, creating new profile', {
    userId: userId,
    philosophy: 'new_profile_creation'
  });
  
  // Create new profile for new users
  const newProfile = {
    user_id: userId,
    display_name: displayName || userEmail?.split('@')[0] || null,
    sex: null,
    height_cm: null,
    weight_kg: null,
    target_weight_kg: null,
    activity_level: null,
    objective: null,
    avatar_status: 'none' as const,
    preferences: {
      onboardingCompleted: false,
      onboardingSkipped: false,
      profileCompletion: 0.1,
    },
    nutrition: { allergies: [], intolerances: [] },
    household_details: { adults: 1, children: 0, dietaryRestrictions: [] },
    health: {},
    emotions: {},
  };
  
  const { data: createdProfile, error: createError } = await supabase
    .from('user_profile')
    .upsert(newProfile, { 
      onConflict: 'user_id',
      ignoreDuplicates: false
    })
    .select()
    .single();
    
  return { data: createdProfile, error: createError };
}

/**
 * Upsert user profile to database
 */
export async function upsertUserProfileToDb(dbProfile: any) {
  // CRITICAL DEBUG: Log the exact DB profile being sent to Supabase
  logger.info('USER_STORE_SAVE_PROFILE_DB_PAYLOAD', 'Exact DB profile being sent to Supabase', {
    userId: dbProfile.user_id,
    dbProfile: dbProfile,
    dbProfileKeys: Object.keys(dbProfile),
    dbProfileSnapshot: {
      phone_number: dbProfile.phone_number,
      activity_level: dbProfile.activity_level,
      objective: dbProfile.objective,
      job_category: dbProfile.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  const { data, error } = await supabase
    .from('user_profile')
    .upsert(dbProfile)
    .select()
    .single();
    
  if (error) {
    logger.error('USER_STORE_SAVE_PROFILE_DB_ERROR', 'Supabase upsert failed', {
      error: error.message,
      errorDetails: error,
      userId: dbProfile.user_id,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
  
  // CRITICAL DEBUG: Log the exact data returned by Supabase
  logger.info('USER_STORE_SAVE_PROFILE_DB_RESPONSE', 'Exact data returned by Supabase', {
    userId: dbProfile.user_id,
    supabaseData: data,
    supabaseDataKeys: Object.keys(data || {}),
    supabaseDataSnapshot: {
      phone_number: data?.phone_number,
      activity_level: data?.activity_level,
      objective: data?.objective,
      job_category: data?.job_category,
    },
    timestamp: new Date().toISOString()
  });
  
  return { data, error };
}

/**
 * Update user profile in database with specific updates
 */
export async function updateUserProfileInDb(userId: string, dbUpdates: any) {
  logger.jsonLog('USER_STORE_DB_UPDATE_PRE_CALL', 'Checking data before Supabase upsert', {
    userId: userId,
    dbUpdatesPayload: dbUpdates,
    sessionUserIdAtCall: userId,
    timestamp: new Date().toISOString()
  });

  // Ensure user_id is included for upsert operation
  dbUpdates.user_id = userId;
  
  logger.jsonLog('USER_STORE_DB_FINAL_PAYLOAD', 'Final payload being sent to Supabase', {
    userId: userId,
    finalDbUpdates: dbUpdates,
    timestamp: new Date().toISOString()
  });
  
  const { data, error } = await supabase
    .from('user_profile')
    .upsert(dbUpdates, { onConflict: 'user_id' })
    .select()
    .single();

  logger.jsonLog('USER_STORE_DB_UPDATE_POST_CALL', 'Supabase upsert call completed', {
    userId: userId,
    hasData: !!data,
    hasError: !!error,
    timestamp: new Date().toISOString()
  });

  logger.jsonLog('USER_STORE_SUPABASE_RESPONSE_RAW', 'Raw data from Supabase upsert', {
    userId: userId,
    supabaseRawData: data,
    supabaseError: error?.message,
    timestamp: new Date().toISOString()
  });
    
  if (error) {
    logger.jsonLog('USER_STORE_UPDATE_PROFILE_DB_ERROR', 'Supabase upsert failed in updateProfile', {
      error: error.message,
      errorDetails: error,
      errorCode: error.code,
      errorHint: error.hint,
      userId: userId,
      dbUpdates: dbUpdates,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
  
  return { data, error };
}

/**
 * Reset avatar generation state in database
 */
export async function resetAvatarGenerationInDb(userId: string) {
  // Clear all avatar generation state in database
  const { error } = await supabase
    .from('user_profile')
    .update({
      avatar_generation_status: 'idle',
      avatar_generation_stage: null,
      avatar_generation_progress_percentage: 0,
      avatar_generation_script_index: 0,
      avatar_generation_script_length: 0,
      avatar_generation_fallback: false,
      avatar_creation_progress: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
    
  if (error) {
    logger.error('USER_STORE', 'Failed to reset avatar generation state', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: userId,
      philosophy: 'avatar_generation_reset_error'
    });
    throw error;
  }
  
  logger.info('USER_STORE', 'Avatar generation state reset successfully', {
    userId: userId,
    philosophy: 'avatar_generation_reset'
  });
  
  return { error };
}