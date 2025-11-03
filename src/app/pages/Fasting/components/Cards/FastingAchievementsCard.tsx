import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

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

interface FastingAchievementsCardProps {
  session: FastingSession | null;
  sessionOutcome: 'success' | 'partial' | 'missed';
}

/**
 * Fasting Achievements Card - Accomplissements et Insights de Session
 * Composant dédié pour afficher les accomplissements et conseils post-session
 */
const FastingAchievementsCard: React.FC<FastingAchievementsCardProps> = ({
  session,
  sessionOutcome
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  if (!session) return null;

  // Contenu dynamique selon l'outcome
  const getOutcomeContent = () => {
    const completionPercentage = session.actualDurationHours && session.targetHours ? 
      Math.round((session.actualDurationHours / session.targetHours) * 100) : 0;

    switch (sessionOutcome) {
      case 'success':
        return {
          color: '#22C55E',
          icon: 'Check' as const,
          title: 'Objectif Atteint !',
          message: 'Félicitations ! Vous avez accompli votre forge temporelle avec brio. Votre discipline et votre persévérance portent leurs fruits.',
          achievements: [
            'Objectif de jeûne complètement atteint',
            'Discipline temporelle renforcée',
            'Bénéfices métaboliques optimaux',
            'Progression vers vos objectifs de bien-être'
          ],
          nextSteps: [
            'Maintenez cette régularité',
            'Considérez augmenter progressivement la durée',
            'Hydratez-vous bien après le jeûne'
          ]
        };
      case 'partial':
        return {
          color: '#F59E0B',
          icon: 'Target' as const,
          title: 'Bonne Progression !',
          message: `Vous avez accompli ${completionPercentage}% de votre objectif. C'est un excellent début ! La régularité est plus importante que la perfection.`,
          achievements: [
            'Session de jeûne initiée avec succès',
            'Première expérience de la forge temporelle',
            'Discipline en développement',
            'Base solide pour les prochaines sessions'
          ],
          nextSteps: [
            'Réessayez avec le même protocole',
            'Préparez-vous mentalement avant de commencer',
            'Restez hydraté pendant le jeûne'
          ]
        };
      case 'missed':
        return {
          color: '#EF4444',
          icon: 'Heart' as const,
          title: 'Chaque Effort Compte',
          message: `Votre session s'est arrêtée à ${completionPercentage}% de l'objectif. C'est normal ! Le jeûne intermittent demande de la pratique et de l'adaptation.`,
          achievements: [
            'Courage d\'essayer le jeûne intermittent',
            'Première approche de la discipline temporelle',
            'Expérience acquise pour les prochaines fois',
            'Écoute de votre corps et de ses besoins'
          ],
          nextSteps: [
            'Commencez par un protocole plus court',
            'Préparez votre environnement avant de jeûner',
            'Consultez les conseils de jeûne',
            'Réessayez quand vous vous sentez prêt'
          ]
        };
    }
  };

  const content = getOutcomeContent();

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 30, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }
      })}
    >
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${content.color} 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${content.color} 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${content.color} 25%, transparent)`,
          boxShadow: isPerformanceMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, ${content.color} 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MotionDiv
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, ${content.color} 35%, transparent), color-mix(in srgb, ${content.color} 25%, transparent))
              `,
              border: `2px solid color-mix(in srgb, ${content.color} 50%, transparent)`,
              boxShadow: isPerformanceMode ? 'none' : `0 0 20px color-mix(in srgb, ${content.color} 30%, transparent)`
            }}
            {...(!isPerformanceMode && {
              initial: { scale: 0, rotate: -180 },
              animate: { scale: 1, rotate: 0 },
              transition: { duration: 0.6, delay: 0.8, type: 'spring', stiffness: 200, damping: 15 }
            })}
          >
            <SpatialIcon Icon={ICONS[content.icon]} size={20} style={{ color: content.color }} />
          </MotionDiv>
          <div>
            <h3 className="text-white font-bold text-xl">{content.title}</h3>
            <p className="text-white/70 text-sm">Accomplissements de votre forge</p>
          </div>
        </div>

        {/* Message Principal */}
        <MotionDiv
          className="mb-6 p-4 rounded-xl"
          style={{
            background: `color-mix(in srgb, ${content.color} 6%, transparent)`,
            border: `1px solid color-mix(in srgb, ${content.color} 15%, transparent)`
          }}
          {...(!isPerformanceMode && {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.6, delay: 1.0 }
          })}
        >
          <div className="flex items-start gap-3">
            <SpatialIcon Icon={ICONS.Lightbulb} size={16} style={{ color: content.color }} className="mt-0.5" />
            <p className="text-white/85 text-sm leading-relaxed">
              {content.message}
            </p>
          </div>
        </MotionDiv>

        {/* Accomplissements */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Check} size={16} style={{ color: content.color }} />
            Accomplissements
          </h4>
          <div className="space-y-2">
            {content.achievements.map((achievement, index) => (
              <MotionDiv
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: `color-mix(in srgb, ${content.color} 4%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${content.color} 12%, transparent)`
                }}
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, x: -10 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.4, delay: 1.2 + index * 0.1 }
                })}
              >
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ background: content.color }}
                />
                <span className="text-white/80 text-sm">{achievement}</span>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Prochaines Étapes */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Target} size={16} style={{ color: content.color }} />
            Prochaines Étapes
          </h4>
          <div className="space-y-2">
            {content.nextSteps.map((step, index) => (
              <MotionDiv
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, x: -10 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.4, delay: 1.6 + index * 0.1 }
                })}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: `color-mix(in srgb, ${content.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${content.color} 25%, transparent)`
                }}>
                  <span className="text-xs font-bold" style={{ color: content.color }}>
                    {index + 1}
                  </span>
                </div>
                <span className="text-white/80 text-sm">{step}</span>
              </MotionDiv>
            ))}
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingAchievementsCard;