/**
 * User Store
 * Central state management for user session, profile, and authentication
 *
 * This store has been modularized for better maintainability:
 * - userStore/types.ts: Type definitions
 * - userStore/utils.ts: Utility functions
 * - userStore/storage.ts: Persistence configuration
 * - userStore/actions.ts: Business logic and actions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type UserState,
  createActions,
  createSafeStorage,
  STORAGE_KEY,
  partializeState,
  mergeState,
  onRehydrateStorage,
} from './userStore/index';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      user: null,
      profile: null,
      loading: false,
      saving: false,
      initialized: false,
      sessionReady: false,
      sessionInfo: null,
      authReady: false,

      // Actions
      ...createActions(set, get),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(createSafeStorage),
      partialize: partializeState,
      merge: mergeState,
      onRehydrateStorage,
    }
  )
);
