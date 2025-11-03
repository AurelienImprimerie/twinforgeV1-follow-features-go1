import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import type { Recipe } from '../../../../../domain/recipe';

interface RecipeValidationCTAProps {
  newlyGeneratedRecipes: Recipe[];
  onSaveAllNewRecipes: () => Promise<void>;
  onDiscardNewRecipes: () => void;
  isGenerating: boolean;
}

const RecipeValidationCTA: React.FC<RecipeValidationCTAProps> = ({
  newlyGeneratedRecipes,
  onSaveAllNewRecipes,
  onDiscardNewRecipes,
  isGenerating
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Calculate average time from recipes
  const averageTime = useMemo(() => {
    if (newlyGeneratedRecipes.length === 0) return 0;
    
    const totalTime = newlyGeneratedRecipes.reduce((sum, recipe) => {
      const prepTime = recipe.prepTimeMin || 0;
      const cookTime = recipe.cookTimeMin || 0;
      return sum + prepTime + cookTime;
    }, 0);
    
    return Math.round(totalTime / newlyGeneratedRecipes.length);
  }, [newlyGeneratedRecipes]);

  const handleSaveAllNewRecipes = async () => {
    setIsProcessing(true);
    click();
    try {
      await onSaveAllNewRecipes();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiscardNewRecipes = () => {
    click();
    onDiscardNewRecipes();
  };

  // Skeleton loading state
  if (isGenerating) {
    return (
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 }
        })}
        className="mb-6"
      >
        <GlassCard className="p-6 border-2 border-pink-400/30">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" />
                <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
              </div>
              <div className="w-16 h-6 bg-white/20 rounded animate-pulse" />
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 w-12 bg-white/20 rounded mx-auto animate-pulse" />
                  <div className="h-4 w-16 bg-white/20 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>

            {/* Buttons skeleton */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 h-12 bg-white/20 rounded-xl animate-pulse" />
              <div className="w-full sm:w-auto h-12 bg-white/20 rounded-xl animate-pulse" />
            </div>

            {/* Tips skeleton */}
            <div className="bg-pink-500/10 rounded-lg p-4 space-y-2">
              <div className="h-4 w-3/4 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </GlassCard>
      </MotionDiv>
    );
  }

  if (newlyGeneratedRecipes.length === 0) {
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
      <GlassCard className="p-6 border-2 border-pink-400/30">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SpatialIcon 
                Icon={ICONS.ChefHat} 
                size={32} 
                className="text-pink-400" 
              />
              <div>
                <h3 className="text-xl font-bold text-white">
                  {newlyGeneratedRecipes.length} Nouvelles Recettes Générées !
                </h3>
                <p className="text-sm text-white/70">
                  Vos recettes personnalisées sont prêtes
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-pink-400 font-medium">Prêt !</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{newlyGeneratedRecipes.length}</div>
              <div className="text-sm text-white/70">Recettes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{averageTime}</div>
              <div className="text-sm text-white/70">Min moy.</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {Math.round(newlyGeneratedRecipes.reduce((total, recipe) => {
                  return total + (recipe.servings || 1);
                }, 0) / newlyGeneratedRecipes.length)}
              </div>
              <div className="text-sm text-white/70">Portions</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveAllNewRecipes}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border-2 border-green-400/30 rounded-xl px-6 py-3 text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <SpatialIcon Icon={ICONS.Save} size={20} />
                  <span>Sauvegarder Toutes</span>
                </>
              )}
            </button>

            <button
              onClick={handleDiscardNewRecipes}
              disabled={isProcessing}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl px-4 py-3 text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SpatialIcon Icon={ICONS.Trash2} size={16} />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          </div>

          {/* Tips Section */}
          <div className="bg-pink-500/10 rounded-lg p-4">
            <div className="text-sm text-white/80">
              <p className="font-medium mb-1">💡 Conseil :</p>
              <p>Sauvegardez vos recettes préférées pour les retrouver facilement et créer vos listes de courses personnalisées.</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default RecipeValidationCTA;