import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface SelectedInventoryActionsCardProps {
  session: any;
  onDeleteIndividualInventory: (inventoryId: string) => void;
}

const SelectedInventoryActionsCard: React.FC<SelectedInventoryActionsCardProps> = ({
  session,
  onDeleteIndividualInventory
}) => {
  const navigate = useNavigate();

  const handleGenerateRecipes = () => {
    navigate('/fridge#recipes');
  };

  const handleGenerateMealPlan = () => {
    navigate('/fridge#plan');
  };

  const handleDeleteInventory = () => {
    onDeleteIndividualInventory(session.id);
  };

  return (
    <div
      className="glass-card p-6 rounded-3xl"
      style={{
        background: `
          linear-gradient(135deg,
            color-mix(in srgb, var(--color-fridge-primary) 15%, transparent) 0%,
            color-mix(in srgb, var(--color-plasma-cyan) 12%, transparent) 50%,
            color-mix(in srgb, var(--color-fridge-primary) 8%, transparent) 100%
          )
        `,
        borderColor: 'color-mix(in srgb, var(--color-fridge-primary) 40%, transparent)',
        borderRadius: '1.5rem',
        boxShadow: `
          0 12px 40px color-mix(in srgb, var(--color-fridge-primary) 25%, transparent),
          0 4px 16px rgba(0, 0, 0, 0.3),
          inset 0 2px 0 rgba(255, 255, 255, 0.15),
          inset 0 -2px 0 rgba(0, 0, 0, 0.1)
        `
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2 rounded-xl"
          style={{
            background: `
              radial-gradient(circle at center, 
                color-mix(in srgb, var(--color-fridge-primary) 30%, transparent) 0%,
                color-mix(in srgb, var(--color-fridge-primary) 20%, transparent) 50%,
                color-mix(in srgb, var(--color-fridge-primary) 10%, transparent) 100%
              )
            `,
            border: '1px solid color-mix(in srgb, var(--color-fridge-primary) 50%, transparent)',
            boxShadow: `
              0 0 20px color-mix(in srgb, var(--color-fridge-primary) 40%, transparent),
              0 4px 12px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          <SpatialIcon Icon={ICONS.CheckCircle} size={20} className="text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Inventaire Sélectionné</h3>
      </div>
      
      <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-gray-300 text-sm">
          Inventaire du {new Date(session.created_at).toLocaleDateString('fr-FR')}
        </p>
        <p className="text-white font-medium">
          {session.inventory_final?.length || 0} articles détectés
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          onClick={handleGenerateRecipes}
          className="btn-glass--primary px-4 py-3 text-sm font-medium rounded-2xl"
          style={{
            background: `
              linear-gradient(135deg,
                var(--color-fridge-primary) 0%,
                color-mix(in srgb, var(--color-fridge-primary) 80%, #ffffff) 100%
              )
            `,
            borderColor: 'color-mix(in srgb, var(--color-fridge-primary) 70%, transparent)',
            borderRadius: '1rem',
            boxShadow: `
              0 8px 24px color-mix(in srgb, var(--color-fridge-primary) 35%, transparent),
              0 3px 12px rgba(0, 0, 0, 0.25),
              inset 0 2px 0 rgba(255, 255, 255, 0.2),
              inset 0 -2px 0 rgba(0, 0, 0, 0.1)
            `,
            color: 'white',
            transform: 'translateZ(0)',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.ChefHat} size={16} />
            <span>Générer Recettes</span>
          </div>
        </button>

        <button
          onClick={handleGenerateMealPlan}
          className="btn-glass--primary px-4 py-3 text-sm font-medium rounded-2xl"
          style={{
            background: `
              linear-gradient(135deg,
                var(--color-plasma-cyan) 0%,
                color-mix(in srgb, var(--color-plasma-cyan) 80%, #ffffff) 100%
              )
            `,
            borderColor: 'color-mix(in srgb, var(--color-plasma-cyan) 70%, transparent)',
            borderRadius: '1rem',
            boxShadow: `
              0 8px 24px color-mix(in srgb, var(--color-plasma-cyan) 35%, transparent),
              0 3px 12px rgba(0, 0, 0, 0.25),
              inset 0 2px 0 rgba(255, 255, 255, 0.2),
              inset 0 -2px 0 rgba(0, 0, 0, 0.1)
            `,
            color: 'white',
            transform: 'translateZ(0)',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Calendar} size={16} />
            <span>Plan de Repas</span>
          </div>
        </button>

        <button
          onClick={handleDeleteInventory}
          className="btn-glass--danger px-4 py-3 text-sm font-medium rounded-2xl"
          style={{
            borderRadius: '1rem'
          }}
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Trash2} size={16} />
            <span>Supprimer cet inventaire</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SelectedInventoryActionsCard;