import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import type { IconName } from '@/ui/icons/registry';

const FEATURES = [
  {
    icon: 'Brain',
    title: 'IA Adaptive',
    description: 'Le système analyse vos données pour générer des recommandations personnalisées',
    color: '#A855F7'
  },
  {
    icon: 'Target',
    title: 'Actions Prioritaires',
    description: 'Recevez des actions classées par impact et urgence pour optimiser votre temps',
    color: '#F59E0B'
  },
  {
    icon: 'TrendingUp',
    title: 'Transformation Guidée',
    description: 'Suivez un parcours intelligent adapté à vos objectifs et votre progression',
    color: '#10B981'
  }
] as const;

interface NextActionsEmptyStateProps {
  onRefresh?: () => void;
}

export function NextActionsEmptyState({ onRefresh }: NextActionsEmptyStateProps) {
  return (
    <div className="text-center py-10 px-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <div className="relative inline-block">
          <motion.div
            className="absolute inset-0 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <SpatialIcon name="Sparkles" size={64} className="relative" color="#F59E0B" />
        </div>
      </motion.div>

      <motion.h3
        className="text-2xl font-bold mb-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Système d'Intelligence Adaptatif
      </motion.h3>

      <motion.p
        className="text-sm opacity-70 mb-10 max-w-lg mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Utilisez les Forges pour alimenter l'IA. Plus vous fournissez de données,
        plus les recommandations seront précises et impactantes.
      </motion.p>

      <div className="space-y-6 max-w-2xl mx-auto mb-10">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="flex items-start gap-4 text-left p-5 rounded-xl"
            style={{
              background: `color-mix(in srgb, ${feature.color} 6%, transparent)`,
              border: `1px solid color-mix(in srgb, ${feature.color} 20%, transparent)`
            }}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.15 }}
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: `color-mix(in srgb, ${feature.color} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${feature.color} 35%, transparent)`
              }}
            >
              <SpatialIcon name={feature.icon as IconName} size={24} color={feature.color} />
            </div>

            <div className="flex-1 pt-1">
              <h4 className="font-bold mb-1 text-base">{feature.title}</h4>
              <p className="text-sm opacity-70 leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {onRefresh && (
        <motion.button
          onClick={onRefresh}
          className="px-6 py-3 rounded-xl font-medium transition-all inline-flex items-center gap-2"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#F59E0B'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SpatialIcon name="RefreshCw" size={18} />
          Vérifier les nouvelles recommandations
        </motion.button>
      )}

      <motion.div
        className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <SpatialIcon name="Lightbulb" size={16} className="opacity-70" />
        <span className="text-xs opacity-70">
          Les actions seront générées automatiquement dès que vous utilisez les Forges
        </span>
      </motion.div>
    </div>
  );
}
