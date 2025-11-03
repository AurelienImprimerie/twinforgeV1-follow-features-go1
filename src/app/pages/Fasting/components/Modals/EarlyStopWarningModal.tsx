import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import {
  validateFastingSession,
  getThresholdColor,
  getThresholdLabel,
  FASTING_THRESHOLDS,
  FastingValidationResult
} from '@/lib/nutrition/fastingValidation';
import { getCurrentFastingPhase, getNextFastingPhase } from '@/lib/nutrition/fastingPhases';
import { formatElapsedTime } from '../../utils/fastingUtils';

interface EarlyStopWarningModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  targetHours: number;
  onContinue: () => void;
  onStopAnyway: () => void;
  onCancel: () => void;
}

/**
 * Modal d'Avertissement pour Arrêt Prématuré du Jeûne
 * Affiche les bénéfices manqués et encourage à continuer
 */
const EarlyStopWarningModal: React.FC<EarlyStopWarningModalProps> = ({
  isOpen,
  elapsedSeconds,
  targetHours,
  onContinue,
  onStopAnyway,
  onCancel
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Calculer les métriques
  const elapsedHours = elapsedSeconds / 3600;
  const validation = validateFastingSession(elapsedHours, targetHours);
  const currentPhase = getCurrentFastingPhase(elapsedHours);
  const nextPhase = getNextFastingPhase(currentPhase);

  // Déterminer si la session peut être sauvegardée
  const canSave = validation.canSave;
  const isScientificallyValid = validation.isScientificallyValid;

  // Calculer le temps restant jusqu'à la fin du protocole
  const remainingHours = Math.max(0, targetHours - elapsedHours);
  const remainingMinutes = Math.round(remainingHours * 60);

  // Couleur dynamique basée sur la durée
  const thresholdColor = getThresholdColor(elapsedHours);
  const thresholdLabel = getThresholdLabel(elapsedHours);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  // Handle ESC key
  React.useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isPerformanceMode ? 'none' : 'blur(20px)'
        }}
        onClick={onCancel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="early-stop-warning-title"
      >
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 20 },
            transition: { type: 'spring', stiffness: 300, damping: 30 }
          })}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard
            className="p-6 md:p-8"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${thresholdColor} 15%, transparent) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, color-mix(in srgb, #EF4444 12%, transparent) 0%, transparent 50%),
                var(--glass-opacity)
              `,
              borderColor: `color-mix(in srgb, ${thresholdColor} 30%, transparent)`,
              boxShadow: isPerformanceMode
                ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                : `
                  0 20px 60px rgba(0, 0, 0, 0.5),
                  0 0 40px color-mix(in srgb, ${thresholdColor} 20%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2)
                `
            }}
          >
            <div className="space-y-6">
              {/* En-tête avec icône d'alerte */}
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, #F59E0B 40%, transparent), color-mix(in srgb, #EF4444 30%, transparent))`,
                    border: `2px solid color-mix(in srgb, #F59E0B 60%, transparent)`,
                    boxShadow: isPerformanceMode ? 'none' : `0 0 25px color-mix(in srgb, #F59E0B 50%, transparent)`
                  }}
                >
                  <SpatialIcon Icon={ICONS.AlertTriangle} size={32} className="text-amber-300" />
                </div>
                <div className="flex-1">
                  <h2 id="early-stop-warning-title" className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Terminer votre jeûne maintenant ?
                  </h2>
                  <p className="text-white/80 text-base">
                    Vous avez jeûné pendant <strong className="text-white">{formatElapsedTime(elapsedSeconds)}</strong>
                  </p>
                </div>
              </div>

              {/* État actuel vs Validation scientifique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${thresholdColor} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${thresholdColor} 25%, transparent)`
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <SpatialIcon Icon={ICONS.TrendingUp} size={16} style={{ color: thresholdColor }} />
                    <span className="text-sm font-semibold" style={{ color: thresholdColor }}>
                      État Actuel
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{thresholdLabel}</div>
                  <div className="text-sm text-white/70">Phase : {currentPhase.name}</div>
                  <div className="text-sm text-white/70">
                    Progression : {validation.completionPercentage.toFixed(0)}%
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: isScientificallyValid
                      ? 'color-mix(in srgb, #22C55E 8%, transparent)'
                      : 'color-mix(in srgb, #EF4444 8%, transparent)',
                    border: isScientificallyValid
                      ? '1px solid color-mix(in srgb, #22C55E 25%, transparent)'
                      : '1px solid color-mix(in srgb, #EF4444 25%, transparent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <SpatialIcon
                      Icon={isScientificallyValid ? ICONS.CheckCircle : ICONS.XCircle}
                      size={16}
                      className={isScientificallyValid ? 'text-green-400' : 'text-red-400'}
                    />
                    <span className={`text-sm font-semibold ${isScientificallyValid ? 'text-green-400' : 'text-red-400'}`}>
                      Validation Scientifique
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {isScientificallyValid ? 'Bénéfices Atteints' : 'Trop Court'}
                  </div>
                  <div className="text-sm text-white/70">
                    {isScientificallyValid
                      ? `Durée efficace ≥ ${FASTING_THRESHOLDS.MINIMUM_LIGHT}h`
                      : `Minimum recommandé : ${FASTING_THRESHOLDS.MINIMUM_LIGHT}h`}
                  </div>
                </div>
              </div>

              {/* Bénéfices manqués si arrêt prématuré */}
              {validation.benefitsMissed && validation.benefitsMissed.length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'color-mix(in srgb, #EF4444 8%, transparent)',
                    border: '1px solid color-mix(in srgb, #EF4444 25%, transparent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <SpatialIcon Icon={ICONS.AlertCircle} size={18} className="text-red-400" />
                    <span className="text-base font-semibold text-red-300">
                      Bénéfices Manqués si vous Arrêtez Maintenant
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {validation.benefitsMissed.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prochain palier à atteindre */}
              {validation.timeToNextThreshold && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'color-mix(in srgb, #06B6D4 8%, transparent)',
                    border: '1px solid color-mix(in srgb, #06B6D4 25%, transparent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <SpatialIcon Icon={ICONS.Target} size={18} className="text-cyan-400" />
                    <span className="text-base font-semibold text-cyan-300">
                      Prochain Palier dans {validation.timeToNextThreshold.hours.toFixed(1)}h
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mb-2">
                    Si vous continuez, vous atteindrez :
                  </p>
                  <ul className="space-y-1.5">
                    {validation.timeToNextThreshold.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-white/90">
                        <SpatialIcon Icon={ICONS.Check} size={14} className="text-cyan-400 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Phase suivante */}
              {nextPhase && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'color-mix(in srgb, #8B5CF6 8%, transparent)',
                    border: '1px solid color-mix(in srgb, #8B5CF6 25%, transparent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <SpatialIcon Icon={ICONS.ArrowRight} size={16} className="text-purple-400" />
                    <span className="text-sm font-semibold text-purple-300">
                      Prochaine Phase Métabolique
                    </span>
                  </div>
                  <div className="text-base font-bold text-white mb-1">{nextPhase.name}</div>
                  <div className="text-sm text-white/70 mb-2">
                    Dans {(nextPhase.startHours - elapsedHours).toFixed(1)}h
                  </div>
                  <p className="text-sm text-white/80">{nextPhase.description}</p>
                </div>
              )}

              {/* Temps restant jusqu'à l'objectif */}
              {remainingHours > 0 && (
                <div
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: 'color-mix(in srgb, #F59E0B 8%, transparent)',
                    border: '1px solid color-mix(in srgb, #F59E0B 25%, transparent)'
                  }}
                >
                  <div className="text-sm text-amber-300 font-medium mb-1">
                    Temps restant jusqu'à votre objectif
                  </div>
                  <div className="text-3xl font-black text-amber-400">
                    {remainingMinutes < 60
                      ? `${remainingMinutes} min`
                      : `${Math.floor(remainingHours)}h ${Math.round((remainingHours % 1) * 60)}m`}
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    Objectif : {targetHours}h
                  </div>
                </div>
              )}

              {/* Avertissement si session non sauvegardable */}
              {!canSave && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'color-mix(in srgb, #EF4444 12%, transparent)',
                    border: '2px solid color-mix(in srgb, #EF4444 40%, transparent)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <SpatialIcon Icon={ICONS.AlertTriangle} size={18} className="text-red-400" />
                    <span className="text-base font-bold text-red-300">
                      Attention : Session Non Sauvegardable
                    </span>
                  </div>
                  <p className="text-sm text-white/90">
                    Votre session est trop courte (moins de 30 minutes) et ne pourra pas être enregistrée.
                    Si vous arrêtez maintenant, aucune donnée ne sera sauvegardée.
                  </p>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Continuer le jeûne (recommandé) */}
                <button
                  onClick={onContinue}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg,
                      color-mix(in srgb, #22C55E 80%, transparent),
                      color-mix(in srgb, #10B981 60%, transparent)
                    )`,
                    border: '3px solid color-mix(in srgb, #22C55E 60%, transparent)',
                    boxShadow: isPerformanceMode
                      ? '0 12px 40px rgba(34, 197, 94, 0.4)'
                      : `
                        0 16px 50px color-mix(in srgb, #22C55E 50%, transparent),
                        0 0 80px color-mix(in srgb, #22C55E 40%, transparent),
                        inset 0 4px 0 rgba(255,255,255,0.5)
                      `,
                    color: '#fff'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <SpatialIcon Icon={ICONS.Play} size={24} />
                    <span>Continuer le Jeûne</span>
                  </div>
                </button>

                {/* Terminer quand même */}
                <button
                  onClick={onStopAnyway}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-base"
                  style={{
                    background: 'color-mix(in srgb, #EF4444 15%, transparent)',
                    border: '2px solid color-mix(in srgb, #EF4444 40%, transparent)',
                    color: '#fff'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <SpatialIcon Icon={ICONS.Square} size={20} />
                    <span>{canSave ? 'Terminer Quand Même' : 'Annuler Sans Sauvegarder'}</span>
                  </div>
                </button>
              </div>

              {/* Bouton retour discret */}
              <button
                onClick={onCancel}
                className="w-full py-2 text-sm text-white/60 hover:text-white/90 transition-colors"
              >
                Retour
              </button>
            </div>
          </GlassCard>
        </MotionDiv>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default EarlyStopWarningModal;
