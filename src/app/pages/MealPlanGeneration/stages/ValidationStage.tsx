import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import { useMealPlanGenerationPipeline } from '../../../../system/store/mealPlanGenerationPipeline';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import type { MealPlan } from '../../../../system/store/mealPlanGenerationPipeline/types';

interface ValidationStageProps {
  mealPlan: MealPlan | null;
  onSaveBasicPlan: () => void;
  onGenerateAllRecipes: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  onExit: () => void;
}

const ValidationStage: React.FC<ValidationStageProps> = ({
  mealPlan,
  onSaveBasicPlan,
  onGenerateAllRecipes,
  onDiscard,
  isSaving,
  onExit
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const { currentStep } = useMealPlanGenerationPipeline();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  if (!mealPlan) {
    return null;
  }

  const weekCount = mealPlan.days.length / 7;
  const totalMeals = mealPlan.days.reduce((sum, day) => sum + (day.meals?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Validation Header */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 }
        })}
      >
        <GlassCard
          className="p-6"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 12%, transparent) 0%, transparent 60%),
              linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05)),
              rgba(11, 14, 23, 0.85)
            `,
            borderColor: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.3),
              0 0 30px color-mix(in srgb, #8B5CF6 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #A855F7 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
                  boxShadow: '0 0 30px color-mix(in srgb, #8B5CF6 40%, transparent)'
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Check}
                  size={32}
                  style={{
                    color: '#8B5CF6',
                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))'
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Votre Plan Alimentaire est Prêt !
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-white/70">
                    {weekCount} semaine{weekCount > 1 ? 's' : ''} · {totalMeals} repas planifiés
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onDiscard}
                disabled={isSaving}
                className={`px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200 ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Régénérer
              </button>
            </div>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Week Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: weekCount }).map((_, weekIndex) => {
          const weekDays = mealPlan.days.slice(weekIndex * 7, (weekIndex + 1) * 7);
          const weekMeals = weekDays.reduce((sum, day) => sum + (day.meals?.length || 0), 0);

          return (
            <MotionDiv
              key={`week-${weekIndex}`}
              {...(!isPerformanceMode && {
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.3, delay: weekIndex * 0.1 }
              })}
            >
              <GlassCard
                className="p-5"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 60%),
                    rgba(11, 14, 23, 0.8)
                  `,
                  borderColor: 'color-mix(in srgb, #8B5CF6 25%, transparent)',
                  boxShadow: `
                    0 8px 24px rgba(0, 0, 0, 0.2),
                    0 0 20px color-mix(in srgb, #8B5CF6 15%, transparent)
                  `
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                      boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    <SpatialIcon
                      Icon={ICONS.Calendar}
                      size={20}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      Semaine {weekIndex + 1}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {weekDays.length} jours · {weekMeals} repas
                    </p>
                  </div>
                </div>

                {/* Days List */}
                <div className="space-y-2">
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={`day-${dayIndex}`}
                      className="flex items-center justify-between p-2 rounded-lg"
                      style={{
                        background: 'rgba(139, 92, 246, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.15)'
                      }}
                    >
                      <span className="text-white/80 text-sm font-medium">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                      <span className="text-white/60 text-xs">
                        {day.meals?.length || 0} repas
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </MotionDiv>
          );
        })}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Save Basic Plan */}
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, delay: 0.3 }
          })}
        >
          <GlassCard
            className="p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={onSaveBasicPlan}
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 15%, transparent) 0%, transparent 60%),
                rgba(11, 14, 23, 0.85)
              `,
              borderColor: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
              boxShadow: `
                0 8px 24px rgba(0, 0, 0, 0.2),
                0 0 25px color-mix(in srgb, #8B5CF6 20%, transparent)
              `
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Save}
                  size={24}
                  className="text-white"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-2">
                  Sauvegarder le Plan de Base
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  Enregistrez votre plan avec les repas structurés. Vous pourrez générer les recettes détaillées plus tard.
                </p>
                <div className="flex items-center gap-2 text-violet-400 text-sm font-medium">
                  <span>Sauvegarder maintenant</span>
                  <SpatialIcon Icon={ICONS.ChevronRight} size={16} />
                </div>
              </div>
            </div>
          </GlassCard>
        </MotionDiv>

        {/* Generate All Recipes */}
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4, delay: 0.4 }
          })}
        >
          <GlassCard
            className="p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={onGenerateAllRecipes}
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #A855F7 15%, transparent) 0%, transparent 60%),
                rgba(11, 14, 23, 0.85)
              `,
              borderColor: 'color-mix(in srgb, #A855F7 30%, transparent)',
              boxShadow: `
                0 8px 24px rgba(0, 0, 0, 0.2),
                0 0 25px color-mix(in srgb, #A855F7 20%, transparent)
              `
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Sparkles}
                  size={24}
                  className="text-white"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-2">
                  Générer Toutes les Recettes
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  Continuez pour obtenir les recettes détaillées complètes pour tous vos repas planifiés.
                </p>
                <div className="flex items-center gap-2 text-violet-400 text-sm font-medium">
                  <span>Continuer la génération</span>
                  <SpatialIcon Icon={ICONS.ChevronRight} size={16} />
                </div>
              </div>
            </div>
          </GlassCard>
        </MotionDiv>
      </div>

      {/* Info Card */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: 0.5 }
        })}
      >
        <GlassCard
          className="p-4"
          style={{
            background: 'rgba(139, 92, 246, 0.05)',
            borderColor: 'rgba(139, 92, 246, 0.2)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center gap-3">
            <SpatialIcon
              Icon={ICONS.Lightbulb}
              size={20}
              style={{
                color: '#8B5CF6',
                filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))'
              }}
            />
            <p className="text-white/80 text-sm">
              <strong className="text-white">Astuce :</strong> Vous pouvez sauvegarder le plan maintenant
              et générer les recettes détaillées plus tard depuis votre bibliothèque.
            </p>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Exit Button */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3, delay: 0.6 }
        })}
        className="flex justify-end"
      >
        <button
          onClick={onExit}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200"
        >
          Quitter
        </button>
      </MotionDiv>
    </div>
  );
};

export default ValidationStage;
