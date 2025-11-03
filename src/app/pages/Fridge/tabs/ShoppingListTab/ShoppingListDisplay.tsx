import React, { useState } from 'react';
import { useShoppingListStore } from '../../../../../system/store/shoppingListStore';
import logger from '../../../../../lib/utils/logger';
import ShoppingListHeader from './components/ShoppingListHeader';
import BudgetEstimationCard from './components/BudgetEstimationCard';
import ShoppingListSuggestions from './components/ShoppingListSuggestions';
import ShoppingListAdvice from './components/ShoppingListAdvice';
import ShoppingListCategory from './components/ShoppingListCategory';
import ShoppingListExportActions from './components/ShoppingListExportActions';

/**
 * Shopping List Display - Shows the generated shopping list with categories
 */
const ShoppingListDisplay: React.FC = () => {
  const { shoppingList, suggestions, advice, budgetEstimation, reset } = useShoppingListStore();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Log the current state for debugging
  React.useEffect(() => {
    logger.debug('SHOPPING_LIST_DISPLAY', 'Current state', {
      shoppingListCount: shoppingList?.categories?.length || 0,
      suggestionsCount: suggestions.length,
      adviceCount: advice.length,
      hasBudget: !!budgetEstimation
    });

    // Detailed logging of shopping list structure
    if (shoppingList) {
      logger.debug('SHOPPING_LIST_DISPLAY', 'Shopping list details', {
        id: shoppingList.id,
        name: shoppingList.name,
        totalItems: shoppingList.totalItems,
        categoriesCount: shoppingList.categories?.length || 0,
        categories: shoppingList.categories?.map(cat => ({
          id: cat.id,
          name: cat.name,
          itemsCount: cat.items?.length || 0,
          items: cat.items?.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
          })) || []
        })) || []
      });

      // Log each category and its items
      shoppingList.categories?.forEach((category, categoryIndex) => {
        logger.debug('SHOPPING_LIST_DISPLAY', `Category ${categoryIndex + 1}: ${category.name}`, {
          categoryId: category.id,
          itemsCount: category.items?.length || 0,
          items: category.items?.map(item => `${item.name} (${item.quantity})`) || []
        });
      });
    }
  }, [shoppingList, suggestions, advice, budgetEstimation]);

  if (!shoppingList) {
    logger.debug('SHOPPING_LIST_DISPLAY', 'No shopping list available');
    return null;
  }

  const toggleItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
    const completed = new Set(checkedItems).size;
    
    logger.debug('SHOPPING_LIST_DISPLAY', 'Item toggled', {
      itemId,
      isChecked: newCheckedItems.has(itemId),
      totalChecked: newCheckedItems.size
    });
  };

  const totalCount = shoppingList.totalItems || 0;
  const completedCount = checkedItems.size;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  logger.debug('SHOPPING_LIST_DISPLAY', 'Rendering shopping list', {
    totalCount,
    completedCount,
    progressPercentage,
    categoriesCount: shoppingList.categories?.length || 0
  });

  return (
    <div className="space-y-6">
      <ShoppingListHeader 
        shoppingList={shoppingList}
        totalCount={totalCount}
        completedCount={completedCount}
        progressPercentage={progressPercentage}
        onReset={reset} 
      />
      
      <BudgetEstimationCard budgetEstimation={budgetEstimation} />

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shoppingList.categories?.map((category, index) => {
          logger.debug('SHOPPING_LIST_DISPLAY', `Rendering category ${index + 1}`, {
            categoryId: category.id,
            categoryName: category.name,
            itemsCount: category.items?.length || 0
          });
          
          return (
            <ShoppingListCategory
              key={category.id}
              category={category}
              checkedItems={checkedItems}
              onToggleItem={toggleItem}
              index={index}
            />
          );
        })}
      </div>

      {/* Suggestions */}
      <ShoppingListSuggestions suggestions={suggestions} />

      {/* Advice */}
      <ShoppingListAdvice advice={advice} />

      {/* Export Actions */}
      <ShoppingListExportActions shoppingList={shoppingList} />
    </div>
  );
};

export default ShoppingListDisplay;