import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { useFeedback } from '../../hooks/useFeedback';
import { useExitModalStore } from '../../system/store/exitModalStore';

/**
 * Global Exit Modal - Modal de Confirmation de Sortie Global
 * Rendu directement dans document.body avec z-index maximum
 */
const GlobalExitModal: React.FC = () => {
  const {
    isOpen,
    title,
    message,
    processName,
    dirtyFields,
    confirmExit,
    cancelExit,
    saveAndExit,
    onSaveAndExit
  } = useExitModalStore();
  
  const { click, error: errorSound, success: successSound } = useFeedback();
  const [isSaving, setIsSaving] = React.useState(false);

  // Log de rendu immédiat
  React.useEffect(() => {
    if (isOpen) {
      console.log('🚨 GLOBAL_EXIT_MODAL: Rendering modal immediately', {
        isOpen,
        title,
        processName,
        timestamp: new Date().toISOString(),
        bodyExists: !!document.body,
        modalRootExists: !!document.getElementById('modal-root')
      });
    }
  }, [isOpen, title, processName]);

  const handleConfirm = () => {
    console.log('🚨 GLOBAL_EXIT_MODAL: Confirm clicked', {
      timestamp: new Date().toISOString()
    });
    errorSound(); // Son d'avertissement
    confirmExit();
  };

  const handleCancel = () => {
    console.log('🚨 GLOBAL_EXIT_MODAL: Cancel clicked', {
      timestamp: new Date().toISOString()
    });
    click(); // Son normal
    cancelExit();
  };

  const handleSaveAndExit = async () => {
    console.log('🚨 GLOBAL_EXIT_MODAL: Save and exit clicked', {
      timestamp: new Date().toISOString()
    });
    setIsSaving(true);
    try {
      await saveAndExit();
      successSound();
    } catch (error) {
      console.error('🚨 GLOBAL_EXIT_MODAL: Save failed', error);
      errorSound();
    } finally {
      setIsSaving(false);
    }
  };

  // Fermer avec ESC
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Rendu direct dans document.body avec z-index maximum
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="global-exit-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999, // Z-index maximum
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-exit-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 25,
              mass: 0.8
            }}
            className="p-4 md:p-8 text-center"
            style={{
              width: '100%',
              maxWidth: '28rem',
              position: 'relative',
              zIndex: 1000000, // Z-index encore plus élevé pour le contenu
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard 
              className="p-8 text-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, #EF4444 20%, transparent) 0%, transparent 60%),
                  radial-gradient(circle at 70% 80%, color-mix(in srgb, #F59E0B 15%, transparent) 0%, transparent 50%),
                  linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)),
                  rgba(11, 14, 23, 0.95)
                `,
                borderColor: 'color-mix(in srgb, #EF4444 40%, transparent)',
                boxShadow: `
                  0 25px 80px rgba(0, 0, 0, 0.6),
                  0 0 60px color-mix(in srgb, #EF4444 30%, transparent),
                  0 0 120px color-mix(in srgb, #F59E0B 20%, transparent),
                  inset 0 3px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -3px 0 rgba(0, 0, 0, 0.2)
                `,
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                position: 'relative',
                zIndex: 1000001,
              }}
            >
              {/* Icône d'Avertissement */}
              <div className="mb-4 md:mb-6">
                <div
                  className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full flex items-center justify-center breathing-icon"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%),
                      radial-gradient(circle at 70% 70%, color-mix(in srgb, #EF4444 25%, transparent) 0%, transparent 50%),
                      linear-gradient(135deg, color-mix(in srgb, #EF4444 50%, transparent), color-mix(in srgb, #F59E0B 40%, transparent))
                    `,
                    border: '4px solid color-mix(in srgb, #EF4444 80%, transparent)',
                    boxShadow: `
                      0 0 50px color-mix(in srgb, #EF4444 80%, transparent),
                      0 0 100px color-mix(in srgb, #EF4444 60%, transparent),
                      0 0 150px color-mix(in srgb, #F59E0B 50%, transparent),
                      inset 0 4px 0 rgba(255,255,255,0.6),
                      inset 0 -3px 0 rgba(0,0,0,0.3)
                    `,
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)'
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS.AlertTriangle}
                    size={window.innerWidth < 768 ? 64 : 72}
                    style={{
                      color: '#EF4444',
                      filter: `
                        drop-shadow(0 0 16px color-mix(in srgb, #EF4444 100%, transparent))
                        drop-shadow(0 0 32px color-mix(in srgb, #EF4444 80%, transparent))
                        drop-shadow(0 0 48px color-mix(in srgb, #F59E0B 60%, transparent))
                      `
                    }}
                    variant="pure"
                  />
                </div>
              </div>

              {/* Titre et Message */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <h2 
                  id="global-exit-modal-title"
                  className="text-xl md:text-3xl font-bold text-white leading-tight"
                >
                  {title}
                </h2>
                <p className="text-white/90 text-sm md:text-lg leading-relaxed max-w-sm mx-auto px-2">
                  {message}
                </p>
                
                {/* Badge du Processus */}
                <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full" style={{
                  background: 'color-mix(in srgb, #F59E0B 20%, transparent)',
                  border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
                  backdropFilter: 'blur(16px) saturate(140%)'
                }}>
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-orange-300 text-sm md:text-base font-bold">{processName} Actif</span>
                </div>

                {/* Champs Modifiés */}
                {dirtyFields && dirtyFields.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl" style={{
                    background: 'color-mix(in srgb, #3B82F6 15%, transparent)',
                    border: '2px solid color-mix(in srgb, #3B82F6 30%, transparent)',
                    backdropFilter: 'blur(16px)'
                  }}>
                    <div className="flex items-start gap-2 mb-2">
                      <SpatialIcon Icon={ICONS.AlertCircle} size={16} className="text-blue-400 mt-0.5" />
                      <h4 className="text-blue-300 font-semibold text-sm">Champs non sauvegardés :</h4>
                    </div>
                    <div className="space-y-2 text-left">
                      {dirtyFields.map((info, idx) => (
                        <div key={idx} className="text-blue-200 text-sm">
                          <span className="font-medium text-blue-300">{info.section}</span>
                          {info.fields && info.fields.length > 0 && (
                            <span className="text-blue-200/80"> : {info.fields.join(', ')}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
                {/* Bouton Sauvegarder et Quitter (affiché uniquement si onSaveAndExit existe) */}
                {onSaveAndExit && (
                  <button
                    onClick={handleSaveAndExit}
                    disabled={isSaving}
                    className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-xl font-bold rounded-full relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg,
                        color-mix(in srgb, #3B82F6 85%, transparent),
                        color-mix(in srgb, #60A5FA 70%, transparent)
                      )`,
                      border: '3px solid color-mix(in srgb, #3B82F6 70%, transparent)',
                      boxShadow: `
                        0 16px 50px color-mix(in srgb, #3B82F6 50%, transparent),
                        0 0 80px color-mix(in srgb, #3B82F6 40%, transparent),
                        inset 0 4px 0 rgba(255,255,255,0.5)
                      `,
                      backdropFilter: 'blur(24px) saturate(170%)',
                      color: '#fff',
                      transition: 'all 0.2s ease',
                      opacity: isSaving ? 0.6 : 1,
                      cursor: isSaving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                      <SpatialIcon
                        Icon={isSaving ? ICONS.Loader2 : ICONS.Save}
                        size={window.innerWidth < 768 ? 18 : 24}
                        className={isSaving ? 'text-white animate-spin' : 'text-white'}
                      />
                      <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder et Quitter'}</span>
                    </div>
                  </button>
                )}

                {/* Bouton Quitter */}
                <button
                  onClick={handleConfirm}
                  disabled={isSaving}
                  className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-xl font-bold rounded-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, 
                      color-mix(in srgb, #EF4444 85%, transparent), 
                      color-mix(in srgb, #F59E0B 70%, transparent)
                    )`,
                    border: '3px solid color-mix(in srgb, #EF4444 70%, transparent)',
                    boxShadow: `
                      0 16px 50px color-mix(in srgb, #EF4444 50%, transparent),
                      0 0 80px color-mix(in srgb, #EF4444 40%, transparent),
                      inset 0 4px 0 rgba(255,255,255,0.5)
                    `,
                    backdropFilter: 'blur(24px) saturate(170%)',
                    color: '#fff',
                    transition: 'all 0.2s ease',
                    opacity: isSaving ? 0.5 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <SpatialIcon Icon={ICONS.LogOut} size={window.innerWidth < 768 ? 18 : 24} className="text-white" />
                    <span>Quitter</span>
                  </div>
                </button>

                {/* Bouton Continuer */}
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-xl font-bold rounded-full"
                  style={{
                    background: `linear-gradient(135deg, 
                      color-mix(in srgb, #22C55E 80%, transparent), 
                      color-mix(in srgb, #10B981 60%, transparent)
                    )`,
                    border: '3px solid color-mix(in srgb, #22C55E 70%, transparent)',
                    boxShadow: `
                      0 16px 50px color-mix(in srgb, #22C55E 50%, transparent),
                      0 0 80px color-mix(in srgb, #22C55E 40%, transparent),
                      inset 0 4px 0 rgba(255,255,255,0.5)
                    `,
                    backdropFilter: 'blur(24px) saturate(170%)',
                    color: '#fff',
                    opacity: isSaving ? 0.5 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <SpatialIcon Icon={ICONS.ArrowLeft} size={window.innerWidth < 768 ? 18 : 24} className="text-white" />
                    <span>Continuer</span>
                  </div>
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // Rendu direct dans document.body
  );
};

export default GlobalExitModal;