/**
 * Send Button Component
 * Button to send text message
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../icons/SpatialIcon';
import { ICONS } from '../../../../icons/registry';

interface SendButtonProps {
  hasMessage: boolean;
  disabled: boolean;
  isProcessing: boolean;
  stepColor: string;
  onClick: () => void;
}

export const SendButton: React.FC<SendButtonProps> = ({
  hasMessage,
  disabled,
  isProcessing,
  stepColor,
  onClick
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={!hasMessage || disabled || isProcessing}
      className={`chat-input-button flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${hasMessage && !disabled ? 'chat-input-button--send-enabled' : ''}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      style={{
        background: hasMessage
          ? `
              radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 35%, transparent) 0%, transparent 70%),
              linear-gradient(135deg, color-mix(in srgb, ${stepColor} 30%, transparent), color-mix(in srgb, ${stepColor} 18%, transparent))
            `
          : 'rgba(255, 255, 255, 0.05)',
        border: hasMessage
          ? `1.5px solid color-mix(in srgb, ${stepColor} 50%, transparent)`
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: hasMessage
          ? `0 0 16px color-mix(in srgb, ${stepColor} 25%, transparent), 0 4px 12px rgba(0, 0, 0, 0.2)`
          : 'none',
        cursor: hasMessage && !disabled ? 'pointer' : 'not-allowed',
        opacity: hasMessage && !disabled ? 1 : 0.5
      }}
      whileHover={hasMessage && !disabled ? { scale: 1.05 } : undefined}
      whileTap={hasMessage && !disabled ? { scale: 0.95 } : undefined}
    >
      <SpatialIcon
        Icon={ICONS.Send}
        size={18}
        style={{
          color: hasMessage ? stepColor : 'rgba(255, 255, 255, 0.4)',
          filter: hasMessage ? `drop-shadow(0 0 8px color-mix(in srgb, ${stepColor} 40%, transparent))` : 'none'
        }}
      />
    </motion.button>
  );
};
