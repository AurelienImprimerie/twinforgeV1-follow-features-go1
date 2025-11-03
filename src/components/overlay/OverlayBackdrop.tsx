/**
 * Overlay Backdrop Component
 * Backdrop universel pour tous les overlays
 * Optimisé pour les performances et les transitions fluides
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOverlayStore, Z_INDEX } from '../../system/store/overlayStore';
import logger from '../../lib/utils/logger';

interface OverlayBackdropProps {
  /** Callback appelé lors du clic sur le backdrop */
  onClick?: () => void;
  /** Intensité du blur (par défaut: 'sm' pour 4px) */
  blurIntensity?: 'none' | 'sm' | 'md' | 'lg';
  /** Opacité du backdrop (0-1, par défaut: 0.6) */
  opacity?: number;
  /** Désactiver le backdrop cliquable */
  disableClick?: boolean;
}

const OverlayBackdrop: React.FC<OverlayBackdropProps> = ({
  onClick,
  blurIntensity = 'sm',
  opacity = 0.6,
  disableClick = false,
}) => {
  const { activeOverlayId, close } = useOverlayStore();
  const isVisible = activeOverlayId !== 'none';

  const blurValues = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Ignorer si le backdrop n'est pas cliquable
    if (disableClick) return;

    // S'assurer que le clic est bien sur le backdrop et non sur un enfant
    if (e.target === e.currentTarget) {
      logger.debug('OVERLAY_BACKDROP', 'Backdrop clicked', {
        activeOverlay: activeOverlayId,
        timestamp: new Date().toISOString(),
      });

      if (onClick) {
        onClick();
      } else {
        close();
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          onClick={handleClick}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: `blur(${blurValues[blurIntensity]})`,
            WebkitBackdropFilter: `blur(${blurValues[blurIntensity]})`,
            zIndex: Z_INDEX.BACKDROP,
            cursor: disableClick ? 'default' : 'pointer',
            // Optimisations GPU
            transform: 'translateZ(0)',
            willChange: 'opacity',
          }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
};

export default OverlayBackdrop;
