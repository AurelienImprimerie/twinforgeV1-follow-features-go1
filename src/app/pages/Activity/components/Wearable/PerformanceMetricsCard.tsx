import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface PerformanceMetrics {
  vo2max_estimated?: number | null;
  training_load_score?: number | null;
  efficiency_score?: number | null;
  distance_meters?: number | null;
  avg_pace?: string | null;
  avg_speed_kmh?: number | null;
  elevation_gain_meters?: number | null;
  avg_cadence_rpm?: number | null;
  avg_power_watts?: number | null;
}

interface Props {
  metrics: PerformanceMetrics;
  activityType: string;
  className?: string;
}

const getVO2MaxLevel = (vo2max?: number | null): string => {
  if (!vo2max) return '';
  if (vo2max >= 55) return 'Excellent';
  if (vo2max >= 45) return 'Bon';
  if (vo2max >= 35) return 'Moyen';
  return 'À améliorer';
};

const getVO2MaxColor = (vo2max?: number | null): string => {
  if (!vo2max) return '#6B7280';
  if (vo2max >= 55) return '#22C55E';
  if (vo2max >= 45) return '#3B82F6';
  if (vo2max >= 35) return '#F59E0B';
  return '#EF4444';
};

export default function PerformanceMetricsCard({
  metrics,
  activityType,
  className = '',
}: Props) {
  const vo2maxColor = getVO2MaxColor(metrics.vo2max_estimated);
  const vo2maxLevel = getVO2MaxLevel(metrics.vo2max_estimated);

  const formatDistance = (meters?: number | null): string => {
    if (!meters) return '--';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const MetricBadge = ({
    icon,
    label,
    value,
    unit,
    color = '#3B82F6',
    delay = 0,
  }: {
    icon: any;
    label: string;
    value: string | number;
    unit?: string;
    color?: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
    >
      <div className="flex items-center gap-2">
        <SpatialIcon Icon={icon} size={14} style={{ color }} />
        <span className="text-sm text-white/80">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">
        {value}
        {unit && <span className="text-white/60 ml-1">{unit}</span>}
      </span>
    </motion.div>
  );

  return (
    <GlassCard
      className={`p-6 ${className}`}
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 8%, transparent) 0%, transparent 60%),
          linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #3B82F6 20%, transparent)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #3B82F6 30%, transparent), color-mix(in srgb, #3B82F6 20%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #3B82F6 40%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #3B82F6 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.TrendingUp} size={20} style={{ color: '#3B82F6' }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Métriques de Performance</h3>
          <p className="text-white/60 text-sm">Données enrichies</p>
        </div>
      </div>

      {/* VO2max en vedette */}
      {metrics.vo2max_estimated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${vo2maxColor} 15%, transparent), color-mix(in srgb, ${vo2maxColor} 5%, transparent))`,
            border: `1px solid color-mix(in srgb, ${vo2maxColor} 30%, transparent)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60 mb-1">VO2max Estimé</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: vo2maxColor }}>
                  {metrics.vo2max_estimated.toFixed(1)}
                </span>
                <span className="text-sm text-white/60">ml/kg/min</span>
              </div>
              <div
                className="text-xs font-medium mt-1"
                style={{ color: vo2maxColor }}
              >
                {vo2maxLevel}
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, color-mix(in srgb, ${vo2maxColor} 20%, transparent), transparent)`,
                border: `2px solid color-mix(in srgb, ${vo2maxColor} 40%, transparent)`,
              }}
            >
              <SpatialIcon Icon={ICONS.Zap} size={24} style={{ color: vo2maxColor }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Métriques de distance et mouvement */}
      <div className="space-y-2 mb-4">
        {metrics.distance_meters && (
          <MetricBadge
            icon={ICONS.MapPin}
            label="Distance"
            value={formatDistance(metrics.distance_meters)}
            color="#10B981"
            delay={0.1}
          />
        )}

        {metrics.avg_pace && (
          <MetricBadge
            icon={ICONS.Timer}
            label="Allure Moyenne"
            value={metrics.avg_pace}
            unit="/km"
            color="#3B82F6"
            delay={0.15}
          />
        )}

        {metrics.avg_speed_kmh && (
          <MetricBadge
            icon={ICONS.Gauge}
            label="Vitesse Moyenne"
            value={metrics.avg_speed_kmh.toFixed(1)}
            unit="km/h"
            color="#06B6D4"
            delay={0.2}
          />
        )}

        {metrics.elevation_gain_meters && (
          <MetricBadge
            icon={ICONS.TrendingUp}
            label="Dénivelé Positif"
            value={metrics.elevation_gain_meters.toFixed(0)}
            unit="m"
            color="#F59E0B"
            delay={0.25}
          />
        )}
      </div>

      {/* Métriques de cadence et puissance */}
      {(metrics.avg_cadence_rpm || metrics.avg_power_watts) && (
        <div className="space-y-2 mb-4">
          {metrics.avg_cadence_rpm && (
            <MetricBadge
              icon={ICONS.Activity}
              label={activityType === 'vélo' ? 'Cadence Moyenne' : 'Fréquence de Pas'}
              value={metrics.avg_cadence_rpm.toFixed(0)}
              unit={activityType === 'vélo' ? 'rpm' : 'spm'}
              color="#8B5CF6"
              delay={0.3}
            />
          )}

          {metrics.avg_power_watts && (
            <MetricBadge
              icon={ICONS.Zap}
              label="Puissance Moyenne"
              value={metrics.avg_power_watts.toFixed(0)}
              unit="W"
              color="#EF4444"
              delay={0.35}
            />
          )}
        </div>
      )}

      {/* Scores calculés */}
      {(metrics.training_load_score || metrics.efficiency_score) && (
        <div className="space-y-2">
          {metrics.training_load_score && (
            <MetricBadge
              icon={ICONS.Activity}
              label="Charge d'Entraînement"
              value={metrics.training_load_score.toFixed(0)}
              unit="TRIMP"
              color="#F59E0B"
              delay={0.4}
            />
          )}

          {metrics.efficiency_score && (
            <MetricBadge
              icon={ICONS.Target}
              label="Score d'Efficience"
              value={metrics.efficiency_score.toFixed(1)}
              unit="/100"
              color="#22C55E"
              delay={0.45}
            />
          )}
        </div>
      )}

      {/* Badge de qualité */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 pt-4 border-t border-white/10"
      >
        <div className="flex items-center gap-2">
          <SpatialIcon Icon={ICONS.Check} size={14} style={{ color: '#22C55E' }} />
          <span className="text-xs text-white/60">
            Métriques avancées enrichies par wearable
          </span>
        </div>
      </motion.div>
    </GlassCard>
  );
}
