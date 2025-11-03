/**
 * Realtime Status Bar Component
 * Shows connection status for realtime voice
 */

import React from 'react';
import { motion } from 'framer-motion';

export const RealtimeStatusBar: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        padding: '6px 16px',
        marginBottom: '8px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
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
          border: '2px solid #EF4444',
          borderTopColor: 'transparent',
          borderRadius: '50%'
        }}
      />
      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
        Connexion au coach vocal...
      </span>
    </motion.div>
  );
};
