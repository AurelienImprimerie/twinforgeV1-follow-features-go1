/**
 * Global Chat Drawer - Unified Version
 * Drawer de chat unifié supportant texte et Realtime API
 * Utilise unifiedCoachStore pour gérer tous les messages
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { useUnifiedCoachStore } from '../../../system/store/unifiedCoachStore';
import { Z_INDEX, useOverlayStore } from '../../../system/store/overlayStore';
import CoachChatInterface from '../coach/CoachChatInterface';
// VoiceSessionMinimal removed - now integrated in ChatInputBar
import { useFeedback } from '../../../hooks/useFeedback';
import { Haptics } from '../../../utils/haptics';
import logger from '../../../lib/utils/logger';
import { chatAIService } from '../../../system/services/chat/chatAiService';
import { chatConversationService } from '../../../system/services/chat/chatConversationService';
import { ChatWelcomeService } from '../../../system/services/chat/chatWelcomeService';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';
import { chatIntegration } from '../../../system/head/integration/ChatIntegration';

interface GlobalChatDrawerProps {
  chatButtonRef?: React.RefObject<HTMLButtonElement>;
}

const GlobalChatDrawer: React.FC<GlobalChatDrawerProps> = ({ chatButtonRef }) => {
  const location = useLocation();

  // Utiliser unifiedCoachStore au lieu de globalChatStore
  const {
    isPanelOpen: isOpen,
    closePanel: close,
    currentMode,
    modeConfigs,
    setMode,
    closeOnNavigation,
    addMessage,
    messages,
    isTyping,
    setTyping,
    conversationId,
    incrementUnread,
    voiceState,
    isVoiceOnlyMode
  } = useUnifiedCoachStore();

  const { navClose } = useFeedback();
  const previousPathRef = useRef(location.pathname);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { mode } = usePerformanceMode();

  const modeConfig = modeConfigs[currentMode];
  const modeColor = modeConfig.color;

  // Position du drawer - responsive pour tablette
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  const position = {
    side: 'right' as const,
    width: isTablet ? 500 : 420,
    isMinimized: false
  };

  // Détecter si une session Realtime est active pour masquer l'historique
  // CRITICAL: Masquer IMMEDÉDIATEMENT dès que voiceState change de idle
  const isRealtimeActive = voiceState !== 'idle' && voiceState !== 'error';
  const shouldShowMessages = !isRealtimeActive; // Masquer les messages pendant Realtime

  // Performance-aware backdrop filters
  const overlayBackdrop = useMemo(() => {
    return mode === 'high-performance' ? 'none' : 'blur(4px)';
  }, [mode]);

  const headerBackdrop = useMemo(() => {
    return mode === 'high-performance' ? 'none' : mode === 'balanced' ? 'blur(8px)' : 'blur(16px)';
  }, [mode]);

  const overlayStore = useOverlayStore();

  // Sync chat state with overlay store
  useEffect(() => {
    const unsubscribe = useOverlayStore.subscribe(
      (state) => state.activeOverlayId,
      (activeOverlayId) => {
        // If another overlay opens, close the chat
        if (activeOverlayId !== 'chatDrawer' && activeOverlayId !== 'none' && isOpen) {
          logger.debug('GLOBAL_CHAT_DRAWER', 'Another overlay opened - closing chat', {
            newOverlay: activeOverlayId,
            currentMode,
            timestamp: new Date().toISOString()
          });
          close();
        }
      }
    );

    return unsubscribe;
  }, [isOpen, currentMode, close]);

  const handleClose = () => {
    const lastMessage = messages[messages.length - 1];
    const isCoachMessage = lastMessage && lastMessage.role === 'coach';

    if (isTyping || isCoachMessage) {
      incrementUnread();
      logger.debug('GLOBAL_CHAT_DRAWER', 'Closing chat with unread messages', {
        mode: currentMode,
        isTyping,
        hasUnreadCoachMessage: isCoachMessage,
        timestamp: new Date().toISOString()
      });
    }
    close();
  };

  // Fermer le chat lors de la navigation si l'option est activée
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      if (isOpen && closeOnNavigation) {
        logger.debug('GLOBAL_CHAT_DRAWER', 'Closing chat on navigation', {
          from: previousPathRef.current,
          to: location.pathname,
          timestamp: new Date().toISOString()
        });
        navClose();
        Haptics.tap();
        handleClose();
      }
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname, isOpen, closeOnNavigation, navClose]);

  // Détection automatique du mode selon la route
  useEffect(() => {
    if (!isOpen) return;

    let detectedMode = currentMode;

    if (location.pathname.startsWith('/training') || location.pathname.includes('/pipeline')) {
      detectedMode = 'training';
    } else if (location.pathname.startsWith('/meals') || location.pathname.startsWith('/fridge')) {
      detectedMode = 'nutrition';
    } else if (location.pathname.startsWith('/fasting')) {
      detectedMode = 'fasting';
    } else if (location.pathname.startsWith('/body-scan') || location.pathname.startsWith('/avatar')) {
      detectedMode = 'body-scan';
    } else {
      detectedMode = 'general';
    }

    if (detectedMode !== currentMode) {
      logger.debug('GLOBAL_CHAT_DRAWER', 'Auto-switching mode based on route', {
        route: location.pathname,
        from: currentMode,
        to: detectedMode,
        timestamp: new Date().toISOString()
      });
      setMode(detectedMode);
    }
  }, [location.pathname, isOpen]);

  // Charger l'historique des messages au changement de mode
  useEffect(() => {
    if (!isOpen) return;

    const loadConversationHistory = async () => {
      try {
        const convId = await chatConversationService.getActiveConversationByMode(currentMode);

        if (convId) {
          const history = await chatConversationService.getConversationMessages(convId);

          if (history.length > 0) {
            useUnifiedCoachStore.setState({ conversationId: convId, messages: history });
            logger.debug('GLOBAL_CHAT_DRAWER', 'Loaded conversation history', {
              conversationId: convId,
              messageCount: history.length,
              mode: currentMode
            });
          } else {
            // Afficher un message d'accueil pour les nouvelles conversations
            const welcomeMessage = await ChatWelcomeService.getWelcomeMessage({
              mode: currentMode,
              hasHistory: false
            });

            if (welcomeMessage && welcomeMessage.trim().length > 0 && ChatWelcomeService.shouldShowWelcome(messages.length)) {
              addMessage({
                role: 'coach',
                type: 'text',
                content: welcomeMessage
              });
            } else if (!welcomeMessage || welcomeMessage.trim().length === 0) {
              logger.warn('GLOBAL_CHAT_DRAWER', '⚠️ Empty welcome message received, skipping');
            }
          }
        } else {
          // Nouvelle conversation sans ID encore
          const welcomeMessage = await ChatWelcomeService.getWelcomeMessage({
            mode: currentMode,
            hasHistory: false
          });

          if (welcomeMessage && ChatWelcomeService.shouldShowWelcome(messages.length)) {
            addMessage({
              role: 'coach',
              type: 'text',
              content: welcomeMessage
            });
          }
        }
      } catch (error) {
        logger.error('GLOBAL_CHAT_DRAWER', 'Error loading conversation history', { error });
      }
    };

    loadConversationHistory();
  }, [currentMode, isOpen]);

  // Fermer le drawer avec ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navClose();
        Haptics.tap();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, navClose, handleClose]);

  const handleSendMessage = async (message: string) => {
    if (!message || message.trim().length === 0) {
      logger.warn('GLOBAL_CHAT_DRAWER', '⚠️ Attempted to send empty message, ignoring');
      return;
    }

    const userMessage = {
      role: 'user' as const,
      type: 'text' as const,
      content: message.trim()
    };

    logger.info('GLOBAL_CHAT_DRAWER', '🚀 User sent message', {
      messageLength: message.length,
      currentMode,
      messageCount: messages.length
    });

    addMessage(userMessage);
    setTyping(true);

    try {
      logger.info('GLOBAL_CHAT_DRAWER', '📝 Getting conversation ID', { currentMode });

      const convId = conversationId || await chatConversationService.getOrCreateConversation(currentMode);

      if (!convId) {
        logger.error('GLOBAL_CHAT_DRAWER', '❌ Failed to get conversation ID');
        throw new Error('Failed to get or create conversation');
      }

      logger.info('GLOBAL_CHAT_DRAWER', '✅ Conversation ID obtained', { convId });

      if (!conversationId) {
        useUnifiedCoachStore.setState({ conversationId: convId });
      }

      await chatConversationService.saveMessage(convId, userMessage);
      logger.info('GLOBAL_CHAT_DRAWER', '✅ User message saved to DB');

      let systemPrompt = modeConfig.systemPrompt;

      const conversationMessages = messages.slice(-10);

      // Convert and filter messages - this removes empty content and local system notifications
      const convertedMessages = chatAIService.convertMessagesToAPI(conversationMessages);

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...convertedMessages,
        { role: 'user' as const, content: message }
      ];

      logger.info('GLOBAL_CHAT_DRAWER', '📤 Calling chatAIService.sendMessage', {
        apiMessageCount: apiMessages.length,
        originalMessageCount: conversationMessages.length,
        filteredCount: conversationMessages.length - convertedMessages.length,
        mode: currentMode
      });

      // Enrich request with brain context (including Step3 training context)
      const enrichedRequest = await chatIntegration.enrichChatRequest({
        messages: apiMessages,
        mode: currentMode
      }, currentMode);

      logger.info('GLOBAL_CHAT_DRAWER', '✨ Request enriched with brain context', {
        originalLength: apiMessages.reduce((sum, m) => sum + m.content.length, 0),
        enrichedLength: enrichedRequest.messages.reduce((sum, m) => sum + m.content.length, 0),
        hasBrainContext: !!enrichedRequest.contextData?.brainContext
      });

      const response = await chatAIService.sendMessage(enrichedRequest);

      logger.info('GLOBAL_CHAT_DRAWER', '✅ Received response from AI', {
        hasContent: !!response.message?.content,
        contentLength: response.message?.content?.length || 0
      });

      const assistantMessage = {
        role: 'coach' as const,
        type: 'text' as const,
        content: response.message.content
      };

      addMessage(assistantMessage);
      await chatConversationService.saveMessage(convId, assistantMessage);

      logger.info('GLOBAL_CHAT_DRAWER', '✅ Assistant message saved to DB');

    } catch (error) {
      logger.error('GLOBAL_CHAT_DRAWER', '❌ Error in message flow', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      addMessage({
        role: 'system' as const,
        type: 'system' as const,
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.'
      });
    } finally {
      setTyping(false);
    }
  };

  const drawerWidth = position.width;

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Toujours afficher le drawer (plus de mode voice-only séparé)
  // Les modes voice-to-text et realtime sont maintenant intégrés dans ChatInputBar
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - Mobile only */}
          <motion.div
            key="chat-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              navClose();
              Haptics.tap();
              handleClose();
            }}
            className="lg:hidden"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: overlayBackdrop,
              zIndex: 9993
            }}
          />

          {/* Drawer */}
          <motion.div
            key="chat-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className="global-chat-drawer"
            style={{
              position: 'fixed',
              top: 'calc(64px + 12px)',
              // Tablette: aligner avec le bouton de chat qui est à 16px du bord
              // Le drawer doit apparaître à côté du bouton (56px de largeur + 8px de gap = 64px + 16px = 80px)
              right: isTablet ? '80px' : (isDesktop ? '8px' : '8px'),
              bottom: 'calc(var(--new-bottom-bar-height) + var(--new-bottom-bar-bottom-offset) + 12px)',
              width: isTablet
                ? `${drawerWidth}px`
                : `min(${drawerWidth}px, calc(100vw - 16px))`,
              zIndex: Z_INDEX.CHAT_DRAWER,
              borderRadius: '20px',
              background: mode === 'high-performance'
                ? 'rgba(11, 14, 23, 0.95)'
                : `
                    var(--liquid-reflections-multi),
                    var(--liquid-highlight-ambient),
                    var(--liquid-glass-bg-elevated)
                  `,
              backdropFilter: mode === 'high-performance' ? 'none' : 'blur(var(--liquid-panel-blur)) saturate(var(--liquid-panel-saturate))',
              WebkitBackdropFilter: mode === 'high-performance' ? 'none' : 'blur(var(--liquid-panel-blur)) saturate(var(--liquid-panel-saturate))',
              boxShadow: 'var(--liquid-panel-shadow)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              isolation: 'isolate',
              transform: 'translateZ(0)',
              willChange: 'transform, filter'
            }}
          >
            {/* Multi-color gradient border - Disabled in high-performance */}
            {mode !== 'high-performance' && (
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
            )}

            {/* Ambient glow layer - Disabled in high-performance */}
            {mode !== 'high-performance' && (
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
            )}
            {/* Header */}
            <div
              className="drawer-header"
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid color-mix(in srgb, ${modeColor} 20%, transparent)`,
                background: `
                  linear-gradient(180deg,
                    rgba(11, 14, 23, 0.6) 0%,
                    rgba(11, 14, 23, 0.3) 100%
                  )
                `,
                backdropFilter: headerBackdrop,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexShrink: 0
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="mode-icon-container"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `
                      radial-gradient(circle at 30% 30%, color-mix(in srgb, ${modeColor} 30%, transparent), transparent 70%),
                      rgba(255, 255, 255, 0.1)
                    `,
                    border: `2px solid color-mix(in srgb, ${modeColor} 40%, transparent)`,
                    boxShadow: `0 0 20px color-mix(in srgb, ${modeColor} 25%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS[modeConfig.icon as keyof typeof ICONS] || ICONS.MessageSquare}
                    size={20}
                    style={{ color: modeColor }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {modeConfig.displayName}
                  </h3>
                  <p className="text-white/60 text-xs">
                    {currentMode === 'general' ? 'En ligne • Avec toi' : 'En ligne • Prêt à aider'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Scroll to Bottom Button */}
                <AnimatePresence>
                  {showScrollButton && (
                    <motion.button
                      className="scroll-to-bottom"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => scrollToBottom(true)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.12)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SpatialIcon
                        Icon={ICONS.ArrowDown}
                        size={16}
                        style={{
                          color: modeColor,
                          filter: `drop-shadow(0 0 8px color-mix(in srgb, ${modeColor} 40%, transparent))`
                        }}
                      />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Minimize Button - Continue in background when in realtime mode */}
                {(voiceState === 'listening' || voiceState === 'speaking' || voiceState === 'connecting') && (
                  <motion.button
                    className="minimize-button"
                    onClick={() => {
                      logger.info('GLOBAL_CHAT_DRAWER', 'Minimizing chat with active realtime session');
                      navClose();
                      Haptics.tap();
                      handleClose();
                    }}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.05, background: 'rgba(239, 68, 68, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    title="Continuer en arrière-plan"
                  >
                    <SpatialIcon
                      Icon={ICONS.Minimize2}
                      size={16}
                      className="text-red-400"
                    />
                  </motion.button>
                )}

                {/* Close Button */}
                <motion.button
                  className="header-button"
                  onClick={() => {
                    navClose();
                    Haptics.tap();
                    handleClose();
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.12)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SpatialIcon
                    Icon={ICONS.X}
                    size={18}
                    className="text-white/70"
                  />
                </motion.button>
              </div>
            </div>

            {/* Chat Interface - Scrollable Content + Fixed Input */}
            <div className="chat-interface-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
              {/* CoachChatInterface includes ChatInputBar with RED REALTIME button */}
              <CoachChatInterface
                stepColor={modeColor}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                className="flex-1"
                messagesContainerRef={messagesContainerRef}
                onScrollChange={setShowScrollButton}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalChatDrawer;
