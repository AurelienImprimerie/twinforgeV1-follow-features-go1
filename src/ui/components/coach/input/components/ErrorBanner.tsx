/**
 * Error Banner Component
 * Displays error messages with animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../icons/SpatialIcon';
import { ICONS } from '../../../../icons/registry';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        padding: '8px 16px',
        marginBottom: '8px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, rgba(220, 38, 38, 0.2) 0%, rgba(153, 27, 27, 0.15) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SpatialIcon Icon={ICONS.AlertTriangle} size={14} style={{ color: '#EF4444' }} />
        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
          {message}
        </span>
      </div>
    </motion.div>
  );
};
