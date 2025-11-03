import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { useFastingTimerTick } from '../../hooks/useFastingPipeline';
import EarlyStopWarningModal from '../Modals/EarlyStopWarningModal';
import { getThresholdColor, getThresholdLabel, FASTING_THRESHOLDS } from '@/lib/nutrition/fastingValidation';
import { getCurrentFastingPhase } from '@/lib/nutrition/fastingPhases';

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

interface FastingActiveStageProps {
  session: FastingSession | null;
  elapsedSeconds: number;
  progressPercentage: number;
  targetHours: number;
  onStopFasting: () => void;
  formatElapsedTime: (seconds: number) => string;
}

/**
 * Fasting Active Stage - Contrôles de Session Active (Pipeline)
 * Interface de contrôle simplifiée pour gérer une session de jeûne en cours
 *
 * RÔLE: Contrôles d'action uniquement (arrêter le jeûne)
 * Pour la visualisation détaillée, voir l'onglet Tracker
 */
const FastingActiveStage: React.FC<FastingActiveStageProps> = ({
  session,
  elapsedSeconds,
  progressPercentage,
  targetHours,
  onStopFasting,
  formatElapsedTime
}) => {
  // Enable real-time timer updates
  useFastingTimerTick();

  const { isPerformanceMode } = usePerformanceMode();
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Calculer les métriques en temps réel
  const elapsedHours = elapsedSeconds / 3600;
  const currentPhase = getCurrentFastingPhase(elapsedHours);
  const thresholdColor = getThresholdColor(elapsedHours);
  const thresholdLabel = getThresholdLabel(elapsedHours);

  // Calculer le temps jusqu'au prochain palier scientifique
  let nextThreshold = null;
  if (elapsedHours < FASTING_THRESHOLDS.MINIMUM_LIGHT) {
    nextThreshold = {
      hours: FASTING_THRESHOLDS.MINIMUM_LIGHT,
      remaining: FASTING_THRESHOLDS.MINIMUM_LIGHT - elapsedHours,
      label: 'Bénéfices Métaboliques'
    };
  } else if (elapsedHours < FASTING_THRESHOLDS.MINIMUM_MODERATE) {
    nextThreshold = {
      hours: FASTING_THRESHOLDS.MINIMUM_MODERATE,
      remaining: FASTING_THRESHOLDS.MINIMUM_MODERATE - elapsedHours,
      label: 'Cétose Active'
    };
  } else if (elapsedHours < FASTING_THRESHOLDS.MINIMUM_EFFECTIVE) {
    nextThreshold = {
      hours: FASTING_THRESHOLDS.MINIMUM_EFFECTIVE,
      remaining: FASTING_THRESHOLDS.MINIMUM_EFFECTIVE - elapsedHours,
      label: 'Optimal Scientifique'
    };
  } else if (elapsedHours < FASTING_THRESHOLDS.OPTIMAL_ADVANCED) {
    nextThreshold = {
      hours: FASTING_THRESHOLDS.OPTIMAL_ADVANCED,
      remaining: FASTING_THRESHOLDS.OPTIMAL_ADVANCED - elapsedHours,
      label: 'Cétose Profonde'
    };
  }

  const handleStopFasting = () => {
    setShowWarningModal(true);
  };

  const handleContinue = () => {
    setShowWarningModal(false);
  };

  const handleStopAnyway = () => {
    setShowWarningModal(false);
    onStopFasting();
  };

  const handleCancelModal = () => {
    setShowWarningModal(false);
  };

  return (
    <>
    <GlassCard
      className="p-6 md:p-8"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #EF4444 15%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #F59E0B 12%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #EF4444 30%, transparent)',
        boxShadow: isPerformanceMode
          ? `0 20px 60px rgba(0, 0, 0, 0.4)`
          : `
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 0 40px color-mix(in srgb, #EF4444 20%, transparent),
            0 0 80px color-mix(in srgb, #F59E0B 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.2)
          `,
        backdropFilter: isPerformanceMode ? 'none' : 'blur(28px) saturate(170%)'
      }}
    >
      <div className="space-y-6">
        {/* Header avec indicateur de session active */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${!isPerformanceMode ? 'breathing-icon' : ''}`}
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, #EF4444 40%, transparent), color-mix(in srgb, #F59E0B 30%, transparent))`,
                border: `2px solid color-mix(in srgb, #EF4444 60%, transparent)`,
                boxShadow: isPerformanceMode ? 'none' : `0 0 25px color-mix(in srgb, #EF4444 50%, transparent)`
              }}
            >
              <SpatialIcon
                Icon={ICONS.Timer}
                size={24}
                style={{ color: '#EF4444' }}
                variant="pure"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Session Active</h3>
              <p className="text-white/80 text-sm mt-0.5">
                Contrôles de la session en cours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Temps Écoulé avec Code Couleur */}
        <div className="text-center space-y-4">
          <div className="text-5xl md:text-6xl font-black" style={{ color: thresholdColor }}>
            {formatElapsedTime(elapsedSeconds)}
          </div>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: `color-mix(in srgb, ${thresholdColor} 15%, transparent)`,
              border: `2px solid color-mix(in srgb, ${thresholdColor} 40%, transparent)`
            }}
          >
            <span className="font-bold" style={{ color: thresholdColor }}>
              {thresholdLabel}
            </span>
          </div>
          <p className="text-white/70 text-base">
            Objectif : {session?.targetHours}h • {progressPercentage?.toFixed(1) || '0.0'}% accompli
          </p>

          {/* Barre de Progression avec Paliers */}
          <div className="max-w-md mx-auto space-y-2">
            {/* Indicateurs de paliers */}
            <div className="relative h-8 flex items-center justify-between px-1">
              {[8, 12, 16, 18].map((threshold) => {
                const isPassed = elapsedHours >= threshold;
                const isCurrent = elapsedHours >= threshold && elapsedHours < threshold + 2;
                return (
                  <div
                    key={threshold}
                    className="flex flex-col items-center"
                    style={{ position: 'absolute', left: `${(threshold / targetHours) * 100}%`, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        !isPerformanceMode && isCurrent ? 'animate-pulse' : ''
                      }`}
                      style={{
                        background: isPassed ? getThresholdColor(threshold) : '#FFFFFF20',
                        border: isPassed ? `2px solid ${getThresholdColor(threshold)}` : '2px solid #FFFFFF40',
                        boxShadow: !isPerformanceMode && isPassed ? `0 0 12px ${getThresholdColor(threshold)}80` : 'none'
                      }}
                    />
                    <span className="text-xs text-white/60 mt-1">{threshold}h</span>
                  </div>
                );
              })}
            </div>

            {/* Barre principale */}
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <MotionDiv
                className="h-4 rounded-full relative overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, ${thresholdColor}, ${getThresholdColor(elapsedHours + 2)})`,
                  boxShadow: isPerformanceMode ? 'none' : `0 0 16px ${thresholdColor}60`,
                  width: `${progressPercentage || 0}%`
                }}
                {...(!isPerformanceMode && {
                  initial: { width: 0 },
                  animate: { width: `${progressPercentage || 0}%` },
                  transition: { duration: 0.8, ease: "easeOut" }
                })}
              >
                {!isPerformanceMode && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg,
                        transparent 0%,
                        rgba(255,255,255,0.5) 50%,
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

        {/* Phase Métabolique Actuelle */}
        <div
          className="p-4 rounded-xl"
          style={{
            background: `color-mix(in srgb, ${currentPhase.color} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${currentPhase.color} 25%, transparent)`
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <SpatialIcon Icon={ICONS[currentPhase.icon as keyof typeof ICONS]} size={18} style={{ color: currentPhase.color }} />
            <span className="text-base font-semibold" style={{ color: currentPhase.color }}>
              {currentPhase.name}
            </span>
          </div>
          <p className="text-sm text-white/80 mb-2">{currentPhase.description}</p>
          <div className="text-xs text-white/70">État : {currentPhase.metabolicState}</div>
        </div>

        {/* Prochain Palier */}
        {nextThreshold && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'color-mix(in srgb, #06B6D4 8%, transparent)',
              border: '1px solid color-mix(in srgb, #06B6D4 25%, transparent)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SpatialIcon Icon={ICONS.Target} size={16} className="text-cyan-400" />
                  <span className="text-sm font-semibold text-cyan-300">Prochain Palier</span>
                </div>
                <div className="text-base font-bold text-white">{nextThreshold.label}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-cyan-400">
                  {nextThreshold.remaining < 1
                    ? `${Math.round(nextThreshold.remaining * 60)}m`
                    : `${nextThreshold.remaining.toFixed(1)}h`}
                </div>
                <div className="text-xs text-white/60">restantes</div>
              </div>
            </div>
          </div>
        )}

        {/* Message d'information */}
        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: 'color-mix(in srgb, #06B6D4 8%, transparent)',
            border: '1px solid color-mix(in srgb, #06B6D4 20%, transparent)'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <SpatialIcon Icon={ICONS.Info} size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">
              Suivi Détaillé
            </span>
          </div>
          <p className="text-white/75 text-sm leading-relaxed">
            Pour voir les métriques détaillées de votre session (phases métaboliques, calories, bénéfices),
            consultez l'onglet <strong className="text-white">Tracker</strong>.
          </p>
        </div>

        {/* Bouton d'Arrêt Principal */}
        <div className="flex justify-center">
          <button
            onClick={handleStopFasting}
            className="px-8 py-4 text-xl font-bold rounded-full relative overflow-hidden w-full md:w-auto"
            style={{
              background: `linear-gradient(135deg,
                color-mix(in srgb, #EF4444 80%, transparent),
                color-mix(in srgb, #F59E0B 60%, transparent)
              )`,
              border: '3px solid color-mix(in srgb, #EF4444 60%, transparent)',
              boxShadow: isPerformanceMode
                ? `0 16px 50px color-mix(in srgb, #EF4444 50%, transparent)`
                : `
                  0 16px 50px color-mix(in srgb, #EF4444 50%, transparent),
                  0 0 80px color-mix(in srgb, #EF4444 40%, transparent),
                  inset 0 4px 0 rgba(255,255,255,0.5)
                `,
              backdropFilter: isPerformanceMode ? 'none' : 'blur(24px) saturate(170%)',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <SpatialIcon Icon={ICONS.Square} size={24} className="text-white" />
              <span>Terminer le Jeûne</span>
            </div>
          </button>
        </div>
      </div>
    </GlassCard>

    {/* Modal d'Avertissement Enrichi */}
    <EarlyStopWarningModal
      isOpen={showWarningModal}
      elapsedSeconds={elapsedSeconds}
      targetHours={targetHours}
      onContinue={handleContinue}
      onStopAnyway={handleStopAnyway}
      onCancel={handleCancelModal}
    />
  </>
  );
};

export default FastingActiveStage;
