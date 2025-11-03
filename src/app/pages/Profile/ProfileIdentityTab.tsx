/**
 * Profile Identity Tab - Modularized Version
 * Main component orchestrating profile identity management
 * Optimized with adaptive performance system
 */

import React, { useMemo } from 'react';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { isValidForCalculations } from './utils/profileCalculations';
import { ProgressBar, SectionSaveButton, BMICalculatorCard } from './components/ProfileIdentityComponents';
import { useProfileIdentityForm } from './hooks/useProfileIdentityForm';
import { useUserStore } from '../../../system/store/userStore';
import { useProfilePerformance, useProfileMotionVariants } from './hooks/useProfilePerformance';
import { ConditionalMotionSlide } from './components/shared/ConditionalMotionProfile';
import { calculateIdentityCompletion } from './utils/profileCompletion';

/**
 * Profile Identity Tab - Main Component
 * Simplified orchestrator for profile identity management
 */
const ProfileIdentityTab = React.memo(() => {
  const { form, actions, state } = useProfileIdentityForm();
  const { register, handleSubmit, errors, isValid, isDirty, watchedValues } = form;
  const { saveRequiredSection, saveOptionalSection, onSubmit } = actions;
  const { saving, sectionSaving, hasRequiredChanges, hasOptionalChanges } = state;
  const { profile } = useUserStore();

  // Performance optimization
  const performanceConfig = useProfilePerformance();
  const motionVariants = useProfileMotionVariants(performanceConfig);

  // Function to scroll to global save button
  const handleScrollToGlobalSave = () => {
    const element = document.getElementById('global-save-button-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate completion percentage - memoized
  const completionPercentage = useMemo(
    () => calculateIdentityCompletion(profile),
    [profile?.displayName, profile?.sex, profile?.height_cm, profile?.weight_kg]
  );

  return (
    <ConditionalMotionSlide
      performanceConfig={performanceConfig}
      direction="up"
      distance={20}
      className="space-y-6 profile-section"
    >
      {/* Enhanced Progress Header */}
      <ProgressBar
        percentage={completionPercentage}
        title="Identité Personnelle"
        subtitle="Vos informations de base et mesures corporelles"
        color="#60A5FA"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Required Information Card */}
        <GlassCard className="p-6 profile-glass-card" style={{
          background: performanceConfig.enableGradients ? `
            radial-gradient(circle at 30% 20%, rgba(96, 165, 250, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          ` : 'var(--glass-opacity)',
          borderColor: 'rgba(96, 165, 250, 0.2)',
          '--fallback-solid-color': 'rgba(96, 165, 250, 0.05)'
        } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${performanceConfig.enableShadows ? 'profile-shadow' : ''}`}
                style={{
                  background: performanceConfig.enableGradients ? `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #60A5FA 35%, transparent), color-mix(in srgb, #60A5FA 25%, transparent))
                  ` : 'rgba(96, 165, 250, 0.2)',
                  border: '2px solid color-mix(in srgb, #60A5FA 50%, transparent)',
                  boxShadow: performanceConfig.enableShadows ? '0 0 20px color-mix(in srgb, #60A5FA 30%, transparent)' : 'none'
                }}
              >
                <SpatialIcon Icon={ICONS.User} size={20} style={{ color: '#60A5FA' }} variant="pure" />
              </div>
              <div>
                <div className="text-xl">Informations Essentielles</div>
                <div className="text-white/60 text-sm font-normal mt-0.5">Vos données de base et mesures corporelles</div>
              </div>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-300 text-sm font-medium">Requis</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="displayName" className="block text-white/90 text-sm font-medium mb-3">
                Prénom *
              </label>
              <input
                {...register('displayName')}
                type="text"
                id="displayName"
                className="glass-input"
                placeholder="Votre prénom"
              />
              {errors.displayName && (
                <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="sex" className="block text-white/90 text-sm font-medium mb-3">
                Genre *
              </label>
              <select
                {...register('sex')}
                id="sex"
                className="glass-input"
              >
                <option value="">Sélectionnez votre genre</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
              </select>
              {errors.sex && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.sex.message}
                </div>
              )}
            </div>

            {/* Height */}
            <div>
              <label htmlFor="height_cm" className="block text-white/90 text-sm font-medium mb-3">
                Taille (cm) *
              </label>
              <input
                {...register('height_cm', { valueAsNumber: true })}
                type="number"
                id="height_cm"
                min="120"
                max="230"
                step="1"
                className="glass-input"
                placeholder="175"
              />
              {errors.height_cm && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.height_cm.message}
                </div>
              )}
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight_kg" className="block text-white/90 text-sm font-medium mb-3">
                Poids (kg) *
              </label>
              <input
                {...register('weight_kg', { valueAsNumber: true })}
                type="number"
                id="weight_kg"
                min="30"
                max="300"
                step="0.1"
                className="glass-input"
                placeholder="70"
              />
              {errors.weight_kg && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.weight_kg.message}
                </div>
              )}
            </div>
          </div>

          <SectionSaveButton
            isDirty={hasRequiredChanges}
            isSaving={sectionSaving === 'required'}
            onSave={saveRequiredSection}
            sectionName="Essentielles"
          />
        </GlassCard>

        {/* Personal Details Card */}
        <GlassCard className="p-6" style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(96, 165, 250, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(96, 165, 250, 0.2)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #60A5FA 35%, transparent), color-mix(in srgb, #60A5FA 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #60A5FA 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #60A5FA 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Calendar} size={20} style={{ color: '#60A5FA' }} variant="pure" />
              </div>
              <div>
                <div className="text-xl">Détails Personnels</div>
                <div className="text-white/60 text-sm font-normal mt-0.5">Informations complémentaires et contexte</div>
              </div>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Optionnel</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Birthdate */}
            <div>
              <label htmlFor="birthdate" className="block text-white/90 text-sm font-medium mb-3">
                Date de naissance
              </label>
              <input
                {...register('birthdate')}
                type="date"
                id="birthdate"
                className="glass-input"
              />
              {errors.birthdate && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.birthdate.message}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-white/90 text-sm font-medium mb-3">
                Numéro de téléphone
              </label>
              <input
                {...register('phone_number')}
                type="tel"
                id="phone_number"
                className="glass-input"
                placeholder="+33 6 12 34 56 78"
              />
              {errors.phone_number && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.phone_number.message}
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-white/90 text-sm font-medium mb-3">
                Pays
              </label>
              <select
                {...register('country')}
                id="country"
                className="glass-input"
              >
                <option value="">Sélectionnez votre pays</option>
                {/* Pays francophones */}
                <option value="Belgique">Belgique</option>
                <option value="Bénin">Bénin</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Burundi">Burundi</option>
                <option value="Cameroun">Cameroun</option>
                <option value="Canada">Canada</option>
                <option value="Centrafrique">Centrafrique</option>
                <option value="Comores">Comores</option>
                <option value="Congo">Congo</option>
                <option value="Congo (RDC)">Congo (RDC)</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Djibouti">Djibouti</option>
                <option value="France">France</option>
                <option value="Gabon">Gabon</option>
                <option value="Guinée">Guinée</option>
                <option value="Guinée équatoriale">Guinée équatoriale</option>
                <option value="Guyane">Guyane</option>
                <option value="Guadeloupe">Guadeloupe</option>
                <option value="Haïti">Haïti</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Mali">Mali</option>
                <option value="Maroc">Maroc</option>
                <option value="Martinique">Martinique</option>
                <option value="Maurice">Maurice</option>
                <option value="Mauritanie">Mauritanie</option>
                <option value="Mayotte">Mayotte</option>
                <option value="Monaco">Monaco</option>
                <option value="Niger">Niger</option>
                <option value="Nouvelle-Calédonie">Nouvelle-Calédonie</option>
                <option value="Polynésie française">Polynésie française</option>
                <option value="Réunion">Réunion</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Saint-Barthélemy">Saint-Barthélemy</option>
                <option value="Saint-Martin">Saint-Martin</option>
                <option value="Saint-Pierre-et-Miquelon">Saint-Pierre-et-Miquelon</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Seychelles">Seychelles</option>
                <option value="Suisse">Suisse</option>
                <option value="Tchad">Tchad</option>
                <option value="Togo">Togo</option>
                <option value="Tunisie">Tunisie</option>
                <option value="Vanuatu">Vanuatu</option>
                <option value="Wallis-et-Futuna">Wallis-et-Futuna</option>
                {/* Pays anglophones majeurs */}
                <option value="Afrique du Sud">Afrique du Sud</option>
                <option value="Australie">Australie</option>
                <option value="États-Unis">États-Unis</option>
                <option value="Inde">Inde</option>
                <option value="Irlande">Irlande</option>
                <option value="Jamaïque">Jamaïque</option>
                <option value="Kenya">Kenya</option>
                <option value="Nigéria">Nigéria</option>
                <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
                <option value="Royaume-Uni">Royaume-Uni</option>
                <option value="Singapour">Singapour</option>
              </select>
              {errors.country && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.country.message}
                </div>
              )}
            </div>

            {/* Job Category */}
            <div>
              <label htmlFor="job_category" className="block text-white/90 text-sm font-medium mb-3">
                Catégorie professionnelle
              </label>
              <select
                {...register('job_category')}
                id="job_category"
                className="glass-input"
              >
                <option value="">Sélectionnez votre activité</option>
                <option value="office">Bureau</option>
                <option value="field">Terrain</option>
                <option value="shift">Équipes</option>
                <option value="manual">Manuel</option>
                <option value="student">Étudiant</option>
                <option value="other">Autre</option>
              </select>
              {errors.job_category && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.job_category.message}
                </div>
              )}
            </div>
          </div>

          <SectionSaveButton
            isDirty={hasOptionalChanges}
            isSaving={false}
            onSave={handleScrollToGlobalSave}
            sectionName="Personnels"
          />
        </GlassCard>

        {/* Fitness Goals Card */}
        <GlassCard className="p-6" style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(96, 165, 250, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(96, 165, 250, 0.2)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #60A5FA 35%, transparent), color-mix(in srgb, #60A5FA 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #60A5FA 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #60A5FA 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Target} size={20} style={{ color: '#60A5FA' }} variant="pure" />
              </div>
              <div>
                <div className="text-xl">Objectifs Fitness</div>
                <div className="text-white/60 text-sm font-normal mt-0.5">Vos cibles et préférences d'entraînement</div>
              </div>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Recommandé</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Weight */}
            <div>
              <label htmlFor="target_weight_kg" className="block text-white/90 text-sm font-medium mb-3">
                Poids cible (kg)
              </label>
              <input
                {...register('target_weight_kg', { valueAsNumber: true })}
                type="number"
                id="target_weight_kg"
                min="30"
                max="300"
                step="0.1"
                className="glass-input"
                placeholder="65"
              />
              {errors.target_weight_kg && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.target_weight_kg.message}
                </div>
              )}
            </div>

            {/* Activity Level */}
            <div>
              <label htmlFor="activity_level" className="block text-white/90 text-sm font-medium mb-3">
                Niveau d'activité
              </label>
              <select
                {...register('activity_level')}
                id="activity_level"
                className="glass-input"
              >
                <option value="">Sélectionnez votre niveau</option>
                <option value="sedentary">Sédentaire</option>
                <option value="light">Léger</option>
                <option value="moderate">Modéré</option>
                <option value="active">Actif</option>
                <option value="athlete">Athlète</option>
              </select>
              {errors.activity_level && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.activity_level.message}
                </div>
              )}
            </div>

            {/* Objective */}
            <div className="md:col-span-2">
              <label htmlFor="objective" className="block text-white/90 text-sm font-medium mb-3">
                Objectif principal
              </label>
              <select
                {...register('objective')}
                id="objective"
                className="glass-input"
              >
                <option value="">Sélectionnez votre objectif</option>
                <option value="fat_loss">Perte de graisse</option>
                <option value="recomp">Recomposition corporelle</option>
                <option value="muscle_gain">Prise de muscle</option>
              </select>
              {errors.objective && (
                <div className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.objective.message}
                </div>
              )}
            </div>
          </div>

          <SectionSaveButton
            isDirty={hasOptionalChanges}
            isSaving={false}
            onSave={handleScrollToGlobalSave}
            sectionName="Fitness"
          />
        </GlassCard>

        {/* BMI Calculator Card */}
        {isValidForCalculations(watchedValues.height_cm, watchedValues.weight_kg, watchedValues.target_weight_kg) && (
          <BMICalculatorCard
            height={watchedValues.height_cm}
            weight={watchedValues.weight_kg}
            targetWeight={watchedValues.target_weight_kg}
          />
        )}

        {/* Global Save Action */}
        <div id="global-save-button-container" className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={saving || !isDirty || !isValid}
            className={`btn-glass--primary px-8 py-4 text-lg font-semibold ${
              !isDirty || !isValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {saving ? (
                <SpatialIcon Icon={ICONS.Loader2} size={20} className="animate-spin" />
              ) : (
                <SpatialIcon Icon={ICONS.Save} size={20} />
              )}
              <span>
                {saving ? 'Sauvegarde globale...' : 
                 !isValid ? `Erreurs (${Object.keys(errors).length})` : 
                 !isDirty ? 'Aucun changement' : 
                 'Sauvegarder Tout'}
              </span>
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
              Erreurs de validation ({Object.keys(errors).length})
            </h4>
            <div className="space-y-2">
              {Object.entries(errors).map(([field, error]) => (
                <div key={field} className="text-red-200 text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  <strong>{field}:</strong> {error.message}
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </form>
    </ConditionalMotionSlide>
  );
});

ProfileIdentityTab.displayName = 'ProfileIdentityTab';

export default ProfileIdentityTab;