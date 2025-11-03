/**
 * Health Profile Save Error Handler
 * Centralized error handling and retry logic for health profile saves
 */

import logger from '../../../../lib/utils/logger';

export enum HealthSaveErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

export interface HealthSaveError {
  type: HealthSaveErrorType;
  message: string;
  originalError?: Error;
  details?: Record<string, any>;
  retryable: boolean;
  userMessage: string;
}

/**
 * Analyze an error and categorize it for better handling
 */
export function analyzeHealthSaveError(
  error: unknown,
  context: { formName: string; userId?: string; data?: any }
): HealthSaveError {
  const { formName, userId, data } = context;

  // Log the raw error for debugging
  logger.error(`HEALTH_SAVE_ERROR_${formName}`, 'Save operation failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    userId,
    dataKeys: data ? Object.keys(data) : [],
    timestamp: new Date().toISOString(),
  });

  // QuotaExceededError (localStorage full)
  if (
    error instanceof Error &&
    (error.name === 'QuotaExceededError' ||
      error.message.includes('QuotaExceededError') ||
      error.message.includes('quota') ||
      error.message.includes('exceeded the quota'))
  ) {
    return {
      type: HealthSaveErrorType.DATABASE,
      message: 'Espace de stockage insuffisant',
      originalError: error,
      retryable: true,
      userMessage: 'Mémoire locale saturée. Un nettoyage automatique a été effectué. Veuillez réessayer.',
    };
  }

  // Network errors (fetch failures, timeouts)
  if (error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('timeout') ||
    error.message.includes('Network request failed')
  )) {
    return {
      type: HealthSaveErrorType.NETWORK,
      message: 'Erreur réseau lors de la sauvegarde',
      originalError: error,
      retryable: true,
      userMessage: 'Problème de connexion. Veuillez vérifier votre connexion internet et réessayer.',
    };
  }

  // Permission errors (RLS, auth issues)
  if (error instanceof Error && (
    error.message.includes('permission') ||
    error.message.includes('policy') ||
    error.message.includes('RLS') ||
    error.message.includes('JWT')
  )) {
    return {
      type: HealthSaveErrorType.PERMISSION,
      message: 'Erreur de permissions',
      originalError: error,
      retryable: false,
      userMessage: 'Vous n\'avez pas les permissions nécessaires. Veuillez vous reconnecter.',
    };
  }

  // Database errors (constraint violations, invalid data)
  if (error instanceof Error && (
    error.message.includes('constraint') ||
    error.message.includes('duplicate') ||
    error.message.includes('foreign key') ||
    error.message.includes('null value')
  )) {
    return {
      type: HealthSaveErrorType.DATABASE,
      message: 'Erreur de base de données',
      originalError: error,
      details: { constraint: error.message },
      retryable: false,
      userMessage: 'Données invalides. Veuillez vérifier les informations saisies.',
    };
  }

  // Validation errors (Zod or custom validation)
  if (error instanceof Error && (
    error.name === 'ZodError' ||
    error.message.includes('validation') ||
    error.message.includes('invalid')
  )) {
    return {
      type: HealthSaveErrorType.VALIDATION,
      message: 'Erreur de validation',
      originalError: error,
      retryable: false,
      userMessage: 'Certains champs contiennent des erreurs. Veuillez les corriger.',
    };
  }

  // Unknown errors
  return {
    type: HealthSaveErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : 'Erreur inconnue',
    originalError: error instanceof Error ? error : undefined,
    retryable: true,
    userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
  };
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
};

/**
 * Execute a save operation with automatic retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  context: { formName: string; userId?: string },
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: unknown;
  let attempt = 0;

  while (attempt < config.maxAttempts) {
    attempt++;

    try {
      logger.debug(`HEALTH_SAVE_RETRY_${context.formName}`, `Attempt ${attempt}/${config.maxAttempts}`, {
        userId: context.userId,
        timestamp: new Date().toISOString(),
      });

      const result = await operation();

      if (attempt > 1) {
        logger.info(`HEALTH_SAVE_RETRY_${context.formName}`, `Succeeded on attempt ${attempt}`, {
          userId: context.userId,
          timestamp: new Date().toISOString(),
        });
      }

      return result;
    } catch (error) {
      lastError = error;

      const analyzedError = analyzeHealthSaveError(error, {
        ...context,
        data: undefined,
      });

      // Don't retry if error is not retryable
      if (!analyzedError.retryable) {
        logger.error(`HEALTH_SAVE_RETRY_${context.formName}`, 'Non-retryable error, aborting', {
          errorType: analyzedError.type,
          attempt,
          userId: context.userId,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt >= config.maxAttempts) {
        logger.error(`HEALTH_SAVE_RETRY_${context.formName}`, 'Max retry attempts reached', {
          attempts: attempt,
          userId: context.userId,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      );

      logger.info(`HEALTH_SAVE_RETRY_${context.formName}`, `Retrying after ${delay}ms`, {
        attempt,
        nextAttempt: attempt + 1,
        maxAttempts: config.maxAttempts,
        userId: context.userId,
        timestamp: new Date().toISOString(),
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Validate health data before save
 */
export function validateHealthData(
  data: any,
  context: { formName: string }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required fields based on form type
  if (context.formName === 'BASIC_HEALTH') {
    // No strict requirements for basic health
  }

  if (context.formName === 'ALLERGIES') {
    if (data.allergies && !Array.isArray(data.allergies)) {
      errors.push('Allergies must be an array');
    }
  }

  if (context.formName === 'VACCINATIONS') {
    if (data.vaccinations && !Array.isArray(data.vaccinations)) {
      errors.push('Vaccinations must be an array');
    }
  }

  if (context.formName === 'MEDICAL_CONDITIONS') {
    if (data.conditions && !Array.isArray(data.conditions)) {
      errors.push('Conditions must be an array');
    }
    if (data.medications && !Array.isArray(data.medications)) {
      errors.push('Medications must be an array');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
