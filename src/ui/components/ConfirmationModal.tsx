/**
 * ConfirmationModal Component
 * Modern confirmation dialog to replace native browser confirm
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import GlassCard from '../cards/GlassCard';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: '#EF4444',
          icon: ICONS.AlertTriangle,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          bgGradient: 'radial-gradient(circle at 30% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 60%)'
        };
      case 'warning':
        return {
          iconColor: '#F59E0B',
          icon: ICONS.AlertCircle,
          borderColor: 'rgba(245, 158, 11, 0.3)',
          bgGradient: 'radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 60%)'
        };
      case 'info':
        return {
          iconColor: '#3B82F6',
          icon: ICONS.Info,
          borderColor: 'rgba(59, 130, 246, 0.3)',
          bgGradient: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)'
        };
    }
  };

  const styles = getVariantStyles();

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200000]"
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[200001] flex items-center justify-center p-4 pointer-events-none"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <GlassCard
              className="w-full max-w-md pointer-events-auto"
              style={{
                background: `${styles.bgGradient}, var(--glass-opacity)`,
                borderColor: styles.borderColor
              }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${styles.iconColor} 30%, transparent) 0%, transparent 60%), rgba(255, 255, 255, 0.1)`,
                      border: `2px solid color-mix(in srgb, ${styles.iconColor} 40%, transparent)`,
                      boxShadow: `0 4px 16px color-mix(in srgb, ${styles.iconColor} 20%, transparent)`
                    }}
                  >
                    <SpatialIcon
                      Icon={styles.icon}
                      size={24}
                      style={{
                        color: styles.iconColor,
                        filter: `drop-shadow(0 0 8px color-mix(in srgb, ${styles.iconColor} 60%, transparent))`
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-2.5 px-4 rounded-lg text-white text-sm font-medium transition-all shadow-lg"
                    style={{
                      background: variant === 'danger'
                        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                        : variant === 'warning'
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: `0 4px 12px color-mix(in srgb, ${styles.iconColor} 30%, transparent)`
                    }}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render to document.body using portal to avoid z-index stacking context issues
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default ConfirmationModal;
