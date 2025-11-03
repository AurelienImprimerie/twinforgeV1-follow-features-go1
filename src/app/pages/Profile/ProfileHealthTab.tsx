import React, { useMemo } from 'react';
import { useProfilePerformance } from './hooks/useProfilePerformance';
import { ConditionalMotionSlide } from './components/shared/ConditionalMotionProfile';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useUserStore } from '../../../system/store/userStore';
import { useProfileHealthForm } from './hooks/useProfileHealthForm';
import { ProgressBar, SectionSaveButton, ArrayItemManager } from './components/ProfileHealthComponents';
import { calculateHealthCompletion } from './utils/profileCompletion';
import { InjuriesLimitationsSection } from './components/health/InjuriesLimitationsSection';

// Import migrated components from HealthProfile
import { VaccinationsSection } from '../HealthProfile/components/VaccinationsSection';
import { MedicalConditionsCard } from '../HealthProfile/components/MedicalConditionsCard';
import { CurrentMedicationsCard } from '../HealthProfile/components/CurrentMedicationsCard';
import { AllergiesSection } from '../HealthProfile/components/AllergiesSection';

// Import hooks
import { useVaccinationsForm } from '../HealthProfile/hooks/useVaccinationsForm';
import { useMedicalConditionsForm } from '../HealthProfile/hooks/useMedicalConditionsForm';
import { useAllergiesForm } from '../HealthProfile/hooks/useAllergiesForm';
import { useCountryHealthData } from '../HealthProfile/hooks/useCountryHealthData';

/**
 * Profile Health Tab - Santé & Médical TwinForge
 * Gestion complète des données de santé avec design VisionOS 26
 */
const ProfileHealthTab: React.FC = () => {
  const { profile } = useUserStore();
  const { form, actions, state } = useProfileHealthForm();
  const { register, handleSubmit, errors, isDirty, watchedValues, setValue } = form;
  const { saveBasicHealthSection, saveMedicalSection, saveConstraintsSection, onSubmit } = actions;
  const { saving, sectionSaving, hasBasicChanges, hasMedicalChanges, hasConstraintsChanges } = state;

  // Performance optimization
  const performanceConfig = useProfilePerformance();

  const [newConstraint, setNewConstraint] = React.useState('');
  const [newPhysicalLimitation, setNewPhysicalLimitation] = React.useState('');

  // Calculate completion percentage - memoized
  const completionPercentage = useMemo(
    () => calculateHealthCompletion(profile),
    [profile?.constraints, profile?.medical_conditions, profile?.current_medications]
  );

  // Get country health data for vaccinations
  const countryData = useCountryHealthData(profile?.country);

  // Vaccinations hook
  const vaccinations = useVaccinationsForm(countryData);

  // Medical conditions hook
  const medicalConditions = useMedicalConditionsForm();

  // Allergies hook
  const allergies = useAllergiesForm();

  const addConstraint = () => {
    if (newConstraint.trim()) {
      const current = watchedValues.constraints || [];
      setValue('constraints', [...current, newConstraint.trim()], { shouldDirty: true });
      setNewConstraint('');
    }
  };

  const removeConstraint = (index: number) => {
    const current = watchedValues.constraints || [];
    setValue('constraints', current.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const addPhysicalLimitation = () => {
    if (newPhysicalLimitation.trim()) {
      const current = watchedValues.physicalLimitations || [];
      setValue('physicalLimitations', [...current, newPhysicalLimitation.trim()], { shouldDirty: true });
      setNewPhysicalLimitation('');
    }
  };

  const removePhysicalLimitation = (index: number) => {
    const current = watchedValues.physicalLimitations || [];
    setValue('physicalLimitations', current.filter((_, i) => i !== index), { shouldDirty: true });
  };

  return (
    <ConditionalMotionSlide
      performanceConfig={performanceConfig}
      direction="up"
      distance={20}
      className="space-y-6 profile-section"
    >
      {/* Progress Header */}
      <ProgressBar
        percentage={completionPercentage}
        title="Profil Santé & Médical"
        subtitle="Configurez vos informations médicales et contraintes"
        color="#EF4444"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Health Constraints Card - MOVED TO TOP */}
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
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #EF4444 35%, transparent), color-mix(in srgb, #EF4444 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #EF4444 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #EF4444 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Lock} size={20} style={{ color: '#EF4444' }} variant="pure" />
              </div>
              <div>
                <div className="text-xl">Contraintes Alimentaires</div>
                <div className="text-white/60 text-sm font-normal mt-0.5">Restrictions spécifiques et contraintes médicales</div>
              </div>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-300 text-sm font-medium">Spécifique</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-3">
                Contraintes spécifiques (ex: faible en sodium, sans gluten)
              </label>
              <ArrayItemManager
                items={watchedValues.constraints || []}
                newItem={newConstraint}
                setNewItem={setNewConstraint}
                onAdd={addConstraint}
                onRemove={removeConstraint}
                placeholder="Ajouter une contrainte..."
                itemColor="rgba(139, 92, 246"
                itemLabel="contrainte"
              />
            </div>
          </div>

          <SectionSaveButton
            isDirty={hasConstraintsChanges}
            isSaving={sectionSaving === 'constraints'}
            onSave={saveConstraintsSection}
            sectionName="Contraintes"
          />
        </GlassCard>

        {/* Migrated Vaccinations Section */}
        <VaccinationsSection
          vaccinations={vaccinations.vaccinations}
          countryData={countryData}
          onAddVaccination={vaccinations.onAddVaccination}
          onUpdateVaccination={vaccinations.onUpdateVaccination}
          onRemoveVaccination={vaccinations.onRemoveVaccination}
          onToggleUpToDate={vaccinations.onToggleUpToDate}
          upToDate={vaccinations.upToDate}
          onSave={vaccinations.onSave}
          isSaving={vaccinations.isSaving}
          isDirty={vaccinations.isDirty}
        />

        {/* Medical Conditions and Allergies in Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedicalConditionsCard
            conditions={medicalConditions.conditions}
            newCondition={medicalConditions.newCondition}
            setNewCondition={medicalConditions.setNewCondition}
            onAddCondition={medicalConditions.addCondition}
            onRemoveCondition={medicalConditions.removeCondition}
            onSave={medicalConditions.saveChanges}
            isSaving={medicalConditions.saving}
            isDirty={medicalConditions.isDirty}
          />

          <AllergiesSection
            allergies={allergies.allergies}
            onAddAllergy={allergies.onAddAllergy}
            onRemoveAllergy={allergies.onRemoveAllergy}
            onSave={allergies.onSave}
            isSaving={allergies.isSaving}
            isDirty={allergies.isDirty}
          />
        </div>

        {/* Medications Card */}
        <CurrentMedicationsCard
          medications={medicalConditions.medications}
          newMedication={medicalConditions.newMedication}
          setNewMedication={medicalConditions.setNewMedication}
          onAddMedication={medicalConditions.addMedication}
          onRemoveMedication={medicalConditions.removeMedication}
          onSave={medicalConditions.saveChanges}
          isSaving={medicalConditions.saving}
          isDirty={medicalConditions.isDirty}
        />

        {/* Injuries and Limitations */}
        <InjuriesLimitationsSection
          physicalLimitations={watchedValues.physicalLimitations || []}
          newPhysicalLimitation={newPhysicalLimitation}
          setNewPhysicalLimitation={setNewPhysicalLimitation}
          onAddPhysicalLimitation={addPhysicalLimitation}
          onRemovePhysicalLimitation={removePhysicalLimitation}
          onSave={saveMedicalSection}
          isSaving={sectionSaving === 'medical'}
          isDirty={hasConstraintsChanges}
        />

        {/* Global Save Action */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className={`btn-glass--primary px-8 py-4 text-lg font-semibold ${
              !isDirty ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {saving ? (
                <SpatialIcon Icon={ICONS.Loader2} size={20} className="animate-spin" />
              ) : (
                <SpatialIcon Icon={ICONS.Save} size={20} />
              )}
              <span>{saving ? 'Sauvegarde globale...' : 'Sauvegarder Tout'}</span>
            </div>
          </button>
        </div>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <GlassCard className="p-4" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)'
          }}>
            <h4 className="text-red-300 font-medium mb-3 flex items-center gap-2">
              <SpatialIcon Icon={ICONS.AlertCircle} size={16} />
              Erreurs de validation
            </h4>
            <div className="space-y-2">
              {Object.entries(errors).map(([field, error]) => (
                <p key={field} className="text-red-200 text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  {error.message}
                </p>
              ))}
            </div>
          </GlassCard>
        )}
      </form>
    </ConditionalMotionSlide>
  );
};

export default ProfileHealthTab;
