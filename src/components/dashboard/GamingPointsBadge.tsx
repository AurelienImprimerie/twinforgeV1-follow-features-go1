import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import { getForgeColor, GAMING_COLORS } from './gamingColors';

interface GamingPointsBadgeProps {
  points: number;
  forgeName: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
  useUniversalColors?: boolean; // Utiliser les couleurs gaming universelles (orange/jaune)
}

/**
 * GamingPointsBadge - Badge réutilisable pour afficher les points
 * Utilisé dans tous les CTA et composants gaming
 */
const GamingPointsBadge: React.FC<GamingPointsBadgeProps> = ({
  points,
  forgeName,
  size = 'medium',
  showIcon = true,
  animated = true,
  className = '',
  useUniversalColors = false
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const forgeColor = useUniversalColors ? GAMING_COLORS.UNIVERSAL_GAMING : getForgeColor(forgeName);

  const MotionDiv = isPerformanceMode || !animated ? 'div' : motion.div;

  const sizeClasses = {
    small: 'px-2.5 py-1 text-xs gap-1.5',
    medium: 'px-4 py-2 text-sm gap-2',
    large: 'px-5 py-2.5 text-base gap-2.5'
  };

  const iconSizes = {
    small: 14,
    medium: 16,
    large: 18
  };

  return (
    <MotionDiv
      className={`inline-flex items-center rounded-full font-bold ${sizeClasses[size]} ${className}`}
      style={{
        background: forgeColor.badge.background,
        border: `1.5px solid ${forgeColor.badge.border}`,
        color: forgeColor.badge.text,
        backdropFilter: isPerformanceMode ? 'none' : 'blur(10px) saturate(130%)',
        boxShadow: isPerformanceMode
          ? 'none'
          : `0 0 20px ${forgeColor.glow}, 0 4px 12px rgba(0, 0, 0, 0.2)`
      }}
      {...(!isPerformanceMode && animated && {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        whileHover: { scale: 1.05 },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      })}
    >
      {showIcon && (
        <SpatialIcon
          Icon={ICONS.Trophy}
          size={iconSizes[size]}
          style={{
            color: useUniversalColors ? forgeColor.secondary : forgeColor.primary,
            filter: isPerformanceMode
              ? 'none'
              : `drop-shadow(0 0 6px ${forgeColor.glow})`
          }}
        />
      )}
      <span>+{points} pts</span>
    </MotionDiv>
  );
};

export default GamingPointsBadge;
