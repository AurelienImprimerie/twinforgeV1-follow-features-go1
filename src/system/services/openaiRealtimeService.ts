/**
 * OpenAI Realtime API Service - WebRTC Edition
 * Service pour gérer la connexion WebRTC avec l'API Realtime d'OpenAI
 * Utilise l'interface unifiée recommandée par OpenAI pour les navigateurs
 *
 * Architecture modular:
 * - ConnectionManager: Gestion de RTCPeerConnection et négociation SDP
 * - DataChannelManager: Gestion du RTCDataChannel pour les événements
 * - AudioManager: Gestion de l'audio (microphone et lecture)
 * - SessionManager: Configuration de session et messages
 * - DiagnosticsManager: Monitoring et diagnostics de santé
 */

import logger from '../../lib/utils/logger';
import type {
  RealtimeConfig,
  RealtimeMessage,
  MessageHandler,
  ErrorHandler,
  ConnectionHandler,
  ChatMode,
  ConnectionDiagnostics,
  AudioDiagnostics
} from './openai-realtime/types';
import { ConnectionManager } from './openai-realtime/connectionManager';
import { DataChannelManager } from './openai-realtime/dataChannelManager';
import { AudioManager } from './openai-realtime/audioManager';
import { SessionManager } from './openai-realtime/sessionManager';
import { DiagnosticsManager } from './openai-realtime/diagnosticsManager';

class OpenAIRealtimeService {
  private connectionManager: ConnectionManager;
  private dataChannelManager: DataChannelManager;
  private audioManager: AudioManager;
  private sessionManager: SessionManager;
  private diagnosticsManager: DiagnosticsManager;
  private config: RealtimeConfig | null = null;

  constructor() {
    this.connectionManager = new ConnectionManager();
    this.dataChannelManager = new DataChannelManager();
    this.audioManager = new AudioManager();
    this.sessionManager = new SessionManager(this.dataChannelManager);
    this.diagnosticsManager = new DiagnosticsManager(
      this.connectionManager,
      this.dataChannelManager,
      this.audioManager,
      this.sessionManager
    );
  }

  /**
   * Connect to OpenAI Realtime API via WebRTC
   */
  async connect(config: RealtimeConfig): Promise<void> {
    if (this.connectionManager.connected) {
      logger.info('REALTIME', '✅ Already connected');
      return;
    }

    this.config = config;
    this.sessionManager.setConfig(config);

    try {
      logger.info('REALTIME', '🚀 STARTING WEBRTC CONNECTION', {
        model: config.model,
        voice: config.voice,
        timestamp: new Date().toISOString()
      });

      // Verify environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      if (typeof RTCPeerConnection === 'undefined') {
        throw new Error('WebRTC API not available');
      }

      // Create peer connection
      const peerConnection = await this.connectionManager.createPeerConnection();

      // Setup audio
      const audioElement = this.audioManager.createAudioElement();
      const localStream = await this.audioManager.getMicrophoneAccess();

      // Add audio tracks to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
        logger.info('REALTIME', '✅ Audio track added', {
          trackKind: track.kind,
          trackId: track.id
        });
      });

      // Handle remote audio tracks
      peerConnection.ontrack = async (event) => {
        await this.audioManager.handleRemoteTrack(event);
      };

      // Create data channel
      const dataChannel = this.dataChannelManager.createDataChannel(peerConnection);

      // Setup message handler for session manager
      this.dataChannelManager.onMessage((message) => {
        this.sessionManager.handleMessage(message);
      });

      // Setup connection handlers
      this.connectionManager.onConnect(() => {
        logger.info('REALTIME', '✅ Connection established');
      });

      this.connectionManager.onDisconnect(() => {
        logger.info('REALTIME', '🔌 Disconnected');
      });

      // Perform SDP negotiation
      await this.connectionManager.negotiateConnection(config);

      // Wait for data channel to be ready
      await this.dataChannelManager.waitForReady();

      logger.info('REALTIME', '✅✅✅ SUCCESSFULLY CONNECTED ✅✅✅');

      // Verify audio input
      this.audioManager.verifyAudioInput();

      setTimeout(() => {
        this.audioManager.verifyAudioInput();
      }, 1000);

      // Start health monitoring
      this.diagnosticsManager.startHealthCheck();

    } catch (error) {
      logger.error('REALTIME', '❌ CONNECTION FAILED', { error });
      this.cleanup();
      throw error;
    }
  }

  /**
   * Configure session with system prompt
   */
  async configureSession(systemPrompt: string, mode: ChatMode): Promise<void> {
    await this.sessionManager.configureSession(systemPrompt, mode);
  }

  /**
   * Send text message
   */
  sendTextMessage(text: string): void {
    this.sessionManager.sendTextMessage(text);
  }

  /**
   * Cancel current response
   */
  cancelResponse(): void {
    this.sessionManager.cancelResponse();
  }

  /**
   * Send audio (handled automatically by WebRTC)
   */
  sendAudio(_audioData: ArrayBuffer): void {
    logger.debug('REALTIME', 'Audio handled automatically by WebRTC');
  }

  /**
   * Commit audio buffer (not needed with WebRTC)
   */
  commitAudioBuffer(): void {
    logger.debug('REALTIME', 'Audio buffer commit not needed with WebRTC');
  }

  /**
   * Enable audio playback manually
   */
  async enableAudioPlayback(): Promise<boolean> {
    return await this.audioManager.enableAudioPlayback();
  }

  /**
   * Disconnect from API
   */
  disconnect(): void {
    logger.info('REALTIME', 'Disconnecting...');
    this.cleanup();
  }

  /**
   * Cleanup all resources
   */
  private cleanup(): void {
    this.diagnosticsManager.stopHealthCheck();
    this.dataChannelManager.close();
    this.connectionManager.close();
    this.audioManager.cleanup();
    this.sessionManager.reset();
    logger.info('REALTIME', 'Cleanup complete');
  }

  /**
   * Get connection diagnostics
   */
  getConnectionDiagnostics(): ConnectionDiagnostics {
    return this.diagnosticsManager.getConnectionDiagnostics();
  }

  /**
   * Get audio diagnostics
   */
  getAudioDiagnostics(): AudioDiagnostics {
    return this.audioManager.getAudioDiagnostics();
  }

  /**
   * Log audio diagnostics
   */
  logAudioDiagnostics(): void {
    this.audioManager.logAudioDiagnostics();
  }

  /**
   * Register event handlers
   */
  onMessage(handler: MessageHandler): () => void {
    return this.dataChannelManager.onMessage(handler);
  }

  onError(handler: ErrorHandler): () => void {
    return this.connectionManager.onError(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    return this.connectionManager.onConnect(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    return this.connectionManager.onDisconnect(handler);
  }

  /**
   * Getters
   */
  get connected(): boolean {
    return this.connectionManager.connected;
  }

  get readyState(): number {
    const state = this.connectionManager.connectionState;
    switch (state) {
      case 'new':
      case 'connecting':
        return 0;
      case 'connected':
        return 1;
      case 'disconnected':
      case 'failed':
      case 'closed':
        return 3;
      default:
        return 3;
    }
  }
}

// Export singleton
export const openaiRealtimeService = new OpenAIRealtimeService();
