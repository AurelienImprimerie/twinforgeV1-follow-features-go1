import React from 'react';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

/**
 * Fasting Tips Card - Conseils de Jeûne
 * Composant autonome pour afficher les conseils pendant le jeûne
 */
const FastingTipsCard: React.FC = () => {
  const { isPerformanceMode } = usePerformanceMode();

  const tips = [
    {
      icon: 'Droplet',
      text: 'Restez bien hydraté avec de l\'eau pure',
      color: '#06B6D4'
    },
    {
      icon: 'Coffee',
      text: 'Le thé et café sans sucre sont autorisés',
      color: '#8B5CF6'
    },
    {
      icon: 'Heart',
      text: 'Écoutez votre corps et arrêtez si nécessaire',
      color: '#EF4444'
    },
    {
      icon: 'Activity',
      text: 'Restez actif avec des activités légères',
      color: '#10B981'
    }
  ];

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #F59E0B 20%, transparent)',
        boxShadow: isPerformanceMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px color-mix(in srgb, #F59E0B 15%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #F59E0B 30%, transparent), color-mix(in srgb, #F59E0B 20%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
              boxShadow: isPerformanceMode ? 'none' : '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Heart} size={16} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <h4 className="text-white font-semibold text-lg">Conseils de Jeûne</h4>
            <p className="text-white/60 text-sm">Optimisez votre session</p>
          </div>
        </div>

        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: `color-mix(in srgb, ${tip.color} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${tip.color} 15%, transparent)`
              }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                style={{
                  background: `color-mix(in srgb, ${tip.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${tip.color} 25%, transparent)`
                }}
              >
                <SpatialIcon 
                  Icon={ICONS[tip.icon as keyof typeof ICONS] || ICONS.Info} 
                  size={12} 
                  style={{ color: tip.color }} 
                />
              </div>
              <p className="text-white/80 text-sm leading-relaxed flex-1">
                {tip.text}
              </p>
            </div>
          ))}
        </div>

        {/* Encouragement */}
        <div 
          className="p-4 rounded-xl text-center"
          style={{
            background: `color-mix(in srgb, #22C55E 8%, transparent)`,
            border: `1px solid color-mix(in srgb, #22C55E 20%, transparent)`
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <SpatialIcon Icon={ICONS.Zap} size={14} style={{ color: '#22C55E' }} />
            <span className="text-green-300 font-semibold text-sm">Vous êtes sur la bonne voie !</span>
          </div>
          <p className="text-green-200 text-xs">
            Chaque minute de jeûne optimise votre métabolisme et votre bien-être
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default FastingTipsCard;