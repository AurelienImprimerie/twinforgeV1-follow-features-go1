import { create } from 'zustand';
import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type {
  PrivacyPreferences,
  DataExportRequest,
  AccountDeletionRequest,
  DataPrivacyConsent,
  DataAccessLogEntry,
  PrivacyDashboard,
  DataExportRequestPayload,
  AccountDeletionRequestPayload,
  AccountDeletionCancellation,
  ConsentUpdate,
  DataRetentionPreference,
} from '../../domain/privacy';
import { DEFAULT_PRIVACY_PREFERENCES } from '../../domain/privacy';

interface DataPrivacyState {
  // Privacy preferences
  preferences: PrivacyPreferences;

  // Active requests
  activeDeletionRequest: AccountDeletionRequest | null;
  recentExportRequests: DataExportRequest[];

  // Consents (keyed by consent type)
  consents: Map<string, DataPrivacyConsent>;

  // Access log
  recentAccessLog: DataAccessLogEntry[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncedAt: string | null;

  // Actions - Privacy Preferences
  loadPrivacyPreferences: (userId?: string) => Promise<void>;
  updatePrivacyPreference: (
    key: keyof PrivacyPreferences,
    value: DataRetentionPreference | boolean,
    userId?: string
  ) => Promise<void>;

  // Actions - Data Export
  loadExportRequests: (userId?: string) => Promise<void>;
  requestDataExport: (payload: DataExportRequestPayload, userId?: string) => Promise<string | null>;
  getExportDownloadUrl: (requestId: string) => Promise<string | null>;

  // Actions - Account Deletion
  loadDeletionRequest: (userId?: string) => Promise<void>;
  requestAccountDeletion: (
    payload: AccountDeletionRequestPayload,
    userId?: string
  ) => Promise<string | null>;
  cancelAccountDeletion: (
    cancellation: AccountDeletionCancellation,
    userId?: string
  ) => Promise<boolean>;

  // Actions - Consents
  loadConsents: (userId?: string) => Promise<void>;
  updateConsent: (consent: ConsentUpdate, userId?: string) => Promise<void>;

  // Actions - Access Log
  loadAccessLog: (userId?: string, days?: number) => Promise<void>;

  // Actions - Dashboard
  loadPrivacyDashboard: (userId?: string) => Promise<PrivacyDashboard | null>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

const STORAGE_KEY_PREFIX = 'twinforge-privacy';

export const useDataPrivacyStore = create<DataPrivacyState>((set, get) => ({
  // Initial state
  preferences: { ...DEFAULT_PRIVACY_PREFERENCES },
  activeDeletionRequest: null,
  recentExportRequests: [],
  consents: new Map(),
  recentAccessLog: [],
  isLoading: false,
  isSaving: false,
  error: null,
  lastSyncedAt: null,

  // =============================================
  // PRIVACY PREFERENCES ACTIONS
  // =============================================

  loadPrivacyPreferences: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      // Try localStorage first
      const localKey = `${STORAGE_KEY_PREFIX}-preferences`;
      const localValue = localStorage.getItem(localKey);

      if (localValue) {
        const parsed = JSON.parse(localValue);
        set({ preferences: parsed });
      }

      // If user is logged in, sync with Supabase
      if (userId) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select(
            'data_retention_preference, analytics_tracking_enabled, third_party_sharing_enabled, marketing_communications_enabled'
          )
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          logger.error('DATA_PRIVACY', 'Failed to load privacy preferences from Supabase', {
            error,
          });
          // Continue with local cache - don't throw
        } else if (data) {
          const preferences: PrivacyPreferences = {
            data_retention_preference: (data.data_retention_preference as DataRetentionPreference) ?? 'standard',
            analytics_tracking_enabled: data.analytics_tracking_enabled ?? true,
            third_party_sharing_enabled: data.third_party_sharing_enabled ?? false,
            marketing_communications_enabled: data.marketing_communications_enabled ?? false,
          };

          set({ preferences, lastSyncedAt: new Date().toISOString() });
          localStorage.setItem(localKey, JSON.stringify(preferences));
          logger.info('DATA_PRIVACY', 'Loaded privacy preferences from Supabase');
        }
      }

      set({ isLoading: false });
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error loading privacy preferences', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement des préférences' });
    }
  },

  updatePrivacyPreference: async (key, value, userId?) => {
    try {
      set({ isSaving: true, error: null });

      const currentPreferences = get().preferences;
      const updatedPreferences = { ...currentPreferences, [key]: value };

      // Update local state immediately
      set({ preferences: updatedPreferences });

      // Save to localStorage
      const localKey = `${STORAGE_KEY_PREFIX}-preferences`;
      localStorage.setItem(localKey, JSON.stringify(updatedPreferences));

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
          logger.error('DATA_PRIVACY', 'Failed to update privacy preference in Supabase', {
            error,
          });
          // Don't throw - continue with local state
          set({ isSaving: false, error: 'Erreur lors de la sauvegarde' });
          return;
        }

        logger.info('DATA_PRIVACY', 'Updated privacy preference', { key, value });
        set({ lastSyncedAt: new Date().toISOString() });
      }

      set({ isSaving: false });
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error updating privacy preference', { error });
      set({ isSaving: false, error: 'Erreur lors de la sauvegarde' });
    }
  },

  // =============================================
  // DATA EXPORT ACTIONS
  // =============================================

  loadExportRequests: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(10);

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to load export requests', { error });
        // Continue with empty array - don't throw
        set({ recentExportRequests: [], isLoading: false });
        return;
      }

      set({
        recentExportRequests: (data || []) as DataExportRequest[],
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      logger.info('DATA_PRIVACY', 'Loaded export requests', { count: data?.length || 0 });
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error loading export requests', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement des demandes d\'export' });
    }
  },

  requestDataExport: async (payload, userId?) => {
    try {
      set({ isSaving: true, error: null });

      if (!userId) {
        throw new Error('User ID required to request data export');
      }

      // Call database function to create export request
      const { data, error } = await supabase.rpc('request_data_export', {
        p_user_id: userId,
        p_request_type: payload.request_type,
        p_export_format: payload.export_format,
        p_included_data: payload.included_data,
      });

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to request data export', { error });
        throw error;
      }

      const requestId = data as string;

      // Reload export requests
      await get().loadExportRequests(userId);

      set({ isSaving: false });
      logger.info('DATA_PRIVACY', 'Data export requested', { requestId });

      return requestId;
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error requesting data export', { error });
      set({ isSaving: false, error: 'Erreur lors de la demande d\'export' });
      return null;
    }
  },

  getExportDownloadUrl: async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('file_url, expires_at, status')
        .eq('id', requestId)
        .maybeSingle();

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to get export download URL', { error });
        return null;
      }

      if (!data || data.status !== 'completed' || !data.file_url) {
        return null;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        logger.warn('DATA_PRIVACY', 'Export download link expired', { requestId });
        return null;
      }

      return data.file_url;
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error getting export download URL', { error });
      return null;
    }
  },

  // =============================================
  // ACCOUNT DELETION ACTIONS
  // =============================================

  loadDeletionRequest: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'scheduled', 'processing'])
        .maybeSingle();

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to load deletion request', { error });
        // Continue with null - don't throw
        set({ activeDeletionRequest: null, isLoading: false });
        return;
      }

      set({
        activeDeletionRequest: data as AccountDeletionRequest | null,
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      logger.info('DATA_PRIVACY', 'Loaded deletion request', {
        hasActive: !!data,
      });
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error loading deletion request', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement de la demande de suppression' });
    }
  },

  requestAccountDeletion: async (payload, userId?) => {
    try {
      set({ isSaving: true, error: null });

      if (!userId) {
        throw new Error('User ID required to request account deletion');
      }

      // Call database function to create deletion request
      const { data, error } = await supabase.rpc('request_account_deletion', {
        p_user_id: userId,
        p_delete_all_data: payload.delete_all_data,
        p_anonymize_only: payload.anonymize_only,
        p_reason: payload.reason || null,
      });

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to request account deletion', { error });
        throw error;
      }

      const requestId = data as string;

      // Reload deletion request
      await get().loadDeletionRequest(userId);

      set({ isSaving: false });
      logger.info('DATA_PRIVACY', 'Account deletion requested', { requestId });

      return requestId;
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error requesting account deletion', { error });
      set({
        isSaving: false,
        error: 'Erreur lors de la demande de suppression de compte',
      });
      return null;
    }
  },

  cancelAccountDeletion: async (cancellation, userId?) => {
    try {
      set({ isSaving: true, error: null });

      if (!userId) {
        throw new Error('User ID required to cancel account deletion');
      }

      // Call database function to cancel deletion request
      const { data, error } = await supabase.rpc('cancel_account_deletion', {
        p_user_id: userId,
        p_cancellation_reason: cancellation.reason || null,
      });

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to cancel account deletion', { error });
        throw error;
      }

      const success = data as boolean;

      if (success) {
        // Clear active deletion request
        set({ activeDeletionRequest: null });
        logger.info('DATA_PRIVACY', 'Account deletion cancelled');
      }

      set({ isSaving: false });
      return success;
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error cancelling account deletion', { error });
      set({
        isSaving: false,
        error: 'Erreur lors de l\'annulation de la suppression',
      });
      return false;
    }
  },

  // =============================================
  // CONSENTS ACTIONS
  // =============================================

  loadConsents: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return;
      }

      // Get latest consent for each type
      const { data, error } = await supabase
        .from('data_privacy_consents')
        .select('*')
        .eq('user_id', userId)
        .order('consented_at', { ascending: false });

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to load consents', { error });
        throw error;
      }

      // Keep only the latest consent for each type
      const consentsMap = new Map<string, DataPrivacyConsent>();
      (data || []).forEach((consent: any) => {
        if (!consentsMap.has(consent.consent_type)) {
          consentsMap.set(consent.consent_type, consent as DataPrivacyConsent);
        }
      });

      set({
        consents: consentsMap,
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      logger.info('DATA_PRIVACY', 'Loaded consents', { count: consentsMap.size });
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error loading consents', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement des consentements' });
    }
  },

  updateConsent: async (consent, userId?) => {
    try {
      set({ isSaving: true, error: null });

      if (!userId) {
        throw new Error('User ID required to update consent');
      }

      // Call database function to record consent
      const { data, error } = await supabase.rpc('record_consent', {
        p_user_id: userId,
        p_consent_type: consent.consent_type,
        p_consent_given: consent.consent_given,
        p_consent_version: consent.consent_version,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to update consent', { error });
        throw error;
      }

      // Reload consents
      await get().loadConsents(userId);

      set({ isSaving: false });
      logger.info('DATA_PRIVACY', 'Consent updated', { consent });
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error updating consent', { error });
      set({ isSaving: false, error: 'Erreur lors de la mise à jour du consentement' });
    }
  },

  // =============================================
  // ACCESS LOG ACTIONS
  // =============================================

  loadAccessLog: async (userId?, days = 30) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('data_access_log')
        .select('*')
        .eq('user_id', userId)
        .gte('accessed_at', cutoffDate.toISOString())
        .order('accessed_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to load access log', { error });
        throw error;
      }

      set({
        recentAccessLog: (data || []) as DataAccessLogEntry[],
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      logger.info('DATA_PRIVACY', 'Loaded access log', { count: data?.length || 0 });
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error loading access log', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement du journal d\'accès' });
    }
  },

  // =============================================
  // DASHBOARD ACTIONS
  // =============================================

  loadPrivacyDashboard: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!userId) {
        set({ isLoading: false });
        return null;
      }

      // Call database function to get dashboard summary
      const { data, error } = await supabase.rpc('get_privacy_dashboard', {
        p_user_id: userId,
      });

      if (error) {
        logger.error('DATA_PRIVACY', 'Failed to load privacy dashboard', { error });
        throw error;
      }

      const dashboard = data as PrivacyDashboard;

      // Update local state
      set({
        activeDeletionRequest: dashboard.active_deletion_request,
        recentExportRequests: dashboard.recent_exports || [],
        lastSyncedAt: new Date().toISOString(),
        isLoading: false,
      });

      logger.info('DATA_PRIVACY', 'Loaded privacy dashboard');
      return dashboard;
    } catch (error) {
      logger.error('DATA_PRIVACY', 'Error loading privacy dashboard', { error });
      set({ isLoading: false, error: 'Erreur lors du chargement du tableau de bord' });
      return null;
    }
  },

  // =============================================
  // UTILITY
  // =============================================

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      preferences: { ...DEFAULT_PRIVACY_PREFERENCES },
      activeDeletionRequest: null,
      recentExportRequests: [],
      consents: new Map(),
      recentAccessLog: [],
      isLoading: false,
      isSaving: false,
      error: null,
      lastSyncedAt: null,
    }),
}));
