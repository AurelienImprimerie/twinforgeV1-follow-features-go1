import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { cssSupports } from './shoppingListUtils';

export interface ShoppingListMainLoaderProps {
  currentLoadingTitle?: string;
  currentLoadingSubtitle?: string;
  simulatedProgressPercentage: number;
}

/**
 * Shopping List Main Loader Component
 */
const ShoppingListMainLoader: React.FC<ShoppingListMainLoaderProps> = ({
  currentLoadingTitle,
  currentLoadingSubtitle,
  simulatedProgressPercentage
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <GlassCard
      className="border-orange-500/30"
      style={{
        background: `
          linear-gradient(135deg, rgba(251, 146, 60, 0.20) 0%, rgba(249, 115, 22, 0.12) 50%, rgba(234, 88, 12, 0.08) 100%)
        `,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #fb923c 40%, transparent)', 'rgba(251, 146, 60, 0.4)')}`,
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.5),
          0 6px 20px rgba(251, 146, 60, 0.3),
          0 2px 8px rgba(251, 146, 60, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `
      }}
    >
      <div className="p-2 text-center space-y-4">
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-400/50 to-orange-600/30 blur-xl"></div>
          <MotionDiv
            {...(!isPerformanceMode && {
              animate: { rotate: 360 },
              transition: { duration: 2, repeat: Infinity, ease: "linear" }
            })}
            className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-2xl ${isPerformanceMode ? 'animate-spin' : ''}`}
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.6) 0%, rgba(249, 115, 22, 0.4) 40%, rgba(234, 88, 12, 0.2) 100%)
              `,
              border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #fb923c 60%, transparent)', 'rgba(251, 146, 60, 0.6)')}`,
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 4px 16px rgba(251, 146, 60, 0.4),
                0 2px 8px rgba(251, 146, 60, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300/30 to-transparent blur-sm"></div>
            <SpatialIcon Icon={ICONS.ShoppingCart} size={32} className="relative text-orange-100 drop-shadow-2xl" />
          </MotionDiv>

          {/* Pulsing Ring */}
          {!isPerformanceMode && (
            <MotionDiv
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-orange-500/50"
            />
          )}
        </div>

        {/* Progress Info */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-200 to-orange-100 bg-clip-text text-transparent drop-shadow-sm">
            {currentLoadingTitle || 'TwinForge forge votre liste...'}
          </h3>
          <p className="text-white/70 text-sm">
            {currentLoadingSubtitle || 'La Forge travaille vos courses parfaites'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <MotionDiv
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-lg"
              {...(!isPerformanceMode && {
                initial: { width: 0 },
                animate: { width: `${simulatedProgressPercentage}%` },
                transition: { duration: 0.5, ease: "easeOut" }
              })}
              style={isPerformanceMode ? { width: `${simulatedProgressPercentage}%` } : undefined}
            />
          </div>
          <span className="text-orange-200 text-sm font-semibold">{Math.round(simulatedProgressPercentage)}%</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default ShoppingListMainLoader;