import React from 'react';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import type { FridgeItem } from '../../../../domain/recipe';

interface InventoryStatsProps {
  inventory: FridgeItem[];
}

/**
 * Inventory Stats - Statistiques de l'Inventaire
 * Composant pour afficher un résumé des ingrédients par fraîcheur
 */
const InventoryStats: React.FC<InventoryStatsProps> = ({
  inventory
}) => {
  const totalItems = inventory.length;
  const totalCategories = new Set(inventory.map(item => item.category)).size;

  // Since freshness was removed from the system, we'll use placeholder values
  // or calculate based on other criteria if needed
  const freshItems = 0;
  const mediumItems = 0;
  const urgentItems = 0;

  const stats = [
    {
      label: 'Total',
      value: totalItems,
      icon: ICONS.Package,
      color: 'var(--color-fridge-primary)'
    },
    {
      label: 'Catégories',
      value: totalCategories,
      icon: ICONS.Grid3X3,
      color: 'var(--color-fridge-secondary)'
    }
  ];

  return (
    <GlassCard className="p-4" style={{
      background: `
        radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'color-mix(in srgb, #06B6D4 20%, transparent)'
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SpatialIcon Icon={ICONS.BarChart3} size={16} className="text-cyan-400" />
          <span className="text-cyan-300 font-medium">Résumé de l'Inventaire</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-300">
              {freshItems} frais
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-orange-300">
              {mediumItems} moyens
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-red-300">
              {urgentItems} à utiliser rapidement
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default InventoryStats;