/**
 * Météo-France Weather Provider
 * Official French weather service with excellent coverage of France and DOM-TOM
 * FREE since January 2024 via open data initiative
 * Priority provider for French territories
 *
 * Note: Météo-France API requires registration at https://portail-api.meteofrance.fr/
 * For now, we use their public data sources which don't require authentication
 * For production, register and use authenticated API endpoints
 */

import type { WeatherProvider, WeatherProviderResponse, AirQualityProviderResponse, WeatherProviderError } from './types';
import logger from '../../../lib/utils/logger';

export class MeteoFranceProvider implements WeatherProvider {
  name = 'Météo-France';
  priority = 10; // Highest priority for French territories

  // French territories and regions covered by Météo-France
  private readonly FRENCH_TERRITORIES = [
    'FR', // France métropolitaine
    'GP', // Guadeloupe
    'MQ', // Martinique
    'GF', // Guyane
    'RE', // Réunion
    'YT', // Mayotte
    'PM', // Saint-Pierre-et-Miquelon
    'BL', // Saint-Barthélemy
    'MF', // Saint-Martin
    'WF', // Wallis-et-Futuna
    'PF', // Polynésie française
    'NC', // Nouvelle-Calédonie
  ];

  supportsRegion(countryCode: string): boolean {
    return this.FRENCH_TERRITORIES.includes(countryCode);
  }

  async fetchWeather(lat: number, lon: number): Promise<WeatherProviderResponse> {
    try {
      // Note: Using Open-Meteo's Météo-France model integration as temporary solution
      // For production, migrate to direct Météo-France API at https://portail-api.meteofrance.fr/
      const url = `https://api.open-meteo.com/v1/meteofrance?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,pressure_msl&timezone=auto`;

      logger.info('METEO_FRANCE', 'Fetching weather data via Météo-France model', { lat, lon });

      const response = await fetch(url);
      if (!response.ok) {
        const error: WeatherProviderError = new Error(`Météo-France API error: ${response.statusText}`) as WeatherProviderError;
        error.provider = this.name;
        error.statusCode = response.status;
        error.retryable = response.status >= 500;
        throw error;
      }

      const data = await response.json();
      const current = data.current;

      // Map weather codes to French descriptions
      const weatherDescriptions: Record<number, string> = {
        0: 'Ciel dégagé',
        1: 'Principalement dégagé',
        2: 'Partiellement nuageux',
        3: 'Couvert',
        45: 'Brouillard',
        48: 'Brouillard givrant',
        51: 'Bruine légère',
        53: 'Bruine modérée',
        55: 'Bruine dense',
        61: 'Pluie faible',
        63: 'Pluie modérée',
        65: 'Pluie forte',
        66: 'Pluie verglaçante légère',
        67: 'Pluie verglaçante forte',
        71: 'Chute de neige faible',
        73: 'Chute de neige modérée',
        75: 'Chute de neige forte',
        77: 'Grains de neige',
        80: 'Averses faibles',
        81: 'Averses modérées',
        82: 'Averses fortes',
        85: 'Averses de neige faibles',
        86: 'Averses de neige fortes',
        95: 'Orage',
        96: 'Orage avec grêle légère',
        99: 'Orage avec grêle forte',
      };

      return {
        temperature_celsius: current.temperature_2m,
        feels_like_celsius: current.apparent_temperature,
        humidity_percent: current.relative_humidity_2m,
        wind_speed_ms: current.wind_speed_10m,
        wind_direction: current.wind_direction_10m,
        precipitation_mm: current.precipitation,
        cloud_cover_percent: current.cloud_cover,
        pressure_hpa: current.pressure_msl,
        weather_condition: weatherDescriptions[current.weather_code] || 'Conditions variables',
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'provider' in error) {
        throw error;
      }
      const providerError: WeatherProviderError = new Error(
        `Météo-France weather fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as WeatherProviderError;
      providerError.provider = this.name;
      providerError.retryable = true;
      throw providerError;
    }
  }

  async fetchAirQuality(lat: number, lon: number): Promise<AirQualityProviderResponse> {
    try {
      // For now, fallback to Open-Meteo for air quality
      // Météo-France doesn't provide air quality data via their public API
      // In production, integrate with Prev'Air (French air quality system)
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

      logger.info('METEO_FRANCE', 'Fetching air quality data (via fallback)', { lat, lon });

      const response = await fetch(url);
      if (!response.ok) {
        const error: WeatherProviderError = new Error(`Air quality API error: ${response.statusText}`) as WeatherProviderError;
        error.provider = this.name;
        error.statusCode = response.status;
        error.retryable = response.status >= 500;
        throw error;
      }

      const data = await response.json();
      const current = data.current;

      return {
        aqi: current.european_aqi || 50,
        pm2_5: current.pm2_5,
        pm10: current.pm10,
        co: current.carbon_monoxide,
        no2: current.nitrogen_dioxide,
        o3: current.ozone,
        so2: current.sulphur_dioxide,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'provider' in error) {
        throw error;
      }
      const providerError: WeatherProviderError = new Error(
        `Air quality fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as WeatherProviderError;
      providerError.provider = this.name;
      providerError.retryable = true;
      throw providerError;
    }
  }
}
