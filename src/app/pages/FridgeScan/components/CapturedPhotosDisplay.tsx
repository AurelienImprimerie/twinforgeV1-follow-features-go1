import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface CapturedPhotosDisplayProps {
  capturedPhotos: string[];
  onRemovePhoto: (index: number) => void;
}

const CapturedPhotosDisplay: React.FC<CapturedPhotosDisplayProps> = ({
  capturedPhotos,
  onRemovePhoto
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const MotionButton = isPerformanceMode ? 'button' : motion.button;

  if (capturedPhotos.length === 0) return null;

  return (
    <GlassCard
      className="fridge-glass-scan-subtle p-6"
    >
      {/* Header de la Section */}
      <div className="flex items-center gap-4 mb-6">
        <MotionDiv
          className={`fridge-icon-inventory ${isPerformanceMode ? '' : 'fridge-ai-focus'}`}
          style={{ width: '56px', height: '56px' }}
        >
          <SpatialIcon
            Icon={ICONS.Image}
            size={24}
            color="rgba(255, 255, 255, 0.95)"
            variant="pure"
          />
        </MotionDiv>

        <div className="flex-1">
          <h3 className="text-white font-bold text-xl mb-1"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            Photos Capturées
          </h3>
          <p className="text-pink-200/80 text-sm">
            {capturedPhotos.length} / 6 photo{capturedPhotos.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Compteur Progressif */}
        <div
          className="px-4 py-2 rounded-xl text-center"
          style={{
            background: 'color-mix(in srgb, var(--fridge-scan-primary) 20%, transparent)',
            border: '2px solid color-mix(in srgb, var(--fridge-scan-primary) 40%, transparent)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="text-2xl font-bold text-white">
            {capturedPhotos.length}
          </div>
          <div className="text-xs text-pink-200/70 font-medium">
            photo{capturedPhotos.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Grille des Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {isPerformanceMode ? (
          // Version simplifiée sans AnimatePresence pour performance
          capturedPhotos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="group relative"
            >
              <div
                className="relative aspect-square rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid color-mix(in srgb, var(--fridge-scan-primary) 25%, transparent)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `
                      0 8px 24px rgba(0, 0, 0, 0.3),
                      0 0 24px color-mix(in srgb, var(--fridge-scan-primary) 35%, transparent)
                    `;
                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fridge-scan-primary) 45%, transparent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fridge-scan-primary) 25%, transparent)';
                  }
                }}
              >
                <img
                  src={photo}
                  alt={`Photo du frigo ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />

                {/* Bouton de Suppression */}
                <button
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.95) 0%, rgba(239, 68, 68, 0.85) 100%)',
                    border: '2.5px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.7), 0 4px 12px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer'
                  }}
                  aria-label="Supprimer la photo"
                >
                  <SpatialIcon Icon={ICONS.X} size={16} color="white" variant="pure" />
                </button>

                {/* Label Photo */}
                <div
                  className="absolute bottom-2 left-2 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(0, 0, 0, 0.85)',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <span className="text-white text-xs font-semibold">
                    Photo {index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Version animée pour desktop/performance normale
          <AnimatePresence>
            {capturedPhotos.map((photo, index) => (
              <motion.div
                key={`${photo}-${index}`}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="group relative"
              >
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid color-mix(in srgb, var(--fridge-scan-primary) 25%, transparent)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = `
                        0 8px 24px rgba(0, 0, 0, 0.3),
                        0 0 24px color-mix(in srgb, var(--fridge-scan-primary) 35%, transparent)
                      `;
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fridge-scan-primary) 45%, transparent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--fridge-scan-primary) 25%, transparent)';
                    }
                  }}
                >
                  <img
                    src={photo}
                    alt={`Photo du frigo ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(180deg, transparent 0%, rgba(236, 72, 153, 0.15) 100%)'
                    }}
                  />

                  {/* Bouton de Suppression */}
                  <motion.button
                    onClick={() => onRemovePhoto(index)}
                    className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center z-10"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.95) 0%, rgba(239, 68, 68, 0.85) 100%)',
                      border: '2.5px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.7), 0 4px 12px rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(8px)',
                      cursor: 'pointer'
                    }}
                    whileHover={{
                      scale: 1.15,
                      boxShadow: '0 0 30px rgba(239, 68, 68, 0.9), 0 6px 16px rgba(0, 0, 0, 0.4)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Supprimer la photo"
                  >
                    <SpatialIcon Icon={ICONS.X} size={16} color="white" variant="pure" />
                  </motion.button>

                  {/* Label Photo */}
                  <div
                    className="absolute bottom-2 left-2 px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(0, 0, 0, 0.85)',
                      border: '1.5px solid rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <span className="text-white text-xs font-semibold">
                      Photo {index + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Message d'Information */}
      {capturedPhotos.length < 6 && (
        <MotionDiv
          {...(!isPerformanceMode && {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: capturedPhotos.length * 0.08 + 0.3 }
          })}
          className="mt-6 p-4 rounded-xl"
          style={{
            background: 'color-mix(in srgb, var(--fridge-scan-primary) 15%, transparent)',
            border: '2px solid color-mix(in srgb, var(--fridge-scan-primary) 30%, transparent)',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--fridge-scan-primary) 25%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--fridge-scan-primary) 45%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: 'var(--fridge-scan-primary)' }} variant="pure" />
            </div>
            <span className="text-pink-100 text-sm font-medium">
              Vous pouvez ajouter encore {6 - capturedPhotos.length} photo{6 - capturedPhotos.length > 1 ? 's' : ''} supplémentaire{6 - capturedPhotos.length > 1 ? 's' : ''}
            </span>
          </div>
        </MotionDiv>
      )}
    </GlassCard>
  );
};

export default CapturedPhotosDisplay;
