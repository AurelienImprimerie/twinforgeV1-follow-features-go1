import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFridgeScanPipeline } from '../../../../system/store/fridgeScan';
import type { FridgeItem } from '../../../../domain/recipe';
import ReviewEditHeader from '../components/ReviewEditHeader';
import InventoryItem from '../components/InventoryItem';
import InventoryStats from '../components/InventoryStats';
import SuggestedItemsCard from '../components/SuggestedItemsCard';
import ReviewEditActionsCard from '../components/ReviewEditActionsCard';
import logger from '../../../../lib/utils/logger';

interface SuggestedItem extends FridgeItem {
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface ReviewEditStageProps {
  rawDetectedItems: any[];
  userEditedInventory: FridgeItem[];
  suggestedComplementaryItems: FridgeItem[];
  addSelectedComplementaryItems: (items: FridgeItem[]) => void;
  onInventoryUpdate: (inventory: FridgeItem[]) => void;
  onContinue: () => void;
  onBack: () => void;
  isLoading: boolean;
  handleManualExit?: () => void;
}

/**
 * Review Edit Stage - Étape de Révision et Édition de l'Inventaire
 * Interface pour confirmer et ajuster les ingrédients détectés par l'IA
 */
const ReviewEditStage: React.FC<ReviewEditStageProps> = ({
  rawDetectedItems,
  userEditedInventory,
  suggestedComplementaryItems,
  addSelectedComplementaryItems,
  onInventoryUpdate,
  onContinue,
  onBack,
  isLoading,
  handleManualExit
}) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isInventoryValidated, setIsInventoryValidated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { click } = useFeedback();
  const { showToast } = useToast();
  const { saveRecipeSession } = useFridgeScanPipeline();
  const { isPerformanceMode } = usePerformanceMode();

  // Function to scroll to the action buttons
  const scrollToActions = () => {
    const actionCard = document.getElementById('selected-inventory-actions');
    if (actionCard) {
      actionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle inventory validation
  const handleValidateInventory = async () => {
    try {
      setIsProcessing(true);
      logger.info('REVIEW_EDIT_STAGE', 'Starting inventory validation', {
        inventoryCount: safeUserEditedInventory.length,
        timestamp: new Date().toISOString()
      });

      // Save the recipe session
      await saveRecipeSession();
      
      // Set validation state to true
      setIsInventoryValidated(true);
      
      showToast({
        type: 'success',
        title: 'Inventaire Validé',
        message: 'Votre inventaire a été sauvegardé avec succès',
        duration: 3000
      });

      logger.info('REVIEW_EDIT_STAGE', 'Inventory validated successfully', {
        inventoryCount: safeUserEditedInventory.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('REVIEW_EDIT_STAGE', 'Failed to validate inventory', {
        error: error instanceof Error ? error.message : 'Unknown error',
        inventoryCount: safeUserEditedInventory.length,
        timestamp: new Date().toISOString()
      });

      showToast({
        type: 'error',
        title: 'Erreur de Validation',
        message: 'Impossible de valider l\'inventaire. Veuillez réessayer.',
        duration: 4000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Ensure userEditedInventory is always treated as an array
  const safeUserEditedInventory = Array.isArray(userEditedInventory) ? userEditedInventory : [];

  // Initialiser l'inventaire édité à partir des éléments détectés
  useEffect(() => {
    if (safeUserEditedInventory.length === 0 && rawDetectedItems.length > 0) {
      logger.info('REVIEW_EDIT_STAGE', 'Initializing inventory from detected items', {
        rawItemsCount: rawDetectedItems.length,
        timestamp: new Date().toISOString()
      });

      const initialInventory: FridgeItem[] = rawDetectedItems.map((item, index) => ({
        id: `item-${index}`,
        userId: '', // Sera rempli par le store
        sessionId: '', // Sera rempli par le store
        name: item.label || item.name || 'Ingrédient inconnu',
        category: item.category || 'Autre',
        quantity: item.estimatedQuantity || item.quantity || '1',
        confidence: item.confidence || 0.8,
        freshnessScore: item.freshnessScore || 85,
        expiryDate: item.expiryDate,
        photoUrl: item.photoUrl,
        isUserEdited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      onInventoryUpdate(initialInventory);

      logger.debug('REVIEW_EDIT_STAGE', 'Initial inventory created', {
        inventoryCount: initialInventory.length,
        categories: [...new Set(initialInventory.map(item => item.category))],
        timestamp: new Date().toISOString()
      });
    }
  }, [rawDetectedItems, safeUserEditedInventory.length, onInventoryUpdate]);

  const filteredInventory = safeUserEditedInventory.filter(item =>
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleItemEdit = (itemId: string, field: keyof FridgeItem, value: any) => {
    logger.debug('REVIEW_EDIT_STAGE', 'Item edited by user', {
      itemId,
      field,
      newValue: value,
      timestamp: new Date().toISOString()
    });

    const updatedInventory = safeUserEditedInventory.map(item =>
      item.id === itemId
        ? { ...item, [field]: value, isUserEdited: true, updatedAt: new Date().toISOString() }
        : item
    );
    onInventoryUpdate(updatedInventory);
  };

  const handleRemoveItem = (itemId: string) => {
    const removedItem = safeUserEditedInventory.find(item => item.id === itemId);
    
    logger.info('REVIEW_EDIT_STAGE', 'Item removed by user', {
      itemId,
      itemName: removedItem?.name,
      itemCategory: removedItem?.category,
      timestamp: new Date().toISOString()
    });

    const updatedInventory = safeUserEditedInventory.filter(item => item.id !== itemId);
    onInventoryUpdate(updatedInventory);
    
    showToast({
      type: 'success',
      title: 'Ingrédient supprimé',
      message: 'L\'ingrédient a été retiré de votre inventaire',
      duration: 2000
    });
  };

  const handleAddCustomItem = () => {
    logger.info('REVIEW_EDIT_STAGE', 'Custom item added by user', {
      currentInventoryCount: safeUserEditedInventory.length,
      timestamp: new Date().toISOString()
    });

    const newItem: FridgeItem = {
      id: `custom-${Date.now()}`,
      userId: '',
      sessionId: '',
      name: 'Nouvel ingrédient',
      category: 'Autre',
      quantity: '1',
      confidence: 1.0,
      freshnessScore: 90,
      isUserEdited: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onInventoryUpdate([...safeUserEditedInventory, newItem]);
    setEditingItem(newItem.id);

    showToast({
      type: 'success',
      title: 'Ingrédient ajouté',
      message: 'Nouvel ingrédient ajouté à votre inventaire',
      duration: 2000
    });
  };

  // Handle adding selected complementary items
  const handleAddSelectedItems = (items: FridgeItem[]) => {
    logger.info('REVIEW_EDIT_STAGE', 'Adding selected complementary items', {
      itemsCount: items.length,
      itemNames: items.map(item => item.name),
      timestamp: new Date().toISOString()
    });

    addSelectedComplementaryItems(items);

    showToast({
      type: 'success',
      title: 'Ingrédients ajoutés',
      message: `${items.length} ingrédient${items.length > 1 ? 's' : ''} ajouté${items.length > 1 ? 's' : ''} à votre inventaire`,
      duration: 3000
    });
  };

  return (
    <div className="space-y-6">
      {/* Header de Révision */}
      <ReviewEditHeader
        inventoryCount={filteredInventory.length}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        onAddCustomItem={handleAddCustomItem}
      />

      {/* Liste des Ingrédients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isPerformanceMode ? (
          // Version simplifiée sans AnimatePresence pour performance mode
          filteredInventory.map((item, index) => (
            <InventoryItem
              key={item.id}
              item={item}
              index={index}
              isEditing={editingItem === item.id}
              onEdit={handleItemEdit}
              onRemove={handleRemoveItem}
              onStartEdit={setEditingItem}
              onStopEdit={() => setEditingItem(null)}
            />
          ))
        ) : (
          // Version animée pour desktop/performance normale
          <AnimatePresence>
            {filteredInventory.map((item, index) => (
              <InventoryItem
                key={item.id}
                item={item}
                index={index}
                isEditing={editingItem === item.id}
                onEdit={handleItemEdit}
                onRemove={handleRemoveItem}
                onStartEdit={setEditingItem}
                onStopEdit={() => setEditingItem(null)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Suggested Items Card - Collapsible and relocated */}
      {suggestedComplementaryItems && suggestedComplementaryItems.length > 0 && (
        <details className="glass-card">
          <summary className="cursor-pointer p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
            <SpatialIcon Icon={ICONS.ChevronDown} size={16} className="text-blue-400 transition-transform" />
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Lightbulb} size={16} className="text-blue-400" />
              <span className="text-white font-medium">Suggestions complémentaires (cliquez pour voir)</span>
            </div>
            <span className="text-sm text-white/70 ml-auto">
              {suggestedComplementaryItems.length} suggestion{suggestedComplementaryItems.length > 1 ? 's' : ''}
            </span>
          </summary>
          <div className="p-4 pt-0">
            <SuggestedItemsCard
              suggestedItems={suggestedComplementaryItems}
              onAddSelectedItems={handleAddSelectedItems}
            />
          </div>
        </details>
      )}

      {/* Actions Card */}
      <ReviewEditActionsCard
        userEditedInventory={safeUserEditedInventory}
        onBack={onBack}
        handleManualExit={handleManualExit}
        onValidateInventory={handleValidateInventory}
      />
    </div>
  );
};

export default ReviewEditStage;