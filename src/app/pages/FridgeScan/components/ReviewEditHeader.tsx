import React from 'react';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface ReviewEditHeaderProps {
  inventoryCount: number;
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  onAddCustomItem: () => void;
}

/**
 * Review Edit Header - En-tête de Révision et Édition
 * Composant pour l'en-tête avec recherche et actions de l'étape de révision
 */
const ReviewEditHeader: React.FC<ReviewEditHeaderProps> = ({
  inventoryCount,
  searchFilter,
  setSearchFilter,
  onAddCustomItem
}) => {
  return (
    <GlassCard className="p-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-plasma-cyan) 12%, transparent) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'color-mix(in srgb, var(--color-plasma-cyan) 25%, transparent)'
    }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, var(--color-plasma-cyan) 35%, transparent), color-mix(in srgb, var(--color-fridge-primary) 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, var(--color-plasma-cyan) 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, var(--color-plasma-cyan) 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Edit} size={20} style={{ color: 'var(--color-plasma-cyan)' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Vérifier l'Inventaire</h3>
            <p className="text-white/80 text-sm">
              {inventoryCount} ingrédient{inventoryCount > 1 ? 's' : ''} détecté{inventoryCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddCustomItem}
            className="btn-glass px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Plus} size={14} />
              <span>Ajouter</span>
            </div>
          </button>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Rechercher un ingrédient..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="glass-input w-full"
        />
      </div>
    </GlassCard>
  );
};

export default ReviewEditHeader;