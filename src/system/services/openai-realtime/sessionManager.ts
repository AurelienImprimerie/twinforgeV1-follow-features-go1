/**
 * Session Manager
 * Handles session configuration and messaging for OpenAI Realtime API
 */

import logger from '../../../lib/utils/logger';
import type { RealtimeConfig, RealtimeMessage, ChatMode } from './types';
import { DataChannelManager } from './dataChannelManager';

export class SessionManager {
  private dataChannelManager: DataChannelManager;
  private config: RealtimeConfig | null = null;
  private lastSpeechDetectedAt: number | null = null;

  constructor(dataChannelManager: DataChannelManager) {
    this.dataChannelManager = dataChannelManager;
  }

  /**
   * Set configuration
   */
  setConfig(config: RealtimeConfig): void {
    this.config = config;
  }

  /**
   * Configure session with system prompt and settings
   */
  async configureSession(systemPrompt: string, mode: ChatMode): Promise<void> {
    if (this.dataChannelManager.isSessionConfigured) {
      logger.warn('REALTIME_SESSION', '⚠️ Session already configured');
      return;
    }

    logger.info('REALTIME_SESSION', '⚙️ Configuring session', {
      mode,
      promptLength: systemPrompt.length
    });

    this.dataChannelManager.send({
      type: 'session.update',
      session: {
        instructions: systemPrompt,
        modalities: ['text', 'audio'],
        voice: this.config?.voice || 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
          create_response: true
        },
        temperature: this.config?.temperature || 0.8,
        max_response_output_tokens: this.config?.maxTokens || 4096
      }
    });

    logger.info('REALTIME_SESSION', '✅ Session configuration sent');

    await this.dataChannelManager.waitForSessionConfigured();
  }

  /**
   * Send text message
   */
  sendTextMessage(text: string): void {
    this.dataChannelManager.send({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    });

    this.dataChannelManager.send({
      type: 'response.create'
    });

    logger.debug('REALTIME_SESSION', 'Text message sent', { text });
  }

  /**
   * Cancel current response
   */
  cancelResponse(): void {
    this.dataChannelManager.send({
      type: 'response.cancel'
    });
    logger.debug('REALTIME_SESSION', 'Response cancelled');
  }

  /**
   * Handle message (for speech detection tracking)
   */
  handleMessage(message: RealtimeMessage): void {
    if (message.type === 'input_audio_buffer.speech_started') {
      this.lastSpeechDetectedAt = Date.now();
      logger.info('REALTIME_SESSION', '🎤 Speech detected');
    }
  }

  /**
   * Get last speech detection time
   */
  get lastSpeechTime(): number | null {
    return this.lastSpeechDetectedAt;
  }

  /**
   * Reset session state
   */
  reset(): void {
    this.lastSpeechDetectedAt = null;
  }
}
