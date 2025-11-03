/**
 * Field Validation Hook
 * Real-time field validation with debouncing and visual feedback
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { z } from 'zod';
import logger from '../lib/utils/logger';

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

interface ValidationState {
  status: ValidationStatus;
  error: string | null;
  isValidating: boolean;
}

interface UseFieldValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  schema?: z.ZodSchema;
  customValidator?: (value: any) => Promise<string | null>;
}

interface UseFieldValidationReturn extends ValidationState {
  validate: (value: any) => Promise<boolean>;
  reset: () => void;
  setError: (error: string) => void;
}

const DEFAULT_OPTIONS: Required<Omit<UseFieldValidationOptions, 'schema' | 'customValidator'>> = {
  debounceMs: 500,
  validateOnChange: true,
  validateOnBlur: true,
};

/**
 * Hook for real-time field validation with debouncing
 */
export function useFieldValidation(
  value: any,
  options: UseFieldValidationOptions = {}
): UseFieldValidationReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [state, setState] = useState<ValidationState>({
    status: 'idle',
    error: null,
    isValidating: false,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const validationCountRef = useRef(0);

  /**
   * Core validation function
   */
  const performValidation = useCallback(
    async (valueToValidate: any, validationId: number): Promise<boolean> => {
      try {
        setState(prev => ({ ...prev, status: 'validating', isValidating: true }));

        logger.debug('VALIDATION', 'Starting validation', {
          validationId,
          hasSchema: !!opts.schema,
          hasCustomValidator: !!opts.customValidator,
        });

        let error: string | null = null;

        // Zod schema validation
        if (opts.schema) {
          try {
            opts.schema.parse(valueToValidate);
          } catch (zodError) {
            if (zodError instanceof z.ZodError) {
              error = zodError.errors[0]?.message || 'Validation error';
            }
          }
        }

        // Custom async validation
        if (!error && opts.customValidator) {
          error = await opts.customValidator(valueToValidate);
        }

        // Check if this validation is still relevant
        if (validationId !== validationCountRef.current) {
          logger.debug('VALIDATION', 'Validation outdated, skipping', { validationId });
          return false;
        }

        const isValid = !error;

        setState({
          status: isValid ? 'valid' : 'invalid',
          error,
          isValidating: false,
        });

        logger.debug('VALIDATION', 'Validation complete', {
          validationId,
          isValid,
          error,
        });

        return isValid;
      } catch (error) {
        logger.error('VALIDATION', 'Validation failed', error);

        setState({
          status: 'invalid',
          error: 'Erreur de validation',
          isValidating: false,
        });

        return false;
      }
    },
    [opts.schema, opts.customValidator]
  );

  /**
   * Trigger validation manually
   */
  const validate = useCallback(
    async (valueToValidate: any): Promise<boolean> => {
      const validationId = ++validationCountRef.current;
      return performValidation(valueToValidate, validationId);
    },
    [performValidation]
  );

  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setState({
      status: 'idle',
      error: null,
      isValidating: false,
    });

    validationCountRef.current = 0;
  }, []);

  /**
   * Set error manually
   */
  const setError = useCallback((error: string) => {
    setState({
      status: 'invalid',
      error,
      isValidating: false,
    });
  }, []);

  /**
   * Auto-validate on value change (debounced)
   */
  useEffect(() => {
    if (!opts.validateOnChange || !opts.schema && !opts.customValidator) {
      return;
    }

    // Skip validation for empty/null values unless explicitly required
    if (value === '' || value === null || value === undefined) {
      reset();
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      const validationId = ++validationCountRef.current;
      performValidation(value, validationId);
    }, opts.debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, opts.validateOnChange, opts.debounceMs, opts.schema, opts.customValidator, performValidation, reset]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    validate,
    reset,
    setError,
  };
}

/**
 * Hook for validating multiple fields as a group
 */
export function useFormValidation<T extends Record<string, any>>(
  values: T,
  schemas: Partial<Record<keyof T, z.ZodSchema>>,
  options: UseFieldValidationOptions = {}
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);

    const newErrors: Partial<Record<keyof T, string>> = {};
    let allValid = true;

    for (const key in schemas) {
      const schema = schemas[key];
      const value = values[key];

      if (schema) {
        try {
          schema.parse(value);
        } catch (zodError) {
          if (zodError instanceof z.ZodError) {
            newErrors[key] = zodError.errors[0]?.message || 'Erreur de validation';
            allValid = false;
          }
        }
      }
    }

    setErrors(newErrors);
    setIsValid(allValid);
    setIsValidating(false);

    return allValid;
  }, [values, schemas]);

  // Auto-validate on values change
  useEffect(() => {
    const timer = setTimeout(() => {
      validate();
    }, options.debounceMs || 500);

    return () => clearTimeout(timer);
  }, [values, validate, options.debounceMs]);

  return {
    errors,
    isValidating,
    isValid,
    validate,
    setError: (field: keyof T, error: string) => {
      setErrors(prev => ({ ...prev, [field]: error }));
    },
    clearError: (field: keyof T) => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    clearAllErrors: () => setErrors({}),
  };
}

export default useFieldValidation;
