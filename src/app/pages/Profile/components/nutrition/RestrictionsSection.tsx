import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { SectionSaveButton, ArrayItemManager } from '../ProfileNutritionComponents';

interface RestrictionsSectionProps {
  register: any;
  watchedValues: any;
  setValue: any;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const RestrictionsSection: React.FC<RestrictionsSectionProps> = ({
  register,
  watchedValues,
  setValue,
  isDirty,
  isSaving,
  onSave
}) => {
  const [newAllergy, setNewAllergy] = React.useState('');
  const [newIntolerance, setNewIntolerance] = React.useState('');

  const addAllergy = React.useCallback(() => {
    if (newAllergy.trim()) {
      const current = watchedValues.allergies || [];
      const trimmed = newAllergy.trim();
      if (!current.includes(trimmed)) {
        setValue('allergies', [...current, trimmed], { shouldDirty: true });
        setNewAllergy('');
      }
    }
  }, [newAllergy, watchedValues.allergies, setValue]);

  const removeAllergy = React.useCallback((index: number) => {
    const current = watchedValues.allergies || [];
    setValue('allergies', current.filter((_, i) => i !== index), { shouldDirty: true });
  }, [watchedValues.allergies, setValue]);

  const addIntolerance = React.useCallback(() => {
    if (newIntolerance.trim()) {
      const current = watchedValues.intolerances || [];
      const trimmed = newIntolerance.trim();
      if (!current.includes(trimmed)) {
        setValue('intolerances', [...current, trimmed], { shouldDirty: true });
        setNewIntolerance('');
      }
    }
  }, [newIntolerance, watchedValues.intolerances, setValue]);

  const removeIntolerance = React.useCallback((index: number) => {
    const current = watchedValues.intolerances || [];
    setValue('intolerances', current.filter((_, i) => i !== index), { shouldDirty: true });
  }, [watchedValues.intolerances, setValue]);

  const handleNoKnownAllergiesChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('noKnownAllergies', e.target.checked, { shouldDirty: true });
    if (e.target.checked) {
      setValue('allergies', [], { shouldDirty: true });
    }
  }, [setValue]);

  return (
    <GlassCard className="p-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, rgba(239, 68, 68, 0.08) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'rgba(239, 68, 68, 0.2)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #EF4444 35%, transparent), color-mix(in srgb, #EF4444 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #EF4444 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #EF4444 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.AlertCircle} size={20} style={{ color: '#EF4444' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Restrictions Alimentaires</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Allergies et intolérances importantes</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-red-300 text-sm font-medium">Critique</span>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Allergies */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">
            Allergies alimentaires
          </label>
          
          {/* No Allergies Checkbox */}
          <div className="mb-4">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/8 transition-colors">
              <input
                {...register('noKnownAllergies')}
                type="checkbox"
                onChange={handleNoKnownAllergiesChange}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                watchedValues.noKnownAllergies 
                  ? 'border-green-400 bg-green-500' 
                  : 'border-white/30'
              }`}>
                {watchedValues.noKnownAllergies && (
                  <SpatialIcon Icon={ICONS.Check} size={12} className="text-white" />
                )}
              </div>
              <div>
                <div className="text-white font-medium">Je n'ai pas d'allergies alimentaires connues</div>
                <div className="text-white/60 text-sm">Cochez cette case si vous n'avez aucune allergie</div>
              </div>
            </label>
          </div>
          
          {/* Allergies List - Only show if user hasn't checked "no allergies" */}
          {!watchedValues.noKnownAllergies && (
            <ArrayItemManager
              items={watchedValues.allergies || []}
              newItem={newAllergy}
              setNewItem={setNewAllergy}
              onAdd={addAllergy}
              onRemove={removeAllergy}
              placeholder="Ajouter une allergie..."
              itemColor="#EF4444"
              itemLabel="allergie"
            />
          )}
        </div>

        {/* Intolerances */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">
            Intolérances alimentaires
          </label>
          <ArrayItemManager
            items={watchedValues.intolerances || []}
            newItem={newIntolerance}
            setNewItem={setNewIntolerance}
            onAdd={addIntolerance}
            onRemove={removeIntolerance}
            placeholder="Ajouter une intolérance..."
            itemColor="#F59E0B"
            itemLabel="intolérance"
          />
        </div>
      </div>

      <SectionSaveButton
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        sectionName="Restrictions"
      />
    </GlassCard>
  );
};