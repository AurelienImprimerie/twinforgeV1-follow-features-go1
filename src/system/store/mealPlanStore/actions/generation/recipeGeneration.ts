/**
 * Recipe Generation Module
 * Handles detailed recipe generation for meals
 */

import { supabase } from '../../../../supabase/client';
import { useUserStore } from '../../../userStore';
import logger from '../../../../../lib/utils/logger';
import { useMealPlanStore } from '../..';
import type { DetailedRecipe } from '../../../../../domain/recipe';
import { triggerImageGenerationForMeal } from './imageGeneration';

/**
 * Generate detailed recipe for a specific meal
 */
export const generateDetailedRecipeForMeal = async (
  dayIndex: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
) => {
  console.log('🔄 STARTING generateDetailedRecipeForMeal', {
    dayIndex,
    mealType,
    timestamp: new Date().toISOString()
  });

  let currentPlan = useMealPlanStore.getState().currentPlan;

  if (!currentPlan || !currentPlan.days[dayIndex]) {
    console.error('MEAL_PLAN_STORE No plan or day found for detailed recipe generation');
    console.error('❌ generateDetailedRecipeForMeal FAILED: No plan or day found', {
      dayIndex,
      mealType,
      hasPlan: !!currentPlan,
      daysCount: currentPlan?.days?.length || 0
    });
    return;
  }

  const meal = currentPlan.days[dayIndex].meals[mealType];
  if (!meal) {
    console.error('MEAL_PLAN_STORE No meal found for detailed recipe generation');
    console.error('❌ generateDetailedRecipeForMeal FAILED: No meal found', {
      dayIndex,
      mealType,
      availableMeals: Object.keys(currentPlan.days[dayIndex].meals || {})
    });
    return;
  }

  try {
    // Get user data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userProfile = useUserStore.getState().profile;
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Set meal status to loading
    currentPlan = useMealPlanStore.getState().currentPlan;
    if (!currentPlan) return;

    const updatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: {
                  ...meal,
                  status: 'loading' as const
                }
              }
            }
          : day
      )
    };
    useMealPlanStore.getState().setCurrentPlan(updatedPlan);

    console.log('MEAL_PLAN_STORE Starting detailed recipe generation', {
      dayIndex,
      mealType,
      mealTitle: meal.title
    });

    console.log('📡 CALLING Edge Function: recipe-detail-generator', {
      userId: user.id,
      mealTitle: meal.mealName || meal.title || 'Repas sans nom',
      targetCalories: meal.calories_est,
      ingredientsCount: meal.ingredients?.length || 0
    });

    // Get session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    // Call recipe-detail-generator Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recipe-detail-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        meal_title: meal.mealName || meal.title || 'Repas sans nom',
        main_ingredients: meal.ingredients || [],
        user_preferences: {
          identity: userProfile,
          nutrition: userProfile.nutrition || {},
          kitchen_equipment: userProfile.kitchen_equipment || {},
          food_preferences: userProfile.food_preferences || {},
          sensory_preferences: userProfile.sensory_preferences || {}
        },
        meal_type: mealType,
        target_calories: meal.calories_est
      })
    });

    if (!response.ok) {
      throw new Error(`Recipe generation failed: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Edge Function response received', {
      dayIndex,
      mealType,
      cached: responseData.cached,
      modelUsed: responseData.model_used,
      hasRecipe: !!responseData.recipe
    });

    let detailedRecipe: DetailedRecipe = responseData.recipe;

    // Transform instructions from string[] to RecipeInstruction[] format expected by modal
    if (detailedRecipe.instructions && Array.isArray(detailedRecipe.instructions)) {
      console.log('🔄 Transforming instructions', {
        instructionsCount: detailedRecipe.instructions.length,
        firstInstructionType: typeof detailedRecipe.instructions[0],
        firstInstructionSample: detailedRecipe.instructions[0]
      });

      const transformedInstructions = detailedRecipe.instructions.map((instruction: string | any, index: number) => {
        // If already in RecipeInstruction format, keep it
        if (typeof instruction === 'object' && instruction.instruction) {
          return instruction;
        }
        // Otherwise transform string to RecipeInstruction
        return {
          step: index + 1,
          instruction: typeof instruction === 'string' ? instruction : '',
          timeMin: undefined
        };
      }) as any;
      detailedRecipe = {
        ...detailedRecipe,
        instructions: transformedInstructions
      };

      console.log('✅ Instructions transformed', {
        transformedCount: transformedInstructions.length,
        firstTransformed: transformedInstructions[0]
      });
    }

    // Transform nutritionalInfo to match Recipe interface (calories instead of kcal)
    if (detailedRecipe.nutritionalInfo) {
      const nutritionalInfo = detailedRecipe.nutritionalInfo as any;
      const transformedNutritionalInfo = {
        calories: nutritionalInfo.kcal || nutritionalInfo.calories || 0,
        protein: nutritionalInfo.protein || 0,
        carbs: nutritionalInfo.carbs || 0,
        fat: nutritionalInfo.fat || 0,
        fiber: nutritionalInfo.fiber || 0
      };

      console.log('🍽️ Nutritional info transformed', {
        original: nutritionalInfo,
        transformed: transformedNutritionalInfo
      });

      detailedRecipe = {
        ...detailedRecipe,
        nutritionalInfo: transformedNutritionalInfo as any
      };
    }

    console.log('MEAL_PLAN_STORE Detailed recipe generated successfully', {
      dayIndex,
      mealType,
      cached: responseData.cached,
      modelUsed: responseData.model_used,
      instructionsCount: detailedRecipe.instructions?.length || 0,
      hasNutritionalInfo: !!detailedRecipe.nutritionalInfo
    });

    // Update meal with detailed recipe
    currentPlan = useMealPlanStore.getState().currentPlan;
    if (!currentPlan) return;

    const finalUpdatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: {
                  ...meal,
                  status: 'ready' as const,
                  isDetailedRecipeGenerated: true,
                  detailedRecipe,
                  imageUrl: detailedRecipe.imageUrl || meal.imageUrl,
                  imageGenerationError: detailedRecipe.imageGenerationError || meal.imageGenerationError || false,
                  imageSignature: detailedRecipe.imageSignature || meal.imageSignature,
                  updatedAt: new Date().toISOString()
                }
              }
            }
          : day
      )
    };
    useMealPlanStore.getState().setCurrentPlan(finalUpdatedPlan);

    // Trigger image generation in background
    if (detailedRecipe && detailedRecipe.id && !detailedRecipe.imageUrl) {
      const updatedMeal = finalUpdatedPlan.days[dayIndex].meals[mealType];
      triggerImageGenerationForMeal(dayIndex, mealType, updatedMeal);
    }

  } catch (error) {
    console.error('MEAL_PLAN_STORE Error generating detailed recipe:', error);
    console.error('❌ generateDetailedRecipeForMeal FAILED with error', {
      dayIndex,
      mealType,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Set meal status to error on failure
    currentPlan = useMealPlanStore.getState().currentPlan;
    if (!currentPlan) return;

    const errorUpdatedPlan = {
      ...currentPlan,
      days: currentPlan.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              meals: {
                ...day.meals,
                [mealType]: {
                  ...meal,
                  status: 'error' as const,
                  errorMessage: error instanceof Error ? error.message : 'Erreur lors de la génération de la recette'
                }
              }
            }
          : day
      )
    };
    useMealPlanStore.getState().setCurrentPlan(errorUpdatedPlan);
  }
};

/**
 * Generate all detailed recipes for a specific day
 */
export const generateAllDetailedRecipesForDay = async (dayIndex: number) => {
  console.log('🚀 STARTING generateAllDetailedRecipesForDay', {
    dayIndex,
    timestamp: new Date().toISOString()
  });

  const { currentPlan, setIsGeneratingDetailedRecipes } = useMealPlanStore.getState();

  if (!currentPlan || !currentPlan.days[dayIndex]) {
    console.error('MEAL_PLAN_STORE No plan or day found for bulk recipe generation');
    console.error('❌ generateAllDetailedRecipesForDay FAILED: No plan or day found', {
      dayIndex,
      hasPlan: !!currentPlan,
      daysCount: currentPlan?.days?.length || 0
    });
    return;
  }

  // Set the generation flag to true at the start
  setIsGeneratingDetailedRecipes(true);

  const day = currentPlan.days[dayIndex];
  const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  console.log('MEAL_PLAN_STORE Starting bulk recipe generation for day', {
    dayIndex,
    dayName: day.dayName,
    date: day.date
  });

  // Collect all meals that need generation
  const mealsToGenerate = mealTypes.filter(mealType => {
    const meal = day.meals[mealType];
    return meal && !meal.isDetailedRecipeGenerated && meal.status !== 'loading';
  });

  console.log('📋 Meals to generate:', {
    dayIndex,
    mealsToGenerate,
    totalMealsCount: mealTypes.length,
    mealsNeedingGeneration: mealsToGenerate.length
  });

  // Generate all recipes concurrently
  console.log('⚡ Starting concurrent recipe generation with Promise.all');
  const generationPromises = mealsToGenerate.map(mealType =>
    generateDetailedRecipeForMeal(dayIndex, mealType).catch(error => {
      console.error(`MEAL_PLAN_STORE Error generating recipe for ${mealType}:`, error);
      console.error(`❌ Individual recipe generation failed for ${mealType}`, {
        dayIndex,
        mealType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    })
  );

  // Wait for all generations to complete
  try {
    await Promise.all(generationPromises);
    console.log('✅ All recipe generations completed successfully', {
      dayIndex,
      dayName: day.dayName,
      generatedCount: mealsToGenerate.length
    });
  } catch (error) {
    console.error('❌ Promise.all failed in generateAllDetailedRecipesForDay', {
      dayIndex,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Always reset the generation flag when done
    setIsGeneratingDetailedRecipes(false);
  }

  console.log('MEAL_PLAN_STORE Bulk recipe generation completed for day', {
    dayIndex,
    dayName: day.dayName,
    generatedCount: mealsToGenerate.length
  });
};
