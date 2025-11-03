import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useUserStore } from '../../../system/store/userStore';
import { useFeedback } from '../../../hooks/useFeedback';
import { useOverlayStore } from '../../../system/store/overlayStore';
import { Haptics } from '../../../utils/haptics';

/**
 * Header Actions Component - Pont de Commandement
 * Bouton d'ouverture du panneau utilisateur
 */

export const HeaderActions = () => {
  const { profile } = useUserStore();
  const { click } = useFeedback();
  const { toggle, isOpen } = useOverlayStore();
  const userPanelOpen = isOpen('userPanel');

  const handleProfileClick = () => {
    click();
    Haptics.tap();
    toggle('userPanel');
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Profile Button */}
      <motion.button
        onClick={handleProfileClick}
        className="relative user-panel-toggle"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          position: 'relative',
          overflow: profile?.avatarUrl ? 'hidden' : 'visible',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: userPanelOpen
            ? `
                radial-gradient(circle at 30% 30%, rgba(255, 107, 53, 0.35) 0%, transparent 60%),
                linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(253, 200, 48, 0.15))
              `
            : `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 50%),
                rgba(255, 255, 255, 0.10)
              `,
          border: userPanelOpen ? '1px solid rgba(247, 147, 30, 0.4)' : '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          boxShadow: userPanelOpen
            ? `
                0 8px 24px rgba(0, 0, 0, 0.25),
                0 2px 12px rgba(0, 0, 0, 0.18),
                inset 0 1px 0 rgba(255, 255, 255, 0.12),
                0 0 28px rgba(247, 147, 30, 0.4),
                0 0 40px rgba(253, 200, 48, 0.2)
              `
            : `
                0 8px 24px rgba(0, 0, 0, 0.25),
                0 2px 12px rgba(0, 0, 0, 0.18),
                inset 0 1px 0 rgba(255, 255, 255, 0.12)
              `,
          transition: 'transform 280ms cubic-bezier(0.25, 0.1, 0.25, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: 'translateZ(0)',
          willChange: 'transform, filter',
          cursor: 'pointer',
          WebkitMaskImage: profile?.avatarUrl ? '-webkit-radial-gradient(circle, white 100%, black 100%)' : undefined,
          maskImage: profile?.avatarUrl ? 'radial-gradient(circle, white 100%, black 100%)' : undefined
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ouvrir le panneau utilisateur"
        aria-expanded={userPanelOpen}
        aria-haspopup="menu"
      >
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName || 'Avatar utilisateur'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block',
              transform: 'translateZ(0)'
            }}
          />
        ) : (
          <SpatialIcon
            Icon={ICONS.User}
            size={20}
            style={{
              color: userPanelOpen ? '#FDC830' : 'rgba(255,255,255,0.9)',
              filter: userPanelOpen
                ? 'drop-shadow(0 0 12px rgba(253, 200, 48, 0.6))'
                : 'drop-shadow(0 0 8px rgba(247, 147, 30, 0.3))'
            }}
            aria-hidden="true"
          />
        )}
      </motion.button>
    </div>
  );
};
