/**
 * Voice Input Hook
 * Manages voice-to-text recording and transcription
 */

import { useState } from 'react';
import { openaiWhisperService } from '../../../../../system/services/audio/openaiWhisperService';
import { useUserStore } from '../../../../../system/store/userStore';
import { Haptics } from '../../../../../utils/haptics';
import logger from '../../../../../lib/utils/logger';

export interface VoiceInputState {
  isTranscribing: boolean;
  transcriptionError: string | undefined;
  transcribedText: string;
  handleVoiceToggle: () => Promise<void>;
}

export function useVoiceInput(
  isRecording: boolean,
  onStartVoiceRecording: () => void,
  onStopVoiceRecording: () => void,
  onSendMessage: (message: string) => void,
  click: () => void
): VoiceInputState {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | undefined>(undefined);
  const [transcribedText, setTranscribedText] = useState<string>('');

  const handleVoiceToggle = async () => {
    click();
    Haptics.press();

    const { session } = useUserStore.getState();
    const userId = session?.user?.id;

    if (!userId) {
      logger.error('CHAT_INPUT_BAR', 'User not authenticated for voice transcription');
      setTranscriptionError('Utilisateur non authentifié');
      return;
    }

    if (isRecording) {
      logger.info('CHAT_INPUT_BAR', 'Stopping voice recording and starting transcription');
      onStopVoiceRecording();

      try {
        setTranscriptionError(undefined);
        setTranscribedText('');

        const audioBlob = await openaiWhisperService.stopRecording();
        logger.info('CHAT_INPUT_BAR', 'Audio blob captured', { size: audioBlob.size });

        setIsTranscribing(true);
        const result = await openaiWhisperService.transcribe(audioBlob, userId);
        setIsTranscribing(false);

        logger.info('CHAT_INPUT_BAR', 'Transcription completed', {
          textLength: result.text.length,
          text: result.text
        });

        if (result.text.trim()) {
          setTranscribedText(result.text.trim());
          setTimeout(() => {
            onSendMessage(result.text.trim());
            setTranscribedText('');
            Haptics.impact();
            logger.info('CHAT_INPUT_BAR', 'Returning to text mode after voice-to-text message sent');
          }, 500);
        } else {
          setTranscriptionError('Aucun texte détecté dans l\'enregistrement');
          logger.info('CHAT_INPUT_BAR', 'Returning to text mode after transcription error');
        }
      } catch (error) {
        setIsTranscribing(false);
        const errorMessage = error instanceof Error ? error.message : 'Erreur de transcription';
        setTranscriptionError(errorMessage);
        logger.error('CHAT_INPUT_BAR', 'Transcription error', { error: errorMessage });
        logger.info('CHAT_INPUT_BAR', 'Returning to text mode after transcription exception');
      }
    } else {
      logger.info('CHAT_INPUT_BAR', 'Starting voice recording');
      try {
        setTranscriptionError(undefined);
        setTranscribedText('');
        await openaiWhisperService.startRecording();
        onStartVoiceRecording();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur microphone';
        setTranscriptionError(errorMessage);
        logger.error('CHAT_INPUT_BAR', 'Recording start error', { error: errorMessage });
      }
    }
  };

  return {
    isTranscribing,
    transcriptionError,
    transcribedText,
    handleVoiceToggle
  };
}
