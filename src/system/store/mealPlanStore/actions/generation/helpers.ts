/**
 * Generation Helpers
 * Utility functions for meal plan generation
 */

import type { MealPlanDay } from '../../types';

/**
 * Create skeleton day structure for loading state
 */
export const createSkeletonDay = (date: string, dayName: string): MealPlanDay => ({
  date,
  dayName,
  meals: {
    breakfast: {
      title: '',
      description: '',
      ingredients: [],
      prep_time_min: 0,
      calories_est: 0,
      status: 'idle',
      isDetailedRecipeGenerated: false
    },
    lunch: {
      title: '',
      description: '',
      ingredients: [],
      prep_time_min: 0,
      calories_est: 0,
      status: 'idle',
      isDetailedRecipeGenerated: false
    },
    dinner: {
      title: '',
      description: '',
      ingredients: [],
      prep_time_min: 0,
      calories_est: 0,
      status: 'idle',
      isDetailedRecipeGenerated: false
    },
    snack: {
      title: '',
      description: '',
      ingredients: [],
      prep_time_min: 0,
      calories_est: 0,
      status: 'idle',
      isDetailedRecipeGenerated: false
    }
  },
  daily_summary: '',
  prepTime: 0,
  cookTime: 0,
  totalCalories: 0,
  status: 'loading'
});

/**
 * Generate stable image signature using SHA-256
 */
export const generateImageSignature = async (title: string, ingredients: string[]): Promise<string> => {
  const canonicalPayload = JSON.stringify({
    title,
    ingredients: ingredients.sort().join(',')
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalPayload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Create recipe details payload for API calls
 */
export const createRecipeDetailsPayload = (meal: any) => ({
  title: meal.detailedRecipe?.title || meal.mealName || meal.title || 'Generated Meal Image',
  description: meal.detailedRecipe?.description || meal.descriptionSummary || '',
  ingredients: meal.detailedRecipe?.ingredients ||
    (meal.mainIngredients || []).map((ingredient: any) =>
      typeof ingredient === 'string' ? { name: ingredient } : ingredient
    )
});
