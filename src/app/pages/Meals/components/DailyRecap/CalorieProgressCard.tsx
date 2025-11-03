import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface CalorieProgressCardProps {
  todayStats: {
    totalCalories: number;
    mealsCount: number;
    lastMealTime: Date | null;
    macros: { proteins: number; carbs: number; fats: number; fiber: number };
  };
  calorieTargetAnalysis: {
    target: number;
    bmr: number;
    tdee: number;
    adjustedForObjective: number;
    objectiveType: 'maintenance' | 'deficit' | 'surplus';
  };
  calorieStatus: {
    status: string;
    message: string;
    color: string;
    priority: 'low' | 'medium' | 'high';
    recommendation: string;
  };
  profile: any;
}

/**
 * Calorie Progress Card - Barre de progression calorique intelligente
 */
const CalorieProgressCard: React.FC<CalorieProgressCardProps> = ({
  todayStats,
  calorieTargetAnalysis,
  calorieStatus,
  profile,
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const progressPercentage = calorieTargetAnalysis.target > 0
    ? Math.min(100, (todayStats.totalCalories / calorieTargetAnalysis.target) * 100)
    : 0;

  return (
    <GlassCard
      className="p-6 glass-card--summary"
      style={{
        '--recommendation-color': calorieStatus.color,
        background: isPerformanceMode
          ? `linear-gradient(145deg, color-mix(in srgb, ${calorieStatus.color} 8%, #1e293b), color-mix(in srgb, ${calorieStatus.color} 4%, #0f172a))`
          : `radial-gradient(circle at 30% 20%, color-mix(in srgb, ${calorieStatus.color} 6%, transparent) 0%, transparent 60%), var(--glass-opacity)`,
        borderColor: `color-mix(in srgb, ${calorieStatus.color} 15%, transparent)`
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: isPerformanceMode
              ? `linear-gradient(135deg, color-mix(in srgb, #10B981 30%, transparent), color-mix(in srgb, #10B981 20%, transparent))`
              : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%), linear-gradient(135deg, color-mix(in srgb, #10B981 30%, transparent), color-mix(in srgb, #10B981 20%, transparent))`,
            border: `2px solid color-mix(in srgb, #10B981 40%, transparent)`,
            boxShadow: isPerformanceMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : `0 0 20px color-mix(in srgb, #10B981 30%, transparent)`
          }}
        >
          <SpatialIcon Icon={ICONS.Target} size={20} style={{ color: '#10B981' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-xl">Progression Énergétique</h3>
          <p className="text-white/60 text-sm">Avancement vers votre objectif calorique</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
          <div className="text-white/60 text-xs">Complété</div>
        </div>
      </div>
      
      {/* Status Message */}
      <div className="mb-4 p-3 rounded-xl" style={{
        background: `color-mix(in srgb, ${calorieStatus.color} 6%, transparent)`,
        border: `1px solid color-mix(in srgb, ${calorieStatus.color} 18%, transparent)`,
        ...(isPerformanceMode ? {} : { backdropFilter: 'blur(8px) saturate(120%)' })
      }}>
        <div className="flex items-start gap-2">
          <SpatialIcon 
            Icon={calorieStatus.priority === 'high' ? ICONS.AlertCircle : 
                  calorieStatus.priority === 'medium' ? ICONS.Info : ICONS.Check} 
            size={14} 
            style={{ color: calorieStatus.color }}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium" style={{ color: calorieStatus.color }}>
              {calorieStatus.message}
            </p>
            <p className="text-xs mt-1" style={{ color: `${calorieStatus.color}CC` }}>
              {calorieStatus.recommendation}
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-4 mb-4">
        <div
          className="h-4 rounded-full progress-fill-css"
          style={{
            background: `linear-gradient(90deg, ${calorieStatus.color}, color-mix(in srgb, ${calorieStatus.color} 80%, white))`,
            boxShadow: `0 0 8px color-mix(in srgb, ${calorieStatus.color} 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)`,
            '--progress-value': `${progressPercentage / 100}`,
            '--progress-color': calorieStatus.color,
            width: `${Math.min(100, progressPercentage)}%`,
            transition: 'width 1.2s ease-out'
          }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>{todayStats.totalCalories} kcal</span>
        <span>{calorieTargetAnalysis.target} kcal</span>
      </div>
      
      {/* Objective Context */}
      <div className="mt-3 text-xs text-white/50 text-center">
        {calorieTargetAnalysis.objectiveType === 'deficit' && 'Déficit pour perte de graisse'}
        {calorieTargetAnalysis.objectiveType === 'surplus' && 'Surplus pour prise de muscle'}
        {calorieTargetAnalysis.objectiveType === 'maintenance' && 'Maintenance calorique'}
        {profile?.objective && ` • Objectif: ${
          profile.objective === 'fat_loss' ? 'Perte de graisse' :
          profile.objective === 'muscle_gain' ? 'Prise de muscle' :
          profile.objective === 'recomp' ? 'Recomposition' : 'Non défini'
        }`}
      </div>
    </GlassCard>
  );
};

export default CalorieProgressCard;