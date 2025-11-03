import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { useFeedback } from '@/hooks/useFeedback';

interface ScanExitConfirmationModalProps {
  isOpen: boolean;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onCancel: () => void;
  hasResults: boolean;
  isProcessing: boolean;
  capturedPhoto: any;
}

/**
 * Scan Exit Confirmation Modal
 * Modal de confirmation pour quitter le flux de scan
 */
const ScanExitConfirmationModal: React.FC<ScanExitConfirmationModalProps> = ({
  isOpen,
  onSaveAndExit,
  onDiscardAndExit,
  onCancel,
  hasResults,
  isProcessing,
  capturedPhoto,
}) => {
  const { click, error: errorSound, success } = useFeedback();

  // Déterminer le message selon l'état du scan
  const getModalContent = () => {
    // Special case for AI generation in tabs (not meal scan)
    if (isProcessing && !hasResults && !capturedPhoto) {
      return {
        title: 'Analyse en Cours',
        message: 'Une analyse de vos données nutritionnelles est en cours. Si vous quittez maintenant, l\'analyse sera interrompue et les insights ne seront pas générés.',
        icon: 'Loader2' as const,
        color: '#F59E0B',
        showSaveOption: false
      };
    }
    
    if (isProcessing) {
      return {
        title: 'Analyse en Cours',
        message: 'Une analyse est actuellement en cours. Si vous quittez maintenant, l\'analyse sera interrompue et perdue.',
        icon: 'Loader2' as const,
        color: '#F59E0B',
        showSaveOption: false
      };
    }
    
    if (hasResults) {
      return {
        title: 'Résultats Non Sauvegardés',
        message: 'Votre repas a été analysé mais n\'est pas encore sauvegardé. Voulez-vous sauvegarder avant de quitter ?',
        icon: 'AlertCircle' as const,
        color: '#EF4444',
        showSaveOption: true
      };
    }
    
    if (capturedPhoto) {
      return {
        title: 'Photo Non Analysée',
        message: 'Vous avez capturé une photo mais elle n\'a pas encore été analysée. Voulez-vous continuer l\'analyse ?',
        icon: 'Camera' as const,
        color: '#F59E0B',
        showSaveOption: false
      };
    }
    
    return {
      title: 'Quitter le Scan',
      message: 'Êtes-vous sûr de vouloir quitter le flux de scan ?',
      icon: 'AlertCircle' as const,
      color: '#6B7280',
      showSaveOption: false
    };
  };

  const modalContent = getModalContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              click();
              onCancel();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard 
              className="p-6 relative"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, ${modalContent.color} 12%, transparent) 0%, transparent 60%),
                  radial-gradient(circle at 70% 80%, color-mix(in srgb, ${modalContent.color} 8%, transparent) 0%, transparent 50%),
                  var(--glass-opacity)
                `,
                borderColor: `color-mix(in srgb, ${modalContent.color} 30%, transparent)`,
                boxShadow: `
                  0 20px 60px rgba(0, 0, 0, 0.4),
                  0 0 40px color-mix(in srgb, ${modalContent.color} 20%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.2)
                `,
                backdropFilter: 'blur(24px) saturate(160%)'
              }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, ${modalContent.color} 35%, transparent), color-mix(in srgb, ${modalContent.color} 25%, transparent))
                    `,
                    border: `2px solid color-mix(in srgb, ${modalContent.color} 50%, transparent)`,
                    boxShadow: `0 0 30px color-mix(in srgb, ${modalContent.color} 40%, transparent)`
                  }}
                >
                  <SpatialIcon 
                    Icon={ICONS[modalContent.icon]} 
                    size={28} 
                    style={{ color: modalContent.color }}
                    className={isProcessing ? 'animate-spin' : ''}
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  {modalContent.title}
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
                  {modalContent.message}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Sauvegarder et Quitter (si résultats disponibles) */}
                {modalContent.showSaveOption && (
                  <button
                    onClick={() => {
                      success();
                      onSaveAndExit();
                    }}
                    className="w-full btn-glass--primary py-3"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          color-mix(in srgb, #22C55E 80%, transparent), 
                          color-mix(in srgb, #10B981 60%, transparent)
                        )
                      `,
                      borderColor: 'color-mix(in srgb, #22C55E 60%, transparent)',
                      boxShadow: `
                        0 8px 32px color-mix(in srgb, #22C55E 40%, transparent),
                        inset 0 2px 0 rgba(255,255,255,0.3)
                      `
                    }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <SpatialIcon Icon={ICONS.Save} size={18} className="text-white" />
                      <span className="font-bold">Sauvegarder et Quitter</span>
                    </div>
                  </button>
                )}

                {/* Jeter et Quitter */}
                <button
                  onClick={() => {
                    errorSound();
                    onDiscardAndExit();
                  }}
                  className="w-full btn-glass--warning py-3"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        color-mix(in srgb, #EF4444 70%, transparent), 
                        color-mix(in srgb, #DC2626 50%, transparent)
                      )
                    `,
                    borderColor: 'color-mix(in srgb, #EF4444 60%, transparent)',
                    boxShadow: `
                      0 8px 32px color-mix(in srgb, #EF4444 30%, transparent),
                      inset 0 2px 0 rgba(255,255,255,0.2)
                    `
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <SpatialIcon Icon={ICONS.Trash2} size={18} className="text-white" />
                    <span className="font-bold">
                      {isProcessing && !capturedPhoto ? 'Interrompre l\'analyse et Quitter' : 
                       isProcessing ? 'Interrompre et Quitter' : 'Jeter et Quitter'}
                    </span>
                  </div>
                </button>

                {/* Annuler */}
                <button
                  onClick={() => {
                    click();
                    onCancel();
                  }}
                  className="w-full btn-glass--secondary-nav py-3"
                >
                  <div className="flex items-center justify-center gap-3">
                    <SpatialIcon Icon={ICONS.X} size={18} />
                    <span className="font-medium">
                      {isProcessing && !capturedPhoto ? 'Continuer l\'analyse' : 'Continuer le Scan'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Info supplémentaire */}
              <div 
                className="mt-4 p-3 rounded-xl text-center"
                style={{
                  background: `color-mix(in srgb, ${modalContent.color} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${modalContent.color} 20%, transparent)`
                }}
              >
                <p className="text-white/70 text-sm">
                  {isProcessing && !capturedPhoto ?
                    'L\'analyse IA sera interrompue et devra être relancée.' :
                    isProcessing ? 
                    'L\'analyse sera interrompue et devra être relancée.' :
                    hasResults ?
                    'Les résultats d\'analyse seront perdus si vous ne sauvegardez pas.' :
                    capturedPhoto ?
                    'Votre photo sera perdue et devra être reprise.' :
                    'Le système d\'analyse a rencontré une erreur technique.'
                  }
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScanExitConfirmationModal;