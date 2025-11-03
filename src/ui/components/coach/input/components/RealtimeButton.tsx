/**
 * Realtime Button Component
 * Toggle button for realtime voice conversation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../../../icons/SpatialIcon';
import { ICONS } from '../../../../icons/registry';

interface RealtimeButtonProps {
  isRealtimeActive: boolean;
  realtimeState: 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
  disabled: boolean;
  onClick: () => void;
}

export const RealtimeButton: React.FC<RealtimeButtonProps> = ({
  isRealtimeActive,
  realtimeState,
  disabled,
  onClick
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="chat-input-button flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center relative"
      style={{
        background: isRealtimeActive
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 1) 0%, rgba(220, 38, 38, 1) 100%)'
          : `
              radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.3) 0%, transparent 70%),
              linear-gradient(135deg, rgba(239, 68, 68, 0.7), rgba(220, 38, 38, 0.8))
            `,
        border: isRealtimeActive ? '3px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(239, 68, 68, 0.6)',
        boxShadow: isRealtimeActive
          ? `
              0 0 40px rgba(239, 68, 68, 0.8),
              0 8px 24px rgba(0, 0, 0, 0.6),
              inset 0 2px 0 rgba(255, 255, 255, 0.4)
            `
          : `
              0 0 20px rgba(239, 68, 68, 0.4),
              0 4px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
      }}
      whileHover={{
        scale: 1.08,
        boxShadow: isRealtimeActive
          ? `
              0 0 50px rgba(239, 68, 68, 0.9),
              0 10px 28px rgba(0, 0, 0, 0.7),
              inset 0 2px 0 rgba(255, 255, 255, 0.5)
            `
          : `
              0 0 35px rgba(239, 68, 68, 0.7),
              0 8px 20px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.4)
            `
      }}
      whileTap={{ scale: 0.92 }}
      disabled={disabled}
    >
      <AnimatePresence mode="wait">
        {isRealtimeActive ? (
          <motion.div
            key="stop-icon"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SpatialIcon
              Icon={ICONS.Square}
              size={18}
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
                zIndex: 2,
                position: 'relative'
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="radio-icon"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SpatialIcon
              Icon={ICONS.Radio}
              size={18}
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))',
                zIndex: 2,
                position: 'relative'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isRealtimeActive && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.3)',
            filter: 'blur(8px)',
            zIndex: -1
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {realtimeState === 'connecting' && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#EF4444',
            borderRightColor: '#EF4444',
            pointerEvents: 'none'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </motion.button>
  );
};
