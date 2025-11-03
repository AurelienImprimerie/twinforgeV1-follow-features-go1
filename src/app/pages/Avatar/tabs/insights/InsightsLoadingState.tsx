import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

export const InsightsLoadingState: React.FC = () => {
  return (
    <div className="space-y-6 w-full">
      <GlassCard 
        className="text-center p-8"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-body-scan-warning) 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity-base)
          `,
          borderColor: 'color-mix(in srgb, var(--color-body-scan-warning) 25%, transparent)',
          boxShadow: `
            var(--glass-shadow-sm),
            0 0 16px color-mix(in srgb, var(--color-body-scan-warning) 10%, transparent)
          `
        }}
      >
        <div className="flex flex-col items-center justify-center gap-6">
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{
              background: 'color-mix(in srgb, var(--color-body-scan-warning) 20%, transparent)',
              border: '2px solid color-mix(in srgb, var(--color-body-scan-warning) 40%, transparent)',
              boxShadow: '0 0 30px color-mix(in srgb, var(--color-body-scan-warning) 30%, transparent)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <SpatialIcon Icon={ICONS.Loader2} size={32} style={{ color: 'var(--color-body-scan-warning)' }} variant="pure" className="loader-essential" />
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: 'color-mix(in srgb, var(--color-body-scan-warning) 40%, transparent)' }}
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
        
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-white">Génération d'insights...</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Nos systèmes analysent votre morphologie pour générer des recommandations personnalisées
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};