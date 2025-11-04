import type { StateCreator } from 'zustand';
import type { MealPlanGenerationPipelineState, MealPlan } from '../types';
import { supabase } from '../../../supabase/client';
import logger from '../../../../lib/utils/logger';
import { nanoid } from 'nanoid';

export interface GenerationActions {
  generateMealPlans: () => Promise<void>;
  generateDetailedRecipes: () => Promise<void>;
  saveMealPlans: () => Promise<void>;
  discardMealPlans: () => void;
  updateMealPlanStatus: (planId: string, status: 'loading' | 'ready') => void;
  updateMealStatus: (planId: string, mealId: string, status: 'loading' | 'ready', recipe?: any) => void;
}

export const createGenerationActions = (
  set: StateCreator<MealPlanGenerationPipelineState>['setState'],
  get: StateCreator<MealPlanGenerationPipelineState>['getState']
): GenerationActions => ({
  generateMealPlans: async () => {
    const state = get();
    const { config, currentSessionId } = state;

    if (!config.selectedInventoryId) {
      throw new Error('Aucun inventaire sélectionné');
    }

    logger.info('MEAL_PLAN_GENERATION_PIPELINE', 'Starting meal plan generation', {
      config,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

    set({
      currentStep: 'generating',
      loadingState: 'generating',
      loadingMessage: 'Analyse de votre inventaire et préférences...',
      simulatedOverallProgress: 20
    });

    try {
      // TODO: Call meal plan generation edge function
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock plans
      const mockPlans: MealPlan[] = [];
      for (let i = 0; i < config.weekCount; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + i * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        mockPlans.push({
          id: nanoid(),
          title: `Plan Semaine ${i + 1}`,
          weekNumber: i + 1,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          batchCookingEnabled: config.batchCooking,
          status: 'loading',
          days: [],
          aiExplanation: 'Plan en cours de génération...'
        });
      }

      set({
        mealPlanCandidates: mockPlans,
        loadingState: 'streaming',
        currentStep: 'validation',
        simulatedOverallProgress: 40
      });

      // Simulate streaming: mark plans as ready progressively
      for (let i = 0; i < mockPlans.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const planWithDays: MealPlan = {
          ...mockPlans[i],
          status: 'ready',
          days: Array.from({ length: 7 }, (_, dayIndex) => ({
            date: new Date(mockPlans[i].startDate).toISOString().split('T')[0],
            dayIndex,
            meals: [
              {
                id: nanoid(),
                mealType: 'breakfast',
                mealName: 'Petit-déjeuner',
                recipeGenerated: false,
                status: 'loading'
              },
              {
                id: nanoid(),
                mealType: 'lunch',
                mealName: 'Déjeuner',
                recipeGenerated: false,
                status: 'loading'
              },
              {
                id: nanoid(),
                mealType: 'dinner',
                mealName: 'Dîner',
                recipeGenerated: false,
                status: 'loading'
              }
            ]
          })),
          aiExplanation: `Plan optimisé pour la semaine ${i + 1} basé sur votre inventaire.`
        };

        set(state => ({
          mealPlanCandidates: state.mealPlanCandidates.map((p, idx) =>
            idx === i ? planWithDays : p
          )
        }));
      }

      set({
        loadingState: 'idle',
        simulatedOverallProgress: 60
      });

      logger.info('MEAL_PLAN_GENERATION_PIPELINE', 'Meal plans generated successfully', {
        planCount: mockPlans.length,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_GENERATION_PIPELINE', 'Generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  },

  generateDetailedRecipes: async () => {
    const state = get();
    const { mealPlanCandidates, currentSessionId } = state;

    logger.info('MEAL_PLAN_GENERATION_PIPELINE', 'Starting detailed recipe generation', {
      planCount: mealPlanCandidates.length,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

    set({
      currentStep: 'recipe_details_generating',
      loadingState: 'generating_recipes',
      loadingMessage: 'Génération des recettes détaillées...',
      simulatedOverallProgress: 60
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      set({
        loadingState: 'streaming_recipes',
        currentStep: 'recipe_details_validation',
        simulatedOverallProgress: 80
      });

      // Simulate recipe generation for each meal
      for (const plan of mealPlanCandidates) {
        for (const day of plan.days) {
          for (const meal of day.meals) {
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockRecipe = {
              id: nanoid(),
              title: meal.mealName,
              description: `Recette détaillée pour ${meal.mealName}`,
              ingredients: [],
              instructions: [],
              prepTime: 15,
              cookTime: 20,
              servings: 2,
              status: 'ready' as const
            };

            set(state => ({
              mealPlanCandidates: state.mealPlanCandidates.map(p =>
                p.id === plan.id
                  ? {
                      ...p,
                      days: p.days.map(d =>
                        d.dayIndex === day.dayIndex
                          ? {
                              ...d,
                              meals: d.meals.map(m =>
                                m.id === meal.id
                                  ? {
                                      ...m,
                                      status: 'ready' as const,
                                      recipeGenerated: true,
                                      recipe: mockRecipe,
                                      recipeId: mockRecipe.id
                                    }
                                  : m
                              )
                            }
                          : d
                      )
                    }
                  : p
              )
            }));
          }
        }
      }

      set({
        loadingState: 'idle',
        simulatedOverallProgress: 100
      });

      logger.info('MEAL_PLAN_GENERATION_PIPELINE', 'Detailed recipes generated successfully', {
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_GENERATION_PIPELINE', 'Recipe generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  },

  saveMealPlans: async () => {
    const state = get();
    const { mealPlanCandidates, currentSessionId, config } = state;
    const { session } = await supabase.auth.getSession();
    const userId = session?.data?.session?.user?.id;

    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }

    logger.info('MEAL_PLAN_GENERATION_PIPELINE', 'Saving meal plans', {
      planCount: mealPlanCandidates.length,
      sessionId: currentSessionId,
      userId,
      timestamp: new Date().toISOString()
    });

    try {
      // Save each meal plan to Supabase
      for (const plan of mealPlanCandidates) {
        const { data: mealPlanData, error: planError } = await supabase
          .from('meal_plans')
          .insert({
            session_id: currentSessionId,
            user_id: userId,
            inventory_session_id: config.selectedInventoryId,
            week_number: plan.weekNumber,
            start_date: plan.startDate,
            end_date: plan.endDate,
            batch_cooking_enabled: plan.batchCookingEnabled,
            ai_explanation: plan.aiExplanation,
            nutritional_summary: plan.nutritionalSummary,
            title: plan.title,
            status: 'completed',
            is_archived: false,
            plan_data: { days: plan.days }
          })
          .select()
          .single();

        if (planError) throw planError;

        logger.debug('MEAL_PLAN_GENERATION_PIPELINE', 'Meal plan saved', {
          planId: mealPlanData.id,
          weekNumber: plan.weekNumber,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('MEAL_PLAN_GENERATION_PIPELINE', 'All meal plans saved successfully', {
        planCount: mealPlanCandidates.length,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEAL_PLAN_GENERATION_PIPELINE', 'Failed to save meal plans', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  },

  discardMealPlans: () => {
    const state = get();

    set({
      mealPlanCandidates: [],
      currentStep: 'configuration',
      simulatedOverallProgress: 0,
      loadingState: 'idle'
    });

    logger.info('MEAL_PLAN_GENERATION_PIPELINE', 'Meal plans discarded', {
      sessionId: state.currentSessionId,
      timestamp: new Date().toISOString()
    });
  },

  updateMealPlanStatus: (planId: string, status: 'loading' | 'ready') => {
    set(state => ({
      mealPlanCandidates: state.mealPlanCandidates.map(p =>
        p.id === planId ? { ...p, status } : p
      )
    }));
  },

  updateMealStatus: (planId: string, mealId: string, status: 'loading' | 'ready', recipe?: any) => {
    set(state => ({
      mealPlanCandidates: state.mealPlanCandidates.map(p =>
        p.id === planId
          ? {
              ...p,
              days: p.days.map(d => ({
                ...d,
                meals: d.meals.map(m =>
                  m.id === mealId
                    ? { ...m, status, recipe, recipeGenerated: !!recipe }
                    : m
                )
              }))
            }
          : p
      )
    }));
  }
});
