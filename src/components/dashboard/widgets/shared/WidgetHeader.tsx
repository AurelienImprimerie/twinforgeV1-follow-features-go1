/**
 * WidgetHeader - Composant de header unifié pour tous les widgets Dashboard
 *
 * Design Features:
 * - Icône animée centrée au-dessus du titre
 * - Cercles de fond animés avec glow effect
 * - Support des badges (streak, success rate, etc.)
 * - Animations conditionnelles basées sur performanceMode
 * - Glasscard colorée avec bordures et ombres
 */

import { motion } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

interface WidgetHeaderProps {
  /** Nom de l'icône principale */
  icon: string;
  /** Couleur principale (hex) */
  mainColor: string;
  /** Couleur de glow/secondaire (hex) */
  glowColor: string;
  /** Titre principal */
  title: string;
  /** Sous-titre descriptif */
  subtitle: string;
  /** Badge optionnel (ex: "75% réussite") */
  badge?: {
    label: string;
    color: string;
  };
  /** Métrique secondaire (ex: streak) */
  secondaryMetric?: {
    icon: string;
    value: number;
    label: string;
    color: string;
  };
  /** Type d'animation de l'icône */
  animationType?: 'float' | 'pulse' | 'glow';
}

export default function WidgetHeader({
  icon,
  mainColor,
  glowColor,
  title,
  subtitle,
  badge,
  secondaryMetric,
  animationType = 'float',
}: WidgetHeaderProps) {
  const { performanceMode } = usePerformanceMode();

  const getIconAnimation = () => {
    if (performanceMode === 'low') return {};

    switch (animationType) {
      case 'float':
        return {
          y: [0, -10, 0],
        };
      case 'pulse':
        return {
          scale: [1, 1.1, 1],
        };
      case 'glow':
        return {
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0, -5, 0],
        };
      default:
        return {
          y: [0, -10, 0],
        };
    }
  };

  return (
    <div className="relative space-y-4">
      {/* Icon at Top - Centered - STATIC */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Icône principale - Statique */}
          <div
            className="relative w-24 h-24 rounded-3xl flex items-center justify-center backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, ${mainColor}40, ${mainColor}20)`,
              border: `2px solid ${mainColor}50`,
              boxShadow: `0 0 20px ${mainColor}30`,
            }}
          >
            <SpatialIcon name={icon as any} size={48} color={mainColor} glowColor={glowColor} variant="pure" />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center space-y-3">
        <div className="space-y-2">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {title}
            </h3>
            {badge && (
              <div
                className="px-3 py-1 rounded-full border"
                style={{
                  background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}10)`,
                  borderColor: `${badge.color}30`,
                }}
              >
                <span className="text-xs font-bold" style={{ color: badge.color }}>
                  {badge.label}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-white/80 text-center">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Secondary Metric (ex: Streak) */}
      {secondaryMetric && (
        <div className="flex justify-center">
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${secondaryMetric.color}20, ${secondaryMetric.color}10)`,
              border: `1px solid ${secondaryMetric.color}30`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <SpatialIcon name={secondaryMetric.icon as any} size={20} color={secondaryMetric.color} />
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: secondaryMetric.color }}>
                {secondaryMetric.value}
              </p>
              <p className="text-xs text-white/60">{secondaryMetric.label}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
