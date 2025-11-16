/**
 * GamingCTAButton - Bouton CTA Gaming avec effets visuels
 * Composant réutilisable pour tous les boutons d'actions gaming
 */

import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import type { LucideIcon } from 'lucide-react';

interface GamingCTAButtonProps {
  // Core props
  label: string;
  description: string;
  icon: string;
  color: string;
  glowColor: string;

  // Action props
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  xp?: number;
  badge?: string;

  // Status props
  occurrences?: number;
  encouragementMessage?: string;

  // Style props
  variant?: 'priority' | 'weekly' | 'secondary';
  className?: string;

  // Animation props
  delay?: number;
}

export default function GamingCTAButton({
  label,
  description,
  icon,
  color,
  glowColor,
  onClick,
  xp = 0,
  badge,
  occurrences = 0,
  encouragementMessage,
  variant = 'priority',
  className = '',
  delay = 0,
}: GamingCTAButtonProps) {
  const { performanceMode } = usePerformanceMode();

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (performanceMode === 'low') return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'gaming-cta-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    onClick(e);
  };

  const variantClasses = {
    priority: 'gaming-cta-priority',
    weekly: 'gaming-cta-weekly-available',
    secondary: 'gaming-cta-secondary',
  };

  const cssVariables = {
    '--action-color': color,
    '--action-color-alpha-70': `${color}B3`,
    '--action-color-alpha-60': `${color}99`,
    '--action-color-alpha-50': `${color}80`,
    '--action-color-alpha-40': `${color}66`,
    '--action-color-alpha-30': `${color}4D`,
    '--action-color-alpha-25': `${color}40`,
    '--action-color-alpha-20': `${color}33`,
    '--action-color-alpha-15': `${color}26`,
    '--action-color-alpha-12': `${color}1F`,
    '--action-color-alpha-10': `${color}1A`,
    '--action-color-alpha-0': `${color}00`,
  } as React.CSSProperties;

  return (
    <motion.button
      onClick={handleClick}
      className={`gaming-cta-button ${variantClasses[variant]} w-full glass-card p-4 rounded-xl relative overflow-hidden group text-left ${className}`}
      style={{
        ...cssVariables,
        background: `
          linear-gradient(135deg, ${color}20 0%, ${color}${variant === 'secondary' ? '08' : '10'} 50%, rgba(0, 0, 0, ${variant === 'secondary' ? '0.25' : '0.3'}) 100%),
          radial-gradient(circle at 30% 30%, ${color}${variant === 'secondary' ? '12' : '15'} 0%, transparent 50%),
          rgba(255, 255, 255, 0.03)
        `,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: `1px solid ${color}${variant === 'secondary' ? '35' : '40'}`,
        boxShadow: `
          0 ${variant === 'secondary' ? '3px 12px' : '4px 16px'} ${color}${variant === 'secondary' ? '25' : '30'},
          0 ${variant === 'secondary' ? '1px 6px' : '2px 8px'} rgba(0, 0, 0, ${variant === 'secondary' ? '0.3' : '0.4'}),
          inset 0 1px 0 rgba(255, 255, 255, ${variant === 'secondary' ? '0.15' : '0.2'}),
          inset 0 -1px 0 rgba(0, 0, 0, ${variant === 'secondary' ? '0.2' : '0.3'})
        `
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Visual effect layers */}
      <div className="gaming-cta-shimmer" />
      {variant === 'priority' && <div className="gaming-cta-particles" />}
      <div className="gaming-cta-hover-glow" />

      {/* Sparks for priority actions */}
      {variant === 'priority' && performanceMode === 'premium' && (
        <>
          <div className="gaming-cta-spark" style={{ top: '20%', left: '10%' }} />
          <div className="gaming-cta-spark" style={{ top: '30%', right: '15%' }} />
          <div className="gaming-cta-spark" style={{ bottom: '25%', left: '20%' }} />
        </>
      )}

      {/* Content */}
      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div
            className={`gaming-cta-icon ${variant === 'secondary' ? 'w-10 h-10 rounded-lg' : 'w-12 h-12 rounded-xl'} flex items-center justify-center`}
            style={{
              background: `linear-gradient(135deg, ${color}${variant === 'secondary' ? '25' : '30'}, ${color}${variant === 'secondary' ? '15' : '20'})`,
              border: `1px solid ${color}${variant === 'secondary' ? '30' : '40'}`,
              boxShadow: variant !== 'secondary' ? `0 0 12px ${color}30` : undefined
            }}
          >
            <SpatialIcon
              name={icon as any}
              size={variant === 'secondary' ? 20 : 24}
              color={color}
              glowColor={glowColor}
              variant="pure"
            />
          </div>

          {/* Occurrence badge */}
          {occurrences > 0 && variant !== 'secondary' && (
            <motion.div
              className="gaming-cta-occurrence absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center border-2 border-white/20"
              style={{
                background: `linear-gradient(135deg, ${color}, ${glowColor})`
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-xs font-bold text-white">{occurrences}x</span>
            </motion.div>
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={`font-bold text-white ${variant === 'secondary' ? 'text-sm' : 'text-sm'}`}>
              {label}
            </h4>

            {/* Points badge */}
            {(xp > 0 || badge) && (
              <div
                className={`gaming-cta-badge flex-shrink-0 ${variant === 'secondary' ? 'px-1.5 py-0.5' : 'px-2 py-0.5'} rounded-full text-xs font-bold`}
                style={{
                  background: `${color}${variant === 'secondary' ? '15' : '20'}`,
                  color: color,
                  border: `1px solid ${color}${variant === 'secondary' ? '30' : '30'}`
                }}
              >
                {xp > 0 ? `+${xp} pts` : badge}
              </div>
            )}
          </div>

          <p className={`text-xs ${variant === 'secondary' ? 'text-white/60' : 'text-white/70'}`}>
            {description}
          </p>

          {/* Encouragement message */}
          {encouragementMessage && variant !== 'secondary' && (
            <motion.div
              className="mt-2 flex items-center gap-1.5"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SpatialIcon name="Sparkles" size={12} color={color} />
              <span className="text-xs font-semibold" style={{ color }}>
                {encouragementMessage}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
