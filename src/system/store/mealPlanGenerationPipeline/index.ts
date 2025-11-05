import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import logger from '../../../lib/utils/logger';

import type { MealPlanGenerationPipelineState } from './types';
import { MEAL_PLAN_GENERATION_STEPS, STORAGE_KEY, DEFAULT_WEEK_COUNT } from './constants';

import { createGenerationActions } from './actions/generationActions';
import { createNavigationActions } from './actions/navigationActions';

export const useMealPlanGenerationPipeline = create<MealPlanGenerationPipelineState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'configuration',
      isActive: false,
      currentSessionId: null,
      simulatedOverallProgress: 0,
      lastStateUpdate: 0,
      receivedDaysCount: 0,
      totalDaysToGenerate: 0,
      processedRecipesCount: 0,
      totalRecipesToGenerate: 0,
      enrichedMealsCount: 0,
      totalMealsToEnrich: 0,
      imagesGeneratedCount: 0,
      totalImagesToGenerate: 0,
      mealPlanCandidates: [],
      loadingState: 'idle',
      loadingMessage: '',
      abortController: null,
      isCancelling: false,
      steps: MEAL_PLAN_GENERATION_STEPS,
      config: {
        selectedInventoryId: null,
        weekCount: DEFAULT_WEEK_COUNT,
        batchCooking: false
      },

      // Integrate all actions
      ...createGenerationActions(set, get),
      ...createNavigationActions(set, get),

      // Config actions
      setConfig: (config) => {
        set(state => ({
          config: { ...state.config, ...config }
        }));

        logger.debug('MEAL_PLAN_GENERATION_PIPELINE', 'Config updated', {
          config: get().config,
          timestamp: new Date().toISOString()
        });
      },

      // Loading state action
      setLoadingState: (state: 'idle' | 'generating' | 'streaming' | 'enriching' | 'saving' | 'cancelling') => {
        set({ loadingState: state });

        logger.debug('MEAL_PLAN_GENERATION_PIPELINE', 'Loading state updated', {
          newLoadingState: state,
          timestamp: new Date().toISOString()
        });
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        currentSessionId: state.currentSessionId
      })
    }
  )
);

// Export types for external use
export type {
  MealPlanGenerationStep,
  MealPlanGenerationStepData,
  MealPlanGenerationPipelineState,
  MealPlan,
  MealPlanDay,
  Meal
} from './types';
export { MEAL_PLAN_GENERATION_STEPS, WEEK_COUNT_OPTIONS } from './constants';
