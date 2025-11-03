import logger from '../../../../lib/utils/logger';
import type { FridgeScanPipelineState } from '../types';

export const createProgressActions = (
  set: (partial: Partial<FridgeScanPipelineState>) => void,
  get: () => FridgeScanPipelineState
) => ({
  startProgressSimulation: (steps: Array<{ message: string; duration: number; icon: string }>, phaseStartPercentage: number, phaseEndPercentage: number) => {
    const state = get();
    
    // Clear any existing simulation
    state.stopProgressSimulation();
    
    logger.info('FRIDGE_SCAN_PIPELINE', 'Starting progress simulation', {
      sessionId: state.currentSessionId,
      stepsCount: steps.length,
      phaseStartPercentage,
      phaseEndPercentage,
      timestamp: new Date().toISOString()
    });
    
    let stepIndex = 0;
    set({
      simulatedLoadingStep: 0,
      simulatedScanProgress: 0,
      simulatedOverallProgress: phaseStartPercentage
    });
    
    const runLoadingSequence = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        set({ simulatedLoadingStep: stepIndex });
        
        const stepProgressIncrement = 100 / (step.duration / 100);
        let stepProgress = 0;
        
        const progressInterval = setInterval(() => {
          stepProgress += stepProgressIncrement;
          const clampedStepProgress = Math.min(100, stepProgress);
          
          // Calculate overall progress by interpolating step progress within phase
          const stepWeight = 1 / steps.length;
          const stepStartInPhase = (stepIndex / steps.length) * 100;
          const stepEndInPhase = ((stepIndex + 1) / steps.length) * 100;
          const stepProgressInPhase = stepStartInPhase + (clampedStepProgress / 100) * stepWeight * 100;
          
          const overallProgress = phaseStartPercentage + (stepProgressInPhase / 100) * (phaseEndPercentage - phaseStartPercentage);
          
          set({
            simulatedScanProgress: clampedStepProgress,
            simulatedOverallProgress: Math.min(phaseEndPercentage, overallProgress)
          });
          
          if (clampedStepProgress >= 100) {
            clearInterval(progressInterval);
            stepIndex++;
            
            const nextStepTimeout = setTimeout(() => {
              runLoadingSequence();
            }, 200);
            
            set({ progressTimeoutId: nextStepTimeout });
          }
        }, 100);
        
        set({ progressIntervalId: progressInterval });
      } else {
        // All steps completed
        set({
          simulatedScanProgress: 100,
          simulatedOverallProgress: phaseEndPercentage,
          progressIntervalId: null,
          progressTimeoutId: null
        });
        
        logger.info('FRIDGE_SCAN_PIPELINE', 'Progress simulation completed', {
          sessionId: state.currentSessionId,
          finalOverallProgress: phaseEndPercentage,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    runLoadingSequence();
  },

  stopProgressSimulation: () => {
    const state = get();
    
    if (state.progressIntervalId) {
      clearInterval(state.progressIntervalId);
    }
    
    if (state.progressTimeoutId) {
      clearTimeout(state.progressTimeoutId);
    }
    
    set({
      progressIntervalId: null,
      progressTimeoutId: null,
      simulatedLoadingStep: 0,
      simulatedScanProgress: 0
    });
    
    logger.debug('FRIDGE_SCAN_PIPELINE', 'Progress simulation stopped', {
      sessionId: state.currentSessionId,
      timestamp: new Date().toISOString()
    });
  }
});