import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface HeartRateMetrics {
  hr_avg?: number | null;
  hr_max?: number | null;
  hr_min?: number | null;
  hr_resting_pre?: number | null;
  hr_recovery_1min?: number | null;
  hr_zone1_minutes?: number | null;
  hr_zone2_minutes?: number | null;
  hr_zone3_minutes?: number | null;
  hr_zone4_minutes?: number | null;
  hr_zone5_minutes?: number | null;
}

interface Props {
  metrics: HeartRateMetrics;
  className?: string;
}

const ZONE_CONFIG = [
  { zone: 1, label: 'Z1 Récupération', color: '#22C55E', range: '50-60%' },
  { zone: 2, label: 'Z2 Endurance', color: '#3B82F6', range: '60-70%' },
  { zone: 3, label: 'Z3 Tempo', color: '#F59E0B', range: '70-80%' },
  { zone: 4, label: 'Z4 Seuil', color: '#EF4444', range: '80-90%' },
  { zone: 5, label: 'Z5 VO2max', color: '#DC2626', range: '90-100%' },
];

export default function HeartRateMetricsCard({ metrics, className = '' }: Props) {
  const hasZoneData = Boolean(
    metrics.hr_zone1_minutes ||
      metrics.hr_zone2_minutes ||
      metrics.hr_zone3_minutes ||
      metrics.hr_zone4_minutes ||
      metrics.hr_zone5_minutes
  );

  const totalZoneMinutes =
    (metrics.hr_zone1_minutes || 0) +
    (metrics.hr_zone2_minutes || 0) +
    (metrics.hr_zone3_minutes || 0) +
    (metrics.hr_zone4_minutes || 0) +
    (metrics.hr_zone5_minutes || 0);

  const getZonePercentage = (minutes?: number | null) => {
    if (!minutes || totalZoneMinutes === 0) return 0;
    return (minutes / totalZoneMinutes) * 100;
  };

  return (
    <GlassCard
      className={`p-6 ${className}`}
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #EF4444 8%, transparent) 0%, transparent 60%),
          linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #EF4444 20%, transparent)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #EF4444 30%, transparent), color-mix(in srgb, #EF4444 20%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #EF4444 40%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #EF4444 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Heart} size={20} style={{ color: '#EF4444' }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Métriques Cardiaques</h3>
          <p className="text-white/60 text-sm">Données en temps réel</p>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.hr_avg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-red-400">{metrics.hr_avg}</div>
            <div className="text-white/60 text-xs mt-1">FC Moyenne</div>
          </motion.div>
        )}

        {metrics.hr_max && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-red-500">{metrics.hr_max}</div>
            <div className="text-white/60 text-xs mt-1">FC Max</div>
          </motion.div>
        )}

        {metrics.hr_min && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-green-400">{metrics.hr_min}</div>
            <div className="text-white/60 text-xs mt-1">FC Min</div>
          </motion.div>
        )}

        {metrics.hr_recovery_1min && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-blue-400">
              {metrics.hr_recovery_1min}
            </div>
            <div className="text-white/60 text-xs mt-1">Récup. 1min</div>
          </motion.div>
        )}
      </div>

      {/* Distribution des Zones */}
      {hasZoneData && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white/80 mb-3">
            Distribution des Zones
          </h4>

          {ZONE_CONFIG.map(({ zone, label, color, range }) => {
            const minutes =
              zone === 1
                ? metrics.hr_zone1_minutes
                : zone === 2
                ? metrics.hr_zone2_minutes
                : zone === 3
                ? metrics.hr_zone3_minutes
                : zone === 4
                ? metrics.hr_zone4_minutes
                : metrics.hr_zone5_minutes;

            if (!minutes) return null;

            const percentage = getZonePercentage(minutes);

            return (
              <motion.div
                key={zone}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * zone }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-white/80">{label}</span>
                    <span className="text-white/40">{range}</span>
                  </div>
                  <span className="text-white/60">{minutes} min</span>
                </div>

                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + 0.1 * zone }}
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 12px ${color}40`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Badge de qualité */}
      {metrics.hr_avg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Check} size={14} style={{ color: '#22C55E' }} />
            <span className="text-xs text-white/60">Données enrichies par wearable</span>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
