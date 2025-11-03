import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface InsightsErrorStateProps {
  error: Error;
}

export const InsightsErrorState: React.FC<InsightsErrorStateProps> = ({ error }) => {
  return (
    <div className="space-y-6 w-full">
      <GlassCard 
        className="text-center p-8"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-body-scan-error) 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity-base)
          `,
          borderColor: 'color-mix(in srgb, var(--color-body-scan-error) 25%, transparent)',
          boxShadow: `
            var(--glass-shadow-sm),
            0 0 16px color-mix(in srgb, var(--color-body-scan-error) 10%, transparent)
          `
        }}
      >
        <motion.div
          className="bodyscan-size-2xl bodyscan-absolute-center-x mb-6 bodyscan-rounded-full bodyscan-flex-center"
          style={{
            background: 'color-mix(in srgb, var(--color-body-scan-error) 20%, transparent)',
            border: '2px solid color-mix(in srgb, var(--color-body-scan-error) 40%, transparent)',
            boxShadow: '0 0 30px color-mix(in srgb, var(--color-body-scan-error) 30%, transparent)'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <SpatialIcon Icon={ICONS.AlertCircle} size={32} style={{ color: 'var(--color-body-scan-error)' }} variant="pure" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-white mb-3">Erreur de génération d'insights</h3>
        <p className="bodyscan-text-error text-sm mb-6 leading-relaxed max-w-md mx-auto">
          {error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération des insights.'}
        </p>
        
        <button 
          className="btn-glass--primary px-6 py-3"
          onClick={() => window.location.reload()}
        >
          <div className="bodyscan-flex-center bodyscan-gap-sm">
            <SpatialIcon Icon={ICONS.RotateCcw} size={16} />
            <span>Réessayer</span>
          </div>
        </button>
      </GlassCard>
    </div>
  );
};