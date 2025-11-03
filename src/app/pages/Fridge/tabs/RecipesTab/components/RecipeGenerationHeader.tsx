import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import CustomDropdown from '../../RecipesTab/components/CustomDropdown';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';

interface InventoryOption {
  id: string;
  inventory_final: any[];
  created_at: string;
}

interface RecipeGenerationHeaderProps {
  availableInventories: InventoryOption[];
  selectedInventoryId: string | null;
  onSelectInventory: (inventoryId: string) => void;
  onGenerateRecipes: () => void;
  isGenerating: boolean;
}

const RecipeGenerationHeader: React.FC<RecipeGenerationHeaderProps> = ({
  availableInventories,
  selectedInventoryId,
  onSelectInventory,
  onGenerateRecipes,
  isGenerating
}) => {
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const selectedInventory = availableInventories.find(inv => inv.id === selectedInventoryId);
  const hasValidInventory = selectedInventory && selectedInventory.inventory_final.length > 0;

  const inventoryOptions = availableInventories.map(inventory => ({
    value: inventory.id, 
    label: `Inventaire du ${new Date(inventory.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })} (${inventory.inventory_final.length} ingrédients)`,
    subtitle: new Date(inventory.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }));

  const handleGenerateClick = () => {
    click();
    onGenerateRecipes();
  };

  const handleInventorySelect = (inventoryId: string) => {
    click();
    onSelectInventory(inventoryId);
  };

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
      })}
    >
      <GlassCard
        className="p-5"
        style={isPerformanceMode ? {
          background: 'linear-gradient(145deg, color-mix(in srgb, #10B981 20%, #1e293b), color-mix(in srgb, #10B981 10%, #0f172a))',
          borderColor: 'color-mix(in srgb, #10B981 40%, transparent)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
        } : {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          {/* Section Titre et Description */}
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center breathing-icon flex-shrink-0"
              style={isPerformanceMode ? {
                background: 'linear-gradient(135deg, color-mix(in srgb, #10B981 35%, #1e293b), color-mix(in srgb, #10B981 25%, #0f172a))',
                border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
              } : {
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #10B981 35%, transparent), color-mix(in srgb, #10B981 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
                boxShadow: '0 0 30px color-mix(in srgb, #10B981 40%, transparent)'
              }}
            >
              <SpatialIcon 
                Icon={ICONS.ChefHat} 
                size={40} 
                className="text-white" 
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Générateur de Recettes
              </h2>
              <p className="text-white/70 text-sm">
                Créez des recettes personnalisées à partir de votre inventaire
              </p>
            </div>
          </div>
        </div>

        {/* Sélection d'Inventaire */}
        <div className="w-full mt-5">
          <CustomDropdown
            options={inventoryOptions}
            value={selectedInventoryId || ''}
            onChange={handleInventorySelect}
            placeholder="Sélectionner un inventaire"
            className="w-full"
            disabled={isGenerating}
          />
        </div>

        {/* Message d'aide si aucun inventaire */}
        {availableInventories.length === 0 && (
          <MotionDiv
            {...(!isPerformanceMode && {
              initial: { opacity: 0 },
              animate: { opacity: 1 }
            })}
            className="pt-4 border-t border-white/10 mt-4"
          >
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <SpatialIcon 
                Icon={ICONS.AlertTriangle} 
                size={16} 
              />
              <span>
                Aucun inventaire disponible. Scannez votre frigo pour commencer !
              </span>
            </div>
          </MotionDiv>
        )}
      </GlassCard>

      {/* Generate Recipes Button - Full width below */}
      <MotionDiv
        className="w-full mt-4"
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay: 0.1 }
        })}
      >
        <button
          onClick={handleGenerateClick}
          disabled={!hasValidInventory || isGenerating}
          className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${!hasValidInventory || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={hasValidInventory && !isGenerating ? (isPerformanceMode ? {
            background: 'linear-gradient(145deg, color-mix(in srgb, #10B981 90%, #1e293b), color-mix(in srgb, #22C55E 85%, #0f172a))',
            border: '2px solid color-mix(in srgb, #10B981 60%, transparent)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
          } : {
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(34, 197, 94, 0.85) 100%)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: '2px solid color-mix(in srgb, #10B981 60%, transparent)',
            boxShadow: `
              0 12px 40px color-mix(in srgb, #10B981 40%, transparent),
              0 0 60px color-mix(in srgb, #10B981 30%, transparent),
              inset 0 3px 0 rgba(255, 255, 255, 0.4),
              inset 0 -3px 0 rgba(0, 0, 0, 0.2),
              inset 2px 0 0 rgba(255, 255, 255, 0.1),
              inset -2px 0 0 rgba(0, 0, 0, 0.1)
            `,
            transform: 'translateZ(0)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)'
          }) : undefined}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <SpatialIcon Icon={ICONS.Sparkles} size={20} />
              <span>Générer les Recettes</span>
            </>
          )}
        </button>
      </MotionDiv>
    </MotionDiv>
  );
};

export default RecipeGenerationHeader;