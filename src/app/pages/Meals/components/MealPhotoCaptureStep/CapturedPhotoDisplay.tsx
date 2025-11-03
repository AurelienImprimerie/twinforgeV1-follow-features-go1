import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';

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

interface CapturedPhotoDisplayProps {
  capturedPhoto: CapturedMealPhoto;
  showSuccessAnimation: boolean;
  onRetake: () => void;
}

/**
 * Captured Photo Display Component
 * Affichage de la photo capturée avec animations de succès
 */
const CapturedPhotoDisplay: React.FC<CapturedPhotoDisplayProps> = ({
  capturedPhoto,
  showSuccessAnimation,
  onRetake,
}) => {
  const reduceMotion = useReducedMotion();
  const { glassClick } = useFeedback();

  return (
    <GlassCard 
      className="p-6 relative overflow-visible glass-card--capture"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(16, 185, 129, 0.25)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px rgba(16, 185, 129, 0.12),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `
      }}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Titre avec icône lumineuse */}
        <div className="flex items-center gap-3">
          {/* Icône sur fond coloré lumineux */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                linear-gradient(135deg, rgba(16, 185, 129, 0.45), rgba(5, 150, 105, 0.35))
              `,
              border: '2px solid rgba(16, 185, 129, 0.6)',
              boxShadow: `
                0 0 20px rgba(16, 185, 129, 0.6),
                0 0 40px rgba(16, 185, 129, 0.3),
                inset 0 2px 0 rgba(255,255,255,0.35),
                inset 0 -2px 0 rgba(0,0,0,0.2)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.Camera}
              size={18}
              style={{
                color: '#fff',
                filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.9)) drop-shadow(0 0 4px rgba(255,255,255,0.5))'
              }}
            />
          </div>
          <h4
            className="text-white font-bold text-base"
            style={{
              textShadow: '0 2px 8px rgba(16, 185, 129, 0.4), 0 0 4px rgba(0,0,0,0.3)'
            }}
          >
            Photo de votre repas
          </h4>
        </div>

        {/* Joli bouton "Capturée" avec icône check */}
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(16, 185, 129, 0.25),
                rgba(5, 150, 105, 0.2)
              )
            `,
            border: '2px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px) saturate(130%)',
            boxShadow: `
              0 4px 16px rgba(16, 185, 129, 0.3),
              0 0 24px rgba(16, 185, 129, 0.2),
              inset 0 1px 0 rgba(255,255,255,0.25)
            `
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: reduceMotion ? 'tween' : 'spring',
              stiffness: 260,
              damping: 20,
              duration: reduceMotion ? 0.1 : undefined
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SpatialIcon
              Icon={ICONS.Check}
              size={14}
              style={{
                color: '#fff',
                filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.8))'
              }}
            />
          </motion.div>
          <span
            className="text-xs font-semibold"
            style={{
              color: '#fff',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)'
            }}
          >
            Capturée
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden glass-card--capture-preview">
          <motion.img
            src={capturedPhoto.url}
            alt="Photo du repas"
            className="w-full h-full object-cover bg-black/20 border border-green-400/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: reduceMotion ? 0.1 : 0.6, 
              ease: "easeOut" 
            }}
          />
          
          {/* Success Animation */}
          <AnimatePresence>
            {showSuccessAnimation && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center backdrop-blur-md rounded-xl success-overlay"
                style={{
                  background: `
                    radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 70%),
                    linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.3))
                  `,
                  border: '2px solid rgba(16, 185, 129, 0.6)',
                  backdropFilter: 'blur(16px) saturate(140%)'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ 
                  duration: reduceMotion ? 0.1 : 0.6, 
                  ease: "easeOut" 
                }}
              >
                <motion.div
                  className="w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-sm success-icon-container"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                      linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(34, 197, 94, 0.6))
                    `,
                    border: '3px solid rgba(16, 185, 129, 0.8)',
                    boxShadow: `
                      0 0 60px rgba(16, 185, 129, 0.8),
                      0 0 120px rgba(16, 185, 129, 0.4),
                      inset 0 3px 0 rgba(255,255,255,0.4),
                      inset 0 -3px 0 rgba(0,0,0,0.2)
                    `
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: reduceMotion ? 'tween' : 'spring', 
                    stiffness: 300, 
                    damping: 20,
                    delay: reduceMotion ? 0 : 0.2,
                    duration: reduceMotion ? 0.1 : undefined
                  }}
                >
                  <SpatialIcon 
                    Icon={ICONS.Check} 
                    size={36} 
                    className="text-white success-icon-glow"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))'
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.button
          onClick={() => {
            glassClick();
            onRetake();
          }}
          className="w-full btn-glass btn-glass--secondary-nav"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2">
            <SpatialIcon Icon={ICONS.RotateCcw} size={14} />
            <span>Reprendre</span>
          </div>
        </motion.button>
      </div>
    </GlassCard>
  );
};

export default CapturedPhotoDisplay;