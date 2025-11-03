/**
 * Section Modified Badge
 * Subtle indicator for sections with unsaved modifications
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';

interface SectionModifiedBadgeProps {
  visible: boolean;
  className?: string;
}

const SectionModifiedBadge: React.FC<SectionModifiedBadgeProps> = ({
  visible,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${className}`}
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
          }}
        >
          {/* Pulsing dot */}
          <motion.div
            className="relative w-2 h-2 rounded-full"
            style={{ background: '#F59E0B' }}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(245, 158, 11, 0.7)',
                '0 0 0 6px rgba(245, 158, 11, 0)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />

          <span className="text-xs font-medium text-orange-300">
            Modifié
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SectionModifiedBadge;
