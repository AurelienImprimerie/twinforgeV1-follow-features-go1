import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface GeneratingStageProps {
  onExit: () => void;
}

const GeneratingStage: React.FC<GeneratingStageProps> = ({ onExit }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <div className="space-y-6">
      {/* Loader Card */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5 }
        })}
      >
        <GlassCard
          className="p-12"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 15%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #A855F7 12%, transparent) 0%, transparent 50%),
              linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05)),
              rgba(11, 14, 23, 0.85)
            `,
            borderColor: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 40px color-mix(in srgb, #8B5CF6 25%, transparent),
              0 0 80px color-mix(in srgb, #A855F7 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(32px) saturate(170%)',
            WebkitBackdropFilter: 'blur(32px) saturate(170%)'
          }}
        >
          <div className="space-y-8 text-center">
            {/* Animated Icon */}
            <div className="relative inline-block">
              <MotionDiv
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center relative"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%),
                    radial-gradient(circle at 70% 70%, color-mix(in srgb, #8B5CF6 25%, transparent) 0%, transparent 50%),
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 45%, transparent), color-mix(in srgb, #A855F7 40%, transparent))
                  `,
                  border: '4px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
                  boxShadow: `
                    0 0 40px color-mix(in srgb, #8B5CF6 50%, transparent),
                    0 0 80px color-mix(in srgb, #A855F7 40%, transparent),
                    inset 0 3px 0 rgba(255,255,255,0.4)
                  `
                }}
                {...(!isPerformanceMode && {
                  animate: {
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0]
                  },
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: [0.45, 0.05, 0.55, 0.95]
                  }
                })}
              >
                <SpatialIcon
                  Icon={ICONS.Sparkles}
                  size={64}
                  color="rgba(255, 255, 255, 0.95)"
                  variant="pure"
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))'
                  }}
                />
              </MotionDiv>

              {/* Orbiting particles */}
              {!isPerformanceMode && [0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                    boxShadow: '0 0 12px #8B5CF6',
                    top: '50%',
                    left: '50%',
                    marginTop: '-6px',
                    marginLeft: '-6px',
                    transformOrigin: `${80 * Math.cos((i * 120 * Math.PI) / 180)}px ${80 * Math.sin((i * 120 * Math.PI) / 180)}px`
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.66,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              ))}
            </div>

            {/* Title and Description */}
            <div className="space-y-4">
              <h2
                className="text-3xl font-bold text-white"
                style={{
                  textShadow: '0 0 30px color-mix(in srgb, #8B5CF6 60%, transparent)'
                }}
              >
                Forge des Plans Alimentaires
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
                La Forge Nutritionnelle analyse votre inventaire et vos préférences pour créer des plans alimentaires optimisés...
              </p>
            </div>

            {/* Loading Steps */}
            <div className="space-y-3 max-w-md mx-auto">
              {[
                'Analyse de votre inventaire',
                'Optimisation nutritionnelle',
                'Création des plans hebdomadaires',
                'Génération de la structure des repas'
              ].map((step, index) => (
                <MotionDiv
                  key={step}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}
                  {...(!isPerformanceMode && {
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.3, delay: index * 0.15 }
                  })}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)'
                    }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{step}</span>
                </MotionDiv>
              ))}
            </div>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Exit Button */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3, delay: 0.3 }
        })}
        className="flex justify-end"
      >
        <button
          onClick={onExit}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200"
        >
          Quitter
        </button>
      </MotionDiv>
    </div>
  );
};

export default GeneratingStage;
