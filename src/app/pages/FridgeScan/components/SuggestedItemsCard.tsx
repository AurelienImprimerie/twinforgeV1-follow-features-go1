import React, { useState } from 'react';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import type { FridgeItem } from '../../../../domain/recipe';
import type { SuggestedFridgeItem } from '../../../../system/store/fridgeScan/types';

interface SuggestedItemsCardProps {
  suggestedItems: SuggestedFridgeItem[];
  onAddSelectedItems: (selectedItems: FridgeItem[]) => void;
  onSelectionChange?: (hasSelections: boolean) => void;
}

export const SuggestedItemsCard: React.FC<SuggestedItemsCardProps> = ({
  suggestedItems,
  onAddSelectedItems,
  onSelectionChange
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const { isPerformanceMode } = usePerformanceMode();

  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
    
    // Notify parent component about selection changes
    if (onSelectionChange) {
      onSelectionChange(newSelected.size > 0);
    }
  };

  const selectAllItems = () => {
    const allIndices = new Set(suggestedItems.map((_, index) => index));
    setSelectedItems(allIndices);
    
    // Notify parent component about selection changes
    if (onSelectionChange) {
      onSelectionChange(allIndices.size > 0);
    }
  };

  const deselectAllItems = () => {
    setSelectedItems(new Set());
    
    // Notify parent that selections have been cleared
    if (onSelectionChange) {
      onSelectionChange(false);
    }
  };

  const handleAddSelected = () => {
    const itemsToAdd = suggestedItems
      .filter((_, index) => selectedItems.has(index))
      .map(item => ({
        id: item.id,
        userId: item.userId,
        sessionId: item.sessionId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        confidence: item.confidence,
        freshnessScore: item.freshnessScore,
        expiryDate: item.expiryDate,
        isUserEdited: false,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    
    onAddSelectedItems(itemsToAdd);
    setSelectedItems(new Set()); // Clear selection after adding
    
    // Notify parent that selections have been cleared
    if (onSelectionChange) {
      onSelectionChange(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority ?? 'medium') {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority ?? 'medium') {
      case 'high': return 'Priorité haute';
      case 'medium': return 'Priorité moyenne';
      case 'low': return 'Priorité basse';
      default: return 'Priorité inconnue';
    }
  };

  if (suggestedItems.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
          <SpatialIcon Icon={ICONS.Lightbulb} size={16} className="text-blue-400" glowColor="rgba(59, 130, 246, 0.6)" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Aliments complémentaires suggérés
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-white/70 mb-2">
        Notre IA nutritionniste recommande ces aliments pour compléter votre inventaire
      </p>

      {/* Selection count */}
      <p className="text-sm text-white/60 mb-4">
        {selectedItems.size} / {suggestedItems.length} sélectionnés
      </p>

      {/* Scrollable items container */}
      <div className="rounded-xl bg-black/20 p-3 mb-4 max-h-64 overflow-y-auto"
           style={{
             boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(255, 255, 255, 0.1)'
           }}>
        <div className="space-y-2">
          {suggestedItems.map((item, index) => (
            <GlassCard
              key={item.id}
              className={`no-scale-hover flex items-center gap-3 p-2 ${!isPerformanceMode ? 'transition-all' : ''} cursor-pointer ${
                selectedItems.has(index)
                  ? 'ring-2 ring-blue-400/50 bg-blue-50/5'
                  : ''
              }`}
              onClick={() => toggleItem(index)}
            >
              <input
                type="checkbox"
                checked={selectedItems.has(index)}
                onChange={() => toggleItem(index)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-medium text-white truncate">
                    {item.name}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${getPriorityColor(item.suggestionPriority)}`}>
                    {getPriorityLabel(item.suggestionPriority)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xxs text-white/70 mb-1">
                  <span className="bg-white/10 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <span>{item.quantity}</span>
                </div>
                
                <p className="text-xxs text-white/60 leading-relaxed line-clamp-1">
                  {item.suggestionReason}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Selection buttons */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={selectAllItems}
          className={`px-3 py-2 text-sm text-white/70 hover:text-white ${!isPerformanceMode ? 'transition-colors' : ''} bg-white/10 rounded-lg`}
        >
          Tout sélectionner
        </button>
        <button
          onClick={deselectAllItems}
          className={`px-3 py-2 text-sm text-white/70 hover:text-white ${!isPerformanceMode ? 'transition-colors' : ''} bg-white/10 rounded-lg`}
        >
          Tout désélectionner
        </button>
      </div>

      {/* Add selected button */}
      {selectedItems.size > 0 && (
        <div className="w-full">
          <button
            onClick={handleAddSelected}
            className="w-full btn-glass--primary px-4 py-3 text-sm font-medium"
          >
            Ajouter {selectedItems.size} aliment{selectedItems.size > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default SuggestedItemsCard;