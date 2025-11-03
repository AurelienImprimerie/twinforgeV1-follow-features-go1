/**
 * ProfileGeoTab Component
 * Displays geographic, weather, air quality, and environmental data
 * Includes country health context
 * Uses pink/rose color scheme (#EC4899)
 */

import React from 'react';
import { useProfilePerformance } from './hooks/useProfilePerformance';
import { ConditionalMotionSlide, ConditionalMotionStagger } from './components/shared/ConditionalMotionProfile';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useGeographicData } from '../../../hooks/useGeographicData';
import { useUserStore } from '../../../system/store/userStore';
import { CountryHealthDataDisplay } from './components/health/CountryHealthDataDisplay';
import { useCountryHealthData } from '../../../hooks/useCountryHealthData';
import {
  AirQualityWidget,
  WeatherWidget,
  HydrationWidget,
  EnvironmentalExposureWidget,
} from '../HealthProfile/components/geographic';
import { uniformStaggerContainerVariants, uniformStaggerItemVariants } from '../../../ui/tabs/tabsConfig';

const ProfileGeoTab: React.FC = () => {
  const { profile } = useUserStore();
  const { data: geoData, loading: geoLoading, error: geoError, refresh } = useGeographicData();
  const { countryData, loading: countryLoading, error: countryError, refresh: refreshCountryData } = useCountryHealthData();
  const performanceConfig = useProfilePerformance();

  const hasCountry = !!profile?.country;

  // Check if error is due to unsupported country
  const isUnsupportedCountry = geoError?.message?.includes('pas encore supporté');

  if (!hasCountry) {
    return (
      <ConditionalMotionSlide
        performanceConfig={performanceConfig}
        className="space-y-6 profile-section"
      >
        <div>
          <GlassCard className="p-8 text-center" style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.12) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(236, 72, 153, 0.3)',
          }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(236, 72, 153, 0.2))
                `,
                border: '2px solid rgba(236, 72, 153, 0.5)',
                boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)',
              }}
            >
              <SpatialIcon Icon={ICONS.MapPin} size={32} style={{ color: '#EC4899' }} variant="pure" />
            </div>
            <h2 className="text-white font-bold text-2xl mb-3">Pays non renseigné</h2>
            <p className="text-white/70 text-base leading-relaxed mb-6">
              Pour accéder aux données géographiques, météorologiques et de qualité de l'air,
              veuillez d'abord renseigner votre pays dans l'onglet Identité.
            </p>
            <button
              onClick={() => {
                window.location.href = '/profile?tab=identity';
              }}
              className="btn-glass--primary px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <SpatialIcon Icon={ICONS.User} size={18} />
                <span>Aller à l'onglet Identité</span>
              </div>
            </button>
          </GlassCard>
        </div>
      </ConditionalMotionSlide>
    );
  }

  return (
    <ConditionalMotionStagger
      performanceConfig={performanceConfig}
      className="space-y-6 profile-section"
    >
      {/* Geographic Environment Section */}
      <ConditionalMotionSlide
        performanceConfig={performanceConfig}
        direction="up"
        distance={10}
      >
        <GlassCard className="p-6" style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'rgba(236, 72, 153, 0.2)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #EC4899 35%, transparent), color-mix(in srgb, #EC4899 25%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #EC4899 50%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #EC4899 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.MapPin} size={20} style={{ color: '#EC4899' }} variant="pure" />
              </div>
              <div>
                <div className="text-xl">Environnement Géographique</div>
                <div className="text-white/60 text-sm font-normal mt-0.5">
                  {geoData?.city && geoData?.country_code ? `${geoData.city}, ${geoData.country_code}` : profile?.country || 'Non configuré'}
                </div>
              </div>
            </h3>
            {hasCountry && geoData && (
              <button
                onClick={refresh}
                disabled={geoLoading}
                className="btn-glass px-4 py-2"
                title="Rafraîchir les données"
              >
                <SpatialIcon
                  Icon={ICONS.RefreshCw}
                  size={16}
                  className={geoLoading ? 'animate-spin' : ''}
                />
              </button>
            )}
          </div>

          {/* Unsupported Country Error */}
          {hasCountry && geoError && isUnsupportedCountry && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 mb-4">
              <div className="flex items-start gap-3">
                <SpatialIcon Icon={ICONS.AlertTriangle} size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-amber-300 font-semibold mb-2">Pays non encore supporté</h4>
                  <p className="text-amber-200 text-sm mb-3">
                    Les données géographiques ne sont pas encore disponibles pour <strong>{profile?.country}</strong>.
                    Nous couvrons actuellement plus de 130 pays, incluant la France métropolitaine, tous les DOM-TOM, et les pays majeurs.
                  </p>
                  <p className="text-amber-200 text-sm mb-4">
                    Le contexte sanitaire local reste disponible ci-dessous. Les données météo et qualité de l'air seront ajoutées prochainement.
                  </p>
                  <button
                    onClick={() => window.location.href = '/profile?tab=identity'}
                    className="btn-glass text-sm px-4 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <SpatialIcon Icon={ICONS.MapPin} size={14} />
                      <span>Changer de pays</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Errors */}
          {hasCountry && geoError && !isUnsupportedCountry && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/20 mb-4">
              <div className="flex items-start gap-3">
                <SpatialIcon Icon={ICONS.AlertCircle} size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-red-300 font-semibold mb-1">Erreur de chargement</h4>
                  <p className="text-red-200 text-sm mb-3">{geoError.message}</p>
                  <button
                    onClick={refresh}
                    className="btn-glass text-sm px-4 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <SpatialIcon Icon={ICONS.RefreshCw} size={14} />
                      <span>Réessayer</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {hasCountry && geoLoading && !geoData && (
            <div className="text-center py-8">
              <SpatialIcon Icon={ICONS.Loader2} size={32} className="animate-spin text-pink-400 mx-auto mb-4" />
              <p className="text-white/70">Chargement des données environnementales...</p>
            </div>
          )}

          {/* Geographic Data Widgets */}
          {hasCountry && geoData && (
            <div className="space-y-4">
              <WeatherWidget weather={geoData.weather} city={geoData.city} />
              <AirQualityWidget airQuality={geoData.air_quality} />
              <HydrationWidget hydration={geoData.hydration_recommendation} />
              <EnvironmentalExposureWidget exposure={geoData.environmental_exposure} />
            </div>
          )}
        </GlassCard>
      </ConditionalMotionSlide>

      {/* Country Health Context - Always show if country is set */}
      {hasCountry && (
        <ConditionalMotionSlide
          performanceConfig={performanceConfig}
          direction="up"
          distance={10}
        >
          <GlassCard className="p-6" style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'rgba(236, 72, 153, 0.2)'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                      linear-gradient(135deg, color-mix(in srgb, #EC4899 35%, transparent), color-mix(in srgb, #EC4899 25%, transparent))
                    `,
                    border: '2px solid color-mix(in srgb, #EC4899 50%, transparent)',
                    boxShadow: '0 0 20px color-mix(in srgb, #EC4899 30%, transparent)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.Globe} size={20} style={{ color: '#EC4899' }} variant="pure" />
                </div>
                <div>
                  <div className="text-xl">Contexte Sanitaire Local</div>
                  <div className="text-white/60 text-sm font-normal mt-0.5">Risques et recommandations pour {profile?.country}</div>
                </div>
              </h3>
              {countryData && (
                <button
                  onClick={refreshCountryData}
                  disabled={countryLoading}
                  className="btn-glass px-3 py-2 text-sm"
                  title="Rafraîchir les données sanitaires"
                >
                  <SpatialIcon
                    Icon={ICONS.RefreshCw}
                    size={16}
                    className={countryLoading ? 'animate-spin' : ''}
                  />
                </button>
              )}
            </div>

            {countryError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/20 mb-4">
                <div className="flex items-start gap-3">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 text-sm font-medium mb-1">Erreur de chargement</p>
                    <p className="text-red-200 text-xs">{countryError.message}</p>
                  </div>
                </div>
              </div>
            )}

            <CountryHealthDataDisplay countryData={countryData} loading={countryLoading} />
          </GlassCard>
        </ConditionalMotionSlide>
      )}

      {/* Info Banner */}
      {hasCountry && geoData && (
        <ConditionalMotionSlide
          performanceConfig={performanceConfig}
          direction="up"
          distance={10}
        >
          <GlassCard className="p-4" style={{
            background: 'rgba(236, 72, 153, 0.05)',
            borderColor: 'rgba(236, 72, 153, 0.2)',
          }}>
            <div className="flex items-start gap-3">
              <SpatialIcon Icon={ICONS.Info} size={16} className="text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-pink-300 text-sm leading-relaxed">
                  <strong>Sources de données:</strong> Les informations météorologiques et de qualité de l'air
                  proviennent d'Open-Meteo, un service open source fournissant des données en temps réel.
                  Les données sont mises à jour toutes les heures automatiquement.
                </p>
              </div>
            </div>
          </GlassCard>
        </ConditionalMotionSlide>
      )}
    </ConditionalMotionStagger>
  );
};

export default ProfileGeoTab;
