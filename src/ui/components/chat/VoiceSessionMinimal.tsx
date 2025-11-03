/**
 * Voice Session Minimal
 * Interface ultra-légère pour les sessions Realtime vocales sur mobile
 * Pas d'animations lourdes, pas de messages affichés, juste l'essentiel
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { useUnifiedCoachStore } from '../../../system/store/unifiedCoachStore';
import { voiceCoachOrchestrator } from '../../../system/services/voice/voiceCoachOrchestrator';
import { useFeedback } from '../../../hooks/useFeedback';
import { Haptics } from '../../../utils/haptics';
import logger from '../../../lib/utils/logger';
import { Z_INDEX } from '../../../system/store/overlayStore';

interface VoiceSessionMinimalProps {
  onClose?: () => void;
}

const VoiceSessionMinimal: React.FC<VoiceSessionMinimalProps> = ({ onClose }) => {
  const voiceState = useUnifiedCoachStore(state => state.voiceState);
  const errorMessage = useUnifiedCoachStore(state => state.errorMessage);
  const currentMode = useUnifiedCoachStore(state => state.currentMode);
  const modeConfigs = useUnifiedCoachStore(state => state.modeConfigs);
  const exitVoiceOnlyMode = useUnifiedCoachStore(state => state.exitVoiceOnlyMode);

  const { click } = useFeedback();

  const modeConfig = modeConfigs[currentMode];
  const modeColor = modeConfig.color;

  const handleStop = async () => {
    try {
      click();
      Haptics.press();

      logger.info('VOICE_SESSION_MINIMAL', 'Stopping voice session');

      // Arrêter la session Realtime
      await voiceCoachOrchestrator.stopVoiceSession();

      // Sortir du mode voice-only et ouvrir le chat pour voir l'historique
      exitVoiceOnlyMode();

      if (onClose) {
        onClose();
      }
    } catch (error) {
      logger.error('VOICE_SESSION_MINIMAL', 'Error stopping session', { error });
    }
  };

  const handleMinimize = () => {
    click();
    Haptics.tap();

    logger.info('VOICE_SESSION_MINIMAL', 'Minimizing voice session');

    // Fermer le panneau mais rester en mode voice-only (session continue en arrière-plan)
    if (onClose) {
      onClose();
    }
  };

  // Déterminer l'état pour l'affichage
  const isConnecting = voiceState === 'connecting';
  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const isProcessing = voiceState === 'processing';
  const hasError = voiceState === 'error';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX.CHAT_DRAWER,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(11, 14, 23, 0.98)',
        padding: '24px'
      }}
    >
      {/* Header Minimal */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${modeColor}40, ${modeColor}20)`,
              border: `1px solid ${modeColor}60`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SpatialIcon
              Icon={ICONS[modeConfig.icon as keyof typeof ICONS] || ICONS.MessageSquare}
              size={16}
              style={{ color: modeColor }}
            />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              {modeConfig.displayName}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Session vocale
            </div>
          </div>
        </div>

        <button
          onClick={handleMinimize}
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
        >
          <SpatialIcon Icon={ICONS.Minimize2} size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
        </button>
      </div>

      {/* Central Mic Button - Large and Prominent */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.03, 1] : 1,
          }}
          transition={{
            duration: 1.2,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut'
          }}
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: isListening || isSpeaking
              ? `linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.4))`
              : 'rgba(11, 14, 23, 0.95)',
            border: isListening || isSpeaking
              ? '3px solid rgba(239, 68, 68, 0.6)'
              : '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isListening || isSpeaking
              ? '0 0 60px rgba(239, 68, 68, 0.4), 0 8px 32px rgba(0, 0, 0, 0.6)'
              : '0 4px 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AnimatePresence mode="wait">
            {isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SpatialIcon
                  Icon={ICONS.Radio}
                  size={72}
                  style={{
                    color: 'rgba(239, 68, 68, 0.95)',
                    filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))'
                  }}
                />
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SpatialIcon
                  Icon={ICONS.Mic}
                  size={72}
                  style={{
                    color: 'rgba(239, 68, 68, 0.95)',
                    filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))'
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SpatialIcon
                  Icon={ICONS.Loader}
                  size={72}
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulsating rings for listening state */}
          {isListening && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -12,
                  borderRadius: '50%',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -24,
                  borderRadius: '50%',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3
                }}
              />
            </>
          )}
        </motion.div>

        {/* State Text */}
        <div style={{ textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {isConnecting && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}
              >
                Connexion...
              </motion.div>
            )}
            {isListening && (
              <motion.div
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '18px', fontWeight: 600, color: '#EF4444' }}
              >
                Je t'écoute
              </motion.div>
            )}
            {isSpeaking && (
              <motion.div
                key="speaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '18px', fontWeight: 600, color: '#EF4444' }}
              >
                Coach parle...
              </motion.div>
            )}
            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Traitement...
              </motion.div>
            )}
            {hasError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '18px', fontWeight: 600, color: '#EF4444' }}
              >
                Erreur
              </motion.div>
            )}
          </AnimatePresence>

          {hasError && errorMessage && (
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Stop Button - Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <motion.button
          onClick={handleStop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '16px 32px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
            border: '2px solid rgba(239, 68, 68, 0.6)',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
        >
          <SpatialIcon
            Icon={ICONS.Square}
            size={20}
            style={{ color: '#fff' }}
          />
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
            Terminer la session
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VoiceSessionMinimal;
