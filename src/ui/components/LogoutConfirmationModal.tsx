import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { Z_INDEX } from '../../system/store/overlayStore';
import logger from '../../lib/utils/logger';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    logger.info('LOGOUT_MODAL', 'User confirmed logout');

    try {
      await onConfirm();
    } catch (error) {
      logger.error('LOGOUT_MODAL', 'Error during logout', { error });
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    if (!isLoggingOut) {
      logger.info('LOGOUT_MODAL', 'User cancelled logout');
      onCancel();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: Z_INDEX.MODAL }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCancel}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              zIndex: Z_INDEX.MODAL + 1,
              pointerEvents: 'none'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 80%, rgba(255, 107, 53, 0.15) 0%, transparent 60%),
                  rgba(17, 24, 39, 0.95)
                `,
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                boxShadow: `
                  0 20px 60px rgba(0, 0, 0, 0.5),
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `,
                pointerEvents: 'auto'
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.25), rgba(247, 147, 30, 0.15))',
                      border: '1.5px solid rgba(255, 107, 53, 0.4)',
                      boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <SpatialIcon
                      Icon={ICONS.LogOut}
                      size={24}
                      style={{
                        color: '#FF6B35',
                        filter: 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.5))'
                      }}
                    />
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Se déconnecter ?
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Vous allez être déconnecté de votre compte. Vos données seront conservées en toute sécurité.
                    </p>
                  </div>
                </div>

                {isLoggingOut && (
                  <motion.div
                    className="mb-5 p-4 rounded-2xl"
                    style={{
                      background: 'rgba(255, 107, 53, 0.1)',
                      border: '1px solid rgba(255, 107, 53, 0.2)'
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-5 h-5">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-orange-400/30"
                          style={{ borderTopColor: '#FF6B35' }}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear'
                          }}
                        />
                      </div>
                      <span className="text-sm text-white/90 font-medium">
                        Déconnexion en cours...
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={isLoggingOut}
                    className="flex-1 px-5 py-3 rounded-xl font-medium text-sm text-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Annuler
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={isLoggingOut}
                    className="flex-1 px-5 py-3 rounded-xl font-medium text-sm text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(247, 147, 30, 0.9))',
                      border: '1.5px solid rgba(255, 107, 53, 0.5)',
                      boxShadow: `
                        0 4px 16px rgba(255, 107, 53, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `
                    }}
                  >
                    {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;

  if (!modalRoot) {
    return null;
  }

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default LogoutConfirmationModal;
