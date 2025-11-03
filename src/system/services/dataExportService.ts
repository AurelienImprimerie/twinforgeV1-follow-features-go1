/**
 * Data Export Service
 * Handles user data export requests, format conversion, and download preparation
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type {
  DataExportRequest,
  DataExportRequestPayload,
  ExportableDataCategory,
  DataExportFormat,
  ExportProgress,
} from '../../domain/privacy';

class DataExportService {
  // =============================================
  // EXPORT REQUEST MANAGEMENT
  // =============================================

  /**
   * Request a full data export
   */
  async requestFullExport(
    userId: string,
    format: DataExportFormat = 'json'
  ): Promise<string | null> {
    const payload: DataExportRequestPayload = {
      request_type: 'full_export',
      export_format: format,
      included_data: [
        'profile',
        'training',
        'nutrition',
        'fasting',
        'body_scans',
        'activities',
        'health',
        'preferences',
        'notifications',
      ],
    };

    return this.requestExport(userId, payload);
  }

  /**
   * Request a partial data export
   */
  async requestPartialExport(
    userId: string,
    categories: ExportableDataCategory[],
    format: DataExportFormat = 'json'
  ): Promise<string | null> {
    const payload: DataExportRequestPayload = {
      request_type: 'partial_export',
      export_format: format,
      included_data: categories,
    };

    return this.requestExport(userId, payload);
  }

  /**
   * Generic export request handler
   */
  private async requestExport(
    userId: string,
    payload: DataExportRequestPayload
  ): Promise<string | null> {
    try {
      logger.info('DATA_EXPORT', 'Requesting data export', {
        userId,
        type: payload.request_type,
        format: payload.export_format,
        categories: payload.included_data.length,
      });

      // Call database function to create export request
      const { data, error } = await supabase.rpc('request_data_export', {
        p_user_id: userId,
        p_request_type: payload.request_type,
        p_export_format: payload.export_format,
        p_included_data: payload.included_data,
      });

      if (error) {
        logger.error('DATA_EXPORT', 'Failed to request export', { error });
        throw error;
      }

      const requestId = data as string;
      logger.info('DATA_EXPORT', 'Export request created', { requestId });

      // Trigger edge function to process export
      await this.triggerExportProcessing(requestId, userId);

      return requestId;
    } catch (error) {
      logger.error('DATA_EXPORT', 'Error requesting export', { error });
      return null;
    }
  }

  /**
   * Trigger edge function to process the export
   */
  private async triggerExportProcessing(requestId: string, userId: string): Promise<void> {
    try {
      // Call edge function to start processing
      const { error } = await supabase.functions.invoke('export-user-data', {
        body: {
          requestId,
          userId,
        },
      });

      if (error) {
        logger.error('DATA_EXPORT', 'Failed to trigger export processing', { error });
        throw error;
      }

      logger.info('DATA_EXPORT', 'Export processing triggered', { requestId });
    } catch (error) {
      logger.error('DATA_EXPORT', 'Error triggering export processing', { error });
    }
  }

  // =============================================
  // EXPORT STATUS & PROGRESS
  // =============================================

  /**
   * Get status of an export request
   */
  async getExportStatus(requestId: string): Promise<DataExportRequest | null> {
    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();

      if (error) {
        logger.error('DATA_EXPORT', 'Failed to get export status', { error });
        return null;
      }

      return data as DataExportRequest | null;
    } catch (error) {
      logger.error('DATA_EXPORT', 'Error getting export status', { error });
      return null;
    }
  }

  /**
   * Poll export progress with exponential backoff
   */
  async pollExportProgress(
    requestId: string,
    onProgress?: (progress: ExportProgress) => void,
    maxAttempts = 60,
    initialDelay = 2000
  ): Promise<DataExportRequest | null> {
    let attempts = 0;
    let delay = initialDelay;

    while (attempts < maxAttempts) {
      const status = await this.getExportStatus(requestId);

      if (!status) {
        logger.error('DATA_EXPORT', 'Export request not found', { requestId });
        return null;
      }

      // Update progress callback
      if (onProgress) {
        const progress = this.calculateProgress(status);
        onProgress(progress);
      }

      // Check if completed or failed
      if (status.status === 'completed') {
        logger.info('DATA_EXPORT', 'Export completed', { requestId });
        return status;
      }

      if (status.status === 'failed') {
        logger.error('DATA_EXPORT', 'Export failed', {
          requestId,
          error: status.error_message,
        });
        return status;
      }

      // Wait before next poll (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 10000); // Max 10 seconds
      attempts++;
    }

    logger.warn('DATA_EXPORT', 'Export polling timeout', { requestId, attempts });
    return await this.getExportStatus(requestId);
  }

  /**
   * Calculate progress percentage based on status
   */
  private calculateProgress(request: DataExportRequest): ExportProgress {
    let progress = 0;
    let currentStep = 'Préparation';

    switch (request.status) {
      case 'pending':
        progress = 10;
        currentStep = 'En attente';
        break;
      case 'processing':
        progress = 50;
        currentStep = 'Extraction des données en cours';
        break;
      case 'completed':
        progress = 100;
        currentStep = 'Terminé';
        break;
      case 'failed':
        progress = 0;
        currentStep = 'Erreur';
        break;
    }

    return {
      requestId: request.id,
      status: request.status,
      progress,
      estimatedTimeRemaining: this.estimateTimeRemaining(request),
      currentStep,
    };
  }

  /**
   * Estimate remaining time based on status
   */
  private estimateTimeRemaining(request: DataExportRequest): number | null {
    if (request.status === 'completed' || request.status === 'failed') {
      return 0;
    }

    if (request.status === 'pending') {
      return 120; // 2 minutes estimate for pending
    }

    if (request.status === 'processing') {
      // Estimate based on time elapsed
      const requestedAt = new Date(request.requested_at).getTime();
      const now = Date.now();
      const elapsed = (now - requestedAt) / 1000; // seconds

      // Assume processing takes ~2-5 minutes
      const estimatedTotal = 180; // 3 minutes
      const remaining = Math.max(0, estimatedTotal - elapsed);
      return Math.round(remaining);
    }

    return null;
  }

  // =============================================
  // DOWNLOAD MANAGEMENT
  // =============================================

  /**
   * Get download URL for completed export
   */
  async getDownloadUrl(requestId: string): Promise<string | null> {
    try {
      const request = await this.getExportStatus(requestId);

      if (!request) {
        logger.error('DATA_EXPORT', 'Export request not found', { requestId });
        return null;
      }

      if (request.status !== 'completed') {
        logger.warn('DATA_EXPORT', 'Export not completed', {
          requestId,
          status: request.status,
        });
        return null;
      }

      if (!request.file_url) {
        logger.error('DATA_EXPORT', 'No file URL available', { requestId });
        return null;
      }

      // Check if expired
      if (request.expires_at && new Date(request.expires_at) < new Date()) {
        logger.warn('DATA_EXPORT', 'Download link expired', {
          requestId,
          expiresAt: request.expires_at,
        });
        return null;
      }

      return request.file_url;
    } catch (error) {
      logger.error('DATA_EXPORT', 'Error getting download URL', { error });
      return null;
    }
  }

  /**
   * Download export file
   */
  async downloadExport(requestId: string): Promise<boolean> {
    try {
      const url = await this.getDownloadUrl(requestId);

      if (!url) {
        logger.error('DATA_EXPORT', 'No download URL available', { requestId });
        return false;
      }

      // Trigger browser download
      const link = document.createElement('a');
      link.href = url;
      link.download = `twinforge-export-${requestId}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logger.info('DATA_EXPORT', 'Export download triggered', { requestId });
      return true;
    } catch (error) {
      logger.error('DATA_EXPORT', 'Error downloading export', { error });
      return false;
    }
  }

  // =============================================
  // EXPORT HISTORY
  // =============================================

  /**
   * Get user's export history
   */
  async getExportHistory(userId: string, limit = 10): Promise<DataExportRequest[]> {
    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('DATA_EXPORT', 'Failed to get export history', { error });
        return [];
      }

      return (data || []) as DataExportRequest[];
    } catch (error) {
      logger.error('DATA_EXPORT', 'Error getting export history', { error });
      return [];
    }
  }

  /**
   * Delete old export files (cleanup)
   */
  async cleanupOldExports(userId: string): Promise<void> {
    try {
      // Get completed exports older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('data_export_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .lt('completed_at', sevenDaysAgo.toISOString());

      if (error || !data || data.length === 0) {
        return;
      }

      // Note: Actual file deletion should be handled by a scheduled edge function
      // This is just for marking as cleaned up
      logger.info('DATA_EXPORT', 'Old exports found for cleanup', {
        count: data.length,
      });
    } catch (error) {
      logger.error('DATA_EXPORT', 'Error cleaning up old exports', { error });
    }
  }

  // =============================================
  // UTILITY
  // =============================================

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number | null): string {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Get estimated export size based on categories
   */
  estimateExportSize(categories: ExportableDataCategory[]): string {
    // Very rough estimates - should be refined based on actual data
    const sizeMap: Record<ExportableDataCategory, number> = {
      profile: 100, // KB
      training: 5000,
      nutrition: 3000,
      fasting: 500,
      body_scans: 20000,
      activities: 2000,
      health: 1000,
      preferences: 50,
      notifications: 500,
    };

    const totalBytes = categories.reduce((acc, cat) => acc + (sizeMap[cat] || 0), 0) * 1024;
    return this.formatFileSize(totalBytes);
  }
}

// Export singleton instance
export const dataExportService = new DataExportService();
