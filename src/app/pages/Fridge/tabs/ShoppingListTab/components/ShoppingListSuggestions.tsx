import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

export interface ShoppingListSuggestionsProps {
  suggestions: any[];
}

/**
 * Shopping List Suggestions Component
 */
const ShoppingListSuggestions: React.FC<ShoppingListSuggestionsProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <GlassCard className="border-blue-500/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <SpatialIcon Icon={ICONS.Lightbulb} size={20} className="text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Suggestions Complémentaires</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <SpatialIcon Icon={ICONS.Plus} size={16} className="text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-medium">{suggestion.name}</p>
              {suggestion.reason && (
                <p className="text-white/70 text-sm">{suggestion.reason}</p>
              )}
            </div>
            {suggestion.estimatedPrice && (
              <span className="text-blue-400 font-medium">{suggestion.estimatedPrice}€</span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ShoppingListSuggestions;