import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

export const NoScanState: React.FC = () => {
  return (
    <div className="space-y-6 w-full">
      <GlassCard 
        className="text-center p-8"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-body-scan-primary) 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity-base)
          `,
          borderColor: 'color-mix(in srgb, var(--color-body-scan-primary) 25%, transparent)',
          boxShadow: `
            var(--glass-shadow-sm),
            0 0 16px color-mix(in srgb, var(--color-body-scan-primary) 10%, transparent)
          `
        }}
      >
        <motion.div
          className="bodyscan-size-3xl bodyscan-absolute-center-x mb-6 bodyscan-rounded-full bodyscan-flex-center bodyscan-relative"
          style={{
            background: 'color-mix(in srgb, var(--color-body-scan-primary) 20%, transparent)',
            border: '2px solid color-mix(in srgb, var(--color-body-scan-primary) 40%, transparent)',
            boxShadow: '0 0 30px color-mix(in srgb, var(--color-body-scan-primary) 30%, transparent)'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <SpatialIcon Icon={ICONS.Scan} size={40} style={{ color: 'var(--color-body-scan-primary)' }} variant="pure" />
          <motion.div
            className="bodyscan-absolute-fill bodyscan-rounded-full bodyscan-border-2"
            style={{ borderColor: 'color-mix(in srgb, var(--color-body-scan-primary) 40%, transparent)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-3">
          Aucun scan disponible
        </h3>
        <p className="text-white/70 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Effectuez un scan corporel pour débloquer vos insights morphologiques personnalisés.
        </p>
        
        <button 
          className="btn-glass--primary px-8 py-4 text-lg font-semibold"
          onClick={() => {}}
        >
          <div className="bodyscan-flex-center bodyscan-gap-md">
            <SpatialIcon Icon={ICONS.Camera} size={20} />
            <span>Commencer le scan corporel</span>
          </div>
        </button>
      </GlassCard>
    </div>
  );
};