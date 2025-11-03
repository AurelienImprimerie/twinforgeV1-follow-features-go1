/**
 * Typing Indicator
 * Shows when coach is preparing a response
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

interface TypingIndicatorProps {
  stepColor: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ stepColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-end gap-2">
        {/* Avatar */}
        <div
          className="message-avatar w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 40%, transparent) 0%, transparent 70%),
              rgba(255, 255, 255, 0.1)
            `,
            border: `1.5px solid color-mix(in srgb, ${stepColor} 50%, transparent)`,
            boxShadow: `0 0 12px color-mix(in srgb, ${stepColor} 30%, transparent)`
          }}
        >
          <SpatialIcon
            Icon={ICONS.Zap}
            size={16}
            style={{
              color: stepColor,
              filter: `drop-shadow(0 0 8px color-mix(in srgb, ${stepColor} 60%, transparent))`
            }}
          />
        </div>

        {/* Typing Bubble */}
        <div
          className="typing-indicator px-5 py-3 rounded-2xl"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 15%, transparent) 0%, transparent 70%),
              rgba(255, 255, 255, 0.08)
            `,
            border: `1px solid color-mix(in srgb, ${stepColor} 25%, transparent)`,
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.2),
              0 0 16px color-mix(in srgb, ${stepColor} 15%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            backdropFilter: 'blur(12px) saturate(140%)',
            WebkitBackdropFilter: 'blur(12px) saturate(140%)',
            borderRadius: '4px 16px 16px 16px'
          }}
        >
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="typing-dot"
                style={{
                  background: `color-mix(in srgb, ${stepColor} 60%, white)`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
