/**
 * Hook pour initialiser le système Voice Coach
 * S'occupe de l'initialisation de l'orchestrateur au démarrage
 */

import { useEffect, useRef } from 'react';
import { voiceCoachOrchestrator } from '../system/services/voiceCoachOrchestrator';
import logger from '../lib/utils/logger';

export function useVoiceCoachInitialization() {
  const isInitializing = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Initialiser l'orchestrateur une seule fois au montage
    if (isInitializing.current || isInitialized.current) {
      return;
    }

    isInitializing.current = true;

    const initializeOrchestrator = async () => {
      try {
        if (!voiceCoachOrchestrator.initialized) {
          logger.info('VOICE_COACH_INIT', 'Initializing voice coach orchestrator');
          await voiceCoachOrchestrator.initialize();
          isInitialized.current = true;
          logger.info('VOICE_COACH_INIT', 'Voice coach orchestrator ready');
        } else {
          logger.debug('VOICE_COACH_INIT', 'Voice coach orchestrator already initialized');
          isInitialized.current = true;
        }
      } catch (error) {
        logger.error('VOICE_COACH_INIT', 'Failed to initialize voice coach orchestrator', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        // Ne pas throw pour ne pas crasher l'app
        // Le système voice sera simplement désactivé
      } finally {
        isInitializing.current = false;
      }
    };

    initializeOrchestrator();

    // Cleanup au démontage
    return () => {
      if (isInitialized.current) {
        logger.info('VOICE_COACH_INIT', 'Cleaning up voice coach orchestrator');
        voiceCoachOrchestrator.cleanup();
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    isInitialized: isInitialized.current
  };
}
