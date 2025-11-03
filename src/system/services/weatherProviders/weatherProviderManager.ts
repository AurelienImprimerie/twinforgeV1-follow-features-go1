/**
 * Weather Provider Manager
 * Manages multiple weather providers with automatic fallback
 * Prioritizes providers based on region and availability
 */

import type { WeatherProvider, WeatherProviderResponse, AirQualityProviderResponse, WeatherProviderError } from './types';
import { MeteoFranceProvider } from './meteoFranceProvider';
import { OpenMeteoProvider } from './openMeteoProvider';
import logger from '../../../lib/utils/logger';

export class WeatherProviderManager {
  private providers: WeatherProvider[];

  constructor() {
    // Initialize providers in priority order
    this.providers = [
      new MeteoFranceProvider(),  // Priority 10 - French territories
      new OpenMeteoProvider(),     // Priority 90 - Global fallback
    ];

    // Sort by priority (lower number = higher priority)
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get the best provider for a given country code
   */
  private getBestProvider(countryCode: string): WeatherProvider[] {
    return this.providers
      .filter(provider => provider.supportsRegion(countryCode))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Fetch weather data with automatic fallback
   */
  async fetchWeather(
    countryCode: string,
    lat: number,
    lon: number
  ): Promise<{ data: WeatherProviderResponse; provider: string }> {
    const providers = this.getBestProvider(countryCode);
    const errors: Array<{ provider: string; error: string }> = [];

    logger.info('WEATHER_MANAGER', 'Fetching weather data', {
      countryCode,
      lat,
      lon,
      availableProviders: providers.length,
    });

    for (const provider of providers) {
      try {
        logger.info('WEATHER_MANAGER', `Trying provider: ${provider.name}`, {
          priority: provider.priority,
        });

        const data = await provider.fetchWeather(lat, lon);

        logger.info('WEATHER_MANAGER', `Successfully fetched weather from ${provider.name}`, {
          countryCode,
        });

        return { data, provider: provider.name };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const retryable = (error as WeatherProviderError).retryable !== false;

        logger.warn('WEATHER_MANAGER', `Provider ${provider.name} failed`, {
          error: errorMessage,
          retryable,
          countryCode,
        });

        errors.push({ provider: provider.name, error: errorMessage });

        // If error is not retryable, try next provider immediately
        if (!retryable) {
          continue;
        }
      }
    }

    // All providers failed
    logger.error('WEATHER_MANAGER', 'All weather providers failed', {
      countryCode,
      errors,
    });

    throw new Error(
      `Impossible de récupérer les données météo. Tous les fournisseurs ont échoué: ${errors.map(e => e.provider).join(', ')}`
    );
  }

  /**
   * Fetch air quality data with automatic fallback
   */
  async fetchAirQuality(
    countryCode: string,
    lat: number,
    lon: number
  ): Promise<{ data: AirQualityProviderResponse; provider: string }> {
    const providers = this.getBestProvider(countryCode);
    const errors: Array<{ provider: string; error: string }> = [];

    logger.info('WEATHER_MANAGER', 'Fetching air quality data', {
      countryCode,
      lat,
      lon,
      availableProviders: providers.length,
    });

    for (const provider of providers) {
      try {
        logger.info('WEATHER_MANAGER', `Trying provider: ${provider.name} for air quality`, {
          priority: provider.priority,
        });

        const data = await provider.fetchAirQuality(lat, lon);

        logger.info('WEATHER_MANAGER', `Successfully fetched air quality from ${provider.name}`, {
          countryCode,
        });

        return { data, provider: provider.name };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const retryable = (error as WeatherProviderError).retryable !== false;

        logger.warn('WEATHER_MANAGER', `Provider ${provider.name} failed for air quality`, {
          error: errorMessage,
          retryable,
          countryCode,
        });

        errors.push({ provider: provider.name, error: errorMessage });

        if (!retryable) {
          continue;
        }
      }
    }

    // All providers failed
    logger.error('WEATHER_MANAGER', 'All air quality providers failed', {
      countryCode,
      errors,
    });

    throw new Error(
      `Impossible de récupérer les données de qualité de l'air. Tous les fournisseurs ont échoué: ${errors.map(e => e.provider).join(', ')}`
    );
  }

  /**
   * Get list of available providers for a country
   */
  getAvailableProviders(countryCode: string): string[] {
    return this.getBestProvider(countryCode).map(p => p.name);
  }
}

// Singleton instance
export const weatherProviderManager = new WeatherProviderManager();
