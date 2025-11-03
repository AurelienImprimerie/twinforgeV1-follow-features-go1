/**
 * Input Mode Hook
 * Manages automatic mode switching between text, voice-to-text, and realtime
 */

import { useState, useEffect } from 'react';
import { useUnifiedCoachStore } from '../../../../../system/store/unifiedCoachStore';
import logger from '../../../../../lib/utils/logger';

export type InputMode = 'text' | 'voice-to-text' | 'realtime';

export interface InputModeState {
  currentInputMode: InputMode;
  shouldHideNormalChat: boolean;
  isRealtimeActive: boolean;
}

export function useInputMode(
  isRecording: boolean,
  isTranscribing: boolean,
  realtimeState: 'idle' | 'connecting' | 'listening' | 'speaking' | 'error'
): InputModeState {
  const [currentInputMode, setCurrentInputMode] = useState<InputMode>('text');
  const setInputModeStore = useUnifiedCoachStore(state => state.setInputMode);

  useEffect(() => {
    let newMode: InputMode = 'text';

    if (isRecording || isTranscribing) {
      newMode = 'voice-to-text';
    } else if (realtimeState !== 'idle' && realtimeState !== 'error') {
      newMode = 'realtime';
    }

    setCurrentInputMode(newMode);
    setInputModeStore(newMode);

    logger.debug('CHAT_INPUT_BAR', 'Input mode changed', {
      mode: newMode,
      isRecording,
      isTranscribing,
      realtimeState
    });
  }, [isRecording, isTranscribing, realtimeState, setInputModeStore]);

  useEffect(() => {
    if (realtimeState === 'connecting' || realtimeState === 'listening' || realtimeState === 'speaking') {
      logger.debug('CHAT_INPUT_BAR', 'Realtime active detected, forcing voice mode display');
    }
  }, [realtimeState]);

  const isRealtimeActive = realtimeState !== 'idle' && realtimeState !== 'error';
  const shouldHideNormalChat = isRealtimeActive || isRecording || isTranscribing;

  return {
    currentInputMode,
    shouldHideNormalChat,
    isRealtimeActive
  };
}
