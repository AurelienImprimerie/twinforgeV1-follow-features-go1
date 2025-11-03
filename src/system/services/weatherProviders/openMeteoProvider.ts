/**
 * Open-Meteo Weather Provider
 * Free weather API with global coverage
 * Good for worldwide locations, but limited resolution for small islands
 */

import type { WeatherProvider, WeatherProviderResponse, AirQualityProviderResponse, WeatherProviderError } from './types';
import logger from '../../../lib/utils/logger';

export class OpenMeteoProvider implements WeatherProvider {
  name = 'Open-Meteo';
  priority = 90; // Lower priority, used as fallback

  supportsRegion(countryCode: string): boolean {
    // Open-Meteo supports all regions globally
    return true;
  }

  async fetchWeather(lat: number, lon: number): Promise<WeatherProviderResponse> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,pressure_msl,visibility&timezone=auto`;

      logger.info('OPEN_METEO', 'Fetching weather data', { lat, lon });

      const response = await fetch(url);
      if (!response.ok) {
        const error: WeatherProviderError = new Error(`Open-Meteo API error: ${response.statusText}`) as WeatherProviderError;
        error.provider = this.name;
        error.statusCode = response.status;
        error.retryable = response.status >= 500;
        throw error;
      }

      const data = await response.json();
      const current = data.current;

      // Map weather codes to French descriptions
      const weatherDescriptions: Record<number, string> = {
        0: 'Dégagé',
        1: 'Principalement dégagé',
        2: 'Partiellement nuageux',
        3: 'Couvert',
        45: 'Brouillard',
        48: 'Brouillard givrant',
        51: 'Bruine légère',
        53: 'Bruine modérée',
        55: 'Bruine dense',
        61: 'Pluie légère',
        63: 'Pluie modérée',
        65: 'Pluie forte',
        71: 'Chute de neige légère',
        73: 'Chute de neige modérée',
        75: 'Chute de neige forte',
        80: 'Averses légères',
        81: 'Averses modérées',
        82: 'Averses fortes',
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
        visibility_km: current.visibility ? current.visibility / 1000 : undefined,
        weather_condition: weatherDescriptions[current.weather_code] || 'Inconnu',
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'provider' in error) {
        throw error;
      }
      const providerError: WeatherProviderError = new Error(
        `Open-Meteo weather fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as WeatherProviderError;
      providerError.provider = this.name;
      providerError.retryable = true;
      throw providerError;
    }
  }

  async fetchAirQuality(lat: number, lon: number): Promise<AirQualityProviderResponse> {
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

      logger.info('OPEN_METEO', 'Fetching air quality data', { lat, lon });

      const response = await fetch(url);
      if (!response.ok) {
        const error: WeatherProviderError = new Error(`Open-Meteo Air Quality API error: ${response.statusText}`) as WeatherProviderError;
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
        `Open-Meteo air quality fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as WeatherProviderError;
      providerError.provider = this.name;
      providerError.retryable = true;
      throw providerError;
    }
  }
}
