import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import { ConditionalMotionActivity } from '../shared/ConditionalMotionActivity';
import React from 'react';

interface ActivitySummary {
  total_activities: number;
  total_calories: number;
  total_duration: number;
  avg_daily_calories: number;
  most_frequent_type: string;
  avg_intensity: string;
  consistency_score: number;
}

interface GlobalStatsCardProps {
  globalStats?: ActivitySummary;
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
 * Global Stats Card - Statistiques Globales de la Forge Énergétique
 * Affiche les métriques clés de la période analysée
 */
const GlobalStatsCard: React.FC<GlobalStatsCardProps> = ({ globalStats, period, apiPeriod }) => {
  const perf = useActivityPerformance();
  if (!globalStats) {
    return (
      <GlassCard className="p-6" style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #6B7280 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #6B7280 20%, transparent)'
      }}>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, #F59E0B 20%, transparent), color-mix(in srgb, #F59E0B 10%, transparent))',
            border: '1px solid color-mix(in srgb, #F59E0B 30%, transparent)'
          }}>
            <SpatialIcon Icon={ICONS.BarChart3} size={32} style={{ color: '#F59E0B' }} />
          </div>
          <p className="text-white/70 text-sm">
            Aucune donnée disponible pour cette période
          </p>
        </div>
      </GlassCard>
    );
  }

  const periodLabel = getPeriodDisplayLabel(period);
  
  return (
    <ConditionalMotionActivity
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: perf.transitionDuration }}
      fallback={<div>
      <GlassCard className="p-6" style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #F59E0B 25%, transparent)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px color-mix(in srgb, #F59E0B 15%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `
      }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                boxShadow: '0 0 30px color-mix(in srgb, #F59E0B 40%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.BarChart3} size={24} style={{ color: '#F59E0B' }} variant="pure" />
            </div>
            <div>
              <div className="text-xl">Forge Énergétique - {periodLabel}</div>
              <div className="text-white/60 text-sm font-normal mt-0.5">Vos métriques de performance</div>
            </div>
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-orange-300 text-sm font-medium">Période Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        </div>

        {/* Métriques Secondaires */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-lg font-bold text-white mb-1">
              {globalStats.avg_daily_calories}
            </div>
            <div className="text-white/70 text-sm">Calories/jour</div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-lg font-bold text-white mb-1 capitalize">
              {globalStats.most_frequent_type || 'Aucun'}
            </div>
            <div className="text-white/70 text-sm">Type Principal</div>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-lg font-bold text-white mb-1 capitalize">
              {globalStats.avg_intensity === 'low' ? 'Faible' :
               globalStats.avg_intensity === 'medium' ? 'Modérée' :
               globalStats.avg_intensity === 'high' ? 'Intense' :
               globalStats.avg_intensity === 'very_high' ? 'Très Intense' : 'Modérée'}
            </div>
            <div className="text-white/70 text-sm">Intensité Moy.</div>
          </div>
        </div>
      </GlassCard>
      </div>}
    >
      <GlassCard className="p-6" style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #F59E0B 25%, transparent)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px color-mix(in srgb, #F59E0B 15%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `
      }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                boxShadow: '0 0 30px color-mix(in srgb, #F59E0B 40%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.BarChart3} size={24} style={{ color: '#F59E0B' }} variant="pure" />
            </div>
            <div>
              <div className="text-xl">Forge Énergétique - {periodLabel}</div>
              <div className="text-white/60 text-sm font-normal mt-0.5">Vos métriques de performance</div>
            </div>
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-orange-300 text-sm font-medium">Période Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ConditionalMotionActivity
            className="text-center p-4 rounded-xl"
            style={{
              background: 'color-mix(in srgb, #3B82F6 10%, transparent)',
              border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: perf.transitionDuration, delay: perf.staggerDelay }}
            fallback={
              <div
                className="text-center p-4 rounded-xl"
                style={{
                  background: 'color-mix(in srgb, #3B82F6 10%, transparent)',
                  border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)'
                }}
              >
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {globalStats.total_activities}
                </div>
                <div className="text-blue-300 text-sm font-medium">Activités</div>
                <div className="text-white/50 text-xs mt-1">Enregistrées</div>
              </div>
            }
          >
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {globalStats.total_activities}
            </div>
            <div className="text-blue-300 text-sm font-medium">Activités</div>
            <div className="text-white/50 text-xs mt-1">Enregistrées</div>
          </ConditionalMotionActivity>

          <ConditionalMotionActivity
            className="text-center p-4 rounded-xl"
            style={{
              background: 'color-mix(in srgb, #EF4444 10%, transparent)',
              border: '1px solid color-mix(in srgb, #EF4444 20%, transparent)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: perf.transitionDuration, delay: perf.staggerDelay * 2 }}
            fallback={
              <div
                className="text-center p-4 rounded-xl"
                style={{
                  background: 'color-mix(in srgb, #EF4444 10%, transparent)',
                  border: '1px solid color-mix(in srgb, #EF4444 20%, transparent)'
                }}
              >
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {globalStats.total_calories}
                </div>
                <div className="text-red-300 text-sm font-medium">Calories</div>
                <div className="text-white/50 text-xs mt-1">Brûlées</div>
              </div>
            }
          >
            <div className="text-2xl font-bold text-red-400 mb-1">
              {globalStats.total_calories}
            </div>
            <div className="text-red-300 text-sm font-medium">Calories</div>
            <div className="text-white/50 text-xs mt-1">Brûlées</div>
          </ConditionalMotionActivity>

          <ConditionalMotionActivity
            className="text-center p-4 rounded-xl"
            style={{
              background: 'color-mix(in srgb, #10B981 10%, transparent)',
              border: '1px solid color-mix(in srgb, #10B981 20%, transparent)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: perf.transitionDuration, delay: perf.staggerDelay * 3 }}
            fallback={
              <div
                className="text-center p-4 rounded-xl"
                style={{
                  background: 'color-mix(in srgb, #10B981 10%, transparent)',
                  border: '1px solid color-mix(in srgb, #10B981 20%, transparent)'
                }}
              >
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {globalStats.total_duration}
                </div>
                <div className="text-green-300 text-sm font-medium">Minutes</div>
                <div className="text-white/50 text-xs mt-1">Actives</div>
              </div>
            }
          >
            <div className="text-2xl font-bold text-green-400 mb-1">
              {globalStats.total_duration}
            </div>
            <div className="text-green-300 text-sm font-medium">Minutes</div>
            <div className="text-white/50 text-xs mt-1">Actives</div>
          </ConditionalMotionActivity>

          <ConditionalMotionActivity
            className="text-center p-4 rounded-xl"
            style={{
              background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
              border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: perf.transitionDuration, delay: perf.staggerDelay * 4 }}
            fallback={
              <div
                className="text-center p-4 rounded-xl"
                style={{
                  background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
                  border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
                }}
              >
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {globalStats.consistency_score}
                </div>
                <div className="text-purple-300 text-sm font-medium">Régularité</div>
                <div className="text-white/50 text-xs mt-1">Score</div>
              </div>
            }
          >
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {globalStats.consistency_score}
            </div>
            <div className="text-purple-300 text-sm font-medium">Régularité</div>
            <div className="text-white/50 text-xs mt-1">Score</div>
          </ConditionalMotionActivity>
        </div>

        {/* Métriques Secondaires */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-lg font-bold text-white mb-1">
              {globalStats.avg_daily_calories}
            </div>
            <div className="text-white/70 text-sm">Calories/jour</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-lg font-bold text-white mb-1 capitalize">
              {globalStats.most_frequent_type || 'Aucun'}
            </div>
            <div className="text-white/70 text-sm">Type Principal</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-lg font-bold text-white mb-1 capitalize">
              {globalStats.avg_intensity === 'low' ? 'Faible' :
               globalStats.avg_intensity === 'medium' ? 'Modérée' :
               globalStats.avg_intensity === 'high' ? 'Intense' :
               globalStats.avg_intensity === 'very_high' ? 'Très Intense' : 'Modérée'}
            </div>
            <div className="text-white/70 text-sm">Intensité Moy.</div>
          </div>
        </div>
      </GlassCard>
    </ConditionalMotionActivity>
  );
};

export default GlobalStatsCard;