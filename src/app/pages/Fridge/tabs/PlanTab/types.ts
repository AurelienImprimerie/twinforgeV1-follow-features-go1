/**
 * PlanTab Types
 * Type definitions for the PlanTab components
 */

export interface MealDetail {
  mealName: string;
  descriptionSummary: string;
  mainIngredients: string[];
  estimatedPrepTime: number;
  estimatedCookTime: number;
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
  isDetailedRecipeGenerated: boolean;
  detailedRecipe?: DetailedRecipe;
  imageUrl?: string;
  imageGenerationError?: boolean;
  imageSignature?: string;

  /**
   * UI lifecycle hint. Optional to avoid breaking existing data.
   */
  status?: 'loading' | 'ready';
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
  mealComponents: string[]; // ["Entrée: Salade", "Plat: Poulet", "Dessert: Yaourt"]
  recipeId?: string; // For future recipe generation
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

export interface MealPlanData {
  id: string;
  weekNumber: number;
  startDate: string;
  days: MealPlanDay[];
  totalDays: number;
  mealsPerDay: number;
  batchCookingDays?: string[];
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
  createdAt: string;
  updatedAt: string;
  aiExplanation?: {
    personalizedReasoning: string;
    nutritionalStrategy: string;
    adaptationHighlights: string[];
    weeklyGoals: string[];
    complianceNotes: string[];
  };
}

export interface MealPlanSession {
  id: string;
  sessionId: string;
  userId: string;
  planData: MealPlanData;
  createdAt: string;
  updatedAt: string;
}