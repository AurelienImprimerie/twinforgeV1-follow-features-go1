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

      const [mealsResult, mealPlansResult, profileResult, fridgeResult, recipesResult] = await Promise.allSettled([
        this.collectRecentMeals(userId),
        this.collectMealPlans(userId),
        this.getUserProfile(userId),
        this.collectFridgeInventory(userId),
        this.collectGeneratedRecipes(userId)
      ]);

      const recentMeals = mealsResult.status === 'fulfilled' ? mealsResult.value : [];
      const mealPlan = mealPlansResult.status === 'fulfilled' ? mealPlansResult.value : null;
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const fridgeInventory = fridgeResult.status === 'fulfilled' ? fridgeResult.value : [];
      const generatedRecipes = recipesResult.status === 'fulfilled' ? recipesResult.value : [];

      // Calculate nutrition stats from recent meals
      const { avgCalories, avgProtein } = this.calculateNutritionStats(recentMeals);

      // Get scan frequency (last 30 days)
      const lastScanDate = recentMeals.length > 0 ? recentMeals[0].date : null;
      const scanFrequency = recentMeals.length; // Total meals in last 30 days

      // Extract culinary preferences
      const culinaryPreferences = this.extractCulinaryPreferences(profile, recentMeals, generatedRecipes);

      const hasData = recentMeals.length > 0 || !!mealPlan || fridgeInventory.length > 0;

      logger.info('NUTRITION_DATA_COLLECTOR', 'Nutrition data collected', {
        userId,
        mealsCount: recentMeals.length,
        hasMealPlan: !!mealPlan,
        fridgeItemsCount: fridgeInventory.length,
        recipesCount: generatedRecipes.length,
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
        fridgeInventory,
        generatedRecipes: generatedRecipes.slice(0, 10), // Top 10 most recent
        lastFridgeScanDate: fridgeInventory.length > 0 ? fridgeInventory[0].scannedAt : null,
        culinaryPreferences,
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
   * Collect fridge inventory items
   */
  private async collectFridgeInventory(userId: string): Promise<Array<{
    id: string;
    name: string;
    category: string;
    quantity: string;
    scannedAt: string;
  }>> {
    const { data: sessions, error: sessionsError } = await this.supabase
      .from('fridge_scan_sessions')
      .select('id, created_at, inventory_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionsError || !sessions || !sessions.inventory_data) {
      return [];
    }

    // Extract items from inventory_data
    const inventoryData = sessions.inventory_data as any;
    if (!Array.isArray(inventoryData)) {
      return [];
    }

    return inventoryData
      .filter((item: any) => item && item.name)
      .map((item: any) => ({
        id: item.id || `item-${Math.random()}`,
        name: item.name || item.label || 'Inconnu',
        category: item.category || 'autre',
        quantity: item.quantity || item.estimatedQuantity || '1',
        scannedAt: sessions.created_at
      }))
      .slice(0, 50); // Limit to 50 items
  }

  /**
   * Collect generated recipes
   */
  private async collectGeneratedRecipes(userId: string): Promise<Array<{
    id: string;
    title: string;
    cuisine: string;
    cookingTime: number;
    difficulty: string;
    createdAt: string;
  }>> {
    const { data: sessions, error } = await this.supabase
      .from('fridge_scan_sessions')
      .select('id, created_at, recipe_candidates')
      .eq('user_id', userId)
      .not('recipe_candidates', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !sessions) {
      return [];
    }

    const allRecipes: Array<{
      id: string;
      title: string;
      cuisine: string;
      cookingTime: number;
      difficulty: string;
      createdAt: string;
    }> = [];

    sessions.forEach((session) => {
      const recipeCandidates = session.recipe_candidates as any;
      if (Array.isArray(recipeCandidates)) {
        recipeCandidates.forEach((recipe: any) => {
          if (recipe && recipe.title) {
            allRecipes.push({
              id: recipe.id || `recipe-${Math.random()}`,
              title: recipe.title,
              cuisine: recipe.cuisine || 'international',
              cookingTime: recipe.cookingTime || recipe.cooking_time || 30,
              difficulty: recipe.difficulty || 'medium',
              createdAt: session.created_at
            });
          }
        });
      }
    });

    return allRecipes.slice(0, 20); // Top 20 most recent
  }

  /**
   * Extract culinary preferences from user data
   */
  private extractCulinaryPreferences(
    profile: any,
    meals: MealSummary[],
    recipes: Array<{ cuisine: string }>
  ): {
    favoriteCuisines: string[];
    cookingSkillLevel: string;
    mealPrepTime: { weekday: number; weekend: number };
  } {
    // Extract favorite cuisines from generated recipes
    const cuisineCounts: Record<string, number> = {};
    recipes.forEach((recipe) => {
      cuisineCounts[recipe.cuisine] = (cuisineCounts[recipe.cuisine] || 0) + 1;
    });

    const favoriteCuisines = Object.entries(cuisineCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cuisine]) => cuisine);

    // Get cooking skill level from profile
    const cookingSkillLevel =
      profile?.nutrition?.meal_prep_preferences?.cooking_skill || 'intermediate';

    // Get meal prep time preferences
    const mealPrepTime = {
      weekday:
        profile?.nutrition?.meal_prep_preferences?.weekday_time_min || 30,
      weekend:
        profile?.nutrition?.meal_prep_preferences?.weekend_time_min || 60
    };

    return {
      favoriteCuisines,
      cookingSkillLevel,
      mealPrepTime
    };
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
