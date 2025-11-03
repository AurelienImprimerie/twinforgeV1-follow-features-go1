import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface RecentMealsCardProps {
  todayMeals: any[] | undefined;
  todayStats: {
    totalCalories: number;
    mealsCount: number;
    lastMealTime: Date | null;
    macros: { proteins: number; carbs: number; fats: number; fiber: number };
  };
  hasAnyMealHistory: boolean;
  onMealClick: (meal: any) => void;
  deletingMealId: string | null;
  onDeleteMeal: (mealId: string) => void;
}

/**
 * Recent Meals Card - Affichage des repas récents ou état vide
 */
const RecentMealsCard: React.FC<RecentMealsCardProps> = ({
  todayMeals,
  todayStats,
  hasAnyMealHistory,
  onMealClick,
  deletingMealId,
  onDeleteMeal,
}) => {
  const handleDeleteMeal = (mealId: string) => {
    onDeleteMeal(mealId);
  };

  if (todayStats.mealsCount > 0) {
    return (
      <div>
        <GlassCard
          className="p-6 glass-card--summary"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(16, 185, 129, 0.25)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.2),
              0 0 20px rgba(16, 185, 129, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.12)
            `
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #10B981 30%, transparent), color-mix(in srgb, #10B981 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #10B981 40%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #10B981 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.History} size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Forge du Jour</h3>
              <p className="text-green-200 text-sm">Vos repas analysés aujourd'hui</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {todayMeals?.map((meal, index) => (
              <div
                key={meal.id}
                className="group relative"
              >
                <div
                  className="flex items-center justify-between p-4 rounded-xl glass-nested-card hover:scale-[1.02] transition-transform duration-200 meal-item-enter cursor-pointer"
                  style={{
                    background: `color-mix(in srgb, #10B981 6%, transparent)`,
                    border: '1px solid color-mix(in srgb, #10B981 15%, transparent)',
                    backdropFilter: 'blur(8px) saturate(120%)',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => onMealClick(meal)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%),
                          linear-gradient(135deg, color-mix(in srgb, #10B981 25%, transparent), color-mix(in srgb, #10B981 15%, transparent))
                        `,
                        border: '1px solid color-mix(in srgb, #10B981 30%, transparent)',
                        boxShadow: '0 0 12px color-mix(in srgb, #10B981 20%, transparent)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Utensils} size={16} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold truncate">
                          {meal.meal_name || (meal.meal_type ?
                            meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) :
                            'Repas'
                          )}
                        </span>
                        {/* Badge code-barre si le repas n'a pas de photo */}
                        {!meal.photo_url && (
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                            style={{
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              color: '#A5B4FC',
                            }}
                            title="Repas créé via scan de code-barre"
                          >
                            <SpatialIcon Icon={ICONS.ScanBarcode} size={12} />
                            <span>Scan</span>
                          </span>
                        )}
                      </div>
                      <div className="text-white/60 text-sm">
                        {meal.meal_type ?
                          meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) :
                          'Repas'
                        } • {format(new Date(meal.timestamp), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {meal.total_kcal || 0} kcal
                      </div>
                      <div className="text-white/60 text-xs">Énergie</div>
                    </div>
                    
                    {/* Bouton Supprimer */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMeal(meal.id);
                      }}
                      disabled={deletingMealId === meal.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
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
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  // État Vide - Message adapté selon l'historique
  return (
    <GlassCard
      className="p-8 text-center glass-card--summary"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(16, 185, 129, 0.25)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.2),
          0 0 20px rgba(16, 185, 129, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.12)
        `
      }}
    >
      <div className="flex items-center gap-4 mb-6 justify-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #10B981 30%, transparent), color-mix(in srgb, #10B981 20%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #10B981 40%, transparent)',
            boxShadow: '0 0 30px color-mix(in srgb, #10B981 30%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.Utensils} size={28} className="text-green-400" />
        </div>
        <div className="text-left">
          <h3 className="text-2xl font-bold text-white">{hasAnyMealHistory ? 'Nouvelle Journée Nutritionnelle' : 'Première Forge Nutritionnelle'}</h3>
          <p className="text-green-200 text-base">{hasAnyMealHistory ? 'Commencez votre suivi du jour' : 'Démarrez votre analyse IA personnalisée'}</p>
        </div>
      </div>
      
      <p className="text-white/70 text-base mb-6 max-w-lg mx-auto leading-relaxed">
        {hasAnyMealHistory ? 
          'Scannez votre premier repas de la journée pour continuer votre suivi nutritionnel et obtenir des analyses comparatives.' :
          'Scannez votre premier repas pour débloquer des analyses personnalisées et optimiser votre nutrition avec TwinForge.'
        }
      </p>
    </GlassCard>
  );
};

export default RecentMealsCard;