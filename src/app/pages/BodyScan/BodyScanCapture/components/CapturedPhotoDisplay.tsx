import React from 'react';
import { ConditionalMotion, ConditionalAnimatePresence } from '../../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../../hooks/useBodyScanPerformance';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import type { CapturedPhotoEnhanced } from '../../../../../domain/types';

interface CapturedPhotoDisplayProps {
  photo: CapturedPhotoEnhanced;
  showSuccessAnimation: boolean;
  onRetake: () => void;
}

/**
 * Captured Photo Display Component
 * VisionOS 26 optimized photo display with glass effects
 */
const CapturedPhotoDisplay: React.FC<CapturedPhotoDisplayProps> = ({
  photo,
  showSuccessAnimation,
  onRetake,
}) => {
  const performanceConfig = useBodyScanPerformance();
  const { click } = useFeedback();

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
        <ConditionalMotion
          as="img"
          src={photo.url}
          alt={`Photo ${photo.type}`}
          className="w-full h-full object-contain border border-white/10 photo-processing"
          initial={performanceConfig.enableInitialAnimations ? { opacity: 0, scale: 0.95 } : false}
          animate={performanceConfig.enableInitialAnimations ? { opacity: 1, scale: 1 } : { opacity: 1 }}
          transition={performanceConfig.enableFramerMotion ? { duration: 0.6, ease: "easeOut" } : undefined}
        />
        
        {/* Success Animation with Glass Ripple */}
        <ConditionalAnimatePresence>
          {showSuccessAnimation && (
            <ConditionalMotion
              className="absolute inset-0 flex items-center justify-center backdrop-blur-md rounded-xl success-ripple"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.4))',
                border: '1px solid rgba(34, 197, 94, 0.5)'
              }}
              initial={performanceConfig.enableInitialAnimations ? { opacity: 0, scale: 0.8 } : false}
              animate={performanceConfig.enableInitialAnimations ? { opacity: 1, scale: 1 } : { opacity: 1 }}
              exit={performanceConfig.enableInitialAnimations ? { opacity: 0, scale: 1.1 } : undefined}
              transition={performanceConfig.enableFramerMotion ? { duration: 0.6, ease: "easeOut" } : undefined}
            >
              {/* Glass Success Icon */}
              <ConditionalMotion
                className="w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.5))',
                  border: '2px solid rgba(34, 197, 94, 0.6)',
                  boxShadow: '0 0 40px rgba(34, 197, 94, 0.6), inset 0 2px 0 rgba(255,255,255,0.3)'
                }}
                initial={performanceConfig.enableInitialAnimations ? { scale: 0, rotate: -180 } : false}
                animate={performanceConfig.enableInitialAnimations ? { scale: 1, rotate: 0 } : { scale: 1 }}
                transition={performanceConfig.enableFramerMotion ? {
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: 0.2
                } : undefined}
              >
                <SpatialIcon Icon={ICONS.Check} size={36} className="text-green-400" />
              </ConditionalMotion>
            </ConditionalMotion>
          )}
        </ConditionalAnimatePresence>
        
      </div>
      
      {/* Retake Button */}
      <ConditionalMotion
        as="button"
        onClick={() => {
          click();
          onRetake();
        }}
        className="w-full btn-glass"
        whileHover={performanceConfig.enableWhileHover ? { scale: 1.02 } : undefined}
        whileTap={performanceConfig.enableWhileTap ? { scale: 0.98 } : undefined}
        style={{
          borderRadius: '999px',
          padding: '.5rem 1.5rem',
          minHeight: '44px',
          overflow: 'hidden'
        }}
        initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 10 } : false}
        animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
        transition={performanceConfig.enableFramerMotion ? { duration: 0.4, delay: 0.2 } : undefined}
      >
        <div className="flex items-center justify-center gap-2">
          <SpatialIcon Icon={ICONS.RotateCcw} size={14} />
          <span>Reprendre</span>
        </div>
      </ConditionalMotion>
    </div>
  );
};

export default CapturedPhotoDisplay;
