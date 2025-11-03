import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { ScannedProduct } from '../MealScanFlow/ScanFlowState';
import { openFoodFactsService } from '../../../../../system/services/openFoodFactsService';

interface ScannedProductCardProps {
  product: ScannedProduct;
  onPortionChange: (barcode: string, newMultiplier: number) => void;
  onRemove: (barcode: string) => void;
}

const ScannedProductCard: React.FC<ScannedProductCardProps> = ({
  product,
  onPortionChange,
  onRemove,
}) => {
  const portionOptions = openFoodFactsService.getCommonPortionMultipliers();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard
        className="p-4 relative"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(79, 70, 229, 0.06) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(99, 102, 241, 0.25)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(99, 102, 241, 0.1),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
        }}
      >
        <div className="flex gap-4">
          {product.image_url && (
            <div
              className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                border: '2px solid rgba(99, 102, 241, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="px-2 py-0.5 rounded-md flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.15))',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Scan} size={12} className="text-indigo-300" />
                    <span className="text-xs font-semibold text-indigo-200">
                      Code-barre
                    </span>
                  </div>
                </div>
                <h4 className="text-white font-semibold text-sm mb-0.5 truncate">
                  {product.name}
                </h4>
                {product.brand && (
                  <p className="text-gray-400 text-xs truncate">{product.brand}</p>
                )}
              </div>

              <button
                onClick={() => onRemove(product.barcode)}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20"
                style={{
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
                aria-label="Retirer le produit"
              >
                <SpatialIcon Icon={ICONS.X} size={16} className="text-red-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Calories</p>
                <p className="text-white font-bold text-lg">
                  {product.mealItem.calories}
                  <span className="text-xs text-gray-400 ml-1">kcal</span>
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <div>
                  <p className="text-gray-400 mb-0.5">P</p>
                  <p className="text-green-400 font-semibold">
                    {product.mealItem.proteins}g
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">G</p>
                  <p className="text-yellow-400 font-semibold">
                    {product.mealItem.carbs}g
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">L</p>
                  <p className="text-orange-400 font-semibold">
                    {product.mealItem.fats}g
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Portion</label>
              <div className="flex gap-2 flex-wrap">
                {portionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onPortionChange(product.barcode, option.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${
                        product.portionMultiplier === option.value
                          ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400'
                          : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700/50'
                      }
                    `}
                    style={{
                      border: '1px solid',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ScannedProductCard;
