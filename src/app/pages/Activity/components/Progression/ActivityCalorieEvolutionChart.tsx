import React from 'react';
import { supabase } from '../../../../../system/supabase/client';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import logger from '../../../../../lib/utils/logger';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import { ConditionalMotionActivity } from '../shared/ConditionalMotionActivity';

interface CalorieDataPoint {
  date: string;
  calories: number;
  activitiesCount: number;
}

interface ActivityCalorieEvolutionChartProps {
  userId: string;
  period: 'week' | 'month' | 'quarter';
}

/**
 * Activity Calorie Evolution Chart - Graphique d'Évolution des Calories
 * Visualise l'évolution des calories brûlées dans le temps
 */
const ActivityCalorieEvolutionChart: React.FC<ActivityCalorieEvolutionChartProps> = ({
  userId,
  period
}) => {
  const perf = useActivityPerformance();
  const [data, setData] = React.useState<CalorieDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  React.useEffect(() => {
    const fetchCalorieData = async () => {
      try {
        setLoading(true);
        const since = new Date();
        since.setDate(since.getDate() - periodDays);

        const { data: activities, error } = await supabase
          .from('activities')
          .select('timestamp, calories_est')
          .eq('user_id', userId)
          .gte('timestamp', since.toISOString())
          .not('calories_est', 'is', null)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (activities && activities.length > 0) {
          // Agréger par jour
          const aggregatedByDate = new Map<string, CalorieDataPoint>();

          activities.forEach((activity) => {
            const dateKey = new Date(activity.timestamp).toISOString().split('T')[0];

            if (!aggregatedByDate.has(dateKey)) {
              aggregatedByDate.set(dateKey, {
                date: dateKey,
                calories: 0,
                activitiesCount: 0,
              });
            }

            const entry = aggregatedByDate.get(dateKey)!;
            entry.calories += activity.calories_est || 0;
            entry.activitiesCount += 1;
          });

          const sortedData = Array.from(aggregatedByDate.values()).sort((a, b) =>
            a.date.localeCompare(b.date)
          );
          setData(sortedData);
        }

        logger.debug('CALORIE_EVOLUTION_CHART', 'Data fetched successfully', {
          count: activities?.length
        });
      } catch (error) {
        logger.error('CALORIE_EVOLUTION_CHART', 'Failed to fetch calorie data', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchCalorieData();
  }, [userId, periodDays]);

  if (loading) {
    return (
      <div className="h-80 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
    );
  }

  if (data.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, #F59E0B 20%, transparent), color-mix(in srgb, #F59E0B 10%, transparent))',
            border: '1px solid color-mix(in srgb, #F59E0B 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Flame} size={32} style={{ color: '#F59E0B' }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Évolution des Calories</h3>
        <p className="text-white/70 text-base max-w-md mx-auto">
          Aucune donnée de calories disponible pour cette période.
        </p>
      </GlassCard>
    );
  }

  // Calculs statistiques
  const totalCalories = data.reduce((sum, d) => sum + d.calories, 0);
  const avgCalories = totalCalories / data.length;
  const maxCalories = Math.max(...data.map(d => d.calories));
  const minCalories = Math.min(...data.map(d => d.calories));

  // Calcul de la tendance
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.calories, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.calories, 0) / secondHalf.length;
  const trend = secondHalfAvg > firstHalfAvg ? 'improving' : secondHalfAvg < firstHalfAvg ? 'declining' : 'stable';
  const trendPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  const trendColor = trend === 'improving' ? '#22C55E' : trend === 'declining' ? '#EF4444' : '#06B6D4';
  const trendIcon = trend === 'improving' ? ICONS.TrendingUp : trend === 'declining' ? ICONS.TrendingDown : ICONS.Minus;

  // Préparation pour le graphique
  const rangeCalories = maxCalories - minCalories;
  const paddingCalories = Math.max(rangeCalories * 0.2, 10); // Minimum padding de 10 calories
  const chartMin = Math.max(0, minCalories - paddingCalories);
  const chartMax = maxCalories + paddingCalories;
  const chartRange = Math.max(chartMax - chartMin, 1); // Éviter la division par zéro

  // Limiter les points de données en fonction de la performance
  const limitedData = data.slice(0, perf.maxDataPoints);

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
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #EF4444 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #F59E0B 25%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #F59E0B 15%, transparent),
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
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #EF4444 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Flame} size={24} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Évolution des Calories</h3>
              <p className="text-white/80 text-sm">
                {data.length} jours • Tendance {trend === 'improving' ? 'à la hausse' : trend === 'declining' ? 'à la baisse' : 'stable'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className="px-3 py-1.5 rounded-full mb-2"
              style={{
                background: `color-mix(in srgb, ${trendColor} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${trendColor} 25%, transparent)`
              }}
            >
              <div className="flex items-center gap-1.5">
                <SpatialIcon Icon={trendIcon} size={12} style={{ color: trendColor }} />
                <span className="text-sm font-medium" style={{ color: trendColor }}>
                  {trend === 'improving' ? '+' : trend === 'declining' ? '' : '±'}{trendPercent.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{avgCalories.toFixed(0)}</p>
            <p className="text-white/60 text-xs">kcal moy./jour</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-xl" style={{
            background: 'color-mix(in srgb, #22C55E 10%, transparent)',
            border: '1px solid color-mix(in srgb, #22C55E 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {maxCalories.toFixed(0)}
            </div>
            <div className="text-green-300 text-sm font-medium">Maximum</div>
          </div>

          <div className="p-3 rounded-xl" style={{
            background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
            border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {totalCalories.toFixed(0)}
            </div>
            <div className="text-orange-300 text-sm font-medium">Total</div>
          </div>

          <div className="p-3 rounded-xl" style={{
            background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
            border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {minCalories.toFixed(0)}
            </div>
            <div className="text-purple-300 text-sm font-medium">Minimum</div>
          </div>
        </div>

        {/* Simple Bar Chart Visualization */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.BarChart3} size={16} className="text-orange-400" />
            Calories Brûlées par Jour
          </h4>

          <div className="relative h-48 bg-white/5 rounded-xl p-4 overflow-hidden">
            <div className="relative h-full flex items-end justify-between gap-1">
              {limitedData.map((point, index) => {
                // Calcul de la hauteur avec un minimum visible
                const heightPercent = chartRange > 0 ? ((point.calories - chartMin) / chartRange) * 100 : 0;
                const height = Math.max(heightPercent, 5); // Minimum 5% de hauteur pour la visibilité
                const isMax = point.calories === maxCalories;

                return (
                  <ConditionalMotionActivity
                    key={point.date}
                    className="flex-1 group cursor-pointer relative"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: perf.transitionDuration, delay: index * perf.staggerDelay }}
                    fallback={
                      <div className="flex-1 group cursor-pointer relative">
                        <div
                          className={`w-full rounded-t-md transition-all duration-200 ${perf.mode !== 'low' ? 'group-hover:opacity-100' : ''}`}
                          style={{
                            height: `${height}%`,
                            minHeight: '8px',
                            background: isMax
                              ? 'linear-gradient(to top, #EF4444, #F59E0B)'
                              : 'linear-gradient(to top, #F59E0B, #FBBF24)',
                            opacity: isMax ? 1 : 0.8,
                            boxShadow: isMax ? '0 0 12px rgba(245, 158, 11, 0.6)' : 'none'
                          }}
                        />
                        {perf.mode !== 'low' && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="font-semibold">{format(parseISO(point.date), 'dd MMM', { locale: fr })}</div>
                            <div>{point.calories.toFixed(0)} kcal</div>
                            <div className="text-white/70">{point.activitiesCount} activité{point.activitiesCount > 1 ? 's' : ''}</div>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${perf.mode !== 'low' ? 'group-hover:opacity-100' : ''}`}
                      style={{
                        height: `${height}%`,
                        minHeight: '8px',
                        background: isMax
                          ? 'linear-gradient(to top, #EF4444, #F59E0B)'
                          : 'linear-gradient(to top, #F59E0B, #FBBF24)',
                        opacity: isMax ? 1 : 0.8,
                        boxShadow: isMax ? '0 0 12px rgba(245, 158, 11, 0.6)' : 'none'
                      }}
                    />
                    {perf.mode !== 'low' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{format(parseISO(point.date), 'dd MMM', { locale: fr })}</div>
                        <div>{point.calories.toFixed(0)} kcal</div>
                        <div className="text-white/70">{point.activitiesCount} activité{point.activitiesCount > 1 ? 's' : ''}</div>
                      </div>
                    )}
                  </ConditionalMotionActivity>
                );
              })}
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="mt-6 p-4 rounded-xl" style={{
          background: `color-mix(in srgb, ${trendColor} 6%, transparent)`,
          border: `1px solid color-mix(in srgb, ${trendColor} 18%, transparent)`,
          backdropFilter: 'blur(8px) saturate(120%)'
        }}>
          <div className="flex items-start gap-2">
            <SpatialIcon
              Icon={trend === 'improving' ? ICONS.TrendingUp : trend === 'declining' ? ICONS.TrendingDown : ICONS.Info}
              size={14}
              style={{ color: trendColor }}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium" style={{ color: trendColor }}>
                {trend === 'improving' ? 'Dépense énergétique en hausse' :
                 trend === 'declining' ? 'Dépense énergétique en baisse' :
                 'Dépense énergétique stable'}
              </p>
              <p className="text-xs mt-1" style={{ color: `${trendColor}CC` }}>
                {trend === 'improving' ? 'Excellente progression ! Continuez sur cette lancée.' :
                 trend === 'declining' ? 'Pensez à intensifier ou augmenter la fréquence de vos entraînements.' :
                 'Maintenez votre rythme actuel pour des résultats réguliers.'}
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
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #EF4444 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #F59E0B 25%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #F59E0B 15%, transparent),
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
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #EF4444 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Flame} size={24} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Évolution des Calories</h3>
              <p className="text-white/80 text-sm">
                {limitedData.length} jours • Tendance {trend === 'improving' ? 'à la hausse' : trend === 'declining' ? 'à la baisse' : 'stable'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className="px-3 py-1.5 rounded-full mb-2"
              style={{
                background: `color-mix(in srgb, ${trendColor} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${trendColor} 25%, transparent)`
              }}
            >
              <div className="flex items-center gap-1.5">
                <SpatialIcon Icon={trendIcon} size={12} style={{ color: trendColor }} />
                <span className="text-sm font-medium" style={{ color: trendColor }}>
                  {trend === 'improving' ? '+' : trend === 'declining' ? '' : '±'}{trendPercent.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{avgCalories.toFixed(0)}</p>
            <p className="text-white/60 text-xs">kcal moy./jour</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-xl" style={{
            background: 'color-mix(in srgb, #22C55E 10%, transparent)',
            border: '1px solid color-mix(in srgb, #22C55E 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {maxCalories.toFixed(0)}
            </div>
            <div className="text-green-300 text-sm font-medium">Maximum</div>
          </div>

          <div className="p-3 rounded-xl" style={{
            background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
            border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {totalCalories.toFixed(0)}
            </div>
            <div className="text-orange-300 text-sm font-medium">Total</div>
          </div>

          <div className="p-3 rounded-xl" style={{
            background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
            border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {minCalories.toFixed(0)}
            </div>
            <div className="text-purple-300 text-sm font-medium">Minimum</div>
          </div>
        </div>

        {/* Simple Bar Chart Visualization */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.BarChart3} size={16} className="text-orange-400" />
            Calories Brûlées par Jour
          </h4>

          <div className="relative h-48 bg-white/5 rounded-xl p-4 overflow-hidden">
            <div className="relative h-full flex items-end justify-between gap-1">
              {limitedData.map((point, index) => {
                const heightPercent = chartRange > 0 ? ((point.calories - chartMin) / chartRange) * 100 : 0;
                const height = Math.max(heightPercent, 5);
                const isMax = point.calories === maxCalories;

                return (
                  <ConditionalMotionActivity
                    key={point.date}
                    className="flex-1 group cursor-pointer relative"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: perf.transitionDuration, delay: index * perf.staggerDelay }}
                    fallback={
                      <div className="flex-1 group cursor-pointer relative">
                        <div
                          className={`w-full rounded-t-md transition-all duration-200 ${perf.mode !== 'low' ? 'group-hover:opacity-100' : ''}`}
                          style={{
                            height: `${height}%`,
                            minHeight: '8px',
                            background: isMax
                              ? 'linear-gradient(to top, #EF4444, #F59E0B)'
                              : 'linear-gradient(to top, #F59E0B, #FBBF24)',
                            opacity: isMax ? 1 : 0.8,
                            boxShadow: isMax ? '0 0 12px rgba(245, 158, 11, 0.6)' : 'none'
                          }}
                        />
                        {perf.mode !== 'low' && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="font-semibold">{format(parseISO(point.date), 'dd MMM', { locale: fr })}</div>
                            <div>{point.calories.toFixed(0)} kcal</div>
                            <div className="text-white/70">{point.activitiesCount} activité{point.activitiesCount > 1 ? 's' : ''}</div>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${perf.mode !== 'low' ? 'group-hover:opacity-100' : ''}`}
                      style={{
                        height: `${height}%`,
                        minHeight: '8px',
                        background: isMax
                          ? 'linear-gradient(to top, #EF4444, #F59E0B)'
                          : 'linear-gradient(to top, #F59E0B, #FBBF24)',
                        opacity: isMax ? 1 : 0.8,
                        boxShadow: isMax ? '0 0 12px rgba(245, 158, 11, 0.6)' : 'none'
                      }}
                    />
                    {perf.mode !== 'low' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{format(parseISO(point.date), 'dd MMM', { locale: fr })}</div>
                        <div>{point.calories.toFixed(0)} kcal</div>
                        <div className="text-white/70">{point.activitiesCount} activité{point.activitiesCount > 1 ? 's' : ''}</div>
                      </div>
                    )}
                  </ConditionalMotionActivity>
                );
              })}
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="mt-6 p-4 rounded-xl" style={{
          background: `color-mix(in srgb, ${trendColor} 6%, transparent)`,
          border: `1px solid color-mix(in srgb, ${trendColor} 18%, transparent)`,
          backdropFilter: 'blur(8px) saturate(120%)'
        }}>
          <div className="flex items-start gap-2">
            <SpatialIcon
              Icon={trend === 'improving' ? ICONS.TrendingUp : trend === 'declining' ? ICONS.TrendingDown : ICONS.Info}
              size={14}
              style={{ color: trendColor }}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium" style={{ color: trendColor }}>
                {trend === 'improving' ? 'Dépense énergétique en hausse' :
                 trend === 'declining' ? 'Dépense énergétique en baisse' :
                 'Dépense énergétique stable'}
              </p>
              <p className="text-xs mt-1" style={{ color: `${trendColor}CC` }}>
                {trend === 'improving' ? 'Excellente progression ! Continuez sur cette lancée.' :
                 trend === 'declining' ? 'Pensez à intensifier ou augmenter la fréquence de vos entraînements.' :
                 'Maintenez votre rythme actuel pour des résultats réguliers.'}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </ConditionalMotionActivity>
  );
};

export default ActivityCalorieEvolutionChart;
