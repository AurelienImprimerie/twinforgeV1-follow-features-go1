import React from 'react';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface MorphInsight {
  id: string;
  title: string;
  description: string;
  type: 'recommendation' | 'observation' | 'achievement' | 'goal_progress';
  category: 'morphology' | 'fitness' | 'nutrition' | 'health' | 'goals';
  priority: 'high' | 'medium' | 'low';
  value?: string;
  icon: keyof typeof ICONS;
  color: string;
  confidence: number;
  actionable?: {
    action: string;
    description: string;
  };
}

interface InsightCardProps {
  insight: MorphInsight;
  index: number;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'recommendation': return ICONS.Target;
    case 'observation': return ICONS.Eye;
    case 'achievement': return ICONS.Check;
    case 'goal_progress': return ICONS.TrendingUp;
    default: return ICONS.Info;
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'recommendation': return 'Recommandation';
    case 'observation': return 'Observation';
    case 'achievement': return 'Réussite';
    case 'goal_progress': return 'Progression';
    default: return 'Info';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'morphology': return 'Morphologie';
    case 'fitness': return 'Fitness';
    case 'nutrition': return 'Nutrition';
    case 'health': return 'Santé';
    case 'goals': return 'Objectifs';
    default: return category;
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high': return 'Haute';
    case 'medium': return 'Moyenne';
    case 'low': return 'Basse';
    default: return priority;
  }
}

export const InsightCard: React.FC<InsightCardProps> = React.memo(({ insight, index }) => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <ConditionalMotion
      className="insight-card"
      style={{ '--insight-color': insight.color } as React.CSSProperties}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: isPerformanceMode ? 0 : index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      {/* Badges de métadonnées en haut à droite */}
      <div className="insight-card-badges">
        {/* Badge de type */}
        <div className={`insight-metadata-badge insight-metadata-badge--type-${insight.type}`}>
          <SpatialIcon
            Icon={getTypeIcon(insight.type)}
            size={10}
            variant="pure"
          />
          <span>{getTypeLabel(insight.type)}</span>
        </div>

        {/* Badge de priorité (seulement si high ou medium) */}
        {(insight.priority === 'high' || insight.priority === 'medium') && (
          <div className={`insight-metadata-badge insight-metadata-badge--priority-${insight.priority}`}>
            <span>{getPriorityLabel(insight.priority)}</span>
          </div>
        )}

        {/* Badge de confiance (seulement si >= 80%) */}
        {insight.confidence >= 0.8 && (
          <div className="insight-metadata-badge insight-metadata-badge--confidence">
            <SpatialIcon Icon={ICONS.Check} size={10} variant="pure" />
            <span>{Math.round(insight.confidence * 100)}%</span>
          </div>
        )}
      </div>

      <div className="insight-card-header">
        <div className="insight-card-icon-container">
          <SpatialIcon Icon={ICONS[insight.icon]} size={18} color={insight.color} />
        </div>

        <div className="insight-card-content">
          <div className="insight-card-title-row">
            <h5 className="insight-card-title">
              {insight.title}
            </h5>
            {insight.value && (
              <span className="insight-card-value-badge">
                {insight.value}
              </span>
            )}
          </div>

          <p className="insight-card-description">
            {insight.description}
          </p>
        </div>
      </div>
    </ConditionalMotion>
  );
});

InsightCard.displayName = 'InsightCard';