/**
 * Text Chat Hook
 * Manages text chat service initialization and message handling
 */

import { useState, useEffect } from 'react';
import { textChatService } from '../../../../../system/services/chat/textChatService';
import logger from '../../../../../lib/utils/logger';

interface Message {
  id?: string;
  role: 'user' | 'coach';
  content: string;
  emotion?: string;
}

export interface TextChatState {
  isTextProcessing: boolean;
}

export function useTextChat(
  communicationMode: 'voice' | 'text',
  currentMode: string,
  modeConfigs: Record<string, any>,
  messages: Message[],
  addMessage: (msg: { role: 'user' | 'coach'; content: string }) => void,
  setError: (error: string) => void
): TextChatState {
  const [isTextProcessing, setIsTextProcessing] = useState(false);

  useEffect(() => {
    if (communicationMode === 'text' && currentMode) {
      const config = modeConfigs[currentMode];

      textChatService.initialize({
        mode: currentMode,
        systemPrompt: config.systemPrompt
      });

      logger.info('VOICE_COACH_PANEL', 'Text chat service initialized', { mode: currentMode });
    }
  }, [communicationMode, currentMode, modeConfigs]);

  useEffect(() => {
    if (communicationMode !== 'text') return;

    const unsubscribeMessage = textChatService.onMessage((chunk, isDelta) => {
      if (isDelta && chunk) {
        const lastMessage = messages[messages.length - 1];

        if (lastMessage && lastMessage.role === 'coach') {
          lastMessage.content += chunk;
        } else {
          addMessage({
            role: 'coach',
            content: chunk
          });
        }
      } else if (!isDelta) {
        setIsTextProcessing(false);
      }
    });

    const unsubscribeError = textChatService.onError((error) => {
      logger.error('VOICE_COACH_PANEL', 'Text chat error', { error: error.message });
      setError(error.message);
      setIsTextProcessing(false);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeError();
    };
  }, [communicationMode, messages, addMessage, setError]);

  return {
    isTextProcessing
  };
}
