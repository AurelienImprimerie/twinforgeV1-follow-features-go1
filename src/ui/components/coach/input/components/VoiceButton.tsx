/**
 * Voice Button Component
 * Toggle button for voice-to-text recording
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../../../icons/SpatialIcon';
import { ICONS } from '../../../../icons/registry';

interface VoiceButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isRecording,
  isProcessing,
  disabled,
  onClick
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`chat-input-button flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isRecording ? 'chat-input-button--recording' : ''}`}
      style={{
        background: isRecording
          ? `
              radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.3) 0%, transparent 70%),
              rgba(239, 68, 68, 0.15)
            `
          : `
              radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.18) 0%, transparent 50%),
              var(--liquid-pill-bg)
            `,
        border: isRecording ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: isRecording
          ? '0 0 20px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)'
          : 'var(--liquid-pill-shadow)'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || isProcessing}
    >
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
          >
            <SpatialIcon
              Icon={ICONS.MicOff}
              size={18}
              style={{ color: '#EF4444' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
          >
            <SpatialIcon
              Icon={ICONS.Mic}
              size={18}
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {isRecording && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: '2px solid rgba(239, 68, 68, 0.6)',
              pointerEvents: 'none'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 0, 0.8]
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
              inset: -8,
              borderRadius: '50%',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              pointerEvents: 'none'
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3
            }}
          />
        </>
      )}
    </motion.button>
  );
};
