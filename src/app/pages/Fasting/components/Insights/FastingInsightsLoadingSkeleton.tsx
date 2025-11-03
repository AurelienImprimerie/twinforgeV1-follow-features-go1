import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

interface FastingInsightsLoadingSkeletonProps {
  className?: string;
}

/**
 * Fasting Insights Loading Skeleton - Squelette de Chargement des Insights
 * Animation de chargement engageante pendant la génération des insights IA
 */
const FastingInsightsLoadingSkeleton: React.FC<FastingInsightsLoadingSkeletonProps> = ({
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Processing Header */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6 }
        })}
      >
        <GlassCard
          className="p-6 text-center"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 15%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #A855F7 12%, transparent) 0%, transparent 50%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
            boxShadow: isPerformanceMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : `
                0 16px 48px rgba(0, 0, 0, 0.3),
                0 0 40px color-mix(in srgb, #8B5CF6 25%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.2)
              `,
            backdropFilter: isPerformanceMode ? 'none' : 'blur(24px) saturate(170%)'
          }}
        >
          <div className="space-y-4">
            <MotionDiv
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #8B5CF6 40%, transparent), color-mix(in srgb, #A855F7 30%, transparent))
                `,
                border: '3px solid color-mix(in srgb, #8B5CF6 60%, transparent)',
                boxShadow: isPerformanceMode
                  ? 'none'
                  : '0 0 40px color-mix(in srgb, #8B5CF6 60%, transparent)'
              }}
              {...(!isPerformanceMode && {
                animate: {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 40px color-mix(in srgb, #8B5CF6 60%, transparent)',
                    '0 0 60px color-mix(in srgb, #8B5CF6 80%, transparent)',
                    '0 0 40px color-mix(in srgb, #8B5CF6 60%, transparent)'
                  ]
                },
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              })}
            >
              <SpatialIcon 
                Icon={ICONS.Lightbulb} 
                size={40} 
                style={{ color: '#8B5CF6' }}
                className={isPerformanceMode ? '' : 'animate-pulse'}
              />
            </MotionDiv>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Génération IA en Cours
              </h3>
              <p className="text-white/80 text-lg">
                GPT-5 mini analyse vos patterns de jeûne...
              </p>
            </div>
            
            {/* Processing Steps */}
            <div className="space-y-2 max-w-md mx-auto">
              {[
                'Récupération des sessions de jeûne',
                'Analyse des patterns avec GPT-5 mini',
                'Génération d\'insights personnalisés',
                'Mise en cache pour optimisation'
              ].map((step, index) => (
                <MotionDiv
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                  {...(!isPerformanceMode && {
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.4, delay: index * 0.2 }
                  })}
                >
                  <MotionDiv
                    className="w-2 h-2 rounded-full bg-purple-400"
                    {...(!isPerformanceMode && {
                      animate: {
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6]
                      },
                      transition: { duration: 1.5, repeat: Infinity, delay: index * 0.3 }
                    })}
                  />
                  <span className="text-white/70 text-sm">{step}</span>
                </MotionDiv>
              ))}
            </div>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Skeleton Cards */}
      <div className="space-y-4">
        {/* Summary Skeleton */}
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.6, delay: 0.2 }
          })}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-48 animate-pulse" />
                <div className="h-3 bg-white/10 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
            </div>
          </GlassCard>
        </MotionDiv>

        {/* Insight Cards Skeletons */}
        {[1, 2, 3].map((index) => (
          <MotionDiv
            key={index}
            {...(!isPerformanceMode && {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6, delay: 0.3 + index * 0.1 }
            })}
          >
            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse" />
                  </div>
                  <div className="h-8 bg-white/10 rounded w-32 animate-pulse" />
                </div>
              </div>
            </GlassCard>
          </MotionDiv>
        ))}
      </div>

      {/* Processing Time Indicator */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.6, delay: 1 }
        })}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20">
          <MotionDiv
            className="w-2 h-2 rounded-full bg-purple-400"
            {...(!isPerformanceMode && {
              animate: {
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              },
              transition: { duration: 1, repeat: Infinity }
            })}
          />
          <span className="text-purple-300 text-sm font-medium">
            Génération IA en cours... (~15-45 secondes)
          </span>
        </div>
      </MotionDiv>
    </div>
  );
};

export default FastingInsightsLoadingSkeleton;