/**
 * Plan Generation Progress Component
 * Component for displaying meal plan generation progress
 */

import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface PlanGenerationProgressProps {
  progress: number;
  loadingMessage: string;
  currentLoadingTitle: string;
  currentLoadingSubtitle: string;
}

/**
 * Plan Generation Progress Component - Progression de Génération
 */
const PlanGenerationProgress: React.FC<PlanGenerationProgressProps> = ({
  progress,
  loadingMessage,
  currentLoadingTitle,
  currentLoadingSubtitle
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
      })}
    >
      <GlassCard 
        className="p-8 text-center"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #A855F7 12%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #8B5CF6 20%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        <div className="space-y-6">
          {/* Icône de Génération */}
          <MotionDiv
            className={`w-20 h-20 mx-auto rounded-full ${isPerformanceMode ? 'animate-pulse' : ''}`}
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
              boxShadow: '0 0 30px color-mix(in srgb, #8B5CF6 40%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            {...(!isPerformanceMode && {
              animate: {
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              },
              transition: {
                duration: 2,
                repeat: Infinity
              }
            })}
          >
            <SpatialIcon Icon={ICONS.Calendar} size={40} style={{ color: '#8B5CF6' }} />
          </MotionDiv>

          {/* Titre et Message */}
          <div>
            <MotionDiv
              className="text-3xl font-bold text-white mb-3"
              key={currentLoadingTitle}
              {...(!isPerformanceMode && {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.4 }
              })}
              style={{
                textShadow: '0 0 20px color-mix(in srgb, #8B5CF6 60%, transparent)'
              }}
            >
              {currentLoadingTitle || 'Génération du Plan Nutritionnel'}
            </MotionDiv>

            <MotionDiv
              className="text-white/90 text-xl mb-2"
              key={currentLoadingSubtitle}
              {...(!isPerformanceMode && {
                initial: { opacity: 0, y: 5 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3, delay: 0.1 }
              })}
            >
              {currentLoadingSubtitle || 'Préparation de votre plan personnalisé'}
            </MotionDiv>

            {loadingMessage && (
              <MotionDiv
                className="text-white/70 text-sm"
                key={loadingMessage}
                {...(!isPerformanceMode && {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.2 }
                })}
              >
                {loadingMessage}
              </MotionDiv>
            )}
          </div>

          {/* Barre de Progression */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex justify-between text-sm text-white/70">
              <span>Progression</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <MotionDiv
                className="h-3 rounded-full relative overflow-hidden"
                style={{
                  background: `linear-gradient(90deg,
                    #8B5CF6,
                    #A855F7,
                    #C084FC
                  )`,
                  boxShadow: `
                    0 0 16px color-mix(in srgb, #8B5CF6 70%, transparent),
                    inset 0 1px 0 rgba(255,255,255,0.4)
                  `,
                  width: `${progress}%`
                }}
                {...(!isPerformanceMode && {
                  initial: { width: 0 },
                  animate: { width: `${progress}%` },
                  transition: { duration: 0.3, ease: "easeOut" }
                })}
              >
                {/* Shimmer Effect */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg,
                      transparent 0%,
                      rgba(255,255,255,0.6) 50%,
                      transparent 100%
                    )`,
                    animation: 'progressShimmer 2s ease-in-out infinite'
                  }}
                />
              </MotionDiv>
            </div>
          </div>

          {/* Étapes de Génération */}
          <div className="text-sm text-white/60">
            <div className="flex items-center justify-center gap-2">
              <SpatialIcon Icon={ICONS.Zap} size={14} style={{ color: '#8B5CF6' }} />
              <span>
                {progress < 15 ? 'Analyse de la Forge' :
                 progress < 75 ? 'Génération intelligente des repas' :
                 progress < 90 ? 'Optimisation nutritionnelle' :
                 'Finalisation du plan'}
              </span>
            </div>
          </div>

          {/* Indicateur de connexion backend */}
          {progress > 10 && progress < 100 && (
            <MotionDiv
              className="text-xs text-white/40 flex items-center justify-center gap-2"
              {...(!isPerformanceMode && {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { delay: 0.5 }
              })}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              <span>Connecté au serveur de génération</span>
            </MotionDiv>
          )}
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default PlanGenerationProgress;