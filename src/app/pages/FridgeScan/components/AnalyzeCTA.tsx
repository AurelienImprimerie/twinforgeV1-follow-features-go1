import React from 'react';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface AnalyzeCTAProps {
  capturedPhotosCount: number;
  onAnalyzePhotos: () => void;
}

/**
 * Analyze CTA - Call to Action pour l'Analyse
 * Composant optimisé VisionOS 26 avec style rose TwinForge + Mode Performance
 */
const AnalyzeCTA: React.FC<AnalyzeCTAProps> = ({
  capturedPhotosCount,
  onAnalyzePhotos
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  if (capturedPhotosCount === 0) return null;

  return (
    <GlassCard
      id="analyze-cta"
      className="fridge-glass-scan p-8 text-center"
    >
      <div className="space-y-6">
        {/* Icône Principale avec Effet Spatial */}
        <div className="relative flex justify-center">
          <div
            className={`fridge-icon-scan ${isPerformanceMode ? '' : 'fridge-ai-focus'}`}
            style={{ width: '96px', height: '96px' }}
          >
            <SpatialIcon
              Icon={ICONS.Zap}
              size={40}
              color="rgba(255, 255, 255, 0.9)"
              variant="pure"
            />
          </div>
        </div>

        {/* Titre et Message avec Glow */}
        <div className="space-y-3">
          <h3
            className="text-2xl font-bold text-white"
            style={{
              textShadow: `0 0 20px color-mix(in srgb, var(--fridge-scan-primary) 60%, transparent)`
            }}
          >
            Prêt pour l'Analyse
          </h3>

          <p className="text-white/90 text-lg">
            {capturedPhotosCount} photo{capturedPhotosCount > 1 ? 's' : ''} prête
            {capturedPhotosCount > 1 ? 's' : ''} à être analysée
            {capturedPhotosCount > 1 ? 's' : ''} par la Forge Spatiale
          </p>
        </div>

        {/* Bouton d'Analyse Principal - Style VisionOS 26 */}
        <div className="flex justify-center">
          <button
            onClick={onAnalyzePhotos}
            disabled={capturedPhotosCount === 0}
            className="fridge-btn-scan-primary relative overflow-hidden px-10 py-4 text-xl font-bold rounded-full"
          >
            {/* Shimmer Effect - Désactivé en performance mode */}
            {!isPerformanceMode && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none fridge-spatial-shimmer"
                style={{
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    rgba(255,255,255,0.4) 50%,
                    transparent 100%
                  )`
                }}
              />
            )}

            <div className="flex items-center gap-3 relative z-10">
              <SpatialIcon Icon={ICONS.Zap} size={24} color="white" variant="pure" />
              <span>Analyser mes Photos</span>
            </div>
          </button>
        </div>

        {/* Badge de Statut */}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--fridge-scan-primary) 15%, transparent)',
              border: '2px solid color-mix(in srgb, var(--fridge-scan-primary) 30%, transparent)',
              backdropFilter: 'blur(16px) saturate(140%)'
            }}
          >
            <div
              className={`w-2 h-2 rounded-full ${isPerformanceMode ? 'animate-pulse' : ''}`}
              style={{ background: 'var(--fridge-scan-primary)' }}
            />
            <span className="text-pink-300 text-sm font-bold">Forge Spatiale Prête</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AnalyzeCTA;
