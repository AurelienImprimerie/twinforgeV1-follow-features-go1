import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface CaptureMainCTAProps {
  onCameraCapture: () => void;
  onFileUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const CaptureMainCTA: React.FC<CaptureMainCTAProps> = ({
  onCameraCapture,
  onFileUpload,
  fileInputRef
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const MotionButton = isPerformanceMode ? 'button' : motion.button;

  return (
    <GlassCard className="fridge-glass-scan p-8 text-center">
      <div className="space-y-8">
        {/* Icône Principale avec Effet Spatial Multi-Couches */}
        <div className="relative flex justify-center">
          <MotionDiv
            className={`fridge-icon-scan ${isPerformanceMode ? '' : 'fridge-ai-focus'}`}
            style={{ width: '128px', height: '128px' }}
            {...(!isPerformanceMode && {
              animate: {
                scale: [1, 1.05, 1]
              },
              transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            })}
          >
            <SpatialIcon
              Icon={ICONS.Camera}
              size={56}
              color="rgba(255, 255, 255, 0.95)"
              variant="pure"
            />

            {/* Anneaux de Pulsation Multiples */}
            {!isPerformanceMode && [0, 0.6, 1.2].map((delay, idx) => (
              <motion.div
                key={idx}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{
                  borderColor: idx === 0 ? 'color-mix(in srgb, var(--fridge-scan-primary) 65%, transparent)'
                            : idx === 1 ? 'color-mix(in srgb, var(--fridge-scan-secondary) 55%, transparent)'
                            : 'color-mix(in srgb, var(--fridge-scan-accent) 45%, transparent)'
                }}
                animate={{
                  scale: [1, 1.8, 1.8],
                  opacity: [0.8, 0, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay,
                  ease: 'easeOut'
                }}
              />
            ))}
          </MotionDiv>
        </div>

        {/* Titre et Description avec Glow */}
        <div className="space-y-4">
          <h2
            className="text-3xl font-bold text-white"
            style={{
              textShadow: `0 0 25px color-mix(in srgb, var(--fridge-scan-primary) 70%, transparent)`
            }}
          >
            Scanner votre Frigo
          </h2>

          <p className="text-white/85 text-lg max-w-md mx-auto leading-relaxed">
            Prenez 1 à 6 photos de votre frigo, garde-manger, ou armoire pour que la Forge Spatiale analyse vos ingrédients disponibles.
          </p>
        </div>

        {/* Bouton Principal - VisionOS 26 Style */}
        <div className="flex flex-col items-center gap-4">
          <MotionButton
            onClick={onCameraCapture}
            className="fridge-btn-scan-primary relative overflow-hidden px-10 py-5 text-xl font-bold rounded-2xl"
            style={{ minWidth: '260px' }}
            {...(!isPerformanceMode && {
              whileHover: { scale: 1.05, y: -4 },
              whileTap: { scale: 0.98 }
            })}
          >
            {/* Shimmer Effect */}
            {!isPerformanceMode && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    rgba(255,255,255,0.45) 50%,
                    transparent 100%
                  )`
                }}
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}

            <div className="flex items-center gap-3 relative z-10">
              <SpatialIcon
                Icon={ICONS.Camera}
                size={28}
                color="white"
                variant="pure"
              />
              <span>Prendre une Photo</span>
            </div>
          </MotionButton>

          {/* Bouton Secondaire Élégant */}
          <button
            onClick={onFileUpload}
            className="text-pink-300 hover:text-pink-100 text-base font-medium transition-all duration-300 flex items-center gap-2 group"
          >
            <SpatialIcon
              Icon={ICONS.Image}
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="underline decoration-pink-400/40 hover:decoration-pink-300/60">
              ou choisir depuis la galerie
            </span>
          </button>
        </div>

        {/* Badge de Statut */}
        <div className="flex justify-center pt-2">
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--fridge-scan-primary) 18%, transparent)',
              border: '2px solid color-mix(in srgb, var(--fridge-scan-primary) 35%, transparent)',
              backdropFilter: 'blur(18px) saturate(150%)'
            }}
          >
            <MotionDiv
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: 'var(--fridge-scan-primary)' }}
              {...(!isPerformanceMode && {
                animate: {
                  opacity: [1, 0.4, 1],
                  scale: [1, 1.2, 1]
                },
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              })}
            />
            <span className="text-pink-200 text-sm font-semibold">
              Forge Spatiale Prête
            </span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        multiple
        className="hidden"
      />
    </GlassCard>
  );
};

export default CaptureMainCTA;
