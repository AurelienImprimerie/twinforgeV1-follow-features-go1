/**
 * Weather Provider Types
 * Common types for all weather API providers
 */

export interface WeatherProviderResponse {
  temperature_celsius: number;
  feels_like_celsius?: number;
  humidity_percent: number;
  wind_speed_ms?: number;
  wind_direction?: number;
  precipitation_mm?: number;
  cloud_cover_percent?: number;
  pressure_hpa?: number;
  visibility_km?: number;
  weather_condition: string;
  last_updated: string;
}

export interface AirQualityProviderResponse {
  aqi: number;
  pm2_5?: number;
  pm10?: number;
  co?: number;
  no2?: number;
  o3?: number;
  so2?: number;
}

export interface WeatherProvider {
  name: string;
  priority: number; // Lower number = higher priority
  supportsRegion(countryCode: string): boolean;
  fetchWeather(lat: number, lon: number): Promise<WeatherProviderResponse>;
  fetchAirQuality(lat: number, lon: number): Promise<AirQualityProviderResponse>;
}

export interface WeatherProviderError extends Error {
  provider: string;
  statusCode?: number;
  retryable: boolean;
}
