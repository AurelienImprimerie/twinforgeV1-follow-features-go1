import { create } from 'zustand';
import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type {
  NotificationCategory,
  NotificationPreference,
  NotificationPreferenceUpdate,
  PushSubscription,
  PushSubscriptionPayload,
  GlobalNotificationSettings,
  NotificationHistoryEntry,
  NotificationStats,
} from '../../domain/notifications';
import {
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_CATEGORY_PREFERENCE,
} from '../../domain/notifications';

interface NotificationPreferencesState {
  // Global settings
  globalSettings: GlobalNotificationSettings;

  // Category preferences (keyed by category)
  categoryPreferences: Map<NotificationCategory, NotificationPreference>;

  // Push subscriptions
  pushSubscriptions: PushSubscription[];
  activePushSubscription: PushSubscription | null;

  // Notification history and stats
  recentHistory: NotificationHistoryEntry[];
  stats: NotificationStats | null;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncedAt: string | null;

  // Actions - Global Settings
  loadGlobalSettings: (userId?: string) => Promise<void>;
  updateGlobalSetting: (
    key: keyof GlobalNotificationSettings,
    value: boolean,
    userId?: string
  ) => Promise<void>;
  toggleGlobalNotifications: (enabled: boolean, userId?: string) => Promise<void>;

  // Actions - Category Preferences
  loadCategoryPreferences: (userId?: string) => Promise<void>;
  updateCategoryPreference: (
    category: NotificationCategory,
    updates: NotificationPreferenceUpdate,
    userId?: string
  ) => Promise<void>;
  resetCategoryToDefaults: (category: NotificationCategory, userId?: string) => Promise<void>;

  // Actions - Push Subscriptions
  loadPushSubscriptions: (userId?: string) => Promise<void>;
  subscribeToPush: (subscription: PushSubscriptionPayload, userId?: string) => Promise<void>;
  unsubscribeFromPush: (subscriptionId: string, userId?: string) => Promise<void>;
  checkPushPermission: () => Promise<NotificationPermission>;
  requestPushPermission: () => Promise<boolean>;

  // Actions - History & Stats
  loadNotificationHistory: (userId?: string, days?: number) => Promise<void>;
  loadNotificationStats: (userId?: string, days?: number) => Promise<void>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

const STORAGE_KEY_PREFIX = 'twinforge-notification-prefs';

export const useNotificationPreferencesStore = create<NotificationPreferencesState>((set, get) => ({
  // Initial state
  globalSettings: { ...DEFAULT_GLOBAL_SETTINGS },
  categoryPreferences: new Map(),
  pushSubscriptions: [],
  activePushSubscription: null,
  recentHistory: [],
  stats: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSyncedAt: null,

  // =============================================
  // GLOBAL SETTINGS ACTIONS
  // =============================================

  loadGlobalSettings: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      // Try localStorage first
      const localKey = `${STORAGE_KEY_PREFIX}-global`;
      const localValue = localStorage.getItem(localKey);

      if (localValue) {
        const parsed = JSON.parse(localValue);
        set({ globalSettings: parsed });
      }

      // If user is logged in, sync with Supabase
      if (userId) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select(
            'push_notifications_enabled, in_app_notifications_enabled, email_notifications_enabled, notification_sound_enabled, notification_vibration_enabled'
          )
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          logger.error('NOTIFICATION_PREFS', 'Failed to load global settings from Supabase', {
            error,
          });
          // Continue with local cache - don't throw
        } else if (data) {
          const settings: GlobalNotificationSettings = {
            push_notifications_enabled: data.push_notifications_enabled ?? true,
            in_app_notifications_enabled: data.in_app_notifications_enabled ?? true,
            email_notifications_enabled: data.email_notifications_enabled ?? false,
            notification_sound_enabled: data.notification_sound_enabled ?? true,
            notification_vibration_enabled: data.notification_vibration_enabled ?? true,
          };

          set({ globalSettings: settings, lastSyncedAt: new Date().toISOString() });
          localStorage.setItem(localKey, JSON.stringify(settings));
          logger.info('NOTIFICATION_PREFS', 'Loaded global settings from Supabase');
        }
      }

      set({ isLoading: false });
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error loading global settings', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement des paramètres' });
    }
  },

  updateGlobalSetting: async (key, value, userId?) => {
    try {
      set({ isSaving: true, error: null });

      const currentSettings = get().globalSettings;
      const updatedSettings = { ...currentSettings, [key]: value };

      // Update local state immediately
      set({ globalSettings: updatedSettings });

      // Save to localStorage
      const localKey = `${STORAGE_KEY_PREFIX}-global`;
      localStorage.setItem(localKey, JSON.stringify(updatedSettings));

      // If user is logged in, sync to Supabase
      if (userId) {
        // Use update instead of upsert to avoid constraint issues with other fields
        const { error } = await supabase
          .from('user_preferences')
          .update({
            [key]: value,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          logger.error('NOTIFICATION_PREFS', 'Failed to update global setting in Supabase', {
            error,
          });
          // Don't throw - continue with local state
          set({ isSaving: false, error: 'Erreur lors de la sauvegarde' });
          return;
        }

        logger.info('NOTIFICATION_PREFS', 'Updated global setting', { key, value });
        set({ lastSyncedAt: new Date().toISOString() });
      }

      set({ isSaving: false });
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error updating global setting', { error });
      set({ isSaving: false, error: 'Erreur lors de la sauvegarde' });
    }
  },

  toggleGlobalNotifications: async (enabled, userId?) => {
    const { updateGlobalSetting } = get();
    await updateGlobalSetting('push_notifications_enabled', enabled, userId);
    await updateGlobalSetting('in_app_notifications_enabled', enabled, userId);
  },

  // =============================================
  // CATEGORY PREFERENCES ACTIONS
  // =============================================

  loadCategoryPreferences: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        // Load from localStorage or use defaults
        const localKey = `${STORAGE_KEY_PREFIX}-categories`;
        const localValue = localStorage.getItem(localKey);

        if (localValue) {
          const parsed = JSON.parse(localValue);
          const prefsMap = new Map(Object.entries(parsed));
          set({ categoryPreferences: prefsMap as Map<NotificationCategory, NotificationPreference> });
        }

        set({ isLoading: false });
        return;
      }

      // Load from Supabase
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        logger.error('NOTIFICATION_PREFS', 'Failed to load category preferences', { error });
        // Continue with empty map - don't throw
        set({ isLoading: false });
        return;
      }

      const prefsMap = new Map<NotificationCategory, NotificationPreference>();

      if (data && data.length > 0) {
        data.forEach((pref) => {
          prefsMap.set(pref.category as NotificationCategory, pref as NotificationPreference);
        });
      }

      set({
        categoryPreferences: prefsMap,
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      // Save to localStorage
      const localKey = `${STORAGE_KEY_PREFIX}-categories`;
      localStorage.setItem(localKey, JSON.stringify(Object.fromEntries(prefsMap)));

      logger.info('NOTIFICATION_PREFS', 'Loaded category preferences', {
        count: prefsMap.size,
      });
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error loading category preferences', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement des préférences' });
    }
  },

  updateCategoryPreference: async (category, updates, userId?) => {
    try {
      set({ isSaving: true, error: null });

      const currentPrefs = get().categoryPreferences;
      const existingPref = currentPrefs.get(category);

      if (!userId) {
        // Local only update
        if (existingPref) {
          const updatedPref = { ...existingPref, ...updates };
          const newPrefs = new Map(currentPrefs);
          newPrefs.set(category, updatedPref);
          set({ categoryPreferences: newPrefs });

          const localKey = `${STORAGE_KEY_PREFIX}-categories`;
          localStorage.setItem(localKey, JSON.stringify(Object.fromEntries(newPrefs)));
        }

        set({ isSaving: false });
        return;
      }

      // Update in Supabase
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: userId,
            category,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,category' }
        )
        .select()
        .single();

      if (error) {
        logger.error('NOTIFICATION_PREFS', 'Failed to update category preference', { error });
        throw error;
      }

      // Update local state
      const newPrefs = new Map(currentPrefs);
      newPrefs.set(category, data as NotificationPreference);
      set({
        categoryPreferences: newPrefs,
        lastSyncedAt: new Date().toISOString(),
        isSaving: false,
      });

      // Save to localStorage
      const localKey = `${STORAGE_KEY_PREFIX}-categories`;
      localStorage.setItem(localKey, JSON.stringify(Object.fromEntries(newPrefs)));

      logger.info('NOTIFICATION_PREFS', 'Updated category preference', { category, updates });
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error updating category preference', { error });
      set({ isSaving: false, error: 'Erreur lors de la sauvegarde' });
    }
  },

  resetCategoryToDefaults: async (category, userId?) => {
    const { updateCategoryPreference } = get();
    await updateCategoryPreference(category, { ...DEFAULT_CATEGORY_PREFERENCE }, userId);
  },

  // =============================================
  // PUSH SUBSCRIPTIONS ACTIONS
  // =============================================

  loadPushSubscriptions: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('NOTIFICATION_PREFS', 'Failed to load push subscriptions', { error });
        // Continue with empty array - don't throw
        set({ pushSubscriptions: [], activePushSubscription: null, isLoading: false });
        return;
      }

      const subscriptions = (data || []) as PushSubscription[];
      const active = subscriptions.length > 0 ? subscriptions[0] : null;

      set({
        pushSubscriptions: subscriptions,
        activePushSubscription: active,
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      logger.info('NOTIFICATION_PREFS', 'Loaded push subscriptions', {
        count: subscriptions.length,
      });
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error loading push subscriptions', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement des abonnements' });
    }
  },

  subscribeToPush: async (subscription, userId?) => {
    try {
      set({ isSaving: true, error: null });

      if (!userId) {
        throw new Error('User ID required to subscribe to push notifications');
      }

      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          subscription_endpoint: subscription.subscription_endpoint,
          subscription_keys: subscription.subscription_keys,
          device_info: subscription.device_info,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        logger.error('NOTIFICATION_PREFS', 'Failed to subscribe to push', { error });
        throw error;
      }

      // Update local state
      const newSubscription = data as PushSubscription;
      const currentSubs = get().pushSubscriptions;

      set({
        pushSubscriptions: [newSubscription, ...currentSubs],
        activePushSubscription: newSubscription,
        lastSyncedAt: new Date().toISOString(),
        isSaving: false,
      });

      logger.info('NOTIFICATION_PREFS', 'Subscribed to push notifications');
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error subscribing to push', { error });
      set({ isSaving: false, error: 'Erreur lors de l\'abonnement aux notifications' });
    }
  },

  unsubscribeFromPush: async (subscriptionId, userId?) => {
    try {
      set({ isSaving: true, error: null });

      if (!userId) {
        throw new Error('User ID required to unsubscribe from push notifications');
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId)
        .eq('user_id', userId);

      if (error) {
        logger.error('NOTIFICATION_PREFS', 'Failed to unsubscribe from push', { error });
        throw error;
      }

      // Update local state
      const currentSubs = get().pushSubscriptions;
      const updatedSubs = currentSubs.filter((sub) => sub.id !== subscriptionId);
      const newActive = updatedSubs.length > 0 ? updatedSubs[0] : null;

      set({
        pushSubscriptions: updatedSubs,
        activePushSubscription: newActive,
        lastSyncedAt: new Date().toISOString(),
        isSaving: false,
      });

      logger.info('NOTIFICATION_PREFS', 'Unsubscribed from push notifications');
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error unsubscribing from push', { error });
      set({ isSaving: false, error: 'Erreur lors de la désinscription' });
    }
  },

  checkPushPermission: async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  },

  requestPushPermission: async () => {
    try {
      if (!('Notification' in window)) {
        logger.warn('NOTIFICATION_PREFS', 'Push notifications not supported');
        return false;
      }

      const permission = await Notification.requestPermission();
      logger.info('NOTIFICATION_PREFS', 'Push permission requested', { permission });
      return permission === 'granted';
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error requesting push permission', { error });
      return false;
    }
  },

  // =============================================
  // HISTORY & STATS ACTIONS
  // =============================================

  loadNotificationHistory: async (userId?, days = 30) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', userId)
        .gte('sent_at', cutoffDate.toISOString())
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) {
        logger.error('NOTIFICATION_PREFS', 'Failed to load notification history', { error });
        throw error;
      }

      set({
        recentHistory: (data || []) as NotificationHistoryEntry[],
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      logger.info('NOTIFICATION_PREFS', 'Loaded notification history', {
        count: data?.length || 0,
      });
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error loading notification history', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement de l\'historique' });
    }
  },

  loadNotificationStats: async (userId?, days = 30) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return;
      }

      // For now, calculate stats from history
      // In production, this should be a dedicated edge function or database view
      const history = get().recentHistory;

      if (history.length === 0) {
        await get().loadNotificationHistory(userId, days);
      }

      const updatedHistory = get().recentHistory;

      const stats: NotificationStats = {
        total_sent: updatedHistory.length,
        total_delivered: updatedHistory.filter((h) => h.status === 'delivered').length,
        total_clicked: updatedHistory.filter((h) => h.status === 'clicked').length,
        total_dismissed: updatedHistory.filter((h) => h.status === 'dismissed').length,
        total_failed: updatedHistory.filter((h) => h.status === 'failed').length,
        delivery_rate: 0,
        click_rate: 0,
        by_category: {} as any,
        by_priority: {} as any,
      };

      stats.delivery_rate =
        stats.total_sent > 0 ? (stats.total_delivered / stats.total_sent) * 100 : 0;
      stats.click_rate =
        stats.total_delivered > 0 ? (stats.total_clicked / stats.total_delivered) * 100 : 0;

      set({ stats, isLoading: false });

      logger.info('NOTIFICATION_PREFS', 'Calculated notification stats', { stats });
    } catch (error) {
      logger.error('NOTIFICATION_PREFS', 'Error loading notification stats', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement des statistiques' });
    }
  },

  // =============================================
  // UTILITY
  // =============================================

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      globalSettings: { ...DEFAULT_GLOBAL_SETTINGS },
      categoryPreferences: new Map(),
      pushSubscriptions: [],
      activePushSubscription: null,
      recentHistory: [],
      stats: null,
      isLoading: false,
      isSaving: false,
      error: null,
      lastSyncedAt: null,
    }),
}));
