import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { format, parseISO } from 'date-fns';
import type { FastingConsistencyData } from '../../hooks/useFastingProgressionData';

interface FastingConsistencyChartProps {
  data: FastingConsistencyData[];
  periodDays: number;
  className?: string;
}

/**
 * Get outcome color for consistency visualization
 */
function getOutcomeColor(outcome: FastingConsistencyData['outcome']): string {
  switch (outcome) {
    case 'success': return '#22C55E';
    case 'partial': return '#F59E0B';
    case 'missed': return '#EF4444';
    case 'none': return 'rgba(255, 255, 255, 0.1)';
  }
}

/**
 * Get outcome label for accessibility
 */
function getOutcomeLabel(outcome: FastingConsistencyData['outcome']): string {
  switch (outcome) {
    case 'success': return 'Succès';
    case 'partial': return 'Partiel';
    case 'missed': return 'Manqué';
    case 'none': return 'Aucun jeûne';
  }
}

/**
 * Fasting Consistency Chart - Graphique de Régularité du Jeûne
 * Visualise la consistance du jeûne sur la période sélectionnée
 */
const FastingConsistencyChart: React.FC<FastingConsistencyChartProps> = ({
  data,
  periodDays,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  // Calculate weekly consistency if period is long enough
  const weeklyData = React.useMemo(() => {
    if (periodDays < 14) return null;
    
    const weeks: Array<{
      weekStart: string;
      weekEnd: string;
      sessionsCount: number;
      totalHours: number;
      successRate: number;
    }> = [];
    
    for (let i = 0; i < data.length; i += 7) {
      const weekData = data.slice(i, i + 7);
      const sessionsCount = weekData.reduce((sum, day) => sum + day.sessionsCount, 0);
      const totalHours = weekData.reduce((sum, day) => sum + day.totalHours, 0);
      const successfulDays = weekData.filter(day => day.outcome === 'success').length;
      const successRate = (successfulDays / 7) * 100;
      
      weeks.push({
        weekStart: weekData[0]?.date || '',
        weekEnd: weekData[weekData.length - 1]?.date || '',
        sessionsCount,
        totalHours: Math.round(totalHours * 10) / 10,
        successRate: Math.round(successRate)
      });
    }
    
    return weeks;
  }, [data, periodDays]);

  // Calculate overall statistics
  const stats = React.useMemo(() => {
    const totalDays = data.length;
    const fastedDays = data.filter(d => d.hasFasted).length;
    const successfulDays = data.filter(d => d.outcome === 'success').length;
    const partialDays = data.filter(d => d.outcome === 'partial').length;
    
    return {
      totalDays,
      fastedDays,
      successfulDays,
      partialDays,
      consistencyRate: totalDays > 0 ? Math.round((fastedDays / totalDays) * 100) : 0,
      successRate: fastedDays > 0 ? Math.round((successfulDays / fastedDays) * 100) : 0
    };
  }, [data]);

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
      })}
      className={className}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #3B82F6 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #06B6D4 25%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #06B6D4 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
        }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #06B6D4 35%, transparent), color-mix(in srgb, #06B6D4 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #06B6D4 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #06B6D4 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.BarChart3} size={20} style={{ color: '#06B6D4' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Régularité du Jeûne</h3>
                <p className="text-white/80 text-sm">
                  {periodDays} derniers jours • {stats.fastedDays}/{stats.totalDays} jours avec jeûne
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-white font-bold text-lg">
                  {stats.consistencyRate}%
                </span>
              </div>
              <div className="text-cyan-300 text-xs">Régularité</div>
            </div>
          </div>

          {/* Daily Consistency Visualization */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Calendar} size={16} className="text-cyan-400" />
              Consistance Quotidienne
            </h4>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {data.slice(-49).map((day, index) => { // Show last 7 weeks max
                const color = getOutcomeColor(day.outcome);
                const opacity = day.outcome === 'none' ? 0.3 : 0.8;
                
                return (
                  <MotionDiv
                    key={day.date}
                    className="aspect-square rounded-lg flex items-center justify-center relative group cursor-pointer"
                    style={{
                      backgroundColor: color,
                      opacity
                    }}
                    {...(!isPerformanceMode && {
                      initial: { scale: 0, opacity: 0 },
                      animate: { scale: 1, opacity },
                      transition: { duration: 0.3, delay: index * 0.02 }
                    })}
                    title={`${format(parseISO(day.date), 'dd/MM')} - ${getOutcomeLabel(day.outcome)} ${
                      day.totalHours > 0 ? `(${day.totalHours}h)` : ''
                    }`}
                  >
                    {day.sessionsCount > 0 && (
                      <span className="text-white text-xs font-bold">
                        {day.sessionsCount}
                      </span>
                    )}
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {format(parseISO(day.date), 'dd MMM')} - {getOutcomeLabel(day.outcome)}
                      {day.totalHours > 0 && ` (${day.totalHours}h)`}
                    </div>
                  </MotionDiv>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-green-300">Succès</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-orange-300">Partiel</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-red-300">Manqué</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-white/20" />
                <span className="text-white/60">Aucun</span>
              </div>
            </div>
          </div>

          {/* Weekly Summary (if applicable) */}
          {weeklyData && weeklyData.length > 1 && (
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.CalendarRange} size={16} className="text-cyan-400" />
                Résumé Hebdomadaire
              </h4>
              
              <div className="space-y-2">
                {weeklyData.slice(-4).map((week, index) => ( // Show last 4 weeks
                  <MotionDiv
                    key={week.weekStart}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    {...(!isPerformanceMode && {
                      initial: { opacity: 0, x: -20 },
                      animate: { opacity: 1, x: 0 },
                      transition: { duration: 0.4, delay: index * 0.1 }
                    })}
                  >
                    <div>
                      <div className="text-white font-medium text-sm">
                        Semaine du {format(parseISO(week.weekStart), 'dd MMM')}
                      </div>
                      <div className="text-white/60 text-xs">
                        {week.sessionsCount} sessions • {week.totalHours}h total
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: week.successRate >= 70 ? 'color-mix(in srgb, #22C55E 15%, transparent)' :
                                         week.successRate >= 40 ? 'color-mix(in srgb, #F59E0B 15%, transparent)' :
                                         'color-mix(in srgb, #EF4444 15%, transparent)',
                          color: week.successRate >= 70 ? '#22C55E' :
                                week.successRate >= 40 ? '#F59E0B' : '#EF4444'
                        }}
                      >
                        {week.successRate}% succès
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          )}

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #22C55E 10%, transparent)',
              border: '1px solid color-mix(in srgb, #22C55E 20%, transparent)'
            }}>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.successfulDays}
              </div>
              <div className="text-green-300 text-sm font-medium">Jours Réussis</div>
            </div>

            <div className="text-center p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
              border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)'
            }}>
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {stats.partialDays}
              </div>
              <div className="text-orange-300 text-sm font-medium">Jours Partiels</div>
            </div>

            <div className="text-center p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #06B6D4 10%, transparent)',
              border: '1px solid color-mix(in srgb, #06B6D4 20%, transparent)'
            }}>
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {stats.consistencyRate}%
              </div>
              <div className="text-cyan-300 text-sm font-medium">Régularité</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.successRate}%
              </div>
              <div className="text-white/70 text-sm font-medium">Taux Succès</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingConsistencyChart;