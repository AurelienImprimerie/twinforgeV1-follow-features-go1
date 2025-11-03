import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface DailyStatsGridProps {
  todayStats: {
    totalCalories: number;
    mealsCount: number;
    lastMealTime: Date | null;
    macros: { proteins: number; carbs: number; fats: number; fiber: number };
  };
  calorieStatus: {
    status: string;
    message: string;
    color: string;
    priority: 'low' | 'medium' | 'high';
    recommendation: string;
  };
}

/**
 * Daily Stats Grid - Grille des statistiques quotidiennes
 */
const DailyStatsGrid: React.FC<DailyStatsGridProps> = ({
  todayStats,
  calorieStatus,
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calories Totales */}
      <GlassCard
        className="p-6 text-center glass-card--summary"
        style={{
          '--recommendation-color': calorieStatus.color,
          background: isPerformanceMode
            ? `linear-gradient(145deg, color-mix(in srgb, ${calorieStatus.color} 8%, #1e293b), color-mix(in srgb, ${calorieStatus.color} 4%, #0f172a))`
            : `radial-gradient(circle at 30% 20%, color-mix(in srgb, ${calorieStatus.color} 6%, transparent) 0%, transparent 60%), var(--glass-opacity)`,
          borderColor: `color-mix(in srgb, ${calorieStatus.color} 15%, transparent)`
        }}
      >
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${!isPerformanceMode ? 'breathing-icon' : ''}`}
            style={{
              background: isPerformanceMode
                ? `linear-gradient(135deg, color-mix(in srgb, ${calorieStatus.color} 35%, transparent), color-mix(in srgb, ${calorieStatus.color} 25%, transparent))`
                : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%), linear-gradient(135deg, color-mix(in srgb, ${calorieStatus.color} 35%, transparent), color-mix(in srgb, ${calorieStatus.color} 25%, transparent))`,
              border: `2px solid color-mix(in srgb, ${calorieStatus.color} 50%, transparent)`,
              boxShadow: isPerformanceMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : `0 0 30px color-mix(in srgb, ${calorieStatus.color} 40%, transparent)`
            }}
          >
            <SpatialIcon Icon={ICONS.Zap} size={28} style={{ color: calorieStatus.color }} />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Énergie Quotidienne</h3>
          <p className="text-white/60 text-sm">Calories consommées aujourd'hui</p>
        </div>
        <div className="text-3xl font-bold text-white mb-2">
          {todayStats.totalCalories}
        </div>
        <div className="mt-2 text-xs text-white/60">
          Statut: {calorieStatus.status === 'optimal' ? 'Optimal' :
                   calorieStatus.status === 'slight_deficit' ? 'Léger déficit' :
                   calorieStatus.status === 'deficit' ? 'Déficit' :
                   calorieStatus.status === 'slight_surplus' ? 'Léger surplus' :
                   calorieStatus.status === 'surplus' ? 'Surplus' : 'Excessif'}
        </div>
      </GlassCard>

      {/* Nombre de Repas */}
      <GlassCard
        className="p-6 text-center glass-card--summary"
        style={{
          '--recommendation-color': '#3B82F6',
          background: isPerformanceMode
            ? 'linear-gradient(145deg, color-mix(in srgb, #3B82F6 8%, #1e293b), color-mix(in srgb, #3B82F6 4%, #0f172a))'
            : `radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 6%, transparent) 0%, transparent 60%), var(--glass-opacity)`,
          borderColor: `color-mix(in srgb, #3B82F6 15%, transparent)`
        }}
      >
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${!isPerformanceMode ? 'breathing-icon' : ''}`}
            style={{
              background: isPerformanceMode
                ? 'linear-gradient(135deg, color-mix(in srgb, #3B82F6 35%, transparent), color-mix(in srgb, #3B82F6 25%, transparent))'
                : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%), linear-gradient(135deg, color-mix(in srgb, #3B82F6 35%, transparent), color-mix(in srgb, #3B82F6 25%, transparent))`,
              border: '2px solid color-mix(in srgb, #3B82F6 50%, transparent)',
              boxShadow: isPerformanceMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 0 30px color-mix(in srgb, #3B82F6 40%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Utensils} size={28} className="text-blue-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Repas Forgés</h3>
          <p className="text-white/60 text-sm">Analyses IA effectuées</p>
        </div>
        <div className="text-3xl font-bold text-white mb-2">
          {todayStats.mealsCount}
        </div>
        <div className="mt-2 text-xs text-white/60">
          Aujourd'hui
        </div>
      </GlassCard>

      {/* Dernier Repas */}
      <GlassCard
        className="p-6 text-center glass-card--summary"
        style={{
          '--recommendation-color': '#8B5CF6',
          background: isPerformanceMode
            ? 'linear-gradient(145deg, color-mix(in srgb, #8B5CF6 8%, #1e293b), color-mix(in srgb, #8B5CF6 4%, #0f172a))'
            : `radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 6%, transparent) 0%, transparent 60%), var(--glass-opacity)`,
          borderColor: `color-mix(in srgb, #8B5CF6 15%, transparent)`
        }}
      >
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${!isPerformanceMode ? 'breathing-icon' : ''}`}
            style={{
              background: isPerformanceMode
                ? 'linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))'
                : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%), linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))`,
              border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
              boxShadow: isPerformanceMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 0 30px color-mix(in srgb, #8B5CF6 40%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Clock} size={28} className="text-purple-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Dernière Forge</h3>
          <p className="text-white/60 text-sm">Timing de votre dernier repas</p>
        </div>
        <div className="text-3xl font-bold text-white mb-2">
          {todayStats.lastMealTime ? format(todayStats.lastMealTime, 'HH:mm') : '--:--'}
        </div>
        <div className="mt-2 text-xs text-white/60">
          {todayStats.lastMealTime ? format(todayStats.lastMealTime, 'dd/MM', { locale: fr }) : 'Aucun'}
        </div>
      </GlassCard>
      
    </div>
  );
};

export default DailyStatsGrid;