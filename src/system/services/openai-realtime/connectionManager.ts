/**
 * WebRTC Connection Manager
 * Handles RTCPeerConnection setup, SDP negotiation, and connection lifecycle
 */

import logger from '../../../lib/utils/logger';
import type { RealtimeConfig, ConnectionHandler, ErrorHandler } from './types';

export class ConnectionManager {
  private peerConnection: RTCPeerConnection | null = null;
  private isConnected = false;
  private connectHandlers: Set<ConnectionHandler> = new Set();
  private disconnectHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();

  /**
   * Create and configure RTCPeerConnection
   */
  async createPeerConnection(): Promise<RTCPeerConnection> {
    logger.info('REALTIME_CONNECTION', '🔌 Creating RTCPeerConnection...');

    this.peerConnection = new RTCPeerConnection();
    this.setupConnectionHandlers();

    logger.info('REALTIME_CONNECTION', '✅ RTCPeerConnection created', {
      connectionState: this.peerConnection.connectionState,
      iceConnectionState: this.peerConnection.iceConnectionState
    });

    return this.peerConnection;
  }

  /**
   * Perform SDP negotiation with backend
   */
  async negotiateConnection(config: RealtimeConfig): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    // Create SDP offer
    logger.info('REALTIME_CONNECTION', '📝 Creating SDP offer...');
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    logger.info('REALTIME_CONNECTION', '✅ SDP offer created', {
      sdpType: offer.type,
      sdpLength: offer.sdp?.length || 0
    });

    // Send to backend and get answer
    const sdpAnswer = await this.sendOfferToBackend(offer, config);

    // Set remote description
    const answer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: sdpAnswer
    };

    await this.peerConnection.setRemoteDescription(answer);
    logger.info('REALTIME_CONNECTION', '✅ SDP answer set as remote description');

    // Wait for connection
    await this.waitForConnection();
  }

  /**
   * Send SDP offer to backend and receive answer
   */
  private async sendOfferToBackend(
    offer: RTCSessionDescriptionInit,
    config: RealtimeConfig
  ): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const sessionUrl = `${supabaseUrl}/functions/v1/voice-coach-realtime/session`;

    logger.info('REALTIME_CONNECTION', '🌐 Sending SDP offer to backend', { url: sessionUrl });

    const response = await fetch(sessionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        sdp: offer.sdp,
        model: config.model,
        voice: config.voice,
        instructions: config.instructions
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('REALTIME_CONNECTION', '❌ Backend error', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Failed to create session: ${response.status} - ${errorText}`);
    }

    const sdpAnswer = await response.text();
    logger.info('REALTIME_CONNECTION', '✅ Received SDP answer', {
      sdpAnswerLength: sdpAnswer.length
    });

    return sdpAnswer;
  }

  /**
   * Wait for WebRTC connection to be established
   */
  private async waitForConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 15000;

      const checkConnection = () => {
        if (!this.peerConnection) {
          reject(new Error('Peer connection lost'));
          return;
        }

        const state = this.peerConnection.connectionState;
        const iceState = this.peerConnection.iceConnectionState;

        if (state === 'connected' || iceState === 'connected' || iceState === 'completed') {
          logger.info('REALTIME_CONNECTION', '✅ Connection established', {
            duration: Date.now() - startTime
          });
          this.isConnected = true;
          this.notifyConnected();
          resolve();
          return;
        }

        if (state === 'failed' || iceState === 'failed') {
          logger.error('REALTIME_CONNECTION', '❌ Connection failed');
          reject(new Error('WebRTC connection failed'));
          return;
        }

        if (Date.now() - startTime > timeout) {
          logger.error('REALTIME_CONNECTION', '❌ Connection timeout');
          reject(new Error('Connection timeout'));
          return;
        }

        setTimeout(checkConnection, 100);
      };

      checkConnection();
    });
  }

  /**
   * Setup connection state handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.peerConnection) return;

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      logger.info('REALTIME_CONNECTION', `Connection state: ${state}`);

      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        this.isConnected = false;
        this.notifyDisconnected();

        if (state === 'failed') {
          this.notifyError(new Error('WebRTC connection failed'));
        }
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      logger.info('REALTIME_CONNECTION', `ICE state: ${state}`);
    };
  }

  /**
   * Close connection and cleanup
   */
  close(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.isConnected = false;
  }

  /**
   * Event handlers registration
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Notify handlers
   */
  private notifyConnected(): void {
    this.connectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        logger.error('REALTIME_CONNECTION', 'Error in connect handler', { error });
      }
    });
  }

  private notifyDisconnected(): void {
    this.disconnectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        logger.error('REALTIME_CONNECTION', 'Error in disconnect handler', { error });
      }
    });
  }

  private notifyError(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        logger.error('REALTIME_CONNECTION', 'Error in error handler', { handlerError });
      }
    });
  }

  /**
   * Getters
   */
  get connection(): RTCPeerConnection | null {
    return this.peerConnection;
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get connectionState(): string {
    return this.peerConnection?.connectionState || 'none';
  }

  get iceConnectionState(): string {
    return this.peerConnection?.iceConnectionState || 'none';
  }
}
