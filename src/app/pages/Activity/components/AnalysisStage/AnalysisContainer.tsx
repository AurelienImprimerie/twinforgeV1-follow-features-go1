import GlassCard from '../../../../../ui/cards/GlassCard';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import AnalysisIcon from './AnalysisIcon';
import AnalysisProgress from './AnalysisProgress';
import AnalysisModules from './AnalysisModules';
import AnalysisEffects from './AnalysisEffects';
import React from 'react';

interface AnalysisContainerProps {
  isProcessing: boolean;
  progress: number;
  currentMessage: string;
  subMessage?: string;
}

const AnalysisContainer: React.FC<AnalysisContainerProps> = ({
  isProcessing,
  progress,
  currentMessage,
  subMessage
}) => {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <GlassCard
        style={{
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 8%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #06B6D4 6%, transparent) 0%, transparent 50%),
            linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06)),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #3B82F6 25%, transparent)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.35),
            0 0 25px color-mix(in srgb, #3B82F6 12%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.20)
          `,
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        <AnalysisEffects />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <AnalysisIcon progress={progress} />

          <div style={{ marginBottom: '1.5rem' }}>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}
            >
              {currentMessage || "Analyse de Forge en Cours"}
            </h2>
            <p
              style={{
                fontSize: '1.125rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6,
                maxWidth: '32rem',
                margin: '0 auto',
              }}
            >
              {subMessage || "Votre empreinte énergétique est en cours de traitement par la Forge Spatiale"}
            </p>

            <AnalysisProgress progress={progress} />
          </div>

          <AnalysisModules progress={progress} />
        </div>
      </GlassCard>
    </div>
  );
};

export default AnalysisContainer;