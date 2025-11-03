import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import React from 'react';

interface ActivityInsight {
  type: 'pattern' | 'trend' | 'recommendation' | 'achievement';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  icon: string;
  color: string;
  actionable?: boolean;
  action?: string;
}

interface ActivitySummary {
  total_activities: number;
  total_calories: number;
  total_duration: number;
  avg_daily_calories: number;
  most_frequent_type: string;
  avg_intensity: string;
  consistency_score: number;
}

interface ActivityInsightCardsProps {
  insights: ActivityInsight[];
  summary: ActivitySummary;
  period: 'week' | 'month' | 'quarter';
  apiPeriod: 'last7Days' | 'last30Days' | 'last3Months';
}

/**
 * Obtenir le label de période pour l'affichage
 */
function getPeriodDisplayLabel(period: 'week' | 'month' | 'quarter'): string {
  switch (period) {
    case 'week': return '7 jours';
    case 'month': return '30 jours';
    case 'quarter': return '90 jours';
    default: return '30 jours';
  }
}

/**
 * Obtenir l'icône appropriée pour un type d'insight
 */
function getInsightIcon(iconName: string): keyof typeof ICONS {
  const iconMap: Record<string, keyof typeof ICONS> = {
    'TrendingUp': 'TrendingUp',
    'Target': 'Target',
    'Zap': 'Zap',
    'Activity': 'Activity',
    'BarChart3': 'BarChart3',
    'Clock': 'Clock',
    'Heart': 'Heart',
    'Lightbulb': 'Lightbulb',
    'Check': 'Check',
    'AlertCircle': 'AlertCircle',
    'Info': 'Info'
  };
  
  return iconMap[iconName] || 'Info';
}

/**
 * Activity Insight Cards - Cartes d'Insights Énergétiques
 * Affiche les insights personnalisés générés par l'IA
 */
const ActivityInsightCards: React.FC<ActivityInsightCardsProps> = ({
  insights,
  summary,
  period,
  apiPeriod
}) => {
  // Si aucun insight n'est disponible, ne rien afficher (sera géré en bas de page)
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header des Insights */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #F59E0B 30%, transparent), color-mix(in srgb, #F59E0B 20%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.Lightbulb} size={20} style={{ color: '#F59E0B' }} />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl">Insights Énergétiques</h2>
          <p className="text-orange-200 text-sm">Analyses et conseils sur {getPeriodDisplayLabel(period)}</p>
        </div>
      </div>

      {/* Cartes d'insights - Patterns et Conseils */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <GlassCard
              className="p-5"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, ${insight.color} 8%, transparent) 0%, transparent 60%),
                  var(--glass-opacity)
                `,
                borderColor: `color-mix(in srgb, ${insight.color} 20%, transparent)`,
                boxShadow: insight.priority === 'high' ? `
                  0 8px 32px rgba(0, 0, 0, 0.2),
                  0 0 20px color-mix(in srgb, ${insight.color} 15%, transparent)
                ` : undefined
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${insight.color} 20%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${insight.color} 30%, transparent)`
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS[getInsightIcon(insight.icon)]}
                    size={14}
                    style={{ color: insight.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm flex items-center gap-2">
                      {insight.title}
                      {insight.priority === 'high' && (
                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      )}
                    </h4>
                    {insight.confidence && (
                      <span className="text-xs text-white/50">
                        {Math.round(insight.confidence * 100)}% confiance
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed mb-3">
                    {insight.content}
                  </p>
                  
                  {/* Action suggérée */}
                  {insight.actionable && insight.action && (
                    <div className="mt-3 p-3 rounded-lg" style={{
                      background: `color-mix(in srgb, ${insight.color} 6%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${insight.color} 15%, transparent)`
                    }}>
                      <div className="flex items-center gap-2">
                        <SpatialIcon Icon={ICONS.Target} size={12} style={{ color: insight.color }} />
                        <span className="text-sm font-medium" style={{ color: insight.color }}>
                          Action suggérée :
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-white/70">
                        {insight.action}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Encouragement à Continuer */}
      <GlassCard
        className="p-6 text-center"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-activity-secondary) 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, var(--color-activity-secondary) 20%, transparent)'
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: 'var(--color-activity-secondary)' }} />
          <p className="text-white/70 text-sm">
            Continuez à enregistrer vos activités pour des insights encore plus précis et personnalisés
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default ActivityInsightCards;