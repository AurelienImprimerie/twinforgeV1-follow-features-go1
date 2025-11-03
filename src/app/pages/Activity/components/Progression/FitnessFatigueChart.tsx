import React from 'react';
import { supabase } from '../../../../../system/supabase/client';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import logger from '../../../../../lib/utils/logger';

interface FitnessFatiguePoint {
  date: string;
  fitness: number;
  fatigue: number;
  form: number;
}

interface FitnessFatigueChartProps {
  userId: string;
  period: 'week' | 'month' | 'quarter';
}

const FitnessFatigueChart: React.FC<FitnessFatigueChartProps> = ({ userId, period }) => {
  const [data, setData] = React.useState<FitnessFatiguePoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  React.useEffect(() => {
    const fetchFitnessData = async () => {
      try {
        setLoading(true);
        const since = new Date();
        since.setDate(since.getDate() - periodDays);

        const { data: activities, error } = await supabase
          .from('activities')
          .select('timestamp, training_load_score')
          .eq('user_id', userId)
          .gte('timestamp', since.toISOString())
          .not('training_load_score', 'is', null)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        if (activities && activities.length > 0) {
          const CTL_TC = 42;
          const ATL_TC = 7;

          let ctl = 0;
          let atl = 0;

          const points: FitnessFatiguePoint[] = [];

          activities.forEach((activity) => {
            const trimp = activity.training_load_score || 0;

            ctl = ctl + (trimp - ctl) / CTL_TC;
            atl = atl + (trimp - atl) / ATL_TC;

            const tsb = ctl - atl;

            points.push({
              date: new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
              }),
              fitness: ctl,
              fatigue: atl,
              form: tsb,
            });
          });

          setData(points);
        }

        logger.info('FITNESS_FATIGUE_CHART', 'Data computed successfully', { count: activities?.length });
      } catch (error) {
        logger.error('FITNESS_FATIGUE_CHART', 'Failed to compute fitness/fatigue', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchFitnessData();
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
          <SpatialIcon Icon={ICONS.TrendingUp} size={32} style={{ color: '#10B981' }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Fitness / Fatigue</h3>
        <p className="text-white/70 text-base max-w-md mx-auto">
          Aucune donnée de charge d'entraînement disponible. Utilisez un objet connecté pour calculer automatiquement votre TRIMP.
        </p>
      </GlassCard>
    );
  }

  const latestPoint = data[data.length - 1];
  const currentForm = latestPoint.form;

  let formStatus: { label: string; color: string; advice: string };
  if (currentForm > 10) {
    formStatus = {
      label: 'Forme Optimale',
      color: '#22C55E',
      advice: 'Condition idéale pour une performance maximale. C\'est le moment d\'un objectif ambitieux !',
    };
  } else if (currentForm > 0) {
    formStatus = {
      label: 'Forme Fraîche',
      color: '#3B82F6',
      advice: 'Bonne forme générale. Maintenez l\'équilibre entre entraînement et récupération.',
    };
  } else if (currentForm > -10) {
    formStatus = {
      label: 'Forme Neutre',
      color: '#F59E0B',
      advice: 'Équilibre précaire. Ajustez la charge selon vos sensations.',
    };
  } else if (currentForm > -20) {
    formStatus = {
      label: 'Fatigue Modérée',
      color: '#F97316',
      advice: 'Phase de fatigue accumulée. Privilégiez la récupération et réduisez l\'intensité.',
    };
  } else {
    formStatus = {
      label: 'Fatigue Élevée',
      color: '#EF4444',
      advice: 'Attention au surentraînement ! Repos obligatoire. Consultez un professionnel si persistant.',
    };
  }

  const minValue = Math.min(...data.flatMap((d) => [d.fitness, d.fatigue, d.form]));
  const maxValue = Math.max(...data.flatMap((d) => [d.fitness, d.fatigue, d.form]));
  const rangeValue = maxValue - minValue;
  const paddingValue = rangeValue * 0.2;
  const chartMin = minValue - paddingValue;
  const chartMax = maxValue + paddingValue;
  const chartRange = chartMax - chartMin;

  const viewBoxWidth = 800;
  const viewBoxHeight = 400;
  const chartMargin = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = viewBoxWidth - chartMargin.left - chartMargin.right;
  const chartHeight = viewBoxHeight - chartMargin.top - chartMargin.bottom;

  const xStep = chartWidth / (data.length - 1 || 1);

  const createPath = (values: number[]) => {
    return values
      .map((val, i) => {
        const x = chartMargin.left + i * xStep;
        const y =
          chartMargin.top +
          chartHeight -
          ((val - chartMin) / chartRange) * chartHeight;
        return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
      })
      .join(' ');
  };

  const fitnessPath = createPath(data.map((d) => d.fitness));
  const fatiguePath = createPath(data.map((d) => d.fatigue));
  const formPath = createPath(data.map((d) => d.form));

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${formStatus.color} 25%, transparent), color-mix(in srgb, ${formStatus.color} 15%, transparent))`,
              border: `1px solid color-mix(in srgb, ${formStatus.color} 35%, transparent)`,
              boxShadow: `0 0 20px color-mix(in srgb, ${formStatus.color} 20%, transparent)`,
            }}
          >
            <SpatialIcon Icon={ICONS.TrendingUp} size={24} style={{ color: formStatus.color }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Courbe Fitness / Fatigue</h3>
            <p className="text-white/60 text-sm">Modèle de charge d'entraînement (CTL/ATL/TSB)</p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{
              background: `color-mix(in srgb, ${formStatus.color} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${formStatus.color} 25%, transparent)`,
              color: formStatus.color,
            }}
          >
            {formStatus.label}
          </div>
          <p className="text-2xl font-bold text-white">{currentForm.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#3B82F6' }} />
            <p className="text-blue-300 text-xs font-medium">Fitness (CTL)</p>
          </div>
          <p className="text-white font-bold text-lg">{latestPoint.fitness.toFixed(1)}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
            <p className="text-red-300 text-xs font-medium">Fatigue (ATL)</p>
          </div>
          <p className="text-white font-bold text-lg">{latestPoint.fatigue.toFixed(1)}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${formStatus.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${formStatus.color} 20%, transparent)` }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: formStatus.color }} />
            <p className="text-xs font-medium" style={{ color: formStatus.color }}>Forme (TSB)</p>
          </div>
          <p className="text-white font-bold text-lg">{latestPoint.form.toFixed(1)}</p>
        </div>
      </div>

      <div className="relative" style={{ width: '100%', height: '300px' }}>
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="fitness-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.02 }} />
            </linearGradient>
            <linearGradient id="fatigue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#EF4444', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 0.02 }} />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartMargin.top + chartHeight * (1 - ratio);
            const value = chartMin + chartRange * ratio;
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

          <path
            d={fitnessPath}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={fatiguePath}
            fill="none"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={formPath}
            fill="none"
            stroke={formStatus.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6,4"
          />

          {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 8)) === 0).map((d, i) => {
            const actualIndex = i * Math.max(1, Math.floor(data.length / 8));
            const x = chartMargin.left + actualIndex * xStep;
            return (
              <text
                key={actualIndex}
                x={x}
                y={chartMargin.top + chartHeight + 25}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize="12"
              >
                {d.date}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ background: `color-mix(in srgb, ${formStatus.color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${formStatus.color} 20%, transparent)` }}>
        <div className="flex items-center gap-2 mb-2">
          <SpatialIcon Icon={ICONS.Lightbulb} size={14} style={{ color: formStatus.color }} />
          <span className="font-semibold text-sm" style={{ color: formStatus.color }}>Conseil</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: formStatus.color }}>
          {formStatus.advice}
        </p>
      </div>
    </GlassCard>
  );
};

export default FitnessFatigueChart;
