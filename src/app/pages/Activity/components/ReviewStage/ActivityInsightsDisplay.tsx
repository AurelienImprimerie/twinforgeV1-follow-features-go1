import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import React from 'react';

interface ActivityInsightsDisplayProps {
  forgeInsights?: string[];
}

/**
 * Activity Insights Display - Affichage des Insights de la Forge
 * Présente les recommandations et analyses de la Forge Énergétique
 */
const ActivityInsightsDisplay: React.FC<ActivityInsightsDisplayProps> = ({
  forgeInsights
}) => {
  if (!forgeInsights || forgeInsights.length === 0) {
    return null;
  }

  return (
    <GlassCard 
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #F59E0B 20%, transparent)'
      }}
    >
      <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #F59E0B 30%, transparent), color-mix(in srgb, #F59E0B 20%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
            boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.Lightbulb} size={16} style={{ color: '#F59E0B' }} />
        </div>
        Insights de la Forge
      </h4>

      <div className="space-y-3">
        {forgeInsights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-xl" style={{
            background: 'color-mix(in srgb, #F59E0B 6%, transparent)',
            border: '1px solid color-mix(in srgb, #F59E0B 15%, transparent)'
          }}>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
              style={{
                background: 'color-mix(in srgb, #F59E0B 15%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 25%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: '#F59E0B' }} />
            </div>
            <p className="text-white/80 text-sm flex-1">{insight}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ActivityInsightsDisplay;