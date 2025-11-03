/**
 * Recipe Domain Types
 * Type definitions for the Recipe Workshop feature
 */

export interface FridgeItem {
  id: string;
  userId: string;
  sessionId: string;
  name: string;
  category?: string;
  quantity?: string;
  confidence: number;
  freshnessScore: number;
  expiryDate?: string;
  photoUrl?: string;
  isUserEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  dietaryTags: string[];
  nutritionalInfo: NutritionalInfo;
  imageUrl?: string;
  imageSignature?: string;
  status?: 'loading' | 'ready' | 'error';
  isGeneratingImage?: boolean;
  imageGenerationError?: boolean;
  reasons?: string[];
  createdAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
  optional?: boolean;
}

export interface RecipeInstruction {
  step: number;
  instruction: string;
  timeMin?: number;
  temperature?: string;
  equipment?: string[];
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface RecipeSession {
  id: string;
  userId: string;
  inventoryFinal: FridgeItem[];
  selectedRecipeIds: string[];
  preferencesSnapshot: any;
  filtersSnapshot: any;
  status: 'pending' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingList {
  id: string;
  sessionId: string;
  userId: string;
  items: ShoppingListItems;
  createdAt: string;
}

export interface ShoppingListItems {
  [aisle: string]: ShoppingListItem[];
}

export interface ShoppingListItem {
  name: string;
  quantity: string;
  category: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface MealPlan {
  id: string;
  sessionId: string;
  userId: string;
  planData: MealPlanData;
  createdAt: string;
}

export interface MealPlanData {
  days: MealPlanDay[];
  totalDays: number;
  mealsPerDay: number;
  batchCookingDays?: string[];
}

export interface MealPlanDay {
  date: string;
  meals: {
    breakfast?: string; // recipe ID
    lunch?: string;
    dinner?: string;
    snacks?: string[];
  };
  prepTime: number;
  cookTime: number;
}

// Enhanced nutrition preferences types
export interface HouseholdDetails {
  adults: number;
  children: number;
  dietaryRestrictions?: string[];
}

export interface MealPrepPreferences {
  weekdayTimeMin: number;
  weekendTimeMin: number;
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  preferredMealTimes?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

export interface KitchenEquipment {
  oven: boolean;
  stove: boolean;
  microwave: boolean;
  airFryer: boolean;
  slowCooker: boolean;
  blender: boolean;
  foodProcessor: boolean;
  standMixer: boolean;
  riceCooker: boolean;
  grill: boolean;
  steamBasket: boolean;
  pressureCooker: boolean;
}

export interface FoodPreferences {
  cuisines: TriStatePreference[];
  ingredients: TriStatePreference[];
  flavors: TriStatePreference[];
}

export interface TriStatePreference {
  name: string;
  state: 'like' | 'neutral' | 'dislike' | 'ban';
  intensity?: number; // 1-5 for like/dislike strength
}

export interface SensoryPreferences {
  spiceTolerance: number; // 0-3 scale
  textureAversions: string[];
  temperaturePreferences?: string[];
}

export interface MacroTargets {
  kcal?: number;
  fiberMinG?: number;
  sugarMaxG?: number;
  saltMaxMg?: number;
  carbsMaxG?: number;
  fatMinG?: number;
}

export interface ShoppingPreferences {
  frequencyPerWeek: number;
  defaultPortionsPerMeal: number;
  batchCooking: 'never' | 'sometimes' | 'often';
  bias: string[]; // e.g., ['bio', 'local', 'bulk']
  preferredStores?: string[];
  budgetPerWeek?: number;
}