import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface ProgressDisplayProps {
  currentProgress: number;
  currentMessage: string;
  currentSubMessage: string;
  currentPhase: 'detection' | 'analysis' | 'calculation';
  analysisColor: string;
}

/**
 * Progress Display Component
 * Affichage de la progression de l'analyse
 */
const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  currentProgress,
  currentMessage,
  currentSubMessage,
  currentPhase,
  analysisColor,
}) => {
  const reduceMotion = useReducedMotion();
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <GlassCard
      className="p-6 text-center glass-card--progress"
      style={{
        background: isPerformanceMode
          ? 'linear-gradient(145deg, color-mix(in srgb, #10B981 10%, #1e293b), color-mix(in srgb, #22C55E 6%, #0f172a))'
          : `
            radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            var(--glass-opacity)
          `,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderRadius: '24px',
        ...(isPerformanceMode ? {} : { backdropFilter: 'blur(20px) saturate(150%)' }),
        boxShadow: isPerformanceMode
          ? '0 12px 40px rgba(0, 0, 0, 0.25)'
          : `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px rgba(16, 185, 129, 0.15),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Icône animée avec style amélioré */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(34, 197, 94, 0.25))
              `,
              border: '2px solid rgba(16, 185, 129, 0.6)',
              boxShadow: `
                0 0 40px rgba(16, 185, 129, 0.5),
                inset 0 2px 0 rgba(255,255,255,0.3),
                inset 0 -2px 0 rgba(0,0,0,0.2)
              `
            }}
          >
            <motion.div
              className="relative"
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <SpatialIcon
                Icon={ICONS.Loader2}
                size={28}
                className="loader-essential"
                style={{
                  color: '#fff',
                  filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.8))'
                }}
              />
              {/* Halo rotatif - disabled in performance mode */}
              {!reduceMotion && !isPerformanceMode && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg,
                      transparent 0%,
                      ${analysisColor}40 25%,
                      transparent 50%,
                      ${analysisColor}60 75%,
                      transparent 100%
                    )`,
                    animation: 'spinHalo 3s linear infinite reverse'
                  }}
                />
              )}
            </motion.div>
          </div>
          {/* Titre avec style amélioré */}
          <h3
            className="text-2xl font-bold text-white"
            style={{
              textShadow: '0 2px 12px rgba(16, 185, 129, 0.4), 0 0 4px rgba(0,0,0,0.3)'
            }}
          >
            {currentMessage}
          </h3>
        </div>
        
        <p className="text-green-100 text-sm mb-4 leading-relaxed max-w-sm mx-auto">
          {currentSubMessage}
        </p>
        
        {/* Badge dynamique de phase avec bordures arrondies */}
        <MotionDiv
          className="inline-flex items-center justify-center gap-2 px-4 py-2 mx-auto"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(16, 185, 129, 0.2),
                rgba(34, 197, 94, 0.15)
              )
            `,
            border: '2px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '999px',
            boxShadow: isPerformanceMode
              ? 'none'
              : `
                0 0 20px rgba(16, 185, 129, 0.3),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
            ...(isPerformanceMode ? {} : { backdropFilter: 'blur(12px)' })
          }}
          key={currentPhase}
          {...(!isPerformanceMode && {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.4 }
          })}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: analysisColor,
              boxShadow: `0 0 8px ${analysisColor}`,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
          <span
            className="text-sm font-bold"
            style={{
              color: '#fff',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)'
            }}
          >
            {currentPhase === 'detection' ? 'Détection' :
             currentPhase === 'analysis' ? 'Analyse' : 'Calcul'}
          </span>
        </MotionDiv>
        
        {/* Indicateur de progression visuel */}
        <div className="flex items-center justify-center gap-1 mt-3">
          {['detection', 'analysis', 'calculation'].map((phase, index) => (
            <MotionDiv
              key={phase}
              className="w-2 h-2 rounded-full"
              style={{
                background: phase === currentPhase ? analysisColor : 'rgba(255, 255, 255, 0.3)',
                boxShadow: phase === currentPhase ? `0 0 8px ${analysisColor}60` : 'none'
              }}
              {...(!isPerformanceMode && {
                animate: phase === currentPhase ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                } : {},
                transition: {
                  duration: 1.5,
                  repeat: phase === currentPhase ? Infinity : 0,
                  ease: "easeInOut"
                }
              })}
            />
          ))}
        </div>
        
        {/* Barre de progression */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-4 overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full rounded-full relative"
            style={{ 
              background: `
                linear-gradient(90deg, 
                  ${analysisColor}, 
                  rgba(34, 197, 94, 0.9),
                  rgba(52, 211, 153, 0.8)
                )
              `,
              boxShadow: `
                0 0 16px ${analysisColor}80,
                inset 0 1px 0 rgba(255,255,255,0.3)
              `
            }}
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Shimmer effect - disabled in performance mode */}
            {!reduceMotion && !isPerformanceMode && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    rgba(255,255,255,0.4) 50%,
                    transparent 100%
                  )`,
                  animation: 'progressShimmer 2s ease-in-out infinite'
                }}
              />
            )}
          </motion.div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-300 font-medium">
            {Math.round(currentProgress)}% terminé
          </span>
          <span className="text-white/60">
            Phase: {currentPhase === 'detection' ? 'Détection' :
                   currentPhase === 'analysis' ? 'Analyse' : 'Calcul'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProgressDisplay;