import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import { useLastActivity } from '../../../hooks/useActivitiesData';
import { analyzeActivityContext } from './contextAnalysis';
import { generateCTAMessage } from './messageGenerator';
import { calculateUrgencyConfig, shouldShowParticles, getParticleCount } from './urgencyCalculator';
import { useActivityPerformance } from '../../../hooks/useActivityPerformance';
import logger from '../../../../../../lib/utils/logger';

interface ActivityCTAProps {
  todayStats?: {
    totalCalories: number;
    activitiesCount: number;
    totalDuration: number;
    lastActivityTime?: Date;
  };
  profile?: any;
}

/**
 * Obtenir les métriques contextuelles pour affichage
 */
function getContextualMetrics(todayStats?: any): string[] {
  const metrics: string[] = [];

  if (todayStats?.totalCalories > 0) {
    metrics.push(`${todayStats.totalCalories} kcal brûlées`);
  }

  if (todayStats?.totalDuration > 0) {
    metrics.push(`${todayStats.totalDuration} min actives`);
  }

  if (todayStats?.activitiesCount > 0) {
    metrics.push(`${todayStats.activitiesCount} activité${todayStats.activitiesCount > 1 ? 's' : ''}`);
  }

  return metrics;
}

/**
 * Dynamic Activity CTA - Call to Action dynamique pour les activités
 * Incite l'utilisateur à enregistrer des activités selon son état actuel ET son historique global
 */
const DynamicActivityCTA: React.FC<ActivityCTAProps> = ({ todayStats, profile }) => {
  const navigate = useNavigate();
  const { click } = useFeedback();
  const perf = useActivityPerformance();

  // Récupérer la dernière activité globale (pas uniquement aujourd'hui)
  const { data: lastActivity } = useLastActivity();

  // DIAGNOSTIC: Logger les données reçues pour le CTA
  React.useEffect(() => {
    logger.info('DYNAMIC_ACTIVITY_CTA_DIAGNOSTIC', 'CTA render state', {
      hasTodayStats: !!todayStats,
      todayActivitiesCount: todayStats?.activitiesCount || 0,
      todayTotalCalories: todayStats?.totalCalories || 0,
      hasLastActivity: !!lastActivity,
      lastActivityTimestamp: lastActivity?.timestamp,
      lastActivityType: lastActivity?.type,
      timestamp: new Date().toISOString()
    });
  }, [todayStats, lastActivity]);

  // Analyser le contexte d'activité complet
  const activityContext = React.useMemo(() => {
    const context = analyzeActivityContext(todayStats || null, lastActivity);

    // DIAGNOSTIC: Logger le contexte analysé
    logger.info('DYNAMIC_ACTIVITY_CTA_DIAGNOSTIC', 'Activity context analyzed', {
      urgencyLevel: context.urgencyLevel,
      daysSinceLastActivity: context.daysSinceLastActivity,
      hasActivitiesToday: context.hasActivitiesToday,
      totalActivitiesToday: context.totalActivitiesToday,
      hasActivitiesThisWeek: context.hasActivitiesThisWeek,
      contextMessage: context.contextMessage,
      timestamp: new Date().toISOString()
    });

    return context;
  }, [todayStats, lastActivity]);

  // Générer le message CTA basé sur le contexte
  const message = React.useMemo(() => {
    return generateCTAMessage(activityContext);
  }, [activityContext]);

  // Calculer la configuration d'urgence
  const urgencyConfig = React.useMemo(() => {
    return calculateUrgencyConfig(activityContext);
  }, [activityContext]);

  const contextualMetrics = getContextualMetrics(todayStats);
  const hasActivities = (todayStats?.activitiesCount || 0) > 0;

  const handleActivityInput = () => {
    click();
    navigate('/activity/input');
  };

  const handleViewInsights = () => {
    click();
    navigate('/activity#insights');
  };

  const cardStyles = {
    background: `
      radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 12%, transparent) 0%, transparent 60%),
      radial-gradient(circle at 70% 80%, color-mix(in srgb, #3B82F6 8%, transparent) 0%, transparent 50%),
      var(--glass-opacity)
    `,
    borderColor: `color-mix(in srgb, #3B82F6 25%, transparent)`,
    '--glow-color': `color-mix(in srgb, #3B82F6 30%, transparent)`
  } as React.CSSProperties;

  const isPerformanceMode = perf.mode === 'low' || perf.mode === 'medium';
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <div className="dynamic-activity-cta activity-capture-enter" data-performance-mode={isPerformanceMode}>
      <GlassCard
        className="p-6 md:p-8 pb-8 md:pb-10 text-center relative overflow-hidden cursor-pointer activity-card-base"
        onClick={handleActivityInput}
        interactive
        style={cardStyles}
      >
        {/* Carrés tournants aux coins - Désactivés en mode low/medium */}
        {perf.enableRotations && (
          <div className="training-hero-corners" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <MotionDiv
                key={i}
                className="corner-particle"
                style={{
                  position: 'absolute',
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: 'linear-gradient(135deg, #3B82F6, rgba(96, 165, 250, 0.8))',
                  boxShadow: '0 0 20px #3B82F6',
                  top: i < 2 ? '12px' : 'auto',
                  bottom: i >= 2 ? '12px' : 'auto',
                  left: i % 2 === 0 ? '12px' : 'auto',
                  right: i % 2 === 1 ? '12px' : 'auto',
                  willChange: isPerformanceMode ? 'auto' : 'transform, opacity'
                }}
                {...(!isPerformanceMode && {
                  initial: {
                    rotate: i % 2 === 0 ? 45 : -45
                  },
                  animate: {
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.9, 0.6],
                    rotate: i % 2 === 0 ? [45, 55, 45] : [-45, -55, -45]
                  },
                  transition: {
                    duration: 3.5,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: [0.45, 0.05, 0.55, 0.95]
                  }
                })}
              />
            ))}
          </div>
        )}

        {(urgencyConfig.priority === 'high' || urgencyConfig.priority === 'critical') && perf.enableGlows && (
          <div
            className="absolute inset-0 rounded-inherit pointer-events-none urgent-forge-glow-css"
            style={{
              background: `radial-gradient(circle at center, color-mix(in srgb, #3B82F6 8%, transparent) 0%, transparent 70%)`,
              filter: 'blur(20px)',
              transform: 'scale(1.2)',
              zIndex: -1
            }}
          />
        )}

        <div className="relative z-10 space-y-4 md:space-y-6">
          {/* Icône Principale avec Animation VisionOS 26 */}
          <MotionDiv
            className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center relative ${
              urgencyConfig.animation === 'pulse' && perf.enablePulseEffects ? 'icon-pulse-css' :
              urgencyConfig.animation === 'breathing' && perf.enablePulseEffects ? 'icon-breathing-css' : ''
            }`}
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%),
                radial-gradient(circle at 70% 70%, color-mix(in srgb, #3B82F6 35%, transparent) 0%, transparent 50%),
                linear-gradient(135deg, color-mix(in srgb, #3B82F6 55%, transparent), color-mix(in srgb, #60A5FA 45%, transparent))
              `,
              border: '3px solid color-mix(in srgb, #3B82F6 70%, transparent)',
              boxShadow: `
                0 0 40px color-mix(in srgb, #3B82F6 60%, transparent),
                0 0 80px color-mix(in srgb, #3B82F6 40%, transparent),
                inset 0 3px 0 rgba(255,255,255,0.4)
              `,
              willChange: isPerformanceMode ? 'auto' : 'transform'
            }}
            {...(!isPerformanceMode && {
              animate: {
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4)',
                  '0 0 45px rgba(59, 130, 246, 0.65), 0 0 90px rgba(59, 130, 246, 0.45)',
                  '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4)'
                ]
              },
              transition: { duration: 3, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] }
            })}
          >
            <SpatialIcon
              Icon={ICONS[urgencyConfig.icon as keyof typeof ICONS]}
              size={(urgencyConfig.priority === 'high' || urgencyConfig.priority === 'critical') ? 56 : 48}
              color="rgba(255, 255, 255, 0.95)"
              variant="pure"
            />

            {/* Anneau de Pulsation */}
            {!isPerformanceMode && perf.enableAnimations && (
              <motion.div
                className="absolute inset-0 rounded-full border-3"
                style={{
                  borderColor: 'color-mix(in srgb, #3B82F6 70%, transparent)',
                  willChange: 'transform, opacity'
                }}
                animate={{
                  scale: [1, 1.5, 1.5],
                  opacity: [0.7, 0, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
            )}

            {/* Particules Jaillissantes - Toujours 6 particules */}
            {perf.enableParticles && !isPerformanceMode &&
              [...Array(6)].map((_, i) => {
                const angle = (i * 360) / 6;
                const radius = 60;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full dynamic-particle-css dynamic-particle-css--${i + 1}`}
                    style={{
                      background: '#3B82F6',
                      boxShadow: `0 0 12px color-mix(in srgb, #3B82F6 70%, transparent)`,
                      '--particle-x': `${x * 0.4}px`,
                      '--particle-y': `${y * 0.4}px`,
                      '--particle-x-end': `${x}px`,
                      '--particle-y-end': `${y}px`
                    } as React.CSSProperties}
                  />
                );
              })
            }
          </MotionDiv>

          <div className="space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {message.title}
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-md mx-auto">
              {message.subtitle}
            </p>

            {message.encouragement && (
              <p className="text-white/60 text-sm italic">
                {message.encouragement}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 items-center">
            {/* Primary CTA - Enregistrer une activité */}
            <button
              onClick={handleActivityInput}
              className={`dynamic-cta-button-3d dynamic-cta-button-3d-high min-h-[64px] w-full sm:w-auto ${
                urgencyConfig.animation === 'breathing' && perf.enableAnimations ? 'btn-breathing-css' : ''
              }`}
              style={{
                '--btn-color-light': '#60A5FA',
                '--btn-color-base': '#3B82F6',
                '--btn-color-dark': '#2563EB',
                '--btn-shadow': 'rgba(59, 130, 246, 0.6)',
                '--btn-glow': 'rgba(59, 130, 246, 0.8)'
              } as React.CSSProperties}
            >
              {/* Shimmer Effect - Désactivé en mode low/medium */}
              {perf.enableShimmers && (
                <div className="dynamic-cta-shimmer" />
              )}

              <div>
                <SpatialIcon
                  Icon={ICONS[urgencyConfig.icon as keyof typeof ICONS]}
                  size={24}
                  color="white"
                  variant="pure"
                />
                <span>
                  {message.buttonText}
                </span>
              </div>
            </button>

            {/* Secondary CTA - View Insights (transparent button) */}
            {hasActivities && (
              <button
                onClick={handleViewInsights}
                className="px-6 py-4 rounded-full font-medium text-white/90 transition-all duration-200 min-h-[64px]"
                style={{
                  background: `color-mix(in srgb, #3B82F6 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, #3B82F6 20%, transparent)`,
                  backdropFilter: 'blur(12px) saturate(130%)'
                }}
                onMouseEnter={(e) => {
                  if (perf.mode !== 'low') {
                    e.currentTarget.style.background = `color-mix(in srgb, #3B82F6 12%, transparent)`;
                    e.currentTarget.style.borderColor = `color-mix(in srgb, #3B82F6 30%, transparent)`;
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `color-mix(in srgb, #3B82F6 8%, transparent)`;
                  e.currentTarget.style.borderColor = `color-mix(in srgb, #3B82F6 20%, transparent)`;
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <SpatialIcon Icon={ICONS.Zap} size={20} color="white" variant="pure" />
                  <span>Voir mes Insights</span>
                </div>
              </button>
            )}
          </div>

          {/* Métriques Contextuelles - Placées après les boutons */}
          {contextualMetrics.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              {contextualMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 rounded-full metric-badge-enter"
                  style={{
                    background: `color-mix(in srgb, #3B82F6 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, #3B82F6 25%, transparent)`,
                    color: '#3B82F6',
                    backdropFilter: 'blur(8px) saturate(120%)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span className="font-medium">{metric}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default DynamicActivityCTA;
