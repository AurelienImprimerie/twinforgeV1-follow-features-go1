import React from 'react';
import { ConditionalMotion } from '../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../hooks/useBodyScanPerformance';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import type { ProgressStep } from '../../../system/store/progressStore';
import s from './BodyScanProgressHeader.module.css';

interface BodyScanProgressHeaderProps {
  steps: ProgressStep[];
  currentStepId: string;
  progress: number;
  message: string;
  subMessage: string;
  className?: string;
}

const STEP_ICONS: Record<string, keyof typeof ICONS> = {
  capture: 'Camera',
  processing: 'Scan',
  review: 'Eye',
  complete: 'Check',
};

const BodyScanProgressHeader: React.FC<BodyScanProgressHeaderProps> = ({
  steps,
  currentStepId,
  progress,
  message,
  subMessage,
  className = '',
}) => {
  const performanceConfig = useBodyScanPerformance();
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  const stepSize = 100 / steps.length;
  const currentStepIndex = Math.max(0, steps.findIndex(s => s.id === currentStepId));
  const stepStart = currentStepIndex * stepSize;

  // Calculate percentage within current step
  // If progress is 0, show at least some progress for the current step
  let pctInStep = 0;
  if (safeProgress > 0) {
    pctInStep = Math.max(0, Math.min(1, (safeProgress - stepStart) / stepSize));
  } else if (currentStepIndex > 0) {
    // If we're in a step but progress is 0, show minimal progress (5%)
    pctInStep = 0.05;
  }

  const currentIcon = STEP_ICONS[currentStepId] || 'Scan';

  return (
    <div className={`${s.wrap} ${className}`} data-step={currentStepId}>
      <GlassCard className={s.card}>
        <div className={s.grid} data-body-forge>
          {/* Col 1 — Icône (centrée verticalement) */}
          <div className={s.icon}>
            <div className={s.iconHalo} />
            <SpatialIcon
              Icon={ICONS[currentIcon]}
              size={26}
              className={s.iconGlyph}
            />
          </div>

          {/* Col 2 — Titre / Barre / Étape */}
          <div className={s.center}>
            <h2 className={s.title}>{message || 'Forge Corporelle'}</h2>
            {subMessage && (
              <p className={s.subtitle}>{subMessage}</p>
            )}

            <div
              className={s.rail}
              role="progressbar"
              aria-valuenow={Math.round(safeProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {steps.map((step, i) => {
                const completed = i < currentStepIndex;
                const current = i === currentStepIndex;
                const width = completed ? '100%' : current ? `${pctInStep * 100}%` : '0%';

                const themeClass = i % 2 === 0 ? s.segPurple : s.segPurpleLight;
                const fillTheme = i % 2 === 0 ? s.fillPurple : s.fillPurpleLight;

                return (
                  <div
                    key={step.id}
                    className={`${s.seg} ${themeClass} ${completed ? s.isComplete : ''} ${current ? s.isCurrent : ''}`}
                  >
                    {(completed || current) && (
                      <ConditionalMotion
                        as="span"
                        className={`${s.fill} ${fillTheme}`}
                        initial={performanceConfig.enableInitialAnimations ? { width: 0 } : false}
                        animate={{ width }}
                        transition={performanceConfig.enableFramerMotion ? { duration: 0.3, ease: 'easeOut' } : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={s.step}>Étape {currentStepIndex + 1} sur {steps.length}</div>
          </div>

          {/* Col 3 — % aligné sur la barre */}
          <div className={s.percent} aria-hidden="true">
            {Math.round(safeProgress)}%
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default BodyScanProgressHeader;
