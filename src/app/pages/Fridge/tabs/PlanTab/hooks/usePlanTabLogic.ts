import { useEffect, useMemo, useState } from 'react';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import { useToast } from '../../../../../../ui/components/ToastProvider';
import { useUserStore } from '../../../../../../system/store/userStore';
import { useMealPlanStore } from '../../../../../../system/store/mealPlanStore';
import { generateMealPlan, generateDetailedRecipeForMeal, generateAllDetailedRecipesForDay } from '../../../../../../system/store/mealPlanStore/actions/generationActions';
import logger from '../../../../../../lib/utils/logger';
import { calculateRecipeWorkshopCompletion, getFeatureSpecificGuidance } from '../../../../../../system/profile/profileCompletionService';
import { formatMeal } from '../utils/mealPlanExportUtils';

/**
 * Custom hook that encapsulates all the logic for the PlanTab component
 */
export const usePlanTabLogic = () => {
  const { session, profile } = useUserStore();
  const { 
    currentPlan,
    currentWeek,
    availableInventories,
    selectedInventoryId,
    isGenerating,
    generationProgress,
    loadingMessage,
    currentLoadingTitle,
    currentLoadingSubtitle,
    recipes,
    availableWeeks,
    maxAvailableWeek,
    isWeekAvailable,
    isCurrentWeekActive,
    canGenerateNextWeek,
    getWeekDateRange,
    loadAvailableInventories,
    selectInventory,
    generateMealPlan: storeMealPlanGenerate,
    regenerateWeek,
    generateNextWeek,
    generateSpecificWeek,
    clearPlan,
    setCurrentWeek
  } = useMealPlanStore();
  
  const { click, success } = useFeedback();
  const { showToast } = useToast();
  
  // Check profile completion for planning feature
  const profileCompletion = calculateRecipeWorkshopCompletion(profile);
  const featureGuidance = getFeatureSpecificGuidance(profile, 'planning');
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  
  // États locaux pour le modal de détail de recette
  const [showRecipeDetailModal, setShowRecipeDetailModal] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState<any>(null);

  const userId = session?.user?.id;
  const hasInventory = selectedInventoryId && availableInventories.length > 0;
  const selectedInventory = availableInventories.find(inv => inv.id === selectedInventoryId);

  // Calculate week date range
  const weekDateRange = useMemo(() => {
    const dateRange = getWeekDateRange(currentWeek);
    return {
      formatted: dateRange.formatted,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };
  }, [currentWeek, getWeekDateRange]);

  // Charger les inventaires disponibles au montage
  useEffect(() => {
    if (userId) {
      loadAvailableInventories();
    }
  }, [userId, loadAvailableInventories]);

  // Générer le plan de repas
  const handleGenerateMealPlan = async () => {
    if (!selectedInventoryId || !selectedInventory) {
      showToast({
        type: 'warning',
        title: 'Inventaire requis',
        message: 'Sélectionnez un inventaire pour générer un plan de repas',
        duration: 3000
      });
      return;
    }

    if (!profile) {
      showToast({
        type: 'warning',
        title: 'Profil incomplet',
        message: 'Complétez votre profil nutritionnel pour un plan optimal',
        duration: 3000
      });
      return;
    }

    try {
      logger.info('PLAN_TAB', 'Starting meal plan generation', {
        userId,
        selectedInventoryId,
        inventoryItemsCount: selectedInventory.inventory_final?.length || 0,
        currentWeek,
        timestamp: new Date().toISOString()
      });

      await storeMealPlanGenerate(currentWeek, selectedInventory.inventory_final);
      
      success();
      showToast({
        type: 'success',
        title: 'Plan généré !',
        message: `Plan de repas créé pour la semaine ${currentWeek}`,
        duration: 4000
      });

    } catch (error) {
      logger.error('PLAN_TAB', 'Meal plan generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        selectedInventoryId,
        currentWeek,
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de génération',
        message: 'Impossible de générer le plan de repas',
        duration: 4000
      });
    }
  };

  // Régénérer la semaine actuelle
  const handleRegenerateWeek = async () => {
    console.log('handleRegenerateWeek called', {
      selectedInventoryId,
      selectedInventory: !!selectedInventory,
      currentWeek,
      isGenerating,
      userId
    });

    if (!selectedInventoryId || !selectedInventory) return;
    
    if (isGenerating) {
      console.warn('Cannot regenerate: generation already in progress');
      showToast({
        type: 'warning',
        title: 'Génération en cours',
        message: 'Attendez la fin de la génération actuelle',
        duration: 3000
      });
      return;
    }

    if (!selectedInventory.inventory_final || selectedInventory.inventory_final.length === 0) {
      console.warn('Cannot regenerate: no inventory items', {
        inventoryFinal: selectedInventory.inventory_final
      });
      showToast({
        type: 'warning',
        title: 'Inventaire vide',
        message: 'L\'inventaire sélectionné ne contient aucun ingrédient',
        duration: 3000
      });
      return;
    }

    try {
      console.log('Starting week regeneration', {
        currentWeek,
        inventoryItemsCount: selectedInventory.inventory_final.length
      });
      
      await regenerateWeek(selectedInventory.inventory_final, currentWeek);
      
      console.log('Week regeneration successful');
      success();
      showToast({
        type: 'success',
        title: 'Semaine régénérée !',
        message: `Nouveau plan créé pour la semaine ${currentWeek}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Week regeneration failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        currentWeek,
        selectedInventoryId
      });
      
      showToast({
        type: 'error',
        title: 'Erreur de régénération',
        message: 'Impossible de régénérer la semaine',
        duration: 4000
      });
    }
  };

  // Générer la semaine suivante
  const handleGenerateNextWeek = async () => {
    if (!selectedInventoryId || !selectedInventory) return;

    try {
      await generateNextWeek(selectedInventory.inventory_final);
      
      success();
      showToast({
        type: 'success',
        title: 'Semaine suivante générée !',
        message: `Plan créé pour la semaine ${currentWeek + 1}`,
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de génération',
        message: 'Impossible de générer la semaine suivante',
        duration: 4000
      });
    }
  };

  // Exporter le plan de repas
  const handleExportPlan = async () => {
    if (!currentPlan) return;

    try {
      click();

      // Créer le texte du plan
      const planText = currentPlan.days.map(day => {
        const meals = [];
        
        if (day.meals.breakfast) {
          const formattedMeal = formatMeal(day.meals.breakfast, 'Petit-déjeuner');
          if (formattedMeal) meals.push(formattedMeal);
        }
        if (day.meals.lunch) {
          const formattedMeal = formatMeal(day.meals.lunch, 'Déjeuner');
          if (formattedMeal) meals.push(formattedMeal);
        }
        if (day.meals.dinner) {
          const formattedMeal = formatMeal(day.meals.dinner, 'Dîner');
          if (formattedMeal) meals.push(formattedMeal);
        }
        if (day.meals.snack) {
          const formattedMeal = formatMeal(day.meals.snack, 'Collation');
          if (formattedMeal) meals.push(formattedMeal);
        }
        
        return `${day.dayName}\n${meals.join('\n')}`;
      }).join('\n\n');

      const fullText = `Plan de Repas TwinForge - Semaine ${currentWeek}\n\n${planText}`;

      // Copier dans le presse-papiers
      await navigator.clipboard.writeText(fullText);
      
      success();
      showToast({
        type: 'success',
        title: 'Plan exporté !',
        message: 'Le plan de repas a été copié dans le presse-papiers',
        duration: 3000
      });

    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur d\'export',
        message: 'Impossible de copier le plan dans le presse-papiers',
        duration: 3000
      });
    }
  };

  // Voir les détails d'une recette
  const handleViewRecipe = (meal: any) => {
    // Validate meal/recipe has required data before opening modal
    if (!meal) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Les données de la recette sont manquantes',
        duration: 3000
      });
      return;
    }

    // Build a complete recipe object from meal data
    let recipeToDisplay: any = null;

    // Check if meal has detailedRecipe
    if (meal.detailedRecipe) {
      const detailed = meal.detailedRecipe;

      // Transform instructions to ensure proper format
      const transformedInstructions = (detailed.instructions || []).map((instruction: any, index: number) => {
        if (typeof instruction === 'string') {
          return {
            step: index + 1,
            instruction: instruction
          };
        }
        return instruction;
      });

      recipeToDisplay = {
        ...detailed,
        id: detailed.id || meal.recipeId || crypto.randomUUID(),
        title: detailed.title || meal.mealName || meal.title || 'Recette sans nom',
        imageUrl: meal.imageUrl || detailed.imageUrl,
        instructions: transformedInstructions,
        nutritionalInfo: {
          calories: detailed.nutritionalInfo?.calories || detailed.nutritionalInfo?.kcal || 0,
          protein: detailed.nutritionalInfo?.protein || 0,
          carbs: detailed.nutritionalInfo?.carbs || 0,
          fat: detailed.nutritionalInfo?.fat || 0,
          fiber: detailed.nutritionalInfo?.fiber || 0
        },
        prepTimeMin: detailed.prepTimeMin || meal.estimatedPrepTime || 0,
        cookTimeMin: detailed.cookTimeMin || meal.estimatedCookTime || 0,
        servings: detailed.servings || 2
      };
    } else {
      // Build recipe from basic meal data
      recipeToDisplay = {
        id: meal.recipeId || crypto.randomUUID(),
        title: meal.mealName || meal.title || 'Recette sans nom',
        description: meal.descriptionSummary || meal.description || '',
        ingredients: (meal.mainIngredients || meal.ingredients || []).map((ing: any) => {
          if (typeof ing === 'string') {
            return { name: ing, quantity: '', unit: '' };
          }
          return ing;
        }),
        instructions: [],
        prepTimeMin: meal.estimatedPrepTime || meal.prep_time_min || 0,
        cookTimeMin: meal.estimatedCookTime || meal.cook_time_min || 0,
        servings: meal.servings || 2,
        nutritionalInfo: {
          calories: meal.estimatedCalories || meal.calories_est || 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        imageUrl: meal.imageUrl
      };
    }

    // Final validation
    if (!recipeToDisplay.title && !recipeToDisplay.ingredients && !recipeToDisplay.instructions) {
      showToast({
        type: 'error',
        title: 'Recette incomplète',
        message: 'Cette recette ne contient pas assez d\'informations pour être affichée',
        duration: 3000
      });
      return;
    }

    setSelectedRecipeForDetail(recipeToDisplay);
    setShowRecipeDetailModal(true);
  };

  // Generate all recipes handler
  const handleGenerateAllRecipes = async () => {
    if (!currentPlan) return;
    
    try {
      // Generate detailed recipes for all days sequentially using numerical index
      for (let dayIndex = 0; dayIndex < currentPlan.days.length; dayIndex++) {
        const day = currentPlan.days[dayIndex];
        if (day && day.date) {
          await generateAllDetailedRecipesForDay(dayIndex);
        }
      }
        
      success();
      showToast({
        type: 'success',
        title: 'Toutes les recettes générées !',
        message: 'Les recettes détaillées sont maintenant disponibles',
        duration: 4000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de génération',
        message: 'Impossible de générer toutes les recettes',
        duration: 4000
      });
    }
  };

  // Save plan as is without generating detailed recipes
  const handleSavePlanAsIs = async () => {
    if (!currentPlan) {
      showToast({
        type: 'warning',
        title: 'Aucun plan à enregistrer',
        message: 'Générez d\'abord un plan de repas',
        duration: 3000
      });
      return;
    }

    try {
      click();
      
      logger.info('PLAN_TAB', 'Saving meal plan as is', {
        userId,
        planId: currentPlan.id,
        weekNumber: currentPlan.weekNumber,
        timestamp: new Date().toISOString()
      });

      await useMealPlanStore.getState().saveCurrentMealPlan();
      
      success();
      showToast({
        type: 'success',
        title: 'Plan enregistré !',
        message: `Plan de repas sauvegardé pour la semaine ${currentPlan.weekNumber}`,
        duration: 4000
      });

    } catch (error) {
      logger.error('PLAN_TAB', 'Failed to save meal plan as is', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        planId: currentPlan?.id,
        weekNumber: currentPlan?.weekNumber,
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible d\'enregistrer le plan de repas',
        duration: 4000
      });
    }
  };

  return {
    // State
    currentPlan,
    currentWeek,
    availableInventories,
    selectedInventoryId,
    isGenerating,
    generationProgress,
    loadingMessage,
    currentLoadingTitle,
    currentLoadingSubtitle,
    recipes,
    availableWeeks,
    maxAvailableWeek,
    canGenerateNextWeek,
    profileCompletion,
    featureGuidance,
    nudgeDismissed,
    showRecipeDetailModal,
    selectedRecipeForDetail,
    userId,
    hasInventory,
    selectedInventory,
    weekDateRange,
    
    // Actions
    getWeekDateRange,
    loadAvailableInventories,
    selectInventory,
    generateMealPlan: storeMealPlanGenerate,
    regenerateWeek,
    generateNextWeek,
    generateSpecificWeek,
    clearPlan,
    setCurrentWeek,
    setNudgeDismissed,
    setShowRecipeDetailModal,
    setSelectedRecipeForDetail,
    isWeekAvailable: (weekNumber: number) => availableWeeks.includes(weekNumber),
    
    // Handlers
    handleGenerateMealPlan,
    handleRegenerateWeek,
    handleGenerateNextWeek,
    handleExportPlan,
    handleViewRecipe,
    handleGenerateAllRecipes,
    
    // External functions
    generateDetailedRecipeForMeal,
    generateAllDetailedRecipesForDay
  };
};