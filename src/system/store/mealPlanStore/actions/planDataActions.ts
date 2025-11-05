/**
 * Plan Data Actions for Meal Plan Store
 * Handles meal plan data management and recipe loading
 */

import { supabase } from '../../../supabase/client';
import logger from '../../../../lib/utils/logger';
import type { Recipe } from '../../../../domain/recipe';
import type { MealPlanState, MealPlanData } from '../types';

export interface PlanDataActions {
  clearPlan: () => void;
  loadRecipesForPlan: (plan: MealPlanData) => Promise<void>;
  fetchMealPlanForWeek: (weekNumber: number) => Promise<void>;
  setCurrentPlan: (plan: MealPlanData | null) => void;
  loadAllMealPlans: () => Promise<void>;
  saveCurrentMealPlan: () => Promise<void>;
  deleteMealPlan: (planId: string) => Promise<void>;
}

export const createPlanDataActions = (
  set: (partial: Partial<MealPlanState>) => void,
  get: () => MealPlanState
): PlanDataActions => ({
  clearPlan: () => {
    set({
      currentPlan: null,
      currentWeek: 1,
      availableWeeks: [1],
      maxAvailableWeek: 0,
      recipes: []
    });

    logger.info('MEAL_PLAN_STORE', 'Plan cleared', {
      timestamp: new Date().toISOString()
    });
  },

  setCurrentPlan: (plan: MealPlanData | null) => {
    set({ currentPlan: plan });

    logger.info('MEAL_PLAN_STORE', 'Current plan updated', {
      planId: plan?.id || 'null',
      timestamp: new Date().toISOString()
    });
  },

  loadRecipesForPlan: async (plan: MealPlanData) => {
    try {
      // Extract all recipe IDs from the plan
      const recipeIds: string[] = [];
      
      plan.days.forEach(day => {
        Object.values(day.meals).forEach(meal => {
          if (meal?.recipeId) {
            recipeIds.push(meal.recipeId);
          }
        });
      });

      if (recipeIds.length === 0) {
        logger.info('MEAL_PLAN_STORE', 'No recipe IDs found in plan', {
          planId: plan.id,
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info('MEAL_PLAN_STORE', 'Loading recipes for plan', {
        planId: plan.id,
        recipeIds,
        timestamp: new Date().toISOString()
      });

      // Fetch recipes from Supabase
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds);

      if (error) {
        throw new Error(`Failed to load recipes: ${error.message}`);
      }

      set({ recipes: recipes || [] });

      logger.info('MEAL_PLAN_STORE', 'Recipes loaded for plan', {
        planId: plan.id,
        recipesCount: recipes?.length || 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_STORE', 'Failed to load recipes for plan', {
        planId: plan.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  },

  fetchMealPlanForWeek: async (weekNumber: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      logger.info('MEAL_PLAN_STORE', 'Fetching meal plan for week', {
        weekNumber,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // This would typically fetch from a meal_plans table
      // For now, we'll just log that we attempted to fetch
      // In a real implementation, you'd have a table storing generated meal plans

      logger.info('MEAL_PLAN_STORE', 'Meal plan fetch completed', {
        weekNumber,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_STORE', 'Failed to fetch meal plan for week', {
        weekNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  },

  loadAllMealPlans: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      logger.info('MEAL_PLAN_STORE', 'Loading all meal plans', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      const { data: mealPlans, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to load meal plans: ${error.message}`);
      }

      // Transform the data to match MealPlanData interface
      const transformedPlans: MealPlanData[] = (mealPlans || []).map(plan => {
        // Extract plan_data (JSONB column containing the actual plan)
        const planData = plan.plan_data || {};

        // Transform days: convert meals array to meals object {breakfast, lunch, dinner, snack}
        const transformedDays = (planData.days || []).map((day: any) => {
          const mealsObject: any = {};

          // If meals is already an object, use it directly
          if (day.meals && !Array.isArray(day.meals)) {
            return day;
          }

          // If meals is an array, convert to object keyed by type
          if (Array.isArray(day.meals)) {
            day.meals.forEach((meal: any) => {
              if (meal && meal.type) {
                mealsObject[meal.type] = {
                  mealName: meal.name,
                  descriptionSummary: meal.description || '',
                  mainIngredients: meal.ingredients || [],
                  estimatedPrepTime: meal.prepTime || 0,
                  estimatedCookTime: meal.cookTime || 0,
                  estimatedCalories: meal.calories || 0,
                  dietaryTags: meal.detailedRecipe?.dietaryTags || [],
                  status: meal.status || 'ready',
                  isDetailedRecipeGenerated: meal.recipeGenerated || false,
                  detailedRecipe: meal.detailedRecipe ? {
                    id: meal.detailedRecipe.id,
                    title: meal.detailedRecipe.title,
                    description: meal.detailedRecipe.title,
                    ingredients: meal.detailedRecipe.ingredients || [],
                    instructions: meal.detailedRecipe.instructions || [],
                    prepTimeMin: meal.detailedRecipe.prepTimeMin || 0,
                    cookTimeMin: meal.detailedRecipe.cookTimeMin || 0,
                    servings: meal.detailedRecipe.servings || 1,
                    nutritionalInfo: meal.detailedRecipe.nutritionalInfo || {
                      kcal: meal.calories || 0,
                      protein: 0,
                      carbs: 0,
                      fat: 0,
                      fiber: 0
                    },
                    dietaryTags: meal.detailedRecipe.dietaryTags || [],
                    difficulty: meal.detailedRecipe.difficulty || 'moyen',
                    tips: meal.detailedRecipe.tips || [],
                    variations: meal.detailedRecipe.variations || [],
                    reasonsForSelection: [],
                    mealComponents: []
                  } : undefined,
                  imageUrl: meal.imageUrl || meal.detailedRecipe?.imageUrl,
                  recipeId: meal.detailedRecipe?.id
                };
              }
            });
          }

          return {
            ...day,
            meals: mealsObject
          };
        });

        logger.info('MEAL_PLAN_STORE', 'Transforming meal plan', {
          planId: plan.id,
          weekNumber: plan.week_number,
          hasPlanData: !!plan.plan_data,
          originalDaysCount: planData.days?.length || 0,
          transformedDaysCount: transformedDays.length,
          hasNutritionalSummary: !!plan.nutritional_summary,
          hasAiExplanation: !!plan.ai_explanation,
          timestamp: new Date().toISOString()
        });

        return {
          id: plan.id,
          weekNumber: plan.week_number || 1,
          startDate: plan.start_date || plan.created_at,
          days: transformedDays,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
          nutritionalSummary: plan.nutritional_summary || planData.nutritionalSummary,
          estimatedWeeklyCost: planData.estimatedWeeklyCost,
          batchCookingDays: planData.batchCookingDays,
          aiExplanation: plan.ai_explanation || planData.aiExplanation
        };
      });

      set({ allMealPlans: transformedPlans });

      logger.info('MEAL_PLAN_STORE', 'All meal plans loaded', {
        count: transformedPlans.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_STORE', 'Failed to load all meal plans', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      // Set empty array on error to prevent undefined
      set({ allMealPlans: [] });
    }
  },

  saveCurrentMealPlan: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { currentPlan } = get();
      if (!currentPlan) {
        throw new Error('No current plan to save');
      }

      logger.info('MEAL_PLAN_STORE', 'Saving current meal plan', {
        planId: currentPlan.id,
        weekNumber: currentPlan.weekNumber,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      const planData = {
        user_id: user.id,
        plan_data: {
          id: currentPlan.id,
          weekNumber: currentPlan.weekNumber,
          startDate: currentPlan.startDate,
          days: currentPlan.days,
          nutritionalSummary: currentPlan.nutritionalSummary,
          estimatedWeeklyCost: currentPlan.estimatedWeeklyCost,
          batchCookingDays: currentPlan.batchCookingDays,
          aiExplanation: currentPlan.aiExplanation
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('meal_plans')
        .upsert(planData, {
          onConflict: 'id'
        });

      if (error) {
        throw new Error(`Failed to save meal plan: ${error.message}`);
      }

      logger.info('MEAL_PLAN_STORE', 'Current meal plan saved successfully', {
        planId: currentPlan.id,
        weekNumber: currentPlan.weekNumber,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_STORE', 'Failed to save current meal plan', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  deleteMealPlan: async (planId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      logger.info('MEAL_PLAN_STORE', 'Deleting meal plan', {
        planId,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // Soft delete by setting is_archived to true
      const { error } = await supabase
        .from('meal_plans')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete meal plan: ${error.message}`);
      }

      // Remove from local state
      const { allMealPlans } = get();
      set({
        allMealPlans: allMealPlans.filter(plan => plan.id !== planId)
      });

      logger.info('MEAL_PLAN_STORE', 'Meal plan deleted successfully', {
        planId,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_STORE', 'Failed to delete meal plan', {
        planId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
});