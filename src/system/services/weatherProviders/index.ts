/**
 * Weather Providers Module
 * Multi-provider weather system with automatic fallback
 */

export { weatherProviderManager } from './weatherProviderManager';
export { MeteoFranceProvider } from './meteoFranceProvider';
export { OpenMeteoProvider } from './openMeteoProvider';
export type {
  WeatherProvider,
  WeatherProviderResponse,
  AirQualityProviderResponse,
  WeatherProviderError,
} from './types';
