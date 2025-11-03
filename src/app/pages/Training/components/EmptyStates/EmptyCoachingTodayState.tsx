import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import { useUserStore } from '../../../../../system/store/userStore';
import { calculateTrainingCompletion } from '../../../../../system/profile/profileCompletionService';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import ProfileNudgeCTA from '../../../../../ui/components/ProfileNudgeCTA';

interface EmptyCoachingTodayStateProps {
  onStartTraining?: () => void;
}

const EmptyCoachingTodayState: React.FC<EmptyCoachingTodayStateProps> = ({
  onStartTraining
}) => {
  const navigate = useNavigate();
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const { profile } = useUserStore();

  const profileCompletion = calculateTrainingCompletion(profile);

  const handleStartSession = () => {
    if (onStartTraining) {
      onStartTraining();
    } else {
      navigate('/training');
    }
  };

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      })}
      className="text-center py-12 py-1"
    >
      {!profileCompletion.isSufficient && (
        <div className="mb-6">
          <ProfileNudgeCTA
            completion={profileCompletion}
            forgeName="le coaching personnalisé"
            forgeColor="#18E3FF"
          />
        </div>
      )}

      <GlassCard
        className="p-8"
        style={{
          background: `radial-gradient(ellipse at center,
            rgba(24, 227, 255, 0.15) 0%,
            rgba(6, 182, 212, 0.08) 50%,
            rgba(0, 0, 0, 0.4) 100%)`,
          borderColor: 'rgba(24, 227, 255, 0.3)',
          boxShadow: `
            0 0 30px rgba(24, 227, 255, 0.2),
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          backdropFilter: 'blur(20px) saturate(1.2)'
        }}
      >
        <div className="space-y-6 flex flex-col items-center">
          <div
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
            style={{
              background: `radial-gradient(circle,
                rgba(24, 227, 255, 0.3) 0%,
                rgba(6, 182, 212, 0.15) 70%,
                transparent 100%)`,
              border: '1px solid rgba(24, 227, 255, 0.4)',
              boxShadow: `
                0 0 25px rgba(24, 227, 255, 0.3),
                0 4px 20px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.Dumbbell}
              size={48}
              className="text-cyan-400"
              style={{
                filter: `drop-shadow(0 0 12px rgba(24, 227, 255, 0.8))
                         drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))`
              }}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Commencez votre coaching personnalisé
            </h2>
            <p className="text-white/70 text-lg">
              Forgez votre première séance personnalisée
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="text-center space-y-3">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle,
                    rgba(24, 227, 255, 0.3) 0%,
                    rgba(6, 182, 212, 0.1) 70%,
                    transparent 100%)`,
                  border: '1px solid rgba(24, 227, 255, 0.4)',
                  boxShadow: `
                    0 0 20px rgba(24, 227, 255, 0.3),
                    0 4px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Zap}
                  size={24}
                  className="text-cyan-400"
                  style={{
                    filter: `drop-shadow(0 0 8px rgba(24, 227, 255, 0.6))
                             drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                  }}
                />
              </div>
              <h3 className="font-semibold text-white">Forge instantanée</h3>
              <p className="text-white/60 text-sm">
                Séances forgées en temps réel selon vos objectifs
              </p>
            </div>

            <div className="text-center space-y-3">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle,
                    rgba(24, 227, 255, 0.3) 0%,
                    rgba(6, 182, 212, 0.1) 70%,
                    transparent 100%)`,
                  border: '1px solid rgba(24, 227, 255, 0.4)',
                  boxShadow: `
                    0 0 20px rgba(24, 227, 255, 0.3),
                    0 4px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Brain}
                  size={24}
                  className="text-cyan-400"
                  style={{
                    filter: `drop-shadow(0 0 8px rgba(24, 227, 255, 0.6))
                             drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                  }}
                />
              </div>
              <h3 className="font-semibold text-white">Forge Évolutive</h3>
              <p className="text-white/60 text-sm">
                Programmes forgés et raffinés avec vos performances
              </p>
            </div>

            <div className="text-center space-y-3">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle,
                    rgba(24, 227, 255, 0.3) 0%,
                    rgba(6, 182, 212, 0.1) 70%,
                    transparent 100%)`,
                  border: '1px solid rgba(24, 227, 255, 0.4)',
                  boxShadow: `
                    0 0 20px rgba(24, 227, 255, 0.3),
                    0 4px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Play}
                  size={24}
                  className="text-cyan-400"
                  style={{
                    filter: `drop-shadow(0 0 8px rgba(24, 227, 255, 0.6))
                             drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                  }}
                />
              </div>
              <h3 className="font-semibold text-white">Coaching en direct</h3>
              <p className="text-white/60 text-sm">
                Guidage vocal et visuel pendant l'exercice
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStartSession}
              className="group relative px-8 py-4 text-white font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg,
                  rgba(24, 227, 255, 0.8) 0%,
                  rgba(6, 182, 212, 0.9) 100%)`,
                border: '2px solid rgba(24, 227, 255, 0.6)',
                boxShadow: `
                  0 0 30px rgba(24, 227, 255, 0.4),
                  0 8px 25px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `,
                backdropFilter: 'blur(10px) saturate(1.2)'
              }}
            >
              <div className="flex items-center gap-3">
                <SpatialIcon
                  Icon={ICONS.Plus}
                  size={24}
                  className="group-hover:rotate-90 transition-transform duration-300"
                  style={{
                    color: 'white',
                    filter: `drop-shadow(0 0 10px rgba(24, 227, 255, 0.8))
                             drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3))`
                  }}
                />
                <span className="text-lg">Forger ma première séance</span>
              </div>

              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"
                style={{
                  background: `linear-gradient(135deg,
                    rgba(24, 227, 255, 0.6) 0%,
                    rgba(6, 182, 212, 0.6) 100%)`
                }}
              ></div>
            </button>
          </div>

          <div
            className="text-white/50 text-sm p-3 rounded-xl"
            style={{
              background: `radial-gradient(ellipse at center,
                rgba(24, 227, 255, 0.1) 0%,
                transparent 70%)`,
              border: '1px solid rgba(24, 227, 255, 0.2)',
              boxShadow: `0 0 15px rgba(24, 227, 255, 0.1)`
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <SpatialIcon
                Icon={ICONS.Lightbulb}
                size={16}
                className="text-cyan-400"
                style={{
                  filter: `drop-shadow(0 0 6px rgba(24, 227, 255, 0.6))`
                }}
              />
              <span>
                Astuce : Complétez votre profil pour des programmes ultra-personnalisés !
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default EmptyCoachingTodayState;
