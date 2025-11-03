/**
 * Connected Devices Domain Types
 * Type definitions for wearable device integrations
 */

export type Provider =
  | 'strava'
  | 'garmin'
  | 'fitbit'
  | 'apple_health'
  | 'polar'
  | 'wahoo'
  | 'whoop'
  | 'oura'
  | 'suunto'
  | 'coros'
  | 'google_fit';

// MVP Providers - Essential devices for initial launch
export type MVPProvider = 'apple_health' | 'google_fit' | 'strava';

export const MVP_PROVIDERS: MVPProvider[] = ['apple_health', 'google_fit', 'strava'];

export type DeviceType =
  | 'smartwatch'
  | 'fitness_tracker'
  | 'bike_computer'
  | 'heart_rate_monitor'
  | 'running_watch'
  | 'other';

export type DeviceStatus =
  | 'connected'
  | 'syncing'
  | 'error'
  | 'disconnected'
  | 'pending_auth'
  | 'token_expired';

export type SyncType = 'manual' | 'automatic' | 'scheduled' | 'webhook';
export type SyncStatus = 'success' | 'partial' | 'failed' | 'cancelled';

export type HealthDataType =
  | 'heart_rate'
  | 'steps'
  | 'calories'
  | 'distance'
  | 'sleep'
  | 'workout'
  | 'weight'
  | 'blood_pressure'
  | 'spo2'
  | 'hrv'
  | 'resting_heart_rate'
  | 'active_minutes'
  | 'elevation'
  | 'cadence'
  | 'power'
  | 'pace'
  | 'vo2max'
  | 'stress_level'
  | 'body_battery'
  | 'temperature'
  | 'hydration'
  | 'nutrition';

export interface ConnectedDevice {
  id: string;
  userId: string;
  provider: Provider;
  providerUserId: string;
  displayName?: string;
  deviceType?: DeviceType;
  status: DeviceStatus;
  scopes: string[];
  lastSyncAt?: string;
  lastError?: string;
  errorCount: number;
  metadata: Record<string, any>;
  connectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceSyncHistory {
  id: string;
  deviceId: string;
  userId: string;
  syncType: SyncType;
  status: SyncStatus;
  dataTypesSynced: string[];
  recordsFetched: number;
  recordsStored: number;
  durationMs?: number;
  errorMessage?: string;
  errorCode?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface WearableHealthData {
  id: string;
  userId: string;
  deviceId: string;
  dataType: HealthDataType;
  timestamp: string;
  valueNumeric?: number;
  valueText?: string;
  valueJson?: Record<string, any>;
  unit?: string;
  qualityScore?: number;
  sourceWorkoutId?: string;
  rawData?: Record<string, any>;
  syncedAt: string;
  createdAt: string;
}

export interface SyncPreferences {
  id: string;
  userId: string;
  deviceId: string;
  autoSyncEnabled: boolean;
  syncFrequencyMinutes: 15 | 30 | 60 | 120 | 240 | 480 | 1440;
  dataTypesEnabled: HealthDataType[];
  syncOnlyWifi: boolean;
  notifyOnSync: boolean;
  notifyOnError: boolean;
  backfillDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceAuthFlow {
  id: string;
  userId: string;
  provider: Provider;
  state: string;
  codeVerifier?: string;
  redirectUri: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface ProviderConfig {
  id: Provider;
  name: string;
  description: string;
  icon: string;
  color: string;
  authUrl: string;
  scopes: string[];
  dataTypes: HealthDataType[];
  supportsWebhooks: boolean;
  requiresApp: boolean;
  platform?: 'ios' | 'android' | 'web' | 'all';
}

export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  strava: {
    id: 'strava',
    name: 'Strava',
    description: 'Course, vélo, natation et autres activités',
    icon: 'Activity',
    color: '#FC4C02',
    authUrl: 'https://www.strava.com/oauth/authorize',
    scopes: ['read', 'activity:read_all', 'activity:read'],
    dataTypes: ['workout', 'distance', 'heart_rate', 'calories', 'elevation', 'pace', 'cadence'],
    supportsWebhooks: true,
    requiresApp: false,
    platform: 'all',
  },
  garmin: {
    id: 'garmin',
    name: 'Garmin Connect',
    description: 'Montres Garmin et données fitness complètes',
    icon: 'Watch',
    color: '#007CC3',
    authUrl: 'https://connect.garmin.com/oauth/authorize',
    scopes: ['activities', 'wellness', 'sleep'],
    dataTypes: [
      'heart_rate',
      'steps',
      'calories',
      'distance',
      'sleep',
      'workout',
      'hrv',
      'stress_level',
      'body_battery',
      'vo2max',
    ],
    supportsWebhooks: true,
    requiresApp: false,
    platform: 'all',
  },
  fitbit: {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Trackers Fitbit et montres Versa/Sense',
    icon: 'Activity',
    color: '#00B0B9',
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    scopes: ['activity', 'heartrate', 'sleep', 'weight', 'nutrition'],
    dataTypes: [
      'heart_rate',
      'resting_heart_rate',
      'steps',
      'calories',
      'distance',
      'sleep',
      'weight',
      'active_minutes',
      'spo2',
    ],
    supportsWebhooks: true,
    requiresApp: false,
    platform: 'all',
  },
  apple_health: {
    id: 'apple_health',
    name: 'Apple Health',
    description: 'Apple Watch et iPhone Health',
    icon: 'Heart',
    color: '#FF3B30',
    authUrl: '',
    scopes: ['health_read'],
    dataTypes: [
      'heart_rate',
      'steps',
      'calories',
      'distance',
      'sleep',
      'workout',
      'weight',
      'blood_pressure',
      'spo2',
      'hrv',
      'vo2max',
    ],
    supportsWebhooks: false,
    requiresApp: true,
    platform: 'ios',
  },
  polar: {
    id: 'polar',
    name: 'Polar Flow',
    description: 'Montres Polar et capteurs',
    icon: 'Heart',
    color: '#E30613',
    authUrl: 'https://flow.polar.com/oauth2/authorization',
    scopes: ['accesslink.read_all'],
    dataTypes: ['heart_rate', 'workout', 'calories', 'distance', 'sleep', 'hrv'],
    supportsWebhooks: true,
    requiresApp: false,
    platform: 'all',
  },
  wahoo: {
    id: 'wahoo',
    name: 'Wahoo',
    description: 'Capteurs Wahoo et compteurs vélo',
    icon: 'Bike',
    color: '#2E3192',
    authUrl: 'https://api.wahooligan.com/oauth/authorize',
    scopes: ['workouts_read', 'power_read'],
    dataTypes: ['workout', 'heart_rate', 'power', 'cadence', 'distance', 'calories'],
    supportsWebhooks: false,
    requiresApp: false,
    platform: 'all',
  },
  whoop: {
    id: 'whoop',
    name: 'WHOOP',
    description: 'Bracelet WHOOP et métriques de récupération',
    icon: 'Activity',
    color: '#000000',
    authUrl: 'https://api.prod.whoop.com/oauth/authorize',
    scopes: ['read:recovery', 'read:workout', 'read:sleep'],
    dataTypes: ['heart_rate', 'hrv', 'sleep', 'workout', 'stress_level', 'calories'],
    supportsWebhooks: false,
    requiresApp: false,
    platform: 'all',
  },
  oura: {
    id: 'oura',
    name: 'Oura Ring',
    description: 'Bague Oura et données de sommeil',
    icon: 'Moon',
    color: '#5E17EB',
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    scopes: ['daily', 'personal', 'session'],
    dataTypes: ['heart_rate', 'hrv', 'sleep', 'temperature', 'steps', 'calories'],
    supportsWebhooks: false,
    requiresApp: false,
    platform: 'all',
  },
  suunto: {
    id: 'suunto',
    name: 'Suunto',
    description: 'Montres Suunto pour sports outdoor',
    icon: 'Watch',
    color: '#FF3B3F',
    authUrl: 'https://cloudapi.suunto.com/oauth/authorize',
    scopes: ['workout'],
    dataTypes: ['workout', 'heart_rate', 'distance', 'elevation', 'calories'],
    supportsWebhooks: false,
    requiresApp: false,
    platform: 'all',
  },
  coros: {
    id: 'coros',
    name: 'COROS',
    description: 'Montres COROS pour endurance',
    icon: 'Watch',
    color: '#FF6B00',
    authUrl: 'https://open.coros.com/oauth2/authorize',
    scopes: ['workouts:read'],
    dataTypes: ['workout', 'heart_rate', 'distance', 'elevation', 'pace', 'calories'],
    supportsWebhooks: false,
    requiresApp: false,
    platform: 'all',
  },
  google_fit: {
    id: 'google_fit',
    name: 'Google Fit',
    description: 'Google Fit et Android Health',
    icon: 'Activity',
    color: '#4285F4',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
    ],
    dataTypes: ['heart_rate', 'steps', 'calories', 'distance', 'workout', 'weight'],
    supportsWebhooks: false,
    requiresApp: true,
    platform: 'android',
  },
};

export interface NormalizedWorkout {
  id: string;
  userId: string;
  deviceId: string;
  provider: Provider;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  activityType: string;
  distanceMeters?: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevationGainMeters?: number;
  avgPace?: string;
  avgCadence?: number;
  avgPower?: number;
  zones?: {
    zone1Minutes: number;
    zone2Minutes: number;
    zone3Minutes: number;
    zone4Minutes: number;
    zone5Minutes: number;
  };
  rawData: Record<string, any>;
}
