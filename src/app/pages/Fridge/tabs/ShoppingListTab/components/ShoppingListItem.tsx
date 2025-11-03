import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { cssSupports } from './shoppingListUtils';
import logger from '../../../../../../lib/utils/logger';

interface ShoppingListItemProps {
  item: {
    name: string;
    quantity: string;
    notes?: string;
  };
  itemKey: string;
  isChecked: boolean;
  onToggle: (itemKey: string) => void;
  index: number;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  itemKey,
  isChecked,
  onToggle,
  index
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  logger.debug('ShoppingListItem rendering', {
    itemName: item.name,
    itemKey,
    isChecked,
    quantity: item.quantity
  });

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.05 },
        whileHover: { scale: 1.01 },
        whileTap: { scale: 0.99 }
      })}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
        isChecked 
          ? 'bg-green-500/20 border border-green-500/40 shadow-lg' 
          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
      }`}
      onClick={() => onToggle(itemKey)}
    >
      {/* Checkbox */}
      <div className="relative">
        {isChecked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/40 to-green-600/20 blur-md"></div>
        )}
        <div 
          className="relative w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300"
          style={isChecked ? {
            background: `
              linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 50%, rgba(21, 128, 61, 0.4) 100%)
            `,
            border: `2px solid ${cssSupports('color', 'color-mix(in srgb, #22c55e 80%, transparent)', 'rgba(34, 197, 94, 0.8)')}`,
            boxShadow: `
              0 4px 12px rgba(0, 0, 0, 0.3),
              0 2px 6px rgba(34, 197, 94, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
            `
          } : {
            border: '2px solid rgba(255, 255, 255, 0.4)',
            background: 'rgba(255, 255, 255, 0.08)',
            boxShadow: `
              0 2px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 rounded bg-gradient-to-br from-green-300/20 to-transparent blur-sm"></div>
                <SpatialIcon Icon={ICONS.Check} className="relative w-4 h-4 text-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Item Info */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`font-medium text-base transition-all duration-300 ${
            isChecked ? 'text-white/60 line-through' : 'text-white'
          }`}>
            {item.name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/70 text-sm font-medium">{item.quantity}</span>
          {item.notes && (
            <span className="text-white/50 text-xs">• {item.notes}</span>
          )}
        </div>
      </div>
    </MotionDiv>
  );
};

export default ShoppingListItem;