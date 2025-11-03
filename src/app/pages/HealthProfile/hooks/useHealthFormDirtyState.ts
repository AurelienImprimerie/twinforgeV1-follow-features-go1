/**
 * useHealthFormDirtyState Hook
 * Intelligent dirty state detection for health profile forms
 * Prevents false positives on initial load and provides deep comparison
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import logger from '../../../../lib/utils/logger';

interface UseHealthFormDirtyStateOptions<T> {
  currentValues: T;
  initialValues: T;
  formName: string;
  enabled?: boolean;
}

/**
 * Deep comparison utility for objects and arrays
 */
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return obj1 === obj2;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => deepEqual(obj1[key], obj2[key]));
}

/**
 * Normalize values to handle empty strings, null, undefined consistently
 */
function normalizeValue(value: any): any {
  // Handle null, undefined, and empty string
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  // Handle empty arrays - treat as null for comparison
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }
    return value.map(normalizeValue);
  }

  // Handle objects
  if (typeof value === 'object' && value !== null) {
    const normalized: any = {};
    for (const key in value) {
      const normalizedValue = normalizeValue(value[key]);
      // Only include properties that are not null
      if (normalizedValue !== null) {
        normalized[key] = normalizedValue;
      }
    }
    // Return null for empty objects
    return Object.keys(normalized).length === 0 ? null : normalized;
  }

  // Handle booleans - false is a valid value, don't normalize to null
  if (typeof value === 'boolean') {
    return value;
  }

  return value;
}

/**
 * Hook to intelligently detect if a health form has unsaved changes
 * - Handles initial load synchronization
 * - Provides deep comparison to avoid false positives
 * - Logs changes for debugging
 */
export function useHealthFormDirtyState<T extends Record<string, any>>({
  currentValues,
  initialValues,
  formName,
  enabled = true,
}: UseHealthFormDirtyStateOptions<T>) {
  const [isDirty, setIsDirty] = useState(false);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store the initial snapshot to compare against
  const initialSnapshot = useRef<T | null>(null);
  const hasLoggedInit = useRef(false);

  // Initialize snapshot on first render or when initial values change
  useEffect(() => {
    if (!isInitialized && initialValues) {
      initialSnapshot.current = normalizeValue(initialValues) as T;
      setIsInitialized(true);

      if (!hasLoggedInit.current) {
        logger.debug(`HEALTH_FORM_DIRTY_${formName}`, 'Form initialized with values', {
          initialValues: initialSnapshot.current,
          timestamp: new Date().toISOString(),
        });
        hasLoggedInit.current = true;
      }
    }
  }, [initialValues, isInitialized, formName]);

  // Compare current values with initial snapshot
  useEffect(() => {
    if (!enabled || !isInitialized || !initialSnapshot.current) {
      return;
    }

    const normalizedCurrent = normalizeValue(currentValues);
    const normalizedInitial = initialSnapshot.current;

    const areEqual = deepEqual(normalizedCurrent, normalizedInitial);
    const wasDirty = isDirty;
    const nowDirty = !areEqual;

    if (wasDirty !== nowDirty) {
      setIsDirty(nowDirty);

      if (nowDirty) {
        // Calculate which fields changed
        const changed: string[] = [];
        for (const key in normalizedCurrent) {
          if (!deepEqual(normalizedCurrent[key], normalizedInitial[key])) {
            changed.push(key);
          }
        }
        setChangedFields(changed);

        logger.info(`HEALTH_FORM_DIRTY_${formName}`, 'Form became dirty', {
          changedFields: changed,
          currentValues: normalizedCurrent,
          initialValues: normalizedInitial,
          timestamp: new Date().toISOString(),
        });
      } else {
        setChangedFields([]);
        logger.info(`HEALTH_FORM_DIRTY_${formName}`, 'Form became clean', {
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [currentValues, enabled, isInitialized, isDirty, formName]);

  // Reset the initial snapshot (call this after successful save)
  const resetDirtyState = useCallback((newInitialValues?: T) => {
    const valuesToSet = newInitialValues || currentValues;
    initialSnapshot.current = normalizeValue(valuesToSet) as T;
    setIsDirty(false);
    setChangedFields([]);

    logger.info(`HEALTH_FORM_DIRTY_${formName}`, 'Dirty state reset', {
      newInitialValues: initialSnapshot.current,
      timestamp: new Date().toISOString(),
    });
  }, [currentValues, formName]);

  // Force set dirty state (useful for manual tracking)
  const setDirtyManually = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
    logger.info(`HEALTH_FORM_DIRTY_${formName}`, 'Dirty state set manually', {
      isDirty: dirty,
      timestamp: new Date().toISOString(),
    });
  }, [formName]);

  return {
    isDirty: enabled ? isDirty : false,
    changedFields,
    isInitialized,
    resetDirtyState,
    setDirtyManually,
    changedFieldsCount: changedFields.length,
  };
}

export default useHealthFormDirtyState;
