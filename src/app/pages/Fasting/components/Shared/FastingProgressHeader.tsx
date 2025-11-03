import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import GlassCard from '@/ui/cards/GlassCard';
import logger from '@/lib/utils/logger';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { useFastingElapsedSeconds, useFastingProgressPercentage, useFastingTimerTick } from '../../hooks/useFastingPipeline';

// Types pour la pipeline de jeûne
interface FastingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof ICONS;
  color: string;
}

interface FastingProgressHeaderProps {
  isActive: boolean;
  currentStep: string;
  overallProgress: number;
  message: string;
  subMessage?: string;
  steps: FastingStep[];
  elapsedTime?: string;
  targetHours?: number;
}

// Hook responsive SSR-safe
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches);
    onChange(mql);
    if ('addEventListener' in mql) mql.addEventListener('change', onChange as (e: MediaQueryListEvent) => void);
    else mql.addListener(onChange as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    return () => {
      if ('removeEventListener' in mql) mql.removeEventListener('change', onChange as (e: MediaQueryListEvent) => void);
      else mql.removeListener(onChange as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    };
  }, [breakpoint]);
  return isMobile;
}

const FastingProgressHeaderInner: React.FC<FastingProgressHeaderProps> = ({
  isActive,
  currentStep,
  overallProgress,
  message,
  subMessage,
  steps,
  elapsedTime,
  targetHours,
}) => {
  const isMobile = useIsMobile();
  const { isPerformanceMode } = usePerformanceMode();
  const lastLoggedRef = useRef<{ step: string; progress: number } | null>(null);

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Enable real-time timer updates
  useFastingTimerTick();

  // Use dynamic selectors for real-time updates when active
  const dynamicElapsedSeconds = useFastingElapsedSeconds();
  const dynamicProgressPercentage = useFastingProgressPercentage();
  
  // Use dynamic values if active, otherwise use passed values
  const actualElapsedSeconds = isActive ? dynamicElapsedSeconds : 0;
  const actualProgress = isActive ? dynamicProgressPercentage : overallProgress;

  // Couleurs spécifiques à la Forge du Temps (fasting)
  const forgeColors = {
    primary: '#F59E0B',      // Orange principal
    secondary: '#EF4444',    // Rouge secondaire
    accent: '#FBBF24',       // Jaune accent
    glow: 'rgba(245, 158, 11, 0.4)',
    glowEnhanced: 'rgba(245, 158, 11, 0.6)',
  };

  // Tailles d'icône adaptatives
  const iconContainerSize = isMobile ? '3.5rem' : '4.25rem';
  const iconSize = isMobile ? 26 : 36;

  // NaN guard pour la progression
  React.useEffect(() => {
    if (overallProgress != null && (!Number.isFinite(overallProgress) || Number.isNaN(overallProgress))) {
      logger.error('FASTING_PROGRESS_HEADER', 'Invalid progress detected', { 
        progress: overallProgress, 
        progressType: typeof overallProgress, 
        currentStep 
      });
    }
  }, [overallProgress, currentStep]);

  const currentStepData = useMemo(() => {
    return steps.find(step => step.id === currentStep) || {
      id: currentStep,
      title: message || 'Forge en cours',
      subtitle: subMessage || '',
      icon: 'Timer' as const,
      color: forgeColors.primary
    };
  }, [steps, currentStep, message, subMessage]);

  const currentStepIndex = useMemo(() => {
    const index = steps.findIndex(step => step.id === currentStep);
    return index >= 0 ? index : 0;
  }, [steps, currentStep]);

  const safeProgress = Number.isFinite(overallProgress) && !Number.isNaN(overallProgress)
    ? Math.max(0, Math.min(100, overallProgress))
    : 0;

  // Log compact pour le suivi
  React.useEffect(() => {
    const safePhaseProgress = Number.isFinite(safeProgress) ? Math.max(0, Math.min(100, safeProgress)) : 0;
    const current = { step: currentStep, progress: Math.floor(safePhaseProgress / 5) * 5 };
    const last = lastLoggedRef.current;
    if (!last || last.step !== current.step || last.progress !== current.progress) {
      lastLoggedRef.current = current;
      logger.info('FASTING_PROGRESS_HEADER', 'Forge progress update', {
        currentStep,
        phaseProgress: safePhaseProgress,
        overallProgress,
        message,
        subMessage,
        stepIndex: currentStepIndex,
        totalSteps: steps.length,
        elapsedTime,
        targetHours
      });
    }
  }, [currentStep, safeProgress, overallProgress, message, subMessage, steps.length, currentStepIndex, elapsedTime, targetHours]);

  if (!isActive) return null;

  return (
    <div className="w-full orbe-entrance-animation mt-2 md:mt-2">
      <GlassCard
        className="fasting-progress-container relative overflow-visible p-3 md:p-4 lg:p-5 w-full"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${forgeColors.primary} 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${forgeColors.secondary} 12%, transparent) 0%, transparent 50%),
            linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08)),
            rgba(11, 14, 23, 0.75)
          `,
          borderColor: `color-mix(in srgb, ${forgeColors.primary} 35%, transparent)`,
          boxShadow: isPerformanceMode
            ? '0 20px 60px rgba(0, 0, 0, 0.4)'
            : `
              0 20px 60px rgba(0, 0, 0, 0.4),
              0 0 40px color-mix(in srgb, ${forgeColors.primary} 20%, transparent),
              0 0 80px color-mix(in srgb, ${forgeColors.secondary} 18%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.25),
              inset 0 -2px 0 rgba(0, 0, 0, 0.15)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(28px) saturate(170%)',
          WebkitBackdropFilter: isPerformanceMode ? 'none' : 'blur(28px) saturate(170%)'
        }}
      >
        {/* Icône + contenu — centrés verticalement */}
        <div className="relative z-10 flex items-center gap-3 md:gap-3">
          {/* Colonne gauche : Icône de la Forge du Temps */}
          <div className="relative flex-shrink-0" style={{ width: 'fit-content' }}>
            <div
              className={`relative rounded-full flex items-center justify-center ${!isPerformanceMode ? 'breathing-icon' : ''}`}
              style={{
                width: iconContainerSize,
                height: iconContainerSize,
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  radial-gradient(circle at 70% 70%, color-mix(in srgb, ${forgeColors.primary} 20%, transparent) 0%, transparent 50%),
                  linear-gradient(135deg, color-mix(in srgb, ${forgeColors.primary} 45%, transparent), color-mix(in srgb, ${forgeColors.secondary} 35%, transparent))
                `,
                border: `3px solid color-mix(in srgb, ${forgeColors.primary} 70%, transparent)`,
                boxShadow: isPerformanceMode
                  ? 'none'
                  : `
                    0 0 ${isMobile ? '24px' : '36px'} color-mix(in srgb, ${forgeColors.primary} 60%, transparent),
                    0 0 ${isMobile ? '40px' : '64px'} color-mix(in srgb, ${forgeColors.primary} 40%, transparent),
                    inset 0 3px 0 rgba(255,255,255,0.4),
                    inset 0 -2px 0 rgba(0,0,0,0.2)
                  `,
                backdropFilter: isPerformanceMode ? 'none' : 'blur(18px) saturate(160%)',
                WebkitBackdropFilter: isPerformanceMode ? 'none' : 'blur(18px) saturate(160%)'
              }}
            >
              <SpatialIcon
                Icon={ICONS[currentStepData?.icon] || ICONS.Timer}
                size={iconSize}
                style={{
                  color: forgeColors.primary,
                  filter: isPerformanceMode
                    ? 'none'
                    : `
                      drop-shadow(0 0 8px color-mix(in srgb, ${forgeColors.primary} 80%, transparent))
                      drop-shadow(0 0 16px color-mix(in srgb, ${forgeColors.primary} 60%, transparent))
                    `
                }}
                glowColor={forgeColors.primary}
                variant="pure"
                aria-hidden
              />
            </div>
          </div>

          {/* Colonne droite : Contenu de la Forge */}
          <div className="flex-1 min-w-0">
            <div className="space-y-[6px] md:space-y-2">
              <h2
                className="font-bold leading-tight text-left"
                style={{
                  fontSize: isMobile ? 18 : 20,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  textShadow: isPerformanceMode ? 'none' : `0 0 6px color-mix(in srgb, ${forgeColors.primary} 14%, transparent)`
                }}
              >
                {message}
              </h2>
              {subMessage ? (
                <p className="text-xs md:text-sm font-medium leading-snug text-left" style={{ color: 'var(--text-muted)' }}>
                  {subMessage}
                </p>
              ) : null}
              
              {/* Temps écoulé si disponible */}
              {elapsedTime && (
                <p className="text-xs md:text-sm font-bold text-left" style={{ color: forgeColors.primary }}>
                  {elapsedTime} {targetHours && `/ ${targetHours}h`}
                </p>
              )}
            </div>

            {/* Ligne progression temporelle */}
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-[120px]">
                {steps.map((step, index) => {
                  const isCurrent = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;
                  return (
                    <div
                      key={step.id}
                      className="fasting-step-pill"
                      style={{
                        height: isMobile ? '6px' : '8px',
                        borderRadius: '999px',
                        flex: '1',
                        background: isCurrent
                          ? forgeColors.primary
                          : isCompleted
                          ? forgeColors.secondary
                          : `color-mix(in srgb, ${forgeColors.primary} 35%, transparent)`,
                        border: isCurrent
                          ? `2px solid color-mix(in srgb, ${forgeColors.primary} 80%, transparent)`
                          : isCompleted
                          ? `2px solid color-mix(in srgb, ${forgeColors.secondary} 70%, transparent)`
                          : `1px solid color-mix(in srgb, ${forgeColors.primary} 50%, transparent)`,
                        position: 'relative',
                        transition: 'all 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                        boxShadow: isPerformanceMode
                          ? 'none'
                          : isCurrent
                          ? `0 0 10px color-mix(in srgb, ${forgeColors.primary} 55%, transparent)`
                          : isCompleted
                          ? `0 0 9px color-mix(in srgb, ${forgeColors.secondary} 45%, transparent)`
                          : 'none'
                      }}
                    />
                  );
                })}
              </div>

              {/* % — MOBILE SEULEMENT */}
              <div className="text-right font-bold md:hidden" style={{ color: forgeColors.primary, fontSize: 14 }}>
                {Math.round(safeProgress)}%
              </div>

              {/* Étape X/Y — Desktop inline */}
              <div className="hidden md:block text-xs font-medium" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Forge {currentStepIndex + 1} / {steps.length}
              </div>
            </div>

            {/* Étape X/Y — MOBILE sous la barre */}
            <div className="mt-1 block md:hidden text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Forge {currentStepIndex + 1} / {steps.length}
            </div>
          </div>

          {/* Anneau de progression temporelle — Desktop */}
          <div className="relative flex-shrink-0 hidden md:flex" style={{ width: '52px', height: '52px' }} aria-hidden>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from -90deg,
                  ${forgeColors.primary} 0%,
                  ${forgeColors.primary} ${safeProgress * 3.6}deg,
                  color-mix(in srgb, ${forgeColors.secondary} 40%, transparent) ${safeProgress * 3.6}deg,
                  color-mix(in srgb, ${forgeColors.secondary} 40%, transparent) 360deg
                )`,
                mask: 'radial-gradient(circle at center, transparent 70%, black 75%, black 100%)',
                WebkitMask: 'radial-gradient(circle at center, transparent 70%, black 75%, black 100%)',
                boxShadow: isPerformanceMode
                  ? 'none'
                  : `0 0 18px color-mix(in srgb, ${forgeColors.primary} 48%, transparent), 0 0 36px color-mix(in srgb, ${forgeColors.primary} 28%, transparent)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: forgeColors.primary, fontSize: 15, fontWeight: 800 }}>
              {Math.round(safeProgress)}%
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const FastingProgressHeader = React.memo(FastingProgressHeaderInner);
export default FastingProgressHeader;