import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import { useRecipeGenerationPipeline } from '../../../../system/store/recipeGeneration';
import RecipeCard from '../../../pages/Fridge/tabs/RecipesTab/components/RecipeCard';
import RecipeGenerationLoader from '../../../pages/Fridge/tabs/RecipesTab/components/RecipeGenerationLoader';

const GeneratingStage: React.FC = () => {
  const { isPerformanceMode } = usePerformanceMode();
  const { recipeCandidates, loadingState } = useRecipeGenerationPipeline();

  return <RecipeGenerationLoader />;
};

export default GeneratingStage;
