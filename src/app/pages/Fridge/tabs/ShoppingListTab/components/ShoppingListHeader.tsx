import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { cssSupports } from './shoppingListUtils';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';

export interface ShoppingListHeaderProps {
  shoppingList: any;
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  onReset: () => void;
}

const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  shoppingList,
  completedCount,
  totalCount,
  progressPercentage,
  onReset
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <GlassCard
      className="border-cyan-500/30 p-2"
      style={isPerformanceMode ? {
        background: 'linear-gradient(145deg, color-mix(in srgb, #06b6d4 20%, #1e293b), color-mix(in srgb, #06b6d4 10%, #0f172a))',
        border: '1px solid color-mix(in srgb, #06b6d4 40%, transparent)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      } : {
        background: `
          radial-gradient(circle at 30% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, rgba(8, 145, 178, 0.10) 0%, transparent 50%),
          linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(8, 145, 178, 0.08) 50%, rgba(14, 116, 144, 0.06) 100%)
        `,
        backdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #06b6d4 35%, transparent)', 'rgba(6, 182, 212, 0.35)')}`,
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.4),
          0 6px 20px rgba(6, 182, 212, 0.20),
          0 2px 8px rgba(6, 182, 212, 0.25),
          inset 0 2px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/40 to-cyan-600/25 blur-2xl"></div>
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl breathing-icon"
                style={isPerformanceMode ? {
                  background: 'linear-gradient(135deg, color-mix(in srgb, #06b6d4 35%, #1e293b), color-mix(in srgb, #06b6d4 25%, #0f172a))',
                  border: '2px solid color-mix(in srgb, #06b6d4 50%, transparent)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
                } : {
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.4) 0%, rgba(8, 145, 178, 0.3) 50%, rgba(14, 116, 144, 0.2) 100%)
                  `,
                  border: `2px solid ${cssSupports('color', 'color-mix(in srgb, #06b6d4 50%, transparent)', 'rgba(6, 182, 212, 0.5)')}`,
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    0 4px 16px rgba(6, 182, 212, 0.3),
                    0 2px 8px rgba(6, 182, 212, 0.4),
                    0 0 40px rgba(6, 182, 212, 0.25),
                    inset 0 2px 0 rgba(255, 255, 255, 0.25),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.15)
                  `
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300/20 to-transparent blur-sm"></div>
                <SpatialIcon Icon={ICONS.ShoppingCart} size={32} className="relative text-cyan-100 drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-cyan-100 bg-clip-text text-transparent drop-shadow-sm">
                {shoppingList.name}
              </h3>
              <p className="text-white/70 text-sm">
                {shoppingList.generationMode === 'user_and_family' ? 'Liste familiale' : 'Liste personnelle'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-cyan-200/70 font-medium">Progression des courses</span>
            <span className="text-cyan-200 font-semibold">{completedCount}/{totalCount} articles</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <MotionDiv
              className="h-full rounded-full shadow-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.95) 100%)',
                width: isPerformanceMode ? `${progressPercentage}%` : undefined
              }}
              {...(!isPerformanceMode && {
                initial: { width: 0 },
                animate: { width: `${progressPercentage}%` },
                transition: { duration: 0.5 }
              })}
            />
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 btn-glass"
          style={isPerformanceMode ? {
            background: 'linear-gradient(145deg, color-mix(in srgb, #06b6d4 80%, #1e293b), color-mix(in srgb, #0891b2 75%, #0f172a))',
            border: '2px solid color-mix(in srgb, #06b6d4 60%, transparent)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            color: 'white'
          } : {
            background: `
              linear-gradient(135deg,
                color-mix(in srgb, #06b6d4 80%, transparent),
                color-mix(in srgb, #0891b2 75%, transparent)
              )
            `,
            border: `2px solid ${cssSupports('color', 'color-mix(in srgb, #06b6d4 60%, transparent)', 'rgba(6, 182, 212, 0.6)')}`,
            boxShadow: `
              0 8px 32px color-mix(in srgb, #06b6d4 35%, transparent),
              0 0 40px color-mix(in srgb, #06b6d4 25%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.3),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2)
            `,
            backdropFilter: 'blur(20px) saturate(160%)',
            color: 'white'
          }}
        >
          Nouvelle liste
        </button>
      </div>
    </GlassCard>
  );
};

export default ShoppingListHeader;
