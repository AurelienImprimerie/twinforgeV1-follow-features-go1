/**
 * Coach Chat Store
 * Zustand store for managing AI coach conversations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  ChatMessage,
  ExerciseFeedback,
  VoiceSettings,
  ConversationContext,
  ConversationState,
  CoachVoice
} from '../../domain/coachChat';
import logger from '../../lib/utils/logger';

interface CoachChatState {
  conversationId: string | null;
  messages: ChatMessage[];
  conversationState: ConversationState;
  context: ConversationContext | null;

  voiceSettings: VoiceSettings;
  isVoiceActive: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;

  exerciseFeedbacks: ExerciseFeedback[];

  isConnected: boolean;
  error: string | null;

  startConversation: (context: ConversationContext) => void;
  endConversation: () => void;
  resetConversation: () => void;

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addSystemMessage: (content: string) => void;

  setConversationState: (state: ConversationState) => void;
  updateContext: (context: Partial<ConversationContext>) => void;

  setVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  toggleVoice: () => void;
  setRecording: (recording: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setSpeaking: (speaking: boolean) => void;

  addExerciseFeedback: (feedback: ExerciseFeedback) => void;
  clearExerciseFeedbacks: () => void;

  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCoachChatStore = create<CoachChatState>()(
  persist(
    (set, get) => ({
      conversationId: null,
      messages: [],
      conversationState: 'intro',
      context: null,

      voiceSettings: {
        voice: 'sage',
        speed: 1.0,
        volume: 0.8,
        enabled: true
      },
      isVoiceActive: false,
      isRecording: false,
      isProcessing: false,
      isSpeaking: false,

      exerciseFeedbacks: [],

      isConnected: false,
      error: null,

      startConversation: (context: ConversationContext) => {
        const conversationId = nanoid();

        set({
          conversationId,
          context,
          conversationState: 'intro',
          messages: [],
          exerciseFeedbacks: [],
          error: null,
          isConnected: false
        });

        logger.info('COACH_CHAT', 'Conversation started', {
          conversationId,
          sessionId: context.sessionId,
          timestamp: new Date().toISOString()
        });
      },

      endConversation: () => {
        const { conversationId } = get();

        set({
          conversationState: 'completed',
          isVoiceActive: false,
          isRecording: false,
          isProcessing: false,
          isSpeaking: false,
          isConnected: false
        });

        logger.info('COACH_CHAT', 'Conversation ended', {
          conversationId,
          messageCount: get().messages.length,
          timestamp: new Date().toISOString()
        });
      },

      resetConversation: () => {
        set({
          conversationId: null,
          messages: [],
          conversationState: 'intro',
          context: null,
          exerciseFeedbacks: [],
          isVoiceActive: false,
          isRecording: false,
          isProcessing: false,
          isSpeaking: false,
          isConnected: false,
          error: null
        });

        logger.info('COACH_CHAT', 'Conversation reset', {
          timestamp: new Date().toISOString()
        });
      },

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: nanoid(),
          timestamp: new Date()
        };

        set((state) => ({
          messages: [...state.messages, newMessage]
        }));

        logger.debug('COACH_CHAT', 'Message added', {
          messageId: newMessage.id,
          role: newMessage.role,
          type: newMessage.type,
          timestamp: new Date().toISOString()
        });
      },

      addSystemMessage: (content: string) => {
        get().addMessage({
          role: 'system',
          type: 'system',
          content
        });
      },

      setConversationState: (conversationState: ConversationState) => {
        set({ conversationState });

        logger.debug('COACH_CHAT', 'Conversation state changed', {
          newState: conversationState,
          timestamp: new Date().toISOString()
        });
      },

      updateContext: (contextUpdate: Partial<ConversationContext>) => {
        set((state) => ({
          context: state.context ? { ...state.context, ...contextUpdate } : null
        }));
      },

      setVoiceSettings: (settings: Partial<VoiceSettings>) => {
        set((state) => ({
          voiceSettings: { ...state.voiceSettings, ...settings }
        }));

        logger.debug('COACH_CHAT', 'Voice settings updated', {
          settings,
          timestamp: new Date().toISOString()
        });
      },

      toggleVoice: () => {
        set((state) => ({
          voiceSettings: {
            ...state.voiceSettings,
            enabled: !state.voiceSettings.enabled
          },
          isVoiceActive: !state.voiceSettings.enabled ? state.isVoiceActive : false
        }));
      },

      setRecording: (recording: boolean) => {
        set({ isRecording: recording });
      },

      setProcessing: (processing: boolean) => {
        set({ isProcessing: processing });
      },

      setSpeaking: (speaking: boolean) => {
        set({ isSpeaking: speaking });
      },

      addExerciseFeedback: (feedback: ExerciseFeedback) => {
        set((state) => ({
          exerciseFeedbacks: [...state.exerciseFeedbacks, feedback]
        }));

        logger.debug('COACH_CHAT', 'Exercise feedback added', {
          exerciseId: feedback.exerciseId,
          action: feedback.action,
          timestamp: new Date().toISOString()
        });
      },

      clearExerciseFeedbacks: () => {
        set({ exerciseFeedbacks: [] });
      },

      setConnected: (connected: boolean) => {
        set({ isConnected: connected });

        logger.debug('COACH_CHAT', 'Connection status changed', {
          connected,
          timestamp: new Date().toISOString()
        });
      },

      setError: (error: string | null) => {
        set({ error });

        if (error) {
          logger.error('COACH_CHAT', 'Error occurred', {
            error,
            timestamp: new Date().toISOString()
          });
        }
      }
    }),
    {
      name: 'coach-chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        voiceSettings: state.voiceSettings,
        messages: state.messages.slice(-20)
      })
    }
  )
);
