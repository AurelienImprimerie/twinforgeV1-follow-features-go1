/**
 * Progression Metrics Utilities
 * Utility functions for calculating progression metrics
 */
import { format } from 'date-fns';

export interface ProgressionMetrics {
  avgDailyCalories: number;
  targetCalories: number;
  calorieAdherence: number;
  proteinAdherence: number;
  mealsScanned: number;
  consistency: number;
  avgMacros: {
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  proteinTarget: number;
  daysWithMeals: number;
}

/**
 * Calculate progression metrics from week meals and profile
 */
export function getProgressionMetrics(weekMeals: any[], profile: any): ProgressionMetrics | null {
  if (!weekMeals || !profile) return null;
  
  const totalCalories = weekMeals.reduce((sum, meal) => sum + (meal.total_kcal || 0), 0);
  const avgDailyCalories = Math.round(totalCalories / 7);
  
  // Calculer les macros moyens
  const totalMacros = weekMeals.reduce((acc, meal) => {
    const items = meal.items || [];
    items.forEach((item: any) => {
      acc.proteins += item.proteins || 0;
      acc.carbs += item.carbs || 0;
      acc.fats += item.fats || 0;
      acc.fiber += item.fiber || 0;
    });
    return acc;
  }, { proteins: 0, carbs: 0, fats: 0, fiber: 0 });
  
  const avgMacros = {
    proteins: Math.round(totalMacros.proteins / 7),
    carbs: Math.round(totalMacros.carbs / 7),
    fats: Math.round(totalMacros.fats / 7),
    fiber: Math.round(totalMacros.fiber / 7),
  };
  
  // Calculer l'objectif calorique basé sur le profil
  const targetCalories = profile?.calculated_metrics?.daily_calorie_target || 
    (profile?.weight_kg ? profile.weight_kg * 25 : 2000);
  
  const proteinTarget = profile?.nutrition?.proteinTarget_g || 
    (profile?.weight_kg ? profile.weight_kg * 1.6 : 120);
  
  const calorieAdherence = Math.min(100, (avgDailyCalories / targetCalories) * 100);
  const proteinAdherence = Math.min(100, (avgMacros.proteins / proteinTarget) * 100);
  
  // Calculer la régularité (nombre de jours avec au moins un repas)
  const daysWithMeals = new Set(weekMeals.map(meal => 
    format(new Date(meal.timestamp), 'yyyy-MM-dd')
  )).size;
  const consistency = Math.round((daysWithMeals / 7) * 100);
  
  return {
    avgDailyCalories,
    targetCalories,
    calorieAdherence: Math.round(calorieAdherence),
    proteinAdherence: Math.round(proteinAdherence),
    mealsScanned: weekMeals.length,
    consistency,
    avgMacros,
    proteinTarget,
    daysWithMeals,
  };
}