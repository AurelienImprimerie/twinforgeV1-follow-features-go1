/**
 * Generation Actions for Meal Plan Store
 * Handles meal plan generation and regeneration
 *
 * This module has been refactored into smaller sub-modules:
 * - generation/helpers.ts: Utility functions
 * - generation/imageGeneration.ts: Image generation logic
 * - generation/recipeGeneration.ts: Recipe generation logic
 * - generation/planGeneration.ts: Plan generation core logic
 */

import logger from '../../../../lib/utils/logger';
import type { MealPlanState, MealPlanData } from '../types';
import { useMealPlanStore } from '..';
import {
  generateMealPlanCore,
  generateDetailedRecipeForMeal,
  generateAllDetailedRecipesForDay,
  updateMealImageUrlInPlan
} from './generation';

export interface GenerationActions {
  generateMealPlan: (weekNumber: number, inventory?: any[]) => Promise<void>;
  regenerateWeek: (weekNumber: number) => Promise<void>;
  generateNextWeek: () => Promise<void>;
  generateSpecificWeek: (weekNumber: number) => Promise<void>;
  setIsGeneratingDetailedRecipes: (isGenerating: boolean) => void;
  cancelDetailedRecipeGeneration: () => void;
}

export const createGenerationActions = (
  set: (partial: Partial<MealPlanState>) => void,
  get: () => MealPlanState
): GenerationActions => ({
  generateMealPlan: async (weekNumber: number, inventory?: any[]) => {
    const state = get();

    // Initialize reference date if not set (first generation)
    if (!state.referenceStartDate && weekNumber === 1) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      set({ referenceStartDate: today.toISOString() });
    }

    try {
      set({ isGenerating: true });

      const mealPlanData = await generateMealPlanCore(
        weekNumber,
        inventory,
        state.selectedInventoryId,
        state.referenceStartDate,
        // onProgress callback
        (progress, title, subtitle, message) => {
          set({
            generationProgress: progress,
            currentLoadingTitle: title,
            currentLoadingSubtitle: subtitle,
            loadingMessage: message
          });
        },
        // onComplete callback
        (plan: MealPlanData) => {
          set({ currentPlan: plan, currentWeek: weekNumber });
        },
        // onError callback
        (error: Error) => {
          set({
            currentPlan: null,
            isGenerating: false,
            generationProgress: 0,
            currentLoadingTitle: 'Erreur',
            currentLoadingSubtitle: 'Échec de la génération',
            loadingMessage: error.message
          });
        },
        // startProgressSimulation
        () => get().startProgressSimulation(),
        // stopProgressSimulation
        () => get().stopProgressSimulation()
      );

      if (mealPlanData) {
        const newAvailableWeeks = [...new Set([...state.availableWeeks, weekNumber])].sort((a, b) => a - b);
        const newMaxAvailableWeek = Math.max(state.maxAvailableWeek, weekNumber);

        set({
          currentPlan: mealPlanData,
          currentWeek: weekNumber,
          availableWeeks: newAvailableWeeks,
          maxAvailableWeek: newMaxAvailableWeek,
          isGenerating: false
        });
      }

    } catch (error) {
      set({
        currentPlan: null,
        isGenerating: false,
        generationProgress: 0,
        currentLoadingTitle: 'Erreur',
        currentLoadingSubtitle: 'Échec de la génération',
        loadingMessage: error instanceof Error ? error.message : 'Erreur inconnue'
      });

      get().stopProgressSimulation();

      logger.error('MEAL_PLAN_STORE', 'Meal plan generation failed', {
        weekNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  },

  regenerateWeek: async (weekNumber: number) => {
    logger.info('MEAL_PLAN_STORE', 'Regenerating week', { weekNumber });
    const { selectedInventory } = get();
    await get().generateMealPlan(weekNumber, selectedInventory);
  },

  generateNextWeek: async () => {
    const state = get();
    const nextWeek = state.maxAvailableWeek + 1;
    logger.info('MEAL_PLAN_STORE', 'Generating next week', { nextWeek });
    await get().generateMealPlan(nextWeek, state.selectedInventory);
  },

  generateSpecificWeek: async (weekNumber: number) => {
    logger.info('MEAL_PLAN_STORE', 'Generating specific week', { weekNumber });
    const { selectedInventory } = get();
    await get().generateMealPlan(weekNumber, selectedInventory);
  },

  setIsGeneratingDetailedRecipes: (isGenerating: boolean) => {
    set({ isGeneratingDetailedRecipes: isGenerating });
  },

  cancelDetailedRecipeGeneration: () => {
    const state = get();

    // Reset the generation flag
    set({ isGeneratingDetailedRecipes: false });

    // Reset any meals that are currently loading back to idle
    if (state.currentPlan) {
      const updatedPlan = {
        ...state.currentPlan,
        days: state.currentPlan.days.map(day => ({
          ...day,
          meals: {
            breakfast: day.meals.breakfast?.status === 'loading'
              ? { ...day.meals.breakfast, status: 'idle' as const }
              : day.meals.breakfast,
            lunch: day.meals.lunch?.status === 'loading'
              ? { ...day.meals.lunch, status: 'idle' as const }
              : day.meals.lunch,
            dinner: day.meals.dinner?.status === 'loading'
              ? { ...day.meals.dinner, status: 'idle' as const }
              : day.meals.dinner,
            snack: day.meals.snack?.status === 'loading'
              ? { ...day.meals.snack, status: 'idle' as const }
              : day.meals.snack
          }
        }))
      };

      set({ currentPlan: updatedPlan });
    }

    logger.info('MEAL_PLAN_STORE', 'Detailed recipe generation cancelled');
  }
});

/**
 * Export functions that are called from outside the store
 */
export {
  updateMealImageUrlInPlan,
  generateDetailedRecipeForMeal,
  generateAllDetailedRecipesForDay
};

/**
 * Cancel meal plan generation
 */
export const cancelMealPlanGeneration = () => {
  const { setIsGenerating, setCurrentPlan } = useMealPlanStore.getState();

  console.log('MEAL_PLAN_STORE Cancelling meal plan generation');

  // Stop generation process
  setIsGenerating(false);

  // Reset current plan
  setCurrentPlan(null);
};

/**
 * Export legacy function for backward compatibility
 */
export const cancelDetailedRecipeGeneration = () => {
  useMealPlanStore.getState().cancelDetailedRecipeGeneration();
};
