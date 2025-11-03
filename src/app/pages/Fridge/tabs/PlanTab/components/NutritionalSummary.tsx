/**
 * Nutritional Summary Component
 * Component for displaying nutritional summary of the meal plan
 */

import React from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import type { MealPlanData } from '../types';

interface NutritionalSummaryProps {
  nutritionalSummary: MealPlanData['nutritionalSummary'];
  estimatedWeeklyCost?: number;
}

/**
 * Nutritional Summary Component - Résumé Nutritionnel
 */
const NutritionalSummary: React.FC<NutritionalSummaryProps> = ({
  nutritionalSummary,
  estimatedWeeklyCost
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  if (!nutritionalSummary) return null;

  return (
    <GlassCard
      className="p-6"
      style={isPerformanceMode ? {
        background: 'linear-gradient(145deg, #1e3a2f, #0f1f1a)',
        borderColor: 'color-mix(in srgb, #10B981 40%, transparent)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      } : {
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #10B981 20%, transparent)'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={isPerformanceMode ? {
            background: 'color-mix(in srgb, #10B981 25%, #1e293b)',
            border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          } : {
            background: 'color-mix(in srgb, #10B981 15%, transparent)',
            border: '2px solid color-mix(in srgb, #10B981 25%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.BarChart3} size={16} style={{ color: '#10B981' }} />
        </div>
        <div>
          <h4 className="text-green-300 font-semibold text-lg">Résumé Nutritionnel</h4>
          <p className="text-green-200 text-sm">Moyennes quotidiennes calculées</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories */}
        <div
          className="text-center p-4 rounded-xl border"
          style={isPerformanceMode ? {
            background: 'color-mix(in srgb, #f97316 20%, #1e293b)',
            borderColor: 'color-mix(in srgb, #f97316 40%, transparent)'
          } : {
            background: 'rgba(249, 115, 22, 0.1)',
            borderColor: 'rgba(251, 146, 60, 0.2)'
          }}
        >
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {nutritionalSummary.avgCaloriesPerDay}
          </div>
          <div className="text-orange-300 text-sm font-medium">kcal/jour</div>
        </div>

        {/* Protéines */}
        <div
          className="text-center p-4 rounded-xl border"
          style={isPerformanceMode ? {
            background: 'color-mix(in srgb, #ef4444 20%, #1e293b)',
            borderColor: 'color-mix(in srgb, #ef4444 40%, transparent)'
          } : {
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(248, 113, 113, 0.2)'
          }}
        >
          <div className="text-2xl font-bold text-red-400 mb-1">
            {nutritionalSummary.avgProteinPerDay}g
          </div>
          <div className="text-red-300 text-sm font-medium">Protéines</div>
        </div>

        {/* Glucides */}
        <div
          className="text-center p-4 rounded-xl border"
          style={isPerformanceMode ? {
            background: 'color-mix(in srgb, #3b82f6 20%, #1e293b)',
            borderColor: 'color-mix(in srgb, #3b82f6 40%, transparent)'
          } : {
            background: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(96, 165, 250, 0.2)'
          }}
        >
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {nutritionalSummary.avgCarbsPerDay}g
          </div>
          <div className="text-blue-300 text-sm font-medium">Glucides</div>
        </div>

        {/* Lipides */}
        <div
          className="text-center p-4 rounded-xl border"
          style={isPerformanceMode ? {
            background: 'color-mix(in srgb, #a855f7 20%, #1e293b)',
            borderColor: 'color-mix(in srgb, #a855f7 40%, transparent)'
          } : {
            background: 'rgba(168, 85, 247, 0.1)',
            borderColor: 'rgba(192, 132, 252, 0.2)'
          }}
        >
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {nutritionalSummary.avgFatPerDay}g
          </div>
          <div className="text-purple-300 text-sm font-medium">Lipides</div>
        </div>
      </div>

      {/* Coût Estimé */}
      {estimatedWeeklyCost && (
        <div
          className="mt-4 p-4 rounded-xl border text-center"
          style={isPerformanceMode ? {
            background: 'color-mix(in srgb, #10B981 20%, #1e293b)',
            borderColor: 'color-mix(in srgb, #10B981 40%, transparent)'
          } : {
            background: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(52, 211, 153, 0.2)'
          }}
        >
          <div className="text-xl font-bold text-green-400 mb-1">
            {estimatedWeeklyCost.toFixed(2)}€
          </div>
          <div className="text-green-300 text-sm">Coût estimé par semaine</div>
        </div>
      )}
    </GlassCard>
  );
};

export default NutritionalSummary;