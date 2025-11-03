import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

interface AnalysisModule {
  icon: keyof typeof ICONS;
  label: string;
  sublabel: string;
  color: string;
  activeThreshold: number;
}

interface AnalysisInsightsGridProps {
  modules: AnalysisModule[];
  progress: number;
  themeColor: string;
  reduceMotion?: boolean;
  className?: string;
}

/**
 * Analysis Insights Grid - Grille de modules d'analyse
 * Composant réutilisable pour afficher les modules d'analyse avec états actifs
 * Utilisé pendant les phases de traitement (Body Scan, Face Scan)
 */
const AnalysisInsightsGrid: React.FC<AnalysisInsightsGridProps> = ({
  modules,
  progress,
  themeColor,
  reduceMotion = false,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {modules.map((module, index) => {
        const isActive = progress >= module.activeThreshold;

        return (
          <motion.div
            key={module.label}
            className="p-6 rounded-xl relative overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, ${module.color} ${isActive ? '15' : '8'}%, transparent) 0%, transparent 60%),
                rgba(255,255,255,${isActive ? '0.08' : '0.04'})
              `,
              border: `2px solid color-mix(in srgb, ${module.color} ${isActive ? '40' : '20'}%, transparent)`,
              backdropFilter: 'blur(12px) saturate(140%)',
              WebkitBackdropFilter: 'blur(12px) saturate(140%)',
              boxShadow: isActive ?
                `0 0 20px color-mix(in srgb, ${module.color} 30%, transparent)` :
                `0 0 8px color-mix(in srgb, ${module.color} 15%, transparent)`,
              transition: 'all 0.6s ease'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            {/* Indicateur d'État Actif */}
            {isActive && !reduceMotion && (
              <div
                className="absolute top-2 right-2 w-3 h-3 rounded-full"
                style={{
                  background: module.color,
                  boxShadow: `0 0 12px color-mix(in srgb, ${module.color} 80%, transparent)`,
                  animation: 'energyPulse 1.5s ease-in-out infinite'
                }}
              />
            )}

            {/* Icône du Module */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive && !reduceMotion ? 'breathing-icon' : ''
                }`}
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${module.color} 40%, transparent), color-mix(in srgb, ${module.color} 30%, transparent))
                  `,
                  border: `2px solid color-mix(in srgb, ${module.color} 60%, transparent)`,
                  boxShadow: `
                    0 0 20px color-mix(in srgb, ${module.color} 50%, transparent),
                    inset 0 2px 0 rgba(255,255,255,0.3)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS[module.icon]}
                  size={20}
                  style={{ color: module.color }}
                  variant="pure"
                />
              </div>
            </div>

            {/* Labels */}
            <div className="text-center">
              <div className="text-base font-bold mb-1" style={{ color: module.color }}>
                {module.label}
              </div>
              <div className="text-xs text-white/60">
                {module.sublabel}
              </div>
            </div>

            {/* Effet de Flux Énergétique */}
            {isActive && !reduceMotion && (
              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden"
                style={{
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    ${module.color} 50%,
                    transparent 100%
                  )`,
                  animation: 'energyFlow 2s ease-in-out infinite'
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalysisInsightsGrid;
