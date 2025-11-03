/**
 * Text Chat Service
 * Service dédié UNIQUEMENT au mode texte via l'API Chat Completions
 * N'utilise JAMAIS WebSocket, seulement HTTP avec chat-ai edge function
 */

import logger from '../../lib/utils/logger';
import { chatAIService } from './chatAiService';
import type { ChatMessage } from '../../domain/coachChat';
import type { ChatMode } from '../store/globalChatStore';

interface TextChatConfig {
  mode: ChatMode;
  systemPrompt: string;
  contextData?: any;
}

type MessageHandler = (message: string, isDelta: boolean) => void;
type ErrorHandler = (error: Error) => void;

class TextChatService {
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private conversationHistory: ChatMessage[] = [];
  private currentMode: ChatMode = 'general';
  private systemPrompt: string = '';
  private isProcessing = false;

  /**
   * Initialiser le service de chat texte
   */
  initialize(config: TextChatConfig): void {
    logger.info('TEXT_CHAT_SERVICE', 'Initializing text chat service', {
      mode: config.mode
    });

    this.currentMode = config.mode;
    this.systemPrompt = config.systemPrompt;
    this.conversationHistory = [];
    this.isProcessing = false;

    logger.info('TEXT_CHAT_SERVICE', 'Text chat service initialized successfully');
  }

  /**
   * Envoyer un message texte et recevoir une réponse
   */
  async sendMessage(userMessage: string, stream: boolean = true): Promise<void> {
    if (this.isProcessing) {
      logger.warn('TEXT_CHAT_SERVICE', 'Already processing a message');
      return;
    }

    this.isProcessing = true;
    const messageId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      logger.info('TEXT_CHAT_SERVICE', 'Sending text message', {
        messageId,
        mode: this.currentMode,
        messageLength: userMessage.length,
        stream,
        historySize: this.conversationHistory.length
      });

      const userChatMessage: ChatMessage = {
        id: messageId,
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      };

      this.conversationHistory.push(userChatMessage);

      logger.debug('TEXT_CHAT_SERVICE', 'User message added to history', {
        messageId,
        historySize: this.conversationHistory.length
      });

      const apiMessages = [
        {
          role: 'system' as const,
          content: this.systemPrompt
        },
        ...this.conversationHistory.map(msg => ({
          role: msg.role === 'coach' ? 'assistant' as const : msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      logger.debug('TEXT_CHAT_SERVICE', 'API messages prepared', {
        messageId,
        totalMessages: apiMessages.length,
        systemPromptLength: this.systemPrompt.length
      });

      if (stream) {
        logger.info('TEXT_CHAT_SERVICE', 'Starting streaming mode', { messageId });

        let accumulatedResponse = '';
        let chunkCount = 0;

        await chatAIService.sendStreamMessage(
          {
            messages: apiMessages,
            mode: this.currentMode,
            stream: true
          },
          (chunk: string) => {
            chunkCount++;
            accumulatedResponse += chunk;

            if (chunkCount <= 10) {
              logger.info('TEXT_CHAT_SERVICE', '📨 Delta received', {
                messageId,
                chunkNumber: chunkCount,
                chunkLength: chunk.length,
                accumulatedLength: accumulatedResponse.length,
                handlersCount: this.messageHandlers.length
              });
            }

            logger.info('TEXT_CHAT_SERVICE', '🔔 Calling messageHandlers', {
              chunkNumber: chunkCount,
              handlersCount: this.messageHandlers.length
            });

            this.messageHandlers.forEach(handler => handler(chunk, true));

            logger.info('TEXT_CHAT_SERVICE', '✅ Handlers called', {
              chunkNumber: chunkCount
            });
          }
        );

        logger.info('TEXT_CHAT_SERVICE', 'Stream completed', {
          messageId,
          totalChunks: chunkCount,
          responseLength: accumulatedResponse.length,
          durationMs: Date.now() - startTime
        });

        if (accumulatedResponse.length === 0) {
          logger.warn('TEXT_CHAT_SERVICE', 'Empty response received', {
            messageId,
            durationMs: Date.now() - startTime
          });
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'coach',
          content: accumulatedResponse,
          timestamp: Date.now()
        };

        this.conversationHistory.push(assistantMessage);

        this.messageHandlers.forEach(handler => handler('', false));

        logger.info('TEXT_CHAT_SERVICE', 'Stream response completed', {
          messageId,
          responseLength: accumulatedResponse.length,
          totalDurationMs: Date.now() - startTime
        });
      } else {
        logger.info('TEXT_CHAT_SERVICE', 'Starting non-streaming mode', { messageId });

        const response = await chatAIService.sendMessage({
          messages: apiMessages,
          mode: this.currentMode,
          stream: false
        });

        logger.debug('TEXT_CHAT_SERVICE', 'Non-stream response received', {
          messageId,
          responseLength: response.message.content.length,
          tokensUsed: response.usage?.total_tokens,
          durationMs: Date.now() - startTime
        });

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'coach',
          content: response.message.content,
          timestamp: Date.now()
        };

        this.conversationHistory.push(assistantMessage);

        this.messageHandlers.forEach(handler => handler(response.message.content, false));

        logger.info('TEXT_CHAT_SERVICE', 'Response received', {
          messageId,
          responseLength: response.message.content.length,
          tokensUsed: response.usage?.total_tokens,
          durationMs: Date.now() - startTime
        });
      }
    } catch (error) {
      logger.error('TEXT_CHAT_SERVICE', 'Error sending message', {
        messageId,
        mode: this.currentMode,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs: Date.now() - startTime
      });

      this.errorHandlers.forEach(handler => {
        handler(error instanceof Error ? error : new Error(String(error)));
      });

      throw error;
    } finally {
      this.isProcessing = false;
      logger.debug('TEXT_CHAT_SERVICE', 'Processing flag cleared', { messageId });
    }
  }

  /**
   * Réinitialiser la conversation
   */
  resetConversation(): void {
    logger.info('TEXT_CHAT_SERVICE', 'Resetting conversation');
    this.conversationHistory = [];
  }

  /**
   * Obtenir l'historique de conversation
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Définir le system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
    logger.debug('TEXT_CHAT_SERVICE', 'System prompt updated');
  }

  /**
   * Changer le mode
   */
  setMode(mode: ChatMode): void {
    this.currentMode = mode;
    logger.info('TEXT_CHAT_SERVICE', 'Mode changed', { mode });
  }

  /**
   * Enregistrer un handler pour les messages reçus
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Enregistrer un handler pour les erreurs
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Vérifier si le service est en cours de traitement
   */
  get processing(): boolean {
    return this.isProcessing;
  }

  /**
   * Nettoyer le service
   */
  cleanup(): void {
    logger.info('TEXT_CHAT_SERVICE', 'Cleaning up text chat service');
    this.messageHandlers.clear();
    this.errorHandlers.clear();
    this.conversationHistory = [];
    this.isProcessing = false;
  }
}

// Export singleton
export const textChatService = new TextChatService();
