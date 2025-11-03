/**
 * Empty Plan State Component
 * Component displayed when no meal plan is available
 */

import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import ProfileNudge from '../../../../../../ui/components/ProfileNudge';
import type { ProfileCompletionResult } from '../../../../../../system/profile/profileCompletionService';

interface EmptyPlanStateProps {
  hasContext: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
  profileCompletion: ProfileCompletionResult;
  featureGuidance: { canProceed: boolean; warningMessage?: string };
  onDismissNudge: () => void;
  nudgeDismissed: boolean;
  currentWeek: number;
  isWeekAvailable: boolean;
  weekDateRange: { formatted: string; startDate: string; endDate: string };
  setCurrentWeek: (week: number) => void;
}

/**
 * Empty Plan State Component - État Vide pour le Plan de Repas
 */
const EmptyPlanState: React.FC<EmptyPlanStateProps> = ({
  hasContext,
  onGenerate,
  isGenerating,
  profileCompletion,
  featureGuidance,
  onDismissNudge,
  nudgeDismissed,
  currentWeek,
  isWeekAvailable,
  weekDateRange,
  setCurrentWeek
}) => {
  const getTitle = () => {
    if (!isWeekAvailable) {
      return `Semaine ${currentWeek} Non Disponible`;
    }
    if (!hasContext) {
      return 'Scannez votre frigo pour commencer';
    }
    return `Forger Semaine ${currentWeek}`;
  };

  const getDescription = () => {
    if (!isWeekAvailable) {
      return `Cette semaine ne peut pas encore être forgée. Attendez que la semaine précédente soit terminée pour débloquer la planification.`;
    }
    if (!hasContext) {
      return 'Commencez par scanner votre frigo ou sélectionner un inventaire existant pour forger votre plan de repas personnalisé.';
    }
    return 'Votre plan de repas sera forgé automatiquement en organisant vos recettes sur 7 jours avec optimisation nutritionnelle.';
  };

  return (
    <div className="space-y-6">
      <GlassCard
        className="p-8 text-center"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #8B5CF6 20%, transparent)'
        }}
      >
        <div className="space-y-6 w-full text-center">
          <div className="flex justify-center items-center w-full">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center breathing-icon"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #A855F7 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
                boxShadow: `
                  0 0 30px color-mix(in srgb, #8B5CF6 40%, transparent),
                  0 0 60px color-mix(in srgb, #8B5CF6 30%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2)
                `,
                backdropFilter: 'blur(16px) saturate(150%)'
              }}
            >
              <SpatialIcon
                Icon={hasContext ? ICONS.Calendar : ICONS.Scan}
                size={48} 
                style={{ 
                  color: '#8B5CF6',
                  filter: `
                    drop-shadow(0 0 12px color-mix(in srgb, #8B5CF6 80%, transparent))
                    drop-shadow(0 0 24px color-mix(in srgb, #8B5CF6 60%, transparent))
                  `
                }}
                variant="pure"
              />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {getTitle()}
            </h3>
            <div className="text-purple-300 text-sm font-medium mb-3">
              {weekDateRange.formatted}
            </div>
            <p className="text-white/70 text-lg leading-relaxed">
              {getDescription()}
            </p>
          </div>

          {/* Three explanatory summary blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {/* Génération IA */}
            <div className="text-center space-y-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 25%, transparent), color-mix(in srgb, #A855F7 15%, transparent))
                  `,
                  border: '1px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                  boxShadow: `
                    0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
                  backdropFilter: 'blur(12px) saturate(140%)'
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Sparkles}
                  size={32} 
                  style={{ 
                    color: '#8B5CF6',
                    filter: 'drop-shadow(0 0 8px #8B5CF6)'
                  }}
                />
              </div>
              <h4 className="text-white font-semibold">Forge Nutritionnelle</h4>
              <p className="text-white/60 text-sm">Forgez des plans uniques basés sur votre inventaire</p>
            </div>

            {/* Sauvegarde */}
            <div className="text-center space-y-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 25%, transparent), color-mix(in srgb, #A855F7 15%, transparent))
                  `,
                  border: '1px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                  boxShadow: `
                    0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
                  backdropFilter: 'blur(12px) saturate(140%)'
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Save}
                  size={32} 
                  style={{ 
                    color: '#8B5CF6',
                    filter: 'drop-shadow(0 0 8px #8B5CF6)'
                  }}
                />
              </div>
              <h4 className="text-white font-semibold">Sauvegarde</h4>
              <p className="text-white/60 text-sm">Gardez vos plans favoris dans votre bibliothèque</p>
            </div>

            {/* Organisation */}
            <div className="text-center space-y-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #8B5CF6 25%, transparent), color-mix(in srgb, #A855F7 15%, transparent))
                  `,
                  border: '1px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                  boxShadow: `
                    0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
                  backdropFilter: 'blur(12px) saturate(140%)'
                }}
              >
                <SpatialIcon
                  Icon={ICONS.Search}
                  size={32} 
                  style={{ 
                    color: '#8B5CF6',
                    filter: 'drop-shadow(0 0 8px #8B5CF6)'
                  }}
                />
              </div>
              <h4 className="text-white font-semibold">Organisation</h4>
              <p className="text-white/60 text-sm">Filtrez et recherchez facilement dans vos plans</p>
            </div>
          </div>

          {/* 3D CTA Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onGenerate}
              disabled={isGenerating || !hasContext || !isWeekAvailable}
              className="group relative overflow-hidden px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: `
                  linear-gradient(135deg, 
                    color-mix(in srgb, #8B5CF6 90%, transparent) 0%,
                    color-mix(in srgb, #A855F7 80%, transparent) 50%,
                    color-mix(in srgb, #7C3AED 85%, transparent) 100%
                  )
                `,
                border: '2px solid color-mix(in srgb, #8B5CF6 70%, transparent)',
                borderRadius: '16px',
                boxShadow: `
                  0 8px 32px color-mix(in srgb, #8B5CF6 50%, transparent),
                  0 0 40px color-mix(in srgb, #8B5CF6 40%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.3),
                  inset 2px 0 0 rgba(255, 255, 255, 0.2),
                  inset -2px 0 0 rgba(0, 0, 0, 0.2)
                `,
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                transform: 'translateZ(0)',
                willChange: 'transform, box-shadow'
              }}
            >
              {/* Animated background overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      color-mix(in srgb, #8B5CF6 95%, transparent) 0%,
                      color-mix(in srgb, #A855F7 90%, transparent) 50%,
                      color-mix(in srgb, #7C3AED 95%, transparent) 100%
                    )
                  `,
                  borderRadius: '14px'
                }}
              />
              
              {/* Content */}
              <div className="relative flex items-center gap-3 z-10">
                {isGenerating ? (
                  <SpatialIcon 
                    Icon={ICONS.Loader2} 
                    size={24} 
                    className="animate-spin" 
                    style={{ 
                      color: 'white',
                      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                    }} 
                  />
                ) : (
                  <SpatialIcon 
                    Icon={hasContext ? ICONS.Calendar : ICONS.Scan} 
                    size={24} 
                    style={{ 
                      color: 'white',
                      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                    }} 
                  />
                )}
                <span className="relative">
                  {isGenerating
                    ? 'Forge en action...'
                    : hasContext
                    ? 'Forger mon plan de repas'
                    : 'Scanner mon frigo'
                  }
                </span>
              </div>

              {/* Shine effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  animation: 'shine 2s infinite',
                  borderRadius: '14px'
                }}
              />
            </button>
          </div>

          {/* Navigation Button - Return to Previous Week */}
          {currentWeek > 1 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentWeek(currentWeek - 1)}
                className="group relative overflow-hidden px-6 py-3 text-base font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      color-mix(in srgb, #6B7280 60%, transparent) 0%,
                      color-mix(in srgb, #9CA3AF 50%, transparent) 50%,
                      color-mix(in srgb, #6B7280 55%, transparent) 100%
                    )
                  `,
                  border: '2px solid color-mix(in srgb, #6B7280 50%, transparent)',
                  borderRadius: '12px',
                  boxShadow: `
                    0 4px 16px color-mix(in srgb, #6B7280 30%, transparent),
                    0 0 20px color-mix(in srgb, #6B7280 20%, transparent),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                  `,
                  backdropFilter: 'blur(16px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Hover overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        color-mix(in srgb, #6B7280 70%, transparent) 0%,
                        color-mix(in srgb, #9CA3AF 60%, transparent) 50%,
                        color-mix(in srgb, #6B7280 65%, transparent) 100%
                      )
                    `,
                    borderRadius: '10px'
                  }}
                />
                
                {/* Content */}
                <div className="relative flex items-center gap-2 z-10">
                  <SpatialIcon 
                    Icon={ICONS.ArrowLeft} 
                    size={20} 
                    style={{ 
                      color: 'white',
                      filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                    }} 
                  />
                  <span className="relative">
                    Retour à la semaine précédente
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Astuce card */}
          <div 
            className="mt-8 p-4 rounded-lg"
            style={{
              background: 'color-mix(in srgb, #8B5CF6 8%, transparent)',
              border: '1px solid color-mix(in srgb, #8B5CF6 20%, transparent)'
            }}
          >
            <div className="flex items-start gap-3">
              <SpatialIcon 
                Icon={ICONS.Lightbulb} 
                size={20} 
                className="text-purple-400 mt-0.5" 
                style={{ filter: 'drop-shadow(0 0 6px #8B5CF6)' }}
              />
              <div className="text-left">
                <h5 className="text-purple-300 font-semibold text-sm mb-1">Astuce</h5>
                <p className="text-white/70 text-sm">
                  Les plans forgés sont dynamiques. Vous pouvez les modifier et les sauvegarder pour les retrouver plus tard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .breathing-icon {
          animation: breathe 3s ease-in-out infinite;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default EmptyPlanState;