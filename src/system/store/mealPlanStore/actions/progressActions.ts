/**
 * Progress Actions for Meal Plan Store
 * Handles progress simulation and tracking
 */

import type { MealPlanState, ProgressStep } from '../types';
import { PROGRESS_SIMULATION_STEPS } from '../constants';
import logger from '../../../../lib/utils/logger';

export interface ProgressActions {
  startProgressSimulation: () => void;
  stopProgressSimulation: () => void;
}

export const createProgressActions = (
  set: (partial: Partial<MealPlanState>) => void,
  get: () => MealPlanState
): ProgressActions => ({
  startProgressSimulation: () => {
    const state = get();

    // Clear any existing simulation
    if (state.progressIntervalId) {
      clearInterval(state.progressIntervalId);
    }
    if (state.progressTimeoutId) {
      clearTimeout(state.progressTimeoutId);
    }

    const startTime = Date.now();
    let currentStepIndex = 0;

    const updateProgress = () => {
      const now = Date.now();
      const currentState = get();

      // Check if backend has provided recent updates (within last 5 seconds)
      if (now - currentState.lastBackendProgressUpdate < 5000 && currentState.lastBackendProgressUpdate > 0) {
        // Backend is active, let it handle progress
        // Only update lastBackendProgressUpdate timestamp to keep simulation paused
        return;
      }

      // If no backend update for more than 5 seconds, use simulation as fallback
      // This ensures the UI stays responsive even if backend events are delayed

      if (currentStepIndex >= PROGRESS_SIMULATION_STEPS.length) {
        // All steps completed, stay at 87% until backend completes
        // Never reach 100% via simulation - only backend can complete
        const currentProgress = currentState.generationProgress;
        if (currentProgress < 87) {
          set({
            generationProgress: 87,
            currentLoadingTitle: 'Finalisation',
            currentLoadingSubtitle: 'Derniers ajustements',
            loadingMessage: 'Finalisation de votre plan hebdomadaire...'
          });
        }
        return;
      }

      const currentStep = PROGRESS_SIMULATION_STEPS[currentStepIndex];
      const stepStartTime = startTime + PROGRESS_SIMULATION_STEPS.slice(0, currentStepIndex).reduce((sum, step) => sum + step.duration, 0);
      const stepElapsed = now - stepStartTime;

      if (stepElapsed >= currentStep.duration) {
        // Move to next step
        currentStepIndex++;
        if (currentStepIndex < PROGRESS_SIMULATION_STEPS.length) {
          const nextStep = PROGRESS_SIMULATION_STEPS[currentStepIndex];
          set({
            simulatedStepIndex: currentStepIndex,
            generationProgress: nextStep.progressStart,
            currentLoadingTitle: nextStep.title,
            currentLoadingSubtitle: nextStep.subtitle,
            loadingMessage: nextStep.message
          });
        }
      } else {
        // Interpolate within current step
        const stepProgress = stepElapsed / currentStep.duration;
        const interpolatedProgress = currentStep.progressStart +
          (currentStep.progressEnd - currentStep.progressStart) * stepProgress;

        set({
          generationProgress: Math.min(interpolatedProgress, currentStep.progressEnd),
          currentLoadingTitle: currentStep.title,
          currentLoadingSubtitle: currentStep.subtitle,
          loadingMessage: currentStep.message
        });
      }
    };

    // Start the first step immediately
    const firstStep = PROGRESS_SIMULATION_STEPS[0];
    set({
      simulatedStepIndex: 0,
      simulatedProgressStartTime: startTime,
      lastBackendProgressUpdate: Date.now(), // Initialize with current time
      generationProgress: firstStep.progressStart,
      currentLoadingTitle: firstStep.title,
      currentLoadingSubtitle: firstStep.subtitle,
      loadingMessage: firstStep.message
    });

    // Set up interval for smooth updates
    const intervalId = setInterval(updateProgress, 100); // Update every 100ms for smooth animation

    set({ progressIntervalId: intervalId });

    logger.info('MEAL_PLAN_STORE', 'Progress simulation started', {
      stepsCount: PROGRESS_SIMULATION_STEPS.length,
      timestamp: new Date().toISOString()
    });
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
      simulatedStepIndex: 0,
      lastBackendProgressUpdate: 0,
      simulatedProgressStartTime: 0,
      simulatedProgressCurrentStepDuration: 0,
      simulatedProgressCurrentStepStartValue: 0,
      simulatedProgressCurrentStepEndValue: 0
    });

    logger.info('MEAL_PLAN_STORE', 'Progress simulation stopped', {
      timestamp: new Date().toISOString()
    });
  }
});