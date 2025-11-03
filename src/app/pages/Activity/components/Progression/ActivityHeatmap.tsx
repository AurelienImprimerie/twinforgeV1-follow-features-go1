import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import { ConditionalMotionActivity } from '../shared/ConditionalMotionActivity';
import React from 'react';

interface Activity {
  id: string;
  timestamp: string;
  type: string;
  duration_min: number;
  calories_est: number;
  intensity?: string;
}

interface ActivityHeatmapProps {
  activities: Activity[];
  period: 'week' | 'month' | 'quarter';
  apiPeriod: 'last7Days' | 'last30Days' | 'last3Months';
}

/**
 * Obtenir le label de période pour l'affichage
 */
function getPeriodDisplayLabel(period: 'week' | 'month' | 'quarter'): string {
  switch (period) {
    case 'week': return '7 jours';
    case 'month': return '30 jours';
    case 'quarter': return '90 jours';
    default: return '30 jours';
  }
}

/**
 * Obtenir le nombre de jours à afficher selon la période
 */
function getDaysToShow(period: 'week' | 'month' | 'quarter'): number {
  switch (period) {
    case 'week': return 7;
    case 'month': return 30;
    case 'quarter': return 90;
    default: return 30;
  }
}

/**
 * Obtenir la couleur de statut pour la heatmap
 */
function getStatusColor(status: string, intensity: number): string {
  const colors = {
    excellent: '#22C55E',
    high: '#3B82F6',
    medium: '#F59E0B',
    low: '#EF4444',
    none: 'rgba(255, 255, 255, 0.05)'
  };

  const baseColor = colors[status as keyof typeof colors] || colors.none;
  if (status === 'none') return baseColor;

  const opacity = Math.max(0.3, intensity);
  return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

/**
 * Activity Heatmap - Carte de Chaleur des Activités
 * Visualise la régularité et l'intensité des activités sur une période
 */
const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activities,
  period,
  apiPeriod
}) => {
  const perf = useActivityPerformance();
  // Guard against undefined activities
  const safeActivities = activities || [];

  // Process activities data to create heatmap structure
  const processActivitiesData = () => {
    const today = new Date();
    let daysToShow = getDaysToShow(period);

    // Limiter les jours en fonction du mode performance
    if (perf.mode === 'low') {
      daysToShow = Math.min(daysToShow, 14); // Max 14 jours en low
    } else if (perf.mode === 'medium') {
      daysToShow = Math.min(daysToShow, 30); // Max 30 jours en medium
    }

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToShow + 1);

    // Create daily data structure
    const dailyData: Array<{
      date: string;
      dayName: string;
      dayNumber: number;
      monthName: string;
      status: 'none' | 'low' | 'medium' | 'high' | 'excellent';
      intensity: number;
      calories: number;
      activitiesCount: number;
      duration: number;
    }> = [];

    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayActivities = safeActivities.filter(activity => 
        activity.timestamp.startsWith(dateStr)
      );

      const totalCalories = dayActivities.reduce((sum, activity) => sum + (activity.calories_est || 0), 0);
      const totalDuration = dayActivities.reduce((sum, activity) => sum + (activity.duration_min || 0), 0);
      const activitiesCount = dayActivities.length;

      // Determine status based on activity level
      let status: 'none' | 'low' | 'medium' | 'high' | 'excellent' = 'none';
      let intensity = 0;

      if (activitiesCount > 0) {
        if (totalCalories >= 500 || totalDuration >= 60) {
          status = 'excellent';
          intensity = 1.0;
        } else if (totalCalories >= 300 || totalDuration >= 40) {
          status = 'high';
          intensity = 0.8;
        } else if (totalCalories >= 150 || totalDuration >= 20) {
          status = 'medium';
          intensity = 0.6;
        } else {
          status = 'low';
          intensity = 0.4;
        }
      }

      dailyData.push({
        date: dateStr,
        dayName: format(currentDate, 'EEEE', { locale: fr }),
        dayNumber: currentDate.getDate(),
        monthName: format(currentDate, 'MMMM', { locale: fr }),
        status,
        intensity,
        calories: totalCalories,
        activitiesCount,
        duration: totalDuration
      });
    }

    // Organize into weeks
    const weeks: Array<Array<typeof dailyData[0]>> = [];
    let currentWeek: Array<typeof dailyData[0]> = [];

    dailyData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0

      // Start new week on Monday or if current week is full
      if (currentWeek.length === 7 || (index === 0 && mondayIndex > 0)) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      currentWeek.push(day);

      // Add to weeks if it's the last day
      if (index === dailyData.length - 1) {
        weeks.push(currentWeek);
      }
    });

    // Calculate stats
    const excellentDays = dailyData.filter(day => day.status === 'excellent').length;
    const activeDays = dailyData.filter(day => day.activitiesCount > 0).length;
    const activityRate = Math.round((activeDays / dailyData.length) * 100);
    const excellenceRate = Math.round((excellentDays / dailyData.length) * 100);
    const avgCaloriesPerDay = Math.round(dailyData.reduce((sum, day) => sum + day.calories, 0) / dailyData.length);
    const avgDurationPerDay = Math.round(dailyData.reduce((sum, day) => sum + day.duration, 0) / dailyData.length);

    const stats = {
      excellentDays,
      activityRate,
      excellenceRate,
      avgCaloriesPerDay,
      avgDurationPerDay
    };

    return { weeks, stats };
  };

  const { weeks, stats } = processActivitiesData();

  return (
    <div className="heatmap-enter">
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-activity-secondary) 8%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--color-activity-accent) 6%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, var(--color-activity-secondary) 25%, transparent)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px color-mix(in srgb, var(--color-activity-secondary) 10%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
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
              <SpatialIcon Icon={ICONS.Calendar} size={20} style={{ color: '#10B981' }} />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Activité Énergétique</h3>
              <p className="text-white/70 text-sm">Votre régularité sur {getPeriodDisplayLabel(period)}</p>
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
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-activity-secondary)' }} />
              <span className="text-white/70 text-sm font-medium">
                {stats.activityRate}% d'activité
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-3 heatmap-grid-container overflow-x-auto">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-white/60 text-xs font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grille de la Heatmap */}
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIndex) => (
                  <ConditionalMotionActivity
                    key={day.date}
                    className="aspect-square rounded-lg border cursor-pointer group relative overflow-hidden min-w-0"
                    style={{
                      backgroundColor: getStatusColor(day.status, day.intensity),
                      borderColor: day.status !== 'none' ?
                        `color-mix(in srgb, ${getStatusColor(day.status, 1)} 40%, transparent)` :
                        'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(4px) saturate(120%)'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: perf.transitionDuration,
                      delay: (weekIndex * 7 + dayIndex) * perf.staggerDelay
                    }}
                    whileHover={perf.mode !== 'low' ? {
                      scale: 1.1,
                      zIndex: 10,
                      transition: { duration: 0.2 }
                    } : undefined}
                    title={`${day.dayName} ${day.dayNumber} ${day.monthName} - ${day.calories} kcal (${day.activitiesCount} activités, ${day.duration} min)`}
                    fallback={
                      <div
                        className="aspect-square rounded-lg border cursor-pointer group relative overflow-hidden min-w-0"
                        style={{
                          backgroundColor: getStatusColor(day.status, day.intensity),
                          borderColor: day.status !== 'none' ?
                            `color-mix(in srgb, ${getStatusColor(day.status, 1)} 40%, transparent)` :
                            'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(4px) saturate(120%)'
                        }}
                        title={`${day.dayName} ${day.dayNumber} ${day.monthName} - ${day.calories} kcal (${day.activitiesCount} activités, ${day.duration} min)`}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                          <div className="text-white text-xs font-bold leading-none">
                            {day.dayNumber}
                          </div>
                          {day.activitiesCount > 0 && (
                            <div className="text-white/80 text-xxs leading-none mt-0.5">
                              {day.activitiesCount}
                            </div>
                          )}
                        </div>
                        {perf.mode !== 'low' && (
                          <div
                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'
                            }}
                          />
                        )}
                      </div>
                    }
                  >
                    {/* Contenu de la cellule */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                      <div className="text-white text-xs font-bold leading-none">
                        {day.dayNumber}
                      </div>
                      {day.activitiesCount > 0 && (
                        <div className="text-white/80 text-xxs leading-none mt-0.5">
                          {day.activitiesCount}
                        </div>
                      )}
                    </div>

                    {/* Effet de brillance au hover */}
                    {perf.mode !== 'low' && (
                      <div
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'
                        }}
                      />
                    )}
                  </ConditionalMotionActivity>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <span className="text-white/60 text-sm">Moins actif</span>
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
            <span className="text-white/60 text-sm">Plus actif</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300">Excellent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-blue-300">Élevé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-orange-300">Modéré</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-300">Faible</span>
            </div>
          </div>
        </div>

        {/* Insights de la Heatmap */}
        <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20 overflow-hidden">
          <h4 className="text-cyan-300 font-medium text-sm mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Info} size={12} />
            Analyse des Patterns
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/80">
                <strong>{stats.excellenceRate}%</strong> de jours avec activité excellente
              </span>
            </div>
            <div>
              <span className="text-white/80">
                <strong>{stats.avgCaloriesPerDay}</strong> kcal brûlées en moyenne par jour
              </span>
            </div>
            <div>
              <span className="text-white/80">
                <strong>{stats.activityRate}%</strong> de jours avec activité enregistrée
              </span>
            </div>
            <div>
              <span className="text-white/80">
                <strong>{stats.avgDurationPerDay}</strong> min d'activité moyenne par jour
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ActivityHeatmap;