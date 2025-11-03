import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import { ConditionalMotionActivity } from '../shared/ConditionalMotionActivity';
import React from 'react';

interface AnalysisProgressProps {
  progress: number;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ progress }) => {
  const perf = useActivityPerformance();
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      style={{
        margin: '2rem auto',
        maxWidth: '36rem',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <ConditionalMotionActivity
          style={{
            height: '100%',
            borderRadius: '9999px',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
            boxShadow: `
              0 0 12px color-mix(in srgb, #3B82F6 40%, transparent),
              inset 0 1px 0 rgba(255,255,255,0.3)
            `,
            transform: 'translateZ(0)',
            width: `${safeProgress}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{
            duration: perf.transitionDuration * 1.5,
            ease: "easeOut"
          }}
          fallback={
            <div
              style={{
                height: '100%',
                borderRadius: '9999px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
                boxShadow: `
                  0 0 12px color-mix(in srgb, #3B82F6 40%, transparent),
                  inset 0 1px 0 rgba(255,255,255,0.3)
                `,
                transform: 'translateZ(0)',
                width: `${safeProgress}%`,
                transition: `width ${perf.transitionDuration * 1.5}s ease-out`
              }}
            >
              {perf.enableShimmers && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                    pointerEvents: 'none',
                    animation: 'progressShimmer 2.5s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          }
        >
          {perf.enableShimmers && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                pointerEvents: 'none',
                animation: 'progressShimmer 2.5s ease-in-out infinite',
              }}
            />
          )}
        </ConditionalMotionActivity>
      </div>
      <span
        style={{
          display: 'block',
          marginTop: '0.75rem',
          textAlign: 'center',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#fff',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(safeProgress)}%
      </span>
      <style>{`
        @keyframes progressShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default AnalysisProgress;
