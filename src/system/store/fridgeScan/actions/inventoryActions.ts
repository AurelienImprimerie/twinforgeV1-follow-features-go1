import logger from '../../../../lib/utils/logger';
import { MINIMUM_ITEMS_THRESHOLD } from '../constants';
import { FRIDGE_SCAN_STEPS } from '../constants';
import type { FridgeScanPipelineState } from '../types';
import type { FridgeItem } from '../../../../domain/recipe';
import type { SuggestedFridgeItem } from '../types';

export const createInventoryActions = (
  set: (partial: Partial<FridgeScanPipelineState>) => void,
  get: () => FridgeScanPipelineState
) => ({
  processVisionResults: (detectedItems: FridgeItem[], suggestedItems?: SuggestedFridgeItem[]) => {
    // Stop progress simulation before changing step
    get().stopProgressSimulation();
    
    const validationStep = FRIDGE_SCAN_STEPS.find(step => step.id === 'validation');
    
    // Determine next step based on inventory size and suggestions
    let nextStep = 'validation';
    if (detectedItems.length < MINIMUM_ITEMS_THRESHOLD && suggestedItems && suggestedItems.length > 0) {
      nextStep = 'complement';
    }
    
    set({
      rawDetectedItems: detectedItems,
      userEditedInventory: detectedItems,
      suggestedComplementaryItems: suggestedItems || [],
      currentStep: nextStep,
      loadingState: 'idle',
      loadingMessage: 'Analyse terminée avec succès',
      simulatedOverallProgress: validationStep?.startProgress || 40,
      simulatedScanProgress: 0,
      simulatedLoadingStep: 0
    });

    // Explicitly transition to the next step
    get().goToStep(nextStep);

    logger.info('FRIDGE_SCAN_PIPELINE', 'Vision results processed', {
      sessionId: get().currentSessionId,
      itemsDetected: detectedItems.length,
      suggestedItemsCount: suggestedItems?.length || 0,
      timestamp: new Date().toISOString()
    });
  },

  updateInventory: async (inventory: FridgeItem[]) => {
    set({
      userEditedInventory: inventory
    });

    logger.debug('FRIDGE_SCAN_PIPELINE', 'Inventory updated by user', {
      sessionId: get().currentSessionId,
      inventoryCount: inventory.length,
      timestamp: new Date().toISOString()
    });

    // Save session after inventory update
    await get().saveSessionToSupabase();
  },

  setSuggestedComplementaryItems: (items: SuggestedFridgeItem[]) => {
    set({
      suggestedComplementaryItems: items
    });

    logger.debug('FRIDGE_SCAN_PIPELINE', 'Suggested complementary items set', {
      sessionId: get().currentSessionId,
      suggestedItemsCount: items.length,
      timestamp: new Date().toISOString()
    });
  },

  addSelectedComplementaryItems: async (selectedItems: FridgeItem[]) => {
    const currentInventory = get().userEditedInventory;
    const updatedInventory = [...currentInventory, ...selectedItems];

    set({
      userEditedInventory: updatedInventory
    });

    logger.info('FRIDGE_SCAN_PIPELINE', 'Selected complementary items added to inventory', {
      sessionId: get().currentSessionId,
      addedItemsCount: selectedItems.length,
      totalInventoryCount: updatedInventory.length,
      timestamp: new Date().toISOString()
    });

    // Save session after adding items
    await get().saveSessionToSupabase();
  }
});