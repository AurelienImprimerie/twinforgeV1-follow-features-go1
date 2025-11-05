import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import type { ShoppingListCandidate } from '../../../../system/store/shoppingListGenerationPipeline/types';

interface ValidationStageProps {
  shoppingList: ShoppingListCandidate | null;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  onExit: () => void;
}

const ValidationStage: React.FC<ValidationStageProps> = ({
  shoppingList,
  onSave,
  onDiscard,
  isSaving,
  onExit
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Debug logging
  React.useEffect(() => {
    console.log('[VALIDATION_STAGE] Received shopping list:', {
      hasShoppingList: !!shoppingList,
      totalItems: shoppingList?.totalItems,
      categoriesCount: shoppingList?.categories?.length,
      categories: shoppingList?.categories?.map(cat => ({
        name: cat.name,
        itemsCount: cat.items?.length
      })),
      full_list: JSON.stringify(shoppingList, null, 2)
    });

    if (shoppingList && shoppingList.totalItems === 0) {
      console.error('[VALIDATION_STAGE_ERROR] Shopping list has ZERO items!');
    }

    if (shoppingList && shoppingList.categories.length === 0) {
      console.error('[VALIDATION_STAGE_ERROR] Shopping list has ZERO categories!');
    }
  }, [shoppingList]);

  if (!shoppingList) {
    console.warn('[VALIDATION_STAGE] No shopping list provided');
    return <div className="text-white">Aucune liste disponible</div>;
  }

  const { budgetEstimation } = shoppingList;

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 }
        })}
      >
        <GlassCard
          className="p-6"
          style={{
            background: 'rgba(251, 146, 60, 0.1)',
            borderColor: 'rgba(251, 146, 60, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Votre Liste de Courses</h2>
              <p className="text-white/80">{shoppingList.totalItems} articles • {shoppingList.categories.length} catégories</p>
            </div>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Budget Estimation */}
      {budgetEstimation && (
        <GlassCard className="p-6" style={{ background: 'rgba(251, 146, 60, 0.05)', borderColor: 'rgba(251, 146, 60, 0.2)' }}>
          <div className="flex items-center gap-4 mb-4">
            <SpatialIcon Icon={ICONS.Wallet} size={32} className="text-orange-400" />
            <div>
              <h3 className="text-white font-bold text-lg">Estimation Budgétaire</h3>
              <p className="text-white/70 text-sm">{budgetEstimation.region}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-sm">Minimum</div>
              <div className="text-orange-400 font-bold text-xl">{budgetEstimation.minTotal.toFixed(2)}€</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="text-white/60 text-sm">Moyen</div>
              <div className="text-orange-300 font-bold text-2xl">{budgetEstimation.averageTotal.toFixed(2)}€</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-sm">Maximum</div>
              <div className="text-orange-400 font-bold text-xl">{budgetEstimation.maxTotal.toFixed(2)}€</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shoppingList.categories.map((category, index) => (
          <MotionDiv
            key={category.id}
            {...(!isPerformanceMode && {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3, delay: index * 0.1 }
            })}
          >
            <GlassCard
              className="p-4"
              style={{
                background: 'rgba(251, 146, 60, 0.05)',
                borderColor: 'rgba(251, 146, 60, 0.2)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251, 146, 60, 0.2)' }}>
                  <SpatialIcon Icon={ICONS.Package} size={20} className="text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{category.name}</h4>
                  <p className="text-white/60 text-sm">{category.items.length} articles</p>
                </div>
              </div>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm bg-white/5 p-2 rounded">
                    <span className="text-white">{item.name}</span>
                    <span className="text-white/60">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </MotionDiv>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onDiscard}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
        >
          Régénérer
        </button>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
        >
          Quitter
        </button>
      </div>
    </div>
  );
};

export default ValidationStage;
