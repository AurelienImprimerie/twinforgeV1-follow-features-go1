import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import '../../styles/components/ui-elements/loader-animations.css';

export type LoaderVariant = 'inventory' | 'recipes' | 'plan' | 'shopping' | 'training' | 'default';

interface LoaderCardProps {
  variant?: LoaderVariant;
  title?: string;
  subtitle?: string;
  progress?: number;
  showProgressBar?: boolean;
  showSteps?: boolean;
  onCancel?: () => void;
  showCancelButton?: boolean;
  elapsedTime?: number;
  customColor?: string;
}

const VARIANT_CONFIG = {
  inventory: {
    colors: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      glow: 'rgba(6, 182, 212, 0.4)'
    },
    icon: 'Package',
    defaultTitle: 'Analyse de votre inventaire',
    defaultSubtitle: 'Traitement des données en cours...'
  },
  recipes: {
    colors: {
      primary: '#EC4899',
      secondary: '#F472B6',
      glow: 'rgba(236, 72, 153, 0.4)'
    },
    icon: 'ChefHat',
    defaultTitle: 'Création de recettes',
    defaultSubtitle: 'La Forge Spatiale travaille...'
  },
  plan: {
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      glow: 'rgba(139, 92, 246, 0.4)'
    },
    icon: 'Calendar',
    defaultTitle: 'Génération du plan hebdomadaire',
    defaultSubtitle: 'Optimisation nutritionnelle en cours...'
  },
  shopping: {
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    icon: 'ShoppingCart',
    defaultTitle: 'Génération de la liste de courses',
    defaultSubtitle: 'Organisation des achats...'
  },
  training: {
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    icon: 'Activity',
    defaultTitle: 'Ton Coach Prépare Ton Plan...',
    defaultSubtitle: 'Analyse de tes capacités et génération d\'un programme personnalisé'
  },
  default: {
    colors: {
      primary: '#60A5FA',
      secondary: '#93C5FD',
      glow: 'rgba(96, 165, 250, 0.4)'
    },
    icon: 'Sparkles',
    defaultTitle: 'Chargement',
    defaultSubtitle: 'Traitement en cours...'
  }
} as const;

const LoaderCard: React.FC<LoaderCardProps> = ({
  variant = 'default',
  title,
  subtitle,
  progress,
  showProgressBar = true,
  showSteps = false,
  onCancel,
  showCancelButton = false,
  elapsedTime = 0,
  customColor
}) => {
  const config = VARIANT_CONFIG[variant];
  const IconComponent = ICONS[config.icon as keyof typeof ICONS];
  const primaryColor = customColor || config.colors.primary;
  const secondaryColor = customColor ? `color-mix(in srgb, ${customColor} 80%, white)` : config.colors.secondary;
  const glowColor = customColor ? `color-mix(in srgb, ${customColor} 40%, transparent)` : config.colors.glow;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Validate and sanitize progress value to prevent NaN display
  const safeProgress = (() => {
    if (progress === undefined || progress === null) return 0;
    const numProgress = Number(progress);
    if (isNaN(numProgress)) return 0;
    return Math.max(0, Math.min(100, numProgress));
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="loader-optimized"
    >
      <GlassCard
        className="p-8 text-center relative loader-isolate"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${primaryColor} 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${secondaryColor} 10%, transparent) 0%, transparent 60%),
            rgba(255, 255, 255, 0.06)
          `,
          borderColor: `color-mix(in srgb, ${primaryColor} 30%, transparent)`,
          backdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: `
            0 12px 48px rgba(0, 0, 0, 0.3),
            0 0 40px color-mix(in srgb, ${primaryColor} 20%, transparent),
            0 0 80px color-mix(in srgb, ${primaryColor} 10%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.2),
            inset 0 -2px 0 rgba(0, 0, 0, 0.1)
          `,
          borderRadius: '1.5rem',
          overflow: 'hidden'
        }}
      >
        {/* Floating particles - enhanced */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="loader-particle"
            style={{
              color: i % 3 === 0 ? secondaryColor : primaryColor,
              top: `${15 + Math.random() * 70}%`,
              left: `${5 + i * 8}%`,
              '--tx': `${(Math.random() - 0.5) * 120}px`,
              '--ty': `${-60 - Math.random() * 120}px`,
              '--duration': `${3.5 + Math.random() * 2.5}s`,
              '--delay': `${i * 0.25}s`,
              width: i % 4 === 0 ? '6px' : '4px',
              height: i % 4 === 0 ? '6px' : '4px'
            } as React.CSSProperties}
          />
        ))}

        <div className="space-y-6 relative z-10">
          <div className="flex justify-center">
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center loader-breathing-border"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%),
                  radial-gradient(circle at 70% 70%, color-mix(in srgb, ${secondaryColor} 15%, transparent) 0%, transparent 70%),
                  linear-gradient(135deg, color-mix(in srgb, ${primaryColor} 45%, transparent), color-mix(in srgb, ${primaryColor} 30%, transparent))
                `,
                border: `3px solid color-mix(in srgb, ${primaryColor} 70%, transparent)`,
                color: primaryColor,
                boxShadow: `
                  0 0 50px ${glowColor},
                  0 0 25px ${glowColor},
                  0 0 80px color-mix(in srgb, ${primaryColor} 20%, transparent),
                  inset 0 0 25px color-mix(in srgb, ${primaryColor} 18%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.3)
                `
              }}
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 180, 360],
                boxShadow: [
                  `0 0 50px ${glowColor}, 0 0 25px ${glowColor}, 0 0 80px color-mix(in srgb, ${primaryColor} 20%, transparent), inset 0 0 25px color-mix(in srgb, ${primaryColor} 18%, transparent), inset 0 2px 0 rgba(255, 255, 255, 0.3)`,
                  `0 0 70px ${glowColor}, 0 0 35px ${glowColor}, 0 0 100px color-mix(in srgb, ${primaryColor} 30%, transparent), inset 0 0 35px color-mix(in srgb, ${primaryColor} 28%, transparent), inset 0 2px 0 rgba(255, 255, 255, 0.4)`,
                  `0 0 50px ${glowColor}, 0 0 25px ${glowColor}, 0 0 80px color-mix(in srgb, ${primaryColor} 20%, transparent), inset 0 0 25px color-mix(in srgb, ${primaryColor} 18%, transparent), inset 0 2px 0 rgba(255, 255, 255, 0.3)`
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <SpatialIcon
                Icon={IconComponent}
                size={64}
                className="text-white loader-icon-pulse"
                motionAnimate={{ scale: [1, 1.1, 1] }}
                motionTransition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
                style={{
                  filter: `drop-shadow(0 0 16px ${glowColor}) drop-shadow(0 0 8px white)`
                }}
              />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.h3
              className="text-2xl font-bold text-white"
              style={{
                textShadow: `0 0 24px ${glowColor}, 0 0 48px color-mix(in srgb, ${primaryColor} 35%, transparent), 0 2px 4px rgba(0, 0, 0, 0.3)`
              }}
              animate={{
                opacity: [0.95, 1, 0.95]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {title || config.defaultTitle}
            </motion.h3>
            <motion.p
              className="text-white/85 text-lg"
              style={{
                textShadow: `0 0 12px color-mix(in srgb, ${secondaryColor} 35%, transparent), 0 1px 2px rgba(0, 0, 0, 0.2)`
              }}
              animate={{
                opacity: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            >
              {subtitle || config.defaultSubtitle}
            </motion.p>
          </div>

          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-3 h-3 bg-white/80 rounded-full loader-dot"
                style={{
                  '--delay': `${index * 0.2}s`
                } as React.CSSProperties}
              />
            ))}
          </div>

          {showProgressBar && (
            <div className="space-y-3">
              <div className="text-center">
                <span
                  className="text-4xl font-bold text-white"
                  style={{
                    textShadow: `0 0 20px ${glowColor}`
                  }}
                >
                  {Math.round(safeProgress)}%
                </span>
              </div>

              <div className="w-full max-w-xs mx-auto h-2 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                    width: `${safeProgress}%`,
                    boxShadow: `0 0 12px ${glowColor}`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${safeProgress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {safeProgress < 95 && (
                    <div className="loader-progress-shimmer" />
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* Elapsed time indicator */}
          {elapsedTime > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/60 text-sm"
            >
              Temps écoulé: {formatTime(elapsedTime)}
            </motion.div>
          )}

          {/* Cancel button */}
          {showCancelButton && onCancel && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={onCancel}
              className="mt-4 px-6 py-2.5 rounded-xl text-white/80 text-sm font-medium transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              whileHover={{
                background: 'rgba(255, 255, 255, 0.12)',
                scale: 1.02,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 justify-center">
                <SpatialIcon Icon={ICONS.X} size={16} />
                <span>Annuler</span>
              </div>
            </motion.button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default LoaderCard;
