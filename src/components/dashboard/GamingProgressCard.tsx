import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';
import { useGamificationProgress } from '../../hooks/coeur/useGamification';
import { useUserStore } from '../../system/store/userStore';
import GlassCard from '../../ui/cards/GlassCard';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import { getStreakColor, GAMING_COLORS } from './gamingColors';

interface GamingProgressCardProps {
  className?: string;
}

/**
 * GamingProgressCard - Carte de progression gaming réutilisable
 * Affiche: niveau actuel, progression XP, streak, lien vers dashboard
 */
const GamingProgressCard: React.FC<GamingProgressCardProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { isPerformanceMode } = usePerformanceMode();
  const { session } = useUserStore();
  const userId = session?.user?.id;

  const { data: gamingProgress, isLoading } = useGamificationProgress(userId);

  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  if (isLoading || !gamingProgress) {
    return (
      <GlassCard className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-6 bg-white/20 rounded"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
        </div>
      </GlassCard>
    );
  }

  const { currentLevel, currentXp, totalXpEarned, xpToNextLevel, currentStreakDays } = gamingProgress;
  const xpProgress = (currentXp / (currentXp + xpToNextLevel)) * 100;
  const streakColor = getStreakColor(currentStreakDays);

  return (
    <GlassCard
      className={`p-5 cursor-pointer transition-all duration-300 ${className}`}
      onClick={() => navigate('/home?tab=coeur')}
      interactive
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, ${GAMING_COLORS.GENERIC.primary} 15%, transparent) 0%, transparent 60%),
          linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08)),
          rgba(11, 14, 23, 0.85)
        `,
        borderColor: `color-mix(in srgb, ${GAMING_COLORS.GENERIC.primary} 35%, transparent)`,
        boxShadow: isPerformanceMode
          ? '0 8px 24px rgba(0, 0, 0, 0.2)'
          : `
            0 0 30px color-mix(in srgb, ${GAMING_COLORS.GENERIC.primary} 25%, transparent),
            0 8px 24px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `
      }}
    >
      <MotionDiv
        className="space-y-4"
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4 }
        })}
      >
        {/* Header: Niveau et Titre */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `color-mix(in srgb, ${GAMING_COLORS.GENERIC.primary} 25%, transparent)`,
                border: `2px solid color-mix(in srgb, ${GAMING_COLORS.GENERIC.primary} 40%, transparent)`,
                boxShadow: isPerformanceMode
                  ? 'none'
                  : `0 0 20px color-mix(in srgb, ${GAMING_COLORS.GENERIC.primary} 30%, transparent)`
              }}
            >
              <SpatialIcon
                Icon={ICONS.Trophy}
                size={20}
                style={{
                  color: GAMING_COLORS.GENERIC.primary,
                  filter: isPerformanceMode
                    ? 'none'
                    : `drop-shadow(0 0 8px ${GAMING_COLORS.GENERIC.glow})`
                }}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90">Niveau {currentLevel}</h3>
              <p className="text-xs text-white/60">{totalXpEarned.toLocaleString()} pts totaux</p>
            </div>
          </div>

          {/* Streak Badge */}
          {currentStreakDays > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: `color-mix(in srgb, ${streakColor} 20%, transparent)`,
                border: `1.5px solid color-mix(in srgb, ${streakColor} 35%, transparent)`
              }}
            >
              <SpatialIcon Icon={ICONS.Flame} size={14} style={{ color: streakColor }} />
              <span className="text-xs font-bold" style={{ color: streakColor }}>
                {currentStreakDays}j
              </span>
            </div>
          )}
        </div>

        {/* Barre de Progression */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Progression</span>
            <span className="font-semibold text-white/90">
              {currentXp} / {currentXp + xpToNextLevel} pts
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <MotionDiv
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg,
                  ${GAMING_COLORS.GENERIC.primary} 0%,
                  ${GAMING_COLORS.GENERIC.secondary} 100%
                )`,
                boxShadow: isPerformanceMode
                  ? 'none'
                  : `0 0 12px ${GAMING_COLORS.GENERIC.glow}`
              }}
              {...(!isPerformanceMode && {
                initial: { width: 0 },
                animate: { width: `${xpProgress}%` },
                transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
              })}
            />
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-white/60">Voir détails</span>
          <SpatialIcon
            Icon={ICONS.ChevronRight}
            size={16}
            className="text-white/60"
          />
        </div>
      </MotionDiv>
    </GlassCard>
  );
};

export default GamingProgressCard;
