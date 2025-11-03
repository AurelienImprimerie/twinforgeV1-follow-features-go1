import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import { ICONS } from '../../../../../ui/icons/registry';
import { useShoppingListStore } from '../../../../../system/store/shoppingListStore';
import { useMealPlanStore } from '../../../../../system/store/mealPlanStore';
import CustomDropdown from '../RecipesTab/components/CustomDropdown';
import logger from '../../../../../lib/utils/logger';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

/**
 * Shopping List Generator Card - Header-style layout inspired by Plan tab
 */
const ShoppingListGeneratorCard: React.FC = () => {
  const {
    generationMode,
    selectedMealPlanId,
    setGenerationMode,
    setSelectedMealPlanId,
    generateShoppingList
  } = useShoppingListStore();

  const { allMealPlans, loadAllMealPlans } = useMealPlanStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const { isPerformanceMode } = usePerformanceMode();

  // Load data when component mounts
  useEffect(() => {
    loadAllMealPlans();
  }, [loadAllMealPlans]);

  // Prepare dropdown options
  const mealPlanOptions = (allMealPlans || []).map(plan => ({
    value: plan.id,
    label: `Plan du ${new Date(plan.createdAt).toLocaleDateString()}`
  }));

  const handleGenerate = async () => {
    if (isGenerating) return;

    logger.debug('SHOPPING_LIST_GENERATOR', 'Starting generation', {
      generationMode,
      selectedMealPlanId
    });

    setIsGenerating(true);

    try {
      await generateShoppingList({
        generationMode,
        selectedMealPlanId
      });
    } catch (error) {
      logger.error('SHOPPING_LIST_GENERATOR', 'Generation failed', { error });
    } finally {
      setIsGenerating(false);
    }
    
    logger.info('User initiated shopping list generation', {
      selectedMealPlanId,
      generationMode
    });
  };

  return (
    <GlassCard
      className="p-6"
      style={isPerformanceMode ? {
        background: 'linear-gradient(145deg, color-mix(in srgb, #fb923c 20%, #1e293b), color-mix(in srgb, #fb923c 10%, #0f172a))',
        border: '1px solid color-mix(in srgb, #fb923c 40%, transparent)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      } : {
        background: `
          radial-gradient(circle at 30% 20%, rgba(251, 146, 60, 0.25) 0%, transparent 50%),
          linear-gradient(135deg, rgba(251, 146, 60, 0.20) 0%, rgba(249, 115, 22, 0.12) 50%, rgba(234, 88, 12, 0.08) 100%)
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${CSS.supports('color', 'color-mix(in srgb, #fb923c 40%, transparent)') ? 'color-mix(in srgb, #fb923c 40%, transparent)' : 'rgba(251, 146, 60, 0.4)'}`,
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.5),
          0 6px 20px rgba(251, 146, 60, 0.3),
          0 2px 8px rgba(251, 146, 60, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `
      }}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/50 to-orange-600/30 blur-xl"></div>
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
              style={isPerformanceMode ? {
                background: 'linear-gradient(135deg, color-mix(in srgb, #fb923c 60%, #1e293b), color-mix(in srgb, #fb923c 40%, #0f172a))',
                border: '1px solid color-mix(in srgb, #fb923c 60%, transparent)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
              } : {
                background: `
                  radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.6) 0%, rgba(249, 115, 22, 0.4) 40%, rgba(234, 88, 12, 0.2) 100%)
                `,
                border: `1px solid ${CSS.supports('color', 'color-mix(in srgb, #fb923c 60%, transparent)') ? 'color-mix(in srgb, #fb923c 60%, transparent)' : 'rgba(251, 146, 60, 0.6)'}`,
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  0 4px 16px rgba(251, 146, 60, 0.4),
                  0 2px 8px rgba(251, 146, 60, 0.6),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300/30 to-transparent blur-sm"></div>
              <ICONS.ShoppingCart size={32} className="relative text-orange-100 drop-shadow-lg" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              Générateur de Liste de Courses
            </h2>
            <p className="text-white/70 text-sm">
              Créez des listes de courses optimisées pour vos repas
            </p>
          </div>
        </div>

        {/* Meal Plan Selection */}
        <div className="space-y-3">
          <CustomDropdown
            options={mealPlanOptions}
            value={selectedMealPlanId || ''}
            onChange={(value) => setSelectedMealPlanId(value)}
            placeholder="Choisir un plan de repas"
            className="w-full"
            disabled={isGenerating}
          />
        </div>

        {/* Separator */}
        <div className="border-t border-white/10 mt-4 pt-4"></div>

        {/* Generation Mode Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setGenerationMode('user_only')}
            className={`flex-1 p-4 rounded-xl border transition-all duration-500 ${
              generationMode === 'user_only'
                ? 'border-orange-400/50 bg-gradient-to-br from-orange-500/25 to-orange-600/15 text-orange-300 shadow-2xl'
                : 'border-white/20 bg-white/5 text-white/60 hover:border-orange-400/30 hover:bg-orange-500/10'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {generationMode === 'user_only' && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-600/20 blur-md"></div>
                )}
                <div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center"
                  style={generationMode === 'user_only' ? (isPerformanceMode ? {
                    background: 'linear-gradient(135deg, color-mix(in srgb, #fb923c 50%, #1e293b), color-mix(in srgb, #fb923c 30%, #0f172a))',
                    border: '1px solid color-mix(in srgb, #fb923c 50%, transparent)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  } : {
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.5) 0%, rgba(249, 115, 22, 0.3) 40%, rgba(234, 88, 12, 0.15) 100%)
                    `,
                    border: `1px solid ${CSS.supports('color', 'color-mix(in srgb, #fb923c 50%, transparent)') ? 'color-mix(in srgb, #fb923c 50%, transparent)' : 'rgba(251, 146, 60, 0.5)'}`,
                    boxShadow: `
                      0 4px 16px rgba(0, 0, 0, 0.3),
                      0 2px 8px rgba(251, 146, 60, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.15),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.15)
                    `
                  }) : {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {generationMode === 'user_only' && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300/20 to-transparent blur-sm"></div>
                  )}
                  <ICONS.User size={20} className="relative drop-shadow-lg" />
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-base">Courses Personnelles</div>
                <div className="text-sm opacity-75">Liste personnelle</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setGenerationMode('user_and_family')}
            className={`flex-1 p-4 rounded-xl border transition-all duration-500 ${
              generationMode === 'user_and_family'
                ? 'border-orange-400/50 bg-gradient-to-br from-orange-500/25 to-orange-600/15 text-orange-300 shadow-2xl'
                : 'border-white/20 bg-white/5 text-white/60 hover:border-orange-400/30 hover:bg-orange-500/10'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {generationMode === 'user_and_family' && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-600/20 blur-md"></div>
                )}
                <div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center"
                  style={generationMode === 'user_and_family' ? (isPerformanceMode ? {
                    background: 'linear-gradient(135deg, color-mix(in srgb, #fb923c 50%, #1e293b), color-mix(in srgb, #fb923c 30%, #0f172a))',
                    border: '1px solid color-mix(in srgb, #fb923c 50%, transparent)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  } : {
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.5) 0%, rgba(249, 115, 22, 0.3) 40%, rgba(234, 88, 12, 0.15) 100%)
                    `,
                    border: `1px solid ${CSS.supports('color', 'color-mix(in srgb, #fb923c 50%, transparent)') ? 'color-mix(in srgb, #fb923c 50%, transparent)' : 'rgba(251, 146, 60, 0.5)'}`,
                    boxShadow: `
                      0 4px 16px rgba(0, 0, 0, 0.3),
                      0 2px 8px rgba(251, 146, 60, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.15),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.15)
                    `
                  }) : {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {generationMode === 'user_and_family' && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300/20 to-transparent blur-sm"></div>
                  )}
                  <ICONS.Users size={20} className="relative drop-shadow-lg" />
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-base">Courses Familiales</div>
                <div className="text-sm opacity-75">Liste pour tous</div>
              </div>
            </div>
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!selectedMealPlanId || isGenerating}
          className="w-full px-8 py-4 text-lg font-bold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `
              linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(249, 115, 22, 0.95) 50%, rgba(234, 88, 12, 1) 100%)
            `,
            border: `1px solid ${CSS.supports('color', 'color-mix(in srgb, #fb923c 70%, transparent)') ? 'color-mix(in srgb, #fb923c 70%, transparent)' : 'rgba(251, 146, 60, 0.7)'}`,
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.4),
              0 6px 20px rgba(251, 146, 60, 0.4),
              0 3px 10px rgba(251, 146, 60, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2)
            `
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-white/20 blur-sm"></div>
            <div 
              className="relative p-1 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `
                  0 2px 8px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-sm"></div>
              <ICONS.Sparkles className="relative w-4 h-4 text-white drop-shadow-lg" />
            </div>
          </div>
          <span className="drop-shadow-sm">Générer ma liste de courses</span>
        </button>
      </div>
    </GlassCard>
  );
};

export default ShoppingListGeneratorCard;