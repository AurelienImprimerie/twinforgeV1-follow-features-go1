import type { FridgeItem, Recipe } from '../../../domain/recipe';

export interface SuggestedFridgeItem extends FridgeItem {
  id: string;
  userId: string;
  isSuggested: boolean;
  suggestionReason: string;
  suggestionPriority: 'high' | 'medium' | 'low';
}

export interface MealPlanData {
  id: string;
  days: Array<{
    day: string;
    date: string;
    meals: Array<{
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      title: string;
      description: string;
      calories: number;
      macros: {
        protein: number;
        carbs: number;
        fat: number;
      };
      ingredients_available: string[];
      ingredients_needed: string[];
    }>;
    daily_totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  weekly_summary: {
    total_calories: number;
    avg_daily_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
  };
  created_at: string;
}

export type FridgeScanStep = 'photo' | 'analyze' | 'complement' | 'validation' | 'generating_recipes' | 'recipes';

export interface FridgeScanStepData {
  id: FridgeScanStep;
  title: string;
  subtitle: string;
  icon: keyof typeof import('../../../ui/icons/registry').ICONS;
  color: string;
  startProgress: number;
}

export interface RawDetectedItem {
  label: string;
  confidence: number;
  boundingBox?: any;
  category?: string;
  estimatedQuantity?: string;
  freshnessScore?: number;
}

export interface FridgeScanSession {
  sessionId: string;
  userId: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
  capturedPhotos?: string[];
  rawDetectedItems?: RawDetectedItem[];
}

export interface FridgeScanPipelineState {
  // Pipeline state
  currentStep: FridgeScanStep;
  isActive: boolean;
  currentSessionId: string | null;

  // Progress simulation state
  simulatedLoadingStep: number;
  simulatedScanProgress: number;
  simulatedOverallProgress: number;
  progressIntervalId: number | null;
  progressTimeoutId: number | null;

  // Data state
  capturedPhotos: string[]; // base64 or URLs
  rawDetectedItems: RawDetectedItem[];
  userEditedInventory: FridgeItem[];
  suggestedComplementaryItems: SuggestedFridgeItem[];
  recipeCandidates: Recipe[];
  recentSessions: FridgeScanSession[];

  // Meal plan data
  mealPlan: MealPlanData | null;

  // Loading states
  loadingState: 'idle' | 'uploading' | 'analyzing' | 'generating' | 'saving';
  loadingMessage: string;

  // Steps configuration
  steps: FridgeScanStepData[];
  
  // Actions
  startScan: () => void;
  startProgressSimulation: (steps: Array<{ message: string; duration: number; icon: string }>, phaseStartPercentage: number, phaseEndPercentage: number) => void;
  stopProgressSimulation: () => void;
  addCapturedPhotos: (photos: string[]) => void;
  processVisionResults: (detectedItems: FridgeItem[]) => void;
  updateInventory: (inventory: FridgeItem[]) => void;
  setSuggestedComplementaryItems: (items: SuggestedFridgeItem[]) => void;
  addSelectedComplementaryItems: (selectedItems: FridgeItem[]) => void;
  setUserEditedInventory: (inventory: FridgeItem[]) => void;
  setLoadingState: (state: 'idle' | 'uploading' | 'analyzing' | 'generating' | 'saving') => void;
  generateRecipes: () => Promise<void>;
  saveRecipeSession: () => Promise<string>; // Returns session ID
  resetPipeline: () => void;
  removeCapturedPhoto: (index: number) => void;
  updateRecipeImageUrlInCandidates: (recipeId: string, imageUrl?: string, isGeneratingImage?: boolean, imageGenerationError?: boolean) => void;
  
  // Navigation helpers
  clearRecipeCandidates: () => void;
  goToStep: (step: FridgeScanStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Session management
  resumePipeline: () => void;
  loadRecentSessions: () => Promise<void>;
}