/**
 * Diagnostics Manager
 * Handles health checks and connection diagnostics
 */

import logger from '../../../lib/utils/logger';
import type { ConnectionDiagnostics } from './types';
import { ConnectionManager } from './connectionManager';
import { DataChannelManager } from './dataChannelManager';
import { AudioManager } from './audioManager';
import { SessionManager } from './sessionManager';

export class DiagnosticsManager {
  private connectionManager: ConnectionManager;
  private dataChannelManager: DataChannelManager;
  private audioManager: AudioManager;
  private sessionManager: SessionManager;
  private healthCheckInterval: number | null = null;

  constructor(
    connectionManager: ConnectionManager,
    dataChannelManager: DataChannelManager,
    audioManager: AudioManager,
    sessionManager: SessionManager
  ) {
    this.connectionManager = connectionManager;
    this.dataChannelManager = dataChannelManager;
    this.audioManager = audioManager;
    this.sessionManager = sessionManager;
  }

  /**
   * Start periodic health checks
   */
  startHealthCheck(): void {
    this.healthCheckInterval = window.setInterval(() => {
      const diagnostics = this.getConnectionDiagnostics();

      logger.debug('REALTIME_HEALTH', '💓 Health check', {
        ...diagnostics,
        timeSinceLastSpeech: this.sessionManager.lastSpeechTime
          ? Date.now() - this.sessionManager.lastSpeechTime
          : null
      });

      if (diagnostics.isConnected && !diagnostics.audioInputActive) {
        logger.warn('REALTIME_HEALTH', '⚠️ Audio input not active despite connection');
      }

      if (diagnostics.isConnected && diagnostics.dataChannelState !== 'open') {
        logger.error('REALTIME_HEALTH', '❌ Data channel not open');
      }
    }, 30000);
  }

  /**
   * Stop health checks
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get connection diagnostics
   */
  getConnectionDiagnostics(): ConnectionDiagnostics {
    return {
      isConnected: this.connectionManager.connected,
      sessionConfigured: this.dataChannelManager.isSessionConfigured,
      audioInputActive: this.audioManager.isInputActive,
      peerConnectionState: this.connectionManager.connectionState,
      iceConnectionState: this.connectionManager.iceConnectionState,
      dataChannelState: this.dataChannelManager.readyState,
      localStreamActive: this.audioManager.stream?.active || false,
      audioTracksCount: this.audioManager.stream?.getAudioTracks().length || 0
    };
  }

  /**
   * Log connection diagnostics
   */
  logConnectionDiagnostics(): void {
    const diagnostics = this.getConnectionDiagnostics();
    logger.info('REALTIME_DIAGNOSTICS', '🔍 CONNECTION DIAGNOSTICS', diagnostics);
  }
}
