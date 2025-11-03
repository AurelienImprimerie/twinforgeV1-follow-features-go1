import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useFeedback } from '../../hooks/useFeedback';
import { useToast } from './ToastProvider';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import logger from '../../lib/utils/logger';

interface InstallPromptProps {
  className?: string;
  variant?: 'banner' | 'card' | 'floating';
  autoShow?: boolean;
  onInstallSuccess?: () => void;
  onDismiss?: () => void;
}

/**
 * Get platform-specific installation instructions
 */
function getPlatformInstructions(platform: string): {
  title: string;
  instructions: string[];
  icon: keyof typeof ICONS;
} {
  switch (platform) {
    case 'ios':
      return {
        title: 'Installer TwinForge sur iOS',
        instructions: [
          'Appuyez sur l\'icône Partager en bas de l\'écran',
          'Faites défiler et sélectionnez "Sur l\'écran d\'accueil"',
          'Appuyez sur "Ajouter" pour confirmer'
        ],
        icon: 'Smartphone'
      };
    case 'android':
      return {
        title: 'Installer TwinForge sur Android',
        instructions: [
          'Appuyez sur "Installer" dans la bannière',
          'Ou utilisez le menu ⋮ > "Installer l\'application"',
          'Confirmez l\'installation'
        ],
        icon: 'Smartphone'
      };
    case 'desktop':
      return {
        title: 'Installer TwinForge sur Desktop',
        instructions: [
          'Cliquez sur l\'icône d\'installation dans la barre d\'adresse',
          'Ou utilisez le menu ⋮ > "Installer TwinForge"',
          'Confirmez l\'installation'
        ],
        icon: 'Monitor'
      };
    default:
      return {
        title: 'Installer TwinForge',
        instructions: [
          'Recherchez l\'option "Installer" dans votre navigateur',
          'Suivez les instructions de votre appareil',
          'Profitez de l\'expérience native'
        ],
        icon: 'Download'
      };
  }
}

/**
 * Install Prompt Component - TwinForge PWA Installation
 * Provides guided PWA installation experience with platform-specific instructions
 */
const InstallPrompt: React.FC<InstallPromptProps> = ({
  className = '',
  variant = 'card',
  autoShow = true,
  onInstallSuccess,
  onDismiss,
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    platform, 
    canShowPrompt, 
    showInstallPrompt, 
    dismissInstallPrompt 
  } = usePWAInstall();
  
  const { success, click } = useFeedback();
  const { showToast } = useToast();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || !isInstallable || (isDismissed && !autoShow)) {
    return null;
  }

  const platformInstructions = getPlatformInstructions(platform);

  const handleInstall = async () => {
    if (!canShowPrompt) {
      // Show manual instructions for platforms that don't support programmatic install
      setShowInstructions(true);
      return;
    }

    setIsInstalling(true);
    
    try {
      logger.info('PWA_INSTALL_PROMPT', 'User initiated installation', {
        platform,
        variant,
        timestamp: new Date().toISOString()
      });

      const installSuccess = await showInstallPrompt();
      
      if (installSuccess) {
        success();
        showToast({
          type: 'success',
          title: 'Installation réussie !',
          message: 'TwinForge a été ajouté à votre écran d\'accueil',
          duration: 4000,
        });
        
        onInstallSuccess?.();
        
        logger.info('PWA_INSTALL_PROMPT', 'Installation completed successfully', {
          platform,
          timestamp: new Date().toISOString()
        });
      } else {
        showToast({
          type: 'info',
          title: 'Installation annulée',
          message: 'Vous pouvez installer TwinForge plus tard depuis le menu du navigateur',
          duration: 3000,
        });
      }
    } catch (error) {
      logger.error('PWA_INSTALL_PROMPT', 'Installation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        platform,
        timestamp: new Date().toISOString()
      });
      
      showToast({
        type: 'error',
        title: 'Erreur d\'installation',
        message: 'Impossible d\'installer l\'application. Réessayez plus tard.',
        duration: 4000,
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    click();
    setIsDismissed(true);
    dismissInstallPrompt();
    onDismiss?.();
    
    logger.info('PWA_INSTALL_PROMPT', 'Install prompt dismissed', {
      platform,
      variant,
      timestamp: new Date().toISOString()
    });
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  // Render based on variant
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-20 left-4 right-4 z-50 ${className}`}
      >
        <GlassCard 
          className="p-4"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)',
            backdropFilter: 'blur(16px) saturate(150%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Download} size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Installer TwinForge</h4>
                <p className="text-white/70 text-xs">Accès rapide depuis votre écran d'accueil</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="btn-glass--primary px-4 py-2 text-sm"
              >
                {isInstalling ? 'Installation...' : 'Installer'}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <SpatialIcon Icon={ICONS.X} size={14} className="text-white/60" />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`fixed bottom-24 right-4 z-40 ${className}`}
      >
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 80%, transparent), color-mix(in srgb, var(--brand-accent) 60%, transparent))
            `,
            border: '2px solid color-mix(in srgb, var(--brand-primary) 60%, transparent)',
            backdropFilter: 'blur(16px) saturate(150%)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.25),
              0 0 20px color-mix(in srgb, var(--brand-primary) 20%, transparent)
            `
          }}
          title="Installer TwinForge"
        >
          <SpatialIcon 
            Icon={isInstalling ? ICONS.Loader2 : ICONS.Download} 
            size={20} 
            className={`text-white ${isInstalling ? 'animate-spin' : ''}`}
          />
        </button>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={className}
      >
        <GlassCard 
          className="p-6"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--brand-accent) 8%, transparent) 0%, transparent 50%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)',
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, var(--brand-primary) 15%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 30%, transparent), color-mix(in srgb, var(--brand-accent) 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, var(--brand-primary) 40%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, var(--brand-primary) 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS[platformInstructions.icon]} size={20} style={{ color: 'var(--brand-primary)' }} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">
                Installer TwinForge
              </h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Installez TwinForge sur votre appareil pour un accès rapide et une expérience optimisée.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="btn-glass--primary px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    {isInstalling ? (
                      <SpatialIcon Icon={ICONS.Loader2} size={16} className="animate-spin" />
                    ) : (
                      <SpatialIcon Icon={ICONS.Download} size={16} />
                    )}
                    <span>{isInstalling ? 'Installation...' : 'Installer'}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowInstructions(true)}
                  className="btn-glass--secondary-nav px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <SpatialIcon Icon={ICONS.Info} size={16} />
                    <span>Instructions</span>
                  </div>
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="btn-glass--secondary-nav px-3 py-2"
                  title="Fermer"
                >
                  <SpatialIcon Icon={ICONS.X} size={16} />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseInstructions();
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
                className="p-6"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--brand-accent) 12%, transparent) 0%, transparent 60%),
                    var(--glass-opacity)
                  `,
                  borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)',
                  backdropFilter: 'blur(24px) saturate(160%)'
                }}
              >
                <div className="text-center mb-6">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                        linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 35%, transparent), color-mix(in srgb, var(--brand-accent) 25%, transparent))
                      `,
                      border: '2px solid color-mix(in srgb, var(--brand-accent) 50%, transparent)',
                      boxShadow: '0 0 30px color-mix(in srgb, var(--brand-accent) 40%, transparent)'
                    }}
                  >
                    <SpatialIcon 
                      Icon={ICONS[platformInstructions.icon]} 
                      size={28} 
                      style={{ color: 'var(--brand-accent)' }}
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {platformInstructions.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    Suivez ces étapes pour installer TwinForge sur votre {platform === 'ios' ? 'iPhone/iPad' : platform === 'android' ? 'appareil Android' : 'ordinateur'}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {platformInstructions.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)',
                          color: 'var(--brand-accent)',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {instruction}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  {canShowPrompt && (
                    <button
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="flex-1 btn-glass--primary py-3"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isInstalling ? (
                          <SpatialIcon Icon={ICONS.Loader2} size={16} className="animate-spin" />
                        ) : (
                          <SpatialIcon Icon={ICONS.Download} size={16} />
                        )}
                        <span>{isInstalling ? 'Installation...' : 'Installer Maintenant'}</span>
                      </div>
                    </button>
                  )}
                  
                  <button
                    onClick={handleCloseInstructions}
                    className="btn-glass--secondary-nav px-4 py-3"
                  >
                    <span>Fermer</span>
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPrompt;