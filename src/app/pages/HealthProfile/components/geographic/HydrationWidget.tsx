/**
 * Hydration Widget Component
 * Displays personalized hydration recommendations based on weather and activity
 */

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import type { HydrationRecommendation } from '../../../../../domain/health';

interface HydrationWidgetProps {
  hydration: HydrationRecommendation;
}

export const HydrationWidget: React.FC<HydrationWidgetProps> = ({ hydration }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.2 }
      })}
    >
      <GlassCard className="p-6" style={isPerformanceMode ? {
        background: 'linear-gradient(145deg, color-mix(in srgb, #06B6D4 10%, #1e293b), color-mix(in srgb, #06B6D4 5%, #0f172a))',
        borderColor: 'rgba(6, 182, 212, 0.2)'
      } : {
        background: `
          radial-gradient(circle at 30% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(6, 182, 212, 0.2)'
      }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={isPerformanceMode ? {
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(6, 182, 212, 0.2))',
                border: '2px solid rgba(6, 182, 212, 0.5)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
              } : {
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(6, 182, 212, 0.2))
                `,
                border: '2px solid rgba(6, 182, 212, 0.5)',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)'
              }}
            >
              <SpatialIcon Icon={ICONS.Droplet} size={24} style={{ color: '#06B6D4' }} variant="pure" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">Hydratation</h3>
              <p className="text-white/70 text-sm">Recommandations personnalisées</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400">
              {hydration.total_recommended_liters}L
            </div>
            <div className="text-white/60 text-sm">par jour</div>
          </div>
        </div>

        {/* Hydration Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.User} size={14} className="text-cyan-400" />
              <span className="text-white/80 text-sm">Base (poids)</span>
            </div>
            <span className="text-white font-semibold">{hydration.base_amount_liters}L</span>
          </div>

          {hydration.weather_adjustment_liters > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Sun} size={14} className="text-orange-400" />
                <span className="text-white/80 text-sm">Ajustement météo</span>
              </div>
              <span className="text-orange-400 font-semibold">+{hydration.weather_adjustment_liters}L</span>
            </div>
          )}

          {hydration.activity_adjustment_liters > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Dumbbell} size={14} className="text-green-400" />
                <span className="text-white/80 text-sm">Ajustement activité</span>
              </div>
              <span className="text-green-400 font-semibold">+{hydration.activity_adjustment_liters}L</span>
            </div>
          )}
        </div>

        {/* Environmental Factors */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <SpatialIcon Icon={ICONS.Info} size={14} className="text-white/80" />
            <span className="text-white/90 text-sm font-medium">Facteurs considérés</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/60">Température:</span>
              <span className="text-white ml-2 font-medium">{hydration.factors.temperature}°C</span>
            </div>
            <div>
              <span className="text-white/60">Humidité:</span>
              <span className="text-white ml-2 font-medium">{hydration.factors.humidity}%</span>
            </div>
            <div>
              <span className="text-white/60">Activité:</span>
              <span className="text-white ml-2 font-medium capitalize">{hydration.factors.physical_activity_level}</span>
            </div>
            {hydration.factors.user_weight_kg && (
              <div>
                <span className="text-white/60">Poids:</span>
                <span className="text-white ml-2 font-medium">{hydration.factors.user_weight_kg} kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {hydration.recommendations && hydration.recommendations.length > 0 && (
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-400/20 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.Lightbulb} size={16} className="text-cyan-400" />
              <span className="text-cyan-200 text-sm font-medium">Conseils d'hydratation</span>
            </div>
            <div className="space-y-2">
              {hydration.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {hydration.alerts && hydration.alerts.length > 0 && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-400/20">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.AlertTriangle} size={16} className="text-orange-400" />
              <span className="text-orange-200 text-sm font-medium">Alertes</span>
            </div>
            <div className="space-y-2">
              {hydration.alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{alert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </MotionDiv>
  );
};
