/**
 * UserStore Actions
 * Business logic and actions for the user store
 */

import logger from '../../../lib/utils/logger';
import { mapDbProfileToProfile, mapProfileToDb, mapProfileUpdatesToDb } from '../profileMappers';
import type { Profile, UserState, SessionInfo } from './types';
import type { Session } from '@supabase/supabase-js';

/**
 * Create store actions
 */
export const createActions = (set: any, get: any) => ({
  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user || null,
      initialized: true,
      authReady: !!session?.user,
      sessionInfo: session?.user ? {
        userId: session.user.id,
        role: 'user' as const,
        email: session.user.email || undefined,
        displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || undefined,
      } : null,
    });

    logger.debug('USER_STORE', 'Session updated', {
      hasSession: !!session,
      hasUser: !!session?.user,
      authReady: !!session?.user
    });

    if (session?.user) {
      setTimeout(() => {
        get().fetchProfile();
      }, 100);
    }
  },

  setSessionReady: (sessionReady: boolean) => {
    set({ sessionReady });
  },

  setSessionInfo: (sessionInfo: SessionInfo | null) => {
    set({ sessionInfo });
  },

  setAuthReady: (authReady: boolean) => {
    set({ authReady });
  },

  setProfile: (updates: Partial<Profile> | null) => {
    if (updates === null) {
      set({ profile: null });
      return;
    }

    set((state: UserState) => ({
      profile: {
        ...state.profile,
        ...updates,
        preferences: updates.preferences ? {
          ...state.profile?.preferences,
          ...updates.preferences
        } : state.profile?.preferences,
        nutrition: updates.nutrition ? {
          ...state.profile?.nutrition,
          ...updates.nutrition
        } : state.profile?.nutrition,
        householdDetails: updates.householdDetails ? {
          ...state.profile?.householdDetails,
          ...updates.householdDetails
        } : state.profile?.householdDetails,
        mealPrepPreferences: updates.mealPrepPreferences ? {
          ...state.profile?.mealPrepPreferences,
          ...updates.mealPrepPreferences
        } : state.profile?.mealPrepPreferences,
        kitchenEquipment: updates.kitchenEquipment ? {
          ...state.profile?.kitchenEquipment,
          ...updates.kitchenEquipment
        } : state.profile?.kitchenEquipment,
        foodPreferences: updates.foodPreferences ? {
          ...state.profile?.foodPreferences,
          ...updates.foodPreferences
        } : state.profile?.foodPreferences,
        sensoryPreferences: updates.sensoryPreferences ? {
          ...state.profile?.sensoryPreferences,
          ...updates.sensoryPreferences
        } : state.profile?.sensoryPreferences,
        macroTargets: updates.macroTargets ? {
          ...state.profile?.macroTargets,
          ...updates.macroTargets
        } : state.profile?.macroTargets,
        shoppingPreferences: updates.shoppingPreferences ? {
          ...state.profile?.shoppingPreferences,
          ...updates.shoppingPreferences
        } : state.profile?.shoppingPreferences,
        fastingWindow: updates.fastingWindow ? {
          ...state.profile?.fastingWindow,
          ...updates.fastingWindow
        } : state.profile?.fastingWindow
      }
    }));
  },

  fetchProfile: async () => {
    const { session } = get();
    logger.debug('USER_STORE', 'fetchProfile called', { hasSession: !!session, userId: session?.user?.id });

    if (!session?.user?.id) return;

    set({ loading: true });

    try {
      const { supabase } = await import('../../supabase/client');

      logger.info('USER_STORE_FETCH_PROFILE', 'Starting profile fetch from database', {
        userId: session.user.id,
        timestamp: new Date().toISOString(),
        philosophy: 'profile_fetch_audit'
      });

      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(1);

      logger.info('USER_STORE_FETCH_PROFILE', 'Raw DB response received', {
        hasData: !!data,
        dataLength: data?.length || 0,
        hasError: !!error,
        errorMessage: error?.message,
        philosophy: 'raw_db_response_audit'
      });

      const fetchData = data && data.length > 0 ? data[0] : null;

      if (error || !fetchData) {
        logger.info('USER_STORE_FETCH_PROFILE', 'No existing profile found, creating new profile', {
          userId: session.user.id,
          hasError: !!error,
          errorMessage: error?.message,
          philosophy: 'new_profile_creation'
        });

        const newProfile = {
          user_id: session.user.id,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || null,
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
            authProvider: 'email',
          },
          nutrition: { allergies: [], intolerances: [] },
          health: {},
          emotions: {},
        };

        try {
          const { data: createdProfile, error: createError } = await supabase
            .from('user_profile')
            .upsert(newProfile, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (!createError) {
            const mappedProfile = await mapDbProfileToProfile(createdProfile);
            logger.info('USER_STORE_FETCH_PROFILE', 'New profile created and mapped successfully', {
              userId: session.user.id,
              philosophy: 'new_profile_creation_success'
            });
            set({ profile: mappedProfile });
          } else {
            logger.error('USER_STORE_FETCH_PROFILE', 'Failed to create new profile in DB', {
              userId: session.user.id,
              createError: createError.message,
              philosophy: 'new_profile_creation_db_error'
            });
            set({
              profile: {
                userId: session.user.id,
                id: session.user.id,
                displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                sex: null,
                height_cm: null,
                weight_kg: null,
                preferences: {
                  onboardingCompleted: false,
                  onboardingSkipped: false,
                  profileCompletion: 0.1,
                },
                nutrition: { allergies: [], intolerances: [] },
                health: {},
                emotions: {},
              } as any
            });
          }
        } catch (createError) {
          logger.error('USER_STORE_FETCH_PROFILE', 'Exception during new profile creation', {
            userId: session.user.id,
            createError: createError instanceof Error ? createError.message : 'Unknown error',
            philosophy: 'new_profile_creation_exception'
          });
          set({
            profile: {
              userId: session.user.id,
              id: session.user.id,
              displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              sex: null,
              height_cm: null,
              weight_kg: null,
              preferences: {
                onboardingCompleted: false,
                onboardingSkipped: false,
                profileCompletion: 0.1,
              },
              nutrition: { allergies: [], intolerances: [] },
              health: {},
              emotions: {},
            } as any
          });
        }
      } else {
        const mappedProfile = await mapDbProfileToProfile(fetchData);

        logger.info('USER_STORE_FETCH_PROFILE', 'Existing profile fetched and mapped', {
          userId: session.user.id,
          philosophy: 'existing_profile_fetch_success'
        });

        set({ profile: mappedProfile });
      }

    } catch (error) {
      logger.error('USER_STORE_FETCH_PROFILE', 'Exception during profile fetch', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: session?.user?.id,
        philosophy: 'profile_fetch_exception'
      });
    } finally {
      set({ loading: false });
    }
  },

  saveProfile: async () => {
    const { session, profile } = get();
    if (!session?.user?.id || !profile) return;

    logger.info('USER_STORE_UPDATE_PROFILE', 'Starting profile update', {
      userId: session.user.id,
      philosophy: 'profile_update_start'
    });

    set({ saving: true });
    try {
      const { supabase } = await import('../../supabase/client');
      const dbProfile = mapProfileToDb(profile, session.user.id);

      const { data, error } = await supabase
        .from('user_profile')
        .upsert(dbProfile)
        .select()
        .single();

      if (error) throw error;
      set({ profile: await mapDbProfileToProfile(data) });
    } catch (error) {
      throw error;
    } finally {
      set({ saving: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { session } = get();
    if (!session?.user?.id) return;

    logger.debug('USER_STORE_UPDATE_PROFILE', 'Starting profile update with data', {
      updates,
      userId: session.user.id,
      philosophy: 'profile_update_debug'
    });

    const currentProfile = get().profile;
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          ...updates,
          preferences: updates.preferences ? {
            ...currentProfile.preferences,
            ...updates.preferences
          } : currentProfile.preferences
        }
      });
    }

    try {
      const { supabase } = await import('../../supabase/client');
      const dbUpdates = mapProfileUpdatesToDb(updates, currentProfile);

      logger.debug('USER_STORE_UPDATE_PROFILE', 'Mapped updates for database', {
        dbUpdates,
        userId: session.user.id,
        philosophy: 'db_updates_mapping_debug'
      });

      dbUpdates.user_id = session.user.id;

      const { data, error } = await supabase
        .from('user_profile')
        .upsert(dbUpdates, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      logger.debug('USER_STORE_UPDATE_PROFILE', 'Profile update successful', {
        userId: session.user.id,
        philosophy: 'profile_update_success'
      });

      set({ profile: await mapDbProfileToProfile(data) });
    } catch (error) {
      logger.error('USER_STORE_UPDATE_PROFILE', 'Profile update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: session.user.id,
        philosophy: 'profile_update_error'
      });
      if (currentProfile) {
        set({ profile: currentProfile });
      }
      throw error;
    }
  },
});
