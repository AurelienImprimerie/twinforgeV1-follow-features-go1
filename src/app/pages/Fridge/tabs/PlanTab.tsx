import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { useMealPlanLibraryStore } from '../../../../system/store/mealPlanLibraryStore';
import { useUserStore } from '../../../../system/store/userStore';
import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';
import PlanLibraryList from './PlanTab/components/PlanLibraryList';
import PlanLibraryFilters from './PlanTab/components/PlanLibraryFilters';
import PlanLibraryViewer from './PlanTab/components/PlanLibraryViewer';
import RecipeDetailModal from './RecipesTab/components/RecipeDetailModal';
import logger from '../../../../lib/utils/logger';

/**
 * Plan Tab - Library View Only
 * Displays saved meal plans with filtering and selection capabilities
 * Generation is handled by the dedicated MealPlanGenerationPage pipeline
 */
const PlanTab: React.FC = () => {
  const navigate = useNavigate();
  const { click, success } = useFeedback();
  const { showToast } = useToast();
  const { session } = useUserStore();

  const {
    savedPlans,
    selectedPlanId,
    isLoading,
    error,
    showArchived,
    searchQuery,
    selectedWeekFilter,
    loadSavedPlans,
    selectPlan,
    archivePlan,
    unarchivePlan,
    deletePlan,
    duplicatePlan,
    updatePlanTitle,
    setShowArchived,
    setSearchQuery,
    setSelectedWeekFilter,
    clearFilters,
    getSelectedPlan,
    getFilteredPlans
  } = useMealPlanLibraryStore();

  const [showRecipeDetailModal, setShowRecipeDetailModal] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<any>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Load plans on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadSavedPlans();
    }
  }, [session?.user?.id, loadSavedPlans]);

  // Get filtered plans and selected plan
  const filteredPlans = getFilteredPlans();
  const selectedPlan = getSelectedPlan();

  // Get unique weeks for filter
  const availableWeeks = Array.from(
    new Set(savedPlans.map(plan => plan.week_number))
  ).sort((a, b) => a - b);

  // Check if filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || showArchived || selectedWeekFilter !== null;

  // Handle create new plan
  const handleCreateNewPlan = () => {
    click();
    navigate('/meal-plan-generation');
  };

  // Handle archive plan
  const handleArchivePlan = async (planId: string) => {
    try {
      await archivePlan(planId);
      success();
      showToast({
        type: 'success',
        title: 'Plan archivé',
        message: 'Le plan a été archivé avec succès',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'archiver le plan',
        duration: 3000
      });
    }
  };

  // Handle unarchive plan
  const handleUnarchivePlan = async (planId: string) => {
    try {
      await unarchivePlan(planId);
      success();
      showToast({
        type: 'success',
        title: 'Plan désarchivé',
        message: 'Le plan a été restauré avec succès',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de désarchiver le plan',
        duration: 3000
      });
    }
  };

  // Handle delete plan
  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan(planId);
      success();
      showToast({
        type: 'success',
        title: 'Plan supprimé',
        message: 'Le plan a été supprimé définitivement',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer le plan',
        duration: 3000
      });
    }
  };

  // Handle duplicate plan
  const handleDuplicatePlan = async (planId: string) => {
    try {
      await duplicatePlan(planId);
      success();
      showToast({
        type: 'success',
        title: 'Plan dupliqué',
        message: 'Une copie du plan a été créée',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de dupliquer le plan',
        duration: 3000
      });
    }
  };

  // Handle edit title
  const handleStartEditTitle = (planId: string) => {
    const plan = savedPlans.find(p => p.id === planId);
    if (plan) {
      setEditingPlanId(planId);
      setEditingTitle(plan.title);
    }
  };

  const handleSaveTitle = async () => {
    if (!editingPlanId || !editingTitle.trim()) return;

    try {
      await updatePlanTitle(editingPlanId, editingTitle.trim());
      success();
      setEditingPlanId(null);
      setEditingTitle('');
      showToast({
        type: 'success',
        title: 'Titre modifié',
        message: 'Le titre du plan a été mis à jour',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de modifier le titre',
        duration: 3000
      });
    }
  };

  // Handle export plan
  const handleExportPlan = async () => {
    if (!selectedPlan) return;

    try {
      click();

      // Create the text of the plan
      const planText = selectedPlan.plan_data.days.map((day: any) => {
        const meals = [];

        if (day.meals.breakfast) {
          meals.push(`Petit-déjeuner: ${day.meals.breakfast.mealName}`);
        }
        if (day.meals.lunch) {
          meals.push(`Déjeuner: ${day.meals.lunch.mealName}`);
        }
        if (day.meals.dinner) {
          meals.push(`Dîner: ${day.meals.dinner.mealName}`);
        }
        if (day.meals.snack) {
          meals.push(`Collation: ${day.meals.snack.mealName}`);
        }

        return `${day.dayName}\n${meals.join('\n')}`;
      }).join('\n\n');

      const fullText = `${selectedPlan.title}\n${selectedPlan.start_date} - ${selectedPlan.end_date}\n\n${planText}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(fullText);

      success();
      showToast({
        type: 'success',
        title: 'Plan exporté',
        message: 'Le plan a été copié dans le presse-papiers',
        duration: 3000
      });

    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur d\'export',
        message: 'Impossible de copier le plan',
        duration: 3000
      });
    }
  };

  // Handle view recipe
  const handleViewRecipe = (meal: any) => {
    if (!meal) return;

    // Build a complete recipe object from meal data
    let recipeToDisplay: any = null;

    if (meal.detailedRecipe) {
      recipeToDisplay = {
        ...meal.detailedRecipe,
        id: meal.detailedRecipe.id || meal.recipeId || crypto.randomUUID(),
        title: meal.detailedRecipe.title || meal.mealName || 'Recette',
        imageUrl: meal.imageUrl || meal.detailedRecipe.imageUrl
      };
    } else {
      recipeToDisplay = {
        id: meal.recipeId || crypto.randomUUID(),
        title: meal.mealName || 'Recette',
        description: meal.descriptionSummary || '',
        ingredients: (meal.mainIngredients || []).map((ing: any) => {
          if (typeof ing === 'string') {
            return { name: ing, quantity: '', unit: '' };
          }
          return ing;
        }),
        instructions: [],
        prepTimeMin: meal.estimatedPrepTime || 0,
        cookTimeMin: meal.estimatedCookTime || 0,
        servings: 2,
        nutritionalInfo: {
          calories: meal.estimatedCalories || 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        imageUrl: meal.imageUrl
      };
    }

    setSelectedRecipeForDetail(recipeToDisplay);
    setShowRecipeDetailModal(true);
  };

  // Show loading state
  if (isLoading && savedPlans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Chargement de vos plans...</p>
        </div>
      </motion.div>
    );
  }

  // Show error state
  if (error && savedPlans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => loadSavedPlans()}
          className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-xl text-white font-medium transition-colors"
        >
          Réessayer
        </button>
      </motion.div>
    );
  }

  // Empty state - no plans yet
  if (savedPlans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-20 h-20 mx-auto mb-6 text-white/40" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Bienvenue dans votre Bibliothèque de Plans
          </h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Créez votre premier plan de repas personnalisé en quelques clics. Basé sur votre inventaire et vos préférences, notre système génère des plans adaptés à vos besoins.
          </p>
          <button
            onClick={handleCreateNewPlan}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Créer mon premier plan
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Bibliothèque de Plans
          </h2>
          <p className="text-white/70">
            {filteredPlans.length} plan{filteredPlans.length > 1 ? 's' : ''} disponible{filteredPlans.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateNewPlan}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouveau Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PlanLibraryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showArchived={showArchived}
            onShowArchivedChange={setShowArchived}
            selectedWeekFilter={selectedWeekFilter}
            onWeekFilterChange={setSelectedWeekFilter}
            availableWeeks={availableWeeks}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Plans List or Viewer */}
        <div className="lg:col-span-2">
          {selectedPlan ? (
            <PlanLibraryViewer
              plan={selectedPlan}
              onViewRecipe={handleViewRecipe}
              onExport={handleExportPlan}
            />
          ) : (
            <PlanLibraryList
              plans={filteredPlans}
              selectedPlanId={selectedPlanId}
              onSelectPlan={selectPlan}
              onArchivePlan={handleArchivePlan}
              onUnarchivePlan={handleUnarchivePlan}
              onDeletePlan={handleDeletePlan}
              onDuplicatePlan={handleDuplicatePlan}
              onEditTitle={handleStartEditTitle}
            />
          )}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {showRecipeDetailModal && selectedRecipeForDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeForDetail}
          onClose={() => {
            setShowRecipeDetailModal(false);
            setSelectedRecipeForDetail(null);
          }}
        />
      )}

      {/* Edit Title Modal */}
      {editingPlanId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Modifier le titre</h3>
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Nouveau titre..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingPlanId(null);
                  setEditingTitle('');
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveTitle}
                disabled={!editingTitle.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PlanTab;
