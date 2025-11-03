import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { SectionSaveButton } from '../ProfileNutritionComponents';
import { KitchenEquipmentGrid } from './KitchenEquipmentGrid';

interface EssentialsSectionProps {
  register: any;
  watchedValues: any;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const EssentialsSection: React.FC<EssentialsSectionProps> = ({
  register,
  watchedValues,
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
            <SpatialIcon Icon={ICONS.Users} size={20} style={{ color: '#10B981' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Informations Essentielles</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Foyer, temps de cuisine et équipement disponible</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 text-sm font-medium">Essentiel</span>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Household Details */}
        <div>
          <h4 className="text-white/90 text-sm font-medium mb-4">Composition du foyer</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="householdDetails.adults" className="block text-white/80 text-sm mb-2">
                Adultes
              </label>
              <input
                {...register('householdDetails.adults', { valueAsNumber: true })}
                type="number"
                id="householdDetails.adults"
                min="1"
                max="20"
                className="glass-input"
                placeholder="1"
              />
            </div>
            <div>
              <label htmlFor="householdDetails.children" className="block text-white/80 text-sm mb-2">
                Enfants
              </label>
              <input
                {...register('householdDetails.children', { valueAsNumber: true })}
                type="number"
                id="householdDetails.children"
                min="0"
                max="20"
                className="glass-input"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Meal Prep Time */}
        <div>
          <h4 className="text-white/90 text-sm font-medium mb-4">Temps disponible par repas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="mealPrepPreferences.weekdayTimeMin" className="block text-white/80 text-sm mb-2">
                Semaine (minutes)
              </label>
              <input
                {...register('mealPrepPreferences.weekdayTimeMin', { valueAsNumber: true })}
                type="number"
                id="mealPrepPreferences.weekdayTimeMin"
                min="5"
                max="180"
                className="glass-input"
                placeholder="30"
              />
            </div>
            <div>
              <label htmlFor="mealPrepPreferences.weekendTimeMin" className="block text-white/80 text-sm mb-2">
                Week-end (minutes)
              </label>
              <input
                {...register('mealPrepPreferences.weekendTimeMin', { valueAsNumber: true })}
                type="number"
                id="mealPrepPreferences.weekendTimeMin"
                min="5"
                max="300"
                className="glass-input"
                placeholder="60"
              />
            </div>
            <div>
              <label htmlFor="mealPrepPreferences.cookingSkill" className="block text-white/80 text-sm mb-2">
                Niveau de cuisine
              </label>
              <select
                {...register('mealPrepPreferences.cookingSkill')}
                id="mealPrepPreferences.cookingSkill"
                className="glass-input"
              >
                <option value="beginner">🌱 Débutant</option>
                <option value="intermediate">👨‍🍳 Intermédiaire</option>
                <option value="advanced">👨‍🍳⭐ Confirmé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kitchen Equipment */}
        <div>
          <h4 className="text-white/90 text-sm font-medium mb-4">Équipement de cuisine disponible</h4>
          <KitchenEquipmentGrid
            register={register}
            watchedValues={watchedValues}
          />
        </div>
      </div>

      <SectionSaveButton
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        sectionName="Essentiels"
      />
    </GlassCard>
  );
};