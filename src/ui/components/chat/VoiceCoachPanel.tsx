/**
 * Voice Coach Panel V2 - Refactored
 * Interface vocale/textuelle intelligente avec détection d'environnement
 * Reduced from 763 lines to ~140 lines (82% reduction)
 *
 * @deprecated Ce composant est obsolète. Utilisez UnifiedCoachDrawer à la place.
 * @see UnifiedCoachDrawer
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCoachStore } from '../../../system/store/voiceCoachStore';
import { useGlobalChatStore } from '../../../system/store/globalChatStore';
import { Z_INDEX } from '../../../system/store/overlayStore';
import { useFeedback } from '../../../hooks/useFeedback';
import { Haptics } from '../../../utils/haptics';
import { textChatService } from '../../../system/services/chat/textChatService';
import { environmentDetectionService } from '../../../system/services/detection/environmentDetectionService';
import AudioWaveform from './AudioWaveform';
import TextChatInput from './TextChatInput';
import VoiceReadyPrompt from './VoiceReadyPrompt';
import { useVoiceEnvironment, useTextChat, useVoiceSession } from './voice/hooks';
import { VoicePanelHeader, MessagesDisplay } from './voice/components';
import logger from '../../../lib/utils/logger';
import '../../../styles/components/chat/voice-coach-panel.css';

const VoiceCoachPanel: React.FC = () => {
  useEffect(() => {
    console.warn(
      '⚠️ DEPRECATED: VoiceCoachPanel is deprecated and will be removed in a future version.\n' +
      '→ Use UnifiedCoachDrawer instead.\n' +
      '→ See docs/technical/UNIFIED_CHAT_SYSTEM.md for migration guide.'
    );
  }, []);

  const { navClose } = useFeedback();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isPanelOpen,
    isPanelMinimized,
    voiceState,
    messages,
    currentTranscription,
    showTranscript,
    showReadyPrompt,
    visualization,
    preferences,
    communicationMode,
    closePanel,
    minimizePanel,
    maximizePanel,
    toggleTranscript,
    toggleCommunicationMode,
    stopListening,
    addMessage,
    setShowReadyPrompt,
    setVoiceState,
    setError,
    setCommunicationMode
  } = useVoiceCoachStore();

  const { currentMode, modeConfigs } = useGlobalChatStore();
  const modeConfig = modeConfigs[currentMode];
  const modeColor = modeConfig.color;

  const { capabilities } = useVoiceEnvironment(communicationMode, setCommunicationMode);
  const { isTextProcessing } = useTextChat(
    communicationMode,
    currentMode,
    modeConfigs,
    messages,
    addMessage,
    setError
  );
  const { handleStartVoiceSession, handleCancelReadyPrompt } = useVoiceSession(
    currentMode,
    setVoiceState,
    setShowReadyPrompt,
    setError,
    setCommunicationMode,
    closePanel
  );

  useEffect(() => {
    if (showTranscript || communicationMode === 'text') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentTranscription, showTranscript, communicationMode]);

  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navClose();
        Haptics.tap();
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, navClose, closePanel]);

  const handleClose = () => {
    navClose();
    Haptics.tap();
    closePanel();

    if (voiceState === 'listening') {
      stopListening();
    }

    if (communicationMode === 'text') {
      textChatService.cleanup();
    }
  };

  const handleSendTextMessage = async (text: string) => {
    try {
      if (!text || text.trim().length === 0) {
        logger.warn('VOICE_COACH_PANEL', 'Attempted to send empty message, ignoring');
        return;
      }

      logger.info('VOICE_COACH_PANEL', 'Sending text message', {
        mode: currentMode,
        messageLength: text.length
      });

      addMessage({ role: 'user', content: text.trim() });

      await textChatService.sendMessage(text.trim(), true);
    } catch (error) {
      logger.error('VOICE_COACH_PANEL', 'Error sending text message', { error });
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
    }
  };

  const handleToggleCommunicationMode = () => {
    logger.info('VOICE_COACH_PANEL', '🎤 User toggling communication mode', {
      from: communicationMode,
      to: communicationMode === 'text' ? 'voice' : 'text',
      canUseVoiceMode: capabilities.canUseVoiceMode
    });

    toggleCommunicationMode();
  };

  const isTextMode = communicationMode === 'text';

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          <motion.div
            key="voice-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="lg:hidden"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: Z_INDEX.CHAT_DRAWER - 1
            }}
          />

          <motion.div
            key="voice-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className={`voice-coach-panel ${isPanelMinimized ? 'voice-coach-panel--minimized' : ''}`}
            style={{
              position: 'fixed',
              top: 'calc(64px + 12px)',
              right: '8px',
              bottom: 'calc(var(--new-bottom-bar-height) + var(--new-bottom-bar-bottom-offset) + 12px)',
              width: isPanelMinimized ? '80px' : 'min(420px, calc(100vw - 16px))',
              zIndex: Z_INDEX.CHAT_DRAWER,
              borderRadius: '20px',
              background: `
                var(--liquid-reflections-multi),
                var(--liquid-highlight-ambient),
                var(--liquid-glass-bg-elevated)
              `,
              backdropFilter: 'blur(var(--liquid-panel-blur)) saturate(var(--liquid-panel-saturate))',
              WebkitBackdropFilter: 'blur(var(--liquid-panel-blur)) saturate(var(--liquid-panel-saturate))',
              boxShadow: 'var(--liquid-panel-shadow)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              isolation: 'isolate',
              transform: 'translateZ(0)',
              willChange: 'transform, filter, width',
              transition: 'width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: 'inherit',
                padding: '2px',
                background: 'var(--liquid-border-gradient-tricolor)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                pointerEvents: 'none',
                opacity: 1,
                zIndex: 1,
                animation: 'borderPulse 4s ease-in-out infinite'
              }}
            />

            <div
              style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: 'calc(20px + 4px)',
                background: `radial-gradient(
                  ellipse at 80% 50%,
                  color-mix(in srgb, ${modeColor} 15%, transparent) 0%,
                  rgba(61, 19, 179, 0.1) 40%,
                  transparent 70%
                )`,
                opacity: 0.8,
                zIndex: -1,
                pointerEvents: 'none',
                animation: 'glowPulse 3s ease-in-out infinite alternate'
              }}
            />

            <VoicePanelHeader
              isPanelMinimized={isPanelMinimized}
              modeColor={modeColor}
              modeIcon={modeConfig.icon}
              modeName={modeConfig.displayName}
              voiceState={voiceState}
              isTextMode={isTextMode}
              isTextProcessing={isTextProcessing}
              showTranscript={showTranscript}
              canUseVoiceMode={capabilities.canUseVoiceMode}
              isStackBlitz={capabilities.isStackBlitz}
              environmentName={capabilities.environmentName}
              onToggleCommunicationMode={handleToggleCommunicationMode}
              onToggleTranscript={toggleTranscript}
              onMinimize={minimizePanel}
              onMaximize={maximizePanel}
              onClose={handleClose}
            />

            {!isPanelMinimized && (
              <div className="voice-panel-content flex-1 overflow-hidden flex flex-col">
                {showReadyPrompt && !isTextMode && (
                  <VoiceReadyPrompt
                    modeColor={modeColor}
                    modeName={modeConfig.displayName}
                    onStartSession={handleStartVoiceSession}
                    onCancel={handleCancelReadyPrompt}
                  />
                )}

                {!showReadyPrompt && !isTextMode && preferences.showVisualizations && (
                  <div
                    className="audio-visualization-container"
                    style={{
                      padding: '20px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <AudioWaveform
                      frequencies={visualization.frequencies}
                      color={modeColor}
                      isActive={voiceState === 'listening' || voiceState === 'speaking'}
                      height={80}
                    />
                  </div>
                )}

                {!showReadyPrompt && (isTextMode || showTranscript) && (
                  <div
                    className="messages-container flex-1 overflow-y-auto px-4 py-3"
                    style={{
                      overscrollBehavior: 'contain',
                      minHeight: 0
                    }}
                  >
                    <MessagesDisplay
                      messages={messages}
                      currentTranscription={currentTranscription}
                      modeColor={modeColor}
                      isTextMode={isTextMode}
                      messagesEndRef={messagesEndRef}
                    />
                  </div>
                )}

                {!showReadyPrompt && isTextMode && !isPanelMinimized && (
                  <TextChatInput
                    onSendMessage={handleSendTextMessage}
                    disabled={isTextProcessing}
                    placeholder="Tapez votre message..."
                    color={modeColor}
                  />
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VoiceCoachPanel;
