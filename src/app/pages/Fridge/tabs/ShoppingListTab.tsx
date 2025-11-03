import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShoppingListStore } from '../../../../system/store/shoppingListStore';
import { useMealPlanStore } from '../../../../system/store/mealPlanStore';
import { useFridgeScanPipeline } from '../../../../system/store/fridgeScan';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import logger from '../../../../lib/utils/logger';

// Import components (to be created)
import EmptyShoppingListState from './ShoppingListTab/components/EmptyShoppingListState';
import ShoppingListGenerationLoader from './ShoppingListTab/ShoppingListGenerationLoader';
import ShoppingListDisplay from './ShoppingListTab/ShoppingListDisplay';
import ShoppingListGeneratorCard from './ShoppingListTab/ShoppingListGeneratorCard';

/**
 * Shopping List Tab - Generate personalized shopping lists
 */
const ShoppingListTab: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isGenerating, 
    shoppingList, 
    error,
    reset,
    generateShoppingList
  } = useShoppingListStore();
  const { allMealPlans, loadAllMealPlans } = useMealPlanStore();
  const { startScan } = useFridgeScanPipeline();

  React.useEffect(() => {
    loadAllMealPlans();
  }, [loadAllMealPlans]);

  React.useEffect(() => {
    logger.debug('SHOPPING_LIST_TAB', 'Component mounted', {
      isGenerating,
      hasShoppingList: !!shoppingList,
      hasError: !!error,
      allMealPlansCount: allMealPlans.length
    });

    // Cleanup on unmount
    return () => {
      logger.debug('SHOPPING_LIST_TAB', 'Component unmounting');
    };
  }, [isGenerating, shoppingList, error, allMealPlans.length]);

  // Calculate if meal plans are available
  const hasAvailableMealPlans = allMealPlans.length > 0;
  
  // Check if shopping list has items
  const hasShoppingListItems = shoppingList && shoppingList.totalItems > 0;

  const handleGenerateFromPlan = () => {
    // This will show the ShoppingListGeneratorCard interface
    logger.info('SHOPPING_LIST_TAB', 'User initiated generation from meal plan');
  };

  const handleScanFridge = () => {
    startScan();
    navigate('/fridge/scan');
  };

  // Determine which component to render based on state
  const renderContent = () => {
    // Priorité 1 : État de chargement
    if (isGenerating) {
      return <ShoppingListGenerationLoader />;
    }

    // Priorité 2 : Liste de courses existante
    if (hasShoppingListItems) {
      return (
        <div className="space-y-6">
          <ShoppingListDisplay />
          <ShoppingListGeneratorCard />
        </div>
      );
    }

    // Priorité 3 : Générateur de liste de courses (si des plans sont disponibles)
    if (hasAvailableMealPlans) {
      return <ShoppingListGeneratorCard />;
    }

    // Priorité 4 : État vide
    return (
      <EmptyShoppingListState 
        hasAvailableMealPlans={hasAvailableMealPlans}
        onGenerateFromPlan={handleGenerateFromPlan}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6 w-full"
    >
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <GlassCard className="border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 p-4">
                <SpatialIcon 
                  name="AlertTriangle" 
                  size={20} 
                  className="text-red-400 flex-shrink-0" 
                />
                <div className="flex-1">
                  <p className="text-red-400 font-medium">Erreur de génération</p>
                  <p className="text-red-300/80 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={reset}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <SpatialIcon name="X" size={16} />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isGenerating ? 'generating' : shoppingList ? 'display' : 'generator'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
};

export default ShoppingListTab;