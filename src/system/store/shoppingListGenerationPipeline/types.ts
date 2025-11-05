/**
 * Shopping List Generation Pipeline Types
 */

export type ShoppingListGenerationStep = 'configuration' | 'generating' | 'validation';

export type LoadingState = 'idle' | 'generating' | 'streaming' | 'saving' | 'error';

export interface ShoppingListPipelineStep {
  id: ShoppingListGenerationStep;
  label: string;
  description: string;
}

export interface ShoppingListConfig {
  selectedMealPlanId: string | null;
  generationMode: 'user_only' | 'user_and_family';
}

export interface ShoppingListCandidate {
  id: string;
  name: string;
  generationMode: 'user_only' | 'user_and_family';
  totalItems: number;
  totalEstimatedCost: number; // in cents
  categories: ShoppingListCategory[];
  suggestions?: string[];
  advice?: string[];
  budgetEstimation?: BudgetEstimation;
  createdAt: string;
}

export interface ShoppingListCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  estimatedTotal: number; // in cents
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  estimatedPrice: number; // in cents
  priority: 'low' | 'medium' | 'high';
  isChecked: boolean;
}

export interface BudgetEstimation {
  minTotal: number; // in cents
  maxTotal: number; // in cents
  averageTotal: number; // in cents
  byCategory: Record<string, { min: number; max: number; average: number }>; // in cents
  region: string;
  coefficient: number;
}
