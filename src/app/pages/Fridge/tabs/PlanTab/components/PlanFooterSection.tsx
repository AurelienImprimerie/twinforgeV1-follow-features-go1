import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface PlanFooterSectionProps {
  isGenerating: boolean;
  currentPlan: any;
  selectedInventory: any;
  currentWeek: number;
}

/**
 * Footer section of the Plan Tab containing informational cards
 */
const PlanFooterSection: React.FC<PlanFooterSectionProps> = ({
  isGenerating,
  currentPlan,
  selectedInventory,
  currentWeek
}) => {
  return (
    <>
      {/* Informations sur la Source des Données */}
      {!isGenerating && currentPlan && selectedInventory && (
        <GlassCard
          className="p-4"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #06B6D4 20%, transparent)'
          }}
        >
          <div className="flex items-center gap-3">
            <SpatialIcon Icon={ICONS.Info} size={16} className="text-cyan-400" />
            <div className="text-sm">
              <span className="text-cyan-300 font-medium">Plan basé sur : </span>
              <span className="text-white/80">
                Inventaire du {new Date(selectedInventory.created_at).toLocaleDateString()} 
                ({selectedInventory.inventory_final?.length || 0} ingrédients) + Profil nutritionnel
              </span>
              <span className="text-white/60 ml-2">
                • Semaine {currentWeek}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Conseils Nutritionniste IA */}
      {!isGenerating && currentPlan && (
        <GlassCard
          className="p-6"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #10B981 20%, transparent)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, #10B981 15%, transparent)',
                border: '2px solid color-mix(in srgb, #10B981 25%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Lightbulb} size={14} style={{ color: '#10B981' }} />
            </div>
            <h4 className="text-green-300 font-semibold">Conseils de votre Nutritionniste IA</h4>
          </div>
          
          <div className="space-y-2 text-sm text-green-200">
            <p>• <strong>Personnalisation :</strong> Ce plan est adapté à vos objectifs fitness et préférences alimentaires</p>
            <p>• <strong>Optimisation :</strong> Utilise au maximum les ingrédients de votre inventaire sélectionné</p>
            <p>• <strong>Évolution :</strong> Générez une nouvelle semaine pour une progression continue</p>
            <p>• <strong>Flexibilité :</strong> Cliquez sur une recette pour voir les détails complets et instructions</p>
          </div>
        </GlassCard>
      )}
    </>
  );
};

export default PlanFooterSection;