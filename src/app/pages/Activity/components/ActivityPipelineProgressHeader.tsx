import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

export interface ActivityProgressStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof ICONS;
  color: string;
}

interface ActivityPipelineProgressHeaderProps {
  steps: ActivityProgressStep[];
  currentStepId: string;
  progress: number;
  message: string;
  subMessage: string;
  className?: string;
}

const STEP_ICONS: Record<string, keyof typeof ICONS> = {
  capture: 'Camera',
  analysis: 'Scan',
  review: 'Eye',
  complete: 'Check',
};

const ActivityPipelineProgressHeader: React.FC<ActivityPipelineProgressHeaderProps> = ({
  steps,
  currentStepId,
  progress,
  message,
  subMessage,
  className = '',
}) => {
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  const currentStepIndex = Math.max(0, steps.findIndex(s => s.id === currentStepId));
  const currentIcon = STEP_ICONS[currentStepId] || 'Activity';

  return (
    <div className={className} style={{ width: '100%', marginTop: '0.75rem', marginBottom: '1rem' }}>
      <GlassCard
        style={{
          padding: '24px 20px',
          background: `
            radial-gradient(680px 150px at 12% 0%, color-mix(in srgb, #3B82F6 8%, transparent), transparent 60%),
            var(--glass-opacity, rgba(12,16,28,.35))
          `,
          borderColor: 'color-mix(in srgb, #3B82F6 26%, rgba(255,255,255,.06))',
          boxShadow: `
            0 10px 36px rgba(0, 0, 0, 0.30),
            0 0 28px color-mix(in srgb, #3B82F6 22%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `,
          borderRadius: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Icône du Step */}
          <div
            style={{
              flexShrink: 0,
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `
                radial-gradient(60% 60% at 30% 30%, rgba(255,255,255,0.20), transparent 60%),
                linear-gradient(140deg,
                  color-mix(in srgb, #06B6D4 42%, transparent),
                  color-mix(in srgb, #3B82F6 26%, transparent)
                )
              `,
              border: '2px solid color-mix(in srgb, #3B82F6 64%, transparent)',
              boxShadow: `
                inset 0 2px 0 rgba(255,255,255,0.35),
                inset 0 -2px 0 rgba(0,0,0,0.25),
                0 0 36px color-mix(in srgb, #3B82F6 42%, transparent)
              `
            }}
          >
            {/* Halo */}
            <div
              style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, #06B6D4 20%, transparent), transparent 65%)',
                filter: 'blur(10px)',
                opacity: 0.85,
                pointerEvents: 'none'
              }}
            />
            {/* Icône */}
            <SpatialIcon
              Icon={ICONS[currentIcon]}
              size={26}
              style={{
                color: '#fff',
                filter: 'drop-shadow(0 2px 10px rgba(59, 130, 246, 0.5)) drop-shadow(0 0 4px rgba(0,0,0,0.35))',
                position: 'relative',
                zIndex: 1
              }}
            />
          </div>

          {/* Contenu Central */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Titre et Sous-titre */}
            <h2
              style={{
                margin: '0 0 8px 0',
                fontWeight: 800,
                fontSize: '19px',
                lineHeight: 1.15,
                color: '#fff',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {message || 'Forge Énergétique'}
            </h2>
            {subMessage && (
              <p
                style={{
                  margin: '0 0 12px 0',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: 1.3,
                  color: 'rgba(255,255,255,0.66)',
                  letterSpacing: '0.005em'
                }}
              >
                {subMessage}
              </p>
            )}

            {/* Barre de Progression */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
                gap: '14px',
                alignItems: 'center',
                marginBottom: '8px'
              }}
              role="progressbar"
              aria-valuenow={Math.round(safeProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {steps.map((step, i) => {
                const completed = i < currentStepIndex;
                const current = i === currentStepIndex;
                const stepSize = 100 / steps.length;
                const stepStart = i * stepSize;
                const stepEnd = (i + 1) * stepSize;

                let width = '0%';
                if (completed) {
                  width = '100%';
                } else if (current) {
                  const progressInStep = Math.max(0, Math.min(100, ((safeProgress - stepStart) / stepSize) * 100));
                  width = `${progressInStep}%`;
                }

                const segmentBg = i % 2 === 0
                  ? 'color-mix(in srgb, #3B82F6 38%, rgba(255,255,255,0.12))'
                  : 'color-mix(in srgb, #06B6D4 38%, rgba(255,255,255,0.12))';

                const fillGradient = i % 2 === 0
                  ? 'linear-gradient(90deg, #3B82F6, color-mix(in srgb, #3B82F6 60%, transparent))'
                  : 'linear-gradient(90deg, #06B6D4, color-mix(in srgb, #06B6D4 60%, transparent))';

                const glowColor = i % 2 === 0 ? '#3B82F6' : '#06B6D4';

                return (
                  <div
                    key={step.id}
                    style={{
                      position: 'relative',
                      height: '8px',
                      borderRadius: '999px',
                      background: segmentBg,
                      overflow: 'hidden',
                      boxShadow: (completed || current)
                        ? `0 0 10px color-mix(in srgb, ${glowColor} 35%, transparent)`
                        : 'none',
                      transition: 'box-shadow 240ms ease'
                    }}
                  >
                    {(completed || current) && (
                      <motion.div
                        style={{
                          position: 'absolute',
                          inset: '0 auto 0 0',
                          height: '100%',
                          borderRadius: '999px',
                          background: fillGradient,
                          boxShadow: '0 0 8px rgba(0,0,0,0.1)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Label Step */}
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: 'rgba(255,255,255,0.56)'
              }}
            >
              Forge {currentStepIndex + 1} / {steps.length}
            </div>
          </div>

          {/* Pourcentage */}
          <div
            style={{
              flexShrink: 0,
              fontWeight: 800,
              fontSize: '18px',
              color: 'color-mix(in srgb, #06B6D4 82%, white 18%)',
              textShadow: '0 0 10px color-mix(in srgb, #3B82F6 28%, transparent)',
              minWidth: '50px',
              textAlign: 'right'
            }}
            aria-hidden="true"
          >
            {Math.round(safeProgress)}%
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ActivityPipelineProgressHeader;
