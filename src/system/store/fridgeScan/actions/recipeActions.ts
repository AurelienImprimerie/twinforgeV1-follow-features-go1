import type { FridgeScanPipelineState } from '../types';
import { createRecipeGenerationActions } from './recipeGenerationActions';

export const createRecipeActions = (
  set: (partial: Partial<FridgeScanPipelineState>) => void,
  get: () => FridgeScanPipelineState
) => ({
  // Combine all recipe-related actions
  ...createRecipeGenerationActions(set, get)
});