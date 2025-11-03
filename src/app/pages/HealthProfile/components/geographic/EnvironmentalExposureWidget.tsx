/**
 * Environmental Exposure Widget Component
 * Displays environmental hazards and protective measures
 */

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import type { EnvironmentalExposure } from '../../../../../domain/health';

interface EnvironmentalExposureWidgetProps {
  exposure: EnvironmentalExposure;
}

const EXPOSURE_COLORS = {
  low: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981', label: 'Faible' },
  moderate: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', text: '#F59E0B', label: 'Modérée' },
  high: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444', label: 'Élevée' },
  severe: { bg: 'rgba(127, 29, 29, 0.08)', border: 'rgba(127, 29, 29, 0.3)', text: '#7F1D1D', label: 'Sévère' },
};

export const EnvironmentalExposureWidget: React.FC<EnvironmentalExposureWidgetProps> = ({ exposure }) => {
  const colors = EXPOSURE_COLORS[exposure.exposure_level];
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.3 }
      })}
    >
      <GlassCard className="p-6" style={isPerformanceMode ? {
        background: `linear-gradient(145deg, ${colors.bg}, transparent)`,
        borderColor: colors.border
      } : {
        background: `radial-gradient(circle at 30% 20%, ${colors.bg} 0%, transparent 60%), var(--glass-opacity)`,
        borderColor: colors.border
      }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={isPerformanceMode ? {
                background: `linear-gradient(135deg, ${colors.text}66, ${colors.text}33)`,
                border: `2px solid ${colors.text}80`,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
              } : {
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, ${colors.text}66, ${colors.text}33)
                `,
                border: `2px solid ${colors.text}80`,
                boxShadow: `0 0 30px ${colors.text}66`
              }}
            >
              <SpatialIcon Icon={ICONS.Shield} size={24} style={{ color: colors.text }} variant="pure" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">Exposition Environnementale</h3>
              <p className="text-white/70 text-sm">Risques et protections</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium mb-1" style={{ color: colors.text }}>
              Niveau {colors.label}
            </div>
            <div className="text-xs text-white/60">d'exposition</div>
          </div>
        </div>

        {/* Pollution Sources */}
        {exposure.pollution_sources && exposure.pollution_sources.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.AlertCircle} size={16} className="text-white/80" />
              <span className="text-white/90 text-sm font-medium">Sources de pollution</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {exposure.pollution_sources.map((source, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: `${colors.text}22`,
                    color: colors.text,
                    border: `1px solid ${colors.text}44`,
                  }}
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Environmental Hazards */}
        {exposure.environmental_hazards && exposure.environmental_hazards.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.AlertTriangle} size={16} className="text-orange-400" />
              <span className="text-white/90 text-sm font-medium">Dangers environnementaux</span>
            </div>
            <div className="space-y-2">
              {exposure.environmental_hazards.map((hazard, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <span className="text-white/70 text-sm">{hazard}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Protective Measures */}
        {exposure.protective_measures && exposure.protective_measures.length > 0 && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-400/20">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.Shield} size={16} className="text-green-400" />
              <span className="text-green-200 text-sm font-medium">Mesures de protection</span>
            </div>
            <div className="space-y-2">
              {exposure.protective_measures.map((measure, index) => (
                <div key={index} className="flex items-start gap-2">
                  <SpatialIcon Icon={ICONS.Check} size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{measure}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Time Outdoors */}
        {exposure.time_outdoors_recommended && (
          <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.Clock} size={16} className="text-blue-400" />
              <span className="text-blue-200 text-sm font-medium">Heures recommandées en extérieur</span>
            </div>
            {exposure.time_outdoors_recommended.safe_hours.length > 0 && (
              <div className="mb-2">
                <span className="text-green-400 text-xs font-medium">Heures sûres: </span>
                <span className="text-white/70 text-xs">
                  {exposure.time_outdoors_recommended.safe_hours.join(', ')}
                </span>
              </div>
            )}
            {exposure.time_outdoors_recommended.avoid_hours.length > 0 && (
              <div>
                <span className="text-red-400 text-xs font-medium">Heures à éviter: </span>
                <span className="text-white/70 text-xs">
                  {exposure.time_outdoors_recommended.avoid_hours.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </MotionDiv>
  );
};
