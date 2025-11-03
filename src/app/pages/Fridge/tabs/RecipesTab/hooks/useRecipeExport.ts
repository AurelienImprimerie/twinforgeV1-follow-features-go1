import type { Recipe } from '../../../../../../domain/recipe';
import logger from '../../../../../../lib/utils/logger';

interface UseRecipeExportProps {
  allRecipes: Recipe[];
  userId?: string;
  showToast: (toast: any) => void;
  click: () => void;
}

export const useRecipeExport = ({ allRecipes, userId, showToast, click }: UseRecipeExportProps) => {
  
  // Helper function to format a recipe for export
  const formatRecipeForExport = (recipe: Recipe): string => {
    let formatted = `# ${recipe.title}\n\n`;
    
    if (recipe.description) {
      formatted += `${recipe.description}\n\n`;
    }
    
    formatted += `**Temps de préparation:** ${recipe.prepTimeMin || 0} min\n`;
    formatted += `**Temps de cuisson:** ${recipe.cookTimeMin || 0} min\n`;
    formatted += `**Portions:** ${recipe.servings || 2}\n\n`;
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      formatted += `## Ingrédients\n`;
      recipe.ingredients.forEach(ingredient => {
        formatted += `- ${ingredient}\n`;
      });
      formatted += '\n';
    }
    
    if (recipe.instructions && recipe.instructions.length > 0) {
      formatted += `## Instructions\n`;
      recipe.instructions.forEach((instruction, index) => {
        formatted += `${index + 1}. ${instruction}\n`;
      });
      formatted += '\n';
    }
    
    if (recipe.dietaryTags && recipe.dietaryTags.length > 0) {
      formatted += `**Tags:** ${recipe.dietaryTags.join(', ')}\n\n`;
    }
    
    formatted += '---\n\n';
    
    return formatted;
  };

  // Handle export all recipes
  const handleExportAllRecipes = async () => {
    try {
      click();
      
      if (allRecipes.length === 0) {
        showToast({
          type: 'warning',
          title: 'Aucune recette à exporter',
          message: 'Générez d\'abord des recettes pour pouvoir les exporter.',
          duration: 3000
        });
        return;
      }
      
      logger.info('GENERATED_RECIPES_TAB', 'Exporting all recipes', {
        userId,
        recipesCount: allRecipes.length,
        timestamp: new Date().toISOString()
      });
      
      let exportText = `# Mes Recettes Générées\n\n`;
      exportText += `Exporté le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n`;
      exportText += `Total: ${allRecipes.length} recette${allRecipes.length > 1 ? 's' : ''}\n\n`;
      exportText += '='.repeat(50) + '\n\n';
      
      allRecipes.forEach((recipe, index) => {
        exportText += formatRecipeForExport(recipe);
      });
      
      await navigator.clipboard.writeText(exportText);
      
      showToast({
        type: 'success',
        title: 'Recettes exportées !',
        message: `${allRecipes.length} recette${allRecipes.length > 1 ? 's ont été copiées' : ' a été copiée'} dans le presse-papiers.`,
        duration: 4000
      });
      
      logger.info('GENERATED_RECIPES_TAB', 'Recipes exported successfully', {
        userId,
        recipesCount: allRecipes.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('GENERATED_RECIPES_TAB', 'Failed to export recipes', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      showToast({
        type: 'error',
        title: 'Erreur d\'exportation',
        message: 'Impossible d\'exporter les recettes. Veuillez réessayer.',
        duration: 4000
      });
    }
  };

  return {
    handleExportAllRecipes,
    formatRecipeForExport
  };
};