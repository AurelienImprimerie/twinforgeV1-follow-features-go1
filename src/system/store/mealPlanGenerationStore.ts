import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import logger from '../../lib/utils/logger';
import { supabase } from '../supabase/client';
import { useUserStore } from './userStore';

export type MealPlanGenerationStep = 'configuration' | 'generating_plan' | 'preview' | 'generating_recipes' | 'validation';

export interface MealPlanGenerationStepData {
  id: MealPlanGenerationStep;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  startProgress: number;
}

export interface MealPlanGenerationConfig {
  selectedInventoryId: string | null;
  weekCount: number;
  batchCookingEnabled: boolean;
}

export interface MealPlanCandidate {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: any[];
  aiExplanation?: string;
  nutritionalSummary?: any;
}

export interface MealPlanGenerationState {
  currentStep: MealPlanGenerationStep;
  isActive: boolean;
  currentSessionId: string | null;
  simulatedOverallProgress: number;
  planCandidates: MealPlanCandidate[];
  loadingState: 'idle' | 'generating' | 'streaming';
  loadingMessage: string;
  steps: MealPlanGenerationStepData[];
  config: MealPlanGenerationConfig;

  startPipeline: () => void;
  goToStep: (step: MealPlanGenerationStep) => void;
  setConfig: (config: Partial<MealPlanGenerationConfig>) => void;
  generateMealPlans: () => Promise<void>;
  generateDetailedRecipes: () => Promise<void>;
  savePlans: () => Promise<void>;
  discardPlans: () => void;
  resetPipeline: () => void;
  regenerateWeek: (weekNumber: number) => Promise<void>;
  regenerateMeal: (weekNumber: number, dayIndex: number, mealType: string) => Promise<void>;
}

const MEAL_PLAN_GENERATION_STEPS: MealPlanGenerationStepData[] = [
  {
    id: 'configuration',
    title: 'Configuration',
    subtitle: 'Sélection de l\'inventaire et options',
    icon: 'Settings',
    color: '#3b82f6',
    startProgress: 0
  },
  {
    id: 'generating_plan',
    title: 'Génération du Plan',
    subtitle: 'Création du plan hebdomadaire',
    icon: 'Sparkles',
    color: '#8b5cf6',
    startProgress: 20
  },
  {
    id: 'preview',
    title: 'Aperçu',
    subtitle: 'Revue et régénération possible',
    icon: 'Eye',
    color: '#06b6d4',
    startProgress: 50
  },
  {
    id: 'generating_recipes',
    title: 'Génération des Recettes',
    subtitle: 'Détails complets des recettes',
    icon: 'ChefHat',
    color: '#f59e0b',
    startProgress: 70
  },
  {
    id: 'validation',
    title: 'Validation',
    subtitle: 'Sauvegarde dans la bibliothèque',
    icon: 'Check',
    color: '#10b981',
    startProgress: 90
  }
];

const STORAGE_KEY = 'twinforge-meal-plan-generation-v1';

export const useMealPlanGenerationStore = create<MealPlanGenerationState>()(
  persist(
    (set, get) => ({
      currentStep: 'configuration',
      isActive: false,
      currentSessionId: null,
      simulatedOverallProgress: 0,
      planCandidates: [],
      loadingState: 'idle',
      loadingMessage: '',
      steps: MEAL_PLAN_GENERATION_STEPS,
      config: {
        selectedInventoryId: null,
        weekCount: 1,
        batchCookingEnabled: false
      },

      startPipeline: () => {
        const sessionId = nanoid();
        set({
          isActive: true,
          currentSessionId: sessionId,
          currentStep: 'configuration',
          simulatedOverallProgress: 0,
          planCandidates: [],
          loadingState: 'idle',
          loadingMessage: ''
        });

        logger.info('MEAL_PLAN_GENERATION', 'Pipeline started', {
          sessionId,
          timestamp: new Date().toISOString()
        });
      },

      goToStep: (step: MealPlanGenerationStep) => {
        const stepData = MEAL_PLAN_GENERATION_STEPS.find(s => s.id === step);
        set({
          currentStep: step,
          simulatedOverallProgress: stepData?.startProgress || 0
        });

        logger.debug('MEAL_PLAN_GENERATION', 'Step changed', {
          newStep: step,
          progress: stepData?.startProgress,
          sessionId: get().currentSessionId
        });
      },

      setConfig: (config: Partial<MealPlanGenerationConfig>) => {
        set(state => ({
          config: { ...state.config, ...config }
        }));

        logger.debug('MEAL_PLAN_GENERATION', 'Config updated', {
          config: get().config,
          sessionId: get().currentSessionId
        });
      },

      generateMealPlans: async () => {
        const state = get();
        const { config, currentSessionId } = state;
        const userId = useUserStore.getState().session?.user?.id;
        const profile = useUserStore.getState().profile;

        if (!userId || !profile) {
          throw new Error('User not authenticated or profile missing');
        }

        if (!config.selectedInventoryId) {
          throw new Error('No inventory selected');
        }

        try {
          set({
            loadingState: 'generating',
            loadingMessage: 'Génération du plan de repas...',
            currentStep: 'generating_plan',
            simulatedOverallProgress: 20
          });

          logger.info('MEAL_PLAN_GENERATION', 'Starting plan generation', {
            userId,
            inventoryId: config.selectedInventoryId,
            weekCount: config.weekCount,
            sessionId: currentSessionId
          });

          // Fetch inventory
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('fridge_scan_sessions')
            .select('inventory_final')
            .eq('id', config.selectedInventoryId)
            .maybeSingle();

          if (inventoryError || !inventoryData) {
            throw new Error('Failed to fetch inventory');
          }

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meal-plan-generator`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                inventory: inventoryData.inventory_final,
                profile: profile,
                weekCount: config.weekCount,
                batchCookingEnabled: config.batchCookingEnabled
              })
            }
          );

          if (!response.ok) {
            throw new Error('Failed to generate meal plan');
          }

          const result = await response.json();

          const candidates: MealPlanCandidate[] = result.plans.map((plan: any, index: number) => ({
            id: nanoid(),
            weekNumber: index + 1,
            startDate: plan.startDate,
            endDate: plan.endDate,
            days: plan.days,
            aiExplanation: plan.aiExplanation,
            nutritionalSummary: plan.nutritionalSummary
          }));

          set({
            planCandidates: candidates,
            currentStep: 'preview',
            simulatedOverallProgress: 50,
            loadingState: 'idle',
            loadingMessage: ''
          });

          logger.info('MEAL_PLAN_GENERATION', 'Plans generated successfully', {
            planCount: candidates.length,
            sessionId: currentSessionId
          });

        } catch (error) {
          logger.error('MEAL_PLAN_GENERATION', 'Plan generation failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            sessionId: currentSessionId
          });

          set({
            loadingState: 'idle',
            loadingMessage: '',
            currentStep: 'configuration'
          });

          throw error;
        }
      },

      generateDetailedRecipes: async () => {
        const state = get();
        const { planCandidates, currentSessionId } = state;

        if (planCandidates.length === 0) {
          throw new Error('No plans to generate recipes for');
        }

        try {
          set({
            loadingState: 'generating',
            loadingMessage: 'Génération des recettes détaillées...',
            currentStep: 'generating_recipes',
            simulatedOverallProgress: 70
          });

          logger.info('MEAL_PLAN_GENERATION', 'Starting recipe generation', {
            planCount: planCandidates.length,
            sessionId: currentSessionId
          });

          // Generate detailed recipes for all meals in all plans
          const updatedCandidates = await Promise.all(
            planCandidates.map(async (plan) => {
              const updatedDays = await Promise.all(
                plan.days.map(async (day: any) => {
                  const updatedMeals: any = {};

                  for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack']) {
                    const meal = day.meals[mealType];
                    if (meal) {
                      const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recipe-detail-generator`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                          },
                          body: JSON.stringify({ meal })
                        }
                      );

                      if (response.ok) {
                        const detailedRecipe = await response.json();
                        updatedMeals[mealType] = {
                          ...meal,
                          detailedRecipe: detailedRecipe.recipe
                        };
                      } else {
                        updatedMeals[mealType] = meal;
                      }
                    }
                  }

                  return {
                    ...day,
                    meals: updatedMeals
                  };
                })
              );

              return {
                ...plan,
                days: updatedDays
              };
            })
          );

          set({
            planCandidates: updatedCandidates,
            currentStep: 'validation',
            simulatedOverallProgress: 90,
            loadingState: 'idle',
            loadingMessage: ''
          });

          logger.info('MEAL_PLAN_GENERATION', 'Recipes generated successfully', {
            sessionId: currentSessionId
          });

        } catch (error) {
          logger.error('MEAL_PLAN_GENERATION', 'Recipe generation failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            sessionId: currentSessionId
          });

          set({
            loadingState: 'idle',
            loadingMessage: '',
            currentStep: 'preview'
          });

          throw error;
        }
      },

      savePlans: async () => {
        const state = get();
        const { planCandidates, config, currentSessionId } = state;
        const userId = useUserStore.getState().session?.user?.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        if (planCandidates.length === 0) {
          throw new Error('No plans to save');
        }

        try {
          set({
            loadingState: 'streaming',
            loadingMessage: 'Sauvegarde des plans...'
          });

          logger.info('MEAL_PLAN_GENERATION', 'Saving plans to database', {
            userId,
            planCount: planCandidates.length,
            sessionId: currentSessionId
          });

          const plansToSave = planCandidates.map(plan => ({
            user_id: userId,
            title: `Plan Semaine ${plan.weekNumber}`,
            week_number: plan.weekNumber,
            start_date: plan.startDate,
            end_date: plan.endDate,
            inventory_id: config.selectedInventoryId,
            plan_data: {
              days: plan.days
            },
            ai_explanation: plan.aiExplanation,
            nutritional_summary: plan.nutritionalSummary,
            batch_cooking_enabled: config.batchCookingEnabled,
            status: 'active'
          }));

          const { error } = await supabase
            .from('meal_plans')
            .insert(plansToSave);

          if (error) {
            throw error;
          }

          logger.info('MEAL_PLAN_GENERATION', 'Plans saved successfully', {
            userId,
            planCount: planCandidates.length,
            sessionId: currentSessionId
          });

          set({
            loadingState: 'idle',
            loadingMessage: '',
            simulatedOverallProgress: 100
          });

        } catch (error) {
          logger.error('MEAL_PLAN_GENERATION', 'Failed to save plans', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId,
            sessionId: currentSessionId
          });

          set({
            loadingState: 'idle',
            loadingMessage: ''
          });

          throw error;
        }
      },

      discardPlans: () => {
        set({
          planCandidates: [],
          currentStep: 'configuration',
          simulatedOverallProgress: 0,
          loadingState: 'idle',
          loadingMessage: ''
        });

        logger.info('MEAL_PLAN_GENERATION', 'Plans discarded', {
          sessionId: get().currentSessionId
        });
      },

      resetPipeline: () => {
        set({
          isActive: false,
          currentSessionId: null,
          currentStep: 'configuration',
          simulatedOverallProgress: 0,
          planCandidates: [],
          loadingState: 'idle',
          loadingMessage: '',
          config: {
            selectedInventoryId: null,
            weekCount: 1,
            batchCookingEnabled: false
          }
        });

        logger.info('MEAL_PLAN_GENERATION', 'Pipeline reset', {
          timestamp: new Date().toISOString()
        });
      },

      regenerateWeek: async (weekNumber: number) => {
        const state = get();
        const { planCandidates } = state;
        const planIndex = planCandidates.findIndex(p => p.weekNumber === weekNumber);

        if (planIndex === -1) {
          throw new Error('Plan not found');
        }

        logger.info('MEAL_PLAN_GENERATION', 'Regenerating week', {
          weekNumber,
          sessionId: state.currentSessionId
        });

        // Implement week regeneration logic here
        // For now, just log
      },

      regenerateMeal: async (weekNumber: number, dayIndex: number, mealType: string) => {
        const state = get();

        logger.info('MEAL_PLAN_GENERATION', 'Regenerating meal', {
          weekNumber,
          dayIndex,
          mealType,
          sessionId: state.currentSessionId
        });

        // Implement meal regeneration logic here
        // For now, just log
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        currentSessionId: state.currentSessionId
      })
    }
  )
);
