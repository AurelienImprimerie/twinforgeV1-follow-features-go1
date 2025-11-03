import React, { useMemo } from 'react';
import { useProfilePerformance } from './hooks/useProfilePerformance';
import { ConditionalMotionSlide } from './components/shared/ConditionalMotionProfile';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useUserStore } from '../../../system/store/userStore';
import { useProfileFastingForm } from './hooks/useProfileFastingForm';
import { ProgressBar, SectionSaveButton } from './components/ProfileFastingComponents';
import { calculateFastingCompletion } from './utils/profileCompletion';
import { FASTING_PROTOCOLS } from '../../../lib/nutrition/fastingProtocols';

/**
 * Profile Fasting Tab - Jeûne Intermittent TwinForge
 * Gestion complète des protocoles de jeûne et objectifs nutritionnels avec design VisionOS 26
 */
const ProfileFastingTab: React.FC = () => {
  const { profile } = useUserStore();
  const { form, actions, state, helpers } = useProfileFastingForm();
  const { register, handleSubmit, errors, isDirty, watchedValues, setValue } = form;
  const { saveFastingSection, saveObjectivesSection, onSubmit } = actions;
  const { saving, sectionSaving, hasFastingChanges, hasObjectivesChanges } = state;
  const { proteinCalculation, selectedFastingProtocol, handleFastingProtocolChange, resetProteinTarget } = helpers;

  // Performance optimization
  const performanceConfig = useProfilePerformance();

  // Calculate completion percentage - memoized
  const completionPercentage = useMemo(
    () => calculateFastingCompletion(profile),
    [profile?.fastingWindow, profile?.proteinTarget_g, profile?.caloriesTarget]
  );

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
        title="Jeûne Intermittent"
        subtitle="Configurez vos protocoles de jeûne et objectifs nutritionnels"
        color="#F59E0B"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Protocoles de Jeûne Card */}
        <GlassCard className="p-6" style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(245, 158, 11, 0.2)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Timer} size={20} style={{ color: '#F59E0B' }} variant="pure" />
              </div>
              <div>
                <div className="text-xl">Protocoles de Jeûne</div>
                <div className="text-white/60 text-sm font-normal mt-0.5">Configurez votre fenêtre de jeûne intermittent</div>
              </div>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-orange-300 text-sm font-medium">Temporel</span>
            </div>
          </div>
          
          {/* Explication du Jeûne Intermittent */}
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-400/20">
            <div className="flex items-start gap-3">
              <SpatialIcon Icon={ICONS.Info} size={16} className="text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-orange-300 font-medium text-sm mb-2">Qu'est-ce que le jeûne intermittent ?</h4>
                <p className="text-orange-200 text-sm leading-relaxed">
                  Le jeûne intermittent alterne entre des périodes de jeûne et d'alimentation. 
                  Il peut améliorer la composition corporelle, la sensibilité à l'insuline et favoriser l'autophagie cellulaire.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocole de Jeûne */}
            <div>
              <label htmlFor="fastingWindow.protocol" className="block text-white/90 text-sm font-medium mb-3">
                Protocole de jeûne
              </label>
              <select
                value={selectedFastingProtocol}
                onChange={(e) => handleFastingProtocolChange(e.target.value)}
                className="glass-input"
                id="fastingWindow.protocol"
              >
                <option value="">Aucun jeûne</option>
                {FASTING_PROTOCOLS.map(protocol => (
                  <option key={protocol.id} value={protocol.id}>
                    {protocol.name} - {protocol.description}
                  </option>
                ))}
                <option value="custom">Personnalisé</option>
              </select>
              
              {/* Affichage conditionnel du champ heures pour mode personnalisé */}
              {selectedFastingProtocol === 'custom' && (
                <div className="mt-3">
                  <label htmlFor="fastingWindow.windowHours" className="block text-white/90 text-sm font-medium mb-2">
                    Fenêtre de jeûne personnalisée (heures)
                  </label>
                  <input
                    {...register('fastingWindow.windowHours', { valueAsNumber: true })}
                    type="number"
                    id="fastingWindow.windowHours"
                    min="8"
                    max="24"
                    step="1"
                    className="glass-input"
                    placeholder="16"
                  />
                </div>
              )}
              
              {/* Informations sur le protocole sélectionné */}
              {selectedFastingProtocol && selectedFastingProtocol !== 'custom' && (
                <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-400/20">
                  {(() => {
                    const protocol = FASTING_PROTOCOLS.find(p => p.id === selectedFastingProtocol);
                    if (!protocol) return null;
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            protocol.difficulty === 'beginner' ? 'bg-green-400' :
                            protocol.difficulty === 'intermediate' ? 'bg-orange-400' : 'bg-red-400'
                          }`} />
                          <span className="text-orange-300 text-sm font-medium">
                            {protocol.difficulty === 'beginner' ? 'Débutant' :
                             protocol.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                          </span>
                        </div>
                        <div className="text-orange-200 text-xs">
                          <strong>Bénéfices :</strong> {protocol.benefits.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Horaires de Jeûne - Affichés seulement si un protocole est sélectionné */}
            {(selectedFastingProtocol || watchedValues.fastingWindow?.windowHours) && (
              <>
                {/* Fasting Start Time */}
                <div>
                  <label htmlFor="fastingWindow.start" className="block text-white/90 text-sm font-medium mb-3">
                    Début du jeûne
                    <span className="text-orange-300 text-xs ml-2">(dernière prise alimentaire)</span>
                  </label>
                  <input
                    {...register('fastingWindow.start')}
                    type="time"
                    id="fastingWindow.start"
                    className="glass-input"
                  />
                </div>

                {/* Fasting End Time */}
                <div>
                  <label htmlFor="fastingWindow.end" className="block text-white/90 text-sm font-medium mb-3">
                    Fin du jeûne
                    <span className="text-orange-300 text-xs ml-2">(première prise alimentaire)</span>
                  </label>
                  <input
                    {...register('fastingWindow.end')}
                    type="time"
                    id="fastingWindow.end"
                    className="glass-input"
                  />
                </div>
              </>
            )}

            {/* Meals Per Day - Affiché seulement si jeûne configuré */}
            {(selectedFastingProtocol || watchedValues.fastingWindow?.windowHours) && (
              <div className="md:col-span-2">
                <label htmlFor="fastingWindow.mealsPerDay" className="block text-white/90 text-sm font-medium mb-3">
                  Nombre de repas par jour
                  <span className="text-orange-300 text-xs ml-2">(pendant la fenêtre d'alimentation)</span>
                </label>
                <select
                  {...register('fastingWindow.mealsPerDay', { valueAsNumber: true })}
                  id="fastingWindow.mealsPerDay"
                  className="glass-input"
                >
                  <option value="">Flexible</option>
                  <option value={1}>1 repas (OMAD)</option>
                  <option value={2}>2 repas</option>
                  <option value={3}>3 repas</option>
                  <option value={4}>4 repas</option>
                  <option value={5}>5 repas</option>
                  <option value={6}>6 repas</option>
                </select>
              </div>
            )}
          </div>
          
          {/* Résumé du Jeûne Configuré */}
          {(selectedFastingProtocol || watchedValues.fastingWindow?.windowHours) && 
           watchedValues.fastingWindow?.start && watchedValues.fastingWindow?.end && (
            <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-400/20">
              <div className="flex items-center gap-2 mb-2">
                <SpatialIcon Icon={ICONS.Clock} size={14} className="text-orange-400" />
                <span className="text-orange-300 font-medium text-sm">Résumé de votre jeûne</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Fenêtre :</span>
                  <div className="text-orange-200 font-medium">
                    {watchedValues.fastingWindow.windowHours || 0}h de jeûne
                  </div>
                </div>
                <div>
                  <span className="text-white/60">Alimentation :</span>
                  <div className="text-orange-200 font-medium">
                    {watchedValues.fastingWindow.end} - {watchedValues.fastingWindow.start}
                  </div>
                </div>
                <div>
                  <span className="text-white/60">Repas :</span>
                  <div className="text-orange-200 font-medium">
                    {watchedValues.fastingWindow.mealsPerDay || 'Flexible'} par jour
                  </div>
                </div>
              </div>
            </div>
          )}

          <SectionSaveButton
            isDirty={hasFastingChanges}
            isSaving={sectionSaving === 'fasting'}
            onSave={saveFastingSection}
            sectionName="Jeûne"
          />
        </GlassCard>

        {/* Objectifs Nutritionnels Card */}
        <GlassCard className="p-6" style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(245, 158, 11, 0.2)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Target} size={20} style={{ color: '#F59E0B' }} variant="pure" />
              </div>
              <div>
                <div className="text-xl">Objectifs Nutritionnels</div>
                <div className="text-white/60 text-sm font-normal mt-0.5">Cibles nutritionnelles et macronutriments</div>
              </div>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-orange-300 text-sm font-medium">Cibles</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protein Target */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="proteinTarget_g" className="text-white/90 text-sm font-medium">
                  Cible protéines (g/jour)
                </label>
                {proteinCalculation && (
                  <button
                    type="button"
                    onClick={resetProteinTarget}
                    className="text-orange-400 text-xs hover:text-orange-300 transition-colors flex items-center gap-1"
                    title={`Calculé: ${proteinCalculation.recommended}g (${proteinCalculation.formula})`}
                  >
                    <SpatialIcon Icon={ICONS.RotateCcw} size={12} />
                    Auto ({proteinCalculation.recommended}g)
                  </button>
                )}
              </div>
              <input
                {...register('proteinTarget_g', { valueAsNumber: true })}
                type="number"
                id="proteinTarget_g"
                min="0"
                max="300"
                step="1"
                className="glass-input"
                placeholder={proteinCalculation?.recommended?.toString() || "120"}
              />
              {proteinCalculation && (
                <p className="text-orange-300 text-xs mt-2 leading-relaxed">
                  🔥 {proteinCalculation.reasoning}
                </p>
              )}
              {errors.proteinTarget_g && (
                <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.proteinTarget_g.message}
                </p>
              )}
            </div>

            {/* Calories Target */}
            <div>
              <label htmlFor="caloriesTarget" className="block text-white/90 text-sm font-medium mb-3">
                Cible calories (kcal/jour)
              </label>
              <input
                {...register('caloriesTarget', { valueAsNumber: true })}
                type="number"
                id="caloriesTarget"
                min="800"
                max="5000"
                step="50"
                className="glass-input"
                placeholder="2000"
              />
              {errors.caloriesTarget && (
                <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={12} />
                  {errors.caloriesTarget.message}
                </p>
              )}
            </div>
          </div>

          <SectionSaveButton
            isDirty={hasObjectivesChanges}
            isSaving={sectionSaving === 'objectives'}
            onSave={saveObjectivesSection}
            sectionName="Objectifs"
          />
        </GlassCard>

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

export default ProfileFastingTab;