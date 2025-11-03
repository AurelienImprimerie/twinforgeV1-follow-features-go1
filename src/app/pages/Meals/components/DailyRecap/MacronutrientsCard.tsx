import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { analyzeMacronutrients } from './MacroAnalysis';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';

interface MacronutrientsCardProps {
  todayStats: {
    totalCalories: number;
    mealsCount: number;
    lastMealTime: Date | null;
    macros: { proteins: number; carbs: number; fats: number; fiber: number };
  };
  profile: any;
}

/**
 * Macronutrients Card - Analyse des macronutriments du jour
 */
const MacronutrientsCard: React.FC<MacronutrientsCardProps> = ({
  todayStats,
  profile,
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const macroAnalysis = analyzeMacronutrients(todayStats.macros, profile);

  if (todayStats.mealsCount === 0) {
    return null;
  }

  return (
    <GlassCard
      className="p-6 glass-card--summary"
      style={{
        '--recommendation-color': 'var(--nutrition-primary)',
        background: isPerformanceMode
          ? 'linear-gradient(145deg, color-mix(in srgb, var(--nutrition-primary) 8%, #1e293b), color-mix(in srgb, var(--nutrition-primary) 4%, #0f172a))'
          : `radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--nutrition-primary) 6%, transparent) 0%, transparent 60%), var(--glass-opacity)`,
        borderColor: `color-mix(in srgb, var(--nutrition-primary) 15%, transparent)`
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: isPerformanceMode
              ? 'linear-gradient(135deg, color-mix(in srgb, var(--nutrition-primary) 30%, transparent), color-mix(in srgb, var(--nutrition-secondary) 20%, transparent))'
              : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%), linear-gradient(135deg, color-mix(in srgb, var(--nutrition-primary) 30%, transparent), color-mix(in srgb, var(--nutrition-secondary) 20%, transparent))`,
            border: '2px solid color-mix(in srgb, var(--nutrition-primary) 40%, transparent)',
            boxShadow: isPerformanceMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 0 20px color-mix(in srgb, var(--nutrition-primary) 30%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.BarChart3} size={20} style={{ color: 'var(--nutrition-primary)' }} />
        </div>
        <div>
          <h3 className="text-white font-bold text-xl">Forge Macronutritionnelle</h3>
          <p className="text-green-200 text-sm">Répartition énergétique de vos nutriments</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { color: '#EF4444', name: 'Protéines' },
          { color: '#F59E0B', name: 'Glucides' },
          { color: '#8B5CF6', name: 'Lipides' },
          { color: '#06B6D4', name: 'Fibres' }
        ].map((macro, index) => (
          <div
            key={macro.name}
            className="text-center p-4 rounded-xl macro-card-enter"
            style={{
              background: `color-mix(in srgb, ${macro.color} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${macro.color} 20%, transparent)`,
              animationDelay: `${0.5 + index * 0.1}s`
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${macro.color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${macro.color} 25%, transparent)`
                }}
              >
                <SpatialIcon 
                  Icon={ICONS.Activity} 
                  size={12} 
                  style={{ color: macro.color }}
                />
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color: macro.color }}>
              {Math.round(Object.values(todayStats.macros)[index])}g
            </div>
            <div className="text-sm font-medium" style={{ color: macro.color }}>{macro.name}</div>
            <div className="h-3 bg-white/5 rounded w-16 mx-auto mt-1"></div>
          </div>
        ))}
      </div>
      
      {/* Macro Status Summary */}
      {macroAnalysis.recommendations.length > 0 && (
        <div 
          className="mt-4 p-4 rounded-xl glass-nested-card"
          style={{
            background: `color-mix(in srgb, var(--brand-accent) 6%, transparent)`,
            borderColor: `color-mix(in srgb, var(--brand-accent) 15%, transparent)`
          }}
        >
          <h4 className="text-cyan-300 font-medium text-sm mb-2 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Info} size={12} style={{ color: 'var(--brand-accent)' }} />
            Optimisations Forge
          </h4>
          <div className="space-y-1 text-xs text-cyan-200">
            {macroAnalysis.recommendations.map((rec, index) => (
              <p key={index}>• {rec}</p>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default MacronutrientsCard;