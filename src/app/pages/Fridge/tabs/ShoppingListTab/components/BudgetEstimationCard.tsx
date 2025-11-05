import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { cssSupports, formatCentsToEuros, formatBudgetRange } from './shoppingListUtils';
import type { BudgetEstimation } from '../../../../../../system/store/shoppingListGenerationPipeline/types';

export interface BudgetEstimationCardProps {
  budgetEstimation?: BudgetEstimation;
}

/**
 * Budget Estimation Card Component
 * VisionOS 26 inspired aluminum-like design
 * Displays min, max, and average budget estimates in euros
 */
const BudgetEstimationCard: React.FC<BudgetEstimationCardProps> = ({
  budgetEstimation
}) => {
  if (!budgetEstimation) {
    return null;
  }

  const { minTotal, maxTotal, averageTotal } = budgetEstimation;

  // Don't show card if all values are 0
  if (minTotal === 0 && maxTotal === 0 && averageTotal === 0) {
    return null;
  }

  const minFormatted = formatCentsToEuros(minTotal);
  const maxFormatted = formatCentsToEuros(maxTotal);
  const avgFormatted = formatCentsToEuros(averageTotal);
  const rangeFormatted = formatBudgetRange(minTotal, maxTotal);

  return (
    <GlassCard
      className="border-slate-400/30 p-1 mb-4"
      style={{
        background: `
          linear-gradient(135deg,
            rgba(148, 163, 184, 0.15) 0%,
            rgba(100, 116, 139, 0.12) 25%,
            rgba(71, 85, 105, 0.08) 50%,
            rgba(51, 65, 85, 0.06) 75%,
            rgba(30, 41, 59, 0.04) 100%
          )
        `,
        backdropFilter: 'blur(24px) saturate(200%)',
        border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #94a3b8 30%, transparent)', 'rgba(148, 163, 184, 0.3)')}`,
        boxShadow: `
          0 16px 48px rgba(0, 0, 0, 0.4),
          0 8px 24px rgba(148, 163, 184, 0.15),
          0 4px 12px rgba(148, 163, 184, 0.2),
          0 2px 6px rgba(148, 163, 184, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2),
          inset 1px 0 0 rgba(255, 255, 255, 0.08),
          inset -1px 0 0 rgba(0, 0, 0, 0.08)
        `
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300/40 to-slate-500/20 blur-xl"></div>
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%,
                    rgba(148, 163, 184, 0.4) 0%,
                    rgba(100, 116, 139, 0.3) 40%,
                    rgba(71, 85, 105, 0.2) 70%,
                    rgba(51, 65, 85, 0.1) 100%
                  )
                `,
                border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #94a3b8 50%, transparent)', 'rgba(148, 163, 184, 0.5)')}`,
                boxShadow: `
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  0 4px 16px rgba(148, 163, 184, 0.2),
                  0 2px 8px rgba(148, 163, 184, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.25),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.15)
                `
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200/20 to-transparent blur-sm"></div>
              <SpatialIcon Icon={ICONS.DollarSign} size={24} className="relative text-slate-200 drop-shadow-lg" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent drop-shadow-sm">
              Budget estimé
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100 drop-shadow-lg">
                {rangeFormatted}
              </span>
              {budgetEstimation.region && (
                <span className="text-xs text-slate-300/80 font-medium">
                  {budgetEstimation.region}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div
          className="mt-3 p-3 rounded-lg"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(148, 163, 184, 0.08) 0%,
                rgba(100, 116, 139, 0.06) 50%,
                rgba(71, 85, 105, 0.04) 100%
              )
            `,
            border: `1px solid ${cssSupports('color', 'color-mix(in srgb, #94a3b8 20%, transparent)', 'rgba(148, 163, 184, 0.2)')}`,
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
            `
          }}
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-slate-400 mb-1">Minimum</div>
              <div className="text-sm font-semibold text-slate-200">{minFormatted}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Moyenne</div>
              <div className="text-sm font-semibold text-slate-200">{avgFormatted}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Maximum</div>
              <div className="text-sm font-semibold text-slate-200">{maxFormatted}</div>
            </div>
          </div>
        </div>

        {budgetEstimation.coefficient && budgetEstimation.coefficient !== 1 && (
          <div className="mt-2 text-xs text-slate-400 text-center">
            Prix ajustés selon votre région (×{budgetEstimation.coefficient.toFixed(2)})
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default BudgetEstimationCard;