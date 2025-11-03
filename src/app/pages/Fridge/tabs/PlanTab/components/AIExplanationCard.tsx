import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import type { MealPlanData } from '../types';

interface AIExplanationCardProps {
  aiExplanation: MealPlanData['aiExplanation'];
  weekNumber: number;
  isLoading?: boolean;
}

/**
 * AI Explanation Card Skeleton - Loading state
 */
const AIExplanationCardSkeleton: React.FC<{ weekNumber: number }> = ({ weekNumber }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <GlassCard 
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #22C55E 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #10B981 30%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #10B981 20%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center breathing-icon animate-pulse"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #10B981 40%, transparent), color-mix(in srgb, #22C55E 30%, transparent))
              `,
              border: '3px solid color-mix(in srgb, #10B981 60%, transparent)',
              boxShadow: `
                0 0 40px color-mix(in srgb, #10B981 50%, transparent),
                0 0 80px color-mix(in srgb, #22C55E 30%, transparent),
                inset 0 3px 0 rgba(255,255,255,0.4)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.Lightbulb}
              size={32}
              style={{
                color: '#10B981',
                filter: `
                  drop-shadow(0 0 16px color-mix(in srgb, #10B981 90%, transparent))
                  drop-shadow(0 0 32px color-mix(in srgb, #10B981 70%, transparent))
                `
              }}
              variant="pure"
            />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Votre Guide Nutritionnel de la Forge
            </h3>
            <p className="text-green-200 text-lg">
              Analyse personnalisée de votre plan - Semaine {weekNumber}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Skeleton content */}
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-green-300/20 rounded-xl w-3/4"></div>
            <div className="h-16 bg-white/5 rounded-xl border border-green-400/20 p-4">
              <div className="space-y-2">
                <div className="h-3 bg-green-200/30 rounded w-full"></div>
                <div className="h-3 bg-green-200/30 rounded w-5/6"></div>
                <div className="h-3 bg-green-200/30 rounded w-4/5"></div>
              </div>
            </div>
          </div>

          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-green-300/20 rounded-xl w-2/3"></div>
            <div className="h-16 bg-white/5 rounded-xl border border-green-400/20 p-4">
              <div className="space-y-2">
                <div className="h-3 bg-green-200/30 rounded w-full"></div>
                <div className="h-3 bg-green-200/30 rounded w-3/4"></div>
                <div className="h-3 bg-green-200/30 rounded w-5/6"></div>
              </div>
            </div>
          </div>

          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-green-300/20 rounded-xl w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="h-12 bg-white/5 rounded-xl border border-green-400/20"></div>
              <div className="h-12 bg-white/5 rounded-xl border border-green-400/20"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-green-400/20">
          <div className="flex items-center justify-between text-xs text-green-200">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Sparkles} size={12} />
              <span>Forge en action...</span>
            </div>
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Clock} size={12} />
              <span className="animate-pulse">Raffinage en temps réel</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

/**
 * AI Explanation Card - Explication IA du Plan Alimentaire
 * Composant pour afficher les raisons et stratégies derrière le plan généré
 */
const AIExplanationCard: React.FC<AIExplanationCardProps> = ({
  aiExplanation,
  weekNumber,
  isLoading = false
}) => {
  // Show skeleton if loading or no explanation yet
  if (isLoading || !aiExplanation) {
    return <AIExplanationCardSkeleton weekNumber={weekNumber} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <GlassCard 
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #22C55E 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #10B981 30%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #10B981 20%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center breathing-icon"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #10B981 40%, transparent), color-mix(in srgb, #22C55E 30%, transparent))
              `,
              border: '3px solid color-mix(in srgb, #10B981 60%, transparent)',
              boxShadow: `
                0 0 40px color-mix(in srgb, #10B981 50%, transparent),
                0 0 80px color-mix(in srgb, #22C55E 30%, transparent),
                inset 0 3px 0 rgba(255,255,255,0.4)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.Lightbulb}
              size={32}
              style={{
                color: '#10B981',
                filter: `
                  drop-shadow(0 0 16px color-mix(in srgb, #10B981 90%, transparent))
                  drop-shadow(0 0 32px color-mix(in srgb, #10B981 70%, transparent))
                `
              }}
              variant="pure"
            />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Votre Guide Nutritionnel de la Forge
            </h3>
            <p className="text-green-200 text-lg">
              Analyse personnalisée de votre plan - Semaine {weekNumber}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Raisonnement Personnalisé */}
          {aiExplanation.personalizedReasoning && (
            <div>
              <h4 className="text-green-300 font-semibold text-lg mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.User} size={18} />
                Pourquoi ce plan vous convient
              </h4>
              <p className="text-green-100 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-green-400/20">
                {aiExplanation.personalizedReasoning}
              </p>
            </div>
          )}

          {/* Stratégie Nutritionnelle */}
          {aiExplanation.nutritionalStrategy && (
            <div>
              <h4 className="text-green-300 font-semibold text-lg mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Target} size={18} />
                Stratégie nutritionnelle
              </h4>
              <p className="text-green-100 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-green-400/20">
                {aiExplanation.nutritionalStrategy}
              </p>
            </div>
          )}

          {/* Points d'Adaptation */}
          {aiExplanation.adaptationHighlights && aiExplanation.adaptationHighlights.length > 0 && (
            <div>
              <h4 className="text-green-300 font-semibold text-lg mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Check} size={18} />
                Adaptations spécifiques
              </h4>
              <div className="space-y-2">
                {aiExplanation.adaptationHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-green-400/20">
                    <SpatialIcon Icon={ICONS.ArrowRight} size={14} className="text-green-400 mt-0.5" />
                    <span className="text-green-100 text-sm leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objectifs Hebdomadaires */}
          {aiExplanation.weeklyGoals && aiExplanation.weeklyGoals.length > 0 && (
            <div>
              <h4 className="text-green-300 font-semibold text-lg mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Flag} size={18} />
                
                Objectifs de la semaine
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiExplanation.weeklyGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-green-400/20">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-100 text-sm">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes de Conformité */}
          {aiExplanation.complianceNotes && aiExplanation.complianceNotes.length > 0 && (
            <div>
              <h4 className="text-green-300 font-semibold text-lg mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Shield} size={18} />
                Respect de vos contraintes
              </h4>
              <div className="space-y-2">
                {aiExplanation.complianceNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-green-400/20">
                    <SpatialIcon Icon={ICONS.CheckCircle} size={14} className="text-green-400 mt-0.5" />
                    <span className="text-green-100 text-sm leading-relaxed">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-green-400/20">
          <div className="flex items-center justify-between text-xs text-green-200">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Sparkles} size={12} />
              <span>Forgé par votre Forge Nutritionnelle</span>
            </div>
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Clock} size={12} />
              <span>Mis à jour en temps réel</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AIExplanationCard;