/**
 * Meal Plan Store
 * Modular Zustand store for meal plan management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MealPlanState } from './mealPlanStore/types';
import type { ProgressActions } from './mealPlanStore/actions/progressActions';
import type { InventoryActions } from './mealPlanStore/actions/inventoryActions';
import type { GenerationActions } from './mealPlanStore/actions/generationActions';
import type { WeekNavigationActions } from './mealPlanStore/actions/weekNavigationActions';
import type { PlanDataActions } from './mealPlanStore/actions/planDataActions';
import { createProgressActions } from './mealPlanStore/actions/progressActions';
import { createInventoryActions } from './mealPlanStore/actions/inventoryActions';
import { createGenerationActions } from './mealPlanStore/actions/generationActions';
import { createWeekNavigationActions } from './mealPlanStore/actions/weekNavigationActions';
import { createPlanDataActions } from './mealPlanStore/actions/planDataActions';
import { STORAGE_KEY } from './mealPlanStore/constants';

// Combined store interface
export interface MealPlanStore extends 
  MealPlanState,
  ProgressActions,
  InventoryActions,
  GenerationActions,
  WeekNavigationActions,
  PlanDataActions {
  setIsGeneratingDetailedRecipes: (isGenerating: boolean) => void;
}

// Initial state
const initialState: MealPlanState = {
  // Current plan data
  currentPlan: null,
  currentWeek: 1,
  availableWeeks: [1],
  maxAvailableWeek: 1,
  referenceStartDate: null,

  // Available inventories and selection
  availableInventories: [],
  selectedInventoryId: null,
  
  // Generation state
  isGenerating: false,
  isGeneratingDetailedRecipes: false,
  generationProgress: 0,
  loadingMessage: '',
  currentLoadingTitle: '',
  currentLoadingSubtitle: '',
  
  // Progress simulation state
  progressIntervalId: null,
  progressTimeoutId: null,
  simulatedStepIndex: 0,
  lastBackendProgressUpdate: 0,
  simulatedProgressStartTime: 0,
  simulatedProgressCurrentStepDuration: 0,
  simulatedProgressCurrentStepStartValue: 0,
  simulatedProgressCurrentStepEndValue: 0,
  
  // Recipes cache for meal plan display
  recipes: [],
  
  // All meal plans for selection
  allMealPlans: []
};

// Create the store
export const useMealPlanStore = create<MealPlanStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createProgressActions(set, get),
      ...createInventoryActions(set, get),
      ...createGenerationActions(set, get),
      ...createWeekNavigationActions(set, get),
      ...createPlanDataActions(set, get),
      setIsGeneratingDetailedRecipes: (isGenerating: boolean) => set({ isGeneratingDetailedRecipes: isGenerating })
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // Persist only essential data, not runtime state
        currentPlan: state.currentPlan,
        currentWeek: state.currentWeek,
        availableWeeks: state.availableWeeks,
        maxAvailableWeek: state.maxAvailableWeek,
        referenceStartDate: state.referenceStartDate,
        selectedInventoryId: state.selectedInventoryId,
        recipes: state.recipes
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        // Ensure availableWeeks always contains at least [1]
        availableWeeks: Array.isArray(persistedState?.availableWeeks) && persistedState.availableWeeks.length > 0 
          ? persistedState.availableWeeks 
          : [1],
        // Ensure maxAvailableWeek is at least 1
        maxAvailableWeek: typeof persistedState?.maxAvailableWeek === 'number' && persistedState.maxAvailableWeek >= 1
          ? persistedState.maxAvailableWeek
          : 1,
        // Reset runtime state on load
        isGenerating: false,
        isGeneratingDetailedRecipes: false,
        generationProgress: 0,
        loadingMessage: '',
        currentLoadingTitle: '',
        currentLoadingSubtitle: '',
        progressIntervalId: null,
        progressTimeoutId: null,
        simulatedStepIndex: 0,
        lastBackendProgressUpdate: 0,
        simulatedProgressStartTime: 0,
        simulatedProgressCurrentStepDuration: 0,
        simulatedProgressCurrentStepStartValue: 0,
        simulatedProgressCurrentStepEndValue: 0,
        availableInventories: []
      })
    }
  )
);