/**
 * useBeforeUnload Hook
 * Handles page unload events to save session state and warn users
 */

import { useEffect, useCallback } from 'react';
import { useTrainingPipeline } from '../system/store/trainingPipeline';
import { sessionStateManager } from '../system/services/sessionStateManager';
import logger from '../lib/utils/logger';

interface UseBeforeUnloadOptions {
  enabled?: boolean;
  message?: string;
  saveStateOnUnload?: boolean;
  warnOnUnsavedChanges?: boolean;
}

export const useBeforeUnload = (options: UseBeforeUnloadOptions = {}) => {
  const {
    enabled = true,
    message = 'Tu as un training en cours. Es-tu sûr de vouloir quitter ?',
    saveStateOnUnload = true,
    warnOnUnsavedChanges = true
  } = options;

  const {
    isActive,
    sessionPrescription,
    currentSessionId,
    userId,
    currentStep
  } = useTrainingPipeline();

  // Determine if we should block navigation
  const shouldBlock = useCallback(() => {
    if (!enabled) return false;
    if (!isActive) return false;

    // Block if we have a prescription and are in an active session
    return !!sessionPrescription && !!currentSessionId;
  }, [enabled, isActive, sessionPrescription, currentSessionId]);

  // Save state before unload
  const saveState = useCallback(async () => {
    if (!saveStateOnUnload) return;
    if (!currentSessionId || !userId) return;

    try {
      logger.info('BEFORE_UNLOAD', 'Saving session state before unload', {
        sessionId: currentSessionId,
        userId,
        currentStep,
        hasPrescription: !!sessionPrescription
      });

      await sessionStateManager.upsertSessionState(
        currentSessionId,
        userId,
        currentStep
      );

      logger.info('BEFORE_UNLOAD', 'Session state saved successfully');
    } catch (error) {
      logger.error('BEFORE_UNLOAD', 'Failed to save session state', {
        error: error instanceof Error ? error.message : 'Unknown',
        sessionId: currentSessionId
      });
    }
  }, [
    saveStateOnUnload,
    currentSessionId,
    userId,
    currentStep,
    sessionPrescription
  ]);

  // beforeunload event handler
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldBlock()) {
        logger.warn('BEFORE_UNLOAD', 'User attempting to leave with active session', {
          sessionId: currentSessionId,
          currentStep,
          hasPrescription: !!sessionPrescription
        });

        // Modern browsers ignore custom messages, but we set it anyway
        if (warnOnUnsavedChanges) {
          event.preventDefault();
          event.returnValue = message;
        }

        // Save state asynchronously (best effort)
        // Note: async operations in beforeunload are not guaranteed to complete
        saveState();

        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    enabled,
    shouldBlock,
    saveState,
    warnOnUnsavedChanges,
    message,
    currentSessionId,
    currentStep,
    sessionPrescription
  ]);

  // unload event handler (for cleanup)
  useEffect(() => {
    if (!enabled || !saveStateOnUnload) return;

    const handleUnload = () => {
      // Use sendBeacon for guaranteed delivery during page unload
      if (currentSessionId && userId) {
        const data = JSON.stringify({
          sessionId: currentSessionId,
          userId,
          currentStep,
          timestamp: new Date().toISOString(),
          hasPrescription: !!sessionPrescription
        });

        // Try to send state via beacon API (more reliable during unload)
        if (navigator.sendBeacon) {
          logger.info('UNLOAD', 'Sending session state via beacon', {
            sessionId: currentSessionId
          });
          // In production, this would go to a dedicated endpoint
          // For now, we just log it
        }
      }
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [
    enabled,
    saveStateOnUnload,
    currentSessionId,
    userId,
    currentStep,
    sessionPrescription
  ]);

  // Visibility change handler (page hidden/shown)
  useEffect(() => {
    if (!enabled || !saveStateOnUnload) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && shouldBlock()) {
        logger.info('VISIBILITY_CHANGE', 'Page hidden, saving state', {
          sessionId: currentSessionId
        });
        saveState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, saveStateOnUnload, shouldBlock, saveState, currentSessionId]);

  return {
    shouldBlock: shouldBlock(),
    saveState
  };
};
