import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFridgeScanPipeline } from '../../../../system/store/fridgeScan';
import { useUserStore } from '../../../../system/store/userStore';
import { useMealPlanStore } from '../../../../system/store/mealPlanStore';
import type { Recipe } from '../../../../domain/recipe';
import RecipeDetailModal from './RecipesTab/components/RecipeDetailModal';
import RecipeCard from './RecipesTab/components/RecipeCard';
import RecipeGenerationHeader from './RecipesTab/components/RecipeGenerationHeader';
import RecipeFilterSystem from './RecipesTab/components/RecipeFilterSystem';
import RecipeGenerationLoader from './RecipesTab/components/RecipeGenerationLoader';
import EmptyRecipesState from './RecipesTab/components/EmptyRecipesState';
import RecipeValidationCTA from './RecipesTab/components/RecipeValidationCTA';
import RecipeActionButtons from './RecipesTab/components/RecipeActionButtons';
import { useRecipeData } from './RecipesTab/hooks/useRecipeData';
import { useRecipeFiltering } from './RecipesTab/hooks/useRecipeFiltering';
import { useRecipeExport } from './RecipesTab/hooks/useRecipeExport';
import { useRecipeDeletion } from './RecipesTab/hooks/useRecipeDeletion';

/**
 * Recipes Tab - Bibliothèque Persistante de Recettes Générées
 * Gère à la fois les nouvelles recettes générées et les recettes sauvegardées
 */
const RecipesTab: React.FC = () => {
  const navigate = useNavigate();
  const [showRecipeDetailModal, setShowRecipeDetailModal] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<Recipe | null>(null);
  const { click, success } = useFeedback();
  const { showToast } = useToast();

  // Store state
  const {
    recipeCandidates,
    loadingState,
    userEditedInventory,
    generateRecipes,
    clearRecipeCandidates,
    startScan
  } = useFridgeScanPipeline();

  // User state
  const { session, profile } = useUserStore();
  const userId = session?.user?.id;

  // Meal plan store for inventory management
  const {
    availableInventories,
    selectedInventoryId,
    selectInventory,
    loadAvailableInventories
  } = useMealPlanStore();

  // Custom hooks for modular functionality
  const {
    persistedRecipes,
    loadingPersistedRecipes,
    newlyGeneratedRecipes,
    allRecipes,
    handleToggleSaveStatus,
    handleSaveAllNewRecipes,
    handleDiscardNewRecipes,
    deleteRecipeFromDb
  } = useRecipeData({
    userId,
    profile,
    userEditedInventory,
    recipeCandidates,
    clearRecipeCandidates,
    showToast,
    click,
    success
  });

  const {
    searchFilter,
    setSearchFilter,
    selectedFilters,
    setSelectedFilters,
    maxPrepTime,
    setMaxPrepTime,
    maxCookTime,
    setMaxCookTime,
    minServings,
    setMinServings,
    filteredRecipes,
    displayedRecipes,
    hasMoreRecipes,
    handleLoadMore
  } = useRecipeFiltering({ allRecipes });

  const { handleExportAllRecipes } = useRecipeExport({
    allRecipes,
    userId,
    showToast,
    click
  });

  const { handleDeleteAllRecipes } = useRecipeDeletion({
    allRecipes,
    persistedRecipes,
    newlyGeneratedRecipes,
    userId,
    showToast,
    click,
    clearRecipeCandidates,
    deleteRecipeFromDb
  });

  // Load available inventories on mount
  React.useEffect(() => {
    if (userId) {
      loadAvailableInventories();
    }
  }, [userId, loadAvailableInventories]);

  // Calculate if we have a selected inventory with items
  const hasSelectedInventory = React.useMemo(() => {
    if (!selectedInventoryId) return false;
    const selectedInventory = availableInventories.find(inv => inv.id === selectedInventoryId);
    return selectedInventory && selectedInventory.inventory_final && selectedInventory.inventory_final.length > 0;
  }, [selectedInventoryId, availableInventories]);

  // Handle recipe view
  const handleViewRecipe = (recipe: Recipe) => {
    click();

    // Validate recipe has required data before opening modal
    if (!recipe) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Les données de la recette sont manquantes',
        duration: 3000
      });
      return;
    }

    // Check if recipe has at least basic info (relaxed validation)
    if (!recipe.title) {
      showToast({
        type: 'error',
        title: 'Recette incomplète',
        message: 'Cette recette ne contient pas assez d\'informations pour être affichée',
        duration: 3000
      });
      return;
    }

    // Set selected recipe and open modal
    setSelectedRecipeForDetail(recipe);
    setShowRecipeDetailModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowRecipeDetailModal(false);
    setSelectedRecipeForDetail(null);
  };

  // Handle start fridge scan
  const handleStartFridgeScan = () => {
    startScan();
    navigate('/fridge/scan');
  };

  const isGenerating = loadingState === 'generating' || loadingState === 'streaming';
  const hasRecipes = allRecipes.length > 0;
  const isLoading = loadingPersistedRecipes || isGenerating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* En-tête de Génération */}
      {hasRecipes && !isLoading && (
        <RecipeGenerationHeader
          availableInventories={availableInventories}
          selectedInventoryId={selectedInventoryId}
          onSelectInventory={selectInventory}
          onGenerateRecipes={() => {
            const selectedInventory = availableInventories.find(inv => inv.id === selectedInventoryId);
            if (selectedInventory && selectedInventory.inventory_final.length > 0) {
              generateRecipes();
            } else {
              showToast({
                type: 'warning',
                title: 'Aucun inventaire sélectionné',
                message: 'Veuillez sélectionner un inventaire avec des ingrédients pour générer des recettes.',
                duration: 3000
              });
            }
          }}
          isGenerating={isGenerating}
        />
      )}

      {/* Loader de génération */}
      {isGenerating && !loadingPersistedRecipes && <RecipeGenerationLoader />}

      {/* Recipe Validation CTA */}
      {newlyGeneratedRecipes.length > 0 && (
        <RecipeValidationCTA
          newlyGeneratedRecipes={newlyGeneratedRecipes}
          onSaveAllNewRecipes={handleSaveAllNewRecipes}
          onDiscardNewRecipes={handleDiscardNewRecipes}
          isGenerating={isGenerating}
        />
      )}

      {/* En-tête avec Filtres et Boutons d'Action */}
      {!isGenerating && hasRecipes && !isLoading && (
        <>
          <RecipeFilterSystem
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            recipesCount={filteredRecipes.length}
            totalRecipesCount={allRecipes.length}
            isGenerating={isGenerating}
            maxPrepTime={maxPrepTime}
            setMaxPrepTime={setMaxPrepTime}
            maxCookTime={maxCookTime}
            setMaxCookTime={setMaxCookTime}
            minServings={minServings}
            setMinServings={setMinServings}
          />

          {/* Boutons d'Action - Positionnés après les filtres */}
          <RecipeActionButtons
            onExportAllRecipes={handleExportAllRecipes}
            onDeleteAllRecipes={handleDeleteAllRecipes}
            recipesCount={allRecipes.length}
          />
        </>
      )}

      {/* Contenu Principal */}
      {!hasRecipes && !isLoading ? (
        <EmptyRecipesState 
          selectedInventoryId={selectedInventoryId}
          availableInventories={availableInventories}
          hasSelectedInventory={hasSelectedInventory}
          onGenerateRecipes={() => {
            const selectedInventory = availableInventories.find(inv => inv.id === selectedInventoryId);
            if (selectedInventory && selectedInventory.inventory_final.length > 0) {
              generateRecipes();
            } else {
              showToast({
                type: 'warning',
                title: 'Aucun inventaire sélectionné',
                message: 'Veuillez sélectionner un inventaire avec des ingrédients pour générer des recettes.',
                duration: 3000
              });
            }
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* État de Chargement Initial */}
          {loadingPersistedRecipes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <GlassCard className="p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto">
                    <SpatialIcon 
                      Icon={ICONS.Loader2} 
                      size={64} 
                      className="animate-spin text-blue-400" 
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Chargement de votre bibliothèque...
                    </h3>
                    <p className="text-white/70">
                      Récupération de vos recettes sauvegardées
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Grille de Recettes */}
          {!loadingPersistedRecipes && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {displayedRecipes.map((recipe, index) => {
                    const isSaved = persistedRecipes.some(r => r.id === recipe.id);
                    const isNewlyGenerated = recipeCandidates.some(r => r.id === recipe.id) && !isSaved;

                    return (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        index={index}
                        isSaved={isSaved}
                        isNewlyGenerated={isNewlyGenerated}
                        isLoading={recipe.status === 'loading'}
                        onToggleSaveStatus={() => handleToggleSaveStatus(recipe)}
                        onView={handleViewRecipe}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Load More Button */}
              {hasMoreRecipes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105"
                  >
                    Charger plus de recettes ({filteredRecipes.length - displayedRecipes.length} restantes)
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Message si aucune recette après filtrage */}
          {hasRecipes && filteredRecipes.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <GlassCard className="p-8">
                <div className="space-y-4">
                  <SpatialIcon 
                    Icon={ICONS.Search} 
                    size={48} 
                    className="mx-auto text-white/50" 
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Aucune recette trouvée
                    </h3>
                    <p className="text-white/70">
                      Essayez de modifier vos filtres ou votre recherche
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {showRecipeDetailModal && selectedRecipeForDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeForDetail}
          onClose={handleCloseModal}
          onToggleSave={handleToggleSaveStatus}
          isSaved={persistedRecipes.some(r => r.id === selectedRecipeForDetail.id)}
        />
      )}
    </motion.div>
  );
};

export default RecipesTab;