/**
 * Image Generation Module
 * Handles meal image generation
 */

import { supabase } from '../../../../supabase/client';
import logger from '../../../../../lib/utils/logger';
import { useMealPlanStore } from '../..';
import { createRecipeDetailsPayload, generateImageSignature } from './helpers';

/**
 * Update meal image URL in the current plan
 */
export const updateMealImageUrlInPlan = (
  dayIndex: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  imageUrl: string,
  updatedAt: string,
  imageGenerationError?: boolean
) => {
  const { currentPlan, setCurrentPlan } = useMealPlanStore.getState();

  if (!currentPlan || !currentPlan.days[dayIndex]) {
    console.error('MEAL_PLAN_STORE No plan or day found for image URL update');
    return;
  }

  const updatedPlan = {
    ...currentPlan,
    days: currentPlan.days.map((day, index) =>
      index === dayIndex
        ? {
            ...day,
            meals: {
              ...day.meals,
              [mealType]: {
                ...day.meals[mealType],
                imageUrl: imageGenerationError ? undefined : imageUrl,
                imageGenerationError: imageGenerationError || false,
                updatedAt: updatedAt
              }
            }
          }
        : day
    )
  };

  setCurrentPlan(updatedPlan);
};

/**
 * Trigger image generation for a specific meal (background process)
 */
export const triggerImageGenerationForMeal = async (
  dayIndex: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  meal: any
) => {
  try {
    console.log('MEAL_PLAN_STORE Starting image generation for meal', {
      dayIndex,
      mealType,
      mealTitle: meal.mealName || meal.title,
      hasDetailedRecipe: !!meal.detailedRecipe
    });

    const recipeDetailsPayload = createRecipeDetailsPayload(meal);

    // Generate stable image signature
    const ingredientNames = recipeDetailsPayload.ingredients.map(ing => ing.name);
    const imageSignature = await generateImageSignature(
      recipeDetailsPayload.title,
      ingredientNames
    );

    // Ensure robust recipe_id
    const recipeId = meal.detailedRecipe?.id || meal.recipeId || crypto.randomUUID();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe_id: recipeId,
        type: 'recipe',
        recipe_details: recipeDetailsPayload,
        image_signature: imageSignature,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
    });

    if (!response.ok) {
      console.error('MEAL_PLAN_STORE Image generation failed:', response.status);
      updateMealImageUrlInPlan(dayIndex, mealType, '', new Date().toISOString(), true);
      return;
    }

    const imageData = await response.json();

    console.log('MEAL_PLAN_STORE Image generated successfully', {
      dayIndex,
      mealType,
      imageUrl: imageData.image_url
    });

    updateMealImageUrlInPlan(dayIndex, mealType, imageData.image_url, new Date().toISOString(), false);

  } catch (error) {
    console.error('MEAL_PLAN_STORE Error generating image for meal:', error);
    updateMealImageUrlInPlan(dayIndex, mealType, '', new Date().toISOString(), true);
  }
};
