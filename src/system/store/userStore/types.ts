/**
 * UserStore Types
 * Type definitions for the user store
 */

import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../profileMappers';

export type Role = 'user' | 'coach' | 'admin';

export type SessionInfo = {
  userId: string;
  role: Role;
  email?: string;
  displayName?: string;
};

export type UserState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  saving: boolean;
  initialized: boolean;
  sessionReady: boolean;
  sessionInfo: SessionInfo | null;
  authReady: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setSessionReady: (ready: boolean) => void;
  setSessionInfo: (s: SessionInfo | null) => void;
  setAuthReady: (ready: boolean) => void;
  fetchProfile: () => Promise<void>;
  setProfile: (updates: Partial<Profile> | null) => void;
  saveProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

export type { Profile };
