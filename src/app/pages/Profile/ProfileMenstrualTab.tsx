import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import MenstrualCycleSection from './components/menstrual/MenstrualCycleSection';
import CycleRegularitySection from './components/menstrual/CycleRegularitySection';
import CurrentCycleInfoCard from './components/menstrual/CurrentCycleInfoCard';
import { useProfileMenstrualForm } from './hooks/useProfileMenstrualForm';
import GlassCard from '../../../ui/cards/GlassCard';
import { ProgressBar } from './components/ProfileIdentityComponents';
import UnsavedChangesIndicator from '../../../ui/components/UnsavedChangesIndicator';
import { calculateMenstrualCompletion } from './utils/profileCompletion';

const ProfileMenstrualTab: React.FC = () => {
  const {
    formData,
    updateFormData,
    errors,
    isLoading,
    isSaving,
    handleSave,
  } = useProfileMenstrualForm();

  // Calculate completion percentage
  const completionPercentage = useMemo(
    () => calculateMenstrualCompletion(formData),
    [formData.lastPeriodDate, formData.averageCycleLength, formData.averagePeriodDuration, formData.cycleRegularity]
  );

  // Track if form is dirty (has unsaved changes)
  const [isDirty, setIsDirty] = React.useState(false);

  // Update dirty state when form data changes
  React.useEffect(() => {
    setIsDirty(true);
  }, [formData]);

  // Reset dirty state after successful save
  const handleSaveWithReset = async () => {
    await handleSave();
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unsaved Changes Indicator */}
      <UnsavedChangesIndicator
        isDirty={isDirty}
        onSave={handleSaveWithReset}
        isSaving={isSaving}
        isValid={Object.keys(errors).length === 0}
        modifiedFieldsCount={Object.keys(formData).filter(key => formData[key as keyof typeof formData] !== '').length}
      />

      {/* Enhanced Progress Header in Pink */}
      <ProgressBar
        percentage={completionPercentage}
        title="Cycle Menstruel"
        subtitle="Informations sur votre cycle et régularité"
        color="#EC4899"
      />

      {formData.lastPeriodDate && (
        <CurrentCycleInfoCard
          lastPeriodDate={formData.lastPeriodDate}
          averageCycleLength={formData.averageCycleLength}
        />
      )}

      <MenstrualCycleSection
        value={{
          lastPeriodDate: formData.lastPeriodDate,
          averageCycleLength: formData.averageCycleLength,
          averagePeriodDuration: formData.averagePeriodDuration,
        }}
        onChange={(value) => updateFormData(value)}
        errors={errors}
      />

      <CycleRegularitySection
        value={{
          cycleRegularity: formData.cycleRegularity,
        }}
        onChange={(value) => updateFormData(value)}
      />

      <GlassCard variant="frosted" className="p-6">
        <div className="space-y-2">
          <h3 className="text-white font-medium flex items-center gap-2">
            🔒 Confidentialité et sécurité
          </h3>
          <p className="text-sm text-white/60">
            Vos données menstruelles sont strictement confidentielles et protégées par chiffrement.
            Elles ne sont utilisées que pour personnaliser vos recommandations et ne sont jamais partagées.
          </p>
        </div>
      </GlassCard>

      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(236, 72, 153, 0.2)'
        }}
      >
        <div className="space-y-3 text-white/80">
          <h3 className="text-white font-semibold text-lg mb-4">
            💡 Comment TwinForge utilise vos données de cycle
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-sm">🍽️</span>
              </div>
              <div>
                <p className="text-white font-medium">Forge Nutritionnelle</p>
                <p className="text-white/60 text-sm">
                  Recommandations alimentaires adaptées à votre phase cyclique et besoins hormonaux
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-sm">⏱️</span>
              </div>
              <div>
                <p className="text-white font-medium">Forge Temporelle</p>
                <p className="text-white/60 text-sm">
                  Conseils de jeûne adaptés aux fluctuations hormonales de votre cycle
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-sm">💪</span>
              </div>
              <div>
                <p className="text-white font-medium">Forge Énergétique</p>
                <p className="text-white/60 text-sm">
                  Programme d'entraînement optimisé selon votre énergie et phase du cycle
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-sm">🧠</span>
              </div>
              <div>
                <p className="text-white font-medium">Intelligence Centrale</p>
                <p className="text-white/60 text-sm">
                  Insights et alertes proactives pour optimiser votre bien-être à chaque phase
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfileMenstrualTab;
