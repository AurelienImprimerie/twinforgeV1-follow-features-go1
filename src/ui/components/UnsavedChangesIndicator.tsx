/**
 * Unsaved Changes Indicator
 * Visual indicator showing user has unsaved changes with quick save action
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';

interface UnsavedChangesIndicatorProps {
  isDirty: boolean;
  onSave: () => void;
  isSaving: boolean;
  isValid?: boolean;
  modifiedFieldsCount?: number;
  className?: string;
}

const UnsavedChangesIndicator: React.FC<UnsavedChangesIndicatorProps> = ({
  isDirty,
  onSave,
  isSaving,
  isValid = true,
  modifiedFieldsCount = 0,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`sticky top-0 z-40 ${className}`}
        >
          <GlassCard
            className="p-4"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 60%),
                var(--glass-opacity)
              `,
              borderColor: 'rgba(245, 158, 11, 0.4)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.2),
                0 0 20px rgba(245, 158, 11, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left side: Warning info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <motion.div
                  className="relative flex-shrink-0"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                        linear-gradient(135deg, rgba(245, 158, 11, 0.4), rgba(245, 158, 11, 0.2))
                      `,
                      border: '2px solid rgba(245, 158, 11, 0.6)',
                      boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    <SpatialIcon
                      Icon={ICONS.AlertTriangle}
                      size={20}
                      style={{ color: '#F59E0B' }}
                      variant="pure"
                    />
                  </div>

                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2px solid #F59E0B',
                    }}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="text-amber-300 font-semibold text-base flex items-center gap-2">
                    Modifications non sauvegardées
                    {modifiedFieldsCount > 0 && (
                      <span className="text-amber-400/70 text-sm font-normal">
                        ({modifiedFieldsCount} champ{modifiedFieldsCount > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                  <div className="text-white/70 text-sm mt-0.5">
                    Vos modifications seront perdues si vous quittez sans sauvegarder
                  </div>
                </div>
              </div>

              {/* Right side: Save button */}
              <button
                onClick={onSave}
                disabled={isSaving || !isValid}
                className="btn-glass--primary px-6 py-3 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                }}
              >
                <div className="flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <SpatialIcon Icon={ICONS.Loader2} size={18} className="animate-spin" style={{ color: '#F59E0B' }} />
                      <span className="text-amber-300 font-medium whitespace-nowrap">Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <SpatialIcon Icon={ICONS.Save} size={18} style={{ color: '#F59E0B' }} />
                      <span className="text-amber-300 font-medium whitespace-nowrap">
                        {!isValid ? 'Erreurs' : 'Sauvegarder'}
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnsavedChangesIndicator;
