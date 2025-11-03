import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import type { FastingProgressionMetrics, FastingProgressionAnalysis } from '../../hooks/useFastingProgressionData';

interface FastingProgressionSummaryCardProps {
  metrics: FastingProgressionMetrics;
  periodDays: number;
  aiAnalysis?: FastingProgressionAnalysis;
  aiModel?: string;
  tokensUsed?: number;
  cached?: boolean;
  className?: string;
}

/**
 * Get performance theme based on consistency score
 */
function getPerformanceTheme(consistencyScore: number) {
  if (consistencyScore >= 80) {
    return {
      color: '#22C55E',
      icon: 'Check' as const,
      badge: 'Excellent',
      description: 'Performance exceptionnelle'
    };
  } else if (consistencyScore >= 60) {
    return {
      color: '#F59E0B',
      icon: 'TrendingUp' as const,
      badge: 'Bien',
      description: 'Bonne progression'
    };
  } else if (consistencyScore >= 40) {
    return {
      color: '#06B6D4',
      icon: 'Target' as const,
      badge: 'Modéré',
      description: 'En développement'
    };
  } else {
    return {
      color: '#10B981',
      icon: 'Timer' as const,
      badge: 'Débutant',
      description: 'Commencez votre forge'
    };
  }
}

/**
 * Fasting Progression Summary Card - Résumé des Métriques de Progression
 * Affiche les métriques clés de progression du jeûne
 */
const FastingProgressionSummaryCard: React.FC<FastingProgressionSummaryCardProps> = ({
  metrics,
  periodDays,
  aiAnalysis,
  aiModel,
  tokensUsed,
  cached,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion component
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const theme = getPerformanceTheme(metrics.consistencyScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.color} 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${theme.color} 10%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${theme.color} 30%, transparent)`,
          boxShadow: `
            0 16px 48px rgba(0, 0, 0, 0.3),
            0 0 40px color-mix(in srgb, ${theme.color} 25%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.2)
          `,
          backdropFilter: 'blur(24px) saturate(170%)'
        }}
      >
        <div className="space-y-6">
          {/* Header avec Score de Consistance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center breathing-icon"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${theme.color} 40%, transparent), color-mix(in srgb, ${theme.color} 30%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${theme.color} 60%, transparent)`,
                  boxShadow: `0 0 25px color-mix(in srgb, ${theme.color} 50%, transparent)`
                }}
              >
                <SpatialIcon
                  Icon={ICONS[theme.icon]}
                  size={20}
                  style={{ color: theme.color }}
                  variant="pure"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Progression Temporelle</h3>
                <p className="text-white/80 text-sm mt-0.5">
                  {periodDays} derniers jours • {theme.description}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ 
                    background: theme.color,
                    boxShadow: `0 0 8px ${theme.color}60`
                  }} 
                />
                <span className="text-white font-bold text-2xl">
                  {metrics.consistencyScore}
                </span>
              </div>
              <div 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `color-mix(in srgb, ${theme.color} 15%, transparent)`,
                  color: theme.color
                }}
              >
                {theme.badge}
              </div>
            </div>
          </div>

          {/* Métriques Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Sessions */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #3B82F6 10%, transparent)',
                border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {metrics.totalSessions}
              </div>
              <div className="text-blue-300 text-sm font-medium">Sessions</div>
              <div className="text-white/50 text-xs mt-1">Total</div>
            </motion.div>

            {/* Total Fasted Hours */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {metrics.totalFastedHours}h
              </div>
              <div className="text-orange-300 text-sm font-medium">Temps Total</div>
              <div className="text-white/50 text-xs mt-1">Jeûné</div>
            </motion.div>

            {/* Average Duration */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #10B981 10%, transparent)',
                border: '1px solid color-mix(in srgb, #10B981 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-2xl font-bold text-green-400 mb-1">
                {metrics.averageDuration}h
              </div>
              <div className="text-green-300 text-sm font-medium">Moyenne</div>
              <div className="text-white/50 text-xs mt-1">Durée</div>
            </motion.div>

            {/* Longest Fast */}
            <motion.div
              className="text-center p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #EF4444 10%, transparent)',
                border: '1px solid color-mix(in srgb, #EF4444 20%, transparent)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-2xl font-bold text-red-400 mb-1">
                {metrics.longestFast}h
              </div>
              <div className="text-red-300 text-sm font-medium">Record</div>
              <div className="text-white/50 text-xs mt-1">Personnel</div>
            </motion.div>
          </div>

          {/* Streaks et Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Streak */}
            <motion.div
              className="p-4 rounded-xl"
              style={{
                background: `color-mix(in srgb, ${theme.color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${theme.color} 20%, transparent)`
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `color-mix(in srgb, ${theme.color} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${theme.color} 25%, transparent)`
                  }}
                >
                  <SpatialIcon Icon={ICONS.Zap} size={16} style={{ color: theme.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {metrics.currentStreak}
                  </div>
                  <div className="text-white/70 text-sm">Série Actuelle</div>
                  <div className="text-white/50 text-xs">Jours consécutifs</div>
                </div>
              </div>
            </motion.div>

            {/* Best Streak */}
            <motion.div
              className="p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #10B981 10%, transparent)',
                border: '1px solid color-mix(in srgb, #10B981 20%, transparent)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'color-mix(in srgb, #10B981 15%, transparent)',
                    border: '1px solid color-mix(in srgb, #10B981 25%, transparent)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.Star} size={16} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {metrics.bestStreak}
                  </div>
                  <div className="text-white/70 text-sm">Meilleure Série</div>
                  <div className="text-white/50 text-xs">Record personnel</div>
                </div>
              </div>
            </motion.div>

            {/* Success Rate */}
            <motion.div
              className="p-4 rounded-xl"
              style={{
                background: 'color-mix(in srgb, #22C55E 10%, transparent)',
                border: '1px solid color-mix(in srgb, #22C55E 20%, transparent)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'color-mix(in srgb, #22C55E 15%, transparent)',
                    border: '1px solid color-mix(in srgb, #22C55E 25%, transparent)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.Target} size={16} style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {metrics.successRate}%
                  </div>
                  <div className="text-white/70 text-sm">Taux de Succès</div>
                  <div className="text-white/50 text-xs">Objectifs atteints</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Motivational Message */}
          <motion.div 
            className="p-5 rounded-xl text-center"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.color} 12%, transparent) 0%, transparent 60%),
                color-mix(in srgb, ${theme.color} 6%, transparent)
              `,
              border: `2px solid color-mix(in srgb, ${theme.color} 25%, transparent)`,
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.2),
                0 0 20px color-mix(in srgb, ${theme.color} 20%, transparent),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <SpatialIcon Icon={ICONS.Lightbulb} size={18} style={{ color: theme.color }} />
              <h4 className="font-bold text-lg" style={{ color: theme.color }}>
                {aiAnalysis ? 'Analyse IA de Performance' : 'Analyse de Performance'}
              </h4>
            </div>
            
            <p className="text-white/90 text-base leading-relaxed mb-4">
              {aiAnalysis ? 
                aiAnalysis.motivationalMessage :
                metrics.consistencyScore >= 80 ? 
                  `Excellente maîtrise ! Vous avez forgé une discipline temporelle remarquable avec ${metrics.totalSessions} sessions et ${metrics.totalFastedHours}h de jeûne total.` :
                metrics.consistencyScore >= 60 ?
                  `Bonne progression ! Votre régularité s'améliore avec ${metrics.currentStreak} jours de série actuelle. Continuez sur cette lancée.` :
                metrics.consistencyScore >= 40 ?
                  `Développement en cours. Votre record personnel est de ${metrics.longestFast}h. Visez la régularité pour optimiser les bénéfices.` :
                  `Début de votre forge temporelle ! Chaque session compte. Votre meilleure série est de ${metrics.bestStreak} jours.`
              }
            </p>

            {/* Next Goal Suggestion */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: `color-mix(in srgb, ${theme.color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${theme.color} 20%, transparent)`
              }}
            >
              <SpatialIcon Icon={ICONS.Target} size={14} style={{ color: theme.color }} />
              <span className="text-sm font-medium" style={{ color: theme.color }}>
                {aiAnalysis ? 
                  aiAnalysis.nextMilestone :
                  metrics.currentStreak === 0 ? 'Objectif : Commencer une série' :
                  metrics.currentStreak < 7 ? `Objectif : Atteindre 7 jours (${7 - metrics.currentStreak} restants)` :
                  metrics.bestStreak < 14 ? 'Objectif : Série de 14 jours' :
                  'Objectif : Maintenir l\'excellence'}
              </span>
            </div>
          </motion.div>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              {/* Narrative Summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <SpatialIcon Icon={ICONS.FileText} size={14} className="text-cyan-400" />
                  Résumé Narratif IA
                </h5>
                <p className="text-white/85 text-sm leading-relaxed">
                  {aiAnalysis.narrativeSummary}
                </p>
              </div>

              {/* Trend Analysis */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <SpatialIcon Icon={ICONS.TrendingUp} size={14} className="text-green-400" />
                  Analyse de Tendances
                </h5>
                <p className="text-white/85 text-sm leading-relaxed">
                  {aiAnalysis.trendAnalysis}
                </p>
              </div>

              {/* Strategic Recommendations */}
              {aiAnalysis.strategicRecommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <SpatialIcon Icon={ICONS.Target} size={14} className="text-green-400" />
                    Recommandations Stratégiques IA
                  </h5>
                  <div className="space-y-2">
                    {aiAnalysis.strategicRecommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                        <span className="text-white/85 text-sm leading-relaxed">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="text-white/80 font-medium text-sm flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Clock} size={14} className="text-cyan-400" />
                Métriques Temporelles
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-white/70 text-sm">Temps total jeûné</span>
                  <span className="text-white font-medium">{metrics.totalFastedHours}h</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-white/70 text-sm">Durée moyenne</span>
                  <span className="text-white font-medium">{metrics.averageDuration}h</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-white/70 text-sm">Record personnel</span>
                  <span className="text-white font-medium">{metrics.longestFast}h</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-white/80 font-medium text-sm flex items-center gap-2">
                <SpatialIcon Icon={ICONS.TrendingUp} size={14} className="text-green-400" />
                Performance
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-white/70 text-sm">Taux de succès</span>
                  <span className="text-white font-medium">{metrics.successRate}%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-white/70 text-sm">Série actuelle</span>
                  <span className="text-white font-medium">{metrics.currentStreak} jours</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-white/70 text-sm">Meilleure série</span>
                  <span className="text-white font-medium">{metrics.bestStreak} jours</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Metadata */}
          {(aiModel || tokensUsed || cached !== undefined) && (
            <div className="flex items-center justify-center gap-4 text-xs text-white/50 pt-2 border-t border-white/10">
              {aiModel && (
                <div className="flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.Zap} size={10} />
                  <span>{aiModel}</span>
                </div>
              )}
              {tokensUsed && (
                <div className="flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.Activity} size={10} />
                  <span>{tokensUsed} tokens</span>
                </div>
              )}
              {cached && (
                <div className="flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.Shield} size={10} />
                  <span>Résultat mis en cache</span>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default FastingProgressionSummaryCard;