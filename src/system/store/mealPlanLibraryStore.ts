/**
 * Meal Plan Library Store
 * Manages saved meal plans (library/consultation mode only)
 * Generation is handled by mealPlanGenerationStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import logger from '../../lib/utils/logger';
import { supabase } from '../supabase/client';
import { useUserStore } from './userStore';

export interface SavedMealPlan {
  id: string;
  user_id: string;
  title: string;
  week_number: number;
  start_date: string;
  end_date: string;
  inventory_id: string | null;
  plan_data: {
    days: any[];
  };
  ai_explanation: string | null;
  nutritional_summary: any | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlanLibraryState {
  // Library state
  savedPlans: SavedMealPlan[];
  selectedPlanId: string | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  showArchived: boolean;
  searchQuery: string;
  selectedWeekFilter: number | null;

  // Actions - Library Management
  loadSavedPlans: () => Promise<void>;
  selectPlan: (planId: string) => void;
  archivePlan: (planId: string) => Promise<void>;
  unarchivePlan: (planId: string) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  updatePlanTitle: (planId: string, title: string) => Promise<void>;
  duplicatePlan: (planId: string) => Promise<void>;

  // Actions - Filters
  setShowArchived: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedWeekFilter: (week: number | null) => void;
  clearFilters: () => void;

  // Computed - Get selected plan
  getSelectedPlan: () => SavedMealPlan | null;
  getFilteredPlans: () => SavedMealPlan[];
}

const STORAGE_KEY = 'twinforge-meal-plan-library-v1';

export const useMealPlanLibraryStore = create<MealPlanLibraryState>()(
  persist(
    (set, get) => ({
      // Initial state
      savedPlans: [],
      selectedPlanId: null,
      isLoading: false,
      error: null,
      showArchived: false,
      searchQuery: '',
      selectedWeekFilter: null,

      // Load saved plans from database
      loadSavedPlans: async () => {
        const userId = useUserStore.getState().session?.user?.id;

        if (!userId) {
          logger.warn('MEAL_PLAN_LIBRARY', 'Cannot load plans: User not authenticated');
          return;
        }

        try {
          set({ isLoading: true, error: null });

          logger.info('MEAL_PLAN_LIBRARY', 'Loading saved plans', { userId });

          const { data, error } = await supabase
            .from('meal_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          set({
            savedPlans: data || [],
            isLoading: false
          });

          logger.info('MEAL_PLAN_LIBRARY', 'Plans loaded successfully', {
            userId,
            planCount: data?.length || 0
          });

        } catch (error) {
          logger.error('MEAL_PLAN_LIBRARY', 'Failed to load plans', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId
          });

          set({
            error: 'Impossible de charger les plans',
            isLoading: false
          });
        }
      },

      // Select a plan for viewing
      selectPlan: (planId: string) => {
        set({ selectedPlanId: planId });

        logger.debug('MEAL_PLAN_LIBRARY', 'Plan selected', { planId });
      },

      // Archive a plan (soft delete)
      archivePlan: async (planId: string) => {
        const userId = useUserStore.getState().session?.user?.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          logger.info('MEAL_PLAN_LIBRARY', 'Archiving plan', { userId, planId });

          const { error } = await supabase
            .from('meal_plans')
            .update({ is_archived: true })
            .eq('id', planId)
            .eq('user_id', userId);

          if (error) {
            throw error;
          }

          // Update local state
          set(state => ({
            savedPlans: state.savedPlans.map(plan =>
              plan.id === planId ? { ...plan, is_archived: true } : plan
            ),
            selectedPlanId: state.selectedPlanId === planId ? null : state.selectedPlanId
          }));

          logger.info('MEAL_PLAN_LIBRARY', 'Plan archived successfully', { planId });

        } catch (error) {
          logger.error('MEAL_PLAN_LIBRARY', 'Failed to archive plan', {
            error: error instanceof Error ? error.message : 'Unknown error',
            planId
          });
          throw error;
        }
      },

      // Unarchive a plan
      unarchivePlan: async (planId: string) => {
        const userId = useUserStore.getState().session?.user?.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          logger.info('MEAL_PLAN_LIBRARY', 'Unarchiving plan', { userId, planId });

          const { error } = await supabase
            .from('meal_plans')
            .update({ is_archived: false })
            .eq('id', planId)
            .eq('user_id', userId);

          if (error) {
            throw error;
          }

          // Update local state
          set(state => ({
            savedPlans: state.savedPlans.map(plan =>
              plan.id === planId ? { ...plan, is_archived: false } : plan
            )
          }));

          logger.info('MEAL_PLAN_LIBRARY', 'Plan unarchived successfully', { planId });

        } catch (error) {
          logger.error('MEAL_PLAN_LIBRARY', 'Failed to unarchive plan', {
            error: error instanceof Error ? error.message : 'Unknown error',
            planId
          });
          throw error;
        }
      },

      // Delete a plan permanently
      deletePlan: async (planId: string) => {
        const userId = useUserStore.getState().session?.user?.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          logger.info('MEAL_PLAN_LIBRARY', 'Deleting plan permanently', { userId, planId });

          const { error } = await supabase
            .from('meal_plans')
            .delete()
            .eq('id', planId)
            .eq('user_id', userId);

          if (error) {
            throw error;
          }

          // Update local state
          set(state => ({
            savedPlans: state.savedPlans.filter(plan => plan.id !== planId),
            selectedPlanId: state.selectedPlanId === planId ? null : state.selectedPlanId
          }));

          logger.info('MEAL_PLAN_LIBRARY', 'Plan deleted successfully', { planId });

        } catch (error) {
          logger.error('MEAL_PLAN_LIBRARY', 'Failed to delete plan', {
            error: error instanceof Error ? error.message : 'Unknown error',
            planId
          });
          throw error;
        }
      },

      // Update plan title
      updatePlanTitle: async (planId: string, title: string) => {
        const userId = useUserStore.getState().session?.user?.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          logger.info('MEAL_PLAN_LIBRARY', 'Updating plan title', { userId, planId, title });

          const { error } = await supabase
            .from('meal_plans')
            .update({ title })
            .eq('id', planId)
            .eq('user_id', userId);

          if (error) {
            throw error;
          }

          // Update local state
          set(state => ({
            savedPlans: state.savedPlans.map(plan =>
              plan.id === planId ? { ...plan, title } : plan
            )
          }));

          logger.info('MEAL_PLAN_LIBRARY', 'Plan title updated successfully', { planId, title });

        } catch (error) {
          logger.error('MEAL_PLAN_LIBRARY', 'Failed to update plan title', {
            error: error instanceof Error ? error.message : 'Unknown error',
            planId
          });
          throw error;
        }
      },

      // Duplicate a plan
      duplicatePlan: async (planId: string) => {
        const userId = useUserStore.getState().session?.user?.id;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        const state = get();
        const originalPlan = state.savedPlans.find(p => p.id === planId);

        if (!originalPlan) {
          throw new Error('Plan not found');
        }

        try {
          logger.info('MEAL_PLAN_LIBRARY', 'Duplicating plan', { userId, planId });

          const { data, error } = await supabase
            .from('meal_plans')
            .insert({
              user_id: userId,
              title: `${originalPlan.title} (Copie)`,
              week_number: originalPlan.week_number,
              start_date: originalPlan.start_date,
              end_date: originalPlan.end_date,
              inventory_id: originalPlan.inventory_id,
              plan_data: originalPlan.plan_data,
              ai_explanation: originalPlan.ai_explanation,
              nutritional_summary: originalPlan.nutritional_summary
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          // Update local state
          set(state => ({
            savedPlans: [data, ...state.savedPlans]
          }));

          logger.info('MEAL_PLAN_LIBRARY', 'Plan duplicated successfully', {
            originalPlanId: planId,
            newPlanId: data.id
          });

          return data;

        } catch (error) {
          logger.error('MEAL_PLAN_LIBRARY', 'Failed to duplicate plan', {
            error: error instanceof Error ? error.message : 'Unknown error',
            planId
          });
          throw error;
        }
      },

      // Filter actions
      setShowArchived: (show: boolean) => {
        set({ showArchived: show });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedWeekFilter: (week: number | null) => {
        set({ selectedWeekFilter: week });
      },

      clearFilters: () => {
        set({
          showArchived: false,
          searchQuery: '',
          selectedWeekFilter: null
        });
      },

      // Computed getters
      getSelectedPlan: () => {
        const state = get();
        return state.savedPlans.find(p => p.id === state.selectedPlanId) || null;
      },

      getFilteredPlans: () => {
        const state = get();
        let filtered = state.savedPlans;

        // Filter by archived status
        if (!state.showArchived) {
          filtered = filtered.filter(plan => !plan.is_archived);
        }

        // Filter by search query
        if (state.searchQuery.trim()) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(plan =>
            plan.title.toLowerCase().includes(query)
          );
        }

        // Filter by week number
        if (state.selectedWeekFilter !== null) {
          filtered = filtered.filter(plan => plan.week_number === state.selectedWeekFilter);
        }

        return filtered;
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedPlanId: state.selectedPlanId,
        showArchived: state.showArchived
      })
    }
  )
);
