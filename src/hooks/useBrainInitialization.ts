/**
 * useBrainInitialization Hook
 * Initializes the HEAD Brain system on app startup
 * Provides initialization status, health checks, and error handling
 */

import { useEffect, useState } from 'react';
import { brainCore } from '../system/head';
import { useUserStore } from '../system/store/userStore';
import logger from '../lib/utils/logger';
import type { HealthStatus } from '../system/head/types';

interface BrainInitializationState {
  initialized: boolean;
  initializing: boolean;
  error: Error | null;
  healthStatus: HealthStatus | null;
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function useBrainInitialization() {
  const { user } = useUserStore();
  const [state, setState] = useState<BrainInitializationState>({
    initialized: false,
    initializing: false,
    error: null,
    healthStatus: null,
    retryCount: 0,
  });

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;

    const initializeBrain = async (retryCount: number = 0) => {
      // Don't initialize if no user
      if (!user?.id) {
        logger.debug('BRAIN_INITIALIZATION', 'No user authenticated, skipping brain initialization');
        return;
      }

      // Check if already initialized
      if (brainCore.isInitialized()) {
        const currentUserId = brainCore.getCurrentUserId();
        if (currentUserId === user.id) {
          logger.debug('BRAIN_INITIALIZATION', 'Brain already initialized for current user', {
            userId: user.id,
          });
          if (isMounted) {
            setState({
              initialized: true,
              initializing: false,
              error: null,
              healthStatus: brainCore.getHealthStatus(),
              retryCount: 0,
            });
          }
          return;
        } else {
          logger.info('BRAIN_INITIALIZATION', 'User changed, reinitializing brain', {
            previousUserId: currentUserId,
            newUserId: user.id,
          });
        }
      }

      if (!isMounted) return;

      setState((prev) => ({
        ...prev,
        initializing: true,
        error: null,
      }));

      try {
        logger.info('BRAIN_INITIALIZATION', 'Starting brain initialization', {
          userId: user.id,
          retryCount,
          timestamp: new Date().toISOString(),
        });

        // Initialize the brain core
        await brainCore.initialize(user.id);

        if (!isMounted) return;

        // Get health status after initialization
        const healthStatus = brainCore.getHealthStatus();

        logger.info('BRAIN_INITIALIZATION', 'Brain initialized successfully', {
          userId: user.id,
          healthStatus,
          timestamp: new Date().toISOString(),
        });

        setState({
          initialized: true,
          initializing: false,
          error: null,
          healthStatus,
          retryCount: 0,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        logger.error('BRAIN_INITIALIZATION', 'Failed to initialize brain', {
          userId: user.id,
          error: err.message,
          stack: err.stack,
          retryCount,
          timestamp: new Date().toISOString(),
        });

        if (!isMounted) return;

        // Retry logic
        if (retryCount < MAX_RETRIES) {
          logger.warn('BRAIN_INITIALIZATION', 'Retrying brain initialization', {
            retryCount: retryCount + 1,
            maxRetries: MAX_RETRIES,
            delayMs: RETRY_DELAY,
          });

          setState((prev) => ({
            ...prev,
            initializing: false,
            error: err,
            retryCount: retryCount + 1,
          }));

          retryTimeout = setTimeout(() => {
            if (isMounted) {
              initializeBrain(retryCount + 1);
            }
          }, RETRY_DELAY);
        } else {
          logger.error('BRAIN_INITIALIZATION', 'Max retries reached, brain initialization failed', {
            retryCount,
            maxRetries: MAX_RETRIES,
          });

          setState({
            initialized: false,
            initializing: false,
            error: err,
            healthStatus: null,
            retryCount: retryCount + 1,
          });
        }
      }
    };

    // Start initialization
    initializeBrain();

    // Cleanup
    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [user?.id]);

  return {
    initialized: state.initialized,
    initializing: state.initializing,
    error: state.error,
    healthStatus: state.healthStatus,
    retryCount: state.retryCount,
    canRetry: state.retryCount < MAX_RETRIES && state.error !== null,
  };
}
