import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { SectionSaveButton, ArrayItemManager } from '../ProfileNutritionComponents';

interface ShoppingPreferencesSectionProps {
  register: any;
  watchedValues: any;
  setValue: any;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ShoppingPreferencesSection: React.FC<ShoppingPreferencesSectionProps> = ({
  register,
  watchedValues,
  setValue,
  isDirty,
  isSaving,
  onSave
}) => {
  const [newShoppingBias, setNewShoppingBias] = React.useState('');

  const addShoppingBias = React.useCallback(() => {
    if (newShoppingBias.trim()) {
      const current = watchedValues.shoppingPreferences?.bias || [];
      const trimmed = newShoppingBias.trim();
      if (!current.includes(trimmed)) {
        setValue('shoppingPreferences.bias', [...current, trimmed], { shouldDirty: true });
        setNewShoppingBias('');
      }
    }
  }, [newShoppingBias, watchedValues.shoppingPreferences?.bias, setValue]);

  const removeShoppingBias = React.useCallback((index: number) => {
    const current = watchedValues.shoppingPreferences?.bias || [];
    setValue('shoppingPreferences.bias', current.filter((_, i) => i !== index), { shouldDirty: true });
  }, [watchedValues.shoppingPreferences?.bias, setValue]);

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
            <SpatialIcon Icon={ICONS.ShoppingCart} size={20} style={{ color: '#10B981' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Habitudes de Courses</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Fréquence, portions et préférences d'achat</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 text-sm font-medium">Courses</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="shoppingPreferences.frequencyPerWeek" className="block text-white/80 text-sm mb-2">
            Fréquence courses/semaine
          </label>
          <input
            {...register('shoppingPreferences.frequencyPerWeek', { valueAsNumber: true })}
            type="number"
            id="shoppingPreferences.frequencyPerWeek"
            min="1"
            max="7"
            className="glass-input"
            placeholder="2"
          />
        </div>
        
        <div>
          <label htmlFor="shoppingPreferences.defaultPortionsPerMeal" className="block text-white/80 text-sm mb-2">
            Portions par repas par défaut
          </label>
          <input
            {...register('shoppingPreferences.defaultPortionsPerMeal', { valueAsNumber: true })}
            type="number"
            id="shoppingPreferences.defaultPortionsPerMeal"
            min="1"
            max="12"
            className="glass-input"
            placeholder="2"
          />
        </div>
        
        <div>
          <label htmlFor="shoppingPreferences.batchCooking" className="block text-white/80 text-sm mb-2">
            Batch cooking
          </label>
          <select
            {...register('shoppingPreferences.batchCooking')}
            id="shoppingPreferences.batchCooking"
            className="glass-input"
          >
            <option value="never">❌ Jamais</option>
            <option value="sometimes">🔄 Parfois</option>
            <option value="often">✅ Souvent</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="shoppingPreferences.budgetPerWeek" className="block text-white/80 text-sm mb-2">
            Budget/semaine (€)
          </label>
          <input
            {...register('shoppingPreferences.budgetPerWeek', { valueAsNumber: true })}
            type="number"
            id="shoppingPreferences.budgetPerWeek"
            min="0"
            max="1000"
            step="10"
            className="glass-input"
            placeholder="100"
          />
        </div>
      </div>

      {/* Shopping Bias */}
      <div className="mt-6">
        <label className="block text-white/90 text-sm font-medium mb-3">
          Biais d'achat (bio, local, format familial...)
        </label>
        <ArrayItemManager
          items={watchedValues.shoppingPreferences?.bias || []}
          newItem={newShoppingBias}
          setNewItem={setNewShoppingBias}
          onAdd={addShoppingBias}
          onRemove={removeShoppingBias}
          placeholder="Ex: Bio, Local, Format familial..."
          itemColor="#EC4899"
          itemLabel="préférence"
        />
      </div>

      <SectionSaveButton
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        sectionName="Courses"
      />
    </GlassCard>
  );
};