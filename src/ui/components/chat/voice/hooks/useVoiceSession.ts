/**
 * Voice Session Hook
 * Manages voice session lifecycle and handlers
 */

import { environmentDetectionService } from '../../../../../system/services/detection/environmentDetectionService';
import { voiceCoachOrchestrator } from '../../../../../system/services/voice/voiceCoachOrchestrator';
import logger from '../../../../../lib/utils/logger';

export interface VoiceSessionHandlers {
  handleStartVoiceSession: () => Promise<void>;
  handleCancelReadyPrompt: () => void;
}

export function useVoiceSession(
  currentMode: string,
  setVoiceState: (state: string) => void,
  setShowReadyPrompt: (show: boolean) => void,
  setError: (error: string) => void,
  setCommunicationMode: (mode: 'voice' | 'text') => void,
  closePanel: () => void
): VoiceSessionHandlers {
  const handleStartVoiceSession = async () => {
    const caps = environmentDetectionService.getCapabilities();

    if (!caps.canUseWebSocket) {
      logger.error('VOICE_COACH_PANEL', 'WebSocket not available in browser');

      const errorMessage = 'Le mode vocal nécessite les WebSockets qui ne sont pas disponibles dans ce navigateur.';
      setError(errorMessage);
      setVoiceState('error');

      setTimeout(() => {
        setCommunicationMode('text');
        setVoiceState('idle');
        setShowReadyPrompt(false);
      }, 3000);

      return;
    }

    if (caps.isStackBlitz || caps.isWebContainer) {
      logger.warn('VOICE_COACH_PANEL', '⚠️ Running in WebContainer environment - attempting connection');
    }

    try {
      setVoiceState('connecting');
      setShowReadyPrompt(false);

      if (!voiceCoachOrchestrator.initialized) {
        await voiceCoachOrchestrator.initialize();
      }

      await voiceCoachOrchestrator.startVoiceSession(currentMode);

      logger.info('VOICE_COACH_PANEL', 'Voice session started successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start voice session';
      logger.error('VOICE_COACH_PANEL', 'Failed to start voice session', { error: errorMessage });

      setVoiceState('error');
      setError(errorMessage);
      setShowReadyPrompt(true);

      if (errorMessage.includes('StackBlitz') || errorMessage.includes('WebContainer') || errorMessage.includes('WebSocket')) {
        logger.warn('VOICE_COACH_PANEL', 'Suggesting text mode as fallback');

        setTimeout(() => {
          setCommunicationMode('text');
          setVoiceState('idle');
          setShowReadyPrompt(false);
        }, 3000);
      }
    }
  };

  const handleCancelReadyPrompt = () => {
    setShowReadyPrompt(false);
    setVoiceState('idle');
    closePanel();
  };

  return {
    handleStartVoiceSession,
    handleCancelReadyPrompt
  };
}
