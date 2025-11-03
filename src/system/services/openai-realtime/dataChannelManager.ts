/**
 * WebRTC Data Channel Manager
 * Handles RTCDataChannel for sending/receiving events with OpenAI Realtime API
 */

import logger from '../../../lib/utils/logger';
import type { RealtimeMessage, MessageHandler } from './types';

export class DataChannelManager {
  private dataChannel: RTCDataChannel | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private sessionConfigured = false;
  private sessionConfiguredResolve: (() => void) | null = null;

  /**
   * Create and configure data channel
   */
  createDataChannel(peerConnection: RTCPeerConnection): RTCDataChannel {
    logger.info('REALTIME_DC', '📡 Creating data channel...');

    this.dataChannel = peerConnection.createDataChannel('oai-events');
    this.setupHandlers();

    return this.dataChannel;
  }

  /**
   * Wait for data channel to be ready
   */
  async waitForReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.dataChannel) {
        reject(new Error('Data channel not created'));
        return;
      }

      if (this.dataChannel.readyState === 'open') {
        logger.info('REALTIME_DC', '✅ Data channel already open');
        resolve();
        return;
      }

      const timeout = 10000;
      const startTime = Date.now();

      const onOpen = () => {
        logger.info('REALTIME_DC', '✅ Data channel opened', {
          duration: Date.now() - startTime
        });
        cleanup();
        resolve();
      };

      const onError = (error: Event) => {
        logger.error('REALTIME_DC', '❌ Data channel error', { error });
        cleanup();
        reject(new Error('Data channel error'));
      };

      const onClose = () => {
        logger.error('REALTIME_DC', '❌ Data channel closed prematurely');
        cleanup();
        reject(new Error('Data channel closed before opening'));
      };

      const timeoutId = setTimeout(() => {
        logger.error('REALTIME_DC', '❌ Data channel timeout');
        cleanup();
        reject(new Error('Data channel open timeout'));
      }, timeout);

      const cleanup = () => {
        clearTimeout(timeoutId);
        if (this.dataChannel) {
          this.dataChannel.removeEventListener('open', onOpen);
          this.dataChannel.removeEventListener('error', onError);
          this.dataChannel.removeEventListener('close', onClose);
        }
      };

      this.dataChannel.addEventListener('open', onOpen);
      this.dataChannel.addEventListener('error', onError);
      this.dataChannel.addEventListener('close', onClose);
    });
  }

  /**
   * Setup data channel handlers
   */
  private setupHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      logger.info('REALTIME_DC', '✅ Data channel opened', {
        readyState: this.dataChannel?.readyState
      });
    };

    this.dataChannel.onclose = () => {
      logger.info('REALTIME_DC', '🔌 Data channel closed');
    };

    this.dataChannel.onerror = (error) => {
      logger.error('REALTIME_DC', '❌ Data channel error', { error });
    };

    this.dataChannel.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as RealtimeMessage;

      // Log important messages
      const importantTypes = [
        'session.updated',
        'conversation.item.input_audio_transcription.delta',
        'conversation.item.input_audio_transcription.completed',
        'response.audio_transcript.delta',
        'response.audio_transcript.done',
        'response.done',
        'error',
        'input_audio_buffer.speech_started',
        'input_audio_buffer.speech_stopped',
        'conversation.item.created'
      ];

      if (importantTypes.includes(message.type)) {
        logger.info('REALTIME_DC', `📨 ${message.type}`, {
          hasContent: !!message.delta || !!message.transcript
        });
      }

      // Handle session confirmation
      if (message.type === 'session.updated' && this.sessionConfiguredResolve) {
        logger.info('REALTIME_DC', '✅ Session configuration confirmed');
        this.sessionConfigured = true;
        this.sessionConfiguredResolve();
        this.sessionConfiguredResolve = null;
      }

      // Notify handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          logger.error('REALTIME_DC', 'Error in message handler', { error });
        }
      });
    } catch (error) {
      logger.error('REALTIME_DC', 'Error parsing message', { error, data });
    }
  }

  /**
   * Send message through data channel
   */
  send(message: RealtimeMessage): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      logger.error('REALTIME_DC', '❌ Cannot send: channel not open', {
        hasChannel: !!this.dataChannel,
        readyState: this.dataChannel?.readyState,
        messageType: message.type
      });
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.dataChannel.send(messageStr);
      logger.info('REALTIME_DC', `✅ Sent: ${message.type}`, {
        size: messageStr.length
      });
    } catch (error) {
      logger.error('REALTIME_DC', '❌ Error sending message', {
        error,
        messageType: message.type
      });
    }
  }

  /**
   * Wait for session configuration confirmation
   */
  async waitForSessionConfigured(): Promise<void> {
    if (this.sessionConfigured) return;

    return new Promise<void>((resolve) => {
      this.sessionConfiguredResolve = resolve;
      setTimeout(() => {
        if (!this.sessionConfigured && this.sessionConfiguredResolve) {
          logger.warn('REALTIME_DC', '⚠️ Session config timeout, continuing anyway');
          this.sessionConfigured = true;
          this.sessionConfiguredResolve = null;
          resolve();
        }
      }, 3000);
    });
  }

  /**
   * Close data channel
   */
  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    this.sessionConfigured = false;
    this.sessionConfiguredResolve = null;
  }

  /**
   * Event handler registration
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Getters
   */
  get channel(): RTCDataChannel | null {
    return this.dataChannel;
  }

  get readyState(): string {
    return this.dataChannel?.readyState || 'none';
  }

  get isSessionConfigured(): boolean {
    return this.sessionConfigured;
  }
}
