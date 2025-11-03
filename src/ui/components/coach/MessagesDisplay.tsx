/**
 * Messages Display Component
 * Affiche la liste des messages de chat sans input intégré
 * Permet une composition flexible dans différents contextes
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedCoachStore } from '../../../system/store/unifiedCoachStore';
import CoachMessage from './CoachMessage';
import CoachMessageRenderer from './CoachMessageRenderer';
import TypingIndicator from './TypingIndicator';
import AudioWaveform from '../chat/AudioWaveform';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import type { ExtendedChatMessage } from '../../../domain/chatMessages';
import type { ExerciseAdjustmentCategory } from '../../../config/exerciseAdjustmentConfig';

// Helper to generate CTAs from coach messages
const generateCTAsForCoachMessage = (message: string): { label: string; action: string }[] => {
  const ctaButtons: { label: string; action: string }[] = [];

  if (message.toLowerCase().includes('prêt') || message.toLowerCase().includes('commencer')) {
    ctaButtons.push({ label: 'Oui, allons-y !', action: 'confirm' });
    ctaButtons.push({ label: 'Pas encore', action: 'wait' });
  }

  if (message.toLowerCase().includes('ajuster') || message.toLowerCase().includes('modifier')) {
    ctaButtons.push({ label: 'Modifier', action: 'modify' });
    ctaButtons.push({ label: "C'est bon", action: 'keep' });
  }

  return ctaButtons;
};

interface MessagesDisplayProps {
  stepColor: string;
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
  onSendMessage?: (message: string) => void;
}

const MessagesDisplay: React.FC<MessagesDisplayProps> = ({
  stepColor,
  isTyping = false,
  className = '',
  messagesContainerRef: externalMessagesContainerRef,
  onScrollChange,
  onExerciseClick,
  onCategorySelect,
  onOptionSelect,
  onValidate,
  onModify,
  onViewExercise,
  onContinue,
  onBack,
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const internalMessagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = externalMessagesContainerRef || internalMessagesContainerRef;

  const messages = useUnifiedCoachStore(state => state.messages);
  const currentMode = useUnifiedCoachStore(state => state.currentMode);
  const voiceState = useUnifiedCoachStore(state => state.voiceState);
  const currentTranscription = useUnifiedCoachStore(state => state.currentTranscription);
  const isSpeaking = useUnifiedCoachStore(state => state.isSpeaking);
  const visualization = useUnifiedCoachStore(state => state.visualization);
  const currentInputMode = useUnifiedCoachStore(state => state.currentInputMode);

  // CRITICAL: Masquer IMMEDÉDIATEMENT si realtime est actif OU si inputMode est realtime
  const isRealtimeActive = voiceState !== 'idle' && voiceState !== 'error';
  const shouldHideMessages = isRealtimeActive || currentInputMode === 'realtime';

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  // TOUJOURS appeler les hooks avant tout return conditionnel
  useEffect(() => {
    if (!shouldHideMessages) {
      scrollToBottom(true);
    }
  }, [messages, isTyping, shouldHideMessages]);

  // Guard: Ne rien afficher si le mode realtime est détecté
  if (shouldHideMessages) {
    return null;
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    const shouldShow = !isNearBottom;

    if (onScrollChange) {
      onScrollChange(shouldShow);
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className={`messages-container flex-1 overflow-y-auto px-2.5 pt-1.5 pb-0 ${className}`}
      style={{
        overscrollBehavior: 'contain',
        minHeight: 0
      }}
    >
      {/* Realtime Session Active Banner */}
      <AnimatePresence>
        {isRealtimeActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              marginBottom: '12px',
              padding: '12px 16px',
              borderRadius: '16px',
              background: `
                linear-gradient(180deg,
                  rgba(239, 68, 68, 0.25) 0%,
                  rgba(220, 38, 38, 0.15) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 4px 24px rgba(239, 68, 68, 0.2), 0 0 32px rgba(239, 68, 68, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.div
                  animate={{
                    scale: isSpeaking ? [1, 1.2, 1] : 1,
                    opacity: isSpeaking ? [0.6, 1, 0.6] : 1
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isSpeaking ? '#10B981' : '#EF4444',
                    boxShadow: isSpeaking
                      ? '0 0 12px rgba(16, 185, 129, 0.8)'
                      : '0 0 12px rgba(239, 68, 68, 0.8)'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>
                  {voiceState === 'listening' && 'En écoute...'}
                  {voiceState === 'speaking' && 'Coach parle...'}
                  {voiceState === 'processing' && 'Traitement...'}
                </span>
              </div>
            </div>

            {/* Waveform visualization */}
            {visualization.frequencies && visualization.frequencies.length > 0 && (
              <AudioWaveform
                frequencies={visualization.frequencies}
                color={isSpeaking ? '#10B981' : '#EF4444'}
                isActive={isRealtimeActive}
                height={40}
              />
            )}

            {/* Current transcription preview */}
            {currentTranscription && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontStyle: 'italic',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                Vous: {currentTranscription}...
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md"
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 35%, transparent) 0%, transparent 70%),
                  rgba(255, 255, 255, 0.1)
                `,
                border: `2px solid color-mix(in srgb, ${stepColor} 40%, transparent)`,
                boxShadow: `0 0 24px color-mix(in srgb, ${stepColor} 25%, transparent)`
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <span className="text-3xl">💪</span>
              </motion.div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Ton Coach est Prêt !
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Utilise le chat ci-dessous pour échanger avec ton coach IA
            </p>
          </motion.div>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const extendedMessage = message as ExtendedChatMessage;
            const isInteractiveMessage = [
              'exercise-list-intro',
              'category-selection',
              'option-selection',
              'validation',
              'update-complete'
            ].includes(extendedMessage.type);

            if (isInteractiveMessage && currentMode === 'training') {
              return (
                <CoachMessageRenderer
                  key={message.id}
                  message={extendedMessage}
                  stepColor={stepColor}
                  onExerciseClick={onExerciseClick}
                  onCategorySelect={onCategorySelect}
                  onOptionSelect={onOptionSelect}
                  onValidate={onValidate}
                  onModify={onModify}
                  onViewExercise={onViewExercise}
                  onContinue={onContinue}
                  onBack={onBack}
                />
              );
            }

            const isCoach = message.role === 'coach';
            const isTrainingMode = currentMode === 'training';
            const shouldShowCTA = isCoach && isTrainingMode && message.type === 'text';
            const ctaButtons = shouldShowCTA ? generateCTAsForCoachMessage(message.content) : [];

            const handleCTAClick = (buttonId: string) => {
              if (!onSendMessage) return;

              const responses: Record<string, string> = {
                'reduce-intensity': 'Je voudrais réduire la difficulté',
                'increase-intensity': "J'aimerais augmenter l'intensité",
                'adjust-sets': 'Je veux ajuster le nombre de séries',
                'adjust-reps': 'Je veux modifier les répétitions',
                'show-alternatives': 'Montre-moi les alternatives',
                'keep-exercise': 'Je garde cet exercice',
                'keep-as-is': "C'est parfait comme ça",
                'yes-perfect': 'Oui, c\'est parfait !',
                'need-changes': "J'aimerais faire quelques ajustements",
                'understood': 'Compris'
              };

              const userResponse = responses[buttonId] || 'OK';
              onSendMessage(userResponse);
            };

            return (
              <CoachMessage
                key={message.id}
                message={message}
                stepColor={stepColor}
                showCTA={shouldShowCTA}
                ctaButtons={ctaButtons}
                onCTAClick={handleCTAClick}
              />
            );
          })}

          {isTyping && <TypingIndicator stepColor={stepColor} />}

          <div ref={messagesEndRef} />
        </>
      )}

      <style>{`
        .messages-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MessagesDisplay;
