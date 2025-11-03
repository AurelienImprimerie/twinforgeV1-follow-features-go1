import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import { usePreferredMotion } from '../../../../../system/device/DeviceProvider';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import { useUserStore } from '@/system/store/userStore';
import { useFastingPipeline, useFastingElapsedSeconds, useFastingProgressPercentage, useFastingTimerTick } from '../../hooks/useFastingPipeline';
import {
  getCurrentFastingPhase,
  getMotivationalMessage,
  getPhaseProgress,
  estimateCaloriesBurnedInPhase
} from '../../../../../lib/nutrition/fastingPhases';
import { formatElapsedTime } from '../../utils/fastingUtils';
import { getProtocolById } from '../../../../../lib/nutrition/fastingProtocols';

interface FastingCTAProps {
  className?: string;
}

interface UrgencyConfig {
  priority: 'low' | 'medium' | 'high';
  color: string;
  icon: keyof typeof ICONS;
  animation: 'none' | 'breathing' | 'pulse';
}

interface CTAMessage {
  title: string;
  subtitle: string;
  buttonText: string;
  encouragement?: string;
}

/**
 * Déterminer l'urgence basée sur l'état du jeûne
 */
function getUrgencyConfig(
  isActive: boolean,
  hasPreferredProtocol: boolean,
  elapsedHours: number
): UrgencyConfig {
  // Session active : priorité moyenne avec couleur rouge/orange
  if (isActive) {
    return {
      priority: 'medium',
      color: '#EF4444',
      icon: 'Timer',
      animation: 'breathing'
    };
  }

  // Pas de session mais protocole configuré : priorité moyenne
  if (hasPreferredProtocol) {
    return {
      priority: 'medium',
      color: '#F59E0B',
      icon: 'Timer',
      animation: 'breathing'
    };
  }

  // Aucune configuration : haute priorité pour encourager
  return {
    priority: 'high',
    color: '#F59E0B',
    icon: 'Timer',
    animation: 'pulse'
  };
}

/**
 * Obtenir le message CTA basé sur l'état du jeûne
 */
function getCTAMessage(
  isActive: boolean,
  hasPreferredProtocol: boolean,
  preferredProtocol: string | null,
  elapsedHours: number,
  currentPhase?: any
): CTAMessage {
  if (isActive) {
    const phaseMessage = currentPhase ? ` - Phase ${currentPhase.name}` : '';
    return {
      title: 'Session Active',
      subtitle: `Votre jeûne progresse${phaseMessage}`,
      buttonText: 'Gérer ma session',
      encouragement: 'Continuez votre excellent travail !'
    };
  }

  if (hasPreferredProtocol && preferredProtocol) {
    const protocol = getProtocolById(preferredProtocol);
    const protocolName = protocol?.name || preferredProtocol;

    return {
      title: 'Prêt à jeûner',
      subtitle: `Démarrez votre protocole ${protocolName}`,
      buttonText: 'Commencer le jeûne',
      encouragement: 'Votre protocole est configuré et prêt'
    };
  }

  return {
    title: 'Forgez votre métabolisme !',
    subtitle: 'Commencez votre première session de jeûne intermittent',
    buttonText: 'Démarrer une session',
    encouragement: 'Maîtrisez votre sèche avec le jeûne'
  };
}

/**
 * Obtenir les métriques contextuelles
 */
function getContextualMetrics(
  isActive: boolean,
  elapsedHours: number,
  targetHours: number,
  currentPhase?: any
): string[] {
  const metrics: string[] = [];

  if (isActive) {
    if (elapsedHours > 0) {
      const hours = Math.floor(elapsedHours);
      const minutes = Math.floor((elapsedHours - hours) * 60);
      metrics.push(`${hours}h ${minutes}m écoulées`);
    }

    if (targetHours > 0) {
      metrics.push(`Objectif ${targetHours}h`);
    }

    if (currentPhase) {
      metrics.push(`Phase ${currentPhase.name}`);
    }
  }

  return metrics;
}

/**
 * Dynamic Fasting CTA - Call to Action dynamique pour le jeûne
 * Incite l'utilisateur à démarrer ou gérer ses sessions de jeûne selon son état actuel
 */
const DynamicFastingCTA: React.FC<FastingCTAProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { click } = useFeedback();
  const reduceMotion = usePreferredMotion() === 'reduced';
  const { isPerformanceMode } = usePerformanceMode();
  const { profile } = useUserStore();
  const { isActive, session } = useFastingPipeline();

  // Enable real-time timer updates
  useFastingTimerTick();

  // Use dynamic selectors for real-time updates
  const elapsedSeconds = useFastingElapsedSeconds();
  const progressPercentage = useFastingProgressPercentage();

  // Déterminer l'état du jeûne
  const elapsedHours = elapsedSeconds / 3600;
  const targetHours = session?.targetHours || 16;
  const preferredProtocol = profile?.nutrition?.fastingWindow?.protocol;
  const hasPreferredProtocol = !!(preferredProtocol && preferredProtocol !== '');

  // Obtenir la phase métabolique actuelle si session active
  const currentPhase = isActive ? getCurrentFastingPhase(elapsedHours) : null;

  const urgencyConfig = getUrgencyConfig(isActive, hasPreferredProtocol, elapsedHours);
  const message = getCTAMessage(isActive, hasPreferredProtocol, preferredProtocol, elapsedHours, currentPhase);
  const contextualMetrics = getContextualMetrics(isActive, elapsedHours, targetHours, currentPhase);

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const handleFastingAction = () => {
    click();
    navigate('/fasting/input');
  };

  const cardStyles = {
    background: `
      radial-gradient(circle at 30% 20%, color-mix(in srgb, ${urgencyConfig.color} 12%, transparent) 0%, transparent 60%),
      radial-gradient(circle at 70% 80%, color-mix(in srgb, ${urgencyConfig.color} 8%, transparent) 0%, transparent 50%),
      var(--glass-opacity)
    `,
    borderColor: `color-mix(in srgb, ${urgencyConfig.color} 25%, transparent)`,
    boxShadow: isPerformanceMode
      ? `0 12px 40px rgba(0, 0, 0, 0.25)`
      : `
        0 12px 40px rgba(0, 0, 0, 0.25),
        0 0 30px color-mix(in srgb, ${urgencyConfig.color} 15%, transparent),
        inset 0 2px 0 rgba(255, 255, 255, 0.15)
      `,
    backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
  };

  const iconStyles = {
    background: isPerformanceMode
      ? `linear-gradient(135deg, color-mix(in srgb, ${urgencyConfig.color} 35%, transparent), color-mix(in srgb, ${urgencyConfig.color} 25%, transparent))`
      : `
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
          radial-gradient(circle at 70% 70%, color-mix(in srgb, ${urgencyConfig.color} 15%, transparent) 0%, transparent 50%),
          linear-gradient(135deg, color-mix(in srgb, ${urgencyConfig.color} 35%, transparent), color-mix(in srgb, ${urgencyConfig.color} 25%, transparent))
        `,
    border: `2px solid color-mix(in srgb, ${urgencyConfig.color} 50%, transparent)`,
    boxShadow: isPerformanceMode
      ? 'none'
      : `
          0 0 30px color-mix(in srgb, ${urgencyConfig.color} 40%, transparent),
          0 0 60px color-mix(in srgb, ${urgencyConfig.color} 25%, transparent),
          inset 0 2px 0 rgba(255,255,255,0.3)
        `
  };

  const buttonStyles = {
    background: `linear-gradient(135deg,
      color-mix(in srgb, ${urgencyConfig.color} 80%, transparent),
      color-mix(in srgb, ${urgencyConfig.color} 60%, transparent)
    )`,
    border: `2px solid color-mix(in srgb, ${urgencyConfig.color} 60%, transparent)`,
    boxShadow: isPerformanceMode
      ? `0 12px 40px color-mix(in srgb, ${urgencyConfig.color} 40%, transparent)`
      : `
          0 12px 40px color-mix(in srgb, ${urgencyConfig.color} 40%, transparent),
          0 0 60px color-mix(in srgb, ${urgencyConfig.color} 30%, transparent),
          inset 0 3px 0 rgba(255,255,255,0.4)
        `,
    backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)',
    color: '#fff',
    transition: 'all 0.2s ease'
  };

  return (
    <div className={`dynamic-fasting-cta w-full ${className}`}>
      <GlassCard
        className="p-6 md:p-8 pb-10 md:pb-12 text-center relative overflow-visible cursor-pointer w-full"
        onClick={handleFastingAction}
        interactive
        style={cardStyles}
      >
        {/* Carrés tournants aux coins */}
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
                background: `linear-gradient(135deg, ${urgencyConfig.color}, rgba(255, 255, 255, 0.8))`,
                boxShadow: isPerformanceMode ? 'none' : `0 0 20px ${urgencyConfig.color}`,
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
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6],
                  rotate: i % 2 === 0 ? [45, 60, 45] : [-45, -60, -45]
                },
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }
              })}
            />
          ))}
        </div>

        {urgencyConfig.priority === 'high' && !isPerformanceMode && !reduceMotion && (
          <div
            className="absolute inset-0 rounded-inherit pointer-events-none urgent-forge-glow-css"
            style={{
              background: `radial-gradient(circle at center, color-mix(in srgb, ${urgencyConfig.color} 8%, transparent) 0%, transparent 70%)`,
              filter: 'blur(20px)',
              transform: 'scale(1.2)',
              zIndex: -1
            }}
          />
        )}

        <div className="relative z-10 space-y-4 md:space-y-6">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center relative ${
              !isPerformanceMode && urgencyConfig.animation === 'pulse' && !reduceMotion ? 'icon-pulse-css' :
              !isPerformanceMode && urgencyConfig.animation === 'breathing' && !reduceMotion ? 'icon-breathing-css' : ''
            }`}
            style={iconStyles}
          >
            <SpatialIcon
              Icon={ICONS[urgencyConfig.icon]}
              size={urgencyConfig.priority === 'high' ? 36 : 32}
              style={{ color: urgencyConfig.color }}
            />

            {/* Particules de Forge Spatiale autour de l'icône pour les états actifs */}
            {!isPerformanceMode && (urgencyConfig.priority === 'high' || isActive) && !reduceMotion &&
              [...Array(isActive ? 4 : 6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full dynamic-particle-css dynamic-particle-css--${i + 1}`}
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${15 + (i % 3) * 25}%`,
                    background: urgencyConfig.color,
                    boxShadow: `0 0 8px color-mix(in srgb, ${urgencyConfig.color} 60%, transparent)`
                  }}
                />
              ))
            }
          </div>

          <div className="space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {message.title}
            </h2>

            {isActive && session && (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-5xl md:text-6xl font-black mb-2" style={{ color: urgencyConfig.color }}>
                    {formatElapsedTime(elapsedSeconds)}
                  </div>
                  <div className="text-lg md:text-xl text-white/90 font-semibold">
                    Objectif : {session.targetHours}h • {Math.round(progressPercentage)}% accompli
                  </div>
                </div>

                {/* Progress Bar for Active Session */}
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <MotionDiv
                      className="h-3 rounded-full relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${urgencyConfig.color}, color-mix(in srgb, ${urgencyConfig.color} 80%, white))`,
                        boxShadow: isPerformanceMode ? 'none' : `0 0 12px color-mix(in srgb, ${urgencyConfig.color} 60%, transparent)`,
                        width: `${progressPercentage}%`
                      }}
                      {...(!isPerformanceMode && {
                        initial: { width: 0 },
                        animate: { width: `${progressPercentage}%` },
                        transition: { duration: 0.8, ease: "easeOut" }
                      })}
                    >
                      {!isPerformanceMode && (
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
                    </MotionDiv>
                  </div>
                </div>
              </div>
            )}

            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-md mx-auto">
              {isActive && currentPhase ?
                `Phase ${currentPhase.name} • ${currentPhase.metabolicState}` :
                message.subtitle
              }
            </p>

            {message.encouragement && (
              <p className="text-white/60 text-sm italic">
                {message.encouragement}
              </p>
            )}
          </div>

          {contextualMetrics.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              {contextualMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 rounded-full metric-badge-enter"
                  style={{
                    background: `color-mix(in srgb, ${urgencyConfig.color} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${urgencyConfig.color} 25%, transparent)`,
                    color: urgencyConfig.color,
                    backdropFilter: isPerformanceMode ? 'none' : 'blur(8px) saturate(120%)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span className="font-medium">{metric}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bouton Principal */}
          <div className="flex justify-center">
            <button
              onClick={handleFastingAction}
              className={`px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-bold relative overflow-hidden rounded-full ${
                !isPerformanceMode && urgencyConfig.animation === 'pulse' && !reduceMotion ? 'btn-breathing-css' : ''
              }`}
              style={buttonStyles}
            >
              <div className="flex items-center justify-center gap-3">
                <SpatialIcon
                  Icon={ICONS[urgencyConfig.icon]}
                  size={24}
                  className="text-white"
                />
                <span>{message.buttonText}</span>
              </div>

              {!isPerformanceMode && urgencyConfig.priority === 'medium' && !reduceMotion && (
                <div
                  className="absolute inset-0 rounded-inherit pointer-events-none dynamic-shimmer-css"
                  style={{
                    background: `linear-gradient(90deg,
                      transparent 0%,
                      rgba(255,255,255,0.3) 50%,
                      transparent 100%
                    )`
                  }}
                />
              )}
            </button>
          </div>

          {/* Résumé contextuel sous le bouton */}
          {!isActive && (
            <div className="text-center mt-2">
              <p className="text-white/60 text-sm">
                Prêt à forger votre métabolisme
              </p>
            </div>
          )}

          {/* Métriques principales de la session active */}
          {isActive && currentPhase && session && (
            <div className="space-y-4 mt-6">
              {/* 4 Métriques Principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Phase Progress */}
                <div className="text-center p-3 rounded-xl" style={{
                  background: `color-mix(in srgb, ${currentPhase.color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${currentPhase.color} 25%, transparent)`
                }}>
                  <div className="text-xl font-bold text-white mb-1">
                    {Math.round(getPhaseProgress(elapsedHours, currentPhase))}%
                  </div>
                  <div className="text-xs font-medium" style={{ color: currentPhase.color }}>
                    Phase {currentPhase.name}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">Progression</div>
                </div>

                {/* Calories Burned */}
                <div className="text-center p-3 rounded-xl" style={{
                  background: 'color-mix(in srgb, #EF4444 12%, transparent)',
                  border: '1px solid color-mix(in srgb, #EF4444 25%, transparent)'
                }}>
                  <div className="text-xl font-bold text-red-400 mb-1">
                    {estimateCaloriesBurnedInPhase(currentPhase, elapsedHours, profile?.weight_kg || 70)}
                  </div>
                  <div className="text-red-300 text-xs font-medium">Calories</div>
                  <div className="text-white/50 text-xs mt-0.5">Brûlées</div>
                </div>

                {/* Metabolic State */}
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-sm font-bold text-white mb-1 truncate">
                    {currentPhase.metabolicState}
                  </div>
                  <div className="text-white/70 text-xs font-medium">État</div>
                  <div className="text-white/50 text-xs mt-0.5">Métabolique</div>
                </div>

                {/* Protocol */}
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-sm font-bold text-white mb-1 truncate">
                    {session.protocol}
                  </div>
                  <div className="text-white/70 text-xs font-medium">Protocole</div>
                  <div className="text-white/50 text-xs mt-0.5">Actif</div>
                </div>
              </div>

              {/* Message Motivationnel */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: `color-mix(in srgb, ${currentPhase.color} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${currentPhase.color} 20%, transparent)`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <SpatialIcon Icon={ICONS.Heart} size={14} style={{ color: currentPhase.color }} />
                  <span className="text-sm font-semibold" style={{ color: currentPhase.color }}>
                    Message de la Forge
                  </span>
                </div>
                <p className="text-white/85 text-sm leading-relaxed">
                  {getMotivationalMessage(currentPhase, elapsedHours)}
                </p>
              </div>

              {/* Bénéfices Actuels */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                  <SpatialIcon Icon={ICONS.Check} size={16} style={{ color: currentPhase.color }} />
                  Bénéfices Actuels
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentPhase.benefits.slice(0, 4).map((benefit: string, index: number) => (
                    <MotionDiv
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{
                        background: `color-mix(in srgb, ${currentPhase.color} 6%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${currentPhase.color} 15%, transparent)`
                      }}
                      {...(!isPerformanceMode && {
                        initial: { opacity: 0, x: -10 },
                        animate: { opacity: 1, x: 0 },
                        transition: { duration: 0.4, delay: index * 0.1 }
                      })}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: currentPhase.color }}
                      />
                      <span className="text-white/80 text-xs">{benefit}</span>
                    </MotionDiv>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default DynamicFastingCTA;
