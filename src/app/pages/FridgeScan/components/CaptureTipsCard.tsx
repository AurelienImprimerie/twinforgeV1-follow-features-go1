import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

/**
 * Capture Tips Card - Conseils de Capture Optimisés
 * Composant éducatif pour optimiser la qualité des photos et guider l'utilisateur
 */
const CaptureTipsCard: React.FC = () => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const captureSteps = [
    {
      icon: 'Eye',
      text: 'Éclairage uniforme et suffisant',
      color: 'var(--color-ember-copper)'
    },
    {
      icon: 'Target',
      text: 'Cadrez les étagères principales',
      color: 'var(--color-plasma-cyan)'
    },
    {
      icon: 'Maximize2',
      text: 'Évitez reflets et ombres portées',
      color: 'var(--color-health-primary)'
    },
    {
      icon: 'List',
      text: 'Organisez légèrement avant capture',
      color: 'var(--color-nutrition-primary)'
    }
  ];

  const benefits = [
    {
      icon: 'ChefHat',
      title: 'Recettes sur Mesure',
      description: 'Créez des plats uniques adaptés à vos ingrédients et préférences',
      color: 'var(--color-fridge-primary)'
    },
    {
      icon: 'Calendar',
      title: 'Plans Hebdomadaires',
      description: 'Planification nutritionnelle intelligente pour toute la semaine',
      color: 'var(--color-training-primary)'
    },
    {
      icon: 'ShoppingCart',
      title: 'Listes Optimisées',
      description: 'Courses automatisées basées sur vos besoins réels',
      color: 'var(--color-fasting-primary)'
    },
    {
      icon: 'Zap',
      title: 'Forge Nutritionnelle',
      description: 'Optimisation continue de votre alimentation personnelle',
      color: 'var(--color-plasma-cyan)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Carte principale des conseils */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: "easeOut" }
        })}
      >
        <GlassCard className="fridge-glass-scan-subtle p-6">
          {/* En-tête optimisé */}
          <div className="flex items-start gap-4 mb-6">
            <MotionDiv
              className={`fridge-icon-scan ${isPerformanceMode ? '' : 'fridge-ai-focus'} w-14 h-14 flex-shrink-0`}
              {...(!isPerformanceMode && {
                initial: { scale: 0.8, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                transition: { delay: 0.2, duration: 0.5 }
              })}
            >
              <SpatialIcon
                Icon={ICONS.Lightbulb}
                size={24}
                color="rgba(255, 255, 255, 0.95)"
                variant="pure"
              />
            </MotionDiv>
            <div className="flex-1">
              <MotionDiv
                className="text-xl font-bold mb-2 text-white"
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.3, duration: 0.5 }
                })}
              >
                Optimisation de la Forge : Conseils de Capture
              </MotionDiv>
              <MotionDiv
                className="text-sm text-white/70"
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, x: -20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.4, duration: 0.5 }
                })}
              >
                Maximisez la précision de votre scan pour des créations culinaires parfaites
              </MotionDiv>
            </div>
          </div>

          {/* Astuces de capture améliorées */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: isPerformanceMode ? 0 : 0.1,
                  delayChildren: isPerformanceMode ? 0 : 0.5
                }
              }
            }}
          >
            {captureSteps.map((tip, index) => (
              <div
                key={index}
                className="fridge-card-tip flex items-center gap-3 p-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `
                      radial-gradient(circle, color-mix(in srgb, ${tip.color} 20%, transparent) 0%,
                      color-mix(in srgb, ${tip.color} 5%, transparent) 70%)
                    `,
                    border: `2px solid color-mix(in srgb, ${tip.color} 25%, transparent)`,
                    boxShadow: `0 0 12px color-mix(in srgb, ${tip.color} 20%, transparent)`
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS[tip.icon as keyof typeof ICONS]}
                    size={18}
                    style={{
                      color: tip.color,
                      filter: `drop-shadow(0 0 4px color-mix(in srgb, ${tip.color} 30%, transparent))`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-white/85">
                  {tip.text}
                </span>
              </div>
            ))}
          </motion.div>
        </GlassCard>
      </MotionDiv>

      {/* Nouvelle section des bénéfices */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.8, ease: "easeOut" }
        })}
      >
        <GlassCard className="fridge-glass-inventory p-6">
          {/* Icône centrale au-dessus du titre */}
          <MotionDiv
            className="flex justify-center mb-6"
            {...(!isPerformanceMode && {
              initial: { scale: 0.8, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              transition: { delay: 1, duration: 0.6 }
            })}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 25%, transparent) 0%,
                  color-mix(in srgb, var(--color-plasma-cyan) 10%, transparent) 70%)
                `,
                border: '3px solid color-mix(in srgb, var(--brand-primary) 35%, transparent)',
                boxShadow: `
                  0 0 30px color-mix(in srgb, var(--brand-primary) 30%, transparent),
                  inset 0 2px 0 color-mix(in srgb, white 20%, transparent)
                `
              }}
            >
              <SpatialIcon
                Icon={ICONS.Sparkles}
                size={48}
                style={{
                  color: 'var(--brand-primary)',
                  filter: 'drop-shadow(0 0 12px color-mix(in srgb, var(--brand-primary) 50%, transparent))'
                }}
              />
            </div>
          </MotionDiv>

          {/* En-tête de la section bénéfices */}
          <div className="text-center mb-6">
            <MotionDiv
              className="text-xl font-bold mb-3 text-white"
              {...(!isPerformanceMode && {
                initial: { opacity: 0, y: -10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 1.1, duration: 0.5 }
              })}
            >
              La Puissance de la Forge Spatiale : Vos Bénéfices
            </MotionDiv>
            <MotionDiv
              className="text-sm text-white/70 max-w-md mx-auto"
              {...(!isPerformanceMode && {
                initial: { opacity: 0, y: -10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 1.2, duration: 0.5 }
              })}
            >
              Transformez vos ingrédients en opportunités culinaires infinies grâce à notre Moteur de Forge avancé
            </MotionDiv>
          </div>

          {/* Liste des bénéfices */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: isPerformanceMode ? 0 : 0.15,
                  delayChildren: isPerformanceMode ? 0 : 1.3
                }
              }
            }}
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="fridge-card-benefit flex items-start gap-4 p-4"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `
                      radial-gradient(circle, color-mix(in srgb, ${benefit.color} 20%, transparent) 0%,
                      color-mix(in srgb, ${benefit.color} 5%, transparent) 70%)
                    `,
                    border: `2px solid color-mix(in srgb, ${benefit.color} 25%, transparent)`,
                    boxShadow: `0 0 16px color-mix(in srgb, ${benefit.color} 20%, transparent)`
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS[benefit.icon as keyof typeof ICONS]}
                    size={20}
                    style={{
                      color: benefit.color,
                      filter: `drop-shadow(0 0 6px color-mix(in srgb, ${benefit.color} 35%, transparent))`
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-sm mb-1 text-white">
                    {benefit.title}
                  </h5>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </GlassCard>
      </MotionDiv>
    </div>
  );
};

export default CaptureTipsCard;
