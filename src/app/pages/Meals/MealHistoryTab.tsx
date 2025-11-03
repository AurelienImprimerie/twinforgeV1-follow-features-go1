import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mealsRepo } from '../../../system/data/repositories/mealsRepo';
import { useUserStore } from '../../../system/store/userStore';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useFeedback } from '../../../hooks/useFeedback';
import { useToast } from '../../../ui/components/ToastProvider';
import logger from '../../../lib/utils/logger';
import MealDetailModal from './components/shared/MealDetailModal';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

/**
 * Meal History Tab - Historique des Repas TwinForge
 * Affiche l'historique complet avec possibilité de voir les détails
 */
const MealHistoryTab: React.FC = () => {
  const { session } = useUserStore();
  const { click, glassClick, success, error: errorSound } = useFeedback();
  const { showToast } = useToast();
  const { isPerformanceMode } = usePerformanceMode();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  // Conditional component based on performance mode
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  // Log when component mounts to track tab activation
  React.useEffect(() => {
    logger.info('MEAL_HISTORY_TAB', 'Tab activated (component mounted)', {
      userId,
      timestamp: new Date().toISOString()
    });
  }, [userId]);

  const handleDeleteMeal = async (mealId: string) => {
    if (!userId) return;
    
    setDeletingMealId(mealId);
    
    try {
      await mealsRepo.deleteMeal(mealId, userId);

      // Forcer le refetch immédiat des queries actives pour mise à jour UI
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ['meals-today', userId],
          type: 'active'
        }),
        queryClient.refetchQueries({
          queryKey: ['meals-week', userId],
          type: 'active'
        }),
        queryClient.refetchQueries({
          queryKey: ['meals-history', userId],
          type: 'active'
        }),
        queryClient.invalidateQueries({ queryKey: ['meals-month', userId] }),
        queryClient.invalidateQueries({ queryKey: ['daily-ai-summary', userId] })
      ]);
      
      success();
      showToast({
        type: 'success',
        title: 'Repas supprimé',
        message: 'Le repas a été retiré de votre historique',
        duration: 3000,
      });

      logger.info('MEAL_DELETE', 'Meal deleted and all queries refetched', {
        mealId,
        userId,
        queriesRefetched: ['meals-today', 'meals-week', 'meals-history'],
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur de suppression',
        message: 'Impossible de supprimer le repas. Veuillez réessayer.',
        duration: 4000,
      });
      
      logger.error('MEAL_DELETE', 'Failed to delete meal from history', {
        mealId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setDeletingMealId(null);
    }
  };

  // Récupérer l'historique des repas (30 derniers jours)
  const { data: meals, isLoading } = useQuery({
    queryKey: ['meals-history', userId],
    queryFn: async () => {
      if (!userId) return [];

      logger.info('MEAL_HISTORY_TAB', 'Fetching meal history', {
        userId,
        timestamp: new Date().toISOString()
      });

      const thirtyDaysAgo = subDays(new Date(), 30);
      const today = new Date();
      const result = await mealsRepo.getUserMeals(userId, thirtyDaysAgo, today, 50);

      logger.info('MEAL_HISTORY_TAB', 'Meal history fetched', {
        userId,
        mealsCount: result.length,
        timestamp: new Date().toISOString()
      });

      return result;
    },
    enabled: !!userId,
    staleTime: 0, // CRITIQUE: Aucun cache pour garantir des données fraîches
    refetchOnWindowFocus: true, // Refetch quand la fenêtre reprend le focus
    refetchOnMount: true, // CRITIQUE: Toujours refetch au montage du composant
  });

  // Grouper les repas par jour
  const groupedMeals = React.useMemo(() => {
    if (!meals) return {};
    
    return meals.reduce((groups, meal) => {
      const date = format(new Date(meal.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meal);
      return groups;
    }, {} as Record<string, any[]>);
  }, [meals]);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    return format(date, 'EEEE dd MMMM', { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <GlassCard key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
              <div className="h-6 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!meals || meals.length === 0) {
    return (
      <div className="space-y-6">
        <GlassCard
          className="p-8 text-center"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(139, 92, 246, 0.25)'
          }}
        >
          <div className="flex items-center gap-4 mb-6 justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #8B5CF6 30%, transparent), color-mix(in srgb, #8B5CF6 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                boxShadow: '0 0 30px color-mix(in srgb, #8B5CF6 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.History} size={28} className="text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white">Forge Vierge</h3>
              <p className="text-purple-200 text-base">Votre historique nutritionnel vous attend</p>
            </div>
          </div>
          <p className="text-white/70 text-base max-w-lg mx-auto leading-relaxed">
            Aucun repas scanné pour le moment. Commencez à scanner vos repas
            pour construire votre historique nutritionnel.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <>
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: 'easeOut' }
        })}
        className="space-y-6 w-full"
      >
        {Object.entries(groupedMeals).map(([date, dayMeals]) => (
          <div
            key={date}
            className="meal-group-enter"
          >
            <GlassCard
              className="p-6"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
                  var(--glass-opacity)
                `,
                borderColor: 'rgba(139, 92, 246, 0.25)',
                backdropFilter: 'blur(16px) saturate(140%)',
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.2),
                  0 0 20px rgba(139, 92, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.12)
                `
              }}
            >
              {/* En-tête du jour */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                        linear-gradient(135deg, color-mix(in srgb, #8B5CF6 30%, transparent), color-mix(in srgb, #8B5CF6 20%, transparent))
                      `,
                      border: '2px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                      boxShadow: '0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Calendar} size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl">{formatDateLabel(date)}</h4>
                    <p className="text-purple-200 text-sm">Forge nutritionnelle de la journée</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">
                    {dayMeals.reduce((sum, meal) => sum + (meal.total_kcal || 0), 0)} kcal
                  </div>
                  <div className="text-white/60 text-sm">
                    {dayMeals.length} repas forgé{dayMeals.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Liste des repas du jour */}
              <div className="space-y-3">
                {dayMeals.map((meal, index) => (
                  <div
                    key={meal.id}
                    className="group relative"
                  >
                    <div
                      className="p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] meal-item-enter"
                      style={{
                        background: `color-mix(in srgb, #8B5CF6 6%, transparent)`,
                        border: '1px solid color-mix(in srgb, #8B5CF6 15%, transparent)',
                        backdropFilter: 'blur(8px) saturate(120%)',
                        animationDelay: `${index * 0.1}s`,
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
                        position: 'relative',
                        zIndex: 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `color-mix(in srgb, #8B5CF6 12%, transparent)`;
                        e.currentTarget.style.borderColor = `color-mix(in srgb, #8B5CF6 25%, transparent)`;
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `color-mix(in srgb, #8B5CF6 6%, transparent)`;
                        e.currentTarget.style.borderColor = `color-mix(in srgb, #8B5CF6 15%, transparent)`;
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.1)';
                      }}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        console.log('🔍 MEAL_HISTORY [MEAL_CARD_CLICK]', { mealId: meal.id, mealName: meal.meal_name });
                        click();
                        setSelectedMeal(meal);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              background: `
                                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%),
                                linear-gradient(135deg, color-mix(in srgb, #8B5CF6 25%, transparent), color-mix(in srgb, #8B5CF6 15%, transparent))
                              `,
                              border: '1px solid color-mix(in srgb, #8B5CF6 30%, transparent)',
                              boxShadow: '0 0 12px color-mix(in srgb, #8B5CF6 20%, transparent)'
                            }}
                          >
                            <SpatialIcon Icon={ICONS.Utensils} size={18} className="text-purple-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold text-lg">
                              {meal.meal_name || (meal.meal_type ? 
                                meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) : 
                                'Repas'
                              )}
                            </div>
                            <div className="text-white/70 text-sm">
                              {meal.meal_type ? 
                                meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) : 
                                'Repas'
                              } • {format(new Date(meal.timestamp), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-white font-bold text-xl">
                              {meal.total_kcal || 0} kcal
                            </div>
                            <div className="text-white/60 text-xs">Énergie</div>
                          </div>
                          
                          {/* Bouton Supprimer */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('🔍 MEAL_HISTORY [DELETE_BUTTON_CLICK]', { mealId: meal.id });
                              handleDeleteMeal(meal.id);
                            }}
                            disabled={deletingMealId === meal.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              position: 'relative',
                              zIndex: 2
                            }}
                            title="Supprimer ce repas"
                          >
                            {deletingMealId === meal.id ? (
                              <SpatialIcon Icon={ICONS.Loader2} size={14} className="text-red-400 animate-spin" />
                            ) : (
                              <SpatialIcon Icon={ICONS.Trash2} size={14} className="text-red-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ))}
      </MotionDiv>

      {/* Modal de Détail */}
      {isPerformanceMode ? (
        selectedMeal && (
          <MealDetailModal
            meal={selectedMeal}
            onClose={() => setSelectedMeal(null)}
            onDelete={handleDeleteMeal}
          />
        )
      ) : (
        <AnimatePresence>
          {selectedMeal && (
            <MealDetailModal
              meal={selectedMeal}
              onClose={() => setSelectedMeal(null)}
              onDelete={handleDeleteMeal}
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default MealHistoryTab;