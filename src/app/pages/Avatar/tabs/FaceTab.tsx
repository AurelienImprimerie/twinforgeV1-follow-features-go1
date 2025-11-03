// src/app/pages/Avatar/tabs/FaceTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import { ConditionalMotion } from '../../../../lib/motion/ConditionalMotion';

/**
 * Face Tab - Feature à venir
 * L'onglet scan facial sera disponible dans une future version
 */
const FaceTab: React.FC = () => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <div className="space-y-6 w-full">
      <ConditionalMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard
          className="p-8 text-center"
          interactive
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.12) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
              var(--glass-opacity-base)
            `,
            borderColor: 'rgba(236, 72, 153, 0.3)',
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px rgba(236, 72, 153, 0.2),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `
          }}
        >
          {/* Icon principal */}
          <ConditionalMotion
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, rgba(236, 72, 153, 0.35), rgba(236, 72, 153, 0.25))
              `,
              border: '2px solid rgba(236, 72, 153, 0.5)',
              boxShadow: '0 0 40px rgba(236, 72, 153, 0.4)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
          >
            <SpatialIcon
              Icon={ICONS.Clock}
              size={48}
              style={{ color: '#EC4899' }}
              variant="pure"
            />

            {/* Pulse ring */}
            {!isPerformanceMode && (
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: 'rgba(236, 72, 153, 0.4)' }}
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
            )}
          </ConditionalMotion>

          {/* Message */}
          <ConditionalMotion
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-3xl font-bold mb-3" style={{ color: '#EC4899' }}>
              Scan Facial
            </h3>
            <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto">
              Cette fonctionnalité sera disponible prochainement
            </p>
          </ConditionalMotion>

          {/* Info Card */}
          <ConditionalMotion
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8 p-4 rounded-xl"
            style={{
              background: 'rgba(236, 72, 153, 0.08)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              backdropFilter: 'blur(12px) saturate(130%)'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: '#EC4899' }} />
              <span className="text-white font-medium text-sm">À venir</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Concentrez-vous sur votre scan corporel pour créer votre avatar complet.
              Le scan facial sera ajouté dans une prochaine mise à jour.
            </p>
          </ConditionalMotion>
        </GlassCard>
      </ConditionalMotion>
    </div>
  );
};

export default FaceTab;
