import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import WearableConnectionBadge from '../shared/WearableConnectionBadge';
import React from 'react';

interface ActivitySummaryCardProps {
  todayStats?: {
    totalCalories: number;
    activitiesCount: number;
    totalDuration: number;
    averageIntensity?: string;
    mostFrequentType?: string;
  };
  profile?: any;
}

/**
 * Activity Summary Card - Résumé des activités de la journée
 * Affiche un aperçu des types d'activités et de leurs caractéristiques
 */
const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({ todayStats, profile }) => {
  const summaryMetrics = [
    {
      color: '#3B82F6',
      name: 'Durée Totale',
      value: `${todayStats?.totalDuration || 0} min`,
      icon: 'Clock'
    },
    {
      color: '#06B6D4',
      name: 'Intensité Moy.',
      value: todayStats?.averageIntensity || 'Aucune',
      icon: 'Zap'
    },
    {
      color: '#8B5CF6',
      name: 'Type Principal',
      value: todayStats?.mostFrequentType || 'Aucun',
      icon: 'Target'
    },
    {
      color: '#10B981',
      name: 'Activités',
      value: `${todayStats?.activitiesCount || 0}`,
      icon: 'Activity'
    }
  ];

  return (
    <GlassCard className="activity-summary-card">
      <div className="activity-summary-header">
        <div className="activity-summary-icon activity-icon-primary activity-icon-container-md">
          <SpatialIcon Icon={ICONS.BarChart3} size={20} style={{ color: 'var(--color-activity-primary)' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="activity-summary-title">Résumé d'Aujourd'hui</h3>
              <p className="activity-summary-subtitle">Aperçu de vos activités du jour</p>
            </div>
            <WearableConnectionBadge />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, index) => (
          <div
            key={metric.name}
            className="activity-stat-card text-center rounded-xl activity-metric-enter"
            style={{
              background: `color-mix(in srgb, ${metric.color} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${metric.color} 20%, transparent)`,
              animationDelay: `${0.5 + index * 0.1}s`
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${metric.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${metric.color} 25%, transparent)`
                }}
              >
                <SpatialIcon
                  Icon={ICONS[metric.icon as keyof typeof ICONS]}
                  size={12}
                  style={{ color: metric.color }}
                />
              </div>
            </div>
            <div className="text-lg font-bold" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="text-sm font-medium" style={{ color: metric.color }}>{metric.name}</div>
          </div>
        ))}
      </div>

      {(todayStats?.activitiesCount || 0) > 0 && (
        <div className="mt-4 p-4 rounded-xl" style={{
          background: `color-mix(in srgb, var(--brand-accent) 6%, transparent)`,
          border: '1px solid color-mix(in srgb, var(--brand-accent) 15%, transparent)'
        }}>
          <h4 className="text-cyan-300 font-medium text-sm mb-2 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Info} size={12} style={{ color: 'var(--brand-accent)' }} />
            Optimisations Forge
          </h4>
          <div className="activity-summary-content space-y-1">
            <p>• Excellente diversité d'activités aujourd'hui</p>
            <p>• Maintenez ce rythme pour optimiser votre forme</p>
            {profile?.objective === 'fat_loss' && (
              <p>• Activités cardio recommandées pour votre objectif</p>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default ActivitySummaryCard;