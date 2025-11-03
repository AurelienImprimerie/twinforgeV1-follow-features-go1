// src/lib/morph/keys/keyValidators.ts
/**
 * Key Validators
 * Functions for validating morphological keys against database constraints
 */

import logger from '../../utils/logger';
import { toCanonicalDBKey, toDbGender } from './keyNormalizers'; 
import type { MorphologyMappingData } from '../../../hooks/useMorphologyMapping';

/**
 * Check if a key is a valid canonical DB key using dynamic morphology mapping
 * CRITICAL: Only keys present in DB mapping for the specific gender are valid
 */
export function isValidDBKey(
  key: string,
  gender: 'male' | 'female',
  morphologyMapping?: MorphologyMappingData
): boolean {
  if (!key || typeof key !== 'string') return false;

  const canonical = toCanonicalDBKey(key);

  // CRITICAL: Ensure morphologyMapping is provided and valid
  if (!morphologyMapping || !morphologyMapping.mapping_masculine || !morphologyMapping.mapping_feminine) {
    logger.error('MORPH_KEYS', 'isValidDBKey called without valid morphologyMapping', {
      key, gender, hasMapping: !!morphologyMapping,
      philosophy: 'critical_mapping_missing_for_validation'
    });
    return false;
  }

  const genderMapping = gender === 'male' ?
    morphologyMapping.mapping_masculine :
    morphologyMapping.mapping_feminine;

  // Check both morph_values and face_values
  const isInDB = canonical in genderMapping.morph_values || canonical in genderMapping.face_values;

  return isInDB;
}

/**
 * Check if a key is a valid face morph key using dynamic morphology mapping - ADDED
 */
export function isValidFaceMorphKey(
  key: string,
  gender: 'male' | 'female',
  morphologyMapping?: MorphologyMappingData
): boolean {
  if (!key || typeof key !== 'string') return false;

  const canonical = toCanonicalDBKey(key);

  if (!morphologyMapping || !morphologyMapping.mapping_masculine || !morphologyMapping.mapping_feminine) {
    logger.error('MORPH_KEYS', 'isValidFaceMorphKey called without valid morphologyMapping', {
      key, gender, hasMapping: !!morphologyMapping,
      philosophy: 'critical_mapping_missing_for_validation'
    });
    return false;
  }

  const genderMapping = gender === 'male' ?
    morphologyMapping.mapping_masculine :
    morphologyMapping.mapping_feminine;

  const isValid = canonical in genderMapping.face_values;

  return isValid;
}

/**
 * Check if a key is banned for a specific gender using morphology mapping
 * PHASE A.1: Dynamic ban checking based on DB ranges
 */
export function isKeyBannedForGender(
  key: string,
  gender: 'male' | 'female',
  morphologyMapping?: MorphologyMappingData
): boolean {
  if (!morphologyMapping) return false;

  const canonical = toCanonicalDBKey(key);
  const genderMapping = gender === 'male' ?
    morphologyMapping.mapping_masculine :
    morphologyMapping.mapping_feminine;

  // Check both morph_values and face_values for banned status
  let range = genderMapping.morph_values[canonical];
  if (!range) {
    range = genderMapping.face_values[canonical];
  }

  // Key is banned if range is [0,0]
  const isBanned = range && range.min === 0 && range.max === 0;

  return isBanned;
}

/**
 * Validate that a value is a finite number
 */
function isValidMorphValue(value: any): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Validate morph data object structure
 */
function validateMorphDataStructure(
  morphData: Record<string, number>,
  gender: 'male' | 'female',
  morphologyMapping?: MorphologyMappingData
): {
  isValid: boolean;
  validKeys: string[];
  invalidKeys: string[];
  bannedKeys: string[];
} {
  const validKeys: string[] = [];
  const invalidKeys: string[] = [];
  const bannedKeys: string[] = [];
  
  Object.entries(morphData).forEach(([key, value]) => {
    if (!isValidMorphValue(value)) {
      invalidKeys.push(key);
      return;
    }
    
    if (!isValidDBKey(key, gender, morphologyMapping)) {
      invalidKeys.push(key);
      return;
    }
    
    if (isKeyBannedForGender(key, gender, morphologyMapping)) {
      bannedKeys.push(key);
      return;
    }
    
    validKeys.push(key);
  });
  
  return {
    isValid: invalidKeys.length === 0,
    validKeys,
    invalidKeys,
    bannedKeys
  };
}

