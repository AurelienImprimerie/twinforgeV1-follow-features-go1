import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import type { FastingInsightsSummary } from '../../hooks/useFastingInsightsGenerator';

interface FastingInsightsSummaryCardProps {
  summary: FastingInsightsSummary;
  periodDays: number;
  aiModel?: string;
  tokensUsed?: number;
  cached?: boolean;
  className?: string;
}

/**
 * Get sentiment theme colors and content
 */
function getSentimentTheme(sentiment: FastingInsightsSummary['sentiment'], score: number) {
  switch (sentiment) {
    case 'positive':
      return {
        color: '#22C55E',
        icon: 'Check' as const,
        badge: 'Excellent',
        description: 'Performance exceptionnelle'
      };
    case 'encouraging':
      return {
        color: '#F59E0B',
        icon: 'TrendingUp' as const,
        badge: 'En progression',
        description: 'Vous êtes sur la bonne voie'
      };
    case 'neutral':
    default:
      return {
        color: '#06B6D4',
        icon: 'Target' as const,
        badge: 'Stable',
        description: 'Continuez vos efforts'
      };
  }
}

/**
 * Fasting Insights Summary Card - Résumé des Insights IA
 * Affiche un résumé narratif des découvertes de l'IA sur les patterns de jeûne
 */
const FastingInsightsSummaryCard: React.FC<FastingInsightsSummaryCardProps> = ({
  summary,
  periodDays,
  aiModel,
  tokensUsed,
  cached,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const theme = getSentimentTheme(summary.sentiment, summary.overallScore);

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
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.color} 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${theme.color} 10%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${theme.color} 30%, transparent)`,
          boxShadow: isPerformanceMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : `
              0 16px 48px rgba(0, 0, 0, 0.3),
              0 0 40px color-mix(in srgb, ${theme.color} 25%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.2)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(24px) saturate(170%)'
        }}
      >
        <div className="space-y-6">
          {/* Header avec Score Global */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${isPerformanceMode ? '' : 'breathing-icon'}`}
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${theme.color} 40%, transparent), color-mix(in srgb, ${theme.color} 30%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${theme.color} 60%, transparent)`,
                  boxShadow: isPerformanceMode ? 'none' : `0 0 25px color-mix(in srgb, ${theme.color} 50%, transparent)`
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
                <h3 className="text-xl font-bold text-white">Analyse de la Forge Temporelle</h3>
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
                  {summary.overallScore}
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

          {/* Découvertes Clés */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Search} size={16} style={{ color: theme.color }} />
              Découvertes Clés
            </h4>
            <div className="space-y-2">
              {summary.keyFindings.map((finding, index) => (
                <MotionDiv
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    background: `color-mix(in srgb, ${theme.color} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${theme.color} 20%, transparent)`
                  }}
                  {...(!isPerformanceMode && {
                    initial: { opacity: 0, x: -10 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.4, delay: 0.2 + index * 0.1 }
                  })}
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ background: theme.color }}
                  />
                  <span className="text-white/85 text-sm leading-relaxed">{finding}</span>
                </MotionDiv>
              ))}
            </div>
          </div>

          {/* Recommandation Principale */}
          <MotionDiv
            className="p-5 rounded-xl"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.color} 12%, transparent) 0%, transparent 60%),
                color-mix(in srgb, ${theme.color} 6%, transparent)
              `,
              border: `2px solid color-mix(in srgb, ${theme.color} 25%, transparent)`,
              boxShadow: isPerformanceMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : `
                  0 8px 32px rgba(0, 0, 0, 0.2),
                  0 0 20px color-mix(in srgb, ${theme.color} 20%, transparent),
                  inset 0 1px 0 rgba(255, 255, 255, 0.15)
                `
            }}
            {...(!isPerformanceMode && {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.6, delay: 0.5 }
            })}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: `color-mix(in srgb, ${theme.color} 20%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${theme.color} 30%, transparent)`
                }}
              >
                <SpatialIcon Icon={ICONS.Lightbulb} size={14} style={{ color: theme.color }} />
              </div>
              <div>
                <h5 className="font-semibold mb-2" style={{ color: theme.color }}>
                  Recommandation Principale
                </h5>
                <p className="text-white/90 text-sm leading-relaxed">
                  {summary.mainRecommendation}
                </p>
              </div>
            </div>
          </MotionDiv>

          {/* Métadonnées de l'Analyse */}
          <div className="flex items-center justify-center gap-4 text-xs text-white/50 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1">
              <SpatialIcon Icon={ICONS.Calendar} size={10} />
              <span>Période : {periodDays} jours</span>
            </div>
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
                <span>Mis en cache</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <SpatialIcon Icon={ICONS.Clock} size={10} />
              <span>Mis à jour maintenant</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingInsightsSummaryCard;