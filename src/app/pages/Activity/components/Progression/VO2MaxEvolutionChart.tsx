import React from 'react';
import { supabase } from '../../../../../system/supabase/client';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import logger from '../../../../../lib/utils/logger';

interface VO2MaxDataPoint {
  date: string;
  vo2max: number;
}

interface VO2MaxEvolutionChartProps {
  userId: string;
  period: 'week' | 'month' | 'quarter';
}

const VO2MaxEvolutionChart: React.FC<VO2MaxEvolutionChartProps> = ({ userId, period }) => {
  const [data, setData] = React.useState<VO2MaxDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  React.useEffect(() => {
    const fetchVO2MaxData = async () => {
      try {
        setLoading(true);
        const since = new Date();
        since.setDate(since.getDate() - periodDays);

        const { data: activities, error } = await supabase
          .from('activities')
          .select('timestamp, vo2max_estimated')
          .eq('user_id', userId)
          .gte('timestamp', since.toISOString())
          .not('vo2max_estimated', 'is', null)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (activities && activities.length > 0) {
          const points = activities.map((a) => ({
            date: new Date(a.timestamp).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
            }),
            vo2max: a.vo2max_estimated as number,
          }));

          setData(points);
        }

        logger.info('VO2MAX_CHART', 'Data fetched successfully', { count: activities?.length });
      } catch (error) {
        logger.error('VO2MAX_CHART', 'Failed to fetch VO2max data', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchVO2MaxData();
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
            background: 'linear-gradient(135deg, color-mix(in srgb, #10B981 20%, transparent), color-mix(in srgb, #10B981 10%, transparent))',
            border: '1px solid color-mix(in srgb, #10B981 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.TrendingUp} size={32} style={{ color: '#10B981' }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Évolution VO2max</h3>
        <p className="text-white/70 text-base max-w-md mx-auto">
          Aucune donnée VO2max disponible pour cette période. Utilisez un objet connecté pour mesurer votre VO2max.
        </p>
      </GlassCard>
    );
  }

  const minVO2max = Math.min(...data.map((d) => d.vo2max));
  const maxVO2max = Math.max(...data.map((d) => d.vo2max));
  const avgVO2max = data.reduce((sum, d) => sum + d.vo2max, 0) / data.length;
  const latestVO2max = data[data.length - 1].vo2max;
  const firstVO2max = data[0].vo2max;
  const change = latestVO2max - firstVO2max;
  const changePercent = (change / firstVO2max) * 100;

  const rangeVO2max = maxVO2max - minVO2max;
  const paddingVO2max = rangeVO2max * 0.2;
  const chartMinVO2max = minVO2max - paddingVO2max;
  const chartMaxVO2max = maxVO2max + paddingVO2max;
  const chartRangeVO2max = chartMaxVO2max - chartMinVO2max;

  const viewBoxWidth = 800;
  const viewBoxHeight = 400;
  const chartMargin = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = viewBoxWidth - chartMargin.left - chartMargin.right;
  const chartHeight = viewBoxHeight - chartMargin.top - chartMargin.bottom;

  const xStep = chartWidth / (data.length - 1 || 1);

  const points = data
    .map((d, i) => {
      const x = chartMargin.left + i * xStep;
      const y =
        chartMargin.top +
        chartHeight -
        ((d.vo2max - chartMinVO2max) / chartRangeVO2max) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const pathD = `M ${points.split(' ').join(' L ')}`;

  const gradientId = 'vo2max-gradient';

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, #3B82F6 25%, transparent), color-mix(in srgb, #3B82F6 15%, transparent))',
              border: '1px solid color-mix(in srgb, #3B82F6 35%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #3B82F6 20%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Activity} size={24} style={{ color: '#10B981' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Évolution VO2max</h3>
            <p className="text-white/60 text-sm">Capacité cardiovasculaire maximale</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs mb-1">Actuel</p>
          <p className="text-3xl font-bold text-white">{latestVO2max.toFixed(1)}</p>
          <div
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold mt-1"
            style={{
              background: change >= 0
                ? 'color-mix(in srgb, #22C55E 15%, transparent)'
                : 'color-mix(in srgb, #EF4444 15%, transparent)',
              border: change >= 0
                ? '1px solid color-mix(in srgb, #22C55E 25%, transparent)'
                : '1px solid color-mix(in srgb, #EF4444 25%, transparent)',
              color: change >= 0 ? '#22C55E' : '#EF4444',
            }}
          >
            <SpatialIcon Icon={change >= 0 ? ICONS.TrendingUp : ICONS.TrendingDown} size={10} />
            {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-white/50 text-xs mb-1">Minimum</p>
          <p className="text-white font-bold text-lg">{minVO2max.toFixed(1)}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-white/50 text-xs mb-1">Moyenne</p>
          <p className="text-white font-bold text-lg">{avgVO2max.toFixed(1)}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-white/50 text-xs mb-1">Maximum</p>
          <p className="text-white font-bold text-lg">{maxVO2max.toFixed(1)}</p>
        </div>
      </div>

      <div className="relative" style={{ width: '100%', height: '300px' }}>
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>

          <path
            d={`${pathD} L ${chartMargin.left + chartWidth},${chartMargin.top + chartHeight} L ${chartMargin.left},${chartMargin.top + chartHeight} Z`}
            fill={`url(#${gradientId})`}
          />

          <polyline
            points={points}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((d, i) => {
            const x = chartMargin.left + i * xStep;
            const y =
              chartMargin.top +
              chartHeight -
              ((d.vo2max - chartMinVO2max) / chartRangeVO2max) * chartHeight;

            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#3B82F6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <text
                  x={x}
                  y={chartMargin.top + chartHeight + 25}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="12"
                >
                  {d.date}
                </text>
              </g>
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartMargin.top + chartHeight * (1 - ratio);
            const value = chartMinVO2max + chartRangeVO2max * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={chartMargin.left}
                  y1={y}
                  x2={chartMargin.left + chartWidth}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={chartMargin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="12"
                >
                  {value.toFixed(0)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <SpatialIcon Icon={ICONS.Info} size={14} style={{ color: '#3B82F6' }} />
          <span className="text-blue-300 font-semibold text-sm">Interprétation</span>
        </div>
        <p className="text-blue-200 text-sm leading-relaxed">
          {latestVO2max >= 50
            ? 'Excellente capacité aérobie ! Maintenez ce niveau avec des entraînements variés.'
            : latestVO2max >= 40
            ? 'Bonne capacité cardiovasculaire. Continuez à progresser avec des séances d\'endurance.'
            : 'Marge de progression importante. Augmentez progressivement votre volume d\'entraînement cardio.'}
        </p>
      </div>
    </GlassCard>
  );
};

export default VO2MaxEvolutionChart;
