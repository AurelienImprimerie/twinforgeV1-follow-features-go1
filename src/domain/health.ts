/**
 * Domain Types for Preventive Health System
 * Comprehensive health data model for AI-powered preventive medicine
 */

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type SmokingStatus = 'never' | 'former' | 'current';

export type AlcoholFrequency = 'never' | 'occasional' | 'moderate' | 'frequent';

export type PhysicalActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

export type MenopauseStatus = 'pre' | 'peri' | 'post' | 'not_applicable';

export type PollutionLevel = 'low' | 'moderate' | 'high' | 'severe';

export type HealthDataSource = 'manual' | 'wearable' | 'medical_exam' | 'scan' | 'ai_analysis';

export interface Surgery {
  date: string;
  type: string;
  details?: string;
  complications?: string;
}

export interface Hospitalization {
  date: string;
  reason: string;
  duration_days: number;
  outcome?: string;
}

export interface FamilyHistory {
  cardiovascular?: boolean;
  diabetes?: boolean;
  cancer?: string[];
  hypertension?: boolean;
  alzheimers?: boolean;
  genetic_conditions?: string[];
}

export interface VaccinationRecord {
  name: string;
  date: string;
  next_due?: string;
  required: boolean;
  booster_required?: boolean;
  location?: string;
}

export interface Vaccinations {
  up_to_date: boolean;
  records: VaccinationRecord[];
  last_reviewed?: string;
}

export interface VitalSigns {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  resting_heart_rate?: number;
  blood_glucose_mg_dl?: number;
  body_temperature_celsius?: number;
  spo2_percent?: number;
  last_measured?: string;
}

export interface LifestyleData {
  smoking_status?: SmokingStatus;
  smoking_years?: number;
  smoking_per_day?: number;
  alcohol_frequency?: AlcoholFrequency;
  alcohol_units_per_week?: number;
  sleep_hours_avg?: number;
  sleep_quality?: number;
  stress_level?: number;
  anxiety_level?: number;
  mood_rating?: number;
  hydration_liters_per_day?: number;
  screen_time_hours_per_day?: number;
  takes_screen_breaks?: boolean;
  exercise_minutes_per_week?: number;
  diet_quality?: number;
}

export interface ReproductiveHealth {
  // Female-specific fields
  menstrual_cycle_regular?: boolean;
  cycle_length_days?: number;
  last_period_date?: string;
  menstrual_symptoms?: string[];
  pregnancy_count?: number;
  pregnancy_history?: Array<{
    year: number;
    outcome: string;
    complications?: string[];
  }>;
  menopause_status?: MenopauseStatus;
  menopause_age?: number;
  menopause_symptoms?: string[];
  contraception_type?: string;
  contraception_start_date?: string;
  contraception_side_effects?: string;

  // Male-specific fields
  male_fertility_concerns?: boolean;
  male_fertility_details?: string;
  erectile_function?: number;
  libido_level?: number;
  testosterone_concerns?: boolean;
  prostate_checkup_date?: string;

  // Common fields
  sexual_activity_frequency?: 'never' | 'rarely' | 'monthly' | 'weekly' | 'daily';
  sexual_satisfaction?: number;
  sexual_concerns?: string;
  last_sti_screening_date?: string;
  sti_screening_results?: string;
}

export interface MentalHealthData {
  conditions?: string[];
  therapy?: boolean;
  therapy_frequency?: string;
  medications?: string[];
  diagnosed_date?: Record<string, string>;
}

export interface MedicalDevices {
  implants?: string[];
  devices?: string[];
  details?: Record<string, string>;
}

export interface MedicalHistory {
  conditions: string[];
  medications: string[];
  allergies?: string[];
  surgeries?: Surgery[];
  hospitalizations?: Hospitalization[];
  chronic_diseases?: string[];
  family_history?: FamilyHistory;
}

export interface BasicHealthInfo {
  bloodType?: BloodType;
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
}

export interface HealthProfileV2 {
  version: '2.0';
  basic?: BasicHealthInfo;
  medical_history?: MedicalHistory;
  vaccinations?: Vaccinations;
  vital_signs?: VitalSigns;
  lifestyle?: LifestyleData;
  reproductive_health?: ReproductiveHealth;
  mental_health?: MentalHealthData;
  medical_devices?: MedicalDevices;
  physical_limitations?: string[];
  last_checkup_date?: string;
  next_checkup_due?: string;
  declaredNoIssues?: boolean;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  primary_care_physician?: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
}

export interface HealthProfileV1 {
  bloodType?: BloodType;
  conditions?: string[];
  medications?: string[];
  physicalLimitations?: string[];
  declaredNoIssues?: boolean;
}

export type HealthProfile = HealthProfileV1 | HealthProfileV2;

export interface ClimateData {
  avg_temperature_celsius?: number;
  avg_humidity_percent?: number;
  avg_rainfall_mm?: number;
  climate_zones?: string[];
  seasons?: Array<{
    name: string;
    months: number[];
    characteristics: string[];
  }>;
}

export interface VaccinationRequirements {
  required: string[];
  recommended: string[];
  seasonal?: Array<{
    name: string;
    period: string;
    reason: string;
  }>;
}

export interface HealthRisks {
  vector_borne_diseases?: string[];
  waterborne_diseases?: string[];
  foodborne_risks?: string[];
  environmental_hazards?: string[];
  seasonal_risks?: Record<string, string[]>;
}

export interface EpidemicAlert {
  disease: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  affected_regions?: string[];
  start_date: string;
  status: 'active' | 'contained' | 'resolved';
  recommendations?: string[];
}

export interface CountryHealthData {
  country_code: string;
  country_name: string;
  climate_data?: ClimateData;
  endemic_diseases: string[];
  epidemic_alerts?: EpidemicAlert[];
  vaccination_requirements?: VaccinationRequirements;
  health_risks?: HealthRisks;
  air_quality_index?: number;
  water_quality_score?: number;
  pollution_level?: PollutionLevel;
  common_deficiencies?: string[];
  last_updated: string;
  data_source?: string;
}

export interface UserHealthHistory {
  id: string;
  user_id: string;
  recorded_at: string;
  vital_signs?: VitalSigns;
  health_snapshot: HealthProfile;
  notes?: string;
  source?: HealthDataSource;
  created_at: string;
}

export interface HealthScoreBreakdown {
  total: number;
  basic_info: number;
  medical_history: number;
  vaccinations: number;
  vital_signs: number;
  lifestyle: number;
  max_score: number;
}

export interface PreventiveMedicineContext {
  user_profile: HealthProfileV2;
  country_data?: CountryHealthData;
  recent_history?: UserHealthHistory[];
  risk_factors?: string[];
  recommendations?: string[];
  score?: HealthScoreBreakdown;
}

export function isHealthV2(health: HealthProfile | null | undefined): health is HealthProfileV2 {
  return health !== null && health !== undefined && 'version' in health && health.version === '2.0';
}

export function migrateHealthV1ToV2(v1: HealthProfileV1): HealthProfileV2 {
  return {
    version: '2.0',
    basic: {
      bloodType: v1.bloodType,
    },
    medical_history: {
      conditions: v1.conditions || [],
      medications: v1.medications || [],
    },
    physical_limitations: v1.physicalLimitations || [],
    declaredNoIssues: v1.declaredNoIssues,
  };
}

export function getHealthVersion(health: HealthProfile | null | undefined): '1.0' | '2.0' | 'unknown' {
  if (!health) return 'unknown';
  if (isHealthV2(health)) return '2.0';
  return '1.0';
}

/**
 * Geographic and Environmental Data Types
 */

export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AirQualityData {
  aqi: number;
  level: AirQualityLevel;
  pm2_5?: number;
  pm10?: number;
  co?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  dominant_pollutant?: string;
  health_recommendations?: string[];
  last_updated: string;
}

export interface WeatherData {
  temperature_celsius: number;
  feels_like_celsius?: number;
  humidity_percent: number;
  pressure_hpa?: number;
  wind_speed_ms?: number;
  wind_direction?: number;
  precipitation_mm?: number;
  uv_index?: number;
  visibility_km?: number;
  cloud_cover_percent?: number;
  weather_condition: string;
  weather_description?: string;
  last_updated: string;
}

export interface HydrationRecommendation {
  base_amount_liters: number;
  weather_adjustment_liters: number;
  activity_adjustment_liters: number;
  total_recommended_liters: number;
  factors: {
    temperature: number;
    humidity: number;
    physical_activity_level: string;
    user_weight_kg?: number;
  };
  recommendations: string[];
  alerts?: string[];
}

export interface EnvironmentalExposure {
  air_quality: AirQualityData;
  pollution_sources?: string[];
  environmental_hazards?: string[];
  exposure_level: 'low' | 'moderate' | 'high' | 'severe';
  protective_measures?: string[];
  time_outdoors_recommended?: {
    safe_hours: string[];
    avoid_hours: string[];
  };
}

export interface GeographicData {
  user_id: string;
  country_code: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  weather: WeatherData;
  air_quality: AirQualityData;
  environmental_exposure: EnvironmentalExposure;
  hydration_recommendation: HydrationRecommendation;
  last_updated: string;
  next_update_due: string;
}

export interface GeographicDataCache {
  id: string;
  user_id: string;
  country_code: string;
  city?: string;
  location_key: string;
  weather_data: WeatherData;
  air_quality_data: AirQualityData;
  environmental_data: EnvironmentalExposure;
  hydration_data: HydrationRecommendation;
  created_at: string;
  expires_at: string;
}
