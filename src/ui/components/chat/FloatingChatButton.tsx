/**
 * Floating Chat Button - Unified Version
 * Bouton flottant pour ouvrir/fermer le chat unifié (texte + Realtime)
 * Utilise unifiedCoachStore pour gérer l'état du chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { useUnifiedCoachStore } from '../../../system/store/unifiedCoachStore';
import { Z_INDEX } from '../../../system/store/overlayStore';
import { useFeedback } from '../../../hooks/useFeedback';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';
import { Haptics } from '../../../utils/haptics';
import ContextualTooltip from '../ContextualTooltip';
import { unifiedNotificationService } from '../../../system/services/notifications/unifiedNotificationService';
import { textChatSessionProvider } from '../../../system/services/chat/TextChatSessionProvider';
import logger from '../../../lib/utils/logger';
import '../../../styles/components/buttons/floating-chat-button.css';
import '../../../styles/components/buttons/floating-chat-button-step2.css';

interface FloatingChatButtonProps {
  className?: string;
}

const FloatingChatButton = React.forwardRef<HTMLButtonElement, FloatingChatButtonProps>(({ className = '' }, ref) => {
  const location = useLocation();

  // Utiliser unifiedCoachStore au lieu de globalChatStore
  const {
    isPanelOpen: isOpen,
    togglePanel: toggle,
    currentMode,
    modeConfigs,
    hasUnreadMessages,
    unreadCount,
    isInStep2,
    voiceState,
    isVoiceOnlyMode,
    exitVoiceOnlyMode
  } = useUnifiedCoachStore();

  const { click } = useFeedback();
  const { mode: performanceMode } = usePerformanceMode();
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1025 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1025);
  const internalButtonRef = useRef<HTMLButtonElement>(null);
  const buttonRef = (ref as React.RefObject<HTMLButtonElement>) || internalButtonRef;

  const isHighPerformance = performanceMode === 'high-performance';

  const isStep2Active = isInStep2 || location.pathname.includes('/pipeline/step-2');
  const isStep3Active = location.pathname.includes('/pipeline/step-3');

  // Check for Step3 training session notification
  const step3Context = textChatSessionProvider.getContext();
  const hasStep3Notification = isStep3Active && step3Context?.hasUnreadNotification;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1025);
      setIsTablet(width >= 768 && width < 1025);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) return;

    if (location.pathname.includes('/pipeline/step-2')) {
      unifiedNotificationService.scheduleNotification('step2-adjust');
    } else if (location.pathname.includes('/training')) {
      unifiedNotificationService.scheduleNotification('training-intro');
    } else if (location.pathname.includes('/meals') || location.pathname.includes('/fridge')) {
      unifiedNotificationService.scheduleNotification('nutrition-intro');
    } else if (location.pathname.includes('/fasting')) {
      unifiedNotificationService.scheduleNotification('fasting-intro');
    } else {
      unifiedNotificationService.scheduleNotification('step1-welcome');
    }

    return () => {
      unifiedNotificationService.cancelScheduled();
    };
  }, [location.pathname, isOpen, currentMode]);

  const modeConfig = modeConfigs[currentMode];
  const modeColor = modeConfig.color;
  const isVoiceActive = voiceState === 'listening' || voiceState === 'speaking';

  const handleClick = () => {
    click();
    Haptics.press();

    // Si en mode voice-only, sortir du mode et ouvrir le chat avec l'historique
    if (isVoiceOnlyMode) {
      logger.info('FLOATING_CHAT_BUTTON', 'Exiting voice-only mode to view conversation');
      exitVoiceOnlyMode();
    } else {
      // Le toggle du chat gère automatiquement les autres overlays via overlayStore
      toggle();
    }
  };

  const buttonElement = (
    <motion.button
      ref={(node) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
        if (internalButtonRef) {
          internalButtonRef.current = node;
        }
      }}
      onClick={handleClick}
      className={`floating-chat-button ${isStep2Active ? 'floating-chat-button--step2' : ''} ${className}`}
      style={{
        position: 'fixed',
        // Tablette: positionner à 16px du bord droit même quand ouvert pour rester visible
        right: isOpen
          ? (isTablet ? '16px' : (isDesktop ? '24px' : '-100px'))
          : (isTablet ? '16px' : (isDesktop ? '24px' : '8px')),
        bottom: (isDesktop || isTablet) ? '24px' : 'calc(var(--new-bottom-bar-height) + var(--new-bottom-bar-bottom-offset) + 8px)',
        zIndex: Z_INDEX.FLOATING_CHAT_BUTTON,
        borderRadius: '50%',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        isolation: 'isolate',
        width: isDesktop ? '60px' : '56px',
        height: isDesktop ? '60px' : '56px',
        background: isHighPerformance
          ? (isVoiceActive && !isOpen
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.4))'
              : (hasUnreadMessages
                  ? `linear-gradient(135deg, color-mix(in srgb, ${modeColor} 15%, rgba(11, 14, 23, 0.95)), rgba(11, 14, 23, 0.95))`
                  : 'rgba(11, 14, 23, 0.95)'))
          : (hasUnreadMessages
              ? `
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, ${modeColor} 30%, transparent) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  var(--liquid-pill-bg)
                `
              : `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.20) 0%, transparent 50%),
                  var(--liquid-pill-bg)
                `),
        border: hasUnreadMessages
          ? `1.5px solid color-mix(in srgb, ${modeColor} 40%, transparent)`
          : '1.5px solid rgba(255,255,255,0.22)',
        backdropFilter: 'blur(var(--liquid-pill-blur)) saturate(var(--liquid-pill-saturate))',
        WebkitBackdropFilter: 'blur(var(--liquid-pill-blur)) saturate(var(--liquid-pill-saturate))',
        boxShadow: isHighPerformance
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : (hasUnreadMessages
              ? `
                  var(--liquid-pill-shadow),
                  0 0 40px color-mix(in srgb, ${modeColor} 30%, transparent),
                  0 0 60px color-mix(in srgb, ${modeColor} 15%, transparent)
                `
              : `
                  var(--liquid-pill-shadow),
                  0 0 32px color-mix(in srgb, ${modeColor} 15%, transparent)
                `),
        cursor: 'pointer',
        transition: 'right 400ms cubic-bezier(0.25, 0.1, 0.25, 1), transform var(--liquid-transition-medium), background var(--liquid-transition-fast), box-shadow var(--liquid-transition-fast), border-color var(--liquid-transition-fast)',
        willChange: 'right, transform, filter',
        transform: 'translateZ(0)'
      }}
      initial={false}
      whileHover={{
        scale: 1.08,
        boxShadow: `
          var(--liquid-pill-shadow),
          0 0 48px color-mix(in srgb, ${modeColor} 25%, transparent),
          0 4px 20px rgba(0, 0, 0, 0.3)
        `,
        transition: {
          duration: 0.25,
          ease: [0.16, 1, 0.3, 1]
        }
      }}
      whileTap={{
        scale: 0.92,
        transition: { duration: 0.15 }
      }}
      aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      aria-expanded={isOpen}
    >
      {/* Corner highlight effect matching bottom bar pills - Disabled in high-performance */}
      {!isHighPerformance && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '50%',
            bottom: '50%',
            borderRadius: 'inherit',
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)',
            opacity: 0.6,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Icon - Dynamic based on voice state */}
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="button-icon"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence mode="wait">
          {(isVoiceActive || isVoiceOnlyMode) && !isOpen ? (
            <motion.div
              key="voice-active-icon"
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <SpatialIcon
                Icon={ICONS.Radio}
                size={isDesktop ? 28 : 24}
                style={{
                  color: 'rgba(239, 68, 68, 0.95)',
                  filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.8))'
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="default-icon"
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              <SpatialIcon
                Icon={ICONS.MessageSquare}
                size={isDesktop ? 28 : 24}
                style={{
                  color: modeColor,
                  filter: isStep2Active
                    ? `drop-shadow(0 0 16px rgba(59, 130, 246, 0.8))`
                    : `drop-shadow(0 0 14px color-mix(in srgb, ${modeColor} 60%, transparent))`
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Badge for unread messages - Only shown when NO contextual notification is active */}
      <AnimatePresence>
        {!isOpen && hasUnreadMessages && unreadCount > 0 && !isStep2Active && !hasStep3Notification && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="floating-chat-badge"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '20px',
              height: '20px',
              padding: '0 6px',
              borderRadius: '10px',
              background: `
                radial-gradient(circle at 30% 30%, ${modeColor} 0%, color-mix(in srgb, ${modeColor} 80%, #000) 100%)
              `,
              border: '2px solid rgba(11, 14, 23, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: `
                0 0 16px color-mix(in srgb, ${modeColor} 60%, transparent),
                0 2px 8px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2 Alert Badge - Higher priority, shown separately */}
      <AnimatePresence>
        {!isOpen && isStep2Active && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="floating-chat-button--step2-notification"
            title="Ton coach t'attend pour ajuster ta séance !"
          >
            !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3 Training Notification Badge - Important events during session */}
      <AnimatePresence>
        {!isOpen && hasStep3Notification && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="floating-chat-button--step2-notification"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 1) 0%, rgba(220, 38, 38, 1) 100%)`,
              animation: 'pulse 2s ease-in-out infinite'
            }}
            title="Événement important pendant ta séance !"
          >
            !
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  if (isStep2Active && !isOpen) {
    return (
      <>
        <ContextualTooltip
          content="Ton coach t'attend pour ajuster ta séance ! Clique pour ouvrir le chat."
          title="Ajuste ton programme"
          placement="left"
          delay={500}
          maxWidth={280}
        >
          {buttonElement}
        </ContextualTooltip>
      </>
    );
  }

  return buttonElement;
});

FloatingChatButton.displayName = 'FloatingChatButton';

export default FloatingChatButton;
