import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { useTodayFastingSessions, type TodayFastingStats } from '@/app/pages/Fasting/hooks/useTodayFastingSessions';

interface FastingDailySummaryCardProps {
  className?: string;
}

/**
 * Get consistency theme colors and content
 */
function getConsistencyTheme(consistency: TodayFastingStats['consistency']) {
  switch (consistency) {
    case 'excellent':
      return {
        color: '#22C55E',
        icon: 'Check' as const,
        badge: 'Excellent',
        description: 'Discipline temporelle parfaite'
      };
    case 'good':
      return {
        color: '#F59E0B',
        icon: 'Target' as const,
        badge: 'Bien',
        description: 'Bonne progression'
      };
    case 'needs_improvement':
      return {
        color: '#F59E0B',
        icon: 'TrendingUp' as const,
        badge: 'À améliorer',
        description: 'Continuez vos efforts'
      };
  }
}

/**
 * Fasting Daily Summary Card - Résumé Quotidien du Jeûne
 * Affiche un résumé des sessions de jeûne complétées aujourd'hui
 */
const FastingDailySummaryCard: React.FC<FastingDailySummaryCardProps> = ({ className = '' }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const { data, isLoading, error } = useTodayFastingSessions();
  
  if (isLoading) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-48" />
              <div className="h-3 bg-white/10 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-white/10 rounded-xl" />
            <div className="h-20 bg-white/10 rounded-xl" />
            <div className="h-20 bg-white/10 rounded-xl" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className={`p-6 ${className}`} style={{
        background: 'color-mix(in srgb, #EF4444 8%, transparent)',
        borderColor: 'color-mix(in srgb, #EF4444 20%, transparent)'
      }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.AlertCircle} size={16} className="text-red-400" />
          </div>
          <div>
            <h4 className="text-red-300 font-semibold">Erreur de Chargement</h4>
            <p className="text-red-200 text-sm">Impossible de charger les données du jour</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  const { stats } = data;
  const theme = getConsistencyTheme(stats.consistency);
  const today = format(new Date(), 'dd MMMM yyyy');

  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
      })}
      className={className}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.color} 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${theme.color} 25%, transparent)`,
          boxShadow: isPerformanceMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, ${theme.color} 15%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
        }}
      >
        <div className="space-y-6">
          {/* Header avec Consistance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${theme.color} 35%, transparent), color-mix(in srgb, ${theme.color} 25%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${theme.color} 50%, transparent)`,
                  boxShadow: isPerformanceMode ? 'none' : `0 0 20px color-mix(in srgb, ${theme.color} 30%, transparent)`
                }}
              >
                <SpatialIcon Icon={ICONS[theme.icon]} size={20} style={{ color: theme.color }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Dernière Session Forgée</h3>
                <p className="text-white/80 text-sm mt-0.5">
                  {today} • {theme.description}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div 
                className="px-3 py-1.5 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${theme.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${theme.color} 25%, transparent)`
                }}
              >
                <span className="text-sm font-medium" style={{ color: theme.color }}>
                  {theme.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Métriques Quotidiennes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Fasted Hours */}
            <div className="text-center p-4 rounded-xl" style={{
              background: `color-mix(in srgb, #F59E0B 12%, transparent)`,
              border: `1px solid color-mix(in srgb, #F59E0B 25%, transparent)`
            }}>
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {stats.totalFastedHours.toFixed(1)}h
              </div>
              <div className="text-orange-300 text-sm font-medium">Temps Total</div>
              <div className="text-white/50 text-xs mt-1">Jeûné</div>
            </div>

            {/* Sessions Count */}
            <div className="text-center p-4 rounded-xl" style={{
              background: `color-mix(in srgb, #10B981 12%, transparent)`,
              border: `1px solid color-mix(in srgb, #10B981 25%, transparent)`
            }}>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.sessionsCount}
              </div>
              <div className="text-green-300 text-sm font-medium">Sessions</div>
              <div className="text-white/50 text-xs mt-1">Complétées</div>
            </div>

            {/* Average Duration */}
            <div className="text-center p-4 rounded-xl" style={{
              background: `color-mix(in srgb, #8B5CF6 12%, transparent)`,
              border: `1px solid color-mix(in srgb, #8B5CF6 25%, transparent)`
            }}>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {stats.averageDuration > 0 ? `${stats.averageDuration.toFixed(1)}h` : '--'}
              </div>
              <div className="text-purple-300 text-sm font-medium">Moyenne</div>
              <div className="text-white/50 text-xs mt-1">Durée</div>
            </div>

            {/* Longest Session */}
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.longestSession > 0 ? `${stats.longestSession.toFixed(1)}h` : '--'}
              </div>
              <div className="text-white/70 text-sm font-medium">Record</div>
              <div className="text-white/50 text-xs mt-1">Aujourd'hui</div>
            </div>
          </div>

          {/* Message Motivationnel */}
          <div 
            className="p-4 rounded-xl"
            style={{
              background: `color-mix(in srgb, ${theme.color} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${theme.color} 20%, transparent)`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.Lightbulb} size={14} style={{ color: theme.color }} />
              <span className="text-sm font-semibold" style={{ color: theme.color }}>
                Motivation du Jour
              </span>
            </div>
            <p className="text-white/85 text-sm leading-relaxed">
              {stats.motivationalMessage}
            </p>
          </div>

        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingDailySummaryCard;