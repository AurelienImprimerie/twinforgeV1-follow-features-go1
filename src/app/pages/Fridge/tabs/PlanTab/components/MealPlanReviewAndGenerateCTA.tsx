import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';

interface MealPlanReviewAndGenerateCTAProps {
  currentPlan: any;
  onGenerateAllRecipes: () => Promise<void>;
  onRegenerateWeek: () => Promise<void>;
  onExportPlan: () => void;
  clearPlan: () => void;
  isGenerating: boolean;
}

const MealPlanReviewAndGenerateCTA: React.FC<MealPlanReviewAndGenerateCTAProps> = ({
  currentPlan,
  onGenerateAllRecipes,
  onRegenerateWeek,
  onExportPlan,
  clearPlan,
  isGenerating
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Calculate meal and recipe statistics
  const mealStats = useMemo(() => {
    if (!currentPlan?.days) return { 
      totalMeals: 0, 
      generatedRecipes: 0, 
      totalUniqueIngredients: 0,
      totalUniqueRecipes: 0
    };
    
    let totalMeals = 0;
    let generatedRecipes = 0;
    const uniqueIngredients = new Set<string>();
    const uniqueRecipeIds = new Set<string>();
    
    currentPlan.days.forEach((day: any) => {
      if (day.meals) {
        Object.values(day.meals).forEach((meal: any) => {
          if (meal && typeof meal === 'object') {
            totalMeals++;
            
            // Track unique recipes
            if (meal.detailedRecipe?.id) {
              uniqueRecipeIds.add(meal.detailedRecipe.id);
              generatedRecipes++;
            } else if (meal.recipeId) {
              uniqueRecipeIds.add(meal.recipeId);
            }
            
            // Collect ingredients from detailed recipe or main ingredients
            if (meal.detailedRecipe?.ingredients) {
              meal.detailedRecipe.ingredients.forEach((ingredient: any) => {
                if (ingredient.name) {
                  uniqueIngredients.add(ingredient.name.toLowerCase());
                }
              });
            } else if (meal.mainIngredients) {
              meal.mainIngredients.forEach((ingredient: string) => {
                uniqueIngredients.add(ingredient.toLowerCase());
              });
            }
          }
        });
      }
    });
    
    return { 
      totalMeals, 
      generatedRecipes, 
      totalUniqueIngredients: uniqueIngredients.size,
      totalUniqueRecipes: uniqueRecipeIds.size
    };
  }, [currentPlan]);

  const handleGenerateAllRecipes = async () => {
    setIsProcessing(true);
    click();
    try {
      await onGenerateAllRecipes();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerateWeek = async () => {
    setIsRegenerating(true);
    click();
    try {
      await onRegenerateWeek();
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPlan = () => {
    click();
    onExportPlan();
  };

  const handleClearPlan = () => {
    click();
    clearPlan();
  };

  // Don't render during generation to allow progressive day card display
  if (isGenerating) {
    return null;
  }

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      })}
      className="mb-6"
    >
      <GlassCard className="p-6 border-2 border-purple-400/30">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <SpatialIcon Icon={ICONS.CheckCircle} size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Plan de repas généré avec succès !</h3>
            </div>
            <div className="text-sm text-purple-300 font-medium">
              Semaine {currentPlan?.weekNumber || 1}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Progression des recettes</span>
              <span className="text-white font-medium">{mealStats.generatedRecipes}/{mealStats.totalMeals}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: mealStats.totalMeals > 0 ? `${(mealStats.generatedRecipes / mealStats.totalMeals) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{currentPlan?.days?.length || 0}</div>
              <div className="text-sm text-white/70">Jours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{mealStats.totalUniqueRecipes}</div>
              <div className="text-sm text-white/70">Recettes uniques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{mealStats.totalUniqueIngredients}</div>
              <div className="text-sm text-white/70">Ingrédients uniques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {currentPlan?.batchCookingDays?.length > 0 
                  ? currentPlan.batchCookingDays.length 
                  : mealStats.totalMeals}
              </div>
              <div className="text-sm text-white/70">
                {currentPlan?.batchCookingDays?.length > 0 
                  ? 'Jours de batch cooking' 
                  : 'Repas planifiés'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="w-full">
              <button
                onClick={handleGenerateAllRecipes}
                disabled={isProcessing}
                className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={!isProcessing ? (isPerformanceMode ? {
                  background: 'linear-gradient(145deg, color-mix(in srgb, #A855F7 90%, #1e293b), color-mix(in srgb, #9333EA 85%, #0f172a))',
                  border: '2px solid color-mix(in srgb, #A855F7 60%, transparent)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
                } : {
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(147, 51, 234, 0.85) 100%)',
                  backdropFilter: 'blur(20px) saturate(160%)',
                  border: '2px solid color-mix(in srgb, #A855F7 60%, transparent)',
                  boxShadow: `
                    0 12px 40px color-mix(in srgb, #A855F7 40%, transparent),
                    0 0 60px color-mix(in srgb, #A855F7 30%, transparent),
                    inset 0 3px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -3px 0 rgba(0, 0, 0, 0.2),
                    inset 2px 0 0 rgba(255, 255, 255, 0.1),
                    inset -2px 0 0 rgba(0, 0, 0, 0.1)
                  `,
                  transform: 'translateZ(0)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)'
                }) : undefined}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <SpatialIcon Icon={ICONS.Zap} size={20} />
                    <span>Valider & Générer toutes les recettes</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportPlan}
                disabled={isProcessing || isGenerating}
                className="sm:w-auto sm:flex-1 h-10 px-4 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exporter le plan"
              >
                <div className="flex items-center gap-2">
                  <SpatialIcon Icon={ICONS.Download} size={16} />
                  <span>Exporter</span>
                </div>
              </button>
              
              <button
                onClick={handleClearPlan}
                disabled={isProcessing || isGenerating}
                className="sm:w-auto sm:flex-1 h-10 px-4 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Supprimer le plan"
              >
                <div className="flex items-center gap-2">
                  <SpatialIcon Icon={ICONS.Trash2} size={16} />
                  <span>Supprimer</span>
                </div>
              </button>
              
              <button
                onClick={handleRegenerateWeek}
                disabled={isRegenerating || isGenerating}
                className="sm:w-auto sm:flex-1 h-10 px-4 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200"
                title="Régénérer la semaine"
              >
                {isRegenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Régénérer</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SpatialIcon Icon={ICONS.RotateCcw} size={16} />
                    <span>Régénérer</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-purple-500/10 rounded-lg p-4">
            <div className="text-sm text-white/80">
              <p className="font-medium mb-1">💡 Conseil :</p>
              <p>Générez toutes les recettes pour obtenir des instructions détaillées et une liste de courses complète.</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default MealPlanReviewAndGenerateCTA;