import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../../../system/supabase/client';
import type { Recipe } from '../../../../../../domain/recipe';
import logger from '../../../../../../lib/utils/logger';

interface UseRecipeDataProps {
  userId?: string;
  profile: any;
  userEditedInventory: any[];
  recipeCandidates: Recipe[];
  clearRecipeCandidates: () => void;
  showToast: (toast: any) => void;
  click: () => void;
  success: () => void;
}

export const useRecipeData = ({
  userId,
  profile,
  userEditedInventory,
  recipeCandidates,
  clearRecipeCandidates,
  showToast,
  click,
  success
}: UseRecipeDataProps) => {
  const [persistedRecipes, setPersistedRecipes] = useState<Recipe[]>([]);
  const [loadingPersistedRecipes, setLoadingPersistedRecipes] = useState(true);

  // Identify newly generated recipes (in candidates but not in persisted)
  const newlyGeneratedRecipes = useMemo(() => {
    return recipeCandidates.filter(candidate => 
      !persistedRecipes.some(persisted => persisted.id === candidate.id)
    );
  }, [recipeCandidates, persistedRecipes]);

  // Combine persisted and newly generated recipes
  const allRecipes = useMemo(() => {
    const persistedIds = new Set(persistedRecipes.map(r => r.id));
    const newRecipes = recipeCandidates.filter(r => !persistedIds.has(r.id));
    return [...newRecipes, ...persistedRecipes];
  }, [persistedRecipes, recipeCandidates]);

  // Fetch persisted recipes from database
  const fetchPersistedRecipes = async () => {
    if (!userId) return;

    try {
      setLoadingPersistedRecipes(true);
      
      logger.info('GENERATED_RECIPES_TAB', 'Fetching persisted recipes from database', {
        userId,
        timestamp: new Date().toISOString()
      });

      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id,
          session_id,
          title,
          description,
          ingredients,
          instructions,
          prep_time_min,
          cook_time_min,
          servings,
          dietary_tags,
          nutritional_info,
          image_url,
          image_signature,
          reasons,
          created_at,
          updated_at,
          recipe_sessions!inner(user_id)
        `)
        .eq('recipe_sessions.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`);
      }

      // Convert database format to Recipe format
      const formattedRecipes: Recipe[] = (recipes || []).map(recipe => ({
        id: recipe.id,
        sessionId: recipe.session_id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        prepTimeMin: recipe.prep_time_min || 0,
        cookTimeMin: recipe.cook_time_min || 0,
        servings: recipe.servings || 2,
        dietaryTags: recipe.dietary_tags || [],
        nutritionalInfo: recipe.nutritional_info || {},
        imageUrl: recipe.image_url,
        imageSignature: recipe.image_signature,
        reasons: recipe.reasons || [],
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at,
        status: 'ready'
      }));

      setPersistedRecipes(formattedRecipes);

      logger.info('GENERATED_RECIPES_TAB', 'Successfully fetched persisted recipes', {
        userId,
        recipesCount: formattedRecipes.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('GENERATED_RECIPES_TAB', 'Failed to fetch persisted recipes', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger vos recettes sauvegardées.',
        duration: 4000
      });
    } finally {
      setLoadingPersistedRecipes(false);
    }
  };

  // Save recipe to database
  const saveRecipeToDb = async (recipe: Recipe) => {
    if (!userId) {
      showToast({
        type: 'error',
        title: 'Erreur d\'authentification',
        message: 'Vous devez être connecté pour sauvegarder des recettes.',
        duration: 4000
      });
      return;
    }

    try {
      logger.info('GENERATED_RECIPES_TAB', 'Saving recipe to database', {
        userId,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        timestamp: new Date().toISOString()
      });

      // Create or get session for this recipe
      let sessionId = recipe.sessionId;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
      }

      // Prepare user preferences snapshot
      const preferencesSnapshot = {
        nutrition: profile?.nutrition || {},
        householdDetails: profile?.householdDetails || {},
        mealPrepPreferences: profile?.mealPrepPreferences || {},
        kitchenEquipment: profile?.kitchenEquipment || {},
        foodPreferences: profile?.foodPreferences || {},
        sensoryPreferences: profile?.sensoryPreferences || {},
        macroTargets: profile?.macroTargets || {},
        shoppingPreferences: profile?.shoppingPreferences || {}
      };

      // Create or update recipe session
      const { error: sessionError } = await supabase
        .from('recipe_sessions')
        .upsert({
          id: sessionId,
          user_id: userId,
          inventory_final: userEditedInventory || [],
          selected_recipe_ids: [recipe.id],
          preferences_snapshot: preferencesSnapshot,
          filters_snapshot: {},
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (sessionError) {
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }

      // Save recipe to database
      const { error: recipeError } = await supabase
        .from('recipes')
        .upsert({
          id: recipe.id,
          session_id: sessionId,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time_min: recipe.prepTimeMin,
          cook_time_min: recipe.cookTimeMin,
          servings: recipe.servings,
          dietary_tags: recipe.dietaryTags,
          nutritional_info: recipe.nutritionalInfo,
          ...(recipe.imageUrl && { image_url: recipe.imageUrl }),
          image_signature: recipe.imageSignature,
          reasons: recipe.reasons,
          created_at: recipe.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (recipeError) {
        throw new Error(`Failed to save recipe: ${recipeError.message}`);
      }

      // Update local state
      const savedRecipe = { ...recipe, sessionId };
      setPersistedRecipes(prev => {
        const existing = prev.find(r => r.id === recipe.id);
        if (existing) {
          return prev.map(r => r.id === recipe.id ? savedRecipe : r);
        }
        return [savedRecipe, ...prev];
      });

      showToast({
        type: 'success',
        title: 'Recette sauvegardée',
        message: `"${recipe.title}" a été ajoutée à votre bibliothèque.`,
        duration: 3000
      });

      logger.info('GENERATED_RECIPES_TAB', 'Recipe saved successfully', {
        userId,
        recipeId: recipe.id,
        sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('GENERATED_RECIPES_TAB', 'Failed to save recipe', {
        userId,
        recipeId: recipe.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder la recette. Veuillez réessayer.',
        duration: 4000
      });
    }
  };

  // Delete recipe from database
  const deleteRecipeFromDb = async (recipeId: string) => {
    if (!userId) return;

    try {
      logger.info('GENERATED_RECIPES_TAB', 'Deleting recipe from database', {
        userId,
        recipeId,
        timestamp: new Date().toISOString()
      });

      // Delete recipe from database
      const { error: recipeError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (recipeError) {
        throw new Error(`Failed to delete recipe: ${recipeError.message}`);
      }

      // Update local state
      setPersistedRecipes(prev => prev.filter(r => r.id !== recipeId));

      const deletedRecipe = persistedRecipes.find(r => r.id === recipeId);
      showToast({
        type: 'success',
        title: 'Recette supprimée',
        message: `"${deletedRecipe?.title || 'La recette'}" a été supprimée de votre bibliothèque.`,
        duration: 3000
      });

      logger.info('GENERATED_RECIPES_TAB', 'Recipe deleted successfully', {
        userId,
        recipeId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('GENERATED_RECIPES_TAB', 'Failed to delete recipe', {
        userId,
        recipeId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de suppression',
        message: 'Impossible de supprimer la recette. Veuillez réessayer.',
        duration: 4000
      });
    }
  };

  // Handle recipe save/delete toggle
  const handleToggleSaveStatus = async (recipe: Recipe) => {
    click();
    
    const isSaved = persistedRecipes.some(r => r.id === recipe.id);
    
    if (isSaved) {
      await deleteRecipeFromDb(recipe.id);
      logger.debug('GENERATED_RECIPES_TAB', 'Recipe removed from library', {
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        timestamp: new Date().toISOString()
      });
    } else {
      await saveRecipeToDb(recipe);
      logger.debug('GENERATED_RECIPES_TAB', 'Recipe added to library', {
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Save all newly generated recipes
  const handleSaveAllNewRecipes = async () => {
    try {
      for (const recipe of newlyGeneratedRecipes) {
        await saveRecipeToDb(recipe);
      }
      
      success();
      showToast({
        type: 'success',
        title: 'Recettes sauvegardées !',
        message: `${newlyGeneratedRecipes.length} recettes ont été ajoutées à votre collection`,
        duration: 4000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder toutes les recettes',
        duration: 4000
      });
    }
  };

  // Discard all newly generated recipes
  const handleDiscardNewRecipes = () => {
    clearRecipeCandidates();
    showToast({
      type: 'info',
      title: 'Recettes supprimées',
      message: `${newlyGeneratedRecipes.length} nouvelles recettes ont été supprimées`,
      duration: 3000
    });
  };

  // Fetch recipes on component mount and user change
  useEffect(() => {
    if (userId) {
      fetchPersistedRecipes();
    }
  }, [userId]);

  // Sync recipeCandidates changes immediately to trigger re-render
  useEffect(() => {
    if (recipeCandidates.length > 0) {
      logger.info('GENERATED_RECIPES_TAB', 'recipeCandidates updated, triggering re-render', {
        recipeCandidatesCount: recipeCandidates.length,
        newlyGeneratedCount: newlyGeneratedRecipes.length,
        persistedCount: persistedRecipes.length,
        allRecipesCount: allRecipes.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [recipeCandidates, newlyGeneratedRecipes, allRecipes]);

  // Refetch recipes when component gains focus (e.g., switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        fetchPersistedRecipes();
      }
    };

    const handleFocus = () => {
      if (userId) {
        fetchPersistedRecipes();
      }
    };

    // Listen for custom event when recipes are updated
    const handleRecipesUpdated = (event: CustomEvent) => {
      logger.info('GENERATED_RECIPES_TAB', 'Received recipes-updated event, refetching recipes', {
        sessionId: event.detail?.sessionId,
        userId,
        timestamp: new Date().toISOString()
      });

      if (userId) {
        fetchPersistedRecipes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('recipes-updated', handleRecipesUpdated as EventListener);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('recipes-updated', handleRecipesUpdated as EventListener);
    };
  }, [userId]);

  return {
    persistedRecipes,
    loadingPersistedRecipes,
    newlyGeneratedRecipes,
    allRecipes,
    fetchPersistedRecipes,
    saveRecipeToDb,
    deleteRecipeFromDb,
    handleToggleSaveStatus,
    handleSaveAllNewRecipes,
    handleDiscardNewRecipes
  };
};