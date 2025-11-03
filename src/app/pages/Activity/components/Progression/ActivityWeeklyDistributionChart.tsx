import React from 'react';
import { supabase } from '../../../../../system/supabase/client';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import logger from '../../../../../lib/utils/logger';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import { ConditionalMotionActivity } from '../shared/ConditionalMotionActivity';

interface DayDistribution {
  day: string;
  dayNumber: number;
  activitiesCount: number;
  totalCalories: number;
  totalDuration: number;
  color: string;
}

interface ActivityWeeklyDistributionChartProps {
  userId: string;
  period: 'week' | 'month' | 'quarter';
}

/**
 * Activity Weekly Distribution Chart - Graphique de Distribution Hebdomadaire
 * Visualise la distribution des activités par jour de la semaine
 */
const ActivityWeeklyDistributionChart: React.FC<ActivityWeeklyDistributionChartProps> = ({
  userId,
  period
}) => {
  const perf = useActivityPerformance();
  const [data, setData] = React.useState<DayDistribution[]>([]);
  const [loading, setLoading] = React.useState(true);

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  const daysOfWeek = [
    { name: 'Lun', number: 1, color: '#3B82F6' },
    { name: 'Mar', number: 2, color: '#8B5CF6' },
    { name: 'Mer', number: 3, color: '#10B981' },
    { name: 'Jeu', number: 4, color: '#F59E0B' },
    { name: 'Ven', number: 5, color: '#EF4444' },
    { name: 'Sam', number: 6, color: '#EC4899' },
    { name: 'Dim', number: 0, color: '#06B6D4' },
  ];

  React.useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        const since = new Date();
        since.setDate(since.getDate() - periodDays);

        const { data: activities, error } = await supabase
          .from('activities')
          .select('timestamp, calories_est, duration_min')
          .eq('user_id', userId)
          .gte('timestamp', since.toISOString())
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (activities && activities.length > 0) {
          // Agréger par jour de la semaine
          const aggregatedByDay = new Map<number, DayDistribution>();

          daysOfWeek.forEach(day => {
            aggregatedByDay.set(day.number, {
              day: day.name,
              dayNumber: day.number,
              activitiesCount: 0,
              totalCalories: 0,
              totalDuration: 0,
              color: day.color
            });
          });

          activities.forEach((activity) => {
            const dayNumber = new Date(activity.timestamp).getDay();
            const entry = aggregatedByDay.get(dayNumber)!;

            entry.activitiesCount += 1;
            entry.totalCalories += activity.calories_est || 0;
            entry.totalDuration += activity.duration_min || 0;
          });

          const sortedData = Array.from(aggregatedByDay.values()).sort((a, b) => {
            // Commencer par lundi (1) et finir par dimanche (0)
            if (a.dayNumber === 0) return 1;
            if (b.dayNumber === 0) return -1;
            return a.dayNumber - b.dayNumber;
          });

          setData(sortedData);
        }

        logger.debug('WEEKLY_DISTRIBUTION_CHART', 'Data fetched successfully', {
          count: activities?.length
        });
      } catch (error) {
        logger.error('WEEKLY_DISTRIBUTION_CHART', 'Failed to fetch weekly data', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [userId, periodDays]);

  if (loading) {
    return (
      <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
    );
  }

  if (data.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, #3B82F6 20%, transparent), color-mix(in srgb, #3B82F6 10%, transparent))',
            border: '1px solid color-mix(in srgb, #3B82F6 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Calendar} size={32} style={{ color: '#3B82F6' }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Distribution Hebdomadaire</h3>
        <p className="text-white/70 text-base max-w-md mx-auto">
          Aucune activité disponible pour cette période.
        </p>
      </GlassCard>
    );
  }

  // Calculs
  const maxActivities = Math.max(...data.map(d => d.activitiesCount));
  const totalActivities = data.reduce((sum, d) => sum + d.activitiesCount, 0);
  const mostActiveDay = data.reduce((max, d) => d.activitiesCount > max.activitiesCount ? d : max);
  const leastActiveDay = data.reduce((min, d) => d.activitiesCount > 0 && d.activitiesCount < min.activitiesCount ? d : min, data[0]);

  return (
    <ConditionalMotionActivity
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: perf.transitionDuration }}
      fallback={<div>
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #3B82F6 25%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #3B82F6 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
          backdropFilter: 'blur(20px) saturate(160%)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #3B82F6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #3B82F6 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #3B82F6 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Calendar} size={24} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Distribution Hebdomadaire</h3>
              <p className="text-white/80 text-sm">
                Répartition de vos {totalActivities} activités par jour de semaine
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.BarChart3} size={16} className="text-blue-400" />
            Nombre d'Activités par Jour
          </h4>

          <div className="space-y-3">
            {data.map((dayData, index) => {
              const percentage = maxActivities > 0 ? (dayData.activitiesCount / maxActivities) * 100 : 0;
              const isMostActive = dayData.day === mostActiveDay.day;

              return (
                <ConditionalMotionActivity
                  key={dayData.day}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: perf.transitionDuration, delay: index * perf.staggerDelay }}
                  fallback={
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-right">
                          <span className="text-sm font-semibold text-white/80">
                            {dayData.day}
                          </span>
                        </div>

                        <div className="flex-1 relative h-10 rounded-xl overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.03)'
                        }}>
                          <div
                            className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3"
                            style={{
                              width: `${Math.max(percentage, 5)}%`,
                              background: `linear-gradient(to right, ${dayData.color}40, ${dayData.color})`,
                              border: `1px solid ${dayData.color}60`,
                              boxShadow: isMostActive ? `0 0 16px ${dayData.color}80` : 'none'
                            }}
                          >
                            <span className="text-white font-bold text-sm">
                              {dayData.activitiesCount}
                            </span>
                          </div>
                        </div>

                        <div className="w-24 text-left">
                          <div className="text-xs text-white/60">
                            {dayData.totalCalories.toFixed(0)} kcal
                          </div>
                        </div>
                      </div>

                      {isMostActive && (
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                              background: `${dayData.color}40`,
                              border: `2px solid ${dayData.color}`,
                              boxShadow: `0 0 12px ${dayData.color}80`
                            }}
                          >
                            <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: dayData.color }} />
                          </div>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-right">
                      <span className="text-sm font-semibold text-white/80">
                        {dayData.day}
                      </span>
                    </div>

                    <div className="flex-1 relative h-10 rounded-xl overflow-hidden" style={{
                      background: 'rgba(255, 255, 255, 0.03)'
                    }}>
                      <ConditionalMotionActivity
                        className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3"
                        style={{
                          background: `linear-gradient(to right, ${dayData.color}40, ${dayData.color})`,
                          border: `1px solid ${dayData.color}60`,
                          boxShadow: isMostActive ? `0 0 16px ${dayData.color}80` : 'none'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 5)}%` }}
                        transition={{ duration: perf.transitionDuration, delay: index * perf.staggerDelay }}
                        fallback={
                          <div
                            className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3"
                            style={{
                              width: `${Math.max(percentage, 5)}%`,
                              background: `linear-gradient(to right, ${dayData.color}40, ${dayData.color})`,
                              border: `1px solid ${dayData.color}60`,
                              boxShadow: isMostActive ? `0 0 16px ${dayData.color}80` : 'none'
                            }}
                          >
                            <span className="text-white font-bold text-sm">
                              {dayData.activitiesCount}
                            </span>
                          </div>
                        }
                      >
                        <span className="text-white font-bold text-sm">
                          {dayData.activitiesCount}
                        </span>
                      </ConditionalMotionActivity>
                    </div>

                    <div className="w-24 text-left">
                      <div className="text-xs text-white/60">
                        {dayData.totalCalories.toFixed(0)} kcal
                      </div>
                    </div>
                  </div>

                  {isMostActive && perf.enableComplexEffects && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                      <ConditionalMotionActivity
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: `${dayData.color}40`,
                          border: `2px solid ${dayData.color}`,
                          boxShadow: `0 0 12px ${dayData.color}80`
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: perf.staggerDelay * 8, type: 'spring' }}
                        fallback={
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                              background: `${dayData.color}40`,
                              border: `2px solid ${dayData.color}`,
                              boxShadow: `0 0 12px ${dayData.color}80`
                            }}
                          >
                            <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: dayData.color }} />
                          </div>
                        }
                      >
                        <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: dayData.color }} />
                      </ConditionalMotionActivity>
                    </div>
                  )}
                </ConditionalMotionActivity>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{
            background: `color-mix(in srgb, ${mostActiveDay.color} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${mostActiveDay.color} 20%, transparent)`
          }}>
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.TrendingUp} size={14} style={{ color: mostActiveDay.color }} />
              <span className="text-xs font-medium" style={{ color: mostActiveDay.color }}>
                Jour le + actif
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {mostActiveDay.day}
            </div>
            <div className="text-sm text-white/70">
              {mostActiveDay.activitiesCount} activité{mostActiveDay.activitiesCount > 1 ? 's' : ''}
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{
            background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
            border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
          }}>
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.BarChart3} size={14} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-medium text-purple-300">
                Moyenne/jour
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {(totalActivities / 7).toFixed(1)}
            </div>
            <div className="text-sm text-white/70">
              activités
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="p-4 rounded-xl" style={{
          background: 'color-mix(in srgb, #3B82F6 6%, transparent)',
          border: '1px solid color-mix(in srgb, #3B82F6 18%, transparent)',
          backdropFilter: 'blur(8px) saturate(120%)'
        }}>
          <div className="flex items-start gap-2">
            <SpatialIcon
              Icon={ICONS.Info}
              size={14}
              style={{ color: '#3B82F6' }}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-blue-300">
                Pattern hebdomadaire identifié
              </p>
              <p className="text-xs mt-1 text-blue-200">
                {mostActiveDay.activitiesCount > (totalActivities / 7) * 1.5
                  ? `Pic d'activité le ${mostActiveDay.day}. Excellente régularité !`
                  : leastActiveDay.activitiesCount === 0
                  ? `Jour de repos le ${leastActiveDay.day}. Pensez à répartir vos efforts.`
                  : 'Distribution équilibrée tout au long de la semaine.'}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
      </div>}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #3B82F6 25%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #3B82F6 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
          backdropFilter: 'blur(20px) saturate(160%)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #3B82F6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #3B82F6 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #3B82F6 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Calendar} size={24} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Distribution Hebdomadaire</h3>
              <p className="text-white/80 text-sm">
                Répartition de vos {totalActivities} activités par jour de semaine
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.BarChart3} size={16} className="text-blue-400" />
            Nombre d'Activités par Jour
          </h4>

          <div className="space-y-3">
            {data.map((dayData, index) => {
              const percentage = maxActivities > 0 ? (dayData.activitiesCount / maxActivities) * 100 : 0;
              const isMostActive = dayData.day === mostActiveDay.day;

              return (
                <ConditionalMotionActivity
                  key={dayData.day}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: perf.transitionDuration, delay: index * perf.staggerDelay }}
                  fallback={
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-right">
                          <span className="text-sm font-semibold text-white/80">
                            {dayData.day}
                          </span>
                        </div>

                        <div className="flex-1 relative h-10 rounded-xl overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.03)'
                        }}>
                          <div
                            className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3"
                            style={{
                              width: `${Math.max(percentage, 5)}%`,
                              background: `linear-gradient(to right, ${dayData.color}40, ${dayData.color})`,
                              border: `1px solid ${dayData.color}60`,
                              boxShadow: isMostActive ? `0 0 16px ${dayData.color}80` : 'none'
                            }}
                          >
                            <span className="text-white font-bold text-sm">
                              {dayData.activitiesCount}
                            </span>
                          </div>
                        </div>

                        <div className="w-24 text-left">
                          <div className="text-xs text-white/60">
                            {dayData.totalCalories.toFixed(0)} kcal
                          </div>
                        </div>
                      </div>

                      {isMostActive && (
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                              background: `${dayData.color}40`,
                              border: `2px solid ${dayData.color}`,
                              boxShadow: `0 0 12px ${dayData.color}80`
                            }}
                          >
                            <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: dayData.color }} />
                          </div>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-right">
                      <span className="text-sm font-semibold text-white/80">
                        {dayData.day}
                      </span>
                    </div>

                    <div className="flex-1 relative h-10 rounded-xl overflow-hidden" style={{
                      background: 'rgba(255, 255, 255, 0.03)'
                    }}>
                      <ConditionalMotionActivity
                        className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3"
                        style={{
                          background: `linear-gradient(to right, ${dayData.color}40, ${dayData.color})`,
                          border: `1px solid ${dayData.color}60`,
                          boxShadow: isMostActive ? `0 0 16px ${dayData.color}80` : 'none'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 5)}%` }}
                        transition={{ duration: perf.transitionDuration, delay: index * perf.staggerDelay }}
                        fallback={
                          <div
                            className="absolute inset-y-0 left-0 rounded-xl flex items-center justify-end pr-3"
                            style={{
                              width: `${Math.max(percentage, 5)}%`,
                              background: `linear-gradient(to right, ${dayData.color}40, ${dayData.color})`,
                              border: `1px solid ${dayData.color}60`,
                              boxShadow: isMostActive ? `0 0 16px ${dayData.color}80` : 'none'
                            }}
                          >
                            <span className="text-white font-bold text-sm">
                              {dayData.activitiesCount}
                            </span>
                          </div>
                        }
                      >
                        <span className="text-white font-bold text-sm">
                          {dayData.activitiesCount}
                        </span>
                      </ConditionalMotionActivity>
                    </div>

                    <div className="w-24 text-left">
                      <div className="text-xs text-white/60">
                        {dayData.totalCalories.toFixed(0)} kcal
                      </div>
                    </div>
                  </div>

                  {isMostActive && perf.enableComplexEffects && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                      <ConditionalMotionActivity
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: `${dayData.color}40`,
                          border: `2px solid ${dayData.color}`,
                          boxShadow: `0 0 12px ${dayData.color}80`
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: perf.staggerDelay * 8, type: 'spring' }}
                        fallback={
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                              background: `${dayData.color}40`,
                              border: `2px solid ${dayData.color}`,
                              boxShadow: `0 0 12px ${dayData.color}80`
                            }}
                          >
                            <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: dayData.color }} />
                          </div>
                        }
                      >
                        <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: dayData.color }} />
                      </ConditionalMotionActivity>
                    </div>
                  )}
                </ConditionalMotionActivity>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{
            background: `color-mix(in srgb, ${mostActiveDay.color} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${mostActiveDay.color} 20%, transparent)`
          }}>
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.TrendingUp} size={14} style={{ color: mostActiveDay.color }} />
              <span className="text-xs font-medium" style={{ color: mostActiveDay.color }}>
                Jour le + actif
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {mostActiveDay.day}
            </div>
            <div className="text-sm text-white/70">
              {mostActiveDay.activitiesCount} activité{mostActiveDay.activitiesCount > 1 ? 's' : ''}
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{
            background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
            border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
          }}>
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.BarChart3} size={14} style={{ color: '#8B5CF6' }} />
              <span className="text-xs font-medium text-purple-300">
                Moyenne/jour
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {(totalActivities / 7).toFixed(1)}
            </div>
            <div className="text-sm text-white/70">
              activités
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="p-4 rounded-xl" style={{
          background: 'color-mix(in srgb, #3B82F6 6%, transparent)',
          border: '1px solid color-mix(in srgb, #3B82F6 18%, transparent)',
          backdropFilter: 'blur(8px) saturate(120%)'
        }}>
          <div className="flex items-start gap-2">
            <SpatialIcon
              Icon={ICONS.Info}
              size={14}
              style={{ color: '#3B82F6' }}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-blue-300">
                Pattern hebdomadaire identifié
              </p>
              <p className="text-xs mt-1 text-blue-200">
                {mostActiveDay.activitiesCount > (totalActivities / 7) * 1.5
                  ? `Pic d'activité le ${mostActiveDay.day}. Excellente régularité !`
                  : leastActiveDay.activitiesCount === 0
                  ? `Jour de repos le ${leastActiveDay.day}. Pensez à répartir vos efforts.`
                  : 'Distribution équilibrée tout au long de la semaine.'}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </ConditionalMotionActivity>
  );
};

export default ActivityWeeklyDistributionChart;
