/**
 * Meal Plan Store Constants
 * Constants and utility functions for the Meal Plan Store
 */

import type { ProgressStep, MealDetail, MealPlanDay } from './types';

// Predefined progress steps for simulation
// These steps provide smooth UI feedback while waiting for backend events
export const PROGRESS_SIMULATION_STEPS: ProgressStep[] = [
  {
    title: 'Initialisation de la Forge Nutritionnelle',
    subtitle: 'Préparation de votre plan personnalisé',
    message: 'Analyse de votre profil nutritionnel...',
    duration: 2000,
    progressStart: 0,
    progressEnd: 10
  },
  {
    title: 'Analyse des Préférences',
    subtitle: 'Optimisation selon vos goûts',
    message: 'Traitement de vos préférences alimentaires...',
    duration: 2000,
    progressStart: 10,
    progressEnd: 15
  },
  {
    title: 'Forge Nutritionnelle',
    subtitle: 'Création de recettes personnalisées',
    message: 'Forge des repas personnalisés...',
    duration: 8000,
    progressStart: 15,
    progressEnd: 75
  },
  {
    title: 'Optimisation Nutritionnelle',
    subtitle: 'Équilibrage des macronutriments',
    message: 'Calcul des valeurs nutritionnelles...',
    duration: 2000,
    progressStart: 75,
    progressEnd: 85
  },
  {
    title: 'Finalisation',
    subtitle: 'Derniers ajustements',
    message: 'Finalisation de votre plan hebdomadaire...',
    duration: 1000,
    progressStart: 85,
    progressEnd: 87
  }
];

// Storage key for persistence
export const STORAGE_KEY = 'twinforge:meal-plan-store';

export function getWeekStartDate(weekNumber: number, referenceDate?: string | null): Date {
  let baseDate: Date;

  if (referenceDate) {
    baseDate = new Date(referenceDate);
  } else {
    baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
  }

  const startDate = new Date(baseDate);
  startDate.setDate(baseDate.getDate() + (weekNumber - 1) * 7);
  startDate.setHours(0, 0, 0, 0);

  return startDate;
}

// Helper function to format date for display
export const formatDateRange = (startDate: Date, endDate: Date) => {
  const formatted = `${startDate.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })} - ${endDate.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })}`;
  
  return {
    formatted,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

/**
 * Robust number coercion that tolerates:
 *   - strings avec unités : "10min"
 *   - symboles approx     : "≈15"
 *   - intervalles         : "15–20"
 *   - virgule décimale    : "12,5"
 */
export function coerceNumber(input: unknown, fallback = 0): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input === 'string') {
    const match = input.match(/-?\d+(?:[.,]\d+)?/);
    if (match) return Number(match[0].replace(',', '.'));
    return fallback;
  }
  return fallback;
}

// Helper function to transform Edge function meal to frontend MealDetail
export function transformEdgeMealToFrontendMealDetail(edgeMeal: any): MealDetail {
  // DEBUG: Log the raw edgeMeal object received from Edge function
  console.log('🔍 [transformEdgeMealToFrontendMealDetail] Raw edgeMeal:', edgeMeal);

  // Normalized string fields (accept legacy title/description)
  const mealName = (edgeMeal?.mealName ?? edgeMeal?.title ?? edgeMeal?.meal ?? 'Repas sans nom').toString();
  const descriptionSummary = (edgeMeal?.descriptionSummary ?? edgeMeal?.description ?? '').toString();

  // Log warning if meal name is missing
  if (!edgeMeal?.mealName && !edgeMeal?.title && !edgeMeal?.meal) {
    console.warn('⚠️ [transformEdgeMealToFrontendMealDetail] Meal missing name fields:', edgeMeal);
  }

  // Accept both snake_case (edge) and camelCase (frontend) shapes
  const estimatedPrepTime = coerceNumber(edgeMeal?.prep_time_min ?? edgeMeal?.prepTimeMin, 0);
  const estimatedCookTime = coerceNumber(edgeMeal?.cook_time_min ?? edgeMeal?.cookTimeMin, 0);
  const estimatedCalories = coerceNumber(
    edgeMeal?.calories_est ?? edgeMeal?.estimatedCalories ?? edgeMeal?.calories,
    0
  );

  // DEBUG: Log the processed numerical values
  console.log('🔍 [transformEdgeMealToFrontendMealDetail] Processed values:', {
    estimatedPrepTime,
    estimatedCookTime,
    estimatedCalories
  });

  const mainIngredients: string[] = Array.isArray(edgeMeal?.ingredients)
    ? edgeMeal.ingredients
    : Array.isArray(edgeMeal?.mainIngredients)
    ? edgeMeal.mainIngredients
    : [];

  const dietaryTags: string[] = Array.isArray(edgeMeal?.dietaryTags) ? edgeMeal.dietaryTags : [];
  const mealComponents: string[] = Array.isArray(edgeMeal?.mealComponents) ? edgeMeal.mealComponents : [];

  return {
    mealName,
    descriptionSummary,
    mainIngredients,
    estimatedPrepTime,
    estimatedCookTime,
    estimatedCalories,
    nutritionalOverview: {
      kcal: estimatedCalories,
      protein: coerceNumber(edgeMeal?.protein, 0),
      carbs: coerceNumber(edgeMeal?.carbs, 0),
      fat: coerceNumber(edgeMeal?.fat, 0)
    },
    mealComponents,
    dietaryTags,
    recipeId: edgeMeal?.recipeId,
    isDetailedRecipeGenerated: false,
    detailedRecipe: undefined,
    status: 'ready'
  };
}

// Helper function to transform Edge function day data to frontend MealPlanDay
export function transformEdgeDayToFrontendDay(dayData: any): MealPlanDay {
  // DEBUG: Log the raw dayData object received from Edge function
  console.log('🔍 [transformEdgeDayToFrontendDay] Raw dayData:', dayData);

  // Derive day name from date
  const date = new Date(dayData.date);
  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });

  // Transform individual meals
  const meals: MealPlanDay['meals'] = {};

  if (dayData.breakfast) {
    meals.breakfast = transformEdgeMealToFrontendMealDetail(dayData.breakfast);
  }

  if (dayData.lunch) {
    meals.lunch = transformEdgeMealToFrontendMealDetail(dayData.lunch);
  }

  if (dayData.dinner) {
    meals.dinner = transformEdgeMealToFrontendMealDetail(dayData.dinner);
  }

  if (dayData.snack) {
    meals.snack = transformEdgeMealToFrontendMealDetail(dayData.snack);
  }

  // Calculate total prep and cook time for the day
  const allMeals = [meals.breakfast, meals.lunch, meals.dinner, meals.snack].filter(Boolean) as MealDetail[];
  const calculatedPrepTime = allMeals.reduce((total, meal) => total + coerceNumber(meal.estimatedPrepTime, 0), 0);
  const calculatedCookTime = allMeals.reduce((total, meal) => total + coerceNumber(meal.estimatedCookTime, 0), 0);

  // Robust parsing for total calories with explicit fallback to sum of meals
  const calculatedTotalCalories = coerceNumber(
    dayData.total_calories,
    allMeals.reduce((t, m) => t + coerceNumber(m.estimatedCalories, 0), 0)
  );

  // DEBUG: Log the calculated daily totals
  console.log('🔍 [transformEdgeDayToFrontendDay] Calculated totals:', {
    prepTime: calculatedPrepTime,
    cookTime: calculatedCookTime,
    totalCalories: calculatedTotalCalories
  });

  return {
    date: dayData.date,
    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1), // Capitalize first letter
    meals,
    prepTime: calculatedPrepTime,
    cookTime: calculatedCookTime,
    totalCalories: calculatedTotalCalories,
    daily_summary: dayData.daily_summary,
    isBatchCookingDay: dayData.isBatchCookingDay || false,
    status: 'ready'
  };
}