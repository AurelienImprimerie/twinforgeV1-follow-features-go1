/**
 * Geographic Data Service
 * Fetches weather, air quality, and environmental data from Open-Meteo and OpenWeatherMap APIs
 * Calculates personalized hydration recommendations
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import { weatherProviderManager } from './weatherProviders/weatherProviderManager';
import type {
  GeographicData,
  GeographicDataCache,
  WeatherData,
  AirQualityData,
  AirQualityLevel,
  EnvironmentalExposure,
  HydrationRecommendation,
  PhysicalActivityLevel
} from '../../domain/health';

const CACHE_DURATION_HOURS = 1;

// Country coordinates for weather data (capital cities)
// Comprehensive list including francophone countries and DOM-TOM
const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number; city: string }> = {
  // France et DOM-TOM
  FR: { lat: 48.8566, lon: 2.3522, city: 'Paris' },
  GP: { lat: 16.2650, lon: -61.5510, city: 'Basse-Terre' }, // Guadeloupe
  MQ: { lat: 14.6415, lon: -61.0242, city: 'Fort-de-France' }, // Martinique
  GF: { lat: 4.9227, lon: -52.3269, city: 'Cayenne' }, // Guyane
  RE: { lat: -20.8823, lon: 55.4504, city: 'Saint-Denis' }, // Réunion
  YT: { lat: -12.8275, lon: 45.1662, city: 'Mamoudzou' }, // Mayotte
  PM: { lat: 46.7738, lon: -56.1815, city: 'Saint-Pierre' }, // Saint-Pierre-et-Miquelon
  BL: { lat: 17.9000, lon: -62.8333, city: 'Gustavia' }, // Saint-Barthélemy
  MF: { lat: 18.0731, lon: -63.0822, city: 'Marigot' }, // Saint-Martin
  WF: { lat: -13.2829, lon: -176.1745, city: 'Mata-Utu' }, // Wallis-et-Futuna
  PF: { lat: -17.5516, lon: -149.5585, city: 'Papeete' }, // Polynésie française
  NC: { lat: -22.2758, lon: 166.4572, city: 'Nouméa' }, // Nouvelle-Calédonie

  // Pays francophones d'Europe
  BE: { lat: 50.8503, lon: 4.3517, city: 'Bruxelles' }, // Belgique
  CH: { lat: 46.9480, lon: 7.4474, city: 'Berne' }, // Suisse
  LU: { lat: 49.6116, lon: 6.1319, city: 'Luxembourg' }, // Luxembourg
  MC: { lat: 43.7384, lon: 7.4246, city: 'Monaco' }, // Monaco

  // Pays francophones d'Afrique
  DZ: { lat: 36.7538, lon: 3.0588, city: 'Alger' }, // Algérie
  MA: { lat: 34.0209, lon: -6.8416, city: 'Rabat' }, // Maroc
  TN: { lat: 36.8065, lon: 10.1815, city: 'Tunis' }, // Tunisie
  SN: { lat: 14.6928, lon: -17.4467, city: 'Dakar' }, // Sénégal
  CI: { lat: 6.8270, lon: -5.2893, city: 'Yamoussoukro' }, // Côte d'Ivoire
  CM: { lat: 3.8480, lon: 11.5021, city: 'Yaoundé' }, // Cameroun
  CD: { lat: -4.3217, lon: 15.3125, city: 'Kinshasa' }, // RD Congo
  CG: { lat: -4.2634, lon: 15.2429, city: 'Brazzaville' }, // Congo
  GA: { lat: 0.4162, lon: 9.4673, city: 'Libreville' }, // Gabon
  ML: { lat: 12.6392, lon: -8.0029, city: 'Bamako' }, // Mali
  BJ: { lat: 6.4969, lon: 2.6289, city: 'Porto-Novo' }, // Bénin
  NE: { lat: 13.5127, lon: 2.1128, city: 'Niamey' }, // Niger
  BF: { lat: 12.3714, lon: -1.5197, city: 'Ouagadougou' }, // Burkina Faso
  TG: { lat: 6.1256, lon: 1.2116, city: 'Lomé' }, // Togo
  TD: { lat: 12.1348, lon: 15.0557, city: 'N\'Djamena' }, // Tchad
  CF: { lat: 4.3947, lon: 18.5582, city: 'Bangui' }, // Centrafrique
  GN: { lat: 9.6412, lon: -13.5784, city: 'Conakry' }, // Guinée
  RW: { lat: -1.9536, lon: 30.0606, city: 'Kigali' }, // Rwanda
  BI: { lat: -3.3614, lon: 29.3599, city: 'Bujumbura' }, // Burundi
  DJ: { lat: 11.5721, lon: 43.1456, city: 'Djibouti' }, // Djibouti
  MG: { lat: -18.8792, lon: 47.5079, city: 'Antananarivo' }, // Madagascar
  MU: { lat: -20.1609, lon: 57.5012, city: 'Port-Louis' }, // Maurice
  SC: { lat: -4.6796, lon: 55.4920, city: 'Victoria' }, // Seychelles
  KM: { lat: -11.7172, lon: 43.2473, city: 'Moroni' }, // Comores

  // Pays francophones d'Amérique et Caraïbes
  CA: { lat: 45.4215, lon: -75.6972, city: 'Ottawa' }, // Canada
  HT: { lat: 18.5944, lon: -72.3074, city: 'Port-au-Prince' }, // Haïti

  // Pays francophones d'Asie/Moyen-Orient
  LB: { lat: 33.8886, lon: 35.4955, city: 'Beyrouth' }, // Liban
  VN: { lat: 21.0285, lon: 105.8542, city: 'Hanoï' }, // Vietnam
  KH: { lat: 11.5564, lon: 104.9282, city: 'Phnom Penh' }, // Cambodge
  LA: { lat: 17.9757, lon: 102.6331, city: 'Vientiane' }, // Laos

  // Pays francophones d'Océanie (Vanuatu déjà couvert via PF, NC, WF)
  VU: { lat: -17.7333, lon: 168.3273, city: 'Port-Vila' }, // Vanuatu

  // Autres pays majeurs
  US: { lat: 38.9072, lon: -77.0369, city: 'Washington D.C.' },
  GB: { lat: 51.5074, lon: -0.1278, city: 'London' },
  DE: { lat: 52.5200, lon: 13.4050, city: 'Berlin' },
  ES: { lat: 40.4168, lon: -3.7038, city: 'Madrid' },
  IT: { lat: 41.9028, lon: 12.4964, city: 'Rome' },
  PT: { lat: 38.7223, lon: -9.1393, city: 'Lisbonne' },
  NL: { lat: 52.3676, lon: 4.9041, city: 'Amsterdam' },
  AT: { lat: 48.2082, lon: 16.3738, city: 'Vienne' },
  GR: { lat: 37.9838, lon: 23.7275, city: 'Athènes' },
  AU: { lat: -35.2809, lon: 149.1300, city: 'Canberra' },
  JP: { lat: 35.6762, lon: 139.6503, city: 'Tokyo' },
  CN: { lat: 39.9042, lon: 116.4074, city: 'Beijing' },
  BR: { lat: -15.8267, lon: -47.9218, city: 'Brasília' },
  IN: { lat: 28.6139, lon: 77.2090, city: 'New Delhi' },
  MX: { lat: 19.4326, lon: -99.1332, city: 'Mexico City' },
  RU: { lat: 55.7558, lon: 37.6173, city: 'Moscow' },
  ZA: { lat: -25.7479, lon: 28.2293, city: 'Pretoria' },
  AR: { lat: -34.6037, lon: -58.3816, city: 'Buenos Aires' },
  CL: { lat: -33.4489, lon: -70.6693, city: 'Santiago' },
  CO: { lat: 4.7110, lon: -74.0721, city: 'Bogotá' },
  PE: { lat: -12.0464, lon: -77.0428, city: 'Lima' },
  EG: { lat: 30.0444, lon: 31.2357, city: 'Le Caire' },
  KE: { lat: -1.2921, lon: 36.8219, city: 'Nairobi' },
  NG: { lat: 9.0765, lon: 7.3986, city: 'Abuja' },
  ET: { lat: 9.0320, lon: 38.7469, city: 'Addis-Abeba' },
  GH: { lat: 5.6037, lon: -0.1870, city: 'Accra' },
  TH: { lat: 13.7563, lon: 100.5018, city: 'Bangkok' },
  MY: { lat: 3.1390, lon: 101.6869, city: 'Kuala Lumpur' },
  SG: { lat: 1.3521, lon: 103.8198, city: 'Singapour' },
  ID: { lat: -6.2088, lon: 106.8456, city: 'Jakarta' },
  PH: { lat: 14.5995, lon: 120.9842, city: 'Manille' },
  KR: { lat: 37.5665, lon: 126.9780, city: 'Séoul' },
  TR: { lat: 39.9334, lon: 32.8597, city: 'Ankara' },
  SA: { lat: 24.7136, lon: 46.6753, city: 'Riyad' },
  AE: { lat: 24.4539, lon: 54.3773, city: 'Abu Dhabi' },
  IL: { lat: 31.7683, lon: 35.2137, city: 'Jérusalem' },
  PL: { lat: 52.2297, lon: 21.0122, city: 'Varsovie' },
  CZ: { lat: 50.0755, lon: 14.4378, city: 'Prague' },
  HU: { lat: 47.4979, lon: 19.0402, city: 'Budapest' },
  RO: { lat: 44.4268, lon: 26.1025, city: 'Bucarest' },
  BG: { lat: 42.6977, lon: 23.3219, city: 'Sofia' },
  SE: { lat: 59.3293, lon: 18.0686, city: 'Stockholm' },
  NO: { lat: 59.9139, lon: 10.7522, city: 'Oslo' },
  DK: { lat: 55.6761, lon: 12.5683, city: 'Copenhague' },
  FI: { lat: 60.1699, lon: 24.9384, city: 'Helsinki' },
  IE: { lat: 53.3498, lon: -6.2603, city: 'Dublin' },
  NZ: { lat: -41.2865, lon: 174.7762, city: 'Wellington' },
};

/**
 * Get AQI level from numeric AQI value
 */
function getAQILevel(aqi: number): AirQualityLevel {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy_sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

/**
 * Get health recommendations based on AQI level
 */
function getAQIRecommendations(level: AirQualityLevel): string[] {
  switch (level) {
    case 'good':
      return ['Qualité de l\'air excellente. Activités en extérieur recommandées.'];
    case 'moderate':
      return [
        'Qualité de l\'air acceptable.',
        'Personnes sensibles: limitez les efforts intenses prolongés en extérieur.'
      ];
    case 'unhealthy_sensitive':
      return [
        'Qualité de l\'air nocive pour les groupes sensibles.',
        'Réduisez les efforts physiques prolongés en extérieur.',
        'Personnes à risque: restez à l\'intérieur autant que possible.'
      ];
    case 'unhealthy':
      return [
        'Qualité de l\'air malsaine.',
        'Évitez les efforts physiques en extérieur.',
        'Portez un masque si vous devez sortir.',
        'Gardez les fenêtres fermées.'
      ];
    case 'very_unhealthy':
      return [
        'Qualité de l\'air très malsaine.',
        'Restez à l\'intérieur.',
        'Utilisez un purificateur d\'air.',
        'Évitez tout exercice physique.'
      ];
    case 'hazardous':
      return [
        'Alerte pollution: risque sanitaire majeur.',
        'Ne sortez pas sauf urgence absolue.',
        'Portez un masque FFP2 si vous devez sortir.',
        'Consultez un médecin en cas de symptômes.'
      ];
  }
}

/**
 * Fetch weather data using multi-provider system with automatic fallback
 * Prioritizes Météo-France for French territories, falls back to Open-Meteo
 */
async function fetchWeatherData(
  countryCode: string,
  lat: number,
  lon: number
): Promise<WeatherData & { provider?: string }> {
  try {
    const { data, provider } = await weatherProviderManager.fetchWeather(
      countryCode,
      lat,
      lon
    );

    logger.info('GEOGRAPHIC_SERVICE', 'Weather data fetched successfully', {
      provider,
      countryCode,
      lat,
      lon,
    });

    return {
      ...data,
      provider,
    };
  } catch (error) {
    logger.error('GEOGRAPHIC_SERVICE', 'Failed to fetch weather data from all providers', {
      error: error instanceof Error ? error.message : 'Unknown error',
      countryCode,
      lat,
      lon,
    });
    throw error;
  }
}

/**
 * Fetch air quality data using multi-provider system with automatic fallback
 */
async function fetchAirQualityData(
  countryCode: string,
  lat: number,
  lon: number
): Promise<AirQualityData> {
  try {
    const { data, provider } = await weatherProviderManager.fetchAirQuality(
      countryCode,
      lat,
      lon
    );

    const aqi = data.aqi;
    const level = getAQILevel(aqi);

    // Determine dominant pollutant
    const pollutants = {
      'PM2.5': data.pm2_5,
      'PM10': data.pm10,
      'CO': data.co,
      'NO2': data.no2,
      'O3': data.o3,
      'SO2': data.so2,
    };
    const dominant = Object.entries(pollutants)
      .filter(([, value]) => value !== undefined && value > 0)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))[0]?.[0] || 'PM2.5';

    logger.info('GEOGRAPHIC_SERVICE', 'Air quality data fetched successfully', {
      provider,
      countryCode,
      aqi,
      level,
    });

    return {
      aqi,
      level,
      pm2_5: data.pm2_5,
      pm10: data.pm10,
      co: data.co,
      no2: data.no2,
      o3: data.o3,
      so2: data.so2,
      dominant_pollutant: dominant,
      health_recommendations: getAQIRecommendations(level),
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('GEOGRAPHIC_SERVICE', 'Failed to fetch air quality data from all providers', {
      error: error instanceof Error ? error.message : 'Unknown error',
      countryCode,
      lat,
      lon,
    });
    throw error;
  }
}

/**
 * Calculate personalized hydration recommendations
 */
function calculateHydrationRecommendation(
  weather: WeatherData,
  userWeightKg?: number,
  activityLevel?: PhysicalActivityLevel
): HydrationRecommendation {
  // Base hydration (European Food Safety Authority recommendations)
  const baseAmount = userWeightKg ? (userWeightKg * 0.033) : 2.0; // 33ml per kg, or 2L default

  // Temperature adjustment
  let tempAdjustment = 0;
  if (weather.temperature_celsius > 25) {
    tempAdjustment = ((weather.temperature_celsius - 25) / 5) * 0.5; // +0.5L per 5°C above 25°C
  }

  // Humidity adjustment
  let humidityAdjustment = 0;
  if (weather.humidity_percent < 30) {
    humidityAdjustment = 0.3; // +0.3L in dry conditions
  } else if (weather.humidity_percent > 80) {
    humidityAdjustment = 0.2; // +0.2L in very humid conditions (harder to cool down)
  }

  const weatherAdjustment = tempAdjustment + humidityAdjustment;

  // Activity level adjustment
  const activityAdjustments: Record<PhysicalActivityLevel, number> = {
    sedentary: 0,
    light: 0.3,
    moderate: 0.6,
    active: 1.0,
    athlete: 1.5,
  };
  const activityAdjustment = activityLevel ? activityAdjustments[activityLevel] : 0;

  const totalRecommended = Math.round((baseAmount + weatherAdjustment + activityAdjustment) * 10) / 10;

  // Generate recommendations
  const recommendations: string[] = [
    `Objectif d'hydratation: ${totalRecommended}L par jour`,
  ];

  if (weather.temperature_celsius > 30) {
    recommendations.push('⚠️ Température élevée: augmentez votre consommation d\'eau');
  }

  if (weather.humidity_percent < 30) {
    recommendations.push('🌵 Air sec: hydratez-vous régulièrement');
  }

  if (activityLevel && ['active', 'athlete'].includes(activityLevel)) {
    recommendations.push('🏃 Activité intense: buvez avant, pendant et après l\'exercice');
  }

  // Alerts
  const alerts: string[] = [];
  if (totalRecommended > 4.0) {
    alerts.push('Conditions extrêmes détectées. Surveillez votre hydratation attentivement.');
  }

  return {
    base_amount_liters: Math.round(baseAmount * 10) / 10,
    weather_adjustment_liters: Math.round(weatherAdjustment * 10) / 10,
    activity_adjustment_liters: Math.round(activityAdjustment * 10) / 10,
    total_recommended_liters: totalRecommended,
    factors: {
      temperature: weather.temperature_celsius,
      humidity: weather.humidity_percent,
      physical_activity_level: activityLevel || 'non renseigné',
      user_weight_kg: userWeightKg,
    },
    recommendations,
    alerts,
  };
}

/**
 * Calculate environmental exposure
 */
function calculateEnvironmentalExposure(airQuality: AirQualityData): EnvironmentalExposure {
  const exposureLevel =
    airQuality.level === 'good' || airQuality.level === 'moderate' ? 'low' :
    airQuality.level === 'unhealthy_sensitive' ? 'moderate' :
    airQuality.level === 'unhealthy' ? 'high' : 'severe';

  const pollutionSources: string[] = [];
  if (airQuality.pm2_5 && airQuality.pm2_5 > 25) pollutionSources.push('Particules fines (PM2.5)');
  if (airQuality.pm10 && airQuality.pm10 > 50) pollutionSources.push('Particules (PM10)');
  if (airQuality.no2 && airQuality.no2 > 40) pollutionSources.push('Dioxyde d\'azote (NO2)');
  if (airQuality.o3 && airQuality.o3 > 100) pollutionSources.push('Ozone (O3)');

  const protectiveMeasures: string[] = [];
  if (exposureLevel === 'moderate' || exposureLevel === 'high') {
    protectiveMeasures.push('Limitez les activités extérieures intenses');
    protectiveMeasures.push('Fermez les fenêtres pendant les pics de pollution');
  }
  if (exposureLevel === 'high' || exposureLevel === 'severe') {
    protectiveMeasures.push('Portez un masque lors des sorties');
    protectiveMeasures.push('Utilisez un purificateur d\'air intérieur');
  }

  return {
    air_quality: airQuality,
    pollution_sources: pollutionSources,
    exposure_level: exposureLevel,
    protective_measures: protectiveMeasures,
  };
}

/**
 * Get cached geographic data or fetch new data
 */
/**
 * Get list of supported country codes
 */
export function getSupportedCountries(): string[] {
  return Object.keys(COUNTRY_COORDINATES);
}

/**
 * Check if a country is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return countryCode in COUNTRY_COORDINATES;
}

export async function getGeographicData(
  userId: string,
  countryCode: string,
  userWeightKg?: number,
  activityLevel?: PhysicalActivityLevel
): Promise<GeographicData> {
  try {
    const coords = COUNTRY_COORDINATES[countryCode];
    if (!coords) {
      logger.warn('GEOGRAPHIC_SERVICE', 'Country not supported for geographic data', {
        countryCode,
        userId,
        supportedCountries: getSupportedCountries().length,
      });
      throw new Error(`Le pays "${countryCode}" n'est pas encore supporté pour les données géographiques. ${getSupportedCountries().length} pays disponibles.`);
    }

    const locationKey = `${countryCode}_${coords.city.replace(/\s/g, '')}`;

    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('geographic_data_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('location_key', locationKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cachedData && !cacheError) {
      logger.info('GEOGRAPHIC_SERVICE', 'Using cached geographic data', { userId, locationKey });

      // Recalculate hydration with current user data
      const weather = cachedData.weather_data as WeatherData;
      const hydrationData = calculateHydrationRecommendation(weather, userWeightKg, activityLevel);

      return {
        user_id: userId,
        country_code: countryCode,
        city: coords.city,
        latitude: coords.lat,
        longitude: coords.lon,
        weather: weather,
        air_quality: cachedData.air_quality_data as AirQualityData,
        environmental_exposure: cachedData.environmental_data as EnvironmentalExposure,
        hydration_recommendation: hydrationData,
        last_updated: cachedData.created_at,
        next_update_due: cachedData.expires_at,
      };
    }

    // Fetch fresh data
    logger.info('GEOGRAPHIC_SERVICE', 'Fetching fresh geographic data', {
      userId,
      countryCode,
      city: coords.city,
      availableProviders: weatherProviderManager.getAvailableProviders(countryCode),
    });

    const [weather, airQuality] = await Promise.all([
      fetchWeatherData(countryCode, coords.lat, coords.lon),
      fetchAirQualityData(countryCode, coords.lat, coords.lon),
    ]);

    const environmentalExposure = calculateEnvironmentalExposure(airQuality);
    const hydrationRecommendation = calculateHydrationRecommendation(weather, userWeightKg, activityLevel);

    // Cache the data
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    const { error: insertError } = await supabase
      .from('geographic_data_cache')
      .upsert({
        user_id: userId,
        country_code: countryCode,
        city: coords.city,
        location_key: locationKey,
        weather_data: weather,
        air_quality_data: airQuality,
        environmental_data: environmentalExposure,
        hydration_data: hydrationRecommendation,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'user_id,location_key',
      });

    if (insertError) {
      logger.error('GEOGRAPHIC_SERVICE', 'Failed to cache geographic data', {
        error: insertError.message,
        userId,
      });
    }

    // Save to history (once per day per user)
    await saveGeographicDataHistory(userId, countryCode, coords, weather, airQuality, environmentalExposure, hydrationRecommendation);

    return {
      user_id: userId,
      country_code: countryCode,
      city: coords.city,
      latitude: coords.lat,
      longitude: coords.lon,
      weather,
      air_quality: airQuality,
      environmental_exposure: environmentalExposure,
      hydration_recommendation: hydrationRecommendation,
      last_updated: new Date().toISOString(),
      next_update_due: expiresAt.toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's an unsupported country error
    if (errorMessage.includes('pas encore supporté')) {
      logger.warn('GEOGRAPHIC_SERVICE', 'Unsupported country requested', {
        error: errorMessage,
        userId,
        countryCode,
      });
    } else {
      logger.error('GEOGRAPHIC_SERVICE', 'Failed to get geographic data', {
        error: errorMessage,
        userId,
        countryCode,
      });
    }
    throw error;
  }
}

/**
 * Save geographic data to history (once per day per user)
 */
async function saveGeographicDataHistory(
  userId: string,
  countryCode: string,
  coords: { lat: number; lon: number; city: string },
  weather: WeatherData,
  airQuality: AirQualityData,
  environmentalExposure: EnvironmentalExposure,
  hydrationRecommendation: HydrationRecommendation
): Promise<void> {
  try {
    // Check if we already have a record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: existing } = await supabase
      .from('geographic_data_history')
      .select('id')
      .eq('user_id', userId)
      .gte('recorded_at', today.toISOString())
      .lt('recorded_at', tomorrow.toISOString())
      .maybeSingle();

    // If we already have data for today, skip
    if (existing) {
      logger.debug('GEOGRAPHIC_SERVICE', 'Geographic data already saved for today', { userId });
      return;
    }

    // Save new history entry
    const { error } = await supabase
      .from('geographic_data_history')
      .insert({
        user_id: userId,
        country_code: countryCode,
        city: coords.city,
        latitude: coords.lat,
        longitude: coords.lon,
        weather: weather,
        air_quality: airQuality,
        hydration_recommendation: hydrationRecommendation,
        environmental_exposure: environmentalExposure,
        recorded_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('GEOGRAPHIC_SERVICE', 'Failed to save geographic data history', {
        error: error.message,
        userId,
      });
    } else {
      logger.info('GEOGRAPHIC_SERVICE', 'Saved geographic data history', { userId, date: today.toISOString() });
    }
  } catch (error) {
    logger.error('GEOGRAPHIC_SERVICE', 'Failed to save geographic data history', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
    });
  }
}

/**
 * Get geographic data history for a user
 */
export async function getGeographicDataHistory(
  userId: string,
  limit: number = 30
): Promise<GeographicData[]> {
  try {
    const { data, error } = await supabase
      .from('geographic_data_history')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('GEOGRAPHIC_SERVICE', 'Failed to fetch geographic data history', {
        error: error.message,
        userId,
      });
      return [];
    }

    return (data || []).map(record => ({
      user_id: record.user_id,
      country_code: record.country_code,
      city: record.city || undefined,
      latitude: record.latitude ? Number(record.latitude) : undefined,
      longitude: record.longitude ? Number(record.longitude) : undefined,
      weather: record.weather as WeatherData,
      air_quality: record.air_quality as AirQualityData,
      hydration_recommendation: record.hydration_recommendation as HydrationRecommendation,
      environmental_exposure: record.environmental_exposure as EnvironmentalExposure,
      last_updated: record.recorded_at,
      next_update_due: undefined,
    }));
  } catch (error) {
    logger.error('GEOGRAPHIC_SERVICE', 'Failed to fetch geographic data history', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
    });
    return [];
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredGeographicData(): Promise<void> {
  try {
    const { error } = await supabase
      .from('geographic_data_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      logger.error('GEOGRAPHIC_SERVICE', 'Failed to cleanup expired data', {
        error: error.message,
      });
    } else {
      logger.info('GEOGRAPHIC_SERVICE', 'Cleaned up expired geographic data');
    }
  } catch (error) {
    logger.error('GEOGRAPHIC_SERVICE', 'Failed to cleanup expired data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
