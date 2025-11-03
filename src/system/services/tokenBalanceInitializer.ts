import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';

interface InitializeBalanceResponse {
  success: boolean;
  message: string;
  balance?: {
    available_tokens: number;
    subscription_tokens: number;
    onetime_tokens: number;
    bonus_tokens: number;
  };
  error?: string;
  action_taken?: string;
}

/**
 * Initializes token balance for a user if it doesn't exist.
 * This is a fallback mechanism in case the database trigger fails.
 */
export class TokenBalanceInitializer {
  private static initializationInProgress = new Set<string>();
  private static maxRetries = 3;
  private static retryDelayMs = 1000;

  /**
   * Check if token balance exists and initialize if missing
   */
  static async ensureTokenBalanceExists(userId: string): Promise<boolean> {
    // Prevent multiple simultaneous initialization attempts for the same user
    if (this.initializationInProgress.has(userId)) {
      logger.warn('TOKEN_INITIALIZER', 'Initialization already in progress', { userId });
      return false;
    }

    try {
      this.initializationInProgress.add(userId);

      logger.info('TOKEN_INITIALIZER', 'Checking token balance existence', { userId });

      // Check if balance exists
      const { data: balance, error } = await supabase
        .from('user_token_balance')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('TOKEN_INITIALIZER', 'Error checking balance', {
          userId,
          error: error.message
        });
        return false;
      }

      if (balance) {
        logger.info('TOKEN_INITIALIZER', 'Balance already exists', { userId });
        return true;
      }

      // Balance doesn't exist - initialize it via Edge Function
      logger.warn('TOKEN_INITIALIZER', 'Balance missing - calling Edge Function to initialize', { userId });

      const initialized = await this.initializeViaEdgeFunction(userId);

      if (initialized) {
        logger.info('TOKEN_INITIALIZER', 'Balance successfully initialized', { userId });
        return true;
      }

      logger.error('TOKEN_INITIALIZER', 'Failed to initialize balance', { userId });
      return false;

    } finally {
      this.initializationInProgress.delete(userId);
    }
  }

  /**
   * Call the Edge Function to initialize token balance
   */
  private static async initializeViaEdgeFunction(
    userId: string,
    retryCount = 0
  ): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        logger.error('TOKEN_INITIALIZER', 'No active session', { userId });
        return false;
      }

      logger.info('TOKEN_INITIALIZER', 'Calling initialize-token-balance Edge Function', {
        userId,
        attempt: retryCount + 1,
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initialize-token-balance`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('TOKEN_INITIALIZER', 'Edge Function returned error', {
          userId,
          status: response.status,
          error: errorText,
        });

        // Retry on server errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          logger.info('TOKEN_INITIALIZER', 'Retrying after delay', {
            userId,
            retryCount: retryCount + 1,
            delayMs: this.retryDelayMs,
          });

          await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
          return this.initializeViaEdgeFunction(userId, retryCount + 1);
        }

        return false;
      }

      const result: InitializeBalanceResponse = await response.json();

      if (result.success) {
        logger.info('TOKEN_INITIALIZER', 'Edge Function succeeded', {
          userId,
          actionTaken: result.action_taken,
          balance: result.balance,
        });
        return true;
      } else {
        logger.error('TOKEN_INITIALIZER', 'Edge Function returned failure', {
          userId,
          error: result.error,
          message: result.message,
        });
        return false;
      }

    } catch (error) {
      logger.error('TOKEN_INITIALIZER', 'Unexpected error calling Edge Function', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Retry on network errors
      if (retryCount < this.maxRetries) {
        logger.info('TOKEN_INITIALIZER', 'Retrying after error', {
          userId,
          retryCount: retryCount + 1,
        });

        await new Promise(resolve => setTimeout(resolve, this.retryDelayMs));
        return this.initializeViaEdgeFunction(userId, retryCount + 1);
      }

      return false;
    }
  }

  /**
   * Initialize token balance with toast notification
   */
  static async initializeWithFeedback(
    userId: string,
    showToast?: (message: string, type: 'success' | 'error') => void
  ): Promise<boolean> {
    const success = await this.ensureTokenBalanceExists(userId);

    if (showToast) {
      if (success) {
        showToast('Votre compte a été initialisé avec 15 000 tokens de bienvenue !', 'success');
      } else {
        showToast('Erreur lors de l\'initialisation de votre compte. Veuillez contacter le support.', 'error');
      }
    }

    return success;
  }
}
