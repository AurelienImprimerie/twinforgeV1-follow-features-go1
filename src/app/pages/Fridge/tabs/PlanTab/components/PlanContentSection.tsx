import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlanGenerationProgress from './PlanGenerationProgress';
import MealPlanReviewAndGenerateCTA from './MealPlanReviewAndGenerateCTA';
import DayPlanCard from './DayPlanCard';
import AIExplanationCard from './AIExplanationCard';
import EmptyPlanState from './EmptyPlanState';

interface PlanContentSectionProps {
  hasInventory: boolean;
  isGenerating: boolean;
  generationProgress: number;
  loadingMessage: string;
  currentLoadingTitle: string;
  currentLoadingSubtitle: string;
  currentPlan: any;
  selectedInventory: any;
  handleGenerateAllRecipes: () => void;
  handleRegenerateWeek: () => Promise<void>;
  handleExportPlan: () => void;
  clearPlan: () => void;
  handleViewRecipe: (meal: any) => void;
  generateDetailedRecipeForMeal: any;
  generateAllDetailedRecipesForDay: any;
  profileCompletion: any;
  featureGuidance: any;
  nudgeDismissed: boolean;
  setNudgeDismissed: (dismissed: boolean) => void;
  currentWeek: number;
  weekDateRange: { formatted: string; startDate: string; endDate: string };
  handleGenerateMealPlan: () => void;
  isWeekAvailable: (week: number) => boolean;
  setCurrentWeek: (week: number) => void;
  handleSavePlanAsIs?: () => Promise<void>;
}

/**
 * Content section of the Plan Tab containing the main meal plan display
 */
const PlanContentSection: React.FC<PlanContentSectionProps> = ({
  hasInventory,
  isGenerating,
  generationProgress,
  loadingMessage,
  currentLoadingTitle,
  currentLoadingSubtitle,
  currentPlan,
  selectedInventory,
  handleGenerateAllRecipes,
  handleRegenerateWeek,
  handleExportPlan,
  clearPlan,
  handleViewRecipe,
  generateDetailedRecipeForMeal,
  generateAllDetailedRecipesForDay,
  profileCompletion,
  featureGuidance,
  nudgeDismissed,
  setNudgeDismissed,
  currentWeek,
  weekDateRange,
  handleGenerateMealPlan,
  isWeekAvailable,
  setCurrentWeek
}) => {
  return (
    <>
      {/* Progression de Génération */}
      {isGenerating && (
        <PlanGenerationProgress
          progress={generationProgress}
          loadingMessage={loadingMessage}
          currentLoadingTitle={currentLoadingTitle}
          currentLoadingSubtitle={currentLoadingSubtitle}
        />
      )}

      {/* Plan de Repas - Affichage Progressif */}
      {!isGenerating && currentPlan && (
        <>
          {/* Meal Plan Review and Generate CTA - Hidden during generation */}
          <MealPlanReviewAndGenerateCTA
            currentPlan={currentPlan}
            onRegenerateWeek={handleRegenerateWeek}
            onGenerateAllRecipes={handleGenerateAllRecipes}
            onExportPlan={handleExportPlan}
            clearPlan={clearPlan}
            isGenerating={isGenerating}
          />

          {/* Day Cards - Show progressively as they load */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {currentPlan.days.filter((day: any) => day && day.date).map((day: any, index: number) => (
              <DayPlanCard
                key={day.date}
                day={day}
                index={index}
                isEditable={false}
                onViewRecipe={handleViewRecipe}
                onGenerateDetailedRecipe={generateDetailedRecipeForMeal}
                onGenerateAllDetailedRecipesForDay={generateAllDetailedRecipesForDay}
              />
            ))}
          </motion.div>
        </>
      )}

      {/* AI Explanation Card */}
      {(isGenerating || currentPlan?.aiExplanation) && (
        <AIExplanationCard
          aiExplanation={currentPlan?.aiExplanation}
          weekNumber={currentWeek}
          isLoading={isGenerating}
        />
      )}

      {/* État Vide - Only show when not generating and no plan */}
      {!isGenerating && !currentPlan && (
        <EmptyPlanState
          hasContext={hasInventory}
          onGenerate={handleGenerateMealPlan}
          isGenerating={isGenerating}
          profileCompletion={profileCompletion}
          featureGuidance={featureGuidance}
          onDismissNudge={() => setNudgeDismissed(true)}
          nudgeDismissed={nudgeDismissed}
          currentWeek={currentWeek}
          isWeekAvailable={isWeekAvailable(currentWeek)}
          weekDateRange={weekDateRange}
          setCurrentWeek={setCurrentWeek}
        />
      )}
    </>
  );
};

export default PlanContentSection;