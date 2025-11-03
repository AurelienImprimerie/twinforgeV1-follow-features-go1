/**
 * Global Chat Store
 * DEPRECATED: Use unifiedCoachStore instead
 * This store is now a proxy/adapter to unifiedCoachStore for backward compatibility
 *
 * @deprecated Use useUnifiedCoachStore from './unifiedCoachStore' instead
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import logger from '../../lib/utils/logger';
import type { ChatMessage } from '../../domain/coachChat';
import type { ChatState } from './chatStateMachine';
import { initialChatState } from './chatStateMachine';
import type { NotificationId } from '../services/unifiedNotificationService';
import { useOverlayStore } from './overlayStore';
import { useUnifiedCoachStore } from './unifiedCoachStore';

export type ChatMode = 'training' | 'nutrition' | 'fasting' | 'general' | 'body-scan';

export interface ChatModeConfig {
  id: ChatMode;
  displayName: string;
  systemPrompt: string;
  capabilities: {
    voice?: boolean;
    suggestions?: boolean;
    exerciseFeedback?: boolean;
    mealAnalysis?: boolean;
    fastingTips?: boolean;
    navigation?: boolean;
  };
  color: string;
  icon: string;
}

export interface ChatPosition {
  side: 'right' | 'left';
  width: number;
  isMinimized: boolean;
}

export interface ChatNotification {
  id: NotificationId;
  message: string;
  mode: ChatMode;
  isVisible: boolean;
  autoHideDelay?: number;
}

interface GlobalChatState {
  isOpen: boolean;
  currentMode: ChatMode;
  position: ChatPosition;

  conversationId: string | null;
  messages: ChatMessage[];

  isTyping: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;

  autoOpenOnRoute: boolean;
  closeOnNavigation: boolean;

  hasUnreadMessages: boolean;
  unreadCount: number;
  lastReadMessageId: string | null;

  modeConfigs: Record<ChatMode, ChatModeConfig>;

  chatState: ChatState;
  isInStep2: boolean;
  hasStep2Intro: boolean;

  currentNotification: ChatNotification | null;

  open: (mode?: ChatMode) => void;
  close: () => void;
  toggle: () => void;

  setMode: (mode: ChatMode) => void;
  setPosition: (position: Partial<ChatPosition>) => void;

  startConversation: (mode: ChatMode, contextData?: any) => void;
  endConversation: () => void;

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  setTyping: (typing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setSpeaking: (speaking: boolean) => void;

  setAutoOpenOnRoute: (autoOpen: boolean) => void;
  setCloseOnNavigation: (closeOnNav: boolean) => void;

  markAsRead: () => void;
  incrementUnread: () => void;
  resetUnread: () => void;

  setChatState: (state: ChatState) => void;
  setIsInStep2: (isInStep2: boolean) => void;
  setHasStep2Intro: (hasIntro: boolean) => void;

  showNotification: (notification: Omit<ChatNotification, 'isVisible'>) => void;
  hideNotification: () => void;
}

const DEFAULT_MODE_CONFIGS: Record<ChatMode, ChatModeConfig> = {
  training: {
    id: 'training',
    displayName: 'Coach Training',
    systemPrompt: 'Tu es un coach sportif expert et ultra-motivant. Accompagne l\'utilisateur pendant sa séance avec des conseils techniques précis et motivants. Reste concis (2-3 phrases max), énergique et pratique. Tutoie l\'utilisateur.',
    capabilities: {
      voice: true,
      suggestions: true,
      exerciseFeedback: true
    },
    color: '#FF6B35',
    icon: 'Dumbbell'
  },
  nutrition: {
    id: 'nutrition',
    displayName: 'Coach Nutrition',
    systemPrompt: 'Tu es un nutritionniste expert et bienveillant. Aide l\'utilisateur à analyser ses repas et optimiser ses choix alimentaires. Reste pédagogue, positif et donne des conseils pratiques applicables. Explique clairement les concepts nutritionnels.',
    capabilities: {
      voice: true,
      suggestions: true,
      mealAnalysis: true
    },
    color: '#10B981',
    icon: 'Utensils'
  },
  fasting: {
    id: 'fasting',
    displayName: 'Coach Jeûne',
    systemPrompt: 'Tu es un expert du jeûne intermittent. Accompagne l\'utilisateur pendant sa session de jeûne avec encouragement et compréhension. Donne des astuces pour gérer la faim et explique les bénéfices. Reste rassurant et motivant.',
    capabilities: {
      voice: true,
      suggestions: true,
      fastingTips: true
    },
    color: '#F59E0B',
    icon: 'Timer'
  },
  general: {
    id: 'general',
    displayName: 'TwinCoach',
    systemPrompt: `Tu es TwinCoach, le compagnon de progression de l'utilisateur dans TwinForge. Tu formes un duo avec lui pour atteindre ses objectifs wellness.

## Modes de Communication:

### Mode TWIN (par défaut) - Utiliser "NOUS":
Utilise la première personne du pluriel quand:
- L'utilisateur planifie, réfléchit, évalue sa progression
- Il célèbre des victoires ou partage des réflexions
- Il est motivé et en mode co-pilotage
- Il parle d'objectifs communs ou d'actions quotidiennes

Exemples: "Nous avons bien progressé aujourd'hui", "Nous devons nous concentrer sur...", "Regardons ensemble notre évolution"

### Mode COACH - Se détacher du "NOUS":
Bascule en coach externe quand:
- L'utilisateur demande explicitement des explications, corrections ou conseils techniques
- Il exprime du stress, de la peur ou a besoin de réassurance
- Il demande "comment faire", "explique-moi", "corrige-moi"
- Des conseils objectifs et directifs sont nécessaires

Exemples: "Je te conseille de...", "Voici comment tu peux...", "Je suis là pour te guider"

## Instructions:
- Détecte automatiquement l'intent et le sentiment de l'utilisateur
- Transitions naturelles entre les deux modes
- Reste amical, clair et proactif
- Guide vers les bonnes fonctionnalités de l'app`,
    capabilities: {
      voice: true,
      suggestions: true,
      navigation: true
    },
    color: '#18E3FF',
    icon: 'MessageSquare'
  },
  'body-scan': {
    id: 'body-scan',
    displayName: 'Coach Corps',
    systemPrompt: 'Tu es un expert en analyse corporelle et posture. Guide l\'utilisateur dans son scan corporel avec expertise et bienveillance. Donne des conseils pratiques sur la posture et l\'alignement.',
    capabilities: {
      voice: true,
      suggestions: true
    },
    color: '#A855F7',
    icon: 'Scan'
  }
};

export const useGlobalChatStore = create<GlobalChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      currentMode: 'general',
      position: {
        side: 'right',
        width: 420,
        isMinimized: false
      },

      conversationId: null,
      messages: [],

      isTyping: false,
      isRecording: false,
      isProcessing: false,
      isSpeaking: false,

      autoOpenOnRoute: false,
      closeOnNavigation: true,

      hasUnreadMessages: false,
      unreadCount: 0,
      lastReadMessageId: null,

      modeConfigs: DEFAULT_MODE_CONFIGS,

      chatState: initialChatState,
      isInStep2: false,
      hasStep2Intro: false,

      currentNotification: null,

      open: (mode?: ChatMode) => {
        const currentMode = mode || get().currentMode;

        // Ouvrir le chat via l'overlayStore (qui gère automatiquement la fermeture des autres)
        const overlayStore = useOverlayStore.getState();
        overlayStore.open('chatDrawer');

        set({
          isOpen: true,
          currentMode
        });

        get().markAsRead();
        get().hideNotification();

        logger.info('GLOBAL_CHAT', 'Chat opened', {
          mode: currentMode,
          timestamp: new Date().toISOString()
        });
      },

      close: () => {
        set({ isOpen: false });

        // Close overlay if chat is active
        const overlayStore = useOverlayStore.getState();
        if (overlayStore.activeOverlayId === 'chatDrawer') {
          overlayStore.close();
        }

        logger.info('GLOBAL_CHAT', 'Chat closed', {
          mode: get().currentMode,
          timestamp: new Date().toISOString()
        });
      },

      toggle: () => {
        const { isOpen } = get();
        if (isOpen) {
          get().close();
        } else {
          get().open();
        }
      },

      setMode: (mode: ChatMode) => {
        const previousMode = get().currentMode;

        set({ currentMode: mode });

        logger.info('GLOBAL_CHAT', 'Mode changed', {
          from: previousMode,
          to: mode,
          timestamp: new Date().toISOString()
        });
      },

      setPosition: (position: Partial<ChatPosition>) => {
        set((state) => ({
          position: { ...state.position, ...position }
        }));
      },

      startConversation: (mode: ChatMode, contextData?: any) => {
        const conversationId = nanoid();

        set({
          conversationId,
          currentMode: mode,
          messages: [],
          isOpen: true
        });

        logger.info('GLOBAL_CHAT', 'Conversation started', {
          conversationId,
          mode,
          hasContextData: !!contextData,
          timestamp: new Date().toISOString()
        });
      },

      endConversation: () => {
        const { conversationId, currentMode } = get();

        set({
          conversationId: null,
          isTyping: false,
          isRecording: false,
          isProcessing: false,
          isSpeaking: false
        });

        logger.info('GLOBAL_CHAT', 'Conversation ended', {
          conversationId,
          mode: currentMode,
          messageCount: get().messages.length,
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

        if (newMessage.role === 'coach' && !get().isOpen) {
          get().incrementUnread();
        }

        logger.debug('GLOBAL_CHAT', 'Message added', {
          messageId: newMessage.id,
          role: newMessage.role,
          type: newMessage.type,
          mode: get().currentMode,
          timestamp: new Date().toISOString()
        });
      },

      clearMessages: () => {
        set({ messages: [] });

        logger.debug('GLOBAL_CHAT', 'Messages cleared', {
          mode: get().currentMode,
          timestamp: new Date().toISOString()
        });
      },

      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
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

      setAutoOpenOnRoute: (autoOpen: boolean) => {
        set({ autoOpenOnRoute: autoOpen });
      },

      setCloseOnNavigation: (closeOnNav: boolean) => {
        set({ closeOnNavigation: closeOnNav });
      },

      markAsRead: () => {
        const messages = get().messages;
        const lastMessage = messages[messages.length - 1];

        set({
          hasUnreadMessages: false,
          unreadCount: 0,
          lastReadMessageId: lastMessage?.id || null
        });

        logger.debug('GLOBAL_CHAT', 'Messages marked as read', {
          messageCount: messages.length,
          timestamp: new Date().toISOString()
        });
      },

      incrementUnread: () => {
        set((state) => ({
          hasUnreadMessages: true,
          unreadCount: state.unreadCount + 1
        }));

        logger.debug('GLOBAL_CHAT', 'Unread count incremented', {
          newCount: get().unreadCount,
          timestamp: new Date().toISOString()
        });
      },

      resetUnread: () => {
        set({
          hasUnreadMessages: false,
          unreadCount: 0
        });

        logger.debug('GLOBAL_CHAT', 'Unread count reset', {
          timestamp: new Date().toISOString()
        });
      },

      setChatState: (state: ChatState) => {
        set({ chatState: state });

        logger.debug('GLOBAL_CHAT', 'Chat state updated', {
          stateType: state.type,
          timestamp: new Date().toISOString()
        });
      },

      setIsInStep2: (isInStep2: boolean) => {
        set({ isInStep2 });

        logger.debug('GLOBAL_CHAT', 'Step 2 status updated', {
          isInStep2,
          timestamp: new Date().toISOString()
        });
      },

      setHasStep2Intro: (hasIntro: boolean) => {
        set({ hasStep2Intro: hasIntro });

        logger.debug('GLOBAL_CHAT', 'Step 2 intro status updated', {
          hasIntro,
          timestamp: new Date().toISOString()
        });
      },

      showNotification: (notification: Omit<ChatNotification, 'isVisible'>) => {
        const fullNotification: ChatNotification = {
          ...notification,
          isVisible: true
        };

        set({ currentNotification: fullNotification });

        logger.debug('GLOBAL_CHAT', 'Notification shown', {
          notificationId: notification.id,
          mode: notification.mode,
          timestamp: new Date().toISOString()
        });
      },

      hideNotification: () => {
        const currentNotification = get().currentNotification;

        if (currentNotification) {
          set({ currentNotification: null });

          logger.debug('GLOBAL_CHAT', 'Notification hidden', {
            notificationId: currentNotification.id,
            timestamp: new Date().toISOString()
          });
        }
      }
    }),
    {
      name: 'global-chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentMode: state.currentMode,
        position: state.position,
        closeOnNavigation: state.closeOnNavigation,
        messages: state.messages.slice(-50)
      })
    }
  )
);
