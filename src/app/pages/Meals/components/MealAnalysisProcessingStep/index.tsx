import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import logger from '../../../../../lib/utils/logger';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import AnalysisViewport from './AnalysisViewport';
import ProgressDisplay from './ProgressDisplay';
import DataFlowVisualization from './DataFlowVisualization';
import MealProgressHeader from '../MealProgressHeader';

interface CapturedMealPhoto {
  file: File;
  url: string;
  validationResult: {
    isValid: boolean;
    issues: string[];
    confidence: number;
  };
  captureReport: any;
}

interface MealAnalysisProcessingStepProps {
  capturedPhoto: CapturedMealPhoto | null;
  progress: number;
  progressMessage: string;
  progressSubMessage: string;
}

/**
 * Meal Analysis Processing Step - VisionOS 26 Optimized
 * Analyse immersive du repas avec animations TwinForge
 */
const MealAnalysisProcessingStep: React.FC<MealAnalysisProcessingStepProps> = ({
  capturedPhoto,
  progress,
  progressMessage,
  progressSubMessage,
}) => {
  const [analysisZones, setAnalysisZones] = useState<Array<{ x: number; y: number; intensity: number; id: string }>>([]);
  const [currentPhase, setCurrentPhase] = useState<'detection' | 'analysis' | 'calculation'>('detection');

  // Couleur TwinForge pour l'analyse nutritionnelle
  const analysisColor = '#10B981'; // Vert émeraude pour la nutrition

  // Génération de zones d'analyse aléatoires pour simuler l'IA
  useEffect(() => {
    const generateZones = () => {
      const zones = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        intensity: Math.random() * 0.6 + 0.4,
        id: `zone-${Date.now()}-${i}`
      }));
      setAnalysisZones(zones);
    };
    
    generateZones();
    const interval = setInterval(generateZones, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Simulation des phases d'analyse
  useEffect(() => {
    const phases = ['detection', 'analysis', 'calculation'] as const;
    let phaseIndex = 0;
    
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setCurrentPhase(phases[phaseIndex]);
      
      logger.debug('MEAL_ANALYSIS', 'Analysis phase changed', {
        phase: phases[phaseIndex],
        timestamp: new Date().toISOString()
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  if (!capturedPhoto) {
    return null;
  }

  return (
    <div className="space-y-6 w-full meal-processing-enter">
      {/* MealProgressHeader au-dessus de tout */}
      <MealProgressHeader
        currentStep="processing"
        progress={progress}
        message={progressMessage}
        subMessage={progressSubMessage}
      />
      
      {/* Photo d'Analyse Principale */}
      <div>
        <AnalysisViewport
          capturedPhoto={capturedPhoto}
          analysisZones={analysisZones}
          currentPhase={currentPhase}
          analysisColor={analysisColor}
        />
      </div>

      {/* Informations de Progression */}
      <div>
        <ProgressDisplay
          currentProgress={progress}
          currentMessage={progressMessage}
          currentSubMessage={progressSubMessage}
          currentPhase={currentPhase}
          analysisColor={analysisColor}
        />
      </div>

      {/* Flux de Données Visuels */}
      <DataFlowVisualization analysisColor={analysisColor} />
    </div>
  );
};

export default MealAnalysisProcessingStep;