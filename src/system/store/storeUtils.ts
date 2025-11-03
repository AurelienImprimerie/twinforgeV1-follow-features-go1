/**
 * Store Utilities
 * Generic utility functions for store data manipulation
 */

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
 * Enhanced utility to clean all string fields in an object
 */
export function cleanStringFields(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = { ...obj };
  
  Object.keys(cleaned).forEach(key => {
    if (typeof cleaned[key] === 'string') {
      cleaned[key] = emptyStringToNull(cleaned[key]);
    } else if (cleaned[key] && typeof cleaned[key] === 'object' && !Array.isArray(cleaned[key])) {
      cleaned[key] = cleanStringFields(cleaned[key]);
    }
  });
  
  return cleaned;
}

/**
 * Clean profile data by converting empty strings to null
 */
export function cleanProfileForStorage(profile: any): any {
  if (!profile) return null;
  
  // Use enhanced cleaning for all fields
  return cleanStringFields(profile);
}