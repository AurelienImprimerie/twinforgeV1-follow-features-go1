import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface CalorieTrendData {
  date: string;
  calories: number;
  formattedDate: string;
}

interface CalorieTrendChartProps {
  data: CalorieTrendData[];
  targetCalories: number;
  objective?: 'fat_loss' | 'recomp' | 'muscle_gain';
}

/**
 * Custom Tooltip Component - VisionOS 26 Style
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const calories = payload[0].value;

  return (
    <div
      className="p-4 rounded-xl border backdrop-blur-xl"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
          rgba(11, 14, 23, 0.95)
        `,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)'
      }}
    >
      <div className="text-white font-semibold text-sm mb-1">{data.formattedDate}</div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="text-green-300 font-bold">{calories} kcal</span>
      </div>
    </div>
  );
};

/**
 * Calorie Trend Chart - Graphique de Tendance Calorique VisionOS 26
 * Visualisation élégante de l'évolution calorique avec ligne de référence
 */
const CalorieTrendChart: React.FC<CalorieTrendChartProps> = ({
  data,
  targetCalories,
  objective,
}) => {
  const reduceMotion = useReducedMotion();
  const { isPerformanceMode } = usePerformanceMode();

  // Calculer les statistiques de manière robuste
  const avgCalories = data.length > 0 ?
    Math.round(data.reduce((sum, day) => sum + (day.calories || 0), 0) / data.length) : 0;

  const maxCalories = data.length > 0 ? Math.max(...data.map(d => d.calories || 0)) : 0;

  // Pour minCalories, filtrer les zéros et gérer le cas où tous sont à zéro
  const nonZeroCalories = data.map(d => d.calories || 0).filter(c => c > 0);
  const minCalories = nonZeroCalories.length > 0 ? Math.min(...nonZeroCalories) : 0;
  
  const trend = data.length >= 2 ? 
    (data[data.length - 1].calories - data[0].calories) > 0 ? 'up' : 'down' : 'stable';

  // Couleur de la ligne basée sur l'objectif
  const lineColor = objective === 'fat_loss' ? '#EF4444' :
                   objective === 'muscle_gain' ? '#22C55E' : '#10B981';

  return (
    <div className={isPerformanceMode ? '' : 'chart-enter'}>
      <GlassCard 
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(8, 145, 178, 0.06) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(6, 182, 212, 0.25)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(6, 182, 212, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        }}
      >
        {/* Header néo-onglo intégré */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #06B6D4 30%, transparent), color-mix(in srgb, #06B6D4 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #06B6D4 40%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #06B6D4 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.LineChart} size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Tendances Nutritionnelles</h3>
              <p className="text-cyan-200 text-sm">Évolution de vos habitudes alimentaires</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <SpatialIcon 
                Icon={trend === 'up' ? ICONS.TrendingUp : 
                      trend === 'down' ? ICONS.TrendingUp : ICONS.Minus} 
                size={14} 
                className={trend === 'up' ? 'text-green-400' : 
                          trend === 'down' ? 'text-red-400' : 'text-gray-400'}
                style={{ 
                  transform: trend === 'down' ? 'rotate(180deg)' : 'none' 
                }}
              />
              <span className="text-white font-bold">{avgCalories}</span>
            </div>
            <div className="text-white/60 text-xs">Moyenne kcal/jour</div>
          </div>
        </div>

        {/* Graphique */}
        <div className="h-64" style={{ minHeight: '256px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#22C55E" stopOpacity={1} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth={1}
              />
              
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                dy={10}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                dx={-10}
              />
              
              {/* Ligne de référence pour l'objectif */}
              <ReferenceLine 
                y={targetCalories} 
                stroke="rgba(96, 165, 250, 0.6)" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                type="monotone"
                dataKey="calories"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                fill="url(#calorieGradient)"
                dot={{
                  fill: lineColor,
                  strokeWidth: 2,
                  stroke: 'rgba(255,255,255,0.8)',
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  fill: lineColor,
                  stroke: 'rgba(255,255,255,0.9)',
                  strokeWidth: 2,
                  filter: isPerformanceMode ? 'none' : `drop-shadow(0 0 8px ${lineColor}80)`
                }}
                animationDuration={isPerformanceMode || reduceMotion ? 0 : 1500}
                animationEasing="ease-out"
                isAnimationActive={!isPerformanceMode && !reduceMotion}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistiques Rapides */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{maxCalories}</div>
            <div className="text-white/60 text-xs">Maximum</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{targetCalories}</div>
            <div className="text-white/60 text-xs">Objectif</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">{minCalories}</div>
            <div className="text-white/60 text-xs">Minimum</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CalorieTrendChart;