/**
 * Chat Conversation Service
 * Service for managing chat conversations and messages in Supabase
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type { ChatMode } from '../store/globalChatStore';
import type { ChatMessage } from '../../domain/coachChat';

export interface DBConversation {
  id: string;
  user_id: string;
  mode_id: string;
  context_data: any;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  role: string;
  type: string;
  content: string;
  metadata: any;
  audio_url: string | null;
  created_at: string;
}

class ChatConversationService {
  async getModeId(modeName: ChatMode): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_modes')
        .select('id')
        .eq('name', modeName)
        .maybeSingle();

      if (error) {
        logger.error('CHAT_CONVERSATION_SERVICE', 'Error getting mode ID', { error });
        return null;
      }

      return data?.id || null;
    } catch (error) {
      logger.error('CHAT_CONVERSATION_SERVICE', 'Error in getModeId', { error });
      return null;
    }
  }

  async getOrCreateConversation(mode: ChatMode, contextData?: any): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const modeId = await this.getModeId(mode);

      if (!modeId) {
        throw new Error(`Mode ${mode} not found in database`);
      }

      const { data: existingConversation, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('mode_id', modeId)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) {
        logger.error('CHAT_CONVERSATION_SERVICE', 'Error fetching conversation', { fetchError });
        throw fetchError;
      }

      if (existingConversation) {
        logger.debug('CHAT_CONVERSATION_SERVICE', 'Using existing conversation', {
          conversationId: existingConversation.id,
          mode
        });
        return existingConversation.id;
      }

      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          mode_id: modeId,
          context_data: contextData || {},
          is_active: true
        })
        .select('id')
        .single();

      if (createError) {
        logger.error('CHAT_CONVERSATION_SERVICE', 'Error creating conversation', { createError });
        throw createError;
      }

      logger.info('CHAT_CONVERSATION_SERVICE', 'Created new conversation', {
        conversationId: newConversation.id,
        mode
      });

      return newConversation.id;
    } catch (error) {
      logger.error('CHAT_CONVERSATION_SERVICE', 'Error in getOrCreateConversation', { error });
      return null;
    }
  }

  async saveMessage(
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          type: message.type,
          content: message.content,
          metadata: (message as any).metadata || {},
          audio_url: (message as any).audioUrl || null
        })
        .select('id')
        .single();

      if (error) {
        logger.error('CHAT_CONVERSATION_SERVICE', 'Error saving message', { error });
        throw error;
      }

      logger.debug('CHAT_CONVERSATION_SERVICE', 'Message saved', {
        messageId: data.id,
        conversationId
      });

      return data.id;
    } catch (error) {
      logger.error('CHAT_CONVERSATION_SERVICE', 'Error in saveMessage', { error });
      return null;
    }
  }

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('CHAT_CONVERSATION_SERVICE', 'Error fetching messages', { error });
        throw error;
      }

      return (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as any,
        type: msg.type as any,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        ...(msg.metadata && Object.keys(msg.metadata).length > 0 ? { metadata: msg.metadata } : {}),
        ...(msg.audio_url ? { audioUrl: msg.audio_url } : {})
      }));
    } catch (error) {
      logger.error('CHAT_CONVERSATION_SERVICE', 'Error in getConversationMessages', { error });
      return [];
    }
  }

  async endConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) {
        logger.error('CHAT_CONVERSATION_SERVICE', 'Error ending conversation', { error });
        return false;
      }

      logger.info('CHAT_CONVERSATION_SERVICE', 'Conversation ended', { conversationId });
      return true;
    } catch (error) {
      logger.error('CHAT_CONVERSATION_SERVICE', 'Error in endConversation', { error });
      return false;
    }
  }

  async getActiveConversationByMode(mode: ChatMode): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const modeId = await this.getModeId(mode);

      if (!modeId) {
        return null;
      }

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('mode_id', modeId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        logger.error('CHAT_CONVERSATION_SERVICE', 'Error fetching active conversation', { error });
        return null;
      }

      return data?.id || null;
    } catch (error) {
      logger.error('CHAT_CONVERSATION_SERVICE', 'Error in getActiveConversationByMode', { error });
      return null;
    }
  }
}

export const chatConversationService = new ChatConversationService();
