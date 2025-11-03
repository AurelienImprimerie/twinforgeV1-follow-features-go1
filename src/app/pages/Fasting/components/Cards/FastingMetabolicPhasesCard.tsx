import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { 
  getCurrentFastingPhase, 
  getPhaseProgress, 
  getNextFastingPhase,
  estimateCaloriesBurnedInPhase,
  getMotivationalMessage,
  FASTING_PHASES,
  type FastingPhase 
} from '@/lib/nutrition/fastingPhases';

interface FastingMetabolicPhasesCardProps {
  elapsedSeconds: number;
  targetHours: number;
  userWeight?: number;
}

/**
 * Fasting Metabolic Phases Card - Phases Métaboliques du Jeûne
 * Affiche la phase actuelle du jeûne avec ses bénéfices et progression
 */
const FastingMetabolicPhasesCard: React.FC<FastingMetabolicPhasesCardProps> = ({
  elapsedSeconds,
  targetHours,
  userWeight = 70
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  // Conditional motion component
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const elapsedHours = elapsedSeconds / 3600;
  const currentPhase = getCurrentFastingPhase(elapsedHours);
  const phaseProgress = getPhaseProgress(elapsedHours, currentPhase);
  const nextPhase = getNextFastingPhase(currentPhase);
  const estimatedCalories = estimateCaloriesBurnedInPhase(currentPhase, elapsedHours, userWeight);
  const motivationalMessage = getMotivationalMessage(currentPhase, elapsedHours);

  // Calculer le temps restant jusqu'à la prochaine phase
  const getTimeToNextPhase = (): string => {
    if (!nextPhase) return '';
    const [, maxHours] = currentPhase.durationRange;
    const hoursToNext = maxHours - elapsedHours;
    if (hoursToNext <= 0) return '';
    
    const hours = Math.floor(hoursToNext);
    const minutes = Math.floor((hoursToNext - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const timeToNextPhase = getTimeToNextPhase();

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, ${currentPhase.color} 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, ${currentPhase.color} 8%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: `color-mix(in srgb, ${currentPhase.color} 30%, transparent)`,
        boxShadow: isPerformanceMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, ${currentPhase.color} 20%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
        backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(160%)'
      }}
    >
      <div className="space-y-6">
        {/* Header de la Phase */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${!isPerformanceMode ? 'breathing-icon' : ''}`}
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, ${currentPhase.color} 40%, transparent), color-mix(in srgb, ${currentPhase.color} 30%, transparent))
                `,
                border: `2px solid color-mix(in srgb, ${currentPhase.color} 60%, transparent)`,
                boxShadow: isPerformanceMode ? 'none' : `0 0 25px color-mix(in srgb, ${currentPhase.color} 50%, transparent)`
              }}
            >
              <SpatialIcon
                Icon={ICONS[currentPhase.icon]}
                size={20}
                style={{ color: currentPhase.color }}
                variant="pure"
              />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">{currentPhase.name}</h3>
              <p className="text-white/70 text-sm">{currentPhase.metabolicState}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  background: currentPhase.color,
                  boxShadow: `0 0 8px ${currentPhase.color}60`
                }} 
              />
              <span className="text-white font-bold text-lg">
                {Math.round(phaseProgress)}%
              </span>
            </div>
            <div className="text-white/60 text-xs">Phase Active</div>
          </div>
        </div>

        {/* Description de la Phase */}
        <div className="space-y-3">
          <p className="text-white/85 text-base leading-relaxed">
            {currentPhase.description}
          </p>
          
          {/* Message Motivationnel */}
          <div 
            className="p-4 rounded-xl"
            style={{
              background: `color-mix(in srgb, ${currentPhase.color} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${currentPhase.color} 20%, transparent)`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.Heart} size={14} style={{ color: currentPhase.color }} />
              <span className="text-sm font-semibold" style={{ color: currentPhase.color }}>
                Message de la Forge
              </span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              {motivationalMessage}
            </p>
          </div>
        </div>

        {/* Métriques de la Phase */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Calories Estimées */}
          <div className="text-center p-4 rounded-xl" style={{
            background: `color-mix(in srgb, #EF4444 10%, transparent)`,
            border: `1px solid color-mix(in srgb, #EF4444 20%, transparent)`
          }}>
            <div className="text-2xl font-bold text-red-400 mb-1">
              {estimatedCalories}
            </div>
            <div className="text-red-300 text-sm font-medium">Calories</div>
            <div className="text-white/50 text-xs mt-1">Brûlées</div>
          </div>

          {/* Taux de Combustion */}
          <div className="text-center p-4 rounded-xl" style={{
            background: `color-mix(in srgb, ${currentPhase.color} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${currentPhase.color} 20%, transparent)`
          }}>
            <div className="text-lg font-bold text-white mb-1">
              {currentPhase.caloriesBurnRate === 'low' ? '🔥' :
               currentPhase.caloriesBurnRate === 'medium' ? '🔥🔥' :
               currentPhase.caloriesBurnRate === 'high' ? '🔥🔥🔥' : '🔥🔥🔥🔥'}
            </div>
            <div className="text-sm font-medium" style={{ color: currentPhase.color }}>
              {currentPhase.caloriesBurnRate === 'low' ? 'Faible' :
               currentPhase.caloriesBurnRate === 'medium' ? 'Modéré' :
               currentPhase.caloriesBurnRate === 'high' ? 'Élevé' : 'Maximal'}
            </div>
            <div className="text-white/50 text-xs mt-1">Taux</div>
          </div>

          {/* Prochaine Phase */}
          {nextPhase && timeToNextPhase && (
            <div className="text-center p-4 rounded-xl" style={{
              background: `color-mix(in srgb, ${nextPhase.color} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${nextPhase.color} 20%, transparent)`
            }}>
              <div className="text-lg font-bold text-white mb-1">
                {timeToNextPhase}
              </div>
              <div className="text-sm font-medium" style={{ color: nextPhase.color }}>
                Prochaine Phase
              </div>
              <div className="text-white/50 text-xs mt-1">{nextPhase.name}</div>
            </div>
          )}
        </div>

        {/* Bénéfices de la Phase Actuelle */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Check} size={16} style={{ color: currentPhase.color }} />
            Bénéfices Actuels
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentPhase.benefits.map((benefit, index) => (
              <MotionDiv
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{
                  background: `color-mix(in srgb, ${currentPhase.color} 6%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${currentPhase.color} 15%, transparent)`
                }}
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, x: -10 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.4, delay: index * 0.1 }
                })}
              >
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0" 
                  style={{ background: currentPhase.color }} 
                />
                <span className="text-white/80 text-sm">{benefit}</span>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Progression dans la Phase */}
        <div>
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Progression dans {currentPhase.name}</span>
            <span>{Math.round(phaseProgress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <MotionDiv
              className="h-2 rounded-full relative overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${currentPhase.color}, color-mix(in srgb, ${currentPhase.color} 80%, white))`,
                boxShadow: isPerformanceMode ? 'none' : `0 0 8px color-mix(in srgb, ${currentPhase.color} 60%, transparent)`,
                width: `${phaseProgress}%`
              }}
              {...(!isPerformanceMode && {
                initial: { width: 0 },
                animate: { width: `${phaseProgress}%` },
                transition: { duration: 0.8, ease: "easeOut" }
              })}
            >
              {!isPerformanceMode && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg,
                      transparent 0%,
                      rgba(255,255,255,0.4) 50%,
                      transparent 100%
                    )`,
                    animation: 'progressShimmer 2s ease-in-out infinite'
                  }}
                />
              )}
            </MotionDiv>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default FastingMetabolicPhasesCard;