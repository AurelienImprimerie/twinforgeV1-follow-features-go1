import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { format, parseISO, startOfWeek, getDay } from 'date-fns';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import type { FastingConsistencyData } from '../../hooks/useFastingProgressionData';

interface FastingHeatmapProps {
  data: FastingConsistencyData[];
  periodDays: number;
  className?: string;
}

/**
 * Get intensity color based on fasting hours
 */
function getIntensityColor(totalHours: number, outcome: FastingConsistencyData['outcome']): {
  color: string;
  intensity: number;
} {
  if (outcome === 'none' || totalHours === 0) {
    return { color: 'rgba(255, 255, 255, 0.1)', intensity: 0 };
  }

  // Color based on outcome, intensity based on hours
  const baseColor = outcome === 'success' ? '#22C55E' : 
                   outcome === 'partial' ? '#F59E0B' : '#EF4444';
  
  // Intensity based on hours (0-24h range)
  const intensity = Math.min(1, totalHours / 24);
  
  return { color: baseColor, intensity: Math.max(0.3, intensity) };
}

/**
 * Get day of week label
 */
function getDayLabel(dayIndex: number): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[dayIndex] || '';
}

/**
 * Get month label for the first day of each month
 */
function getMonthLabel(date: string): string | null {
  const parsedDate = parseISO(date);
  const dayOfMonth = parsedDate.getDate();
  
  // Show month label only on the 1st or if it's the first day in our data
  if (dayOfMonth === 1) {
    return format(parsedDate, 'MMM');
  }
  
  return null;
}

/**
 * Fasting Heatmap - Carte de Chaleur du Jeûne
 * Visualisation type GitHub des sessions de jeûne quotidiennes
 */
const FastingHeatmap: React.FC<FastingHeatmapProps> = ({
  data,
  periodDays,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  // Organize data into weeks for heatmap display
  const heatmapWeeks = React.useMemo(() => {
    const weeks: FastingConsistencyData[][] = [];
    let currentWeek: FastingConsistencyData[] = [];
    
    // Fill in missing days at the start to align with week start
    const firstDate = data[0] ? parseISO(data[0].date) : new Date();
    const firstDayOfWeek = getDay(firstDate);
    
    // Add empty days to align with Sunday start
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        hasFasted: false,
        totalHours: 0,
        sessionsCount: 0,
        averageDuration: 0,
        outcome: 'none'
      });
    }
    
    data.forEach((day, index) => {
      currentWeek.push(day);
      
      // Start new week on Sunday (index 6)
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Add remaining days to last week
    if (currentWeek.length > 0) {
      // Fill remaining days of the week
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          hasFasted: false,
          totalHours: 0,
          sessionsCount: 0,
          averageDuration: 0,
          outcome: 'none'
        });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [data]);

  // Calculate heatmap statistics
  const heatmapStats = React.useMemo(() => {
    const activeDays = data.filter(d => d.hasFasted);
    const totalHours = activeDays.reduce((sum, d) => sum + d.totalHours, 0);
    const maxDayHours = Math.max(0, ...data.map(d => d.totalHours));
    const activeDaysCount = activeDays.length;
    
    return {
      activeDaysCount,
      totalHours: Math.round(totalHours * 10) / 10,
      maxDayHours: Math.round(maxDayHours * 10) / 10,
      averageDayHours: activeDaysCount > 0 ? Math.round((totalHours / activeDaysCount) * 10) / 10 : 0
    };
  }, [data]);

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.4 }
      })}
      className={className}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #A855F7 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #8B5CF6 25%, transparent)',
          boxShadow: isPerformanceMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, #8B5CF6 15%, transparent),
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
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
                  boxShadow: isPerformanceMode ? 'none' : '0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Calendar} size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Heatmap du Jeûne</h3>
                <p className="text-white/80 text-sm">
                  {periodDays} derniers jours • {heatmapStats.activeDaysCount} jours actifs
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-white font-bold text-lg">
                  {heatmapStats.totalHours}h
                </span>
              </div>
              <div className="text-purple-300 text-xs">Total</div>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              {/* Days of week labels */}
              <div className="w-8" /> {/* Spacer for month labels */}
              <div className="grid grid-cols-7 gap-1 flex-1">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="text-center text-xs text-white/60 font-medium">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap weeks */}
            <div className="space-y-1">
              {heatmapWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex items-center gap-4">
                  {/* Month label */}
                  <div className="w-8 text-xs text-white/60 text-right">
                    {week[0]?.date ? getMonthLabel(week[0].date) : ''}
                  </div>
                  
                  {/* Week days */}
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    {week.map((day, dayIndex) => {
                      if (!day.date) {
                        return <div key={dayIndex} className="aspect-square" />;
                      }
                      
                      const { color, intensity } = getIntensityColor(day.totalHours, day.outcome);
                      
                      return (
                        <MotionDiv
                          key={day.date}
                          className="aspect-square rounded-sm cursor-pointer group relative"
                          style={{
                            backgroundColor: color,
                            opacity: intensity
                          }}
                          {...(!isPerformanceMode && {
                            initial: { scale: 0 },
                            animate: { scale: 1 },
                            transition: {
                              duration: 0.2,
                              delay: (weekIndex * 7 + dayIndex) * 0.01
                            },
                            whileHover: { scale: 1.2, zIndex: 10 }
                          })}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            <div className="font-medium">
                              {format(parseISO(day.date), 'dd MMM yyyy')}
                            </div>
                            <div>
                              {day.totalHours > 0 ? `${day.totalHours}h de jeûne` : 'Aucun jeûne'}
                            </div>
                            {day.sessionsCount > 0 && (
                              <div className="text-white/80">
                                {day.sessionsCount} session{day.sessionsCount > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </MotionDiv>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend and Statistics */}
          <div className="flex items-center justify-between">
            {/* Intensity Legend */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">Moins</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: '#22C55E',
                      opacity: intensity
                    }}
                  />
                ))}
              </div>
              <span className="text-white/60 text-xs">Plus</span>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <SpatialIcon Icon={ICONS.Calendar} size={10} />
                <span>{heatmapStats.activeDaysCount} jours actifs</span>
              </div>
              <div className="flex items-center gap-1">
                <SpatialIcon Icon={ICONS.Clock} size={10} />
                <span>{heatmapStats.averageDayHours}h/jour moyen</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingHeatmap;