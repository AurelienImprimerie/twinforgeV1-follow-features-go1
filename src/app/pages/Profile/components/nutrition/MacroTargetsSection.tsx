import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { SectionSaveButton } from '../ProfileNutritionComponents';
import { useUserStore } from '../../../../../system/store/userStore';
import { calculateDailyCalories, getCalorieCalculationExplanation, canCalculateCalories } from '../../../../../lib/nutrition/calorieCalculator';

interface MacroTargetsSectionProps {
  register: any;
  watchedValues: any;
  setValue: any;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const MacroTargetsSection: React.FC<MacroTargetsSectionProps> = ({
  register,
  watchedValues,
  setValue,
  isDirty,
  isSaving,
  onSave
}) => {
  const { profile } = useUserStore();
  const [hasAutoCalculated, setHasAutoCalculated] = React.useState(false);

  // Calculate recommended calories based on user profile
  const calculatedCalories = React.useMemo(() => {
    if (!profile) return null;

    return calculateDailyCalories({
      sex: profile.sex,
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      birthdate: profile.birthdate,
      activity_level: profile.activity_level,
      objective: profile.objective
    });
  }, [profile?.sex, profile?.weight_kg, profile?.height_cm, profile?.birthdate, profile?.activity_level, profile?.objective]);

  const canCalculate = React.useMemo(() => {
    if (!profile) return false;
    return canCalculateCalories({
      sex: profile.sex,
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      birthdate: profile.birthdate
    });
  }, [profile?.sex, profile?.weight_kg, profile?.height_cm, profile?.birthdate]);

  const calculationExplanation = React.useMemo(() => {
    if (!profile) return '';
    return getCalorieCalculationExplanation({
      sex: profile.sex,
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      birthdate: profile.birthdate,
      activity_level: profile.activity_level,
      objective: profile.objective
    }, calculatedCalories);
  }, [profile, calculatedCalories]);

  // Auto-fill calories if empty and calculation is possible
  React.useEffect(() => {
    if (hasAutoCalculated || !calculatedCalories) return;

    const currentCalories = watchedValues.macroTargets?.kcal;

    // Only auto-fill if field is empty
    if (!currentCalories || currentCalories === 0) {
      setValue('macroTargets.kcal', calculatedCalories, { shouldDirty: false });
    }

    setHasAutoCalculated(true);
  }, [calculatedCalories, watchedValues.macroTargets?.kcal, setValue, hasAutoCalculated]);
  return (
    <GlassCard className="p-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'rgba(34, 197, 94, 0.2)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #22C55E 35%, transparent), color-mix(in srgb, #22C55E 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #22C55E 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #22C55E 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Target} size={20} style={{ color: '#22C55E' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Objectifs Nutritionnels</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Cibles nutritionnelles optionnelles pour l'IA</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 text-sm font-medium">Optionnel</span>
        </div>
      </div>

      {/* Auto-calculation info */}
      {canCalculate && calculatedCalories && (
        <div className="mb-4 p-3 rounded-xl" style={{
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <div className="flex items-start gap-2">
            <SpatialIcon
              Icon={ICONS.Sparkles}
              size={14}
              className="flex-shrink-0 mt-0.5"
              style={{ color: '#22C55E' }}
            />
            <div className="flex-1">
              <p className="text-green-300 text-xs font-medium mb-1">
                Calcul automatique
              </p>
              <p className="text-white/70 text-xs">
                {calculationExplanation}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="macroTargets.kcal" className="flex items-center gap-2 text-white/80 text-sm mb-2">
            Calories/jour
            {canCalculate && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <SpatialIcon Icon={ICONS.Sparkles} size={10} />
                Auto
              </span>
            )}
          </label>
          <input
            {...register('macroTargets.kcal', { valueAsNumber: true })}
            type="number"
            id="macroTargets.kcal"
            min="800"
            max="5000"
            step="50"
            className="glass-input"
            placeholder={calculatedCalories?.toString() || "2000"}
          />
          {!canCalculate && (
            <p className="text-white/50 text-xs mt-1">
              Complétez votre profil (sexe, poids, taille, date de naissance) pour le calcul automatique
            </p>
          )}
        </div>
        <div>
          <label htmlFor="macroTargets.fiberMinG" className="block text-white/80 text-sm mb-2">
            Fibres min (g)
          </label>
          <input
            {...register('macroTargets.fiberMinG', { valueAsNumber: true })}
            type="number"
            id="macroTargets.fiberMinG"
            min="0"
            max="100"
            className="glass-input"
            placeholder="25"
          />
        </div>
        <div>
          <label htmlFor="macroTargets.sugarMaxG" className="block text-white/80 text-sm mb-2">
            Sucre max (g)
          </label>
          <input
            {...register('macroTargets.sugarMaxG', { valueAsNumber: true })}
            type="number"
            id="macroTargets.sugarMaxG"
            min="0"
            max="200"
            className="glass-input"
            placeholder="50"
          />
        </div>
        <div>
          <label htmlFor="macroTargets.saltMaxMg" className="block text-white/80 text-sm mb-2">
            Sel max (mg)
          </label>
          <input
            {...register('macroTargets.saltMaxMg', { valueAsNumber: true })}
            type="number"
            id="macroTargets.saltMaxMg"
            min="0"
            max="10000"
            step="100"
            className="glass-input"
            placeholder="2300"
          />
        </div>
        <div>
          <label htmlFor="macroTargets.carbsMaxG" className="block text-white/80 text-sm mb-2">
            Glucides max (g)
          </label>
          <input
            {...register('macroTargets.carbsMaxG', { valueAsNumber: true })}
            type="number"
            id="macroTargets.carbsMaxG"
            min="0"
            max="1000"
            className="glass-input"
            placeholder="250"
          />
        </div>
        <div>
          <label htmlFor="macroTargets.fatMinG" className="block text-white/80 text-sm mb-2">
            Lipides min (g)
          </label>
          <input
            {...register('macroTargets.fatMinG', { valueAsNumber: true })}
            type="number"
            id="macroTargets.fatMinG"
            min="0"
            max="300"
            className="glass-input"
            placeholder="60"
          />
        </div>
      </div>

      <SectionSaveButton
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        sectionName="Nutrition"
      />
    </GlassCard>
  );
};