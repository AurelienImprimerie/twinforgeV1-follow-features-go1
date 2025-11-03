/**
 * UserStore Utilities
 * Utility functions for data cleaning and profile management
 */

import type { Profile } from './types';

/**
 * Utility function to convert empty strings to null
 */
export function emptyStringToNull(value: any): any {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return value;
}

/**
 * Clean profile data by converting empty strings to null
 */
export function cleanProfileForStorage(profile: Profile | null): Profile | null {
  if (!profile) return null;

  return {
    ...profile,
    displayName: emptyStringToNull(profile.displayName),
    phoneNumber: emptyStringToNull(profile.phoneNumber),
    sex: emptyStringToNull(profile.sex),
    activity_level: emptyStringToNull(profile.activity_level),
    job_category: emptyStringToNull(profile.job_category),
    objective: emptyStringToNull(profile.objective),
    birthdate: emptyStringToNull(profile.birthdate),
    portraitUrl: emptyStringToNull(profile.portraitUrl),
    avatarUrl: emptyStringToNull(profile.avatarUrl),
    portraitSource: emptyStringToNull(profile.portraitSource),
    avatarStatus: emptyStringToNull(profile.avatarStatus),
  };
}
