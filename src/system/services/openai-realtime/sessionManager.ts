/**
 * Session Manager
 * Handles session configuration and messaging for OpenAI Realtime API
 */

import logger from '../../../lib/utils/logger';
import type { RealtimeConfig, RealtimeMessage, ChatMode } from './types';
import { DataChannelManager } from './dataChannelManager';
import { conversationMemoryManager } from '../../head/memory';

export class SessionManager {
  private dataChannelManager: DataChannelManager;
  private config: RealtimeConfig | null = null;
  private lastSpeechDetectedAt: number | null = null;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private appContext: any = null;
  private currentTranscription: string = '';
  private currentResponse: string = '';

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
   * Set user context for conversation persistence
   */
  setUserContext(userId: string, sessionId?: string, appContext?: any): void {
    this.userId = userId;
    this.sessionId = sessionId || null;
    this.appContext = appContext || null;

    logger.debug('REALTIME_SESSION', 'User context set for voice persistence', {
      userId,
      sessionId,
      hasAppContext: !!appContext
    });
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
   * Handle message (for speech detection tracking and conversation persistence)
   */
  async handleMessage(message: RealtimeMessage): Promise<void> {
    if (message.type === 'input_audio_buffer.speech_started') {
      this.lastSpeechDetectedAt = Date.now();
      logger.info('REALTIME_SESSION', '🎤 Speech detected');
    }

    // Handle user transcription (input)
    if (message.type === 'conversation.item.input_audio_transcription.completed') {
      this.currentTranscription = (message as any).transcript || '';

      // Persist user voice message
      if (this.userId && this.currentTranscription) {
        await conversationMemoryManager.saveMessage({
          userId: this.userId,
          sessionId: this.sessionId || undefined,
          role: 'user',
          content: this.currentTranscription,
          messageType: 'voice',
          context: this.appContext,
          timestamp: Date.now()
        });

        logger.debug('REALTIME_SESSION', '💾 User voice message persisted', {
          userId: this.userId,
          transcriptionLength: this.currentTranscription.length
        });
      }
    }

    // Handle assistant response text (output)
    if (message.type === 'response.audio_transcript.delta') {
      this.currentResponse += (message as any).delta || '';
    }

    // Handle response completion - persist full assistant message
    if (message.type === 'response.audio_transcript.done') {
      if (this.userId && this.currentResponse) {
        await conversationMemoryManager.saveMessage({
          userId: this.userId,
          sessionId: this.sessionId || undefined,
          role: 'assistant',
          content: this.currentResponse,
          messageType: 'voice',
          context: this.appContext,
          timestamp: Date.now()
        });

        logger.debug('REALTIME_SESSION', '💾 Assistant voice response persisted', {
          userId: this.userId,
          responseLength: this.currentResponse.length
        });
      }

      // Reset for next message
      this.currentResponse = '';
      this.currentTranscription = '';
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
    this.currentTranscription = '';
    this.currentResponse = '';
    this.userId = null;
    this.sessionId = null;
    this.appContext = null;
  }
}
