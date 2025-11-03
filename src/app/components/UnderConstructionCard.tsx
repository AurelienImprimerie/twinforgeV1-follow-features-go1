import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../ui/cards/GlassCard';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';

interface UnderConstructionCardProps {
  title: string;
  description: string;
  message?: string; // Deprecated, use description instead
  icon?: keyof typeof ICONS;
  color?: string;
  features?: string[];
}

/**
 * Under Construction Card - Placeholder pour les fonctionnalités en développement
 * Composant réutilisable pour indiquer qu'une section est en cours de développement
 */
const UnderConstructionCard: React.FC<UnderConstructionCardProps> = ({
  title,
  description,
  message, // Deprecated fallback
  icon = 'Construction',
  color = '#06B6D4',
  features = []
}) => {
  // Use description if provided, otherwise fall back to message for backwards compatibility
  const displayMessage = description || message || '';
  return (
    <div className="space-y-6">
      <GlassCard 
        className="p-8 text-center"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${color} 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${color} 8%, transparent) 0%, transparent 50%),
            var(--glass-opacity)
          `,
          borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, ${color} 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        <div className="space-y-6">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center breathing-icon"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, ${color} 35%, transparent), color-mix(in srgb, ${color} 25%, transparent))
              `,
              border: `2px solid color-mix(in srgb, ${color} 50%, transparent)`,
              boxShadow: `0 0 30px color-mix(in srgb, ${color} 40%, transparent)`
            }}
          >
            <SpatialIcon Icon={ICONS[icon]} size={40} style={{ color }} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            <p className="text-white/80 text-lg">
              {displayMessage}
            </p>
          </div>
        </div>
      </GlassCard>

      {features.length > 0 && (
        <GlassCard className="p-6" style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #06B6D4 20%, transparent)'
        }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, #06B6D4 15%, transparent)',
                border: '1px solid color-mix(in srgb, #06B6D4 25%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Construction} size={14} style={{ color: '#06B6D4' }} />
            </div>
            <div>
              <h4 className="text-cyan-300 font-semibold">Fonctionnalités à venir</h4>
              <div className="text-cyan-200 text-sm mt-1 space-y-1">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default UnderConstructionCard;