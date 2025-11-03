import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { format, parseISO } from 'date-fns';
import type { FastingDurationTrend } from '../../hooks/useFastingProgressionData';

interface FastingDurationTrendChartProps {
  data: FastingDurationTrend[];
  periodDays: number;
  className?: string;
}

/**
 * Fasting Duration Trend Chart - Graphique de Tendance des Durées
 * Visualise l'évolution des durées de jeûne moyennes dans le temps
 */
const FastingDurationTrendChart: React.FC<FastingDurationTrendChartProps> = ({
  data,
  periodDays,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  // Filter data to show only days with sessions for cleaner visualization
  const filteredData = data.filter(d => d.sessionsCount > 0);
  
  // Calculate trend statistics
  const stats = React.useMemo(() => {
    if (filteredData.length === 0) {
      return {
        maxDuration: 0,
        minDuration: 0,
        averageDuration: 0,
        trend: 'stable' as const,
        improvement: 0
      };
    }

    const durations = filteredData.map(d => d.averageDuration);
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    
    // Calculate trend (compare first half vs second half)
    const midPoint = Math.floor(filteredData.length / 2);
    const firstHalf = filteredData.slice(0, midPoint);
    const secondHalf = filteredData.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length > 0 ? 
      firstHalf.reduce((sum, d) => sum + d.averageDuration, 0) / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? 
      secondHalf.reduce((sum, d) => sum + d.averageDuration, 0) / secondHalf.length : 0;
    
    const improvement = secondHalfAvg - firstHalfAvg;
    const trend = improvement > 0.5 ? 'improving' : improvement < -0.5 ? 'declining' : 'stable';

    return {
      maxDuration: Math.round(maxDuration * 10) / 10,
      minDuration: Math.round(minDuration * 10) / 10,
      averageDuration: Math.round(averageDuration * 10) / 10,
      trend,
      improvement: Math.round(improvement * 10) / 10
    };
  }, [filteredData]);

  // Get trend theme
  const getTrendTheme = () => {
    switch (stats.trend) {
      case 'improving':
        return {
          color: '#22C55E',
          icon: 'TrendingUp' as const,
          label: 'En amélioration',
          description: `+${stats.improvement}h en moyenne`
        };
      case 'declining':
        return {
          color: '#EF4444',
          icon: 'TrendingDown' as const,
          label: 'En baisse',
          description: `${stats.improvement}h en moyenne`
        };
      case 'stable':
      default:
        return {
          color: '#06B6D4',
          icon: 'Minus' as const,
          label: 'Stable',
          description: 'Durées constantes'
        };
    }
  };

  const trendTheme = getTrendTheme();

  if (filteredData.length === 0) {
    return (
      <GlassCard className={`p-6 text-center ${className}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.LineChart} size={32} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Aucune Donnée de Tendance</h3>
            <p className="text-white/70">
              Complétez quelques sessions de jeûne pour voir l'évolution de vos durées
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.2 }
      })}
      className={className}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${trendTheme.color} 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${trendTheme.color} 25%, transparent)`,
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, ${trendTheme.color} 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
        }}
      >
        <div className="space-y-6">
          {/* Header avec Tendance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${trendTheme.color} 35%, transparent), color-mix(in srgb, ${trendTheme.color} 25%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${trendTheme.color} 50%, transparent)`,
                  boxShadow: `0 0 20px color-mix(in srgb, ${trendTheme.color} 30%, transparent)`
                }}
              >
                <SpatialIcon Icon={ICONS[trendTheme.icon]} size={20} style={{ color: trendTheme.color }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Évolution des Durées</h3>
                <p className="text-white/80 text-sm">
                  {filteredData.length} jours avec données • {trendTheme.label}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div 
                className="px-3 py-1.5 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${trendTheme.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${trendTheme.color} 25%, transparent)`
                }}
              >
                <span className="text-sm font-medium" style={{ color: trendTheme.color }}>
                  {trendTheme.description}
                </span>
              </div>
            </div>
          </div>

          {/* Simple Line Chart Visualization */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <SpatialIcon Icon={ICONS.LineChart} size={16} className="text-purple-400" />
              Tendance des Durées
            </h4>
            
            <div className="relative h-32 bg-white/5 rounded-xl p-4 overflow-hidden">
              {/* Simple line visualization */}
              <div className="relative h-full flex items-end justify-between">
                {filteredData.slice(-14).map((point, index) => { // Show last 14 data points
                  const height = stats.maxDuration > 0 ? 
                    (point.averageDuration / stats.maxDuration) * 100 : 0;
                  
                  return (
                    <MotionDiv
                      key={point.date}
                      className="flex flex-col items-center group cursor-pointer"
                      style={{ width: `${100 / Math.min(filteredData.length, 14)}%` }}
                      {...(!isPerformanceMode && {
                        initial: { height: 0, opacity: 0 },
                        animate: { height: 'auto', opacity: 1 },
                        transition: { duration: 0.5, delay: index * 0.05 }
                      })}
                    >
                      <div
                        className="w-2 bg-gradient-to-t from-cyan-500 to-purple-400 rounded-full mb-1 transition-all duration-200 group-hover:w-3"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <div className="text-xs text-white/60 transform -rotate-45 origin-bottom-left whitespace-nowrap">
                        {format(parseISO(point.date), 'dd/MM')}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {format(parseISO(point.date), 'dd MMM')} - {point.averageDuration}h
                        {point.sessionsCount > 1 && ` (${point.sessionsCount} sessions)`}
                      </div>
                    </MotionDiv>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Duration Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #22C55E 10%, transparent)',
              border: '1px solid color-mix(in srgb, #22C55E 20%, transparent)'
            }}>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.maxDuration}h
              </div>
              <div className="text-green-300 text-sm font-medium">Maximum</div>
            </div>

            <div className="text-center p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #06B6D4 10%, transparent)',
              border: '1px solid color-mix(in srgb, #06B6D4 20%, transparent)'
            }}>
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {stats.averageDuration}h
              </div>
              <div className="text-cyan-300 text-sm font-medium">Moyenne</div>
            </div>

            <div className="text-center p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
              border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
            }}>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {stats.minDuration}h
              </div>
              <div className="text-purple-300 text-sm font-medium">Minimum</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingDurationTrendChart;