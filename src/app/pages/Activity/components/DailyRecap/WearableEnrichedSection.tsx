import React from 'react';
import { motion } from 'framer-motion';
import {
  HeartRateMetricsCard,
  RecoveryScoreCard,
  PerformanceMetricsCard,
  WearableBadge,
} from '../Wearable';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface WearableActivity {
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
  hrv_pre_activity?: number | null;
  hrv_post_activity?: number | null;
  hrv_avg_overnight?: number | null;
  vo2max_estimated?: number | null;
  training_load_score?: number | null;
  efficiency_score?: number | null;
  fatigue_index?: number | null;
  distance_meters?: number | null;
  avg_pace?: string | null;
  avg_speed_kmh?: number | null;
  elevation_gain_meters?: number | null;
  avg_cadence_rpm?: number | null;
  avg_power_watts?: number | null;
  sleep_quality_score?: number | null;
  sleep_duration_hours?: number | null;
  recovery_score?: number | null;
  stress_level_pre?: number | null;
  body_battery_pre?: number | null;
  wearable_device_id?: string | null;
  data_completeness_score?: number | null;
  type: string;
}

interface Props {
  activities: WearableActivity[];
  className?: string;
}

export default function WearableEnrichedSection({ activities, className = '' }: Props) {
  // Agréger les métriques de toutes les activités du jour
  const aggregatedMetrics = React.useMemo(() => {
    if (!activities || activities.length === 0) return null;

    const wearableActivities = activities.filter((a) => a.wearable_device_id);

    if (wearableActivities.length === 0) return null;

    // Prendre la dernière activité pour les métriques de récupération (plus récentes)
    const latestActivity = wearableActivities[0];

    // Agréger les métriques cardiaques (moyennes)
    const avgHR =
      wearableActivities
        .filter((a) => a.hr_avg)
        .reduce((sum, a) => sum + (a.hr_avg || 0), 0) / wearableActivities.length || null;

    const maxHR = Math.max(...wearableActivities.map((a) => a.hr_max || 0)) || null;

    // Sommer les zones cardiaques
    const totalZones = {
      zone1: wearableActivities.reduce((sum, a) => sum + (a.hr_zone1_minutes || 0), 0),
      zone2: wearableActivities.reduce((sum, a) => sum + (a.hr_zone2_minutes || 0), 0),
      zone3: wearableActivities.reduce((sum, a) => sum + (a.hr_zone3_minutes || 0), 0),
      zone4: wearableActivities.reduce((sum, a) => sum + (a.hr_zone4_minutes || 0), 0),
      zone5: wearableActivities.reduce((sum, a) => sum + (a.hr_zone5_minutes || 0), 0),
    };

    // Sommer les distances
    const totalDistance =
      wearableActivities.reduce((sum, a) => sum + (a.distance_meters || 0), 0) || null;

    // Calculer la charge totale d'entraînement
    const totalTrainingLoad =
      wearableActivities.reduce((sum, a) => sum + (a.training_load_score || 0), 0) || null;

    return {
      heartRate: {
        hr_avg: avgHR ? Math.round(avgHR) : null,
        hr_max: maxHR || null,
        hr_min: latestActivity.hr_min,
        hr_resting_pre: latestActivity.hr_resting_pre,
        hr_recovery_1min: latestActivity.hr_recovery_1min,
        hr_zone1_minutes: totalZones.zone1 || null,
        hr_zone2_minutes: totalZones.zone2 || null,
        hr_zone3_minutes: totalZones.zone3 || null,
        hr_zone4_minutes: totalZones.zone4 || null,
        hr_zone5_minutes: totalZones.zone5 || null,
      },
      recovery: {
        recovery_score: latestActivity.recovery_score,
        hrv_pre_activity: latestActivity.hrv_pre_activity,
        hrv_avg_overnight: latestActivity.hrv_avg_overnight,
        sleep_quality_score: latestActivity.sleep_quality_score,
        sleep_duration_hours: latestActivity.sleep_duration_hours,
        stress_level_pre: latestActivity.stress_level_pre,
        body_battery_pre: latestActivity.body_battery_pre,
        fatigue_index: latestActivity.fatigue_index,
      },
      performance: {
        vo2max_estimated: latestActivity.vo2max_estimated,
        training_load_score: totalTrainingLoad,
        efficiency_score: latestActivity.efficiency_score,
        distance_meters: totalDistance,
        avg_pace: latestActivity.avg_pace,
        avg_speed_kmh: latestActivity.avg_speed_kmh,
        elevation_gain_meters: wearableActivities.reduce(
          (sum, a) => sum + (a.elevation_gain_meters || 0),
          0
        ) || null,
        avg_cadence_rpm: latestActivity.avg_cadence_rpm,
        avg_power_watts: latestActivity.avg_power_watts,
      },
      hasData: true,
      activityType: latestActivity.type,
      dataCompletenessScore: latestActivity.data_completeness_score,
    };
  }, [activities]);

  if (!aggregatedMetrics) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header avec badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Métriques Enrichies</h2>
          <p className="text-white/60 text-sm mt-1">
            Données biométriques provenant de vos objets connectés
          </p>
        </div>
        <WearableBadge
          hasWearableData={aggregatedMetrics.hasData}
          dataCompletenessScore={aggregatedMetrics.dataCompletenessScore}
        />
      </div>

      {/* Grid de cartes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score de récupération */}
        <RecoveryScoreCard metrics={aggregatedMetrics.recovery} />

        {/* Métriques cardiaques */}
        <HeartRateMetricsCard metrics={aggregatedMetrics.heartRate} />
      </div>

      {/* Métriques de performance (pleine largeur) */}
      <PerformanceMetricsCard
        metrics={aggregatedMetrics.performance}
        activityType={aggregatedMetrics.activityType}
      />

      {/* Message info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-xl"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, #3B82F6 10%, transparent), color-mix(in srgb, #3B82F6 5%, transparent))',
          border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: '#3B82F6' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-200">
              Ces métriques sont automatiquement synchronisées depuis vos objets connectés.
              Plus vous portez votre montre, plus les données sont précises et les insights personnalisés.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
