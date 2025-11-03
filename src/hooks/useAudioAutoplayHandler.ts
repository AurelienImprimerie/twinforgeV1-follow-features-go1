/**
 * Hook pour gérer l'autoplay audio et afficher le prompt si nécessaire
 * Écoute l'événement global 'voiceCoachAutoplayBlocked' et gère l'état
 */

import { useEffect, useState } from 'react';
import logger from '../lib/utils/logger';

interface AudioAutoplayState {
  isBlocked: boolean;
  isDismissed: boolean;
}

export function useAudioAutoplayHandler() {
  const [audioAutoplayState, setAudioAutoplayState] = useState<AudioAutoplayState>({
    isBlocked: false,
    isDismissed: false
  });

  useEffect(() => {
    // Écouter l'événement custom dispatché par le service
    const handleAutoplayBlocked = (event: Event) => {
      const customEvent = event as CustomEvent;
      logger.info('AUDIO_AUTOPLAY_HANDLER', '🚨 Autoplay blocked event received', {
        detail: customEvent.detail
      });

      setAudioAutoplayState({
        isBlocked: true,
        isDismissed: false
      });
    };

    window.addEventListener('voiceCoachAutoplayBlocked', handleAutoplayBlocked);

    return () => {
      window.removeEventListener('voiceCoachAutoplayBlocked', handleAutoplayBlocked);
    };
  }, []);

  const handleAudioEnabled = () => {
    logger.info('AUDIO_AUTOPLAY_HANDLER', '✅ Audio enabled by user');
    setAudioAutoplayState({
      isBlocked: false,
      isDismissed: false
    });
  };

  const handleDismiss = () => {
    logger.info('AUDIO_AUTOPLAY_HANDLER', '👋 User dismissed audio prompt');
    setAudioAutoplayState(prev => ({
      ...prev,
      isDismissed: true
    }));
  };

  return {
    shouldShowPrompt: audioAutoplayState.isBlocked && !audioAutoplayState.isDismissed,
    handleAudioEnabled,
    handleDismiss
  };
}
