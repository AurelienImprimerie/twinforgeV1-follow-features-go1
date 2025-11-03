/**
 * Chat AI Service
 * Service for interacting with the chat-ai Edge Function
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type { ChatMessage } from '../../domain/coachChat';
import type { ChatMode } from '../store/globalChatStore';

export interface ChatAIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  mode: ChatMode;
  contextData?: any;
  stream?: boolean;
}

export interface ChatAIResponse {
  message: {
    role: 'assistant';
    content: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class ChatAIService {
  private baseUrl: string;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.baseUrl = `${supabaseUrl}/functions/v1`;
  }

  async sendMessage(request: ChatAIRequest): Promise<ChatAIResponse> {
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.info('CHAT_AI_SERVICE', '🚀 Starting sendMessage request', {
        requestId,
        mode: request.mode,
        messageCount: request.messages.length,
        hasContext: !!request.contextData,
        baseUrl: this.baseUrl
      });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        logger.error('CHAT_AI_SERVICE', '❌ User not authenticated', { requestId });
        throw new Error('User not authenticated');
      }

      logger.info('CHAT_AI_SERVICE', '✅ Session validated, making fetch request', {
        requestId,
        userId: session.user.id,
        url: `${this.baseUrl}/chat-ai`
      });

      const response = await fetch(`${this.baseUrl}/chat-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify(request)
      });

      logger.info('CHAT_AI_SERVICE', '📡 Fetch response received', {
        requestId,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('Content-Type')
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('CHAT_AI_SERVICE', '❌ Response not OK', {
          requestId,
          status: response.status,
          errorText
        });

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }

        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data: ChatAIResponse = await response.json();

      logger.info('CHAT_AI_SERVICE', '✅ Response parsed successfully', {
        requestId,
        mode: request.mode,
        tokensUsed: data.usage?.total_tokens,
        hasMessage: !!data.message,
        messageLength: data.message?.content?.length || 0
      });

      return data;
    } catch (error) {
      logger.error('CHAT_AI_SERVICE', '❌ Fatal error in sendMessage', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async sendStreamMessage(
    request: ChatAIRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const startTime = Date.now();
    let chunkCount = 0;
    let totalContent = '';
    let requestId = 'unknown';

    try {
      logger.info('CHAT_AI_SERVICE', 'Starting stream request', {
        mode: request.mode,
        messageCount: request.messages.length
      });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        logger.error('CHAT_AI_SERVICE', 'User not authenticated for stream');
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/chat-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          ...request,
          stream: true
        })
      });

      requestId = response.headers.get('X-Request-Id') || 'unknown';

      logger.info('CHAT_AI_SERVICE', 'Stream response received', {
        requestId,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('Content-Type')
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('CHAT_AI_SERVICE', 'Stream response not ok', {
          requestId,
          status: response.status,
          error: errorText
        });
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        logger.error('CHAT_AI_SERVICE', 'No response body reader', { requestId });
        throw new Error('Response body is not readable');
      }

      logger.info('CHAT_AI_SERVICE', 'Starting to read stream chunks', { requestId });

      let buffer = ''; // Buffer pour accumuler les lignes partielles
      let totalLinesProcessed = 0;
      let dataLinesProcessed = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          logger.info('CHAT_AI_SERVICE', 'Stream reading completed', {
            requestId,
            chunkCount,
            totalLength: totalContent.length,
            totalLinesProcessed,
            dataLinesProcessed,
            durationMs: Date.now() - startTime
          });
          break;
        }

        // Ajouter le nouveau chunk au buffer
        buffer += decoder.decode(value, { stream: true });

        // Séparer par les lignes complètes
        const lines = buffer.split('\n');

        // Garder la dernière ligne (potentiellement incomplète) dans le buffer
        buffer = lines.pop() || '';

        if (totalLinesProcessed < 10) {
          logger.debug('CHAT_AI_SERVICE', 'Stream chunk received', {
            requestId,
            lineCount: lines.length,
            bufferSize: buffer.length,
            firstLinePreview: lines[0]?.substring(0, 100)
          });
        }

        for (const line of lines) {
          totalLinesProcessed++;

          if (!line.trim()) continue;

          if (line.startsWith('data: ')) {
            dataLinesProcessed++;
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              logger.info('CHAT_AI_SERVICE', 'Stream [DONE] marker received', {
                requestId,
                totalChunks: chunkCount,
                totalLength: totalContent.length
              });
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (chunkCount < 3) {
                logger.debug('CHAT_AI_SERVICE', 'Parsed SSE data', {
                  requestId,
                  hasChoices: !!parsed.choices,
                  choicesLength: parsed.choices?.length,
                  hasDelta: !!parsed.choices?.[0]?.delta,
                  deltaKeys: parsed.choices?.[0]?.delta ? Object.keys(parsed.choices[0].delta) : [],
                  hasContent: !!parsed.choices?.[0]?.delta?.content
                });
              }

              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                chunkCount++;
                totalContent += content;

                logger.info('CHAT_AI_SERVICE', '🔥 CALLING onChunk with content', {
                  requestId,
                  chunkNumber: chunkCount,
                  contentLength: content.length,
                  contentPreview: content.substring(0, 50)
                });

                onChunk(content);

                if (chunkCount <= 3) {
                  logger.debug('CHAT_AI_SERVICE', 'Content chunk extracted', {
                    requestId,
                    chunkNumber: chunkCount,
                    contentLength: content.length,
                    contentPreview: content.substring(0, 50)
                  });
                }
              } else if (chunkCount < 3) {
                logger.warn('CHAT_AI_SERVICE', '❌ NO CONTENT in chunk', {
                  requestId,
                  parsed: JSON.stringify(parsed).substring(0, 200)
                });
              }
            } catch (parseError) {
              // Log plus détaillé pour comprendre l'erreur
              logger.warn('CHAT_AI_SERVICE', 'Failed to parse SSE data', {
                requestId,
                dataLength: data.length,
                dataPreview: data.substring(0, 200),
                error: parseError instanceof Error ? parseError.message : String(parseError)
              });
            }
          }
        }
      }

      if (chunkCount === 0) {
        logger.warn('CHAT_AI_SERVICE', 'No content chunks received in stream', {
          requestId,
          durationMs: Date.now() - startTime
        });
      }
    } catch (error) {
      logger.error('CHAT_AI_SERVICE', 'Error in stream', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        chunkCount,
        durationMs: Date.now() - startTime
      });
      throw error;
    }
  }

  convertMessagesToAPI(messages: ChatMessage[]): ChatAIRequest['messages'] {
    return messages.map(msg => ({
      role: msg.role === 'coach' ? 'assistant' : msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }));
  }
}

export const chatAIService = new ChatAIService();
