import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FastingStreak {
  startDate: string;
  endDate: string;
  length: number;
  status: 'active' | 'completed';
}

interface FastingStreakDiagramProps {
  sessions: Array<{
    start_time: string;
    end_time: string | null;
    status: string;
  }>;
  periodDays: number;
  className?: string;
}

/**
 * Fasting Streak Diagram - Diagramme de Séries de Jeûne
 * Visualise les séries de jours consécutifs de jeûne
 */
const FastingStreakDiagram: React.FC<FastingStreakDiagramProps> = ({
  sessions,
  periodDays,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  // Calculer les streaks
  const calculateStreaks = React.useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    // Trier par date
    const sortedSessions = [...sessions]
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const streaks: FastingStreak[] = [];
    let currentStreak: FastingStreak | null = null;

    sortedSessions.forEach((session, index) => {
      const sessionDate = format(parseISO(session.start_time), 'yyyy-MM-dd');

      if (!currentStreak) {
        // Démarrer une nouvelle série
        currentStreak = {
          startDate: sessionDate,
          endDate: sessionDate,
          length: 1,
          status: 'active'
        };
      } else {
        // Vérifier si la session est consécutive
        const daysDiff = differenceInDays(
          parseISO(sessionDate),
          parseISO(currentStreak.endDate)
        );

        if (daysDiff === 1) {
          // Continuer la série
          currentStreak.endDate = sessionDate;
          currentStreak.length += 1;
        } else {
          // Terminer la série actuelle et en démarrer une nouvelle
          currentStreak.status = 'completed';
          streaks.push(currentStreak);

          currentStreak = {
            startDate: sessionDate,
            endDate: sessionDate,
            length: 1,
            status: 'active'
          };
        }
      }

      // Si c'est la dernière session, ajouter la série en cours
      if (index === sortedSessions.length - 1 && currentStreak) {
        // Vérifier si la série est toujours active (aujourd'hui ou hier)
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

        if (currentStreak.endDate === today || currentStreak.endDate === yesterday) {
          currentStreak.status = 'active';
        } else {
          currentStreak.status = 'completed';
        }

        streaks.push(currentStreak);
      }
    });

    return streaks.sort((a, b) => b.length - a.length);
  }, [sessions]);

  if (calculateStreaks.length === 0) {
    return (
      <GlassCard className={`p-6 text-center ${className}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.Flame} size={32} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Aucune Série Détectée</h3>
            <p className="text-white/70">
              Complétez des sessions de jeûne consécutives pour créer des séries
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  const currentStreak = calculateStreaks.find(s => s.status === 'active');
  const longestStreak = calculateStreaks[0]; // Déjà trié par longueur
  const totalStreaks = calculateStreaks.length;
  const averageStreakLength = calculateStreaks.reduce((sum, s) => sum + s.length, 0) / totalStreaks;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.3 }
      })}
      className={className}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #EC4899 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #8B5CF6 25%, transparent)',
          boxShadow: `
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
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #EC4899 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Flame} size={20} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Séries de Jeûne</h3>
                <p className="text-white/80 text-sm">
                  {totalStreaks} série{totalStreaks > 1 ? 's' : ''} détectée{totalStreaks > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {currentStreak && (
              <div className="text-right">
                <div
                  className="px-3 py-1.5 rounded-full mb-1"
                  style={{
                    background: 'color-mix(in srgb, #22C55E 15%, transparent)',
                    border: '1px solid color-mix(in srgb, #22C55E 25%, transparent)'
                  }}
                >
                  <span className="text-sm font-medium text-green-300">
                    🔥 Série active
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{currentStreak.length}</p>
                <p className="text-white/60 text-xs">jour{currentStreak.length > 1 ? 's' : ''}</p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl text-center" style={{
              background: 'color-mix(in srgb, #F59E0B 10%, transparent)',
              border: '1px solid color-mix(in srgb, #F59E0B 20%, transparent)'
            }}>
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {longestStreak.length}
              </div>
              <div className="text-orange-300 text-sm font-medium">Record</div>
              <div className="text-orange-200 text-xs mt-1">
                {format(parseISO(longestStreak.startDate), 'dd MMM', { locale: fr })}
              </div>
            </div>

            <div className="p-4 rounded-xl text-center" style={{
              background: 'color-mix(in srgb, #8B5CF6 10%, transparent)',
              border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
            }}>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {averageStreakLength.toFixed(1)}
              </div>
              <div className="text-purple-300 text-sm font-medium">Moyenne</div>
              <div className="text-purple-200 text-xs mt-1">
                par série
              </div>
            </div>

            <div className="p-4 rounded-xl text-center" style={{
              background: 'color-mix(in srgb, #EC4899 10%, transparent)',
              border: '1px solid color-mix(in srgb, #EC4899 20%, transparent)'
            }}>
              <div className="text-3xl font-bold text-pink-400 mb-1">
                {totalStreaks}
              </div>
              <div className="text-pink-300 text-sm font-medium">Séries</div>
              <div className="text-pink-200 text-xs mt-1">
                au total
              </div>
            </div>
          </div>

          {/* Streaks List */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <SpatialIcon Icon={ICONS.TrendingUp} size={16} className="text-purple-400" />
              Top 5 des Séries
            </h4>

            <div className="space-y-3">
              {calculateStreaks.slice(0, 5).map((streak, index) => {
                const isActive = streak.status === 'active';
                const isRecord = streak === longestStreak;

                return (
                  <MotionDiv
                    key={`${streak.startDate}-${index}`}
                    className="relative p-4 rounded-xl"
                    style={{
                      background: isActive
                        ? 'color-mix(in srgb, #22C55E 8%, transparent)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isActive
                        ? '1px solid color-mix(in srgb, #22C55E 20%, transparent)'
                        : '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                    {...(!isPerformanceMode && {
                      initial: { opacity: 0, x: -20 },
                      animate: { opacity: 1, x: 0 },
                      transition: { duration: 0.4, delay: index * 0.1 }
                    })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            background: isActive
                              ? 'linear-gradient(135deg, #22C55E, #10B981)'
                              : isRecord
                              ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                              : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                            boxShadow: isActive || isRecord
                              ? `0 0 12px ${isActive ? '#22C55E' : '#F59E0B'}80`
                              : 'none'
                          }}
                        >
                          <span className="text-white font-bold text-lg">
                            {index + 1}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-lg">
                              {streak.length} jour{streak.length > 1 ? 's' : ''}
                            </span>
                            {isRecord && (
                              <div className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/30">
                                <span className="text-orange-300 text-xs font-semibold">🏆 Record</span>
                              </div>
                            )}
                            {isActive && (
                              <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-400/30">
                                <span className="text-green-300 text-xs font-semibold">🔥 Active</span>
                              </div>
                            )}
                          </div>
                          <div className="text-white/60 text-xs mt-0.5">
                            {format(parseISO(streak.startDate), 'dd MMM', { locale: fr })} - {format(parseISO(streak.endDate), 'dd MMM', { locale: fr })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <SpatialIcon
                          Icon={ICONS.Flame}
                          size={24}
                          style={{
                            color: isActive ? '#22C55E' : isRecord ? '#F59E0B' : '#8B5CF6'
                          }}
                        />
                      </div>
                    </div>
                  </MotionDiv>
                );
              })}
            </div>
          </div>

          {/* Motivation Message */}
          <div className="p-4 rounded-xl" style={{
            background: currentStreak
              ? 'color-mix(in srgb, #22C55E 6%, transparent)'
              : 'color-mix(in srgb, #8B5CF6 6%, transparent)',
            border: currentStreak
              ? '1px solid color-mix(in srgb, #22C55E 18%, transparent)'
              : '1px solid color-mix(in srgb, #8B5CF6 18%, transparent)',
            backdropFilter: isPerformanceMode ? 'none' : 'blur(8px) saturate(120%)'
          }}>
            <div className="flex items-start gap-2">
              <SpatialIcon
                Icon={currentStreak ? ICONS.TrendingUp : ICONS.Info}
                size={14}
                style={{ color: currentStreak ? '#22C55E' : '#8B5CF6' }}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium" style={{
                  color: currentStreak ? '#22C55E' : '#8B5CF6'
                }}>
                  {currentStreak
                    ? `Série active de ${currentStreak.length} jour${currentStreak.length > 1 ? 's' : ''} !`
                    : 'Démarrez une nouvelle série'}
                </p>
                <p className="text-xs mt-1" style={{
                  color: currentStreak ? '#22C55ECC' : '#8B5CF6CC'
                }}>
                  {currentStreak
                    ? currentStreak.length >= longestStreak.length
                      ? '🎉 Nouveau record en cours ! Continuez ainsi !'
                      : `Plus que ${longestStreak.length - currentStreak.length} jour${longestStreak.length - currentStreak.length > 1 ? 's' : ''} pour égaler votre record`
                    : 'Complétez une session de jeûne aujourd\'hui pour commencer une nouvelle série'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingStreakDiagram;
