import AnalysisContainer from './AnalysisContainer';
import AnalysisInfo from './AnalysisInfo';
import AnalysisStatus from './AnalysisStatus';
import React from 'react';

interface AnalysisStageProps {
  isProcessing: boolean;
  progress: number;
  currentMessage: string;
  subMessage?: string;
}

/**
 * Analysis Stage - Analyse de Forge Énergétique TwinForge
 * Interface d'analyse immersive pendant le traitement de l'empreinte énergétique
 */
const AnalysisStage: React.FC<AnalysisStageProps> = ({ 
  isProcessing, 
  progress, 
  currentMessage, 
  subMessage 
}) => {
  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Conteneur Principal d'Analyse */}
      <AnalysisContainer
        isProcessing={isProcessing}
        progress={progress}
        currentMessage={currentMessage}
        subMessage={subMessage}
      />

      {/* Zone de Focus Énergétique */}
      <AnalysisStatus
        progress={progress}
        currentMessage={currentMessage}
        subMessage={subMessage}
      />

      {/* Conseils de la Forge Spatiale */}
      <AnalysisInfo />

      {/* Animations CSS personnalisées */}
      <style>{`
        @keyframes energyScanVertical {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          10%, 90% { opacity: 0.6; }
          50% { transform: translateY(0); opacity: 1; }
        }

        @keyframes energyParticleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          25% { transform: translateY(-8px) scale(1.2); opacity: 1; }
          50% { transform: translateY(-4px) scale(0.9); opacity: 0.8; }
          75% { transform: translateY(-12px) scale(1.1); opacity: 1; }
        }

        @keyframes energyGridPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }

        @keyframes energyPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }

        @keyframes energyShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes energyFlow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AnalysisStage;