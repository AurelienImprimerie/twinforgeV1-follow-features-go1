import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface RecoveryMetrics {
  recovery_score?: number | null;
  hrv_pre_activity?: number | null;
  hrv_avg_overnight?: number | null;
  sleep_quality_score?: number | null;
  sleep_duration_hours?: number | null;
  stress_level_pre?: number | null;
  body_battery_pre?: number | null;
  fatigue_index?: number | null;
}

interface Props {
  metrics: RecoveryMetrics;
  className?: string;
}

const getRecoveryColor = (score?: number | null): string => {
  if (!score) return '#6B7280';
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
};

const getRecoveryLabel = (score?: number | null): string => {
  if (!score) return 'Indisponible';
  if (score >= 80) return 'Excellente';
  if (score >= 60) return 'Bonne';
  if (score >= 40) return 'Modérée';
  return 'Faible';
};

const getRecoveryAdvice = (score?: number | null): string => {
  if (!score) return 'Connectez un objet pour obtenir votre score';
  if (score >= 80) return 'Votre corps est prêt pour un entraînement intense';
  if (score >= 60) return 'Vous pouvez vous entraîner normalement';
  if (score >= 40) return 'Privilégiez un entraînement léger aujourd\'hui';
  return 'Accordez-vous une journée de repos ou récupération active';
};

export default function RecoveryScoreCard({ metrics, className = '' }: Props) {
  const recoveryColor = getRecoveryColor(metrics.recovery_score);
  const recoveryLabel = getRecoveryLabel(metrics.recovery_score);
  const recoveryAdvice = getRecoveryAdvice(metrics.recovery_score);

  const CircularProgress = ({ value, max, size = 120, strokeWidth = 8 }: {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / max) * circumference;
    const center = size / 2;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={recoveryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${progress} ${circumference}` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${recoveryColor}40)`,
          }}
        />
      </svg>
    );
  };

  return (
    <GlassCard
      className={`p-6 ${className}`}
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, ${recoveryColor} 8%, transparent) 0%, transparent 60%),
          linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
          var(--glass-opacity)
        `,
        borderColor: `color-mix(in srgb, ${recoveryColor} 20%, transparent)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, ${recoveryColor} 30%, transparent), color-mix(in srgb, ${recoveryColor} 20%, transparent))
            `,
            border: `2px solid color-mix(in srgb, ${recoveryColor} 40%, transparent)`,
            boxShadow: `0 0 20px color-mix(in srgb, ${recoveryColor} 30%, transparent)`,
          }}
        >
          <SpatialIcon Icon={ICONS.Battery} size={20} style={{ color: recoveryColor }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Score de Récupération</h3>
          <p className="text-white/60 text-sm">État de préparation</p>
        </div>
      </div>

      {/* Score circulaire principal */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative">
          <CircularProgress value={metrics.recovery_score || 0} max={100} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-4xl font-bold"
              style={{ color: recoveryColor }}
            >
              {metrics.recovery_score || '--'}
            </motion.div>
            <div className="text-white/40 text-xs mt-1">sur 100</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <div
            className="text-lg font-semibold mb-1"
            style={{ color: recoveryColor }}
          >
            {recoveryLabel}
          </div>
          <div className="text-sm text-white/70 max-w-xs">
            {recoveryAdvice}
          </div>
        </motion.div>
      </div>

      {/* Métriques détaillées */}
      <div className="space-y-3">
        {metrics.hrv_pre_activity && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Activity} size={14} style={{ color: '#3B82F6' }} />
              <span className="text-sm text-white/80">HRV Pré-activité</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {metrics.hrv_pre_activity.toFixed(1)} ms
            </span>
          </div>
        )}

        {metrics.hrv_avg_overnight && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Moon} size={14} style={{ color: '#8B5CF6' }} />
              <span className="text-sm text-white/80">HRV Nuit</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {metrics.hrv_avg_overnight.toFixed(1)} ms
            </span>
          </div>
        )}

        {metrics.sleep_quality_score && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Moon} size={14} style={{ color: '#A855F7' }} />
              <span className="text-sm text-white/80">Qualité Sommeil</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {metrics.sleep_quality_score.toFixed(0)}%
            </span>
          </div>
        )}

        {metrics.sleep_duration_hours && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Clock} size={14} style={{ color: '#06B6D4' }} />
              <span className="text-sm text-white/80">Durée Sommeil</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {metrics.sleep_duration_hours.toFixed(1)}h
            </span>
          </div>
        )}

        {metrics.stress_level_pre && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.AlertCircle} size={14} style={{ color: '#F59E0B' }} />
              <span className="text-sm text-white/80">Stress Pré-activité</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {metrics.stress_level_pre.toFixed(0)}%
            </span>
          </div>
        )}

        {metrics.body_battery_pre && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Zap} size={14} style={{ color: '#22C55E' }} />
              <span className="text-sm text-white/80">Body Battery</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {metrics.body_battery_pre.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Badge de données */}
      {metrics.recovery_score && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Check} size={14} style={{ color: '#22C55E' }} />
            <span className="text-xs text-white/60">
              Données de récupération analysées
            </span>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
