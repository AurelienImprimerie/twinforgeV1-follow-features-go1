import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

export interface ShoppingListAdviceProps {
  advice: string[];
}

/**
 * Shopping List Advice Component
 */
const ShoppingListAdvice: React.FC<ShoppingListAdviceProps> = ({ advice }) => {
  if (!advice || advice.length === 0) return null;

  return (
    <GlassCard className="border-green-500/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <SpatialIcon Icon={ICONS.CheckCircle} size={20} className="text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Conseils Personnalisés</h3>
      </div>
      <div className="space-y-3">
        {advice.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-2"></div>
            <p className="text-white/90 text-sm leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ShoppingListAdvice;