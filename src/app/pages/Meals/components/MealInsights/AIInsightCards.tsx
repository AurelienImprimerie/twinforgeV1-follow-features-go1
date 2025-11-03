import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface TrendAnalysis {
  trends: Array<{
    pattern: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
    recommendations: string[];
  }>;
  strategic_advice: Array<{
    category: 'nutrition' | 'timing' | 'balance' | 'goals';
    advice: string;
    priority: 'low' | 'medium' | 'high';
    timeframe: 'immediate' | 'short_term' | 'long_term';
  }>;
}

interface TrendCard {
  type: 'trend' | 'advice' | 'classification';
  title: string;
  content: string;
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'low' | 'medium' | 'high';
  color: string;
  icon: keyof typeof ICONS;
  confidence?: number;
}

interface InsightCardsProps {
  trendAnalysis: TrendAnalysis | null;
  weekMeals?: any[];
  monthMeals?: any[];
}

/**
 * Insight Cards - Cartes d'insights avancés
 * Se concentre uniquement sur les patterns et conseils stratégiques
 */
export const InsightCards: React.FC<InsightCardsProps> = ({
  trendAnalysis,
  weekMeals,
  monthMeals,
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  // Transformer l'analyse IA en cartes d'insights
  const trendCards = React.useMemo((): TrendCard[] => {
    if (!trendAnalysis) return [];
    
    const cards: TrendCard[] = [];
    
    // Tendances et patterns détectés
    trendAnalysis.trends?.forEach((trend, index) => {
      cards.push({
        type: 'trend',
        title: 'Pattern Nutritionnel Détecté',
        content: trend.description,
        impact: trend.impact,
        priority: trend.confidence > 0.8 ? 'high' : 'medium',
        color: trend.impact === 'positive' ? '#10B981' : 
               trend.impact === 'negative' ? '#EF4444' : '#6B7280',
        icon: trend.impact === 'positive' ? 'TrendingUp' : 
              trend.impact === 'negative' ? 'AlertCircle' : 'Info',
        confidence: trend.confidence
      });
    });
    
    // Conseils stratégiques personnalisés
    trendAnalysis.strategic_advice?.slice(0, 3).forEach((advice, index) => {
      cards.push({
        type: 'advice',
        title: `Conseil ${advice.category === 'nutrition' ? 'Nutritionnel' : 
                           advice.category === 'timing' ? 'de Timing' :
                           advice.category === 'balance' ? 'd\'Équilibre' : 'Objectifs'}`,
        content: advice.advice,
        impact: 'neutral',
        priority: advice.priority,
        color: advice.category === 'nutrition' ? '#10B981' :
               advice.category === 'timing' ? '#F59E0B' :
               advice.category === 'balance' ? '#8B5CF6' : '#06B6D4',
        icon: advice.category === 'nutrition' ? 'Utensils' :
              advice.category === 'timing' ? 'Clock' :
              advice.category === 'balance' ? 'BarChart3' : 'Target'
      });
    });
    
    return cards;
  }, [trendAnalysis]);

  // Si aucun insight n'est disponible, ne rien afficher
  if (trendCards.length === 0) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.Info} size={32} className="text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">
            Insights en Préparation
          </h3>
          <p className="text-white/70 text-base mb-6 max-w-md mx-auto leading-relaxed">
            TwinForge forge les analyses de vos patterns nutritionnels pour forger
            des insights personnalisés. Continuez à scanner vos repas.
          </p>
          <div className="text-cyan-300 text-sm">
            Analyse en cours...
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #10B981 30%, transparent), color-mix(in srgb, #10B981 20%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #10B981 40%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #10B981 30%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.Zap} size={20} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl">Insights Personnalisés</h2>
          <p className="text-green-200 text-sm">Patterns et conseils forgés par l'atelier d'analyse</p>
        </div>
      </div>

      {/* Cartes d'insights - Patterns et Conseils */}
      <div className="space-y-4">
      {trendCards.map((card, index) => (
        <MotionDiv
          key={index}
          {...(!isPerformanceMode && {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.6, delay: index * 0.1 }
          })}
        >
          <GlassCard 
            className="p-5"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${card.color} 8%, transparent) 0%, transparent 60%),
                var(--glass-opacity)
              `,
              borderColor: `color-mix(in srgb, ${card.color} 20%, transparent)`,
              boxShadow: card.priority === 'high' ? `
                0 8px 32px rgba(0, 0, 0, 0.2),
                0 0 20px color-mix(in srgb, ${card.color} 15%, transparent)
              ` : undefined
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `color-mix(in srgb, ${card.color} 20%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${card.color} 30%, transparent)`
                }}
              >
                <SpatialIcon 
                  Icon={ICONS[card.icon]} 
                  size={14} 
                  style={{ color: card.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium text-sm flex items-center gap-2">
                    {card.title}
                    {card.priority === 'high' && (
                      <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    )}
                  </h4>
                  {card.confidence && (
                    <span className="text-xs text-white/50">
                      {Math.round(card.confidence * 100)}% confiance
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {card.content}
                </p>
              </div>
            </div>
          </GlassCard>
        </MotionDiv>
      ))}
      </div>
    </div>
  );
};
