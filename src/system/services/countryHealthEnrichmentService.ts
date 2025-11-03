/**
 * Country Health Enrichment Service
 * Fetches and caches health-related data for countries using external APIs
 */

import { supabase } from '../supabase/client';
import type { CountryHealthData } from '../../domain/health';
import logger from '../../lib/utils/logger';

const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';
const WHO_GHO_API = 'https://ghoapi.azureedge.net/api';

const CACHE_DURATION_DAYS = 30;

export interface RestCountryResponse {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  capital?: string[];
  region: string;
  subregion?: string;
  latlng?: [number, number];
  population: number;
  timezones?: string[];
}

export class CountryHealthEnrichmentService {
  private static instance: CountryHealthEnrichmentService;

  private constructor() {}

  static getInstance(): CountryHealthEnrichmentService {
    if (!CountryHealthEnrichmentService.instance) {
      CountryHealthEnrichmentService.instance = new CountryHealthEnrichmentService();
    }
    return CountryHealthEnrichmentService.instance;
  }

  async enrichCountryData(countryName: string): Promise<CountryHealthData | null> {
    try {
      logger.info('COUNTRY_HEALTH_ENRICHMENT', 'Starting enrichment', { countryName });

      const cachedData = await this.getCachedCountryData(countryName);
      if (cachedData && this.isCacheValid(cachedData.last_updated)) {
        logger.info('COUNTRY_HEALTH_ENRICHMENT', 'Using cached data', { countryName });
        return cachedData;
      }

      const countryCode = await this.getCountryCode(countryName);
      if (!countryCode) {
        logger.warn('COUNTRY_HEALTH_ENRICHMENT', 'Country code not found', { countryName });
        return this.getStaticCountryData(countryName);
      }

      const basicInfo = await this.fetchRestCountriesData(countryName);
      const enrichedData: CountryHealthData = {
        country_code: countryCode,
        country_name: countryName,
        endemic_diseases: this.getEndemicDiseasesByRegion(basicInfo?.region || ''),
        vaccination_requirements: this.getVaccinationRequirements(countryCode),
        health_risks: this.getHealthRisksByRegion(basicInfo?.region || '', basicInfo?.subregion || ''),
        common_deficiencies: this.getCommonDeficiencies(basicInfo?.region || ''),
        climate_data: this.inferClimateData(basicInfo?.latlng),
        last_updated: new Date().toISOString(),
        data_source: 'rest_countries_api',
      };

      await this.saveCountryData(enrichedData);

      logger.info('COUNTRY_HEALTH_ENRICHMENT', 'Enrichment completed', {
        countryName,
        countryCode,
      });

      return enrichedData;
    } catch (error) {
      logger.error('COUNTRY_HEALTH_ENRICHMENT', 'Enrichment failed', {
        countryName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return this.getStaticCountryData(countryName);
    }
  }

  private async getCachedCountryData(countryName: string): Promise<CountryHealthData | null> {
    try {
      const { data, error } = await supabase
        .from('country_health_data')
        .select('*')
        .eq('country_name', countryName)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          logger.warn('COUNTRY_HEALTH_CACHE', 'Table does not exist yet', { countryName });
          return null;
        }
        logger.error('COUNTRY_HEALTH_CACHE', 'Cache read error', { error: error.message });
        return null;
      }

      return data as CountryHealthData | null;
    } catch (error) {
      logger.error('COUNTRY_HEALTH_CACHE', 'Cache read exception', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return null;
    }
  }

  private isCacheValid(lastUpdated: string): boolean {
    const cacheDate = new Date(lastUpdated);
    const now = new Date();
    const daysDiff = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < CACHE_DURATION_DAYS;
  }

  private async getCountryCode(countryName: string): Promise<string | null> {
    const countryMap: Record<string, string> = {
      'France': 'FR',
      'Belgique': 'BE',
      'Suisse': 'CH',
      'Canada': 'CA',
      'Maroc': 'MA',
      'Tunisie': 'TN',
      'Algérie': 'DZ',
      'Sénégal': 'SN',
      'Côte d\'Ivoire': 'CI',
      'Mali': 'ML',
      'Burkina Faso': 'BF',
      'Niger': 'NE',
      'Tchad': 'TD',
      'Cameroun': 'CM',
      'Congo': 'CG',
      'Congo (RDC)': 'CD',
      'Gabon': 'GA',
      'Madagascar': 'MG',
      'Maurice': 'MU',
      'Réunion': 'RE',
      'Luxembourg': 'LU',
      'Monaco': 'MC',
      'Haïti': 'HT',
      'États-Unis': 'US',
      'Royaume-Uni': 'GB',
      'Australie': 'AU',
      'Nouvelle-Zélande': 'NZ',
      'Afrique du Sud': 'ZA',
      'Inde': 'IN',
      'Singapour': 'SG',
      // Territoires français d'outre-mer
      'Martinique': 'MQ',
      'Guadeloupe': 'GP',
      'Guyane': 'GF',
      'Guyane française': 'GF',
      'Mayotte': 'YT',
      'Saint-Martin': 'MF',
      'Saint-Barthélemy': 'BL',
      'Saint-Pierre-et-Miquelon': 'PM',
      'Wallis-et-Futuna': 'WF',
      'Polynésie française': 'PF',
      'Nouvelle-Calédonie': 'NC',
      // Autres pays francophones
      'Bénin': 'BJ',
      'Togo': 'TG',
      'Guinée': 'GN',
      'Centrafrique': 'CF',
      'République centrafricaine': 'CF',
      'Rwanda': 'RW',
      'Burundi': 'BI',
      'Djibouti': 'DJ',
      'Comores': 'KM',
      'Seychelles': 'SC',
      'Vanuatu': 'VU',
      'Liban': 'LB',
      'Mauritanie': 'MR',
      'Guinée équatoriale': 'GQ',
    };

    return countryMap[countryName] || null;
  }

  private async fetchRestCountriesData(countryName: string): Promise<RestCountryResponse | null> {
    try {
      const response = await fetch(`${REST_COUNTRIES_API}/name/${encodeURIComponent(countryName)}?fullText=false`);
      if (!response.ok) {
        logger.warn('REST_COUNTRIES_API', 'API request failed', {
          status: response.status,
          countryName,
        });
        return null;
      }

      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      logger.error('REST_COUNTRIES_API', 'Fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown',
        countryName,
      });
      return null;
    }
  }

  private getEndemicDiseasesByRegion(region: string): string[] {
    const endemicDiseases: Record<string, string[]> = {
      'Africa': [
        'Malaria',
        'Yellow Fever',
        'Dengue',
        'Ebola (specific regions)',
        'Tuberculosis',
        'HIV/AIDS',
        'Schistosomiasis',
        'Trypanosomiasis',
      ],
      'Asia': [
        'Dengue',
        'Japanese Encephalitis',
        'Malaria (specific regions)',
        'Tuberculosis',
        'Hepatitis B',
        'Typhoid',
      ],
      'Europe': [
        'Lyme Disease',
        'Tick-borne Encephalitis',
        'Influenza (seasonal)',
      ],
      'Americas': [
        'Dengue',
        'Zika',
        'Chikungunya',
        'Chagas Disease (Latin America)',
        'Lyme Disease (North America)',
      ],
      'Oceania': [
        'Dengue',
        'Ross River Virus',
        'Influenza (seasonal)',
      ],
    };

    return endemicDiseases[region] || [];
  }

  private getVaccinationRequirements(countryCode: string) {
    const highRiskMalaria = ['SN', 'CI', 'ML', 'BF', 'NE', 'TD', 'CM', 'CG', 'CD', 'GA', 'MG'];
    const yellowFeverRisk = ['SN', 'CI', 'ML', 'BF', 'NE', 'TD', 'CM', 'CG', 'CD', 'GA'];

    return {
      required: [],
      recommended: [
        'Hepatitis A',
        'Hepatitis B',
        'Tetanus-Diphtheria',
        'Measles-Mumps-Rubella (MMR)',
        ...(yellowFeverRisk.includes(countryCode) ? ['Yellow Fever'] : []),
        ...(highRiskMalaria.includes(countryCode) ? ['Typhoid', 'Meningococcal'] : []),
      ],
      seasonal: [],
    };
  }

  private getHealthRisksByRegion(region: string, subregion: string) {
    const africanCountries = ['Africa'];
    const tropicalCountries = ['Western Africa', 'Middle Africa', 'Eastern Africa', 'South-Eastern Asia'];

    return {
      vector_borne_diseases: africanCountries.includes(region) || tropicalCountries.includes(subregion)
        ? ['Malaria', 'Dengue', 'Yellow Fever', 'Chikungunya']
        : ['Lyme Disease', 'Tick-borne Encephalitis'],
      waterborne_diseases: africanCountries.includes(region)
        ? ['Cholera', 'Typhoid', 'Hepatitis A', 'Schistosomiasis']
        : ['Giardiasis', 'Cryptosporidiosis'],
      foodborne_risks: [
        'Traveler\'s Diarrhea',
        'Food Poisoning',
        'Hepatitis A',
      ],
      environmental_hazards: [],
    };
  }

  private getCommonDeficiencies(region: string): string[] {
    const deficiencies: Record<string, string[]> = {
      'Africa': ['Iron', 'Vitamin A', 'Iodine', 'Zinc', 'Vitamin D'],
      'Asia': ['Iron', 'Vitamin A', 'Iodine', 'Vitamin D'],
      'Europe': ['Vitamin D', 'Iodine (specific regions)', 'Iron (women)'],
      'Americas': ['Vitamin D', 'Iron', 'Calcium'],
      'Oceania': ['Vitamin D', 'Iron', 'Iodine'],
    };

    return deficiencies[region] || ['Vitamin D', 'Iron'];
  }

  private getStaticCountryData(countryName: string): CountryHealthData | null {
    logger.info('COUNTRY_HEALTH_ENRICHMENT', 'Using static fallback data', { countryName });

    return {
      country_code: 'UNKNOWN',
      country_name: countryName,
      endemic_diseases: [],
      vaccination_requirements: {
        required: [],
        recommended: ['Hepatitis A', 'Hepatitis B', 'Tetanus-Diphtheria'],
        seasonal: [],
      },
      health_risks: {
        vector_borne_diseases: [],
        waterborne_diseases: [],
        foodborne_risks: ['Traveler\'s Diarrhea', 'Food Poisoning'],
        environmental_hazards: [],
      },
      common_deficiencies: ['Vitamin D', 'Iron'],
      climate_data: {},
      last_updated: new Date().toISOString(),
      data_source: 'static_fallback',
    };
  }

  private inferClimateData(latlng?: [number, number]) {
    if (!latlng) return {};

    const [lat] = latlng;

    if (Math.abs(lat) < 23.5) {
      return {
        climate_zones: ['Tropical'],
        avg_temperature_celsius: 27,
        avg_humidity_percent: 75,
      };
    } else if (Math.abs(lat) < 35) {
      return {
        climate_zones: ['Subtropical'],
        avg_temperature_celsius: 20,
        avg_humidity_percent: 65,
      };
    } else if (Math.abs(lat) < 60) {
      return {
        climate_zones: ['Temperate'],
        avg_temperature_celsius: 12,
        avg_humidity_percent: 70,
      };
    } else {
      return {
        climate_zones: ['Cold'],
        avg_temperature_celsius: 2,
        avg_humidity_percent: 75,
      };
    }
  }

  private async saveCountryData(data: CountryHealthData): Promise<void> {
    try {
      const { error } = await supabase
        .from('country_health_data')
        .upsert(
          {
            country_code: data.country_code,
            country_name: data.country_name,
            climate_data: data.climate_data || {},
            endemic_diseases: data.endemic_diseases || [],
            vaccination_requirements: data.vaccination_requirements || {},
            health_risks: data.health_risks || {},
            common_deficiencies: data.common_deficiencies || [],
            last_updated: data.last_updated,
            data_source: data.data_source,
          },
          { onConflict: 'country_code' }
        );

      if (error) {
        // Handle specific error cases gracefully
        if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          logger.warn('COUNTRY_HEALTH_SAVE', 'Table does not exist, skipping global save', { country: data.country_name });
          return;
        }

        // 403 Forbidden - RLS issue, non-critical, data is cached in user profile
        if (error.code === '42501' || error.message?.includes('policy')) {
          logger.info('COUNTRY_HEALTH_SAVE', 'RLS prevented global save, data cached in user profile', {
            country: data.country_name,
            code: error.code
          });
          return;
        }

        // For other errors, log but don't throw - the data is still cached in user profile
        logger.warn('COUNTRY_HEALTH_SAVE', 'Global save failed, continuing with user cache', {
          error: error.message,
          country: data.country_name
        });
      } else {
        logger.info('COUNTRY_HEALTH_SAVE', 'Successfully saved to global cache', { country: data.country_name });
      }
    } catch (error) {
      // Catch any unexpected errors but continue gracefully
      logger.warn('COUNTRY_HEALTH_SAVE', 'Save exception, continuing with user cache', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      // Don't re-throw - we want the enrichment to continue even if global save fails
    }
  }

  async updateUserCountryCache(userId: string, countryName: string): Promise<void> {
    try {
      const countryData = await this.enrichCountryData(countryName);
      if (!countryData) return;

      const { error } = await supabase
        .from('user_profile')
        .update({
          country_health_cache: countryData,
          health_enriched_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        logger.error('USER_COUNTRY_CACHE', 'Update failed', { error: error.message, userId });
      }
    } catch (error) {
      logger.error('USER_COUNTRY_CACHE', 'Update exception', {
        error: error instanceof Error ? error.message : 'Unknown',
        userId,
      });
    }
  }

  async getUserCountryHealthData(userId: string): Promise<CountryHealthData | null> {
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('country, country_health_cache, health_enriched_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      if (data.country_health_cache && data.health_enriched_at) {
        if (this.isCacheValid(data.health_enriched_at)) {
          return data.country_health_cache as CountryHealthData;
        }
      }

      if (data.country) {
        return await this.enrichCountryData(data.country);
      }

      return null;
    } catch (error) {
      logger.error('USER_COUNTRY_DATA', 'Fetch failed', {
        error: error instanceof Error ? error.message : 'Unknown',
        userId,
      });
      return null;
    }
  }
}

export const countryHealthService = CountryHealthEnrichmentService.getInstance();
