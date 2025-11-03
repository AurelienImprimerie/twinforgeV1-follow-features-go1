import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface CapturedMealPhoto {
  file: File;
  url: string;
  validationResult: {
    isValid: boolean;
    issues: string[];
    confidence: number;
  };
  captureReport: any;
}

interface PhotoDisplayCardProps {
  capturedPhoto: CapturedMealPhoto;
  isPerformanceMode?: boolean;
}

/**
 * Photo Display Card - Affichage de la photo analysée
 */
const PhotoDisplayCard: React.FC<PhotoDisplayCardProps> = ({
  capturedPhoto,
  isPerformanceMode: propPerformanceMode,
}) => {
  const { isPerformanceMode: contextPerformanceMode } = usePerformanceMode();
  const isPerformanceMode = propPerformanceMode ?? contextPerformanceMode;
  const reduceMotion = useReducedMotion();

  return (
    <GlassCard 
      className="p-6 glass-card--photo-analyzed"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--color-plasma-cyan) 8%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, var(--brand-primary) 35%, transparent)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px color-mix(in srgb, var(--brand-primary) 15%, transparent),
          0 0 60px color-mix(in srgb, var(--color-plasma-cyan) 10%, transparent),
          inset 0 1px 0 rgba(255, 255, 255, 0.15)
        `,
        backdropFilter: 'blur(20px) saturate(150%)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 40%, transparent), color-mix(in srgb, var(--color-plasma-cyan) 30%, transparent))
            `,
            border: '2px solid color-mix(in srgb, var(--brand-primary) 60%, transparent)',
            boxShadow: `0 0 25px color-mix(in srgb, var(--brand-primary) 40%, transparent)`
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <SpatialIcon 
            Icon={ICONS.Camera} 
            size={18} 
            style={{ color: 'var(--color-plasma-cyan)' }}
          />
        </motion.div>
        <h3 className="text-xl font-bold text-white">Capture Nutritionnelle</h3>
      </div>
      
      <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
        <img
          src={capturedPhoto.url}
          alt="Repas analysé"
          className="w-full h-full object-cover"
          style={{
            border: '2px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)'
          }}
        />

        {/* Halo de Forge Spatiale autour de la photo - Désactivé en mode performance */}
        {!isPerformanceMode && (
          <>
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at center, color-mix(in srgb, var(--nutrition-primary) 4%, transparent) 0%, transparent 70%),
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-plasma-cyan) 3%, transparent) 0%, transparent 50%)
                `,
                border: '1px solid color-mix(in srgb, var(--nutrition-primary) 15%, transparent)'
              }}
            />

            {/* Effet de lumière forge spatiale */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `
                  linear-gradient(135deg,
                    color-mix(in srgb, var(--color-plasma-cyan) 2%, transparent) 0%,
                    transparent 30%,
                    color-mix(in srgb, var(--nutrition-primary) 2%, transparent) 70%,
                    transparent 100%
                  )
                `,
                mixBlendMode: 'overlay'
              }}
            />
          </>
        )}
      </div>
    </GlassCard>
  );
};

export default PhotoDisplayCard;