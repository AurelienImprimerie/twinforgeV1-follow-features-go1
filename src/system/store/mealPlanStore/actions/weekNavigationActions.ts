/**
 * Week Navigation Actions for Meal Plan Store
 * Handles week navigation and availability checks
 */

import logger from '../../../../lib/utils/logger';
import type { MealPlanState } from '../types';
import { getWeekStartDate, formatDateRange } from '../constants';

export interface WeekNavigationActions {
  setCurrentWeek: (weekNumber: number) => Promise<void>;
  isWeekAvailable: (weekNumber: number) => boolean;
  isCurrentWeekActive: (weekNumber: number) => boolean;
  getWeekDateRange: (weekNumber: number) => { formatted: string; startDate: string; endDate: string };
  canGenerateNextWeek: () => boolean;
}

export const createWeekNavigationActions = (
  set: (partial: Partial<MealPlanState>) => void,
  get: () => MealPlanState
): WeekNavigationActions => ({
  setCurrentWeek: async (weekNumber: number) => {
    const state = get();
    
    logger.info('MEAL_PLAN_STORE', 'Setting current week', {
      weekNumber,
      previousWeek: state.currentWeek,
      timestamp: new Date().toISOString()
    });

    // If we have a plan for this week, load it
    if (state.currentPlan && state.currentPlan.weekNumber === weekNumber) {
      // Already have the correct plan loaded
      set({ currentWeek: weekNumber });
      return;
    }

    // Try to fetch the meal plan for this week
    await get().fetchMealPlanForWeek(weekNumber);
    
    set({ currentWeek: weekNumber });
  },

  isWeekAvailable: (weekNumber: number) => {
    const state = get();
    return state.availableWeeks.includes(weekNumber);
  },

  isCurrentWeekActive: (weekNumber: number) => {
    const state = get();
    return state.currentWeek === weekNumber;
  },

  getWeekDateRange: (weekNumber: number) => {
    const state = get();
    const startDate = getWeekStartDate(weekNumber, state.referenceStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return formatDateRange(startDate, endDate);
  },

  canGenerateNextWeek: () => {
    const state = get();
    // Can generate next week if we have at least one week generated and not currently generating
    return state.maxAvailableWeek > 0 && !state.isGenerating;
  }
});