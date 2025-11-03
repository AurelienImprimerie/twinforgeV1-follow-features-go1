import React from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../../hooks/useBodyScanPerformance';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface CameraControlsProps {
  isCapturing: boolean;
  onCapture: () => void;
  onClose: () => void;
  onSwitchCamera: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isCapturing,
  onCapture,
  onClose,
  onSwitchCamera,
}) => {
  const performanceConfig = useBodyScanPerformance();
  return (
    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Close button */}
        <ConditionalMotion
          as="button"
          onClick={onClose}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg"
          whileHover={performanceConfig.enableWhileHover ? { scale: 1.05 } : undefined}
          whileTap={performanceConfig.enableWhileTap ? { scale: 0.95 } : undefined}
          initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 20 } : false}
          animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
          transition={performanceConfig.enableFramerMotion ? { delay: 0.2, duration: 0.5 } : undefined}
        >
          <SpatialIcon Icon={ICONS.X} size={26} className="text-white" />
        </ConditionalMotion>

        {/* Capture button */}
        <ConditionalMotion
          as="button"
          onClick={onCapture}
          disabled={isCapturing}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/30 flex items-center justify-center relative shadow-2xl"
          style={{
            background: isCapturing
              ? 'linear-gradient(135deg, var(--brand-warning), var(--brand-warning-dark))' /* ACIER SUR VERRE - Avertissement */
              : 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))', /* ACIER SUR VERRE - TwinForge */
            boxShadow: isCapturing
              ? '0 0 30px color-mix(in srgb, var(--brand-warning) 60%, transparent), 0 8px 32px rgba(0,0,0,0.4)'
              : '0 0 30px color-mix(in srgb, var(--brand-primary) 60%, transparent), 0 8px 32px rgba(0,0,0,0.4)'
          }}
          whileHover={performanceConfig.enableWhileHover ? { scale: 1.05 } : undefined}
          whileTap={performanceConfig.enableWhileTap ? { scale: 0.92 } : undefined}
          initial={performanceConfig.enableInitialAnimations ? { opacity: 0, scale: 0.8 } : false}
          animate={performanceConfig.enableInitialAnimations ? { opacity: 1, scale: 1 } : { opacity: 1 }}
          transition={performanceConfig.enableFramerMotion ? { delay: 0.1, duration: 0.6, type: "spring", stiffness: 300 } : undefined}
        >
          {isCapturing ? (
            <>
              <ConditionalMotion
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white"
                animate={performanceConfig.enablePulseAnimations ? { scale: [1, 0.7, 1] } : undefined}
                transition={performanceConfig.enableFramerMotion ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : undefined}
              />
              <ConditionalMotion
                className="absolute inset-0 rounded-full border-4 border-brand-warning/60" /* ACIER SUR VERRE */
                animate={performanceConfig.enablePulseAnimations ? { scale: [1, 1.3, 1], opacity: [0.8, 0.2, 0.8] } : undefined}
                transition={performanceConfig.enableFramerMotion ? { duration: 0.8, repeat: Infinity } : undefined}
              />
            </>
          ) : (
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full shadow-inner bg-white" />
          )}

          {!isCapturing && performanceConfig.enablePulseAnimations && (
            <ConditionalMotion
              className="absolute inset-0 rounded-full border-2 border-brand-accent/40" /* ACIER SUR VERRE - Plasma Cyan */
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </ConditionalMotion>

        {/* Switch camera button */}
        <ConditionalMotion
          as="button"
          onClick={onSwitchCamera}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg"
          whileHover={performanceConfig.enableWhileHover ? { scale: 1.05 } : undefined}
          whileTap={performanceConfig.enableWhileTap ? { scale: 0.95 } : undefined}
          initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 20 } : false}
          animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
          transition={performanceConfig.enableFramerMotion ? { delay: 0.3, duration: 0.5 } : undefined}
        >
          <SpatialIcon Icon={ICONS.RotateCcw} size={26} className="text-white" />
        </ConditionalMotion>
      </div>
      
      {/* Capture instruction */}
      <ConditionalMotion
        className="text-center mt-8"
        initial={performanceConfig.enableInitialAnimations ? { opacity: 0 } : false}
        animate={performanceConfig.enableInitialAnimations ? { opacity: 1 } : { opacity: 1 }}
        transition={performanceConfig.enableFramerMotion ? { delay: 0.8, duration: 0.6 } : undefined}
      >
        <p className="text-white/80 text-lg font-medium">
          {isCapturing ? 'Capture en cours...' : 'Appuyez pour capturer'}
        </p>
      </ConditionalMotion>
    </div>
  );
};

export default CameraControls;
