/**
 * Voice Environment Hook
 * Detects and manages environment capabilities for voice/text modes
 */

import { useState, useEffect } from 'react';
import { environmentDetectionService } from '../../../../../system/services/detection/environmentDetectionService';
import logger from '../../../../../lib/utils/logger';

export interface VoiceEnvironmentState {
  environmentChecked: boolean;
  capabilities: ReturnType<typeof environmentDetectionService.getCapabilities>;
}

export function useVoiceEnvironment(
  communicationMode: 'voice' | 'text',
  setCommunicationMode: (mode: 'voice' | 'text') => void
): VoiceEnvironmentState {
  const [environmentChecked, setEnvironmentChecked] = useState(false);

  useEffect(() => {
    if (!environmentChecked) {
      const caps = environmentDetectionService.detect();

      logger.info('VOICE_COACH_PANEL', 'Environment detected', {
        environment: caps.environmentName,
        canUseVoice: caps.canUseVoiceMode,
        isStackBlitz: caps.isStackBlitz,
        canUseWebSocket: caps.canUseWebSocket
      });

      environmentDetectionService.logEnvironmentInfo();

      if (!caps.canUseWebSocket && communicationMode === 'voice') {
        logger.warn('VOICE_COACH_PANEL', 'Forcing text mode - WebSocket not available in browser');
        setCommunicationMode('text');
      } else if (caps.isStackBlitz && communicationMode === 'voice') {
        logger.info('VOICE_COACH_PANEL', 'Voice mode requested in StackBlitz - will attempt connection');
      }

      setEnvironmentChecked(true);
    }
  }, [environmentChecked, communicationMode, setCommunicationMode]);

  const capabilities = environmentDetectionService.getCapabilities();

  return {
    environmentChecked,
    capabilities
  };
}
