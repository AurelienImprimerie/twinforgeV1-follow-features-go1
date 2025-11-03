import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { SectionSaveButton } from '../ProfileNutritionComponents';

interface DietBudgetSectionProps {
  register: any;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const DietBudgetSection: React.FC<DietBudgetSectionProps> = ({
  register,
  isDirty,
  isSaving,
  onSave
}) => {
  return (
    <GlassCard className="p-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'rgba(16, 185, 129, 0.2)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #10B981 35%, transparent), color-mix(in srgb, #10B981 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #10B981 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Utensils} size={20} style={{ color: '#10B981' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Régime & Budget</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Vos préférences alimentaires et contraintes budgétaires</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 text-sm font-medium">Base</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diet Type */}
        <div>
          <label htmlFor="diet" className="block text-white/90 text-sm font-medium mb-3">
            Type de régime
          </label>
          <select
            {...register('diet')}
            id="diet"
            className="glass-input"
          >
            <option value="">Aucun régime spécifique</option>
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Végétarien</option>
            <option value="vegan">Végétalien</option>
            <option value="pescatarian">Pescétarien</option>
            <option value="keto">Cétogène</option>
            <option value="paleo">Paléo</option>
            <option value="mediterranean">Méditerranéen</option>
            <option value="low_carb">Faible en glucides</option>
            <option value="intermittent_fasting">Jeûne intermittent</option>
          </select>
        </div>

        {/* Budget Level */}
        <div>
          <label htmlFor="budgetLevel" className="block text-white/90 text-sm font-medium mb-3">
            Niveau de budget
          </label>
          <select
            {...register('budgetLevel')}
            id="budgetLevel"
            className="glass-input"
          >
            <option value="">Non spécifié</option>
            <option value="low">Économique</option>
            <option value="medium">Modéré</option>
            <option value="high">Élevé</option>
          </select>
        </div>
      </div>

      <SectionSaveButton
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        sectionName="Régime"
      />
    </GlassCard>
  );
};