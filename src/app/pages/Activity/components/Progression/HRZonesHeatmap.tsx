import React from 'react';
import { supabase } from '../../../../../system/supabase/client';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import logger from '../../../../../lib/utils/logger';

interface HRZoneData {
  date: string;
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  z5: number;
}

interface HRZonesHeatmapProps {
  userId: string;
  period: 'week' | 'month' | 'quarter';
}

const HRZonesHeatmap: React.FC<HRZonesHeatmapProps> = ({ userId, period }) => {
  const [data, setData] = React.useState<HRZoneData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  React.useEffect(() => {
    const fetchHRZoneData = async () => {
      try {
        setLoading(true);
        const since = new Date();
        since.setDate(since.getDate() - periodDays);

        const { data: activities, error } = await supabase
          .from('activities')
          .select(
            'timestamp, hr_zone1_minutes, hr_zone2_minutes, hr_zone3_minutes, hr_zone4_minutes, hr_zone5_minutes'
          )
          .eq('user_id', userId)
          .gte('timestamp', since.toISOString())
          .not('hr_zone1_minutes', 'is', null)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (activities && activities.length > 0) {
          const aggregatedByDate = new Map<string, HRZoneData>();

          activities.forEach((a) => {
            const dateKey = new Date(a.timestamp).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
            });

            if (!aggregatedByDate.has(dateKey)) {
              aggregatedByDate.set(dateKey, {
                date: dateKey,
                z1: 0,
                z2: 0,
                z3: 0,
                z4: 0,
                z5: 0,
              });
            }

            const entry = aggregatedByDate.get(dateKey)!;
            entry.z1 += a.hr_zone1_minutes || 0;
            entry.z2 += a.hr_zone2_minutes || 0;
            entry.z3 += a.hr_zone3_minutes || 0;
            entry.z4 += a.hr_zone4_minutes || 0;
            entry.z5 += a.hr_zone5_minutes || 0;
          });

          const sortedData = Array.from(aggregatedByDate.values());
          setData(sortedData);
        }

        logger.info('HR_ZONES_HEATMAP', 'Data fetched successfully', { count: activities?.length });
      } catch (error) {
        logger.error('HR_ZONES_HEATMAP', 'Failed to fetch HR zones data', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchHRZoneData();
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
            background: 'linear-gradient(135deg, color-mix(in srgb, #10B981 20%, transparent), color-mix(in srgb, #10B981 10%, transparent))',
            border: '1px solid color-mix(in srgb, #10B981 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Heart} size={32} style={{ color: '#10B981' }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Heatmap Zones FC</h3>
        <p className="text-white/70 text-base max-w-md mx-auto">
          Aucune donnée de zones de fréquence cardiaque disponible. Utilisez un objet connecté pour suivre vos zones FC.
        </p>
      </GlassCard>
    );
  }

  const zones = [
    { key: 'z1', label: 'Z1 Récupération', color: '#22C55E', lightColor: '#86EFAC' },
    { key: 'z2', label: 'Z2 Endurance', color: '#3B82F6', lightColor: '#93C5FD' },
    { key: 'z3', label: 'Z3 Tempo', color: '#F59E0B', lightColor: '#FCD34D' },
    { key: 'z4', label: 'Z4 Seuil', color: '#F97316', lightColor: '#FDBA74' },
    { key: 'z5', label: 'Z5 Max', color: '#EF4444', lightColor: '#FCA5A5' },
  ];

  const maxMinutesPerZone = Math.max(
    ...data.flatMap((d) => [d.z1, d.z2, d.z3, d.z4, d.z5])
  );

  const totalMinutes = data.reduce(
    (sum, d) => sum + d.z1 + d.z2 + d.z3 + d.z4 + d.z5,
    0
  );

  const zoneDistribution = {
    z1: (data.reduce((sum, d) => sum + d.z1, 0) / totalMinutes) * 100,
    z2: (data.reduce((sum, d) => sum + d.z2, 0) / totalMinutes) * 100,
    z3: (data.reduce((sum, d) => sum + d.z3, 0) / totalMinutes) * 100,
    z4: (data.reduce((sum, d) => sum + d.z4, 0) / totalMinutes) * 100,
    z5: (data.reduce((sum, d) => sum + d.z5, 0) / totalMinutes) * 100,
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, #EF4444 25%, transparent), color-mix(in srgb, #EF4444 15%, transparent))',
            border: '1px solid color-mix(in srgb, #EF4444 35%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #EF4444 20%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Heart} size={24} style={{ color: '#10B981' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">Heatmap Zones FC</h3>
          <p className="text-white/60 text-sm">Distribution du temps par zone de fréquence cardiaque</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/70 text-sm font-medium">Distribution globale</span>
          <span className="text-white/50 text-xs">{totalMinutes.toFixed(0)} min total</span>
        </div>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          {zones.map((zone) => {
            const percent = zoneDistribution[zone.key as keyof typeof zoneDistribution];
            if (percent === 0) return null;
            return (
              <div
                key={zone.key}
                style={{
                  width: `${percent}%`,
                  background: zone.color,
                }}
                title={`${zone.label}: ${percent.toFixed(1)}%`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {zones.map((zone) => {
          const percent = zoneDistribution[zone.key as keyof typeof zoneDistribution];
          return (
            <div
              key={zone.key}
              className="p-3 rounded-lg"
              style={{
                background: `color-mix(in srgb, ${zone.color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${zone.color} 20%, transparent)`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: zone.color }}
                />
                <span className="text-xs font-semibold" style={{ color: zone.lightColor }}>
                  {zone.label}
                </span>
              </div>
              <p className="text-lg font-bold text-white">{percent.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl p-4 overflow-x-auto"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className="min-w-max">
          <div className="flex gap-2 mb-2">
            <div className="w-20 flex-shrink-0" />
            {zones.map((zone) => (
              <div key={zone.key} className="w-16 text-center">
                <span className="text-xs font-semibold" style={{ color: zone.lightColor }}>
                  {zone.key.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {data.slice(-14).map((entry, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 mb-2">
              <div className="w-20 flex-shrink-0 flex items-center">
                <span className="text-xs text-white/50">{entry.date}</span>
              </div>
              {zones.map((zone) => {
                const minutes = entry[zone.key as keyof Omit<HRZoneData, 'date'>];
                const intensity = minutes / maxMinutesPerZone;
                const opacity = Math.max(0.1, intensity);

                return (
                  <div
                    key={zone.key}
                    className="w-16 h-10 rounded flex items-center justify-center transition-all duration-200 hover:scale-105"
                    style={{
                      background: `color-mix(in srgb, ${zone.color} ${opacity * 100}%, transparent)`,
                      border: minutes > 0 ? `1px solid color-mix(in srgb, ${zone.color} 30%, transparent)` : '1px solid rgba(255,255,255,0.05)',
                    }}
                    title={`${entry.date} - ${zone.label}: ${minutes}min`}
                  >
                    {minutes > 0 && (
                      <span className="text-xs font-semibold text-white">
                        {minutes.toFixed(0)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <SpatialIcon Icon={ICONS.Info} size={14} style={{ color: '#EF4444' }} />
          <span className="text-red-300 font-semibold text-sm">Analyse</span>
        </div>
        <p className="text-red-200 text-sm leading-relaxed">
          {zoneDistribution.z1 + zoneDistribution.z2 > 60
            ? 'Excellent équilibre ! Vous passez la majorité du temps en zones d\'endurance fondamentale.'
            : zoneDistribution.z4 + zoneDistribution.z5 > 30
            ? 'Attention : beaucoup de temps en zones intenses. Assurez-vous de suffisamment récupérer.'
            : 'Distribution équilibrée. Variez vos séances pour optimiser les adaptations cardiovasculaires.'}
        </p>
      </div>
    </GlassCard>
  );
};

export default HRZonesHeatmap;
