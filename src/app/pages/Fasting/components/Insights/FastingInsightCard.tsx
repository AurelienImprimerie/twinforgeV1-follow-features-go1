import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import type { FastingInsight } from '../../hooks/useFastingInsightsGenerator';

interface FastingInsightCardProps {
  insight: FastingInsight;
  index: number;
  className?: string;
}

/**
 * Get priority theme styling
 */
function getPriorityTheme(priority: FastingInsight['priority']) {
  switch (priority) {
    case 'high':
      return {
        borderWidth: '2px',
        glowIntensity: '25%',
        backgroundIntensity: '12%'
      };
    case 'medium':
      return {
        borderWidth: '1.5px',
        glowIntensity: '20%',
        backgroundIntensity: '10%'
      };
    case 'low':
    default:
      return {
        borderWidth: '1px',
        glowIntensity: '15%',
        backgroundIntensity: '8%'
      };
  }
}

/**
 * Get insight type icon mapping
 */
function getInsightTypeIcon(type: FastingInsight['type'], fallbackIcon: string): keyof typeof ICONS {
  const iconMap: Record<FastingInsight['type'], keyof typeof ICONS> = {
    pattern: 'BarChart3',
    recommendation: 'Lightbulb',
    achievement: 'Check',
    warning: 'AlertTriangle'
  };
  
  return iconMap[type] || (fallbackIcon as keyof typeof ICONS) || 'Info';
}

/**
 * Fasting Insight Card - Carte d'Insight Individuel
 * Affiche un insight, recommandation ou pattern généré par l'IA
 */
const FastingInsightCard: React.FC<FastingInsightCardProps> = ({
  insight,
  index,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const theme = getPriorityTheme(insight.priority);
  const iconName = getInsightTypeIcon(insight.type, insight.icon);

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }
      })}
      className={className}
    >
      <GlassCard
        className="p-5 hover:scale-[1.01] transition-transform duration-200"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${insight.color} ${theme.backgroundIntensity}, transparent) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${insight.color} 25%, transparent)`,
          borderWidth: theme.borderWidth,
          boxShadow: isPerformanceMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : `
              0 8px 32px rgba(0, 0, 0, 0.2),
              0 0 20px color-mix(in srgb, ${insight.color} ${theme.glowIntensity}, transparent),
              inset 0 1px 0 rgba(255, 255, 255, 0.12)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(16px) saturate(150%)'
        }}
      >
        <div className="flex items-start gap-4">
          {/* Icône avec Priorité Visuelle */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, ${insight.color} 35%, transparent), color-mix(in srgb, ${insight.color} 25%, transparent))
              `,
              border: `${theme.borderWidth} solid color-mix(in srgb, ${insight.color} 50%, transparent)`,
              boxShadow: isPerformanceMode ? 'none' : `0 0 20px color-mix(in srgb, ${insight.color} 30%, transparent)`
            }}
          >
            <SpatialIcon 
              Icon={ICONS[iconName]} 
              size={20} 
              style={{ color: insight.color }} 
              variant="pure"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header avec Type et Priorité */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-bold text-lg leading-tight">
                {insight.title}
              </h4>
              
              {/* Badge de Priorité */}
              <div 
                className="px-2 py-1 rounded-full flex-shrink-0"
                style={{
                  background: `color-mix(in srgb, ${insight.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${insight.color} 25%, transparent)`
                }}
              >
                <span className="text-xs font-medium" style={{ color: insight.color }}>
                  {insight.priority === 'high' ? 'Priorité' : 
                   insight.priority === 'medium' ? 'Important' : 'Info'}
                </span>
              </div>
            </div>
            
            {/* Contenu Principal */}
            <p className="text-white/85 text-sm leading-relaxed mb-4">
              {insight.content}
            </p>
            
            {/* Action Recommandée */}
            {insight.actionable && (
              <MotionDiv
                className="p-3 rounded-lg"
                style={{
                  background: `color-mix(in srgb, ${insight.color} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${insight.color} 20%, transparent)`
                }}
                {...(!isPerformanceMode && {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.4, delay: 0.2 + index * 0.1 }
                })}
              >
                <div className="flex items-start gap-2">
                  <SpatialIcon 
                    Icon={ICONS.Target} 
                    size={12} 
                    style={{ color: insight.color }} 
                    className="mt-0.5" 
                  />
                  <div>
                    <h6 className="font-medium text-sm mb-1" style={{ color: insight.color }}>
                      Action Recommandée
                    </h6>
                    <p className="text-white/80 text-xs leading-relaxed">
                      {insight.actionable}
                    </p>
                  </div>
                </div>
              </MotionDiv>
            )}
          </div>
        </div>
        
        {/* Type Badge en bas */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ background: insight.color }} 
            />
            <span className="text-white/60 text-xs font-medium">
              {insight.type === 'pattern' ? 'Pattern détecté' :
               insight.type === 'recommendation' ? 'Recommandation' :
               insight.type === 'achievement' ? 'Accomplissement' :
               'Attention'}
            </span>
          </div>
          
          <div className="text-white/40 text-xs">
            Insight #{index + 1}
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};

export default FastingInsightCard;