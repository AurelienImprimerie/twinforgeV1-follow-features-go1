import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import {
  getCurrentFastingPhase,
  getPhaseProgress,
  getMotivationalMessage,
  estimateCaloriesBurnedInPhase
} from '@/lib/nutrition/fastingPhases';
import { formatElapsedTime } from '@/app/pages/Fasting/utils/fastingUtils';
import { useFastingElapsedSeconds, useFastingProgressPercentage, useFastingTimerTick } from '../../hooks/useFastingPipeline';

interface FastingSession {
  id?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  targetHours: number;
  actualDurationHours?: number;
  protocol: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

interface FastingCurrentSessionCardProps {
  session: FastingSession;
  userWeight?: number;
}

/**
 * @deprecated Ce composant n'est plus utilisé.
 * Toutes ses fonctionnalités ont été intégrées dans DynamicFastingCTA.
 *
 * Fasting Current Session Card - Session Active en Temps Réel
 * Affiche les détails de la session de jeûne active avec phase métabolique
 *
 * REMPLACEMENT: Voir DynamicFastingCTA qui inclut maintenant:
 * - Timer en temps réel
 * - Progression globale
 * - 4 métriques principales (Phase, Calories, État métabolique, Protocole)
 * - Message motivationnel
 * - Bénéfices actuels de la phase
 */
const FastingCurrentSessionCard: React.FC<FastingCurrentSessionCardProps> = ({
  session,
  userWeight = 70
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion component
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Enable real-time timer updates
  useFastingTimerTick();

  // Use dynamic selectors for real-time updates
  const elapsedSeconds = useFastingElapsedSeconds();
  const progressPercentage = useFastingProgressPercentage();
  
  const elapsedHours = elapsedSeconds / 3600;
  const currentPhase = getCurrentFastingPhase(elapsedHours);
  const phaseProgress = getPhaseProgress(elapsedHours, currentPhase);
  const motivationalMessage = getMotivationalMessage(currentPhase, elapsedHours);
  const estimatedCalories = estimateCaloriesBurnedInPhase(currentPhase, elapsedHours, userWeight);

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
      })}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${currentPhase.color} 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #EF4444 12%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${currentPhase.color} 30%, transparent)`,
          boxShadow: isPerformanceMode
            ? '0 12px 40px rgba(0, 0, 0, 0.3)'
            : `
              0 16px 48px rgba(0, 0, 0, 0.3),
              0 0 40px color-mix(in srgb, ${currentPhase.color} 25%, transparent),
              0 0 80px color-mix(in srgb, #EF4444 15%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.2)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(24px) saturate(170%)'
        }}
      >
        <div className="space-y-6">
          {/* Header avec Phase Actuelle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${!isPerformanceMode ? 'breathing-icon' : ''}`}
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${currentPhase.color} 40%, transparent), color-mix(in srgb, ${currentPhase.color} 30%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${currentPhase.color} 60%, transparent)`,
                  boxShadow: isPerformanceMode ? 'none' : `0 0 25px color-mix(in srgb, ${currentPhase.color} 50%, transparent)`
                }}
              >
                <SpatialIcon
                  Icon={ICONS[currentPhase.icon]}
                  size={20}
                  style={{ color: currentPhase.color }}
                  variant="pure"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Session Active</h3>
                <p className="text-white/80 text-sm mt-0.5">
                  Phase {currentPhase.name} • {session.protocol}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-3 h-3 rounded-full ${!isPerformanceMode ? 'animate-pulse' : ''}`}
                  style={{
                    background: '#EF4444',
                    boxShadow: isPerformanceMode ? 'none' : '0 0 8px #EF444460'
                  }}
                />
                <span className="text-red-300 text-sm font-medium">En cours</span>
              </div>
            </div>
          </div>

          {/* Temps Écoulé et Progression */}
          <div className="text-center space-y-4">
            <div>
              <div className="text-5xl font-black text-white mb-2">
                {formatElapsedTime(elapsedSeconds)}
              </div>
              <p className="text-white/70 text-lg">
                Objectif : {session.targetHours}h • {progressPercentage.toFixed(1)}% accompli
              </p>
            </div>

            {/* Barre de Progression Globale */}
            <div className="max-w-md mx-auto">
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <MotionDiv
                  className="h-3 rounded-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg, #EF4444, #F59E0B)`,
                    boxShadow: isPerformanceMode ? 'none' : `0 0 12px color-mix(in srgb, #EF4444 60%, transparent)`,
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

          {/* Métriques de la Phase Actuelle */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Phase Progress */}
            <div className="text-center p-4 rounded-xl" style={{
              background: `color-mix(in srgb, ${currentPhase.color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${currentPhase.color} 25%, transparent)`
            }}>
              <div className="text-2xl font-bold text-white mb-1">
                {Math.round(phaseProgress)}%
              </div>
              <div className="text-sm font-medium" style={{ color: currentPhase.color }}>
                Phase {currentPhase.name}
              </div>
              <div className="text-white/50 text-xs mt-1">Progression</div>
            </div>

            {/* Calories Burned */}
            <div className="text-center p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #EF4444 12%, transparent)',
              border: '1px solid color-mix(in srgb, #EF4444 25%, transparent)'
            }}>
              <div className="text-2xl font-bold text-red-400 mb-1">
                {estimatedCalories}
              </div>
              <div className="text-red-300 text-sm font-medium">Calories</div>
              <div className="text-white/50 text-xs mt-1">Brûlées</div>
            </div>

            {/* Metabolic State */}
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10 md:col-span-1 col-span-2">
              <div className="text-lg font-bold text-white mb-1">
                {currentPhase.metabolicState}
              </div>
              <div className="text-white/70 text-sm font-medium">État Métabolique</div>
              <div className="text-white/50 text-xs mt-1">Actuel</div>
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
              {motivationalMessage}
            </p>
          </div>

          {/* Bénéfices de la Phase Actuelle */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Check} size={16} style={{ color: currentPhase.color }} />
              Bénéfices Actuels
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPhase.benefits.slice(0, 4).map((benefit, index) => (
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
                  <span className="text-white/80 text-sm">{benefit}</span>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingCurrentSessionCard;