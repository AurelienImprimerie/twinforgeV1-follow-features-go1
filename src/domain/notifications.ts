/**
 * Notification Preferences Domain Types
 * Types for notification settings, push subscriptions, and notification history
 */

// =============================================
// NOTIFICATION CATEGORIES & PRIORITIES
// =============================================

export type NotificationCategory =
  | 'training'
  | 'nutrition'
  | 'fasting'
  | 'activity'
  | 'system'
  | 'social'
  | 'achievements';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationPriorityFilter = 'all' | 'high_only' | 'critical_only';

export type NotificationDeliveryMethod = 'push' | 'in_app' | 'email';

export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'dismissed' | 'clicked';

// =============================================
// NOTIFICATION PREFERENCES
// =============================================

export interface NotificationPreference {
  id: string;
  user_id: string;
  category: NotificationCategory;

  // Delivery channel toggles
  push_enabled: boolean;
  in_app_enabled: boolean;
  email_enabled: boolean;

  // Notification experience
  sound_enabled: boolean;
  vibration_enabled: boolean;

  // Priority filtering
  priority_filter: NotificationPriorityFilter;

  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null; // HH:MM format
  quiet_hours_end: string | null; // HH:MM format

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceUpdate {
  push_enabled?: boolean;
  in_app_enabled?: boolean;
  email_enabled?: boolean;
  sound_enabled?: boolean;
  vibration_enabled?: boolean;
  priority_filter?: NotificationPriorityFilter;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
}

// =============================================
// PUSH SUBSCRIPTIONS
// =============================================

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionDeviceInfo {
  userAgent: string;
  platform: string;
  browser?: string;
  os?: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  subscription_endpoint: string;
  subscription_keys: PushSubscriptionKeys;
  device_info: PushSubscriptionDeviceInfo | null;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
  expires_at: string | null;
}

export interface PushSubscriptionPayload {
  subscription_endpoint: string;
  subscription_keys: PushSubscriptionKeys;
  device_info: PushSubscriptionDeviceInfo;
}

// =============================================
// NOTIFICATION HISTORY
// =============================================

export interface NotificationHistoryEntry {
  id: string;
  user_id: string;
  notification_id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  delivery_method: NotificationDeliveryMethod;
  status: NotificationStatus;
  sent_at: string;
  delivered_at: string | null;
  dismissed_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  retry_count: number;
}

// =============================================
// GLOBAL NOTIFICATION SETTINGS
// =============================================

export interface GlobalNotificationSettings {
  push_notifications_enabled: boolean;
  in_app_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  notification_sound_enabled: boolean;
  notification_vibration_enabled: boolean;
}

// =============================================
// NOTIFICATION UI STATE
// =============================================

export interface NotificationPreferencesState {
  // Global settings
  globalSettings: GlobalNotificationSettings;

  // Category preferences
  categoryPreferences: Record<NotificationCategory, NotificationPreference>;

  // Push subscriptions
  pushSubscriptions: PushSubscription[];

  // Notification history (last 30 days)
  recentHistory: NotificationHistoryEntry[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

// =============================================
// NOTIFICATION ANALYTICS
// =============================================

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_clicked: number;
  total_dismissed: number;
  total_failed: number;
  delivery_rate: number; // percentage
  click_rate: number; // percentage
  by_category: Record<NotificationCategory, {
    sent: number;
    delivered: number;
    clicked: number;
  }>;
  by_priority: Record<NotificationPriority, {
    sent: number;
    delivered: number;
  }>;
}

// =============================================
// WEB PUSH API TYPES
// =============================================

export interface WebPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: WebPushSubscription | null;
}

// =============================================
// HELPER TYPES
// =============================================

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface NotificationCategoryConfig {
  category: NotificationCategory;
  label: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
  canDisable: boolean; // Some categories like 'system' might be mandatory
  examples: string[];
}

// =============================================
// VALIDATION
// =============================================

export function isValidQuietHoursTime(time: string | null): boolean {
  if (!time) return true;
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

export function isValidNotificationCategory(category: string): category is NotificationCategory {
  return ['training', 'nutrition', 'fasting', 'activity', 'system', 'social', 'achievements'].includes(category);
}

export function isValidPriorityFilter(filter: string): filter is NotificationPriorityFilter {
  return ['all', 'high_only', 'critical_only'].includes(filter);
}

// =============================================
// DEFAULT VALUES
// =============================================

export const DEFAULT_GLOBAL_SETTINGS: GlobalNotificationSettings = {
  push_notifications_enabled: true,
  in_app_notifications_enabled: true,
  email_notifications_enabled: false,
  notification_sound_enabled: true,
  notification_vibration_enabled: true,
};

export const DEFAULT_CATEGORY_PREFERENCE: Omit<NotificationPreference, 'id' | 'user_id' | 'category' | 'created_at' | 'updated_at'> = {
  push_enabled: true,
  in_app_enabled: true,
  email_enabled: false,
  sound_enabled: true,
  vibration_enabled: true,
  priority_filter: 'all',
  quiet_hours_enabled: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

export const NOTIFICATION_CATEGORY_CONFIGS: NotificationCategoryConfig[] = [
  {
    category: 'training',
    label: 'Entraînement',
    description: 'Séances planifiées, rappels d\'exercices, progression',
    icon: 'Dumbbell',
    defaultEnabled: true,
    canDisable: true,
    examples: [
      'Rappel de séance planifiée dans 30 minutes',
      'Nouvelle séance recommandée disponible',
      'Objectif hebdomadaire atteint'
    ]
  },
  {
    category: 'nutrition',
    label: 'Nutrition',
    description: 'Repas, recettes, plans alimentaires',
    icon: 'UtensilsCrossed',
    defaultEnabled: true,
    canDisable: true,
    examples: [
      'Rappel de repas',
      'Nouvelle recette suggérée',
      'Objectif calorique atteint'
    ]
  },
  {
    category: 'fasting',
    label: 'Jeûne',
    description: 'Fenêtres de jeûne, rappels, progression',
    icon: 'Clock',
    defaultEnabled: true,
    canDisable: true,
    examples: [
      'Fenêtre de jeûne se termine dans 1h',
      'Nouveau record de jeûne établi',
      'Rappel d\'hydratation'
    ]
  },
  {
    category: 'activity',
    label: 'Activité',
    description: 'Activités quotidiennes, objectifs de pas',
    icon: 'Activity',
    defaultEnabled: true,
    canDisable: true,
    examples: [
      'Objectif quotidien de pas atteint',
      'Rappel de mouvement',
      'Nouvelle activité détectée'
    ]
  },
  {
    category: 'system',
    label: 'Système',
    description: 'Mises à jour, maintenance, alertes importantes',
    icon: 'Settings',
    defaultEnabled: true,
    canDisable: false, // Mandatory
    examples: [
      'Nouvelle fonctionnalité disponible',
      'Mise à jour de sécurité',
      'Maintenance planifiée'
    ]
  },
  {
    category: 'social',
    label: 'Social',
    description: 'Messages, interactions avec la communauté',
    icon: 'Users',
    defaultEnabled: true,
    canDisable: true,
    examples: [
      'Nouveau message reçu',
      'Quelqu\'un a aimé votre activité',
      'Invitation à rejoindre un défi'
    ]
  },
  {
    category: 'achievements',
    label: 'Réussites',
    description: 'Badges, jalons, accomplissements',
    icon: 'Trophy',
    defaultEnabled: true,
    canDisable: true,
    examples: [
      'Nouveau badge débloqué',
      'Jalon atteint',
      'Record personnel battu'
    ]
  }
];
