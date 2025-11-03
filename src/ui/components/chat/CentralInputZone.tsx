/**
 * Central Input Zone
 * Zone centrale dynamique qui s'adapte au mode d'interaction
 * Affiche soit le textarea (text), soit le grand micro (voice-to-text), soit l'interface realtime
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

type InputMode = 'text' | 'voice-to-text' | 'realtime';
type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'processing' | 'error';

interface CentralInputZoneProps {
  // Mode
  mode: InputMode;

  // Text mode props
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  disabled: boolean;

  // Voice-to-text mode props
  isRecording: boolean;
  isTranscribing: boolean;
  onStopRecording: () => void;
  transcribedText?: string; // Texte transcrit à afficher

  // Realtime mode props
  voiceState: VoiceState;
  onStopRealtime: () => void;

  // Styling
  stepColor: string;
}

const CentralInputZone: React.FC<CentralInputZoneProps> = ({
  mode,
  message,
  onMessageChange,
  onSubmit,
  onKeyDown,
  placeholder,
  isFocused,
  onFocus,
  onBlur,
  textareaRef,
  disabled,
  isRecording,
  isTranscribing,
  onStopRecording,
  transcribedText,
  voiceState,
  onStopRealtime,
  stepColor
}) => {
  // Mode TEXT: afficher le textarea classique
  if (mode === 'text') {
    return (
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="chat-textarea w-full resize-none bg-transparent border-none outline-none text-white placeholder-white/40 text-sm leading-relaxed py-1.5 px-1.5"
          style={{
            maxHeight: '90px',
            minHeight: '32px'
          }}
        />
      </div>
    );
  }

  // Mode VOICE-TO-TEXT: grand micro avec anneaux pulsants
  if (mode === 'voice-to-text') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px 16px',
          minHeight: '200px'
        }}
      >
        {/* Grand cercle micro */}
        <motion.div
          animate={{
            scale: isRecording ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 1.2,
            repeat: isRecording ? Infinity : 0,
            ease: 'easeInOut'
          }}
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: isRecording
              ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(59, 130, 246, 0.4))'
              : 'rgba(11, 14, 23, 0.95)',
            border: isRecording
              ? `3px solid ${stepColor}80`
              : '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isRecording
              ? `0 0 40px ${stepColor}40, 0 8px 24px rgba(0, 0, 0, 0.6)`
              : '0 4px 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <SpatialIcon
            Icon={isTranscribing ? ICONS.Loader : ICONS.Mic}
            size={48}
            style={{
              color: stepColor,
              filter: `drop-shadow(0 0 12px ${stepColor}80)`
            }}
            className={isTranscribing ? 'animate-spin' : ''}
          />

          {/* Anneaux pulsants pendant l'enregistrement */}
          {isRecording && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: `2px solid ${stepColor}40`,
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -16,
                  borderRadius: '50%',
                  border: `2px solid ${stepColor}30`,
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.25
                }}
              />
            </>
          )}
        </motion.div>

        {/* Texte d'état */}
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '300px' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: isTranscribing ? 'rgba(255, 255, 255, 0.7)' : stepColor
            }}
          >
            {isTranscribing ? 'Transcription...' : 'Enregistrement en cours'}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '6px'
            }}
          >
            {isTranscribing ? 'Analyse de votre message' : 'Appuyez pour terminer'}
          </div>

          {/* Afficher le texte transcrit */}
          {transcribedText && !isTranscribing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.5',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
                Transcription:
              </div>
              {transcribedText}
            </motion.div>
          )}
        </div>

        {/* Bouton Stop */}
        {isRecording && !isTranscribing && (
          <motion.button
            onClick={onStopRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px',
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${stepColor}E6, ${stepColor}CC)`,
              border: `2px solid ${stepColor}`,
              boxShadow: `0 4px 16px ${stepColor}30, 0 0 32px ${stepColor}20`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <SpatialIcon
              Icon={ICONS.Square}
              size={16}
              style={{ color: '#fff' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              Terminer
            </span>
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Mode REALTIME: grand micro/radio selon l'état
  if (mode === 'realtime') {
    const isConnecting = voiceState === 'connecting';
    const isListening = voiceState === 'listening';
    const isSpeaking = voiceState === 'speaking';
    const isProcessing = voiceState === 'processing';
    const hasError = voiceState === 'error';
    const isActive = isListening || isSpeaking;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px 16px',
          minHeight: '200px'
        }}
      >
        {/* Grand cercle micro/radio */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.02, 1] : 1,
          }}
          transition={{
            duration: 1.2,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut'
          }}
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: isActive
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.4))'
              : 'rgba(11, 14, 23, 0.95)',
            border: isActive
              ? '3px solid rgba(239, 68, 68, 0.6)'
              : '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isActive
              ? '0 0 40px rgba(239, 68, 68, 0.4), 0 8px 24px rgba(0, 0, 0, 0.6)'
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
                  size={48}
                  style={{
                    color: 'rgba(239, 68, 68, 0.95)',
                    filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))'
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
                  size={48}
                  style={{
                    color: 'rgba(239, 68, 68, 0.95)',
                    filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))'
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
                  size={48}
                  style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  className={isConnecting ? 'animate-spin' : ''}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Anneaux pulsants quand actif */}
          {isListening && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -16,
                  borderRadius: '50%',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.25
                }}
              />
            </>
          )}
        </motion.div>

        {/* Texte d'état */}
        <div style={{ textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {isConnecting && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}
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
                style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444' }}
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
                style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444' }}
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
                style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}
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
                style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444' }}
              >
                Erreur
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bouton Terminer la session */}
        <motion.button
          onClick={onStopRealtime}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
            border: '2px solid rgba(239, 68, 68, 0.6)',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3), 0 0 32px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <SpatialIcon
            Icon={ICONS.Square}
            size={16}
            style={{ color: '#fff' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            Terminer
          </span>
        </motion.button>
      </motion.div>
    );
  }

  return null;
};

export default CentralInputZone;
