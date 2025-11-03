import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import React from 'react';
import { ICONS } from '../../../../../ui/icons/registry';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';

interface AnalysisIconProps {
  progress: number;
}

const AnalysisIcon: React.FC<AnalysisIconProps> = ({ progress }) => {
  const perf = useActivityPerformance();

  const forgeColors = {
    primary: '#3B82F6',
    secondary: '#06B6D4',
  };

  return (
    <div
      style={{
        width: '5rem',
        height: '5rem',
        margin: '0 auto 1.5rem',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-0.75rem',
          width: '6.5rem',
          height: '6.5rem',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
            radial-gradient(circle at 70% 70%, color-mix(in srgb, ${forgeColors.secondary} 15%, transparent) 0%, transparent 50%),
            linear-gradient(135deg, color-mix(in srgb, ${forgeColors.primary} 30%, transparent), color-mix(in srgb, ${forgeColors.primary} 25%, transparent))
          `,
          border: `3px solid color-mix(in srgb, ${forgeColors.primary} 50%, transparent)`,
          boxShadow: `
            0 0 25px color-mix(in srgb, ${forgeColors.primary} 35%, transparent),
            inset 0 2px 0 rgba(255,255,255,0.3)
          `,
          pointerEvents: 'none',
          animation: perf.enablePulseEffects ? 'analysisIconPulse 3s ease-in-out infinite' : 'none',
          transform: 'translateZ(0)',
        }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
            linear-gradient(135deg, color-mix(in srgb, ${forgeColors.primary} 25%, transparent), color-mix(in srgb, ${forgeColors.secondary} 20%, transparent))
          `,
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          transform: 'translateZ(0)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <SpatialIcon
          Icon={ICONS.Zap}
          size={32}
          style={{
            color: '#FFFFFF',
            filter: perf.enableGlows ? `
              drop-shadow(0 0 12px color-mix(in srgb, ${forgeColors.primary} 90%, transparent))
              drop-shadow(0 0 24px color-mix(in srgb, ${forgeColors.primary} 70%, transparent))
              drop-shadow(0 0 36px color-mix(in srgb, ${forgeColors.secondary} 50%, transparent))
            ` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
          variant="pure"
        />
      </div>
      <style>{`
        @keyframes analysisIconPulse {
          0%, 100% {
            transform: scale(1) translateZ(0);
            box-shadow:
              0 0 25px color-mix(in srgb, ${forgeColors.primary} 35%, transparent),
              inset 0 2px 0 rgba(255,255,255,0.3);
          }
          50% {
            transform: scale(1.03) translateZ(0);
            box-shadow:
              0 0 30px color-mix(in srgb, ${forgeColors.primary} 45%, transparent),
              inset 0 2px 0 rgba(255,255,255,0.35);
          }
        }
      `}</style>
    </div>
  );
};

export default AnalysisIcon;
