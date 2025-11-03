/**
 * Privacy & RGPD Compliance Domain Types
 * Types for data export, account deletion, consents, and privacy settings
 */

// =============================================
// DATA EXPORT
// =============================================

export type DataExportRequestType = 'full_export' | 'partial_export';

export type DataExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type DataExportFormat = 'json' | 'csv';

export type ExportableDataCategory =
  | 'profile'
  | 'training'
  | 'nutrition'
  | 'fasting'
  | 'body_scans'
  | 'activities'
  | 'health'
  | 'preferences'
  | 'notifications';

export interface DataExportRequest {
  id: string;
  user_id: string;
  request_type: DataExportRequestType;
  status: DataExportStatus;
  export_format: DataExportFormat;
  included_data: ExportableDataCategory[];
  file_url: string | null;
  file_size_bytes: number | null;
  expires_at: string | null;
  requested_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface DataExportRequestPayload {
  request_type: DataExportRequestType;
  export_format: DataExportFormat;
  included_data: ExportableDataCategory[];
}

// =============================================
// ACCOUNT DELETION
// =============================================

export type AccountDeletionStatus =
  | 'pending'
  | 'scheduled'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface AccountDeletionRequest {
  id: string;
  user_id: string;
  status: AccountDeletionStatus;
  deletion_scheduled_at: string;
  delete_all_data: boolean;
  anonymize_only: boolean;
  reason: string | null;
  requested_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
}

export interface AccountDeletionRequestPayload {
  delete_all_data: boolean;
  anonymize_only: boolean;
  reason?: string;
}

export interface AccountDeletionCancellation {
  reason?: string;
}

// =============================================
// DATA PRIVACY CONSENTS
// =============================================

export type ConsentType =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'marketing'
  | 'analytics';

export interface DataPrivacyConsent {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  consent_given: boolean;
  consent_version: string;
  consented_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface ConsentUpdate {
  consent_type: ConsentType;
  consent_given: boolean;
  consent_version: string;
}

// =============================================
// DATA ACCESS LOG
// =============================================

export type DataAccessType =
  | 'export'
  | 'deletion'
  | 'anonymization'
  | 'consent_update'
  | 'preference_update';

export type DataAccessActor = 'user' | 'system' | 'admin';

export interface DataAccessLogEntry {
  id: string;
  user_id: string;
  access_type: DataAccessType;
  action_details: Record<string, any>;
  performed_by: DataAccessActor;
  ip_address: string | null;
  accessed_at: string;
}

// =============================================
// PRIVACY PREFERENCES
// =============================================

export type DataRetentionPreference = 'minimal' | 'standard' | 'extended';

export interface PrivacyPreferences {
  data_retention_preference: DataRetentionPreference;
  analytics_tracking_enabled: boolean;
  marketing_communications_enabled: boolean;
}

// =============================================
// PRIVACY DASHBOARD
// =============================================

export interface PrivacyDashboard {
  active_deletion_request: AccountDeletionRequest | null;
  recent_exports: DataExportRequest[];
  consents: Record<ConsentType, {
    given: boolean;
    version: string;
    date: string;
  }>;
  recent_access_log: DataAccessLogEntry[];
}

// =============================================
// PRIVACY UI STATE
// =============================================

export interface PrivacyState {
  // Privacy preferences
  preferences: PrivacyPreferences;

  // Active requests
  activeDeletionRequest: AccountDeletionRequest | null;
  recentExportRequests: DataExportRequest[];

  // Consents
  consents: Map<ConsentType, DataPrivacyConsent>;

  // Access log
  recentAccessLog: DataAccessLogEntry[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

// =============================================
// EXPORT/DOWNLOAD STATE
// =============================================

export interface ExportProgress {
  requestId: string;
  status: DataExportStatus;
  progress: number; // 0-100
  estimatedTimeRemaining: number | null; // seconds
  currentStep: string;
}

// =============================================
// DATA CATEGORIES INFO
// =============================================

export interface DataCategoryInfo {
  category: ExportableDataCategory;
  label: string;
  description: string;
  icon: string;
  estimatedSize: string; // e.g., "~2 MB"
  includeByDefault: boolean;
  examples: string[];
}

// =============================================
// RGPD COMPLIANCE
// =============================================

export interface RGPDCompliance {
  rightToAccess: boolean; // User can view their data
  rightToRectification: boolean; // User can correct their data
  rightToErasure: boolean; // User can delete their data
  rightToRestriction: boolean; // User can limit processing
  rightToDataPortability: boolean; // User can export their data
  rightToObject: boolean; // User can object to processing
  automatedDecisionMaking: boolean; // Are there automated decisions?
}

export interface DataProcessingPurpose {
  purpose: string;
  description: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest';
  dataCategories: ExportableDataCategory[];
  retentionPeriod: string;
  canOptOut: boolean;
}

// =============================================
// RETENTION POLICY
// =============================================

export interface RetentionPolicy {
  dataCategory: ExportableDataCategory;
  minimal: string; // e.g., "30 days"
  standard: string; // e.g., "2 years"
  extended: string; // e.g., "indefinite"
  description: string;
}

// =============================================
// VALIDATION
// =============================================

export function isValidDataRetentionPreference(value: string): value is DataRetentionPreference {
  return ['minimal', 'standard', 'extended'].includes(value);
}

export function isValidConsentType(value: string): value is ConsentType {
  return ['terms_of_service', 'privacy_policy', 'marketing', 'analytics'].includes(value);
}

export function isValidExportableDataCategory(value: string): value is ExportableDataCategory {
  return ['profile', 'training', 'nutrition', 'fasting', 'body_scans', 'activities', 'health', 'preferences', 'notifications'].includes(value);
}

// =============================================
// HELPERS
// =============================================

export function getDaysUntilDeletion(scheduledAt: string): number {
  const scheduled = new Date(scheduledAt);
  const now = new Date();
  const diff = scheduled.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function canCancelDeletion(request: AccountDeletionRequest): boolean {
  return request.status === 'pending' || request.status === 'scheduled';
}

export function isExportExpired(request: DataExportRequest): boolean {
  if (!request.expires_at) return false;
  return new Date(request.expires_at) < new Date();
}

export function getExportSizeFormatted(bytes: number | null): string {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// =============================================
// DEFAULT VALUES
// =============================================

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  data_retention_preference: 'standard',
  analytics_tracking_enabled: true,
  marketing_communications_enabled: false,
};

export const ALL_EXPORTABLE_CATEGORIES: ExportableDataCategory[] = [
  'profile',
  'training',
  'nutrition',
  'fasting',
  'body_scans',
  'activities',
  'health',
  'preferences',
  'notifications',
];

export const DATA_CATEGORY_CONFIGS: DataCategoryInfo[] = [
  {
    category: 'profile',
    label: 'Profil',
    description: 'Informations personnelles, photo, préférences de base',
    icon: 'User',
    estimatedSize: '~100 KB',
    includeByDefault: true,
    examples: ['Nom, email, date de naissance', 'Photo de profil', 'Paramètres de compte']
  },
  {
    category: 'training',
    label: 'Entraînement',
    description: 'Séances, exercices, progression',
    icon: 'Dumbbell',
    estimatedSize: '~5 MB',
    includeByDefault: true,
    examples: ['Historique des séances', 'Exercices personnalisés', 'Objectifs et progression']
  },
  {
    category: 'nutrition',
    label: 'Nutrition',
    description: 'Repas, recettes, plans alimentaires',
    icon: 'UtensilsCrossed',
    estimatedSize: '~3 MB',
    includeByDefault: true,
    examples: ['Journal alimentaire', 'Recettes favorites', 'Plans de repas']
  },
  {
    category: 'fasting',
    label: 'Jeûne',
    description: 'Sessions de jeûne, progression',
    icon: 'Clock',
    estimatedSize: '~500 KB',
    includeByDefault: true,
    examples: ['Historique de jeûne', 'Statistiques', 'Protocoles utilisés']
  },
  {
    category: 'body_scans',
    label: 'Scans corporels',
    description: 'Photos, mesures, morphologie',
    icon: 'Scan',
    estimatedSize: '~20 MB',
    includeByDefault: true,
    examples: ['Photos de scan', 'Mesures corporelles', 'Évolution morphologique']
  },
  {
    category: 'activities',
    label: 'Activités',
    description: 'Activités quotidiennes, GPS, calories',
    icon: 'Activity',
    estimatedSize: '~2 MB',
    includeByDefault: true,
    examples: ['Historique d\'activités', 'Données GPS', 'Calories brûlées']
  },
  {
    category: 'health',
    label: 'Santé',
    description: 'Données de santé, métriques biométriques',
    icon: 'Heart',
    estimatedSize: '~1 MB',
    includeByDefault: true,
    examples: ['Fréquence cardiaque', 'Poids', 'Mesures biométriques']
  },
  {
    category: 'preferences',
    label: 'Préférences',
    description: 'Paramètres, notifications, thème',
    icon: 'Settings',
    estimatedSize: '~50 KB',
    includeByDefault: true,
    examples: ['Paramètres d\'affichage', 'Préférences de notifications', 'Mode de performance']
  },
  {
    category: 'notifications',
    label: 'Notifications',
    description: 'Historique des notifications',
    icon: 'Bell',
    estimatedSize: '~500 KB',
    includeByDefault: false,
    examples: ['Notifications reçues', 'Préférences de notifications']
  }
];

export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    dataCategory: 'profile',
    minimal: '30 jours après suppression',
    standard: 'Conservation indéfinie',
    extended: 'Conservation indéfinie',
    description: 'Données nécessaires au fonctionnement du compte'
  },
  {
    dataCategory: 'training',
    minimal: '30 jours',
    standard: '2 ans',
    extended: 'Conservation indéfinie',
    description: 'Historique d\'entraînement et progression'
  },
  {
    dataCategory: 'nutrition',
    minimal: '30 jours',
    standard: '1 an',
    extended: 'Conservation indéfinie',
    description: 'Journal alimentaire et plans de repas'
  },
  {
    dataCategory: 'fasting',
    minimal: '30 jours',
    standard: '1 an',
    extended: 'Conservation indéfinie',
    description: 'Historique de jeûne'
  },
  {
    dataCategory: 'body_scans',
    minimal: '90 jours',
    standard: '2 ans',
    extended: 'Conservation indéfinie',
    description: 'Photos et mesures corporelles'
  },
  {
    dataCategory: 'activities',
    minimal: '30 jours',
    standard: '1 an',
    extended: 'Conservation indéfinie',
    description: 'Activités quotidiennes'
  },
  {
    dataCategory: 'health',
    minimal: '90 jours',
    standard: '5 ans',
    extended: 'Conservation indéfinie',
    description: 'Données de santé sensibles'
  },
  {
    dataCategory: 'preferences',
    minimal: '7 jours après suppression',
    standard: 'Conservation indéfinie',
    extended: 'Conservation indéfinie',
    description: 'Paramètres et préférences'
  },
  {
    dataCategory: 'notifications',
    minimal: '7 jours',
    standard: '90 jours',
    extended: '1 an',
    description: 'Historique des notifications'
  }
];

export const DATA_PROCESSING_PURPOSES: DataProcessingPurpose[] = [
  {
    purpose: 'Fourniture du service',
    description: 'Permettre l\'utilisation des fonctionnalités de l\'application',
    legalBasis: 'contract',
    dataCategories: ['profile', 'training', 'nutrition', 'fasting', 'body_scans', 'activities', 'health'],
    retentionPeriod: 'Durée de vie du compte',
    canOptOut: false
  },
  {
    purpose: 'Amélioration du service',
    description: 'Analyser l\'utilisation pour améliorer l\'expérience',
    legalBasis: 'legitimate_interest',
    dataCategories: ['activities', 'preferences'],
    retentionPeriod: '1 an',
    canOptOut: true
  },
  {
    purpose: 'Communications marketing',
    description: 'Envoyer des actualités et offres promotionnelles',
    legalBasis: 'consent',
    dataCategories: ['profile'],
    retentionPeriod: 'Jusqu\'au retrait du consentement',
    canOptOut: true
  },
  {
    purpose: 'Analyses statistiques',
    description: 'Créer des statistiques anonymisées',
    legalBasis: 'legitimate_interest',
    dataCategories: ['training', 'nutrition', 'activities'],
    retentionPeriod: 'Données anonymisées conservées indéfiniment',
    canOptOut: true
  }
];

export const RGPD_COMPLIANCE: RGPDCompliance = {
  rightToAccess: true, // Users can view and export their data
  rightToRectification: true, // Users can edit their profile and data
  rightToErasure: true, // Users can request account deletion
  rightToRestriction: true, // Users can limit data processing via preferences
  rightToDataPortability: true, // Users can export data in JSON/CSV
  rightToObject: true, // Users can disable analytics and marketing
  automatedDecisionMaking: true, // AI recommendations for training/nutrition
};

// Current version of privacy policy and terms
export const CURRENT_PRIVACY_VERSION = '1.0.0';
export const CURRENT_TERMS_VERSION = '1.0.0';

// Deletion grace period in days
export const DELETION_GRACE_PERIOD_DAYS = 30;

// Export download expiration in days
export const EXPORT_EXPIRATION_DAYS = 7;
