export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  category: string;
  estimatedPrice?: number;
  isPurchased: boolean;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ShoppingListCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: ShoppingListItem[];
  estimatedTotal?: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  generationMode: 'user_only' | 'user_and_family';
  categories: ShoppingListCategory[];
  totalEstimatedCost?: number;
  totalItems: number;
  completedItems: number;
  basedOnMealPlanId?: string;
  basedOnInventoryId?: string;
  notes?: string;
}

export interface ShoppingListGenerationRequest {
  generationMode: 'user_only' | 'user_and_family';
  selectedMealPlanId?: string;
  selectedInventoryId?: string;
  userPreferences?: {
    budget?: number;
    preferredStores?: string[];
    dietaryRestrictions?: string[];
  };
}