import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedback } from '../../hooks/useFeedback';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import logger from '../../lib/utils/logger';

interface UpdateNotificationProps {
  isVisible: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
  updateInfo?: {
    version?: string;
    features?: string[];
    isRequired?: boolean;
  };
}

/**
 * Update Notification Component - TwinForge PWA Updates
 * Notifies users when a new version of the PWA is available
 */
const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  isVisible,
  onUpdate,
  onDismiss,
  updateInfo,
}) => {
  const { success, click } = useFeedback();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      logger.info('PWA_UPDATE', 'User initiated app update', {
        version: updateInfo?.version,
        isRequired: updateInfo?.isRequired,
        timestamp: new Date().toISOString()
      });

      success();
      await onUpdate();
      
      logger.info('PWA_UPDATE', 'App update completed', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('PWA_UPDATE', 'App update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    click();
    onDismiss();
    
    logger.info('PWA_UPDATE', 'Update notification dismissed', {
      version: updateInfo?.version,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <GlassCard 
            className="p-5"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--brand-accent) 15%, transparent) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--brand-primary) 10%, transparent) 0%, transparent 50%),
                var(--glass-opacity)
              `,
              borderColor: 'color-mix(in srgb, var(--brand-accent) 35%, transparent)',
              boxShadow: `
                0 16px 48px rgba(0, 0, 0, 0.3),
                0 0 40px color-mix(in srgb, var(--brand-accent) 25%, transparent),
                inset 0 2px 0 rgba(255, 255, 255, 0.2)
              `,
              backdropFilter: 'blur(24px) saturate(170%)'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, var(--brand-accent) 40%, transparent), color-mix(in srgb, var(--brand-accent) 30%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, var(--brand-accent) 50%, transparent)',
                  boxShadow: '0 0 25px color-mix(in srgb, var(--brand-accent) 40%, transparent)'
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <SpatialIcon 
                    Icon={ICONS.Download} 
                    size={20} 
                    style={{ color: 'var(--brand-accent)' }}
                  />
                </motion.div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg mb-2">
                  Nouvelle Version Disponible
                </h4>
                <p className="text-white/80 text-sm mb-3 leading-relaxed">
                  Une mise à jour de TwinForge est disponible avec de nouvelles fonctionnalités et améliorations.
                </p>
                
                {updateInfo?.features && updateInfo.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-white/60 text-xs mb-2">Nouveautés :</p>
                    <div className="space-y-1">
                      {updateInfo.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-cyan-400" />
                          <span className="text-white/70 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="btn-glass--primary px-4 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {isUpdating ? (
                        <SpatialIcon Icon={ICONS.Loader2} size={14} className="animate-spin" />
                      ) : (
                        <SpatialIcon Icon={ICONS.Download} size={14} />
                      )}
                      <span>{isUpdating ? 'Mise à jour...' : 'Mettre à jour'}</span>
                    </div>
                  </button>
                  
                  {!updateInfo?.isRequired && (
                    <button
                      onClick={handleDismiss}
                      className="btn-glass--secondary-nav px-3 py-2 text-sm"
                    >
                      Plus tard
                    </button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;