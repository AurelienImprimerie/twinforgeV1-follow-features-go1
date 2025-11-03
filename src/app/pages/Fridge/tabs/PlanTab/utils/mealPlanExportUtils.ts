/**
 * Utility functions for meal plan export functionality
 */

/**
 * Formats a meal with detailed recipe information for export
 */
export const formatMeal = (meal: any, mealLabel: string): string | null => {
  if (!meal) return null;
  
  const mealTitle = meal.mealName || meal.title || 'Recette non trouvée';
  let mealText = `  ${mealLabel}: ${mealTitle}`;
  
  // Add detailed recipe information if available
  if (meal.detailedRecipe) {
    // Add ingredients
    if (meal.detailedRecipe.ingredients && meal.detailedRecipe.ingredients.length > 0) {
      mealText += '\n    Ingrédients:';
      meal.detailedRecipe.ingredients.forEach((ingredient: any) => {
        const ingredientText = typeof ingredient === 'string' 
          ? ingredient 
          : `${ingredient.quantity || ''} ${ingredient.unit || ''} ${ingredient.name || ingredient.ingredient || ''}`.trim();
        mealText += `\n      • ${ingredientText}`;
      });
    }
    
    // Add instructions
    if (meal.detailedRecipe.instructions && meal.detailedRecipe.instructions.length > 0) {
      mealText += '\n    Instructions:';
      meal.detailedRecipe.instructions.forEach((instruction: any, index: number) => {
        const instructionText = typeof instruction === 'string' 
          ? instruction 
          : instruction.step || instruction.instruction || '';
        mealText += `\n      ${index + 1}. ${instructionText}`;
      });
    }
    
    // Add nutritional info if available
    if (meal.detailedRecipe.nutritional_info) {
      const nutrition = meal.detailedRecipe.nutritional_info;
      mealText += '\n    Informations nutritionnelles:';
      if (nutrition.calories) mealText += `\n      • Calories: ${nutrition.calories}`;
      if (nutrition.protein) mealText += `\n      • Protéines: ${nutrition.protein}g`;
      if (nutrition.carbs) mealText += `\n      • Glucides: ${nutrition.carbs}g`;
      if (nutrition.fat) mealText += `\n      • Lipides: ${nutrition.fat}g`;
    }
  } else {
    mealText += '\n    (Détails de la recette non disponibles - générez d\'abord la recette détaillée)';
  }
  
  return mealText;
};