import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface LoadingAndErrorStatesProps {
  loading: boolean;
  error: string | null;
}

const LoadingAndErrorStates: React.FC<LoadingAndErrorStatesProps> = ({
  loading,
  error
}) => {
  if (loading) {
    return (
      <GlassCard 
        className="p-8 text-center relative overflow-hidden rounded-3xl transform-gpu preserve-3d will-transform transition-all duration-300"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
            rgba(255, 255, 255, 0.06)
          `,
          borderColor: 'color-mix(in srgb, #06B6D4 25%, transparent)',
          backdropFilter: 'blur(20px) saturate(160%)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #06B6D4 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 20%, transparent) 0%, transparent 60%),
                rgba(255, 255, 255, 0.1)
              `,
              border: '2px solid color-mix(in srgb, #06B6D4 50%, transparent)',
              boxShadow: `
                0 8px 32px color-mix(in srgb, #06B6D4 25%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.2)
              `
            }}
          >
            <SpatialIcon 
              Icon={ICONS.Loader2} 
              size={24} 
              className="animate-spin"
              style={{ 
                color: '#06B6D4',
                filter: 'drop-shadow(0 0 8px color-mix(in srgb, #06B6D4 40%, transparent))'
              }}
              variant="pure"
            />
          </div>
          <span className="text-white text-lg font-medium">Chargement de vos inventaires...</span>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard
        className="p-6 relative overflow-hidden rounded-3xl transform-gpu preserve-3d will-transform transition-all duration-300"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #EF4444 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #F97316 8%, transparent) 0%, transparent 60%),
            rgba(255, 255, 255, 0.06)
          `,
          borderColor: 'color-mix(in srgb, #EF4444 25%, transparent)',
          backdropFilter: 'blur(20px) saturate(160%)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #EF4444 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #EF4444 20%, transparent) 0%, transparent 60%),
                rgba(255, 255, 255, 0.1)
              `,
              border: '2px solid color-mix(in srgb, #EF4444 50%, transparent)',
              boxShadow: `
                0 8px 32px color-mix(in srgb, #EF4444 25%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.2)
              `
            }}
          >
            <SpatialIcon 
              Icon={ICONS.AlertCircle} 
              size={24}
              style={{ 
                color: '#EF4444',
                filter: 'drop-shadow(0 0 8px color-mix(in srgb, #EF4444 40%, transparent))'
              }}
              variant="pure"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Erreur de Chargement</h3>
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return null;
};

export default LoadingAndErrorStates;