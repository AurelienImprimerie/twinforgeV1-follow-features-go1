/**
 * NutritionDataCollector - Collect all nutrition data for user
 * Aggregates meals, meal plans, dietary preferences, and nutritional stats
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '../../../../lib/utils/logger';
import type { NutritionKnowledge, MealSummary, MealPlanSummary } from '../../types';

export class NutritionDataCollector {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async collect(userId: string): Promise<NutritionKnowledge> {
    try {
      logger.info('NUTRITION_DATA_COLLECTOR', 'Starting nutrition data collection', { userId });

      const [mealsResult, mealPlansResult, profileResult] = await Promise.allSettled([
        this.collectRecentMeals(userId),
        this.collectMealPlans(userId),
        this.getUserProfile(userId)
      ]);

      const recentMeals = mealsResult.status === 'fulfilled' ? mealsResult.value : [];
      const mealPlan = mealPlansResult.status === 'fulfilled' ? mealPlansResult.value : null;
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;

      // Calculate nutrition stats from recent meals
      const { avgCalories, avgProtein } = this.calculateNutritionStats(recentMeals);

      // Get scan frequency (last 30 days)
      const lastScanDate = recentMeals.length > 0 ? recentMeals[0].date : null;
      const scanFrequency = recentMeals.length; // Total meals in last 30 days

      const hasData = recentMeals.length > 0 || !!mealPlan;

      logger.info('NUTRITION_DATA_COLLECTOR', 'Nutrition data collected', {
        userId,
        mealsCount: recentMeals.length,
        hasMealPlan: !!mealPlan,
        avgCalories,
        avgProtein,
        hasData
      });

      return {
        recentMeals,
        mealPlan,
        scanFrequency,
        lastScanDate,
        averageCalories: avgCalories,
        averageProtein: avgProtein,
        dietaryPreferences: profile?.dietary_preferences || [],
        hasData
      };
    } catch (error) {
      logger.error('NUTRITION_DATA_COLLECTOR', 'Failed to collect nutrition data', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Collect recent meals (last 30 days)
   */
  private async collectRecentMeals(userId: string): Promise<MealSummary[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: meals, error } = await this.supabase
      .from('meals')
      .select('id, meal_name, timestamp, total_kcal, meal_type')
      .eq('user_id', userId)
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('NUTRITION_DATA_COLLECTOR', 'Failed to load meals', { userId, error });
      return [];
    }

    if (!meals || meals.length === 0) {
      return [];
    }

    return meals.map((meal) => ({
      id: meal.id,
      name: meal.meal_name || 'Repas',
      date: meal.timestamp,
      calories: meal.total_kcal || 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      mealType: meal.meal_type || 'unknown'
    }));
  }

  /**
   * Collect active meal plans
   */
  private async collectMealPlans(userId: string): Promise<MealPlanSummary | null> {
    // Meal plans table doesn't exist yet, return null
    return null;

    /* const { data: mealPlan, error } = await this.supabase
      .from('meal_plans')
      .select('id, week_start_date, week_end_date, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !mealPlan) {
      return null;
    }

    // Count planned meals
    const { count } = await this.supabase
      .from('meals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('meal_plan_id', mealPlan.id);

    return {
      id: mealPlan.id,
      weekStart: mealPlan.week_start_date,
      weekEnd: mealPlan.week_end_date,
      isActive: mealPlan.is_active,
      mealsPlanned: count || 0
    }; */
  }

  /**
   * Get user dietary preferences from profile
   */
  private async getUserProfile(userId: string): Promise<any> {
    const { data: profile } = await this.supabase
      .from('user_profile')
      .select('nutrition')
      .eq('user_id', userId)
      .maybeSingle();

    return profile?.nutrition || {};
  }

  /**
   * Calculate average nutrition stats
   */
  private calculateNutritionStats(meals: MealSummary[]): {
    avgCalories: number;
    avgProtein: number;
  } {
    if (meals.length === 0) {
      return { avgCalories: 0, avgProtein: 0 };
    }

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

    return {
      avgCalories: Math.round(totalCalories / meals.length),
      avgProtein: Math.round(totalProtein / meals.length)
    };
  }
}
