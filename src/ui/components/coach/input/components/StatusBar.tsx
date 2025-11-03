/**
 * Status Bar Component
 * Displays processing/transcription status with spinner
 */

import React from 'react';
import { motion } from 'framer-motion';

interface StatusBarProps {
  message: string;
  stepColor: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ message, stepColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        padding: '6px 16px',
        marginBottom: '8px',
        borderRadius: '12px',
        background: `
          linear-gradient(180deg,
            rgba(11, 14, 23, 0.8) 0%,
            rgba(11, 14, 23, 0.6) 100%
          )
        `,
        backdropFilter: 'blur(16px)',
        border: `1px solid color-mix(in srgb, ${stepColor} 20%, transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: '12px',
          height: '12px',
          border: `2px solid ${stepColor}`,
          borderTopColor: 'transparent',
          borderRadius: '50%'
        }}
      />
      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
        {message}
      </span>
    </motion.div>
  );
};
