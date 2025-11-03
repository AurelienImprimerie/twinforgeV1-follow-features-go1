import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '../icons/registry';
import SpatialIcon from '../icons/SpatialIcon';

interface GenericDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'full' | 'large' | 'medium';
  children: React.ReactNode;
}

const GenericDrawer: React.FC<GenericDrawerProps> = ({
  isOpen,
  onClose,
  title,
  size = 'large',
  children
}) => {
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = '';
        document.body.style.height = '';
      };
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const sizeClasses = {
    full: 'w-full h-full sm:h-auto sm:max-h-[90vh]',
    large: 'w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh]',
    medium: 'w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[85vh]'
  };

  // Vérifier que nous sommes côté client
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="generic-drawer-overlay fixed inset-0 z-[10000] flex items-center justify-center p-0 sm:p-4" style={{ pointerEvents: 'auto' }}>
          {/* Backdrop */}
          <motion.div
            className="generic-drawer-backdrop absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className={`generic-drawer-content relative ${sizeClasses[size]} flex flex-col overflow-hidden rounded-2xl`}
            style={{
              background: 'linear-gradient(180deg, rgba(20, 20, 30, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%)',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
              mass: 0.8
            }}
          >
            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex-shrink-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                }}
              >
                <h2 className="text-white text-base sm:text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
                >
                  <SpatialIcon Icon={ICONS.X} size={20} className="text-white/70" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="generic-drawer-scrollable flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6" style={{ maxHeight: '100%' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GenericDrawer;
