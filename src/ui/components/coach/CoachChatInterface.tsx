/**
 * Coach Chat Interface
 * Main chat component for coach interaction
 * Combines MessagesDisplay with ChatInputBar for a complete chat experience
 */

import React, { useRef, useEffect, useState } from 'react';
import { useUnifiedCoachStore } from '../../../system/store/unifiedCoachStore';
import { voiceCoachOrchestrator } from '../../../system/services/voice/voiceCoachOrchestrator';
import logger from '../../../lib/utils/logger';
import MessagesDisplay from './MessagesDisplay';
import ChatInputBar from './ChatInputBar';
import type { ExerciseAdjustmentCategory } from '../../../config/exerciseAdjustmentConfig';

interface CoachChatInterfaceProps {
  stepColor: string;
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  className?: string;
  messagesContainerRef?: React.RefObject<HTMLDivElement>;
  onScrollChange?: (showButton: boolean) => void;
  onExerciseClick?: (exerciseId: string, exerciseName: string) => void;
  onCategorySelect?: (category: ExerciseAdjustmentCategory) => void;
  onOptionSelect?: (optionId: string) => void;
  onValidate?: () => void;
  onModify?: () => void;
  onViewExercise?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
}

const CoachChatInterface: React.FC<CoachChatInterfaceProps> = ({
  stepColor,
  onSendMessage,
  isTyping = false,
  className = '',
  messagesContainerRef,
  onScrollChange,
  onExerciseClick,
  onCategorySelect,
  onOptionSelect,
  onValidate,
  onModify,
  onViewExercise,
  onContinue,
  onBack
}) => {
  // Use UnifiedCoachStore with proper selectors
  const isRecording = useUnifiedCoachStore(state => state.isRecording);
  const isProcessing = useUnifiedCoachStore(state => state.isProcessing);
  const isSpeaking = useUnifiedCoachStore(state => state.isSpeaking);
  const voiceState = useUnifiedCoachStore(state => state.voiceState);
  const currentMode = useUnifiedCoachStore(state => state.currentMode);
  const voiceError = useUnifiedCoachStore(state => state.error);

  // Détecter si Realtime est actif pour masquer les messages
  // IMPORTANT: Masquer IMMEDÉDIATEMENT dès que voiceState change de idle
  const isRealtimeActive = voiceState !== 'idle' && voiceState !== 'error';

  // Local state for realtime
  const [realtimeError, setRealtimeError] = useState<string | undefined>(undefined);

  // Voice settings - default enabled for all modes
  const voiceSettings = { enabled: true };

  const handleStartRecording = () => {
    logger.info('COACH_CHAT_INTERFACE', 'Voice-to-text recording started via ChatInputBar');
    // Sync with store so UI reflects recording state
    const store = useUnifiedCoachStore.getState();
    store.setRecording(true);
    logger.debug('COACH_CHAT_INTERFACE', 'Store isRecording set to TRUE');
  };

  const handleStopRecording = () => {
    logger.info('COACH_CHAT_INTERFACE', 'Voice-to-text recording stopped via ChatInputBar');
    // Sync with store so UI reflects recording stopped
    const store = useUnifiedCoachStore.getState();
    store.setRecording(false);
    logger.debug('COACH_CHAT_INTERFACE', 'Store isRecording set to FALSE');
  };

  /**
   * Démarrer la session Realtime
   */
  const handleStartRealtimeSession = async () => {
    try {
      logger.info('COACH_CHAT_INTERFACE', 'Starting Realtime session');
      setRealtimeError(undefined);

      // CRITICAL: Force inputMode to 'realtime' BEFORE starting the session
      // This ensures UI transitions immediately without showing text messages
      const store = useUnifiedCoachStore.getState();
      store.setInputMode('realtime');
      logger.info('COACH_CHAT_INTERFACE', 'InputMode set to realtime BEFORE session start');

      // Initialiser l'orchestrateur si nécessaire
      if (!voiceCoachOrchestrator.initialized) {
        logger.info('COACH_CHAT_INTERFACE', 'Initializing voice coach orchestrator');
        await voiceCoachOrchestrator.initialize();
      }

      // Démarrer la session avec le mode actuel (ou par défaut 'force')
      const mode = currentMode || 'force';
      logger.info('COACH_CHAT_INTERFACE', `Starting voice session with mode: ${mode}`);
      await voiceCoachOrchestrator.startVoiceSession(mode);

      logger.info('COACH_CHAT_INTERFACE', 'Realtime session started successfully');
    } catch (error) {
      logger.error('COACH_CHAT_INTERFACE', 'Failed to start Realtime session', { error });

      // Afficher l'erreur dans l'UI
      const errorMessage = error instanceof Error ? error.message : 'Failed to start voice session';
      setRealtimeError(errorMessage);

      // Aussi l'afficher dans le store si disponible
      if (voiceError) {
        setRealtimeError(voiceError);
      }
    }
  };

  /**
   * Arrêter la session Realtime
   */
  const handleStopRealtimeSession = () => {
    try {
      logger.info('COACH_CHAT_INTERFACE', 'Stopping Realtime session');
      setRealtimeError(undefined);
      voiceCoachOrchestrator.stopVoiceSession();
      logger.info('COACH_CHAT_INTERFACE', 'Realtime session stopped');

      // IMPORTANT: Retour automatique au mode text après avoir arrêté realtime
      const store = useUnifiedCoachStore.getState();
      store.setInputMode('text');
      logger.info('COACH_CHAT_INTERFACE', 'Returned to text mode after stopping Realtime');
    } catch (error) {
      logger.error('COACH_CHAT_INTERFACE', 'Error stopping Realtime session', { error });
    }
  };

  // Nettoyer l'erreur quand l'état change
  useEffect(() => {
    if (voiceState === 'idle') {
      setRealtimeError(undefined);
    }
  }, [voiceState]);

  return (
    <div className={`coach-chat-interface flex flex-col ${className}`} style={{ height: '100%', position: 'relative', minHeight: 0 }}>
      {/* Messages Display - Masqué pendant les sessions Realtime */}
      {/* CRITICAL: Use direct voiceState check to hide IMMEDIATELY on button click */}
      {!isRealtimeActive && (
        <MessagesDisplay
          stepColor={stepColor}
          isTyping={isTyping}
          messagesContainerRef={messagesContainerRef}
          onScrollChange={onScrollChange}
          onExerciseClick={onExerciseClick}
          onCategorySelect={onCategorySelect}
          onOptionSelect={onOptionSelect}
          onValidate={onValidate}
          onModify={onModify}
          onViewExercise={onViewExercise}
          onContinue={onContinue}
          onBack={onBack}
          onSendMessage={onSendMessage}
        />
      )}

      {/* Message d'info pendant Realtime - Affichage instantané */}
      {isRealtimeActive && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          transition: 'none'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '8px'
            }}>
              Session vocale en cours
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              Parlez naturellement avec votre coach
            </div>
          </div>
        </div>
      )}

      {/* Chat Input Bar - Fixed at bottom with dynamic height based on mode */}
      <div
        className="chat-input-footer flex-shrink-0"
        style={{
          borderTop: (voiceState !== 'idle' || isRecording) ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          padding: (voiceState !== 'idle' || isRecording) ? '0' : '8px 8px 0px 8px',
          transition: 'none'
        }}
      >
        <ChatInputBar
          onSendMessage={onSendMessage}
          onStartVoiceRecording={handleStartRecording}
          onStopVoiceRecording={handleStopRecording}
          onStartRealtimeSession={handleStartRealtimeSession}
          onStopRealtimeSession={handleStopRealtimeSession}
          isRecording={isRecording}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          realtimeState={voiceState}
          realtimeError={realtimeError}
          voiceEnabled={voiceSettings.enabled}
          stepColor={stepColor}
        />
      </div>
    </div>
  );
};

export default CoachChatInterface;
