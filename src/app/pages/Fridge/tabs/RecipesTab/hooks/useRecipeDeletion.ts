import type { Recipe } from '../../../../../../domain/recipe';
import logger from '../../../../../../lib/utils/logger';

interface UseRecipeDeletionProps {
  allRecipes: Recipe[];
  persistedRecipes: Recipe[];
  newlyGeneratedRecipes: Recipe[];
  userId?: string;
  showToast: (toast: any) => void;
  click: () => void;
  clearRecipeCandidates: () => void;
  deleteRecipeFromDb: (recipeId: string) => Promise<void>;
}

export const useRecipeDeletion = ({
  allRecipes,
  persistedRecipes,
  newlyGeneratedRecipes,
  userId,
  showToast,
  click,
  clearRecipeCandidates,
  deleteRecipeFromDb
}: UseRecipeDeletionProps) => {

  // Handle delete all recipes
  const handleDeleteAllRecipes = async () => {
    try {
      click();
      
      if (allRecipes.length === 0) {
        showToast({
          type: 'warning',
          title: 'Aucune recette à supprimer',
          message: 'Il n\'y a aucune recette à supprimer.',
          duration: 3000
        });
        return;
      }
      
      logger.info('GENERATED_RECIPES_TAB', 'Deleting all recipes', {
        userId,
        totalRecipes: allRecipes.length,
        persistedRecipes: persistedRecipes.length,
        newRecipes: newlyGeneratedRecipes.length,
        timestamp: new Date().toISOString()
      });
      
      // Clear newly generated recipes from pipeline
      clearRecipeCandidates();
      
      // Delete persisted recipes from database
      const deletePromises = persistedRecipes.map(recipe => deleteRecipeFromDb(recipe.id));
      await Promise.all(deletePromises);
      
      showToast({
        type: 'success',
        title: 'Recettes supprimées !',
        message: `${allRecipes.length} recette${allRecipes.length > 1 ? 's ont été supprimées' : ' a été supprimée'} de votre collection.`,
        duration: 4000
      });
      
      logger.info('GENERATED_RECIPES_TAB', 'All recipes deleted successfully', {
        userId,
        deletedCount: allRecipes.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('GENERATED_RECIPES_TAB', 'Failed to delete all recipes', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      showToast({
        type: 'error',
        title: 'Erreur de suppression',
        message: 'Impossible de supprimer toutes les recettes. Veuillez réessayer.',
        duration: 4000
      });
    }
  };

  return {
    handleDeleteAllRecipes
  };
};