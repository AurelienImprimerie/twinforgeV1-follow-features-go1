import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { formatElapsedTimeHours, determineSessionOutcome, getOutcomeTheme } from '@/app/pages/Fasting/utils/fastingUtils';
import { validateFastingSession, getEducationalMessage, isScientificallyValid } from '@/lib/nutrition/fastingValidation';
import FastingSessionSummaryCard from '@/app/pages/Fasting/components/Cards/FastingSessionSummaryCard';
import FastingAchievementsCard from '@/app/pages/Fasting/components/Cards/FastingAchievementsCard';

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

interface FastingCompletionStageProps {
  session: FastingSession | null;
  targetHours: number;
  onSaveFastingSession: () => void;
}

/**
 * Fasting Completion Stage - Finalisation de la Session de Jeûne
 * Interface de félicitations et sauvegarde après une session complétée
 */
const FastingCompletionStage: React.FC<FastingCompletionStageProps> = ({
  session,
  targetHours,
  onSaveFastingSession
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion components
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  // Déterminer l'outcome de la session
  const sessionOutcome = session?.actualDurationHours ?
    determineSessionOutcome(session.actualDurationHours, session.targetHours || targetHours) :
    'missed';

  // Obtenir le thème dynamique
  const theme = getOutcomeTheme(sessionOutcome);

  // Formater la durée avec précision
  const actualDuration = session?.actualDurationHours ?
    formatElapsedTimeHours(session.actualDurationHours) :
    '0h 00m 00s';

  // Validation scientifique
  const validationResult = session?.actualDurationHours
    ? validateFastingSession(session.actualDurationHours, session.targetHours || targetHours)
    : null;

  const educationalMessage = session?.actualDurationHours
    ? getEducationalMessage(session.actualDurationHours)
    : '';

  const scientificallyValid = session?.actualDurationHours
    ? isScientificallyValid(session.actualDurationHours)
    : false;

  return (
    <div className="space-y-6">
      {/* Composant Principal de Completion */}
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, y: 40, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: {
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1]
          }
        })}
      >
        <GlassCard 
          className="p-8 text-center"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, ${theme.primaryColor} 15%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, ${theme.secondaryColor} 12%, transparent) 0%, transparent 50%),
              var(--glass-opacity)
            `,
            borderColor: `color-mix(in srgb, ${theme.primaryColor} 30%, transparent)`,
            boxShadow: isPerformanceMode
              ? '0 12px 48px rgba(0, 0, 0, 0.4)'
              : `
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 0 40px color-mix(in srgb, ${theme.primaryColor} 20%, transparent),
                0 0 80px color-mix(in srgb, ${theme.secondaryColor} 15%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.2)
              `,
            backdropFilter: isPerformanceMode ? 'none' : 'blur(28px) saturate(170%)'
          }}
        >
          <div className="space-y-6">
            {/* Icône Dynamique */}
            <div className="flex items-center justify-center w-full">
              <MotionDiv
                className="w-32 h-32 rounded-full flex items-center justify-center relative"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                    radial-gradient(circle at 70% 70%, color-mix(in srgb, ${theme.primaryColor} 20%, transparent) 0%, transparent 50%),
                    linear-gradient(135deg, color-mix(in srgb, ${theme.primaryColor} 45%, transparent), color-mix(in srgb, ${theme.secondaryColor} 35%, transparent))
                  `,
                  border: `4px solid color-mix(in srgb, ${theme.primaryColor} 70%, transparent)`,
                  boxShadow: isPerformanceMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : `
                      0 0 60px color-mix(in srgb, ${theme.primaryColor} 70%, transparent),
                      0 0 100px color-mix(in srgb, ${theme.primaryColor} 50%, transparent),
                      0 0 140px color-mix(in srgb, ${theme.secondaryColor} 40%, transparent),
                      inset 0 4px 0 rgba(255,255,255,0.5),
                      inset 0 -3px 0 rgba(0,0,0,0.2)
                    `,
                  backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(170%)',
                  WebkitBackdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(170%)',
                  margin: '0 auto'
                }}
                {...(!isPerformanceMode && {
                  initial: { scale: 0, rotate: -90 },
                  animate: { scale: 1, rotate: 0 },
                  transition: {
                    duration: 0.8,
                    delay: 0.2
                  }
                })}
              >
                <MotionDiv
                  {...(!isPerformanceMode && {
                    initial: { scale: 0, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: { duration: 0.5, delay: 0.6 }
                  })}
                >
                  <SpatialIcon
                    Icon={ICONS[theme.icon]}
                    size={64}
                    style={{
                      color: theme.primaryColor,
                      filter: `
                        drop-shadow(0 0 16px color-mix(in srgb, ${theme.primaryColor} 90%, transparent))
                        drop-shadow(0 0 32px color-mix(in srgb, ${theme.primaryColor} 70%, transparent))
                        drop-shadow(0 0 48px color-mix(in srgb, ${theme.secondaryColor} 50%, transparent))
                      `
                    }}
                    variant="pure"
                  />
                </MotionDiv>

                {/* Anneaux de Célébration */}
                {!isPerformanceMode && sessionOutcome === 'success' && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: `color-mix(in srgb, ${theme.primaryColor} 50%, transparent)` }}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 2,
                        delay: 1,
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: `color-mix(in srgb, ${theme.secondaryColor} 40%, transparent)` }}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{
                        duration: 2.5,
                        delay: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                  </>
                )}
              </MotionDiv>
            </div>

            {/* Message Dynamique */}
            <MotionDiv
              className="space-y-4"
              {...(!isPerformanceMode && {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.4 }
              })}
            >
              <MotionDiv
                className="text-3xl font-bold text-white"
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, scale: 0.8 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.6, delay: 0.5 }
                })}
              >
                {theme.title}
              </MotionDiv>
              <MotionDiv
                className="text-white/80 text-lg"
                {...(!isPerformanceMode && {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.6, delay: 0.6 }
                })}
              >
                {theme.subtitle}
              </MotionDiv>

              {/* Message éducatif scientifique */}
              {educationalMessage && (
                <MotionDiv
                  className="p-4 rounded-xl max-w-2xl mx-auto"
                  style={{
                    background: scientificallyValid
                      ? 'color-mix(in srgb, #22C55E 10%, transparent)'
                      : 'color-mix(in srgb, #F59E0B 10%, transparent)',
                    border: scientificallyValid
                      ? '1px solid color-mix(in srgb, #22C55E 30%, transparent)'
                      : '1px solid color-mix(in srgb, #F59E0B 30%, transparent)'
                  }}
                  {...(!isPerformanceMode && {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.6, delay: 0.7 }
                  })}
                >
                  <div className="flex items-start gap-3">
                    <SpatialIcon
                      Icon={scientificallyValid ? ICONS.CheckCircle : ICONS.Info}
                      size={20}
                      className={scientificallyValid ? 'text-green-400' : 'text-amber-400'}
                    />
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-semibold mb-1 ${
                        scientificallyValid ? 'text-green-300' : 'text-amber-300'
                      }`}>
                        {scientificallyValid ? 'Validation Scientifique' : 'Point d\'Amélioration'}
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {educationalMessage}
                      </p>
                    </div>
                  </div>
                </MotionDiv>
              )}

              {/* Durée Réelle avec Animation */}
              <MotionDiv
                className="text-4xl font-black"
                style={{ color: theme.primaryColor }}
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, scale: 0.5 },
                  animate: { opacity: 1, scale: 1 },
                  transition: {
                    duration: 0.8,
                    delay: 0.8
                  }
                })}
              >
                {actualDuration}
              </MotionDiv>
              <MotionDiv
                className="text-white/70 text-base"
                {...(!isPerformanceMode && {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { duration: 0.6, delay: 0.9 }
                })}
              >
                Durée réelle de votre jeûne
              </MotionDiv>
            </MotionDiv>

            {/* Bouton de Sauvegarde */}
            <MotionDiv
              className="flex justify-center"
              {...(!isPerformanceMode && {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.9 }
              })}
            >
              <button
                onClick={onSaveFastingSession}
                className="px-8 py-4 text-xl font-bold rounded-full relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg,
                    color-mix(in srgb, #3B82F6 80%, transparent),
                    color-mix(in srgb, #06B6D4 60%, transparent)
                  )`,
                  border: '3px solid color-mix(in srgb, #3B82F6 60%, transparent)',
                  boxShadow: isPerformanceMode
                    ? '0 12px 40px rgba(59, 130, 246, 0.4)'
                    : `
                      0 16px 50px color-mix(in srgb, #3B82F6 50%, transparent),
                      0 0 80px color-mix(in srgb, #3B82F6 40%, transparent),
                      inset 0 4px 0 rgba(255,255,255,0.5)
                    `,
                  backdropFilter: isPerformanceMode ? 'none' : 'blur(24px) saturate(170%)',
                  color: '#fff',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="flex items-center gap-3">
                  <SpatialIcon Icon={ICONS.Save} size={28} className="text-white" />
                  <span>Sauvegarder</span>
                </div>
              </button>
            </MotionDiv>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Résumé de Session - Composant Extrait */}
      <FastingSessionSummaryCard 
        session={session}
        sessionOutcome={sessionOutcome}
      />

      {/* Accomplissements et Conseils */}
      <FastingAchievementsCard 
        session={session}
        sessionOutcome={sessionOutcome}
      />
    </div>
  );
};

export default FastingCompletionStage;