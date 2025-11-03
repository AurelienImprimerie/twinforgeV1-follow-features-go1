import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePreferredMotion } from '../../../../../system/device/DeviceProvider';
import React from 'react';

/**
 * Activity Analysis Loading Skeleton - Squelette de Chargement pour l'Analyse d'Activité
 * Interface immersive pendant le forgeage des insights énergétiques
 */
const ActivityAnalysisLoadingSkeleton: React.FC = () => {
  const reduceMotion = usePreferredMotion() === 'reduced';

  return (
    <div className="space-y-6 analysis-loading-container">
      {/* Header de Forge Énergétique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.1 : 0.6 }}
      >
        <GlassCard
          className="p-8 text-center relative overflow-visible"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-activity-primary) 15%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--color-activity-secondary) 12%, transparent) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-activity-accent) 8%, transparent) 0%, transparent 70%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, var(--color-activity-primary) 30%, transparent)',
            boxShadow: `
              0 16px 48px rgba(0, 0, 0, 0.3),
              0 0 40px color-mix(in srgb, var(--color-activity-primary) 20%, transparent),
              0 0 80px color-mix(in srgb, var(--color-activity-secondary) 15%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.2)
            `,
            backdropFilter: 'blur(24px) saturate(160%)'
          }}
        >
          {/* Halo de Forge Énergétique Spatial */}
          <div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, color-mix(in srgb, var(--color-activity-primary) 8%, transparent) 0%, transparent 70%)',
              filter: 'blur(20px)',
              transform: 'scale(1.2)',
              zIndex: -1,
              animation: !reduceMotion ? 'forge-glow 4s ease-in-out infinite' : 'none'
            }}
          />

          <div className="relative z-10 space-y-6 flex flex-col items-center">
            {/* Icône de Forge Énergétique Centrale */}
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center relative"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, var(--color-activity-primary) 45%, transparent), color-mix(in srgb, var(--color-activity-secondary) 35%, transparent))
                `,
                border: '3px solid color-mix(in srgb, var(--color-activity-primary) 70%, transparent)',
                boxShadow: `
                  0 0 60px color-mix(in srgb, var(--color-activity-primary) 60%, transparent),
                  0 0 120px color-mix(in srgb, var(--color-activity-primary) 40%, transparent),
                  inset 0 3px 0 rgba(255,255,255,0.4)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              animate={reduceMotion ? {} : {
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 60px color-mix(in srgb, var(--color-activity-primary) 60%, transparent), 0 0 120px color-mix(in srgb, var(--color-activity-primary) 40%, transparent)',
                  '0 0 80px color-mix(in srgb, var(--color-activity-primary) 80%, transparent), 0 0 160px color-mix(in srgb, var(--color-activity-primary) 50%, transparent)',
                  '0 0 60px color-mix(in srgb, var(--color-activity-primary) 60%, transparent), 0 0 120px color-mix(in srgb, var(--color-activity-primary) 40%, transparent)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                className="flex items-center justify-center"
                animate={reduceMotion ? {} : { rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Zap}
                  size={36}
                  className="text-white"
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.8))',
                    display: 'block'
                  }}
                />
              </motion.div>

              {/* Particules de Forge IA autour de l'icône */}
              {!reduceMotion && [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: 'var(--color-activity-secondary)',
                    left: `${15 + i * 15}%`,
                    top: `${15 + (i % 3) * 25}%`,
                    boxShadow: '0 0 12px color-mix(in srgb, var(--color-activity-secondary) 80%, transparent)',
                    animation: `ai-particle-orbit 6s ease-in-out infinite ${i * 0.5}s`
                  }}
                />
              ))}
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Analyse Énergétique Avancée
              </h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto">
                Analyse de vos patterns d'activité
                pour forger des insights personnalisés
              </p>
            </div>

            {/* Phases d'Analyse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { phase: 'Analyse des Patterns', icon: 'BarChart3', color: 'var(--color-activity-primary)' },
                { phase: 'Forgeage d\'Insights', icon: 'TrendingUp', color: 'var(--color-activity-secondary)' },
                { phase: 'Recommandations Personnalisées', icon: 'Target', color: 'var(--color-activity-accent)' }
              ].map((item, index) => (
                <motion.div
                  key={item.phase}
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: `color-mix(in srgb, ${item.color} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${item.color} 20%, transparent)`,
                    backdropFilter: 'blur(8px) saturate(120%)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.1 : 0.5,
                    delay: reduceMotion ? 0 : 0.2 + index * 0.1
                  }}
                >
                  <motion.div
                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{
                      background: `color-mix(in srgb, ${item.color} 20%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${item.color} 30%, transparent)`
                    }}
                    animate={reduceMotion ? {} : {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        `0 0 16px color-mix(in srgb, ${item.color} 40%, transparent)`,
                        `0 0 24px color-mix(in srgb, ${item.color} 60%, transparent)`,
                        `0 0 16px color-mix(in srgb, ${item.color} 40%, transparent)`
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    <SpatialIcon
                      Icon={ICONS[item.icon as keyof typeof ICONS]}
                      size={20}
                      style={{ color: item.color }}
                    />
                  </motion.div>
                  <div className="text-white font-medium text-sm">{item.phase}</div>
                </motion.div>
              ))}
            </div>

            {/* Barre de Progression Globale */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-medium">Analyse en cours...</span>
                <span className="text-white/60">Forge Énergétique</span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    background: `
                      linear-gradient(90deg,
                        var(--color-activity-primary),
                        var(--color-activity-secondary),
                        var(--color-activity-accent)
                      )
                    `,
                    boxShadow: '0 0 16px color-mix(in srgb, var(--color-activity-primary) 60%, transparent)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: reduceMotion ? 0.1 : 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Shimmer effect */}
                  {!reduceMotion && (
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
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Squelettes de Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Squelette Graphique de Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: reduceMotion ? 0.1 : 0.6,
            delay: reduceMotion ? 0 : 0.3
          }}
        >
          <GlassCard className="p-6 h-80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'color-mix(in srgb, var(--color-activity-primary) 20%, transparent)'
              }}>
                <SpatialIcon Icon={ICONS.BarChart3} size={16} style={{ color: 'var(--color-activity-primary)' }} />
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-white/10 rounded w-40 skeleton-glass"></div>
                <div className="h-3 bg-white/5 rounded w-32"></div>
              </div>
            </div>

            {/* Squelette de graphique circulaire */}
            <div className="relative h-48 flex items-center justify-center">
              <motion.div
                className="w-32 h-32 rounded-full border-8 border-transparent relative"
                style={{
                  background: `conic-gradient(from 0deg,
                    var(--color-activity-primary) 0% 40%,
                    var(--color-activity-secondary) 40% 70%,
                    var(--color-activity-accent) 70% 100%
                  )`,
                  mask: 'radial-gradient(circle at center, transparent 40%, black 42%)',
                  WebkitMask: 'radial-gradient(circle at center, transparent 40%, black 42%)'
                }}
                animate={reduceMotion ? {} : { rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30" />
              </motion.div>

              {/* Centre du donut */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">Activités</div>
                  <div className="text-white/60 text-sm">Analyse...</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Squelette Graphique de Tendance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: reduceMotion ? 0.1 : 0.6,
            delay: reduceMotion ? 0 : 0.4
          }}
        >
          <GlassCard className="p-6 h-80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'color-mix(in srgb, var(--color-activity-secondary) 20%, transparent)'
              }}>
                <SpatialIcon Icon={ICONS.LineChart} size={16} style={{ color: 'var(--color-activity-secondary)' }} />
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-white/10 rounded w-36 skeleton-glass"></div>
                <div className="h-3 bg-white/5 rounded w-28"></div>
              </div>
            </div>

            {/* Squelette de graphique linéaire */}
            <div className="relative h-48 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-around p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-t"
                    style={{
                      width: '12px',
                      height: `${30 + Math.random() * 60}%`,
                      background: 'color-mix(in srgb, var(--color-activity-secondary) 30%, transparent)'
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${30 + Math.random() * 60}%` }}
                    transition={{
                      duration: reduceMotion ? 0.1 : 1.5,
                      delay: reduceMotion ? 0 : i * 0.1,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Squelettes d'Insights IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0.1 : 0.5,
              delay: reduceMotion ? 0 : 0.5 + index * 0.1
            }}
          >
            <GlassCard
              className="p-5"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-activity-secondary) 6%, transparent) 0%, transparent 60%),
                  var(--glass-opacity)
                `,
                borderColor: 'color-mix(in srgb, var(--color-activity-secondary) 15%, transparent)'
              }}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--color-activity-primary) 20%, transparent)'
                  }}
                  animate={reduceMotion ? {} : {
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  <SpatialIcon
                    Icon={[ICONS.TrendingUp, ICONS.Target, ICONS.BarChart3, ICONS.Zap][index]}
                    size={14}
                    style={{ color: 'var(--color-activity-primary)' }}
                  />
                </motion.div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded skeleton-glass" style={{ width: `${60 + Math.random() * 30}%` }}></div>
                  <div className="h-3 bg-white/5 rounded skeleton-glass" style={{ width: `${80 + Math.random() * 15}%` }}></div>
                  <div className="h-3 bg-white/5 rounded skeleton-glass" style={{ width: `${40 + Math.random() * 40}%` }}></div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Flux de Données IA */}
      {!reduceMotion && (
        <motion.div
          className="relative h-16 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Particules de données flottantes */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: `linear-gradient(135deg, var(--color-activity-primary), var(--color-activity-secondary))`,
                  left: `${5 + i * 8}%`,
                  top: `${40 + (i % 3) * 20}%`,
                  boxShadow: '0 0 8px color-mix(in srgb, var(--color-activity-primary) 60%, transparent)',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            ))}

            {/* Connecteurs de flux */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.path
                  key={i}
                  d={`M ${10 + i * 25} 50 Q ${25 + i * 25} 20 ${40 + i * 25} 50`}
                  stroke="var(--color-activity-primary)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="2 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </svg>
          </div>
        </motion.div>
      )}

      {/* Message d'Encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0.1 : 0.6,
          delay: reduceMotion ? 0 : 1.0
        }}
      >
        <GlassCard
          className="p-6 text-center"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-activity-secondary) 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, var(--color-activity-secondary) 20%, transparent)'
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: 'var(--color-activity-secondary)' }} />
            <p className="text-white/70 text-sm">
              Analyse de vos {' '}
              <span className="font-semibold text-white">patterns énergétiques</span>
              {' '} en cours pour forger des recommandations sur mesure...
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* CSS Animations Personnalisées */}
      <style>{`
        @keyframes forge-glow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1.1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.3);
          }
        }

        @keyframes ai-particle-orbit {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-12px) translateX(8px) scale(1.3);
            opacity: 1;
          }
          50% {
            transform: translateY(-16px) translateX(-4px) scale(1.4);
            opacity: 1;
          }
          75% {
            transform: translateY(-8px) translateX(-8px) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes ai-data-flow {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-8px) translateX(4px) scale(1.2);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-12px) translateX(-2px) scale(1.3);
            opacity: 1;
          }
          75% {
            transform: translateY(-8px) translateX(-4px) scale(1.1);
            opacity: 0.8;
          }
        }

        /* Support pour reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .forge-glow,
          .ai-particle-orbit,
          .ai-data-flow {
            animation: none !important;
          }

          .forge-glow {
            opacity: 0.7 !important;
            transform: scale(1.2) !important;
          }

          .ai-particle-orbit {
            opacity: 0.8 !important;
            transform: translateY(-10px) scale(1.2) !important;
          }

          .ai-data-flow {
            opacity: 0.7 !important;
            transform: translateY(-6px) scale(1.1) !important;
          }
        }

        /* Optimisations mobile */
        @media (max-width: 768px) {
          .analysis-loading-container {
            padding: 0.5rem;
          }

          .forge-glow {
            animation-duration: 5s;
          }

          .ai-particle-orbit {
            animation-duration: 8s;
          }

          .ai-data-flow {
            animation-duration: 6s;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityAnalysisLoadingSkeleton;