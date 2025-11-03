/**
 * Account Deletion Service
 * Handles account deletion requests, grace period management, and data anonymization
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type {
  AccountDeletionRequest,
  AccountDeletionRequestPayload,
  AccountDeletionCancellation,
} from '../../domain/privacy';
import { getDaysUntilDeletion, canCancelDeletion } from '../../domain/privacy';

class AccountDeletionService {
  // =============================================
  // DELETION REQUEST MANAGEMENT
  // =============================================

  /**
   * Request account deletion with 30-day grace period
   */
  async requestDeletion(
    userId: string,
    payload: AccountDeletionRequestPayload
  ): Promise<string | null> {
    try {
      logger.info('ACCOUNT_DELETION', 'Requesting account deletion', {
        userId,
        deleteAllData: payload.delete_all_data,
        anonymizeOnly: payload.anonymize_only,
      });

      // Call database function to create deletion request
      const { data, error } = await supabase.rpc('request_account_deletion', {
        p_user_id: userId,
        p_delete_all_data: payload.delete_all_data,
        p_anonymize_only: payload.anonymize_only,
        p_reason: payload.reason || null,
      });

      if (error) {
        logger.error('ACCOUNT_DELETION', 'Failed to request deletion', { error });
        throw error;
      }

      const requestId = data as string;
      logger.info('ACCOUNT_DELETION', 'Deletion request created', { requestId });

      return requestId;
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error requesting deletion', { error });
      return null;
    }
  }

  /**
   * Cancel pending deletion request
   */
  async cancelDeletion(
    userId: string,
    cancellation: AccountDeletionCancellation
  ): Promise<boolean> {
    try {
      logger.info('ACCOUNT_DELETION', 'Cancelling deletion request', {
        userId,
        reason: cancellation.reason,
      });

      // Call database function to cancel deletion
      const { data, error } = await supabase.rpc('cancel_account_deletion', {
        p_user_id: userId,
        p_cancellation_reason: cancellation.reason || null,
      });

      if (error) {
        logger.error('ACCOUNT_DELETION', 'Failed to cancel deletion', { error });
        throw error;
      }

      const success = data as boolean;

      if (success) {
        logger.info('ACCOUNT_DELETION', 'Deletion request cancelled successfully');
      } else {
        logger.warn('ACCOUNT_DELETION', 'No active deletion request to cancel');
      }

      return success;
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error cancelling deletion', { error });
      return false;
    }
  }

  // =============================================
  // DELETION STATUS
  // =============================================

  /**
   * Get active deletion request for user
   */
  async getActiveDeletionRequest(userId: string): Promise<AccountDeletionRequest | null> {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'scheduled', 'processing'])
        .maybeSingle();

      if (error) {
        logger.error('ACCOUNT_DELETION', 'Failed to get deletion request', { error });
        return null;
      }

      return data as AccountDeletionRequest | null;
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error getting deletion request', { error });
      return null;
    }
  }

  /**
   * Check if user has an active deletion request
   */
  async hasActiveDeletion(userId: string): Promise<boolean> {
    const request = await this.getActiveDeletionRequest(userId);
    return request !== null;
  }

  /**
   * Get deletion history for user
   */
  async getDeletionHistory(userId: string): Promise<AccountDeletionRequest[]> {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });

      if (error) {
        logger.error('ACCOUNT_DELETION', 'Failed to get deletion history', { error });
        return [];
      }

      return (data || []) as AccountDeletionRequest[];
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error getting deletion history', { error });
      return [];
    }
  }

  // =============================================
  // DELETION WARNINGS & INFO
  // =============================================

  /**
   * Get formatted deletion warning information
   */
  getDeletionWarningInfo(request: AccountDeletionRequest): {
    daysRemaining: number;
    scheduledDate: Date;
    canCancel: boolean;
    warningLevel: 'info' | 'warning' | 'critical';
    message: string;
  } {
    const daysRemaining = getDaysUntilDeletion(request.deletion_scheduled_at);
    const scheduledDate = new Date(request.deletion_scheduled_at);
    const canCancelRequest = canCancelDeletion(request);

    let warningLevel: 'info' | 'warning' | 'critical' = 'info';
    let message = '';

    if (daysRemaining <= 3) {
      warningLevel = 'critical';
      message = `Votre compte sera définitivement supprimé dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}.`;
    } else if (daysRemaining <= 7) {
      warningLevel = 'warning';
      message = `Votre compte sera supprimé dans ${daysRemaining} jours.`;
    } else {
      warningLevel = 'info';
      message = `Votre demande de suppression sera effective dans ${daysRemaining} jours.`;
    }

    return {
      daysRemaining,
      scheduledDate,
      canCancel: canCancelRequest,
      warningLevel,
      message,
    };
  }

  /**
   * Get list of data that will be deleted
   */
  getDataToBeDeleted(deleteAllData: boolean, anonymizeOnly: boolean): string[] {
    if (anonymizeOnly) {
      return [
        'Vos informations personnelles seront anonymisées',
        'Vos données d\'entraînement resteront pour les statistiques',
        'Votre email et photo de profil seront supprimés',
        'Votre identité ne sera plus associée à vos données',
      ];
    }

    if (deleteAllData) {
      return [
        'Profil et informations personnelles',
        'Historique d\'entraînement complet',
        'Journal alimentaire et recettes',
        'Sessions de jeûne',
        'Scans corporels et photos',
        'Activités enregistrées',
        'Données de santé',
        'Préférences et paramètres',
        'Historique des notifications',
      ];
    }

    return [
      'Profil et informations personnelles',
      'Données sensibles (photos, santé)',
      'Préférences et paramètres',
    ];
  }

  /**
   * Get consequences of deletion
   */
  getDeletionConsequences(): string[] {
    return [
      '⚠️ Cette action est irréversible après le délai de grâce',
      '⚠️ Vous ne pourrez plus accéder à vos données',
      '⚠️ Votre progression sera définitivement perdue',
      '⚠️ Vos abonnements et achats seront annulés',
      'ℹ️ Vous avez 30 jours pour annuler cette demande',
      'ℹ️ Un email de confirmation vous sera envoyé',
    ];
  }

  // =============================================
  // IMMEDIATE DELETION (ADMIN ONLY)
  // =============================================

  /**
   * Trigger immediate deletion (used by scheduled jobs or admin actions)
   * This should only be called by edge functions with service role
   */
  async processScheduledDeletions(): Promise<void> {
    try {
      logger.info('ACCOUNT_DELETION', 'Processing scheduled deletions');

      // Call edge function to process scheduled deletions
      const { error } = await supabase.functions.invoke('process-account-deletion');

      if (error) {
        logger.error('ACCOUNT_DELETION', 'Failed to process scheduled deletions', { error });
        throw error;
      }

      logger.info('ACCOUNT_DELETION', 'Scheduled deletions processed successfully');
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error processing scheduled deletions', { error });
    }
  }

  // =============================================
  // DATA ANONYMIZATION
  // =============================================

  /**
   * Get information about data anonymization
   */
  getAnonymizationInfo(): {
    title: string;
    description: string;
    whatIsKept: string[];
    whatIsRemoved: string[];
  } {
    return {
      title: 'Anonymisation des données',
      description:
        'L\'anonymisation supprime vos informations personnelles tout en conservant vos données d\'entraînement pour les statistiques agrégées.',
      whatIsKept: [
        'Données d\'entraînement (sans identification)',
        'Statistiques de progression (anonymisées)',
        'Données nutritionnelles agrégées',
      ],
      whatIsRemoved: [
        'Nom, email, et informations personnelles',
        'Photos et scans corporels',
        'Données de connexion',
        'Préférences personnelles',
      ],
    };
  }

  // =============================================
  // NOTIFICATIONS
  // =============================================

  /**
   * Send deletion reminder notification
   */
  async sendDeletionReminder(userId: string, daysRemaining: number): Promise<void> {
    try {
      // This would typically call a notification service or edge function
      logger.info('ACCOUNT_DELETION', 'Sending deletion reminder', {
        userId,
        daysRemaining,
      });

      // TODO: Implement notification sending
      // await notificationService.send(...)
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error sending deletion reminder', { error });
    }
  }

  /**
   * Send deletion confirmation email
   */
  async sendDeletionConfirmation(userId: string, requestId: string): Promise<void> {
    try {
      logger.info('ACCOUNT_DELETION', 'Sending deletion confirmation', {
        userId,
        requestId,
      });

      // TODO: Implement email sending via edge function
      // await supabase.functions.invoke('send-email', { ... })
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error sending deletion confirmation', { error });
    }
  }

  /**
   * Send cancellation confirmation email
   */
  async sendCancellationConfirmation(userId: string): Promise<void> {
    try {
      logger.info('ACCOUNT_DELETION', 'Sending cancellation confirmation', { userId });

      // TODO: Implement email sending via edge function
      // await supabase.functions.invoke('send-email', { ... })
    } catch (error) {
      logger.error('ACCOUNT_DELETION', 'Error sending cancellation confirmation', { error });
    }
  }
}

// Export singleton instance
export const accountDeletionService = new AccountDeletionService();
