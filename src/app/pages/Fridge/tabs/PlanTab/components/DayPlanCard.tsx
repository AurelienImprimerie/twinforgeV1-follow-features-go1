/**
 * Day Plan Card Component
 * Card component for displaying a single day in the meal plan
 */

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import type { MealPlanDay } from '../types';

interface DayPlanCardProps {
  day: MealPlanDay;
  index: number;
  isEditable?: boolean;
  onViewRecipe?: (meal: any) => void;
  onGenerateDetailedRecipe: (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onGenerateAllDetailedRecipesForDay?: (dayIndex: number) => void;
}

// Skeleton component for loading state
const DayPlanSkeleton: React.FC<{ dayName: string; date: string; index: number }> = ({ dayName, date, index }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
  <MotionDiv
    {...(!isPerformanceMode && {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.4, delay: index * 0.05 }
    })}
  >
    <GlassCard
      className="p-5"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #6B7280 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #6B7280 20%, transparent)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, #6B7280 15%, transparent)',
              border: '2px solid color-mix(in srgb, #6B7280 25%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.CalendarDays} size={16} style={{ color: '#6B7280' }} />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">{dayName}</h4>
            <div className="text-white/60 text-xs">
              {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SpatialIcon Icon={ICONS.Loader2} size={16} className="animate-spin text-gray-400" />
          <span className="text-gray-400 text-xs">Génération...</span>
        </div>
      </div>

      {/* Skeleton meals */}
      <div className="space-y-3">
        {['Petit-déjeuner', 'Déjeuner', 'Dîner'].map((mealType, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-white/20 rounded animate-pulse" />
              <div className="h-4 bg-white/20 rounded w-24 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/15 rounded w-full animate-pulse" />
              <div className="h-3 bg-white/15 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  </MotionDiv>
  );
};

/**
 * Meal Skeleton Component
 */
const MealSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-white/10 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-white/5 rounded w-full"></div>
      <div className="h-3 bg-white/5 rounded w-5/6"></div>
      <div className="h-3 bg-white/5 rounded w-4/5"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-3 bg-white/5 rounded w-16"></div>
      <div className="h-3 bg-white/5 rounded w-12"></div>
    </div>
  </div>
);

// Enhanced meal slot component for detailed meals
const DetailedMealSlot: React.FC<{
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal?: any;
  onViewRecipe?: (meal: any) => void;
  dayIndex: number;
  onGenerateDetailedRecipe: (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}> = ({ mealType, meal, onViewRecipe, dayIndex, onGenerateDetailedRecipe }) => {
  const normalize = (t: 'breakfast' | 'lunch' | 'dinner' | 'snack') => (t === 'snack' ? 'snacks' : t);

  const getMealTypeColor = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): string => {
    const colors = {
      breakfast: '#F59E0B',
      lunch: '#10B981',
      dinner: '#8B5CF6',
      snacks: '#EC4899'
    } as const;
    return (colors as any)[normalize(type)] || '#6B7280';
  };

  const getMealTypeIcon = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): keyof typeof ICONS => {
    const icons = {
      breakfast: 'Coffee' as const,
      lunch: 'Utensils' as const,
      dinner: 'Utensils' as const,
      snacks: 'Coffee' as const
    } as const;
    return (icons as any)[normalize(type)] || 'Utensils';
  };

  const getMealTypeLabel = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): string => {
    const labels = {
      breakfast: 'Petit-déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snacks: 'Collations'
    } as const;
    return (labels as any)[normalize(type)] || type;
  };

  const mealColor = getMealTypeColor(mealType);

  // Show skeleton if meal is loading
  if (meal?.status === 'loading') {
    return <MealSkeleton />;
  }

  return (
    <div
      className="p-4 rounded-xl border transition-all duration-200"
      style={{
        background: meal
          ? `color-mix(in srgb, ${mealColor} 8%, transparent)`
          : 'rgba(255, 255, 255, 0.05)',
        borderColor: meal
          ? `color-mix(in srgb, ${mealColor} 25%, transparent)`
          : 'rgba(255, 255, 255, 0.15)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SpatialIcon Icon={ICONS[getMealTypeIcon(mealType)]} size={16} style={{ color: mealColor }} />
          <span className="text-white/80 text-sm font-medium">
            {getMealTypeLabel(mealType)}
          </span>
        </div>

      </div>

      {meal ? (
        <div
          className="space-y-3"
        >
          {/* Meal Image */}
          {meal.imageUrl ? (
            <div className="mb-3 relative h-32 overflow-hidden rounded-lg">
              <img 
                src={meal.imageUrl} 
                alt={meal.mealName || meal.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              {/* Dynamic Action Button - Positioned over image */}
              <div className="absolute top-2 right-2 z-10">
                {meal.status === 'loading' ? (
                  <button
                    disabled
                    className="btn-glass px-2 py-1 text-xs rounded-full flex items-center gap-1 cursor-not-allowed"
                    style={{
                      background: 'color-mix(in srgb, #6B7280 15%, transparent)',
                      border: '1px solid color-mix(in srgb, #6B7280 25%, transparent)',
                      color: '#9CA3AF'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Loader2} size={12} className="animate-spin" />
                    Génération...
                  </button>
                ) : meal.isDetailedRecipeGenerated ? (
                  <button
                    onClick={() => onViewRecipe && onViewRecipe(meal)}
                    className="btn-glass px-2 py-1 text-xs rounded-full flex items-center gap-1 
                             hover:scale-105 transition-all duration-200"
                    style={{
                      background: `color-mix(in srgb, ${mealColor} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${mealColor} 30%, transparent)`,
                      color: mealColor
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Eye} size={12} />
                    Voir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      console.log('🍽️ INDIVIDUAL MEAL BUTTON CLICKED: Générer la recette', {
                        dayIndex,
                        mealType,
                        mealTitle: meal.mealName || meal.title,
                        hasFunction: !!onGenerateDetailedRecipe
                      });
                      onGenerateDetailedRecipe(dayIndex, mealType);
                    }}
                    className="btn-glass px-2 py-1 text-xs rounded-full flex items-center gap-1 
                             hover:scale-105 transition-all duration-200"
                    style={{
                      background: `color-mix(in srgb, ${mealColor} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${mealColor} 30%, transparent)`,
                      color: mealColor
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Sparkles} size={12} />
                    Générer
                  </button>
                )}
              </div>
            </div>
          ) : meal.isDetailedRecipeGenerated && !meal.imageGenerationError ? (
            <div className="mb-3 relative h-32 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full" />
              
              {/* Dynamic Action Button - Positioned over placeholder */}
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => onViewRecipe && onViewRecipe(meal)}
                  className="btn-glass px-2 py-1 text-xs rounded-full flex items-center gap-1 
                           hover:scale-105 transition-all duration-200"
                  style={{
                    background: `color-mix(in srgb, ${mealColor} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${mealColor} 30%, transparent)`,
                    color: mealColor
                  }}
                >
                  <SpatialIcon Icon={ICONS.Eye} size={12} />
                  Voir
                </button>
              </div>
            </div>
          ) : null}
          
          {meal.imageGenerationError && (
            <div className="mb-3 relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
              <SpatialIcon Icon={ICONS.AlertTriangle} size={24} className="text-orange-400" />
              
              {/* Dynamic Action Button - Positioned over error placeholder */}
              <div className="absolute top-2 right-2 z-10">
                {meal.isDetailedRecipeGenerated ? (
                  <button
                    onClick={() => onViewRecipe && onViewRecipe(meal)}
                    className="btn-glass px-2 py-1 text-xs rounded-full flex items-center gap-1 
                             hover:scale-105 transition-all duration-200"
                    style={{
                      background: `color-mix(in srgb, ${mealColor} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${mealColor} 30%, transparent)`,
                      color: mealColor
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Eye} size={12} />
                    Voir
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      console.log('🍽️ INDIVIDUAL MEAL BUTTON CLICKED: Générer la recette', {
                        dayIndex,
                        mealType,
                        mealTitle: meal.mealName || meal.title,
                        hasFunction: !!onGenerateDetailedRecipe
                      });
                      onGenerateDetailedRecipe(dayIndex, mealType);
                    }}
                    className="btn-glass px-2 py-1 text-xs rounded-full flex items-center gap-1 
                             hover:scale-105 transition-all duration-200"
                    style={{
                      background: `color-mix(in srgb, ${mealColor} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${mealColor} 30%, transparent)`,
                      color: mealColor
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Sparkles} size={12} />
                    Générer
                  </button>
                )}
              </div>
            </div>
          )}

          <h5 className="text-white font-semibold text-sm mb-2 leading-tight">
            {meal.mealName || meal.title}
          </h5>

          {(meal.descriptionSummary || meal.description) && (
            <p className="text-white/60 text-xs mb-2 line-clamp-2">
              {meal.descriptionSummary || meal.description}
            </p>
          )}

          {/* Consolidated Time and Calories Display */}
          <div className="flex items-center gap-3 mb-2 text-xs text-white/70">
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{meal.estimatedPrepTime || meal.prep_time_min || 0}min (prép)</span>
            </div>
            <div className="flex items-center gap-1">
              <span>/</span>
              <span>{meal.estimatedCookTime || meal.cook_time_min || 0}min (cuis)</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔥</span>
              <span>{meal.estimatedCalories || meal.calories_est || 0} kcal</span>
            </div>
          </div>

          {meal.mealComponents && meal.mealComponents.length > 0 && (
            <div className="space-y-1 mb-2">
              {meal.mealComponents.slice(0, 2).map((component: string, idx: number) => (
                <div key={idx} className="text-xs text-white/70 flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-white/40" />
                  <span>{component}</span>
                </div>
              ))}
            </div>
          )}

          {meal.dietaryTags && meal.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {meal.dietaryTags.slice(0, 2).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: `color-mix(in srgb, ${mealColor} 15%, transparent)`,
                    color: mealColor
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <SpatialIcon Icon={ICONS.Plus} size={20} className="text-white/40 mx-auto mb-2" />
          <span className="text-white/50 text-sm">Aucun repas planifié</span>
        </div>
      )}
    </div>
  );
};

/**
 * Day Plan Card Component - Carte pour un jour du plan
 */
const DayPlanCard: React.FC<DayPlanCardProps> = ({
  day,
  index,
  isEditable = false,
  onViewRecipe,
  onGenerateDetailedRecipe,
  onGenerateAllDetailedRecipesForDay
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Show skeleton if day is loading
  if (day.status === 'loading') {
    return <DayPlanSkeleton dayName={day.dayName} date={day.date} index={index} />;
  }

  const isToday = day.date === new Date().toISOString().split('T')[0];
  const isBatchDay = day.isBatchCookingDay;

  const handleGenerateAllRecipes = () => {
    console.log('🔥 BUTTON CLICKED: Générer les Recettes du Jour', {
      dayIndex: index,
      dayName: day.dayName,
      date: day.date,
      hasFunction: !!onGenerateAllDetailedRecipesForDay
    });

    if (onGenerateAllDetailedRecipesForDay) {
      console.log('🚀 CALLING onGenerateAllDetailedRecipesForDay with dayIndex:', index);
      onGenerateAllDetailedRecipesForDay(index);
    } else {
      console.error('❌ onGenerateAllDetailedRecipesForDay function is not available');
    }
  };

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, delay: index * 0.05 }
      })}
      className="relative group"
    >
      <GlassCard
        className="p-5"
        style={{
          background: isToday
            ? `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #22C55E 12%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #10B981 8%, transparent) 0%, transparent 50%),
              var(--glass-opacity)
            `
            : isBatchDay
            ? `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `
            : `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
          borderColor: isToday
            ? 'color-mix(in srgb, #22C55E 30%, transparent)'
            : isBatchDay
            ? 'color-mix(in srgb, #8B5CF6 25%, transparent)'
            : 'color-mix(in srgb, #06B6D4 20%, transparent)',
          boxShadow: isToday
            ? `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, #22C55E 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `
            : `
              0 8px 32px rgba(0, 0, 0, 0.2),
              0 0 20px color-mix(in srgb, #06B6D4 12%, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.12)
            `
        }}
      >
        {/* Badges - Positioned absolutely in top-right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {isToday && (
            <div className="px-2 py-1 bg-gradient-to-r from-orange-500/80 to-red-500/80 
                          border border-orange-400/60 rounded-lg text-white text-xs font-medium
                          shadow-lg backdrop-blur-sm">
              Aujourd'hui
            </div>
          )}
          {isBatchDay && (
            <div className="px-2 py-1 bg-gradient-to-r from-green-500/80 to-emerald-500/80 
                          border border-green-400/60 rounded-lg text-white text-xs font-medium
                          shadow-lg backdrop-blur-sm">
              Planifié
            </div>
          )}
        </div>

        {/* En-tête du Jour */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: isToday
                  ? 'color-mix(in srgb, #22C55E 20%, transparent)'
                  : isBatchDay
                  ? 'color-mix(in srgb, #8B5CF6 15%, transparent)'
                  : 'color-mix(in srgb, #06B6D4 15%, transparent)',
                border: isToday
                  ? '2px solid color-mix(in srgb, #22C55E 40%, transparent)'
                  : isBatchDay
                  ? '2px solid color-mix(in srgb, #8B5CF6 30%, transparent)'
                  : '2px solid color-mix(in srgb, #06B6D4 25%, transparent)'
              }}
            >
              <SpatialIcon
                Icon={isToday ? ICONS.Calendar : isBatchDay ? ICONS.Clock : ICONS.CalendarDays}
                size={16}
                style={{
                  color: isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4'
                }}
              />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{day.dayName}</h4>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span>{new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                {isBatchDay && (
                  <>
                    <span>•</span>
                    <span className="text-purple-300 font-medium">Batch Cooking</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Résumé Quotidien - Mis en avant */}
        <div className="mb-6">
          <div
            className="p-4 rounded-xl border"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4'} 12%, transparent) 0%, transparent 60%),
                rgba(255, 255, 255, 0.08)
              `,
              borderColor: `color-mix(in srgb, ${isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4'} 30%, transparent)`,
              backdropFilter: 'blur(12px) saturate(140%)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Temps Total */}
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <SpatialIcon
                      Icon={ICONS.Clock}
                      size={18}
                      style={{ color: isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4' }}
                    />
                    <span className="text-white font-bold text-xl">
                      {day.prepTime + day.cookTime}
                    </span>
                    <span className="text-white/70 text-sm font-medium">min</span>
                  </div>
                  <div className="text-white/60 text-xs">Temps total</div>
                </div>

                {/* Séparateur */}
                <div className="w-px h-8 bg-white/20" />

                {/* Calories Totales */}
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <SpatialIcon
                      Icon={ICONS.Flame}
                      size={18}
                      style={{ color: '#F59E0B' }}
                    />
                    <span className="text-white font-bold text-xl">
                      {day.totalCalories}
                    </span>
                    <span className="text-white/70 text-sm font-medium">kcal</span>
                  </div>
                  <div className="text-white/60 text-xs">Calories totales</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Créneaux de Repas */}
        <div className="space-y-3">
          <DetailedMealSlot
            mealType="breakfast"
            meal={day.meals?.breakfast}
            onViewRecipe={onViewRecipe}
            dayIndex={index}
            onGenerateDetailedRecipe={onGenerateDetailedRecipe}
          />

          <DetailedMealSlot
            mealType="lunch"
            meal={day.meals?.lunch}
            onViewRecipe={onViewRecipe}
            dayIndex={index}
            onGenerateDetailedRecipe={onGenerateDetailedRecipe}
          />

          <DetailedMealSlot
            mealType="dinner"
            meal={day.meals?.dinner}
            onViewRecipe={onViewRecipe}
            dayIndex={index}
            onGenerateDetailedRecipe={onGenerateDetailedRecipe}
          />

          {day.meals?.snack && (
            <DetailedMealSlot
              mealType="snack"
              meal={day.meals.snack}
              onViewRecipe={onViewRecipe}
              dayIndex={index}
              onGenerateDetailedRecipe={onGenerateDetailedRecipe}
            />
          )}
        </div>

        {/* Bouton CTA - Générer les Recettes du Jour */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={handleGenerateAllRecipes}
            className="w-full btn-glass--primary py-3 px-4 text-sm font-semibold"
            style={{
              background: `
                linear-gradient(135deg, 
                  color-mix(in srgb, ${isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4'} 80%, transparent), 
                  color-mix(in srgb, ${isToday ? '#10B981' : isBatchDay ? '#A855F7' : '#0891B2'} 60%, transparent)
                )
              `,
              border: `2px solid color-mix(in srgb, ${isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4'} 60%, transparent)`,
              boxShadow: `
                0 8px 32px color-mix(in srgb, ${isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4'} 40%, transparent),
                0 0 40px color-mix(in srgb, ${isToday ? '#22C55E' : isBatchDay ? '#8B5CF6' : '#06B6D4'} 30%, transparent),
                inset 0 2px 0 rgba(255,255,255,0.4)
              `,
              backdropFilter: 'blur(16px) saturate(150%)'
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <SpatialIcon
                Icon={ICONS.Sparkles}
                size={18}
                className="text-white"
                variant="pure"
              />
              <span className="text-white">Générer les Recettes du Jour</span>
              <SpatialIcon
                Icon={ICONS.ArrowRight}
                size={16}
                className="text-white/80"
                variant="pure"
              />
            </div>
          </button>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default DayPlanCard;