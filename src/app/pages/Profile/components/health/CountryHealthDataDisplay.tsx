/**
 * Country Health Data Display Component
 * Shows enriched health data for user's country
 */

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { CountryHealthData } from '../../../../../domain/health';

interface CountryHealthDataDisplayProps {
  countryData: CountryHealthData | null;
  loading?: boolean;
}

export const CountryHealthDataDisplay: React.FC<CountryHealthDataDisplayProps> = ({
  countryData,
  loading = false,
}) => {
  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <SpatialIcon Icon={ICONS.Loader2} size={20} className="animate-spin text-cyan-400" />
          <span className="text-white/90">Chargement des données sanitaires du pays...</span>
        </div>
      </GlassCard>
    );
  }

  if (!countryData) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <SpatialIcon Icon={ICONS.AlertCircle} size={20} className="text-orange-400" />
          <div>
            <p className="text-white/90 font-medium">Données pays non disponibles</p>
            <p className="text-white/60 text-sm mt-1">
              Sélectionnez votre pays dans l'onglet Identité pour voir les risques sanitaires locaux.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <GlassCard className="p-6" style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'rgba(6, 182, 212, 0.2)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #06B6D4 35%, transparent), color-mix(in srgb, #06B6D4 25%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #06B6D4 50%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #06B6D4 30%, transparent)',
              }}
            >
              <SpatialIcon Icon={ICONS.Globe} size={20} style={{ color: '#06B6D4' }} variant="pure" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{countryData.country_name}</h3>
              <p className="text-white/60 text-sm">Contexte sanitaire local</p>
            </div>
          </div>
          <div className="text-xs text-white/50">
            Mis à jour: {new Date(countryData.last_updated).toLocaleDateString('fr-FR')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {countryData.endemic_diseases && countryData.endemic_diseases.length > 0 && (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/20">
              <div className="flex items-center gap-2 mb-3">
                <SpatialIcon Icon={ICONS.Biohazard} size={16} className="text-orange-400" />
                <h4 className="text-white/90 font-medium text-sm">Maladies Endémiques</h4>
              </div>
              <div className="space-y-1">
                {countryData.endemic_diseases.slice(0, 5).map((disease, index) => (
                  <div key={index} className="flex items-center gap-2 text-white/70 text-sm">
                    <div className="w-1 h-1 rounded-full bg-orange-400" />
                    {disease}
                  </div>
                ))}
              </div>
            </div>
          )}

          {countryData.vaccination_requirements && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-400/20">
              <div className="flex items-center gap-2 mb-3">
                <SpatialIcon Icon={ICONS.Syringe} size={16} className="text-green-400" />
                <h4 className="text-white/90 font-medium text-sm">Vaccinations Recommandées</h4>
              </div>
              <div className="space-y-1">
                {countryData.vaccination_requirements.recommended?.slice(0, 5).map((vaccine, index) => (
                  <div key={index} className="flex items-center gap-2 text-white/70 text-sm">
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                    {vaccine}
                  </div>
                ))}
              </div>
            </div>
          )}

          {countryData.common_deficiencies && countryData.common_deficiencies.length > 0 && (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
              <div className="flex items-center gap-2 mb-3">
                <SpatialIcon Icon={ICONS.Pill} size={16} className="text-yellow-400" />
                <h4 className="text-white/90 font-medium text-sm">Carences Communes</h4>
              </div>
              <div className="space-y-1">
                {countryData.common_deficiencies.map((deficiency, index) => (
                  <div key={index} className="flex items-center gap-2 text-white/70 text-sm">
                    <div className="w-1 h-1 rounded-full bg-yellow-400" />
                    {deficiency}
                  </div>
                ))}
              </div>
            </div>
          )}

          {countryData.climate_data && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/20">
              <div className="flex items-center gap-2 mb-3">
                <SpatialIcon Icon={ICONS.Cloud} size={16} className="text-blue-400" />
                <h4 className="text-white/90 font-medium text-sm">Climat</h4>
              </div>
              <div className="space-y-2 text-white/70 text-sm">
                {countryData.climate_data.climate_zones && (
                  <div className="flex items-center justify-between">
                    <span>Zone:</span>
                    <span className="font-medium text-white/90">
                      {countryData.climate_data.climate_zones.join(', ')}
                    </span>
                  </div>
                )}
                {countryData.climate_data.avg_temperature_celsius && (
                  <div className="flex items-center justify-between">
                    <span>Temp. moyenne:</span>
                    <span className="font-medium text-white/90">
                      {countryData.climate_data.avg_temperature_celsius}°C
                    </span>
                  </div>
                )}
                {countryData.climate_data.avg_humidity_percent && (
                  <div className="flex items-center justify-between">
                    <span>Humidité:</span>
                    <span className="font-medium text-white/90">
                      {countryData.climate_data.avg_humidity_percent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {countryData.health_risks && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-400/20">
            <div className="flex items-center gap-2 mb-3">
              <SpatialIcon Icon={ICONS.Bug} size={16} className="text-red-400" />
              <h4 className="text-white/90 font-medium text-sm">Risques Sanitaires Spécifiques</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {countryData.health_risks.vector_borne_diseases &&
                countryData.health_risks.vector_borne_diseases.length > 0 && (
                  <div>
                    <p className="text-white/60 text-xs mb-1">Maladies vectorielles:</p>
                    <div className="flex flex-wrap gap-1">
                      {countryData.health_risks.vector_borne_diseases.map((disease, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300"
                        >
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {countryData.health_risks.waterborne_diseases &&
                countryData.health_risks.waterborne_diseases.length > 0 && (
                  <div>
                    <p className="text-white/60 text-xs mb-1">Maladies hydriques:</p>
                    <div className="flex flex-wrap gap-1">
                      {countryData.health_risks.waterborne_diseases.map((disease, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300"
                        >
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};
