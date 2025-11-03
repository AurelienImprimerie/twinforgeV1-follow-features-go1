/**
 * Chart Data Utilities for Meal Insights
 * Utility functions for preparing chart data
 */

import { format } from 'date-fns';

export interface MacroDistributionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  target: number;
}

/**
 * Prepare chart data for macro distribution
 */
export function getChartData(monthMeals: any[]): { macroDistribution: MacroDistributionData[] } {
  if (!monthMeals) return { macroDistribution: [] };
  
  // Données pour la distribution des macronutriments
  const totalMacros = monthMeals.reduce((acc, meal) => {
    const items = meal.items || [];
    items.forEach((item: any) => {
      acc.proteins += item.proteins || 0;
      acc.carbs += item.carbs || 0;
      acc.fats += item.fats || 0;
      acc.fiber += item.fiber || 0;
    });
    return acc;
  }, { proteins: 0, carbs: 0, fats: 0, fiber: 0 });
  
  const totalMacroWeight = totalMacros.proteins + totalMacros.carbs + totalMacros.fats;
  
  const macroDistribution: MacroDistributionData[] = [
    {
      name: 'Protéines',
      value: Math.round(totalMacros.proteins),
      percentage: totalMacroWeight > 0 ? Math.round((totalMacros.proteins / totalMacroWeight) * 100) : 0,
      color: '#EF4444',
      target: 25, // 25% recommandé
    },
    {
      name: 'Glucides',
      value: Math.round(totalMacros.carbs),
      percentage: totalMacroWeight > 0 ? Math.round((totalMacros.carbs / totalMacroWeight) * 100) : 0,
      color: '#F59E0B',
      target: 45, // 45% recommandé
    },
    {
      name: 'Lipides',
      value: Math.round(totalMacros.fats),
      percentage: totalMacroWeight > 0 ? Math.round((totalMacros.fats / totalMacroWeight) * 100) : 0,
      color: '#8B5CF6',
      target: 30, // 30% recommandé
    },
  ];
  
  return { macroDistribution };
}