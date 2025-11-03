/**
 * Voice to Text Overlay
 * Simple overlay showing large mic during voice-to-text recording
 * Mobile-optimized with minimal animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

interface VoiceToTextOverlayProps {
  isRecording: boolean;
  isTranscribing: boolean;
  onStop: () => void;
  stepColor: string;
}

const VoiceToTextOverlay: React.FC<VoiceToTextOverlayProps> = ({
  isRecording,
  isTranscribing,
  onStop,
  stepColor
}) => {
  if (!isRecording && !isTranscribing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(11, 14, 23, 0.98)',
        padding: '24px'
      }}
    >
      {/* Central Mic Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <motion.div
          animate={{
            scale: isRecording ? [1, 1.03, 1] : 1,
          }}
          transition={{
            duration: 1.2,
            repeat: isRecording ? Infinity : 0,
            ease: 'easeInOut'
          }}
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: isRecording
              ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(59, 130, 246, 0.4))'
              : 'rgba(11, 14, 23, 0.95)',
            border: isRecording
              ? `3px solid ${stepColor}80`
              : '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isRecording
              ? `0 0 60px ${stepColor}40, 0 8px 32px rgba(0, 0, 0, 0.6)`
              : '0 4px 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SpatialIcon
              Icon={isTranscribing ? ICONS.Loader : ICONS.Mic}
              size={72}
              style={{
                color: stepColor,
                filter: `drop-shadow(0 0 20px ${stepColor}80)`
              }}
              className={isTranscribing ? 'animate-spin' : ''}
            />
          </motion.div>

          {/* Pulsating rings for recording state */}
          {isRecording && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -12,
                  borderRadius: '50%',
                  border: `2px solid ${stepColor}40`,
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
                  border: `2px solid ${stepColor}30`,
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: isTranscribing ? 'rgba(255, 255, 255, 0.7)' : stepColor
            }}
          >
            {isTranscribing ? 'Transcription...' : 'Enregistrement en cours'}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '8px'
            }}
          >
            {isTranscribing ? 'Analyse de votre message' : 'Appuyez pour terminer'}
          </motion.div>
        </div>
      </div>

      {/* Stop Button - Only shown when recording, not when transcribing */}
      {isRecording && !isTranscribing && (
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <motion.button
            onClick={onStop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '16px 32px',
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${stepColor}E6, ${stepColor}CC)`,
              border: `2px solid ${stepColor}`,
              boxShadow: `0 4px 20px ${stepColor}30, 0 0 40px ${stepColor}20`,
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
              Terminer l'enregistrement
            </span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default VoiceToTextOverlay;
