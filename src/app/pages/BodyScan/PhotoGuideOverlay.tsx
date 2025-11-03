import React from 'react';
import { ConditionalMotion } from '../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../hooks/useBodyScanPerformance';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { getGuideImageUrl, type UserGender } from './constants';

interface PhotoGuideOverlayProps {
  type: 'front' | 'profile';
  isFaceScan?: boolean;
  gender?: UserGender;
}

const PhotoGuideOverlay: React.FC<PhotoGuideOverlayProps> = ({ type, isFaceScan = false, gender }) => {
  const performanceConfig = useBodyScanPerformance();
  // Get the appropriate guide image URL based on gender and type
  const guideImageUrl = getGuideImageUrl(gender, type);

  return (
    <div className="flex items-center gap-8">
      {/* Photo Column - Reduced width */}
      <div className="relative" style={{ width: '180px', height: '260px' }}>
        <div 
          className="w-full h-full border-2 rounded-3xl flex items-center justify-center relative overflow-hidden"
          style={{
            borderColor: type === 'front' 
              ? 'color-mix(in srgb, var(--color-plasma-cyan) 50%, transparent)'
              : 'color-mix(in srgb, #A855F7 50%, transparent)',
            background: type === 'front'
              ? `
                radial-gradient(circle at center, color-mix(in srgb, var(--color-plasma-cyan) 12%, transparent) 0%, transparent 70%),
                rgba(255, 255, 255, 0.05)
              `
              : `
                radial-gradient(circle at center, color-mix(in srgb, #A855F7 12%, transparent) 0%, transparent 70%),
                rgba(255, 255, 255, 0.05)
              `,
            backdropFilter: 'blur(8px) saturate(120%)',
            boxShadow: type === 'front'
              ? `
                0 0 30px color-mix(in srgb, var(--color-plasma-cyan) 20%, transparent),
                0 8px 32px rgba(0, 0, 0, 0.25),
                inset 0 2px 0 rgba(255, 255, 255, 0.15)
              `
              : `
                0 0 30px color-mix(in srgb, #A855F7 20%, transparent),
                0 8px 32px rgba(0, 0, 0, 0.25),
                inset 0 2px 0 rgba(255, 255, 255, 0.15)
              `
          }}
        >
          {/* Guide Image with TwinForge Glass Effects */}
          <ConditionalMotion
            className="absolute inset-2 rounded-2xl overflow-hidden"
            initial={performanceConfig.enableInitialAnimations ? { opacity: 0, scale: 0.95 } : false}
            animate={performanceConfig.enableInitialAnimations ? { opacity: 1, scale: 1 } : { opacity: 1 }}
            transition={performanceConfig.enableFramerMotion ? { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } : undefined}
          >
            <img
              src={guideImageUrl}
              alt={`Guide ${type} - ${gender === 'female' ? 'Femme' : 'Homme'}`}
              className="w-full h-full object-cover"
              style={{
                filter: type === 'front'
                  ? `
                    brightness(0.7) 
                    contrast(1.1) 
                    saturate(0.8)
                    drop-shadow(0 0 8px color-mix(in srgb, var(--color-plasma-cyan) 30%, transparent))
                  `
                  : `
                    brightness(0.7) 
                    contrast(1.1) 
                    saturate(0.8)
                    drop-shadow(0 0 8px color-mix(in srgb, #A855F7 30%, transparent))
                  `,
                opacity: 0.85
              }}
            />
            
            {/* Glass Overlay for Integration */}
            <div 
              className="absolute inset-0"
              style={{
                background: type === 'front'
                  ? `
                    linear-gradient(135deg, 
                      color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent) 0%, 
                      transparent 30%, 
                      color-mix(in srgb, var(--color-plasma-cyan) 8%, transparent) 70%, 
                      transparent 100%
                    )
                  `
                  : `
                    linear-gradient(135deg, 
                      color-mix(in srgb, #A855F7 15%, transparent) 0%, 
                      transparent 30%, 
                      color-mix(in srgb, #A855F7 8%, transparent) 70%, 
                      transparent 100%
                    )
                  `,
                backdropFilter: 'blur(1px)',
                mixBlendMode: 'overlay'
              }}
            />
          </ConditionalMotion>
          
          {/* Position indicator - Top */}
          <div 
            className="absolute top-6 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-medium"
            style={{
              background: `
                radial-gradient(circle at center, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)
              `,
              backdropFilter: 'blur(8px) saturate(120%)',
              border: type === 'front'
                ? '1px solid color-mix(in srgb, var(--color-plasma-cyan) 30%, transparent)'
                : '1px solid color-mix(in srgb, #A855F7 30%, transparent)',
              color: type === 'front' ? 'var(--color-plasma-cyan)' : '#A855F7',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              zIndex: 20
            }}
          >
            {type === 'front' ? 'Face' : 'Profil'}
          </div>
          
          {/* Angle indicator - Bottom center */}
          <div 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg text-sm font-bold"
            style={{
              background: type === 'front'
                ? `
                  radial-gradient(circle at center, color-mix(in srgb, var(--color-plasma-cyan) 25%, transparent) 0%, color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent) 100%)
                `
                : `
                  radial-gradient(circle at center, color-mix(in srgb, #A855F7 25%, transparent) 0%, color-mix(in srgb, #A855F7 15%, transparent) 100%)
                `,
              border: type === 'front'
                ? '1px solid color-mix(in srgb, var(--color-plasma-cyan) 50%, transparent)'
                : '1px solid color-mix(in srgb, #A855F7 50%, transparent)',
              color: type === 'front' ? 'var(--color-plasma-cyan)' : '#A855F7',
              backdropFilter: 'blur(8px) saturate(130%)',
              boxShadow: type === 'front'
                ? `
                  0 4px 12px rgba(0, 0, 0, 0.3),
                  0 0 12px color-mix(in srgb, var(--color-plasma-cyan) 40%, transparent)
                `
                : `
                  0 4px 12px rgba(0, 0, 0, 0.3),
                  0 0 12px color-mix(in srgb, #A855F7 40%, transparent)
                `,
              zIndex: 20
            }}
          >
            {type === 'front' ? '180°' : '90°'}
          </div> {/* Removed redundant style prop, it's already passed via `style` prop of SpatialIcon */}
          
          {/* Breathing animation - disabled in performance mode */}
          {performanceConfig.enableBreathingAnimations && (
            <div
              className="absolute inset-0 border-2 border-white/20 rounded-3xl pointer-events-none"
              style={{
                animation: 'guide-breathing-animation 4s ease-in-out infinite',
                boxShadow: type === 'front'
                  ? 'inset 0 0 20px color-mix(in srgb, var(--color-plasma-cyan) 10%, transparent)'
                  : 'inset 0 0 20px color-mix(in srgb, #A855F7 10%, transparent)',
                zIndex: 10
              }}
            />
          )}
        </div>
      </div>
      
      {/* Text Column - Right side with more space */}
      <div className="flex-1 text-left space-y-4">
        <div className="space-y-3">
          <p className={`text-sm font-medium ${type === 'front' ? 'text-cyan-400' : 'text-purple-400'}`}>
            Position {type === 'front' ? 'face' : 'profil'}
          </p>
          <div className="space-y-1 text-xs text-white/60">
            {type === 'front' ? (
              isFaceScan ? (
                <>
                  <p>• Regardez l'objectif</p>
                  <p>• Visage au centre du cadre</p>
                  <p>• Expression neutre</p>
                </>
              ) : (
                <>
                  <p>• Regardez l'objectif</p>
                  <p>• Bras légèrement décollés</p>
                  <p>• Posture droite</p>
                </>
              )
            ) : (
              isFaceScan ? (
                <>
                  <p>• Tournez-vous de 90°</p>
                  <p>• Regardez droit devant</p>
                  <p>• Visage au centre du cadre</p>
                </>
              ) : (
                <>
                  <p>• Tournez-vous à 90°</p>
                  <p>• Même distance que face</p>
                  <p>• Bras visible</p>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoGuideOverlay;