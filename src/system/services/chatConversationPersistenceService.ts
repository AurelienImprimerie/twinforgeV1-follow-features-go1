/**
 * Chat Conversation Persistence Service
 * Handles saving/loading conversations and messages from Supabase
 */

import { supabase } from '../supabase/client';
import type { ChatMessage } from '../../domain/coachChat';
import type { ChatMode } from '../store/globalChatStore';
import logger from '../../lib/utils/logger';

export interface ConversationRecord {
  id: string;
  user_id: string;
  mode: ChatMode;
  context_data: any;
  is_active: boolean;
  created_at: string;
  last_message_at: string;
  ended_at: string | null;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  role: 'coach' | 'user' | 'system';
  type: string;
  content: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

class ChatConversationPersistenceService {
  async getOrCreateConversation(mode: ChatMode, contextData?: any): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('CHAT_PERSISTENCE', 'No authenticated user');
        return null;
      }

      const { data: existingConversations, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('mode', mode)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        logger.error('CHAT_PERSISTENCE', 'Error fetching conversations', { error: fetchError });
        return null;
      }

      if (existingConversations && existingConversations.length > 0) {
        return existingConversations[0].id;
      }

      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          mode,
          context_data: contextData || {},
          is_active: true
        })
        .select('id')
        .single();

      if (createError) {
        logger.error('CHAT_PERSISTENCE', 'Error creating conversation', { error: createError });
        return null;
      }

      logger.info('CHAT_PERSISTENCE', 'Created new conversation', {
        conversationId: newConversation.id,
        mode
      });

      return newConversation.id;
    } catch (error) {
      logger.error('CHAT_PERSISTENCE', 'Unexpected error in getOrCreateConversation', { error });
      return null;
    }
  }

  async saveMessage(conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          type: message.type,
          content: message.content,
          metadata: message.metadata || {},
          is_read: false
        });

      if (error) {
        logger.error('CHAT_PERSISTENCE', 'Error saving message', { error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('CHAT_PERSISTENCE', 'Unexpected error in saveMessage', { error });
      return false;
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
        logger.error('CHAT_PERSISTENCE', 'Error fetching messages', { error });
        return [];
      }

      return (data || []).map((record: MessageRecord) => ({
        id: record.id,
        role: record.role,
        type: record.type as any,
        content: record.content,
        timestamp: new Date(record.created_at),
        metadata: record.metadata
      }));
    } catch (error) {
      logger.error('CHAT_PERSISTENCE', 'Unexpected error in getConversationMessages', { error });
      return [];
    }
  }

  async markMessagesAsRead(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);

      if (error) {
        logger.error('CHAT_PERSISTENCE', 'Error marking messages as read', { error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('CHAT_PERSISTENCE', 'Unexpected error in markMessagesAsRead', { error });
      return false;
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
        logger.error('CHAT_PERSISTENCE', 'Error ending conversation', { error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('CHAT_PERSISTENCE', 'Unexpected error in endConversation', { error });
      return false;
    }
  }

  async saveExerciseModification(data: {
    sessionId: string;
    exerciseId: string;
    exerciseName: string;
    adjustmentId: string;
    adjustmentCategory: string;
    previousValues: any;
    newValues: any;
    source: 'chat' | 'card';
    conversationId?: string;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('CHAT_PERSISTENCE', 'No authenticated user');
        return false;
      }

      const { error } = await supabase
        .from('exercise_modifications')
        .insert({
          user_id: user.id,
          conversation_id: data.conversationId || null,
          session_id: data.sessionId,
          exercise_id: data.exerciseId,
          exercise_name: data.exerciseName,
          adjustment_id: data.adjustmentId,
          adjustment_category: data.adjustmentCategory,
          previous_values: data.previousValues,
          new_values: data.newValues,
          source: data.source,
          validated_at: new Date().toISOString()
        });

      if (error) {
        logger.error('CHAT_PERSISTENCE', 'Error saving exercise modification', { error });
        return false;
      }

      logger.info('CHAT_PERSISTENCE', 'Saved exercise modification', {
        exerciseId: data.exerciseId,
        adjustmentId: data.adjustmentId
      });

      return true;
    } catch (error) {
      logger.error('CHAT_PERSISTENCE', 'Unexpected error in saveExerciseModification', { error });
      return false;
    }
  }
}

export const chatConversationPersistenceService = new ChatConversationPersistenceService();
