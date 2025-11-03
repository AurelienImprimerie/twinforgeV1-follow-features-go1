import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import ShoppingListItem from './ShoppingListItem';
import logger from '../../../../../../lib/utils/logger';

interface ShoppingListCategoryProps {
  category: {
    category: string;
    items: Array<{
      name: string;
      quantity: string;
      notes?: string;
    }>;
  };
  checkedItems: Set<string>;
  onToggleItem: (itemKey: string) => void;
  index: number;
}

const ShoppingListCategory: React.FC<ShoppingListCategoryProps> = ({
  category,
  checkedItems,
  onToggleItem,
  index
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  logger.debug('ShoppingListCategory rendering', {
    categoryName: category.category,
    itemsCount: category.items?.length || 0,
    checkedItemsCount: checkedItems.size
  });

  if (!category.items || category.items.length === 0) {
    logger.warn('ShoppingListCategory received empty items array', { category: category.category });
    return null;
  }

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.1 }
      })}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-white flex items-center drop-shadow-lg mb-3">
          <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
          {category.category}
        </h3>
        <span className="text-sm text-white/70 font-medium">
          {category.items.length} article{category.items.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-2">
        {category.items.map((item, itemIndex) => {
          const itemKey = `${category.category}-${item.name}`;
          return (
            <ShoppingListItem
              key={itemKey}
              item={item}
              itemKey={itemKey}
              isChecked={checkedItems.has(itemKey)}
              onToggle={onToggleItem}
              index={itemIndex}
            />
          );
        })}
      </div>
    </MotionDiv>
  );
};

export default ShoppingListCategory;