import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { format, getDay, startOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface NutritionHeatmapProps {
  meals: any[];
  profile?: any;
}

interface HeatmapDay {
  date: string;
  dayName: string;
  calories: number;
  mealsCount: number;
  intensity: number; // 0-1 pour l'intensité de couleur
  status: 'excellent' | 'good' | 'low' | 'none';
}

/**
 * Nutrition Heatmap - Heatmap Nutritionnelle VisionOS 26
 * Visualisation de l'activité nutritionnelle par jour de la semaine
 */
const NutritionHeatmap: React.FC<NutritionHeatmapProps> = ({
  meals,
  profile,
}) => {
  const reduceMotion = useReducedMotion();
  const { isPerformanceMode } = usePerformanceMode();

  // Don't render if not enough data
  if (!meals || meals.length < 7) {
    return null;
  }

  // Préparer les données de la heatmap (2 semaines en mode performance, 4 sinon)
  const heatmapData = React.useMemo(() => {
    const today = new Date();
    const weeksAgo = isPerformanceMode ? 14 : 28;
    const fourWeeksAgo = subDays(today, weeksAgo);
    const days = eachDayOfInterval({ start: fourWeeksAgo, end: today });
    
    // Calculer l'objectif calorique
    const targetCalories = profile?.calculated_metrics?.daily_calorie_target || 
      (profile?.weight_kg ? profile.weight_kg * 25 : 2000);
    
    // Grouper les repas par jour
    const mealsByDay = new Map<string, { calories: number; count: number }>();
    
    meals.forEach(meal => {
      const date = format(new Date(meal.timestamp), 'yyyy-MM-dd');
      const current = mealsByDay.get(date) || { calories: 0, count: 0 };
      mealsByDay.set(date, {
        calories: current.calories + (meal.total_kcal || 0),
        count: current.count + 1
      });
    });
    
    // Créer les données de la heatmap
    const heatmapDays: HeatmapDay[] = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = mealsByDay.get(dateStr) || { calories: 0, count: 0 };
      
      // Calculer l'intensité basée sur les calories vs objectif
      const calorieRatio = targetCalories > 0 ? dayData.calories / targetCalories : 0;
      const intensity = Math.min(1, calorieRatio);
      
      // Déterminer le statut
      let status: HeatmapDay['status'] = 'none';
      if (dayData.calories > 0) {
        if (calorieRatio >= 0.8 && calorieRatio <= 1.2) status = 'excellent';
        else if (calorieRatio >= 0.6 && calorieRatio <= 1.4) status = 'good';
        else status = 'low';
      }
      
      return {
        date: dateStr,
        dayName: format(day, 'EEE', { locale: fr }),
        dayNumber: format(day, 'dd'),
        monthName: format(day, 'MMM', { locale: fr }),
        calories: dayData.calories,
        mealsCount: dayData.count,
        intensity,
        status
      };
    });
    
    // Organiser par semaines
    const weeks: HeatmapDay[][] = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      weeks.push(heatmapDays.slice(i, i + 7));
    }
    
    return { days: heatmapDays, weeks };
  }, [meals, profile, isPerformanceMode]);

  // Calculer les statistiques de la heatmap
  const stats = React.useMemo(() => {
    const activeDays = heatmapData.days.filter(day => day.calories > 0).length;
    const excellentDays = heatmapData.days.filter(day => day.status === 'excellent').length;
    const totalDays = heatmapData.days.length;
    
    return {
      activeDays,
      excellentDays,
      totalDays,
      activityRate: Math.round((activeDays / totalDays) * 100),
      excellenceRate: Math.round((excellentDays / totalDays) * 100)
    };
  }, [heatmapData]);

  const getStatusColor = (status: HeatmapDay['status'], intensity: number) => {
    const colors = {
      excellent: '#22C55E',
      good: '#F59E0B', 
      low: '#EF4444',
      none: 'rgba(255, 255, 255, 0.05)'
    };
    
    const baseColor = colors[status];
    if (status === 'none') return baseColor;
    
    // Moduler l'opacité basée sur l'intensité
    const opacity = Math.max(0.3, intensity);
    return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  return (
    <div className={isPerformanceMode ? '' : 'heatmap-enter'}>
      <GlassCard 
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(96, 165, 250, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(96, 165, 250, 0.25)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(96, 165, 250, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        }}
      >
        {/* Header néo-onglo intégré */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #06B6D4 30%, transparent), color-mix(in srgb, #06B6D4 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #06B6D4 40%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #06B6D4 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Calendar} size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Activité Nutritionnelle</h3>
              <p className="text-cyan-200 text-sm">
                Votre régularité de suivi sur {isPerformanceMode ? '2 semaines' : '4 semaines'}
              </p>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300 text-sm font-medium">
                {stats.excellentDays} jours excellents
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">
                {stats.activityRate}% d'activité
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-3 heatmap-grid-container overflow-x-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}>
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <div key={day} className="text-center text-white/60 text-xs font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Grille de la Heatmap */}
          <div className="space-y-2">
            {heatmapData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIndex) => (
                  <div
                    key={day.date}
                    className={isPerformanceMode ? 'aspect-square rounded-lg border cursor-pointer group relative overflow-hidden min-w-0' : 'aspect-square rounded-lg border cursor-pointer group relative overflow-hidden heatmap-cell-enter min-w-0'}
                    style={{
                      backgroundColor: getStatusColor(day.status, day.intensity),
                      borderColor: day.status !== 'none' ?
                        `color-mix(in srgb, ${getStatusColor(day.status, 1)} 40%, transparent)` :
                        'rgba(255, 255, 255, 0.1)',
                      backdropFilter: isPerformanceMode ? 'none' : 'blur(4px) saturate(120%)',
                      ...(!isPerformanceMode && { animationDelay: `${(weekIndex * 7 + dayIndex) * 0.02}s` })
                    }}
                    title={`${day.dayName} ${day.dayNumber} ${day.monthName} - ${day.calories} kcal (${day.mealsCount} repas)`}
                  >
                    {/* Contenu de la cellule */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                      <div className="text-white text-xs font-bold leading-none">
                        {day.dayNumber}
                      </div>
                      {day.mealsCount > 0 && (
                        <div className="text-white/80 text-xxs leading-none mt-0.5">
                          {day.mealsCount}
                        </div>
                      )}
                    </div>
                    
                    {/* Effet de brillance au hover */}
                    <div 
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <span className="text-white/60 text-sm">Moins</span>
            <div className="flex items-center gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded border border-white/20"
                  style={{
                    backgroundColor: getStatusColor('excellent', intensity)
                  }}
                />
              ))}
            </div>
            <span className="text-white/60 text-sm">Plus</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300">Excellent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-orange-300">Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-300">Faible</span>
            </div>
          </div>
        </div>

        {/* Insights de la Heatmap */}
        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 overflow-hidden">
          <h4 className="text-blue-300 font-medium text-sm mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Info} size={12} />
            Analyse des Patterns
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/80">
                <strong>{stats.excellenceRate}%</strong> de jours avec nutrition excellente
              </span>
            </div>
            <div>
              <span className="text-white/80">
                <strong>{stats.activityRate}%</strong> de jours avec suivi actif
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default NutritionHeatmap;