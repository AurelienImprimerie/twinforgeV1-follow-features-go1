import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface MacroData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  target: number;
}

interface MacroDistributionChartProps {
  data: MacroData[];
  profile?: any;
}

/**
 * Custom Tooltip Component - VisionOS 26 Style
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div
      className="p-4 rounded-xl border backdrop-blur-xl"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, ${data.color} 15%, transparent) 0%, transparent 60%),
          rgba(11, 14, 23, 0.95)
        `,
        borderColor: `color-mix(in srgb, ${data.color} 30%, transparent)`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px color-mix(in srgb, ${data.color} 20%, transparent)`
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="text-white font-semibold text-sm">{data.name}</span>
        </div>
        <div className="text-white/80 text-sm">
          <div>{data.value}g ({data.percentage}%)</div>
          <div className="text-white/60 text-xs">Cible: {data.target}%</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Legend Component - VisionOS 26 Style
 */
const CustomLegend = ({ payload }: any) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <MotionDiv
          key={index}
          className="flex items-center gap-2"
          {...(!isPerformanceMode && {
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.4, delay: index * 0.1 }
          })}
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: entry.color,
              boxShadow: `0 0 8px ${entry.color}60`
            }}
          />
          <span className="text-white/80 text-sm font-medium">{entry.value}</span>
        </MotionDiv>
      ))}
    </div>
  );
};

/**
 * Macro Distribution Chart - Graphique de Distribution des Macronutriments VisionOS 26
 * Visualisation élégante de la répartition des macros avec comparaison aux cibles
 */
const MacroDistributionChart: React.FC<MacroDistributionChartProps> = ({
  data,
  profile,
}) => {
  const reduceMotion = useReducedMotion();
  const { isPerformanceMode } = usePerformanceMode();

  // Calculer le score d'équilibre global
  const balanceScore = React.useMemo(() => {
    const scores = data.map(macro => {
      const diff = Math.abs(macro.percentage - macro.target);
      return Math.max(0, 100 - (diff * 2)); // Pénalité de 2 points par % d'écart
    });
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [data]);

  // Déterminer la couleur du score
  const scoreColor = balanceScore >= 80 ? '#22C55E' :
                    balanceScore >= 60 ? '#F59E0B' : '#EF4444';

  // Don't render if no data
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return null;
  }

  return (
    <div className={isPerformanceMode ? '' : 'chart-enter-right'}>
      <GlassCard 
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(249, 115, 22, 0.06) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(245, 158, 11, 0.25)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(245, 158, 11, 0.1),
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
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 30%, transparent), color-mix(in srgb, #F59E0B 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.BarChart3} size={20} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Distribution Nutritionnelle</h3>
              <p className="text-orange-200 text-sm">Répartition de vos macronutriments</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: scoreColor,
                  boxShadow: `0 0 8px ${scoreColor}60`
                }}
              />
              <span className="text-white font-bold text-lg">{balanceScore}</span>
            </div>
            <div className="text-white/60 text-xs">Score Équilibre</div>
          </div>
        </div>

        {/* Graphique en Donut */}
        <div className="h-64 relative mb-6" style={{ minHeight: '256px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <PieChart>
              <defs>
                {data.map((macro, index) => (
                  <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={macro.color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={macro.color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                dataKey="percentage"
                animationDuration={isPerformanceMode || reduceMotion ? 0 : 1200}
                animationEasing="ease-out"
                isAnimationActive={!isPerformanceMode && !reduceMotion}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index})`}
                    stroke={entry.color}
                    strokeWidth={1}
                    style={{
                      filter: `drop-shadow(0 0 8px ${entry.color}40)`
                    }}
                  />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centre du Donut - Score Global */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div
                className={isPerformanceMode ? 'text-2xl font-bold text-white mb-1' : 'text-2xl font-bold text-white mb-1 score-scale-enter'}
                style={isPerformanceMode ? {} : { animationDelay: '0.8s' }}
              >
                {balanceScore}
              </div>
              <div className="text-white/60 text-xs">Équilibre</div>
            </div>
          </div>
        </div>

        {/* Légende Personnalisée */}
        <div className="grid grid-cols-3 gap-4">
          {data.map((macro, index) => (
            <div
              key={macro.name}
              className={isPerformanceMode ? 'text-center p-4 rounded-xl' : 'text-center p-4 rounded-xl legend-item-enter'}
              style={{
                background: `color-mix(in srgb, ${macro.color} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${macro.color} 20%, transparent)`,
                ...(!isPerformanceMode && { animationDelay: `${0.6 + index * 0.1}s` })
              }}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: macro.color }}
                />
                <span className="text-white font-medium text-sm">{macro.name}</span>
              </div>
              <div className="space-y-2">
                <div className="text-white font-bold">{Math.round(macro.percentage)}%</div>
                <div className="text-white/60 text-xs">
                  {Math.round(macro.value)}g • Cible: {Math.round(macro.target)}%
                </div>
                <div className="text-xs mt-1">
                  {Math.abs(Math.round(macro.percentage) - Math.round(macro.target)) <= 5 ? (
                    <span className="text-green-400">✓ Optimal</span>
                  ) : Math.round(macro.percentage) > Math.round(macro.target) ? (
                    <span className="text-orange-400">↑ Élevé</span>
                  ) : (
                    <span className="text-blue-400">↓ Faible</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default MacroDistributionChart;