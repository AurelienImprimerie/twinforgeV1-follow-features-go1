/**
 * UserStore Storage
 * Storage configuration and utilities for the user store
 */

import logger from '../../../lib/utils/logger';
import { safeStorageOperation, monitorStorageUsage, logStorageUsage } from '../../../lib/utils/storageManager';
import { cleanProfileForStorage } from './utils';
import type { UserState } from './types';

// Stable storage key to prevent conflicts
export const STORAGE_KEY = 'fastlift:userstore:main';

/**
 * Create a storage wrapper with quota handling
 */
export const createSafeStorage = () => {
  return {
    getItem: (name: string) => {
      try {
        const value = localStorage.getItem(name);
        if (value) {
          monitorStorageUsage();
        }
        return value;
      } catch (error) {
        logger.error('STORAGE', 'Failed to read from localStorage', {
          key: name,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      return safeStorageOperation(
        () => {
          localStorage.setItem(name, value);
          logger.debug('STORAGE', 'Successfully wrote to localStorage', {
            key: name,
            sizeMB: (new Blob([value]).size / (1024 * 1024)).toFixed(2),
          });
        },
        'USERSTORE_PERSIST'
      );
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        logger.error('STORAGE', 'Failed to remove from localStorage', {
          key: name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  };
};

/**
 * Partialize function to select which state to persist
 */
export const partializeState = (state: UserState) => ({
  session: state.session,
  profile: state.profile ? {
    // Only persist essential profile data to reduce storage usage
    userId: state.profile.userId,
    id: state.profile.id,
    displayName: state.profile.displayName,
    sex: state.profile.sex,
    height_cm: state.profile.height_cm,
    weight_kg: state.profile.weight_kg,
    birthdate: state.profile.birthdate,
    country: state.profile.country,
    avatarStatus: state.profile.avatarStatus,
    avatarUrl: state.profile.avatarUrl,
    health: state.profile.health,
    // Exclude large objects that can be re-fetched
  } : null,
});

/**
 * Merge function to combine persisted state with current state
 */
export const mergeState = (persistedState: any, currentState: UserState): UserState => ({
  ...currentState,
  ...persistedState,
  profile: cleanProfileForStorage(persistedState?.profile),
  loading: currentState.loading,
  saving: currentState.saving,
});

/**
 * Rehydration callback
 */
export const onRehydrateStorage = () => {
  return (state: any, error: any) => {
    if (error) {
      logger.error('USERSTORE_REHYDRATE', 'Failed to rehydrate store', {
        error: error.message,
      });
      logStorageUsage('USERSTORE_REHYDRATE_ERROR');
    } else {
      logger.info('USERSTORE_REHYDRATE', 'Store rehydrated successfully');
      logStorageUsage('USERSTORE_REHYDRATE_SUCCESS');
    }
  };
};
