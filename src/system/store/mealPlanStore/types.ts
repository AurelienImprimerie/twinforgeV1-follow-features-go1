/**
 * Meal Plan Store Types
 * Type definitions for the Meal Plan Store
 */

import type { Recipe } from '../../../domain/recipe';

export interface MealPlanData {
  id: string;
  weekNumber: number;
  startDate: string;
  days: MealPlanDay[];
  createdAt: string;
  updatedAt: string;
  nutritionalSummary?: {
    avgCaloriesPerDay: number;
    avgProteinPerDay: number;
    avgCarbsPerDay: number;
    avgFatPerDay: number;
    weeklyCalories: number;
    weeklyProtein: number;
    weeklyCarbsGrams: number;
    weeklyFatGrams: number;
  };
  estimatedWeeklyCost?: number;
  batchCookingDays?: string[];
  aiExplanation?: {
    personalizedReasoning: string;
    nutritionalStrategy: string;
    adaptationHighlights: string[];
    weeklyGoals: string[];
    complianceNotes: string[];
  };
}

export interface MealPlanDay {
  date: string;
  dayName: string;
  meals: {
    breakfast?: MealDetail;
    lunch?: MealDetail;
    dinner?: MealDetail;
    snack?: MealDetail;
  };
  prepTime: number;
  cookTime: number;
  totalCalories: number;
  daily_summary?: string;
  isBatchCookingDay?: boolean;
  status: 'loading' | 'ready';
}

export interface MealDetail {
  mealName: string;
  descriptionSummary: string;
  mainIngredients: string[];
  estimatedPrepTime: number;
  estimatedCookTime: number;
  status: 'loading' | 'ready' | 'idle';
  isDetailedRecipeGenerated: boolean;
  detailedRecipe?: DetailedRecipe;
  imageUrl?: string;
  imageGenerationError?: boolean;
  estimatedCalories: number;
  nutritionalOverview?: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealComponents?: string[];
  dietaryTags: string[];
  recipeId?: string;
  detailedRecipe?: DetailedRecipe;
  imageUrl?: string;
  imageGenerationError?: boolean;
  imageSignature?: string;
}

export interface DetailedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string[];
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  nutritionalInfo: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  dietaryTags: string[];
  difficulty: 'facile' | 'moyen' | 'difficile';
  tips: string[];
  variations: string[];
  reasonsForSelection: string[];
  mealComponents: string[];
  recipeId?: string;
}

export interface InventorySession {
  id: string;
  created_at: string;
  inventory_final: any[];
  status: string;
}

export interface ProgressStep {
  title: string;
  subtitle: string;
  message: string;
  duration: number; // in milliseconds
  progressStart: number; // percentage
  progressEnd: number; // percentage
}

export interface MealPlanState {
  // Current plan data
  currentPlan: MealPlanData | null;
  currentWeek: number;
  availableWeeks: number[];
  maxAvailableWeek: number;
  referenceStartDate: string | null;

  // Available inventories and selection
  availableInventories: InventorySession[];
  selectedInventoryId: string | null;
  
  // Generation state
  isGenerating: boolean;
  isGeneratingDetailedRecipes: boolean;
  generationProgress: number;
  loadingMessage: string;
  currentLoadingTitle: string;
  currentLoadingSubtitle: string;
  
  // Progress simulation state
  progressIntervalId: number | null;
  progressTimeoutId: number | null;
  simulatedStepIndex: number;
  lastBackendProgressUpdate: number;
  simulatedProgressStartTime: number;
  simulatedProgressCurrentStepDuration: number;
  simulatedProgressCurrentStepStartValue: number;
  simulatedProgressCurrentStepEndValue: number;
  
  // Recipes cache for meal plan display
  recipes: Recipe[];
  
  // All meal plans for selection
  allMealPlans: MealPlanData[];
}

export interface GenerationActions {
  generateMealPlan: (weekNumber: number, inventory?: any[]) => Promise<void>;
  regenerateWeek: (inventory: any[], weekNumber: number) => Promise<void>;
  generateNextWeek: (inventory: any[]) => Promise<void>;
  generateSpecificWeek: (inventory: any[], weekNumber: number) => Promise<void>;
  saveCurrentMealPlan: () => Promise<void>;
}