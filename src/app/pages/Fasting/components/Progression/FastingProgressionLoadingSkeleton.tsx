import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';

interface FastingProgressionLoadingSkeletonProps {
  className?: string;
}

/**
 * Fasting Progression Loading Skeleton - Squelette de Chargement de Progression
 * Animation de chargement pour l'onglet Progression pendant l'agrégation des données
 */
const FastingProgressionLoadingSkeleton: React.FC<FastingProgressionLoadingSkeletonProps> = ({
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Data Processing Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard 
          className="p-6 text-center"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 15%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #3B82F6 12%, transparent) 0%, transparent 50%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #06B6D4 30%, transparent)',
            boxShadow: `
              0 16px 48px rgba(0, 0, 0, 0.3),
              0 0 40px color-mix(in srgb, #06B6D4 25%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.2)
            `,
            backdropFilter: 'blur(24px) saturate(170%)'
          }}
        >
          <div className="space-y-4">
            <motion.div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #06B6D4 40%, transparent), color-mix(in srgb, #3B82F6 30%, transparent))
                `,
                border: '3px solid color-mix(in srgb, #06B6D4 60%, transparent)',
                boxShadow: `
                  0 0 40px color-mix(in srgb, #06B6D4 60%, transparent),
                  0 0 80px color-mix(in srgb, #06B6D4 40%, transparent)
                `
              }}
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 40px color-mix(in srgb, #06B6D4 60%, transparent)',
                  '0 0 60px color-mix(in srgb, #06B6D4 80%, transparent)',
                  '0 0 40px color-mix(in srgb, #06B6D4 60%, transparent)'
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <SpatialIcon 
                Icon={ICONS.BarChart3} 
                size={40} 
                style={{ color: '#06B6D4' }}
                className="animate-pulse"
              />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Analyse IA de Progression
              </h3>
              <p className="text-white/80 text-lg">
                GPT-5 mini analyse vos données de progression...
              </p>
            </div>
            
            {/* Processing Steps */}
            <div className="space-y-2 max-w-md mx-auto">
              {[
                'Collecte des sessions de jeûne',
                'Calcul des métriques de progression',
                'Analyse narrative avec GPT-5 mini',
                'Génération des recommandations IA'
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.2 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-cyan-400"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: index * 0.3 
                    }}
                  />
                  <span className="text-white/70 text-sm">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Skeleton Cards */}
      <div className="space-y-4">
        {/* Summary Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 bg-white/10 rounded w-48 animate-pulse" />
                <div className="h-3 bg-white/10 rounded w-32 animate-pulse" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-white/5">
                  <div className="h-8 bg-white/10 rounded w-16 mx-auto mb-2 animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-20 mx-auto animate-pulse" />
                </div>
              ))}
            </div>
            
            <div className="h-20 bg-white/10 rounded-xl animate-pulse" />
          </GlassCard>
        </motion.div>

        {/* Chart Skeletons */}
        {[1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-40 animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-24 animate-pulse" />
                </div>
              </div>
              
              <div className="h-32 bg-white/10 rounded-xl animate-pulse mb-4" />
              
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-3 bg-white/10 rounded animate-pulse" />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Processing Time Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20">
          <motion.div
            className="w-2 h-2 rounded-full bg-cyan-400"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity 
            }}
          />
          <span className="text-cyan-300 text-sm font-medium">
            Analyse IA en cours... (~20-60 secondes)
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default FastingProgressionLoadingSkeleton;