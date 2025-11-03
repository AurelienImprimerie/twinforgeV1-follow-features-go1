import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import CustomDropdown from '../../RecipesTab/components/CustomDropdown';
import NutritionalSummary from './NutritionalSummary';

interface PlanHeaderSectionProps {
  currentPlan: any;
  selectedInventoryId: string | null;
  availableInventories: any[];
  selectInventory: (inventoryId: string) => void;
  isGenerating: boolean;
  currentWeek: number;
  availableWeeks: number[];
  maxAvailableWeek: number;
  canGenerateNextWeek: boolean;
  setCurrentWeek: (week: number) => void;
  getWeekDateRange: (week: number) => { formatted: string; startDate: string; endDate: string };
  handleGenerateMealPlan: () => void;
  isWeekAvailable: (week: number) => boolean;
  weekDateRange: { formatted: string; startDate: string; endDate: string };
}

/**
 * Header section of the Plan Tab containing title, actions, and inventory selector
 */
const PlanHeaderSection: React.FC<PlanHeaderSectionProps> = ({
  currentPlan,
  selectedInventoryId,
  availableInventories,
  selectInventory,
  isGenerating,
  currentWeek,
  availableWeeks,
  maxAvailableWeek,
  canGenerateNextWeek,
  setCurrentWeek,
  getWeekDateRange,
  handleGenerateMealPlan,
  isWeekAvailable,
  weekDateRange
}) => {
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();

  // Week navigation logic
  const canGoToPrevious = currentWeek > 1;
  const canGoToNext = currentWeek < maxAvailableWeek || canGenerateNextWeek;

  // Week options for dropdown
  const weekOptions = availableWeeks.map(week => ({
    value: week.toString(),
    label: `Semaine ${week} - ${getWeekDateRange(week).formatted}`
  }));

  // Check if current week has a plan
  const hasCurrentWeekPlan = currentPlan && currentPlan.weekNumber === currentWeek;

  return (
    <>
      {/* Résumé Nutritionnel */}
      {currentPlan?.nutritionalSummary && (
        <NutritionalSummary
          nutritionalSummary={currentPlan.nutritionalSummary}
          estimatedWeeklyCost={currentPlan.estimatedWeeklyCost}
        />
      )}

      {/* Header avec Actions */}
      <GlassCard className="fridge-glass-plans p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div
              className={`fridge-icon-plans ${isPerformanceMode ? '' : 'fridge-ai-focus'} w-16 h-16`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid rgba(139, 92, 246, 0.5)'
              }}
            >
              <SpatialIcon Icon={ICONS.Calendar} size={32} color="rgba(255, 255, 255, 0.95)" variant="pure" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Générateur de Plan Repas
              </h3>
              <p className="text-white/70 text-sm">
                Organisez vos repas de la semaine avec votre inventaire
              </p>
            </div>
          </div>
        </div>
        
        <CustomDropdown
          value={selectedInventoryId || ''}
          options={availableInventories.map(inv => ({ 
            value: inv.id, 
            label: `Inventaire du ${new Date(inv.created_at).toLocaleDateString('fr-FR')} (${inv.inventory_final?.length || 0} ingrédients)` 
          }))}
          onChange={selectInventory}
          placeholder="Sélectionner un inventaire..."
          className="w-full"
          aria-label="Sélectionner l'inventaire pour le plan de repas"
          disabled={isGenerating}
        />
        
        {/* Week Navigation Section - Only show if weeks are available */}
        {weekOptions.length > 0 && (
          <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
            {/* Week Selector with Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  click();
                  setCurrentWeek(currentWeek - 1);
                }}
                disabled={!canGoToPrevious || isGenerating}
                className="fridge-btn-plans-subtle w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title={canGoToPrevious ? 'Semaine précédente' : 'Aucune semaine précédente disponible'}
              >
                <SpatialIcon Icon={ICONS.ChevronLeft} size={14} color="var(--fridge-plans-light)" variant="pure" />
              </button>
              
              <div className="flex-1 min-w-0">
                <CustomDropdown
                  options={weekOptions}
                  value={currentWeek.toString()}
                  onChange={(value) => {
                    click();
                    setCurrentWeek(parseInt(value));
                  }}
                  placeholder="Sélectionner une semaine"
                  disabled={isGenerating}
                  className="w-full"
                />
              </div>
              
              <button
                onClick={() => {
                  click();
                  setCurrentWeek(currentWeek + 1);
                }}
                disabled={!canGoToNext || isGenerating}
                className="fridge-btn-plans-subtle w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title={canGoToNext ? 'Semaine suivante' : 'Semaine suivante non disponible'}
              >
                <SpatialIcon Icon={ICONS.ChevronRight} size={14} color="var(--fridge-plans-light)" variant="pure" />
              </button>
            </div>
          </div>
        )}
        
          {/* Résumé Nutritionnel Compact */}
          {currentPlan?.nutritionalSummary && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-sm">
              <span className="text-purple-300 font-medium">
                ~{Math.round(currentPlan.nutritionalSummary.avgCaloriesPerDay)} kcal/jour
              </span>
              <span className="text-cyan-300 font-medium">
                {Math.round(currentPlan.nutritionalSummary.avgProteinPerDay)}g protéines/jour
              </span>
            </div>
          )}
      </GlassCard>

      {/* Generate Plan Button */}
      {currentPlan && (
        <div className="mt-4">
          {!hasCurrentWeekPlan && selectedInventoryId && isWeekAvailable(currentWeek) && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => {
                    click();
                    handleGenerateMealPlan();
                  }}
                  disabled={isGenerating}
                  className="fridge-btn-plans-primary w-full px-6 py-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-3">
                    {isGenerating ? (
                      <SpatialIcon Icon={ICONS.Loader2} size={20} className="animate-spin" color="white" variant="pure" />
                    ) : (
                      <SpatialIcon Icon={ICONS.Calendar} size={20} color="white" variant="pure" />
                    )}
                    <span>{isGenerating ? 'Génération...' : `Générer Semaine ${currentWeek}`}</span>
                  </div>
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </>
  );
};

export default PlanHeaderSection;