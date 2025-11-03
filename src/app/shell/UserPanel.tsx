import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import { useUserStore } from '../../system/store/userStore';
import { useFeedback } from '../../hooks/useFeedback';
import { useOverlayStore, Z_INDEX } from '../../system/store/overlayStore';
import { pillClick, panelClose } from '../../audio/effects/forgeronSounds';
import LogoutConfirmationModal from '../../ui/components/LogoutConfirmationModal';
import { LogoutService } from '../../system/services/logoutService';

interface UserPanelProps {
  isOpen: boolean;
}

const UserPanel: React.FC<UserPanelProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const { click } = useFeedback();
  const { close: closeOverlay } = useOverlayStore();
  const reduceMotion = useReducedMotion();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleProfileClick = () => {
    pillClick('#18E3FF');
    closeOverlay();
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    pillClick('#7A5AF8');
    closeOverlay();
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    click();
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    closeOverlay();
    await LogoutService.softLogout();
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      pillClick('#18E3FF');
    } else {
      panelClose();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const toggleButtons = document.querySelectorAll('.user-panel-toggle');
      const panel = document.querySelector('.user-panel');

      let clickedOnToggle = false;
      toggleButtons.forEach(btn => {
        if (btn.contains(e.target as Node)) {
          clickedOnToggle = true;
        }
      });

      if (!clickedOnToggle && panel && !panel.contains(e.target as Node)) {
        closeOverlay();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOverlay]);

  const springy = reduceMotion
    ? { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as any }
    : { type: 'spring' as const, stiffness: 280, damping: 22, mass: 0.9 };

  const animationVariants = {
    initial: { opacity: 0, scale: 0.88, y: -32 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.90, y: -24 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="user-panel fixed right-6 top-[80px] w-[280px]"
          style={{
            zIndex: Z_INDEX.USER_PANEL,
            transformOrigin: 'top right'
          }}
          initial={animationVariants.initial}
          animate={animationVariants.animate}
          exit={animationVariants.exit}
          transition={springy}
          role="dialog"
          aria-label="Panneau utilisateur"
          aria-modal="true"
        >
          <div
            className="rounded-3xl overflow-hidden relative liquid-glass-premium"
            style={{
              padding: 16,
              isolation: 'isolate',
              background: `
                radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 80%, rgba(24, 227, 255, 0.10) 0%, transparent 60%),
                rgba(17, 24, 39, 0.85)
              `,
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1.5px solid rgba(255, 255, 255, 0.18)',
              boxShadow: `
                0 12px 40px rgba(0, 0, 0, 0.35),
                0 4px 20px rgba(0, 0, 0, 0.25),
                0 0 32px rgba(24, 227, 255, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
          >
            <div className="flex flex-col gap-3">
              {profile && (
                <div className="flex items-center gap-3 mb-2 px-2 py-2">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName || 'Avatar'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(24, 227, 255, 0.3), rgba(24, 227, 255, 0.15))',
                        border: '1px solid rgba(24, 227, 255, 0.4)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.User} size={24} style={{ color: '#18E3FF' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">
                      {profile.displayName || 'Forgeron'}
                    </div>
                    {profile.email && (
                      <div className="text-white/60 text-xs truncate">
                        {profile.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <motion.button
                onClick={handleProfileClick}
                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 w-full text-left"
                style={{
                  background: 'var(--glass-opacity-base)',
                  border: '1px solid rgba(24, 227, 255, 0.24)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.18)'
                }}
                whileHover={reduceMotion ? {} : { scale: 1.02, y: -1 }}
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(24, 227, 255, 0.3), rgba(24, 227, 255, 0.18))',
                    border: '1px solid rgba(24, 227, 255, 0.4)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.User} size={16} style={{ color: '#18E3FF' }} />
                </div>
                <span className="text-white text-sm font-medium">Mon Profil</span>
              </motion.button>

              <motion.button
                onClick={handleSettingsClick}
                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 w-full text-left"
                style={{
                  background: 'var(--glass-opacity-base)',
                  border: '1px solid rgba(122, 90, 248, 0.24)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.18)'
                }}
                whileHover={reduceMotion ? {} : { scale: 1.02, y: -1 }}
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(122, 90, 248, 0.3), rgba(122, 90, 248, 0.18))',
                    border: '1px solid rgba(122, 90, 248, 0.4)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.Settings} size={16} style={{ color: '#7A5AF8' }} />
                </div>
                <span className="text-white text-sm font-medium">Paramètres</span>
              </motion.button>

              <div className="h-px bg-white/10 my-1" />

              <motion.button
                onClick={handleLogoutClick}
                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 w-full text-left"
                style={{
                  background: 'var(--glass-opacity-base)',
                  border: '1px solid rgba(239, 68, 68, 0.24)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.18)'
                }}
                whileHover={reduceMotion ? {} : { scale: 1.02, y: -1 }}
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.18))',
                    border: '1px solid rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.LogOut} size={16} style={{ color: '#EF4444' }} />
                </div>
                <span className="text-white text-sm font-medium">Déconnexion</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </AnimatePresence>
  );
};

export default UserPanel;
