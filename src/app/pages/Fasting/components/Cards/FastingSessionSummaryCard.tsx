import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { formatElapsedTimeHours } from '@/app/pages/Fasting/utils/fastingUtils';

interface FastingSession {
  id?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  targetHours: number;
  actualDurationHours?: number;
  protocol: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

interface FastingSessionSummaryCardProps {
  session: FastingSession | null;
  sessionOutcome: 'success' | 'partial' | 'missed';
}

/**
 * Fasting Session Summary Card - Résumé Détaillé de la Session
 * Composant dédié pour afficher les détails de la session de jeûne
 */
const FastingSessionSummaryCard: React.FC<FastingSessionSummaryCardProps> = ({
  session,
  sessionOutcome
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  if (!session) return null;

  // Couleurs dynamiques selon l'outcome
  const getOutcomeColors = () => {
    switch (sessionOutcome) {
      case 'success':
        return {
          primary: '#22C55E',
          secondary: '#10B981',
          background: 'color-mix(in srgb, #22C55E 8%, transparent)',
          border: 'color-mix(in srgb, #22C55E 20%, transparent)'
        };
      case 'partial':
        return {
          primary: '#F59E0B',
          secondary: '#EF4444',
          background: 'color-mix(in srgb, #F59E0B 8%, transparent)',
          border: 'color-mix(in srgb, #F59E0B 20%, transparent)'
        };
      case 'missed':
        return {
          primary: '#EF4444',
          secondary: '#F59E0B',
          background: 'color-mix(in srgb, #EF4444 8%, transparent)',
          border: 'color-mix(in srgb, #EF4444 20%, transparent)'
        };
    }
  };

  const colors = getOutcomeColors();
  const actualDuration = session.actualDurationHours ? formatElapsedTimeHours(session.actualDurationHours) : '0h 00m 00s';

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }
      })}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, ${colors.background} 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: colors.border,
          boxShadow: isPerformanceMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, ${colors.primary} 15%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, ${colors.primary} 35%, transparent), color-mix(in srgb, ${colors.primary} 25%, transparent))
              `,
              border: `2px solid color-mix(in srgb, ${colors.primary} 50%, transparent)`,
              boxShadow: isPerformanceMode ? 'none' : `0 0 20px color-mix(in srgb, ${colors.primary} 30%, transparent)`
            }}
          >
            <SpatialIcon Icon={ICONS.BarChart3} size={20} style={{ color: colors.primary }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Résumé de Session</h3>
            <p className="text-white/70 text-sm">Détails de votre forge temporelle</p>
          </div>
        </div>

        {/* Métriques Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Durée Réelle */}
          <MotionDiv
            className="text-center p-4 rounded-xl"
            style={{
              background: `color-mix(in srgb, ${colors.primary} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${colors.primary} 20%, transparent)`
            }}
            {...(!isPerformanceMode && {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, delay: 0.5 }
            })}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {actualDuration}
            </div>
            <div className="text-white/70 text-sm font-medium">Durée Réelle</div>
          </MotionDiv>

          {/* Objectif */}
          <MotionDiv
            className="text-center p-4 rounded-xl"
            style={{
              background: `color-mix(in srgb, ${colors.secondary} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${colors.secondary} 20%, transparent)`
            }}
            {...(!isPerformanceMode && {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, delay: 0.6 }
            })}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {session.targetHours}h
            </div>
            <div className="text-white/70 text-sm font-medium">Objectif</div>
          </MotionDiv>

          {/* Protocole */}
          <MotionDiv
            className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
            {...(!isPerformanceMode && {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, delay: 0.7 }
            })}
          >
            <div className="text-lg font-bold text-white mb-1">
              {session.protocol}
            </div>
            <div className="text-white/70 text-sm font-medium">Protocole</div>
          </MotionDiv>

          {/* Progression */}
          <MotionDiv
            className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
            {...(!isPerformanceMode && {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.5, delay: 0.8 }
            })}
          >
            <div className="text-lg font-bold text-white mb-1">
              {session.actualDurationHours && session.targetHours ? 
                Math.round((session.actualDurationHours / session.targetHours) * 100) : 0}%
            </div>
            <div className="text-white/70 text-sm font-medium">Progression</div>
          </MotionDiv>
        </div>

        {/* Détails Temporels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.Clock} size={14} className="text-white/70" />
              <span className="text-white/70 text-sm font-medium">Début</span>
            </div>
            <div className="text-white font-bold text-lg">
              {session.startTime ? format(session.startTime, 'HH:mm') : '--:--'}
            </div>
            <div className="text-white/60 text-xs mt-1">
              {session.startTime ? format(session.startTime, 'dd/MM/yyyy') : '--/--/----'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.Clock} size={14} className="text-white/70" />
              <span className="text-white/70 text-sm font-medium">Fin</span>
            </div>
            <div className="text-white font-bold text-lg">
              {session.endTime ? format(session.endTime, 'HH:mm') : '--:--'}
            </div>
            <div className="text-white/60 text-xs mt-1">
              {session.endTime ? format(session.endTime, 'dd/MM/yyyy') : '--/--/----'}
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingSessionSummaryCard;