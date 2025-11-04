import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import MenstrualCycleSection from './components/menstrual/MenstrualCycleSection';
import CycleRegularitySection from './components/menstrual/CycleRegularitySection';
import CurrentCycleInfoCard from './components/menstrual/CurrentCycleInfoCard';
import ReproductiveStatusSelector from './components/menstrual/ReproductiveStatusSelector';
import MenopauseInfoCard from './components/menstrual/MenopauseInfoCard';
import MenopauseDetailsSection from './components/menstrual/MenopauseDetailsSection';
import { useProfileMenstrualForm } from './hooks/useProfileMenstrualForm';
import { useMenopauseForm } from './hooks/useMenopauseForm';
import GlassCard from '../../../ui/cards/GlassCard';
import { ProgressBar } from './components/ProfileIdentityComponents';
import UnsavedChangesIndicator from '../../../ui/components/UnsavedChangesIndicator';
import { calculateMenstrualCompletion } from './utils/profileCompletion';

const ProfileMenstrualTab: React.FC = () => {
  const menstrualForm = useProfileMenstrualForm();
  const menopauseForm = useMenopauseForm();

  const isMenstruating = menopauseForm.formData.reproductive_status === 'menstruating';
  const isLoading = menstrualForm.isLoading || menopauseForm.isLoading;
  const isSaving = menstrualForm.isSaving || menopauseForm.isSaving;

  // Calculate completion percentage based on active form
  const completionPercentage = useMemo(() => {
    if (isMenstruating) {
      return calculateMenstrualCompletion(menstrualForm.formData);
    }
    const fields = Object.values(menopauseForm.formData).filter(v => v !== null && v !== '');
    return Math.round((fields.length / 8) * 100);
  }, [isMenstruating, menstrualForm.formData, menopauseForm.formData]);

  // Track if form is dirty (has unsaved changes)
  const [isDirty, setIsDirty] = React.useState(false);

  // Update dirty state when form data changes
  React.useEffect(() => {
    setIsDirty(true);
  }, [menstrualForm.formData, menopauseForm.formData]);

  // Reset dirty state after successful save
  const handleSaveWithReset = async () => {
    if (isMenstruating) {
      await menstrualForm.handleSave();
    } else {
      await menopauseForm.handleSave();
    }
    setIsDirty(false);
  };

  const errors = isMenstruating ? menstrualForm.errors : menopauseForm.errors;
  const activeFormData = isMenstruating ? menstrualForm.formData : menopauseForm.formData;

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
        modifiedFieldsCount={Object.keys(activeFormData).filter(key => activeFormData[key as keyof typeof activeFormData] !== null && activeFormData[key as keyof typeof activeFormData] !== '').length}
      />

      {/* Enhanced Progress Header */}
      <ProgressBar
        percentage={completionPercentage}
        title={isMenstruating ? "Cycle Menstruel" : "Santé Reproductive"}
        subtitle={isMenstruating ? "Informations sur votre cycle et régularité" : "Suivi de votre santé hormonale"}
        color={isMenstruating ? "#EC4899" : "#F59E0B"}
      />

      {/* Reproductive Status Selector */}
      <ReproductiveStatusSelector
        value={menopauseForm.formData.reproductive_status}
        onChange={(status) => {
          menopauseForm.updateFormData({ reproductive_status: status });
          setIsDirty(true);
        }}
      />

      {/* Info Card - Conditional based on status */}
      {isMenstruating ? (
        menstrualForm.formData.lastPeriodDate && (
          <CurrentCycleInfoCard
            lastPeriodDate={menstrualForm.formData.lastPeriodDate}
            averageCycleLength={menstrualForm.formData.averageCycleLength}
          />
        )
      ) : (
        <MenopauseInfoCard
          status={menopauseForm.formData.reproductive_status}
          lastPeriodDate={menopauseForm.formData.last_period_date}
          menopauseConfirmationDate={menopauseForm.formData.menopause_confirmation_date}
          perimenopauseStage={menopauseForm.formData.perimenopause_stage}
        />
      )}

      {/* Form Sections - Conditional based on status */}
      {isMenstruating ? (
        <>
          <MenstrualCycleSection
            value={{
              lastPeriodDate: menstrualForm.formData.lastPeriodDate,
              averageCycleLength: menstrualForm.formData.averageCycleLength,
              averagePeriodDuration: menstrualForm.formData.averagePeriodDuration,
            }}
            onChange={(value) => menstrualForm.updateFormData(value)}
            errors={menstrualForm.errors}
          />

          <CycleRegularitySection
            value={{
              cycleRegularity: menstrualForm.formData.cycleRegularity,
            }}
            onChange={(value) => menstrualForm.updateFormData(value)}
          />
        </>
      ) : (
        <MenopauseDetailsSection
          status={menopauseForm.formData.reproductive_status}
          value={{
            perimenopause_stage: menopauseForm.formData.perimenopause_stage,
            last_period_date: menopauseForm.formData.last_period_date,
            menopause_confirmation_date: menopauseForm.formData.menopause_confirmation_date,
            fsh_level: menopauseForm.formData.fsh_level,
            estrogen_level: menopauseForm.formData.estrogen_level,
            last_hormone_test_date: menopauseForm.formData.last_hormone_test_date,
            notes: menopauseForm.formData.notes,
          }}
          onChange={(value) => menopauseForm.updateFormData(value)}
          errors={menopauseForm.errors}
        />
      )}

      <GlassCard variant="frosted" className="p-6">
        <div className="space-y-2">
          <h3 className="text-white font-medium flex items-center gap-2">
            🔒 Confidentialité et sécurité
          </h3>
          <p className="text-sm text-white/60">
            Vos données de santé reproductive sont strictement confidentielles et protégées par chiffrement.
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
            💡 Comment TwinForge utilise vos données de santé reproductive
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-sm">🍽️</span>
              </div>
              <div>
                <p className="text-white font-medium">Forge Nutritionnelle</p>
                <p className="text-white/60 text-sm">
                  {isMenstruating
                    ? "Recommandations alimentaires adaptées à votre phase cyclique"
                    : "Nutrition optimisée pour vos besoins hormonaux et santé osseuse"}
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
                  {isMenstruating
                    ? "Conseils de jeûne adaptés aux fluctuations hormonales"
                    : "Protocoles de jeûne adaptés à votre métabolisme et énergie"}
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
                  {isMenstruating
                    ? "Programme d'entraînement optimisé selon votre phase du cycle"
                    : "Focus musculation et densité osseuse pour santé optimale"}
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
                  {isMenstruating
                    ? "Insights proactifs pour optimiser votre bien-être à chaque phase"
                    : "Recommandations personnalisées pour votre transition hormonale"}
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
