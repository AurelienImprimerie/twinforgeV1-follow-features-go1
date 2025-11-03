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

interface EmptyCoachingRecordsStateProps {
  onStartTraining?: () => void;
}

const EmptyCoachingRecordsState: React.FC<EmptyCoachingRecordsStateProps> = ({
  onStartTraining
}) => {
  const navigate = useNavigate();
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const { profile } = useUserStore();

  const profileCompletion = calculateTrainingCompletion(profile);

  const handleStartRecords = () => {
    if (onStartTraining) {
      onStartTraining();
    } else {
      navigate('/training#aujourd hui');
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
            forgeName="le suivi de records"
            forgeColor="#EF4444"
          />
        </div>
      )}

      <GlassCard
        className="p-8"
        style={{
          background: `radial-gradient(ellipse at center,
            rgba(239, 68, 68, 0.15) 0%,
            rgba(248, 113, 113, 0.08) 50%,
            rgba(0, 0, 0, 0.4) 100%)`,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          boxShadow: `
            0 0 30px rgba(239, 68, 68, 0.2),
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
                rgba(239, 68, 68, 0.3) 0%,
                rgba(248, 113, 113, 0.15) 70%,
                transparent 100%)`,
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: `
                0 0 25px rgba(239, 68, 68, 0.3),
                0 4px 20px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.Trophy}
              size={48}
              className="text-red-400"
              style={{
                filter: `drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))
                         drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))`
              }}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Établissez vos records personnels
            </h2>
            <p className="text-white/70 text-lg">
              Timeline complète de vos meilleures performances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="text-center space-y-3">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle,
                    rgba(239, 68, 68, 0.3) 0%,
                    rgba(248, 113, 113, 0.1) 70%,
                    transparent 100%)`,
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  boxShadow: `
                    0 0 20px rgba(239, 68, 68, 0.3),
                    0 4px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Award}
                  size={24}
                  className="text-red-400"
                  style={{
                    filter: `drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))
                             drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                  }}
                />
              </div>
              <h3 className="font-semibold text-white">Records personnels</h3>
              <p className="text-white/60 text-sm">
                Tous vos PR automatiquement détectés
              </p>
            </div>

            <div className="text-center space-y-3">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle,
                    rgba(239, 68, 68, 0.3) 0%,
                    rgba(248, 113, 113, 0.1) 70%,
                    transparent 100%)`,
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  boxShadow: `
                    0 0 20px rgba(239, 68, 68, 0.3),
                    0 4px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Star}
                  size={24}
                  className="text-red-400"
                  style={{
                    filter: `drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))
                             drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                  }}
                />
              </div>
              <h3 className="font-semibold text-white">Achievements & badges</h3>
              <p className="text-white/60 text-sm">
                Débloquez des récompenses uniques
              </p>
            </div>

            <div className="text-center space-y-3">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle,
                    rgba(239, 68, 68, 0.3) 0%,
                    rgba(248, 113, 113, 0.1) 70%,
                    transparent 100%)`,
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  boxShadow: `
                    0 0 20px rgba(239, 68, 68, 0.3),
                    0 4px 15px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Target}
                  size={24}
                  className="text-red-400"
                  style={{
                    filter: `drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))
                             drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                  }}
                />
              </div>
              <h3 className="font-semibold text-white">Milestones</h3>
              <p className="text-white/60 text-sm">
                Parcours et étapes clés franchies
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStartRecords}
              className="group relative px-8 py-4 text-white font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg,
                  rgba(239, 68, 68, 0.8) 0%,
                  rgba(248, 113, 113, 0.9) 100%)`,
                border: '2px solid rgba(239, 68, 68, 0.6)',
                boxShadow: `
                  0 0 30px rgba(239, 68, 68, 0.4),
                  0 8px 25px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `,
                backdropFilter: 'blur(10px) saturate(1.2)'
              }}
            >
              <div className="flex items-center gap-3">
                <SpatialIcon
                  Icon={ICONS.Trophy}
                  size={24}
                  className="group-hover:scale-110 transition-transform duration-300"
                  style={{
                    color: 'white',
                    filter: `drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))
                             drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3))`
                  }}
                />
                <span className="text-lg">Établir mon premier record</span>
              </div>

              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"
                style={{
                  background: `linear-gradient(135deg,
                    rgba(239, 68, 68, 0.6) 0%,
                    rgba(248, 113, 113, 0.6) 100%)`
                }}
              ></div>
            </button>
          </div>

          <div
            className="text-white/50 text-sm p-3 rounded-xl"
            style={{
              background: `radial-gradient(ellipse at center,
                rgba(239, 68, 68, 0.1) 0%,
                transparent 70%)`,
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: `0 0 15px rgba(239, 68, 68, 0.1)`
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <SpatialIcon
                Icon={ICONS.Lightbulb}
                size={16}
                className="text-red-400"
                style={{
                  filter: `drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))`
                }}
              />
              <span>
                Astuce : Chaque nouvelle séance peut être l'occasion d'un nouveau record !
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default EmptyCoachingRecordsState;
