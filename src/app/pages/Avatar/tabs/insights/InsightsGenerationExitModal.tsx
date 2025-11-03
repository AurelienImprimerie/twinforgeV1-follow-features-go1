import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';

interface InsightsGenerationExitModalProps {
  isOpen: boolean;
  onDiscardAndExit: () => void;
  onCancel: () => void;
  isGenerating: boolean;
  hasError: boolean;
  fallbackUsed: boolean;
}

/**
 * Insights Generation Exit Modal
 * Modal de confirmation pour quitter le processus de génération d'insights IA
 */
const InsightsGenerationExitModal: React.FC<InsightsGenerationExitModalProps> = ({
  isOpen,
  onDiscardAndExit,
  onCancel,
  isGenerating,
  hasError,
  fallbackUsed,
}) => {
  const { click, error: errorSound } = useFeedback();

  // Déterminer le contenu de la modale selon l'état
  const getModalContent = () => {
    if (isGenerating) {
      return {
        title: 'Génération d\'Insights en Cours',
        message: 'Une analyse IA de votre morphologie est actuellement en cours. Si vous quittez maintenant, l\'analyse sera interrompue et les insights ne seront pas générés.',
        icon: 'Loader2' as const,
        color: '#8B5CF6',
        actionText: 'Interrompre l\'analyse et Quitter',
        cancelText: 'Continuer l\'analyse'
      };
    }
    
    if (hasError) {
      return {
        title: 'Erreur de Génération',
        message: 'Une erreur est survenue lors de la génération des insights. Vous pouvez quitter et réessayer plus tard, ou rester pour voir les insights de base disponibles.',
        icon: 'AlertTriangle' as const,
        color: '#EF4444',
        actionText: 'Quitter',
        cancelText: 'Rester et voir les insights de base'
      };
    }
    
    if (fallbackUsed) {
      return {
        title: 'Insights de Base Disponibles',
        message: 'L\'atelier d\'analyse n\'était pas disponible, mais des insights basés sur des règles ont été forgés. Voulez-vous quitter ou consulter ces insights ?',
        icon: 'Info' as const,
        color: '#F59E0B',
        actionText: 'Quitter',
        cancelText: 'Consulter les insights'
      };
    }
    
    return {
      title: 'Quitter les Insights',
      message: 'Êtes-vous sûr de vouloir quitter la section insights ?',
      icon: 'AlertCircle' as const,
      color: '#6B7280',
      actionText: 'Quitter',
      cancelText: 'Rester'
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
                    className={isGenerating ? 'animate-spin' : ''}
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
                {/* Action principale (Quitter/Interrompre) */}
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
                    <SpatialIcon Icon={ICONS.X} size={18} className="text-white" />
                    <span className="font-bold">{modalContent.actionText}</span>
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
                    <SpatialIcon Icon={ICONS.ArrowLeft} size={18} />
                    <span className="font-medium">{modalContent.cancelText}</span>
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
                  {isGenerating ?
                    'L\'analyse IA sera interrompue et devra être relancée.' :
                    hasError ?
                    'Vous pourrez réessayer la génération d\'insights plus tard.' :
                    fallbackUsed ?
                    'Les insights de base fournissent des informations utiles sur votre morphologie.' :
                    'Vous pourrez revenir consulter vos insights à tout moment.'
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

export default InsightsGenerationExitModal;