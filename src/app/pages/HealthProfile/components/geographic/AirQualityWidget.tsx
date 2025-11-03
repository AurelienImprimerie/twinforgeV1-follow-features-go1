/**
 * Air Quality Widget Component
 * Displays current air quality index and pollutants
 */

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import type { AirQualityData, AirQualityLevel } from '../../../../../domain/health';

interface AirQualityWidgetProps {
  airQuality: AirQualityData;
}

const AQI_COLORS: Record<AirQualityLevel, { bg: string; border: string; text: string; label: string }> = {
  good: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981', label: 'Bonne' },
  moderate: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', text: '#F59E0B', label: 'Moyenne' },
  unhealthy_sensitive: { bg: 'rgba(251, 146, 60, 0.08)', border: 'rgba(251, 146, 60, 0.3)', text: '#FB923C', label: 'Sensible' },
  unhealthy: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444', label: 'Malsaine' },
  very_unhealthy: { bg: 'rgba(190, 18, 60, 0.08)', border: 'rgba(190, 18, 60, 0.3)', text: '#BE123C', label: 'Très Malsaine' },
  hazardous: { bg: 'rgba(127, 29, 29, 0.08)', border: 'rgba(127, 29, 29, 0.3)', text: '#7F1D1D', label: 'Dangereuse' },
};

export const AirQualityWidget: React.FC<AirQualityWidgetProps> = ({ airQuality }) => {
  const colors = AQI_COLORS[airQuality.level];
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
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
              <SpatialIcon Icon={ICONS.Wind} size={24} style={{ color: colors.text }} variant="pure" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">Qualité de l'Air</h3>
              <p className="text-white/70 text-sm">Indice AQI en temps réel</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: colors.text }}>{airQuality.aqi}</div>
            <div className="text-sm font-medium" style={{ color: colors.text }}>{colors.label}</div>
          </div>
        </div>

        {/* AQI Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <MotionDiv
              className="h-3 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.text}, ${colors.text}cc)`,
                boxShadow: isPerformanceMode ? 'none' : `0 0 12px ${colors.text}99`,
                width: isPerformanceMode ? `${Math.min((airQuality.aqi / 300) * 100, 100)}%` : undefined
              }}
              {...(!isPerformanceMode && {
                initial: { width: 0 },
                animate: { width: `${Math.min((airQuality.aqi / 300) * 100, 100)}%` },
                transition: { duration: 1, ease: 'easeOut' }
              })}
            />
          </div>
        </div>

        {/* Dominant Pollutant */}
        {airQuality.dominant_pollutant && (
          <div className="mb-4 p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2 mb-1">
              <SpatialIcon Icon={ICONS.AlertCircle} size={14} style={{ color: colors.text }} />
              <span className="text-white/90 text-sm font-medium">Polluant dominant</span>
            </div>
            <p className="text-white/70 text-sm ml-6">{airQuality.dominant_pollutant}</p>
          </div>
        )}

        {/* Pollutants Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {airQuality.pm2_5 !== undefined && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-xs mb-1">PM2.5</div>
              <div className="text-white font-semibold">{airQuality.pm2_5.toFixed(1)} µg/m³</div>
            </div>
          )}
          {airQuality.pm10 !== undefined && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-xs mb-1">PM10</div>
              <div className="text-white font-semibold">{airQuality.pm10.toFixed(1)} µg/m³</div>
            </div>
          )}
          {airQuality.no2 !== undefined && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-xs mb-1">NO₂</div>
              <div className="text-white font-semibold">{airQuality.no2.toFixed(1)} µg/m³</div>
            </div>
          )}
          {airQuality.o3 !== undefined && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-xs mb-1">O₃</div>
              <div className="text-white font-semibold">{airQuality.o3.toFixed(1)} µg/m³</div>
            </div>
          )}
          {airQuality.co !== undefined && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-xs mb-1">CO</div>
              <div className="text-white font-semibold">{airQuality.co.toFixed(0)} µg/m³</div>
            </div>
          )}
          {airQuality.so2 !== undefined && (
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-white/60 text-xs mb-1">SO₂</div>
              <div className="text-white font-semibold">{airQuality.so2.toFixed(1)} µg/m³</div>
            </div>
          )}
        </div>

        {/* Health Recommendations */}
        {airQuality.health_recommendations && airQuality.health_recommendations.length > 0 && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.Shield} size={16} className="text-white/80" />
              <span className="text-white/90 text-sm font-medium">Recommandations santé</span>
            </div>
            <div className="space-y-2">
              {airQuality.health_recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors.text }} />
                  <span className="text-white/70 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </MotionDiv>
  );
};
