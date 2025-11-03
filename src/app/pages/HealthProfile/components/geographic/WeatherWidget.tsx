/**
 * Weather Widget Component
 * Displays current weather conditions
 */

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import type { WeatherData } from '../../../../../domain/health';

interface WeatherWidgetProps {
  weather: WeatherData;
  city?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, city }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: 0.1 }
      })}
    >
      <GlassCard className="p-6" style={isPerformanceMode ? {
        background: 'linear-gradient(145deg, color-mix(in srgb, #3B82F6 10%, #1e293b), color-mix(in srgb, #3B82F6 5%, #0f172a))',
        borderColor: 'rgba(59, 130, 246, 0.2)'
      } : {
        background: `
          radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(59, 130, 246, 0.2)'
      }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={isPerformanceMode ? {
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.2))',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
              } : {
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.2))
                `,
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)'
              }}
            >
              <SpatialIcon Icon={ICONS.Cloud} size={24} style={{ color: '#3B82F6' }} variant="pure" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">Météo</h3>
              {city && <p className="text-white/70 text-sm">{city}</p>}
            </div>
          </div>
        </div>

        {/* Temperature Display */}
        <div className="flex items-end gap-4 mb-6">
          <div className="text-6xl font-bold text-white">
            {Math.round(weather.temperature_celsius)}°
          </div>
          <div className="mb-2">
            <div className="text-white/90 text-lg mb-1">{weather.weather_condition}</div>
            {weather.feels_like_celsius !== undefined && (
              <div className="text-white/60 text-sm">
                Ressenti: {Math.round(weather.feels_like_celsius)}°C
              </div>
            )}
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
            <SpatialIcon Icon={ICONS.Droplet} size={18} className="text-blue-400" />
            <div>
              <div className="text-white/60 text-xs mb-1">Humidité</div>
              <div className="text-white font-semibold">{weather.humidity_percent}%</div>
            </div>
          </div>

          {weather.wind_speed_ms !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
              <SpatialIcon Icon={ICONS.Wind} size={18} className="text-blue-400" />
              <div>
                <div className="text-white/60 text-xs mb-1">Vent</div>
                <div className="text-white font-semibold">{weather.wind_speed_ms.toFixed(1)} m/s</div>
              </div>
            </div>
          )}

          {weather.precipitation_mm !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
              <SpatialIcon Icon={ICONS.CloudRain} size={18} className="text-blue-400" />
              <div>
                <div className="text-white/60 text-xs mb-1">Précipitations</div>
                <div className="text-white font-semibold">{weather.precipitation_mm.toFixed(1)} mm</div>
              </div>
            </div>
          )}

          {weather.cloud_cover_percent !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
              <SpatialIcon Icon={ICONS.Cloud} size={18} className="text-blue-400" />
              <div>
                <div className="text-white/60 text-xs mb-1">Nuages</div>
                <div className="text-white font-semibold">{weather.cloud_cover_percent}%</div>
              </div>
            </div>
          )}

          {weather.pressure_hpa !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
              <SpatialIcon Icon={ICONS.Gauge} size={18} className="text-blue-400" />
              <div>
                <div className="text-white/60 text-xs mb-1">Pression</div>
                <div className="text-white font-semibold">{weather.pressure_hpa} hPa</div>
              </div>
            </div>
          )}

          {weather.visibility_km !== undefined && (
            <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3">
              <SpatialIcon Icon={ICONS.Eye} size={18} className="text-blue-400" />
              <div>
                <div className="text-white/60 text-xs mb-1">Visibilité</div>
                <div className="text-white font-semibold">{weather.visibility_km.toFixed(1)} km</div>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <div className="flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Clock} size={12} />
              <span>
                Mis à jour: {new Date(weather.last_updated).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {(weather as any).provider && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-white/60">{(weather as any).provider}</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </MotionDiv>
  );
};
