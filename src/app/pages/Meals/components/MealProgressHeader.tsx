import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import s from './MealProgressHeader.module.css';

type MealScanStep = 'capture' | 'processing' | 'results';

interface MealProgressHeaderProps {
  currentStep: MealScanStep;
  progress: number;
  message?: string;
  subMessage?: string;
  celebrationActive?: boolean;
}

const STEPS: { id: MealScanStep; title: string }[] = [
  { id: 'capture',    title: 'Capture'   },
  { id: 'processing', title: 'Analyse'   },
  { id: 'results',    title: 'Résultats' },
];

const STEP_ICONS: Record<MealScanStep, keyof typeof ICONS> = {
  capture:    'Camera',
  processing: 'Scan',
  results:    'Check',
};

export default function MealProgressHeader({
  currentStep,
  progress,
  message,
  subMessage,
}: MealProgressHeaderProps) {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionSpan = isPerformanceMode ? 'span' : motion.span;
  const safe = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  const stepSize = 100 / STEPS.length;
  const idx = Math.max(0, STEPS.findIndex(s => s.id === currentStep));
  const stepStart = idx * stepSize;
  const pctInStep = Math.max(0, Math.min(1, (safe - stepStart) / stepSize));
  const icon = STEP_ICONS[currentStep] ?? 'Camera';

  return (
    <div className={s.wrap}>
      <GlassCard className={s.card}>
        {/* Grille: [icone] [contenu] [pourcentage] */}
        <div className={s.grid} data-dph>
          {/* Col 1 — Icône (centrée verticalement) */}
          <div className={s.icon}>
            <div className={s.iconHalo} />
            <SpatialIcon Icon={ICONS[icon]} size={26} className={s.iconGlyph} />
          </div>

          {/* Col 2 — Titre / Barre / Étape */}
          <div className={s.center}>
            <h2 className={s.title}>{message || 'Capture Nutritionnelle'}</h2>
            {subMessage && (
              <p className={s.subtitle}>{subMessage}</p>
            )}

            <div
              className={s.rail}
              role="progressbar"
              aria-valuenow={Math.round(safe)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {STEPS.map((seg, i) => {
                const completed = i < idx;
                const current = i === idx;
                const width = completed ? '100%' : current ? `${pctInStep * 100}%` : '0%';
                const themeClass = i === 0 ? s.segGreen : s.segCyan;
                const fillTheme = i === 0 ? s.fillGreen : s.fillCyan;

                return (
                  <div
                    key={seg.id}
                    className={`${s.seg} ${themeClass} ${completed ? s.isComplete : ''} ${current ? s.isCurrent : ''}`}
                  >
                    {(completed || current) && (
                      <MotionSpan
                        className={`${s.fill} ${fillTheme}`}
                        {...(!isPerformanceMode && {
                          initial: { width: 0 },
                          animate: { width },
                          transition: { duration: 0.45, ease: 'easeOut' }
                        })}
                        style={isPerformanceMode ? { width } : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={s.step}>Étape {idx + 1} sur {STEPS.length}</div>
          </div>

          {/* Col 3 — % aligné sur la barre */}
          <div className={s.percent} aria-hidden="true">
            {Math.round(safe)}%
          </div>
        </div>
      </GlassCard>
    </div>
  );
}