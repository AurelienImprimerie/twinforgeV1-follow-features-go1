/**
 * Voice Coach Store
 * Zustand store pour la gestion complète de l'interface vocale du coach
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import logger from '../../lib/utils/logger';
import type { ChatMode } from './globalChatStore';

export type VoiceState = 'idle' | 'ready' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
export type VoiceMode = 'auto' | 'push-to-talk' | 'continuous';
export type VoiceType = 'alloy' | 'echo' | 'shimmer' | 'fable' | 'onyx' | 'nova';
export type CommunicationMode = 'voice' | 'text';

export interface VoiceMessage {
  id: string;
  role: 'user' | 'coach' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  durationMs?: number;
  emotion?: string;
  confidence?: number;
}

export interface VoiceConversation {
  id: string;
  mode: ChatMode;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  messageCount: number;
}

export interface VoicePreferences {
  preferredVoice: VoiceType;
  voiceSpeed: number;
  defaultMode: VoiceMode;
  autoTranscription: boolean;
  voiceEnabled: boolean;
  showVisualizations: boolean;
  reduceAnimations: boolean;
}

export interface AudioVisualization {
  frequencies: number[];
  volume: number;
  isSpeaking: boolean;
}

interface VoiceCoachState {
  // État de la connexion
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // État vocal
  voiceState: VoiceState;
  currentMode: ChatMode;
  communicationMode: CommunicationMode;

  // Conversation active
  activeConversationId: string | null;
  messages: VoiceMessage[];

  // Transcription en temps réel
  currentTranscription: string;
  isTranscribing: boolean;

  // Visualisation audio
  visualization: AudioVisualization;

  // Préférences utilisateur
  preferences: VoicePreferences;

  // Permissions
  microphonePermission: 'prompt' | 'granted' | 'denied';

  // Panel UI
  isPanelOpen: boolean;
  isPanelMinimized: boolean;
  showTranscript: boolean;
  showReadyPrompt: boolean;

  // Actions de connexion
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;

  // Actions vocales
  startListening: () => Promise<void>;
  stopListening: () => void;
  sendVoiceMessage: (audioData: Blob) => Promise<void>;

  // Actions de conversation
  startConversation: (mode: ChatMode) => Promise<void>;
  endConversation: () => Promise<void>;
  addMessage: (message: Omit<VoiceMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Actions de transcription
  updateTranscription: (text: string) => void;
  finalizeTranscription: () => void;

  // Actions de visualisation
  updateVisualization: (data: Partial<AudioVisualization>) => void;

  // Actions de préférences
  updatePreferences: (prefs: Partial<VoicePreferences>) => void;
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;

  // Actions de permission
  requestMicrophonePermission: () => Promise<boolean>;
  checkMicrophonePermission: () => Promise<void>;

  // Actions UI
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  minimizePanel: () => void;
  maximizePanel: () => void;
  toggleTranscript: () => void;
  setCommunicationMode: (mode: CommunicationMode) => void;
  toggleCommunicationMode: () => void;

  // Actions d'état
  setVoiceState: (state: VoiceState) => void;
  setMode: (mode: ChatMode) => void;
  setError: (error: string | null) => void;
  setShowReadyPrompt: (show: boolean) => void;
}

const DEFAULT_PREFERENCES: VoicePreferences = {
  preferredVoice: 'alloy',
  voiceSpeed: 1.0,
  defaultMode: 'auto',
  autoTranscription: true,
  voiceEnabled: true,
  showVisualizations: true,
  reduceAnimations: false
};

const DEFAULT_VISUALIZATION: AudioVisualization = {
  frequencies: new Array(32).fill(0),
  volume: 0,
  isSpeaking: false
};

export const useVoiceCoachStore = create<VoiceCoachState>()(
  persist(
    (set, get) => ({
      // État initial
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      voiceState: 'idle',
      currentMode: 'general',
      communicationMode: 'voice',
      activeConversationId: null,
      messages: [],
      currentTranscription: '',
      isTranscribing: false,
      visualization: DEFAULT_VISUALIZATION,
      preferences: DEFAULT_PREFERENCES,
      microphonePermission: 'prompt',
      isPanelOpen: false,
      isPanelMinimized: false,
      showTranscript: true,
      showReadyPrompt: false,

      // Actions de connexion
      connect: async () => {
        const state = get();

        if (state.isConnected || state.isConnecting) {
          logger.debug('VOICE_COACH', 'Already connected or connecting');
          return;
        }

        set({ isConnecting: true, connectionError: null });

        try {
          // La connexion WebSocket sera implémentée dans le service
          logger.info('VOICE_COACH', 'Connecting to OpenAI Realtime API');

          // Simuler la connexion pour l'instant
          await new Promise(resolve => setTimeout(resolve, 500));

          set({
            isConnected: true,
            isConnecting: false,
            connectionError: null
          });

          logger.info('VOICE_COACH', 'Connected successfully');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Connection failed';

          set({
            isConnected: false,
            isConnecting: false,
            connectionError: errorMessage
          });

          logger.error('VOICE_COACH', 'Connection error', { error });
        }
      },

      disconnect: async () => {
        const state = get();

        if (!state.isConnected) {
          return;
        }

        try {
          logger.info('VOICE_COACH', 'Disconnecting from Realtime API');

          // Terminer la conversation active si elle existe
          if (state.activeConversationId) {
            await get().endConversation();
          }

          set({
            isConnected: false,
            isConnecting: false,
            connectionError: null,
            voiceState: 'idle'
          });

          logger.info('VOICE_COACH', 'Disconnected successfully');
        } catch (error) {
          logger.error('VOICE_COACH', 'Disconnect error', { error });
        }
      },

      reconnect: async () => {
        logger.info('VOICE_COACH', 'Attempting reconnection');
        await get().disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await get().connect();
      },

      // Actions vocales
      startListening: async () => {
        const state = get();

        if (state.voiceState === 'listening') {
          return;
        }

        // Vérifier les permissions
        const hasPermission = await get().requestMicrophonePermission();
        if (!hasPermission) {
          set({ voiceState: 'error', connectionError: 'Microphone permission denied' });
          return;
        }

        // Connecter si nécessaire
        if (!state.isConnected) {
          await get().connect();
        }

        set({
          voiceState: 'listening',
          currentTranscription: '',
          isTranscribing: true
        });

        logger.info('VOICE_COACH', 'Started listening');
      },

      stopListening: () => {
        const state = get();

        if (state.voiceState !== 'listening') {
          return;
        }

        set({
          voiceState: 'processing',
          isTranscribing: false
        });

        logger.info('VOICE_COACH', 'Stopped listening');
      },

      sendVoiceMessage: async (audioData: Blob) => {
        const state = get();

        set({ voiceState: 'processing' });

        try {
          logger.info('VOICE_COACH', 'Sending voice message', {
            size: audioData.size,
            conversationId: state.activeConversationId
          });

          // Le traitement sera fait par le service
          // Pour l'instant, simuler une réponse
          await new Promise(resolve => setTimeout(resolve, 1000));

          set({ voiceState: 'speaking' });

          // Simuler la fin de la réponse
          setTimeout(() => {
            set({ voiceState: 'idle' });
          }, 2000);

        } catch (error) {
          logger.error('VOICE_COACH', 'Error sending voice message', { error });
          set({
            voiceState: 'error',
            connectionError: 'Failed to send voice message'
          });
        }
      },

      // Actions de conversation
      startConversation: async (mode: ChatMode) => {
        const conversationId = crypto.randomUUID();

        set({
          activeConversationId: conversationId,
          currentMode: mode,
          messages: [],
          voiceState: 'idle'
        });

        logger.info('VOICE_COACH', 'Conversation started', {
          conversationId,
          mode
        });
      },

      endConversation: async () => {
        const state = get();

        if (!state.activeConversationId) {
          return;
        }

        logger.info('VOICE_COACH', 'Ending conversation', {
          conversationId: state.activeConversationId,
          messageCount: state.messages.length
        });

        set({
          activeConversationId: null,
          messages: [],
          currentTranscription: '',
          voiceState: 'idle'
        });
      },

      addMessage: (message) => {
        const newMessage: VoiceMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date()
        };

        set((state) => ({
          messages: [...state.messages, newMessage]
        }));

        logger.debug('VOICE_COACH', 'Message added', {
          role: newMessage.role,
          messageId: newMessage.id
        });
      },

      clearMessages: () => {
        set({ messages: [] });
        logger.debug('VOICE_COACH', 'Messages cleared');
      },

      // Actions de transcription
      updateTranscription: (text: string) => {
        set({ currentTranscription: text });
      },

      finalizeTranscription: () => {
        const state = get();

        if (state.currentTranscription.trim()) {
          get().addMessage({
            role: 'user',
            content: state.currentTranscription
          });
        }

        set({
          currentTranscription: '',
          isTranscribing: false
        });
      },

      // Actions de visualisation
      updateVisualization: (data) => {
        set((state) => ({
          visualization: {
            ...state.visualization,
            ...data
          }
        }));
      },

      // Actions de préférences
      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...prefs
          }
        }));

        // Sauvegarder automatiquement
        get().savePreferences();
      },

      loadPreferences: async () => {
        try {
          // Chargement depuis Supabase sera implémenté
          logger.debug('VOICE_COACH', 'Loading preferences');
        } catch (error) {
          logger.error('VOICE_COACH', 'Error loading preferences', { error });
        }
      },

      savePreferences: async () => {
        try {
          // Sauvegarde dans Supabase sera implémentée
          const prefs = get().preferences;
          logger.debug('VOICE_COACH', 'Saving preferences', { prefs });
        } catch (error) {
          logger.error('VOICE_COACH', 'Error saving preferences', { error });
        }
      },

      // Actions de permission
      requestMicrophonePermission: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

          // Arrêter immédiatement le stream
          stream.getTracks().forEach(track => track.stop());

          set({ microphonePermission: 'granted' });
          logger.info('VOICE_COACH', 'Microphone permission granted');

          return true;
        } catch (error) {
          set({ microphonePermission: 'denied' });
          logger.error('VOICE_COACH', 'Microphone permission denied', { error });

          return false;
        }
      },

      checkMicrophonePermission: async () => {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });

          if (result.state === 'granted') {
            set({ microphonePermission: 'granted' });
          } else if (result.state === 'denied') {
            set({ microphonePermission: 'denied' });
          } else {
            set({ microphonePermission: 'prompt' });
          }

          logger.debug('VOICE_COACH', 'Microphone permission status', { state: result.state });
        } catch (error) {
          logger.debug('VOICE_COACH', 'Cannot check microphone permission', { error });
        }
      },

      // Actions UI
      openPanel: () => {
        set({ isPanelOpen: true, isPanelMinimized: false });
        logger.debug('VOICE_COACH', 'Panel opened');
      },

      closePanel: () => {
        set({ isPanelOpen: false });
        logger.debug('VOICE_COACH', 'Panel closed');
      },

      togglePanel: () => {
        const isOpen = get().isPanelOpen;
        set({ isPanelOpen: !isOpen, isPanelMinimized: false });
        logger.debug('VOICE_COACH', 'Panel toggled', { isOpen: !isOpen });
      },

      minimizePanel: () => {
        set({ isPanelMinimized: true });
        logger.debug('VOICE_COACH', 'Panel minimized');
      },

      maximizePanel: () => {
        set({ isPanelMinimized: false });
        logger.debug('VOICE_COACH', 'Panel maximized');
      },

      toggleTranscript: () => {
        const show = get().showTranscript;
        set({ showTranscript: !show });
        logger.debug('VOICE_COACH', 'Transcript toggled', { show: !show });
      },

      setCommunicationMode: (mode: CommunicationMode) => {
        set({ communicationMode: mode });
        logger.debug('VOICE_COACH', 'Communication mode changed', { mode });
      },

      toggleCommunicationMode: () => {
        const currentMode = get().communicationMode;
        const newMode: CommunicationMode = currentMode === 'voice' ? 'text' : 'voice';
        set({ communicationMode: newMode });
        logger.debug('VOICE_COACH', 'Communication mode toggled', { newMode });
      },

      // Actions d'état
      setVoiceState: (state: VoiceState) => {
        set({ voiceState: state });
        logger.debug('VOICE_COACH', 'Voice state changed', { state });
      },

      setMode: (mode: ChatMode) => {
        set({ currentMode: mode });
        logger.debug('VOICE_COACH', 'Mode changed', { mode });
      },

      setError: (error: string | null) => {
        set({ connectionError: error });
        if (error) {
          logger.error('VOICE_COACH', 'Error set', { error });
        }
      },

      setShowReadyPrompt: (show: boolean) => {
        set({ showReadyPrompt: show });
        logger.debug('VOICE_COACH', 'Ready prompt visibility changed', { show });
      }
    }),
    {
      name: 'voice-coach-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        showTranscript: state.showTranscript,
        isPanelMinimized: state.isPanelMinimized,
        communicationMode: state.communicationMode
      })
    }
  )
);
