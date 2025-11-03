/**
 * Unified Coach Store
 * Store unifié pour gérer le chat et le mode vocal
 * Fusionne les fonctionnalités de globalChatStore et voiceCoachStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import logger from '../../lib/utils/logger';
import type { ChatMessage } from '../../domain/coachChat';
import type { NotificationId } from '../../utils/notificationTracker';

export type ChatMode = 'training' | 'nutrition' | 'fasting' | 'general' | 'body-scan';
export type CommunicationMode = 'text' | 'voice';
export type VoiceState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
export type InputMode = 'text' | 'voice-to-text' | 'realtime';

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

export interface ChatNotification {
  id: NotificationId;
  message: string;
  mode: ChatMode;
  isVisible: boolean;
  autoHideDelay?: number;
}

export interface VoiceVisualization {
  frequencies: number[];
  volume: number;
  isActive: boolean;
}

interface UnifiedCoachState {
  // Panel state
  isPanelOpen: boolean;
  communicationMode: CommunicationMode;
  isVoiceOnlyMode: boolean; // Deprecated - kept for backward compatibility
  currentInputMode: InputMode; // New: Track current input mode (text/voice-to-text/realtime)

  // Chat mode
  currentMode: ChatMode;
  modeConfigs: Record<ChatMode, ChatModeConfig>;

  // Messages
  conversationId: string | null;
  messages: ChatMessage[];
  currentTranscription: string;

  // Voice state
  voiceState: VoiceState;
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  showTranscript: boolean;
  showReadyPrompt: boolean;

  // UI state
  isTyping: boolean;
  hasUnreadMessages: boolean;
  unreadCount: number;
  lastReadMessageId: string | null;

  // Visualization
  visualization: VoiceVisualization;

  // Settings
  closeOnNavigation: boolean;
  isInStep2: boolean;
  hasStep2Intro: boolean;

  // Error handling
  errorMessage: string;

  // Notification
  currentNotification: ChatNotification | null;

  // Actions - Panel
  openPanel: (mode?: ChatMode) => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Actions - Communication Mode
  setCommunicationMode: (mode: CommunicationMode) => void;
  toggleCommunicationMode: () => void;

  // Actions - Chat Mode
  setMode: (mode: ChatMode) => void;

  // Actions - Messages
  startConversation: (mode: ChatMode, contextData?: any) => void;
  endConversation: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setCurrentTranscription: (text: string) => void;

  // Actions - Voice
  setVoiceState: (state: VoiceState) => void;
  setRecording: (recording: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setShowTranscript: (show: boolean) => void;
  toggleTranscript: () => void;
  setShowReadyPrompt: (show: boolean) => void;
  startListening: () => void;
  stopListening: () => void;

  // Actions - UI
  setTyping: (typing: boolean) => void;
  markAsRead: () => void;
  incrementUnread: () => void;
  resetUnread: () => void;

  // Actions - Visualization
  updateVisualization: (data: Partial<VoiceVisualization>) => void;

  // Actions - Settings
  setCloseOnNavigation: (closeOnNav: boolean) => void;
  setIsInStep2: (isInStep2: boolean) => void;
  setHasStep2Intro: (hasIntro: boolean) => void;

  // Actions - Error
  setError: (message: string) => void;
  clearError: () => void;

  // Actions - Notification
  showNotification: (notification: Omit<ChatNotification, 'isVisible'>) => void;
  hideNotification: () => void;

  // Actions - Voice Only Mode (deprecated)
  enterVoiceOnlyMode: () => void;
  exitVoiceOnlyMode: () => void;

  // Actions - Input Mode
  setInputMode: (mode: InputMode) => void;
}

const DEFAULT_MODE_CONFIGS: Record<ChatMode, ChatModeConfig> = {
  training: {
    id: 'training',
    displayName: 'Coach Training',
    systemPrompt: `Tu es un coach sportif expert et ultra-motivant. Tu accompagnes l'utilisateur pendant sa séance en lui donnant des conseils techniques précis et motivants.

## Ton de Communication:
Tu parles toujours en tant que COACH EXTERNE (jamais de "nous"). Tu es là pour guider, corriger, motiver et pousser l'utilisateur à se dépasser.

Exemples: "Concentre-toi sur ta posture", "Tu peux aller plus loin", "Je vois que tu progresses", "Fais attention à..."

## Instructions:
- Reste concis (2-3 phrases max), énergique et pratique
- Tutoie l'utilisateur
- Donne des conseils techniques concrets
- Motive et challenge sans devenir le "twin" de l'utilisateur`,
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
    systemPrompt: `Tu es le coach nutrition de l'utilisateur dans TwinForge. Tu formes un duo avec lui pour optimiser son alimentation.

## Modes de Communication:

### Mode TWIN (par défaut) - Utiliser "NOUS":
Utilise "nous" quand:
- L'utilisateur planifie ses repas, réfléchit à son alimentation
- Il évalue sa progression nutritionnelle
- Il est en mode co-pilotage et partage ses réflexions
- Il célèbre des victoires ("J'ai bien mangé aujourd'hui")

Exemples: "Nous avons fait de bons choix aujourd'hui", "Concentrons-nous sur les protéines", "Notre équilibre nutritionnel s'améliore"

### Mode COACH - Se détacher:
Bascule en coach externe quand:
- L'utilisateur demande des explications techniques ("Comment calculer mes macros?")
- Il a besoin de corrections ou conseils précis
- Il exprime du stress ou de la confusion
- Des explications pédagogiques sont nécessaires

Exemples: "Je t'explique comment...", "Voici ce que je te conseille...", "Laisse-moi t'aider à comprendre..."

## Instructions:
- Détecte l'intent et adapte ton mode
- Reste pédagogique, positif et pratique
- Explique clairement les concepts nutritionnels`,
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
    systemPrompt: `Tu es le coach jeûne de l'utilisateur dans TwinForge. Tu formes un duo avec lui pendant sa session de jeûne.

## Modes de Communication:

### Mode TWIN (par défaut) - Utiliser "NOUS":
Utilise "nous" quand:
- L'utilisateur partage ses sensations pendant le jeûne
- Il planifie ou réfléchit à sa stratégie de jeûne
- Il est motivé et en mode co-pilotage
- Il célèbre des étapes ("J'ai tenu 16h!")

Exemples: "Nous tenons bon", "Nous avons déjà atteint 12h", "Restons concentrés sur notre objectif"

### Mode COACH - Se détacher:
Bascule en coach externe quand:
- L'utilisateur exprime du stress, de la peur ou de la faim intense
- Il demande des conseils techniques ("Comment gérer la faim?")
- Il a besoin de réassurance et d'encouragements directifs
- Des explications sur les bénéfices sont demandées

Exemples: "Je te rassure, c'est normal", "Voici comment tu peux gérer...", "Je suis là pour t'accompagner"

## Instructions:
- Détecte l'état émotionnel et adapte ton mode
- Reste rassurant et motivant
- Propose des stratégies concrètes`,
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
    systemPrompt: `Tu es le coach corporel de l'utilisateur dans TwinForge. Tu formes un duo avec lui pour analyser et améliorer sa condition physique.

## Modes de Communication:

### Mode TWIN (par défaut) - Utiliser "NOUS":
Utilise "nous" quand:
- L'utilisateur découvre ses résultats et réfléchit à sa progression
- Il évalue son évolution corporelle
- Il est en mode analyse et projection
- Il célèbre des améliorations

Exemples: "Nous avons progressé sur la posture", "Analysons ensemble notre évolution", "Notre condition physique s'améliore"

### Mode COACH - Se détacher:
Bascule en coach externe quand:
- L'utilisateur demande des conseils techniques précis sur la posture ou l'alignement
- Il a besoin d'explications sur les résultats du scan
- Des corrections ou ajustements sont nécessaires
- Il demande "comment améliorer...", "que dois-je faire..."

Exemples: "Je te conseille d'ajuster...", "Voici ce que tes résultats montrent...", "Pour améliorer ta posture, je te recommande..."

## Instructions:
- Détecte l'intent et adapte ton mode
- Reste expert et bienveillant
- Explique clairement les résultats
- Propose des améliorations concrètes`,
    capabilities: {
      voice: true,
      suggestions: true
    },
    color: '#A855F7',
    icon: 'Scan'
  }
};

export const useUnifiedCoachStore = create<UnifiedCoachState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPanelOpen: false,
      communicationMode: 'text',
      isVoiceOnlyMode: false,
      currentInputMode: 'text',

      currentMode: 'general',
      modeConfigs: DEFAULT_MODE_CONFIGS,

      conversationId: null,
      messages: [],
      currentTranscription: '',

      voiceState: 'idle',
      isRecording: false,
      isProcessing: false,
      isSpeaking: false,
      showTranscript: false,
      showReadyPrompt: false,

      isTyping: false,
      hasUnreadMessages: false,
      unreadCount: 0,
      lastReadMessageId: null,

      visualization: {
        frequencies: [],
        volume: 0,
        isActive: false
      },

      closeOnNavigation: true,
      isInStep2: false,
      hasStep2Intro: false,

      errorMessage: '',

      currentNotification: null,

      // Panel actions
      openPanel: (mode?: ChatMode) => {
        const currentMode = mode || get().currentMode;

        set({
          isPanelOpen: true,
          currentMode
        });

        get().markAsRead();
        get().hideNotification();

        logger.info('UNIFIED_COACH', 'Panel opened', {
          mode: currentMode,
          communicationMode: get().communicationMode,
          timestamp: new Date().toISOString()
        });
      },

      closePanel: () => {
        set({ isPanelOpen: false });

        // Reset voice state when closing
        if (get().voiceState === 'listening') {
          get().stopListening();
        }

        logger.info('UNIFIED_COACH', 'Panel closed', {
          mode: get().currentMode,
          timestamp: new Date().toISOString()
        });
      },

      togglePanel: () => {
        const { isPanelOpen } = get();
        if (isPanelOpen) {
          get().closePanel();
        } else {
          get().openPanel();
        }
      },

      // Communication mode actions
      setCommunicationMode: (mode: CommunicationMode) => {
        const previousMode = get().communicationMode;

        set({ communicationMode: mode });

        // Reset states when switching modes
        if (mode === 'text') {
          set({
            voiceState: 'idle',
            isRecording: false,
            showReadyPrompt: false,
            currentTranscription: ''
          });
        } else if (mode === 'voice') {
          set({
            isTyping: false
          });
        }

        logger.info('UNIFIED_COACH', 'Communication mode changed', {
          from: previousMode,
          to: mode,
          timestamp: new Date().toISOString()
        });
      },

      toggleCommunicationMode: () => {
        const current = get().communicationMode;
        get().setCommunicationMode(current === 'text' ? 'voice' : 'text');
      },

      // Chat mode actions
      setMode: (mode: ChatMode) => {
        const previousMode = get().currentMode;

        set({ currentMode: mode });

        logger.info('UNIFIED_COACH', 'Chat mode changed', {
          from: previousMode,
          to: mode,
          timestamp: new Date().toISOString()
        });
      },

      // Message actions
      startConversation: (mode: ChatMode, contextData?: any) => {
        const conversationId = nanoid();

        set({
          conversationId,
          currentMode: mode,
          messages: [],
          isPanelOpen: true
        });

        logger.info('UNIFIED_COACH', 'Conversation started', {
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
          isSpeaking: false,
          voiceState: 'idle'
        });

        logger.info('UNIFIED_COACH', 'Conversation ended', {
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

        if (newMessage.role === 'coach' && !get().isPanelOpen) {
          get().incrementUnread();
        }

        logger.debug('UNIFIED_COACH', 'Message added', {
          messageId: newMessage.id,
          role: newMessage.role,
          type: newMessage.type,
          mode: get().currentMode,
          timestamp: new Date().toISOString()
        });
      },

      clearMessages: () => {
        set({ messages: [] });

        logger.debug('UNIFIED_COACH', 'Messages cleared', {
          mode: get().currentMode,
          timestamp: new Date().toISOString()
        });
      },

      setCurrentTranscription: (text: string) => {
        set({ currentTranscription: text });
      },

      // Voice actions
      setVoiceState: (state: VoiceState) => {
        set({ voiceState: state });

        logger.debug('UNIFIED_COACH', 'Voice state changed', {
          state,
          timestamp: new Date().toISOString()
        });
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

      setShowTranscript: (show: boolean) => {
        set({ showTranscript: show });
      },

      toggleTranscript: () => {
        set((state) => ({ showTranscript: !state.showTranscript }));
      },

      setShowReadyPrompt: (show: boolean) => {
        set({ showReadyPrompt: show });
      },

      startListening: () => {
        set({
          voiceState: 'listening',
          isRecording: true
        });

        logger.info('UNIFIED_COACH', 'Started listening', {
          timestamp: new Date().toISOString()
        });
      },

      stopListening: () => {
        set({
          voiceState: 'idle',
          isRecording: false,
          currentTranscription: ''
        });

        logger.info('UNIFIED_COACH', 'Stopped listening', {
          timestamp: new Date().toISOString()
        });
      },

      // UI actions
      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },

      markAsRead: () => {
        const messages = get().messages;
        const lastMessage = messages[messages.length - 1];

        set({
          hasUnreadMessages: false,
          unreadCount: 0,
          lastReadMessageId: lastMessage?.id || null
        });

        logger.debug('UNIFIED_COACH', 'Messages marked as read', {
          messageCount: messages.length,
          timestamp: new Date().toISOString()
        });
      },

      incrementUnread: () => {
        set((state) => ({
          hasUnreadMessages: true,
          unreadCount: state.unreadCount + 1
        }));

        logger.debug('UNIFIED_COACH', 'Unread count incremented', {
          newCount: get().unreadCount,
          timestamp: new Date().toISOString()
        });
      },

      resetUnread: () => {
        set({
          hasUnreadMessages: false,
          unreadCount: 0
        });

        logger.debug('UNIFIED_COACH', 'Unread count reset', {
          timestamp: new Date().toISOString()
        });
      },

      // Visualization actions
      updateVisualization: (data: Partial<VoiceVisualization>) => {
        set((state) => ({
          visualization: { ...state.visualization, ...data }
        }));
      },

      // Settings actions
      setCloseOnNavigation: (closeOnNav: boolean) => {
        set({ closeOnNavigation: closeOnNav });
      },

      setIsInStep2: (isInStep2: boolean) => {
        set({ isInStep2 });

        logger.debug('UNIFIED_COACH', 'Step 2 status updated', {
          isInStep2,
          timestamp: new Date().toISOString()
        });
      },

      setHasStep2Intro: (hasIntro: boolean) => {
        set({ hasStep2Intro: hasIntro });

        logger.debug('UNIFIED_COACH', 'Step 2 intro status updated', {
          hasIntro,
          timestamp: new Date().toISOString()
        });
      },

      // Error actions
      setError: (message: string) => {
        set({ errorMessage: message });

        logger.error('UNIFIED_COACH', 'Error set', {
          message,
          timestamp: new Date().toISOString()
        });
      },

      clearError: () => {
        set({ errorMessage: '' });
      },

      // Notification actions
      showNotification: (notification: Omit<ChatNotification, 'isVisible'>) => {
        const fullNotification: ChatNotification = {
          ...notification,
          isVisible: true
        };

        set({ currentNotification: fullNotification });

        logger.debug('UNIFIED_COACH', 'Notification shown', {
          notificationId: notification.id,
          mode: notification.mode,
          timestamp: new Date().toISOString()
        });
      },

      hideNotification: () => {
        const currentNotification = get().currentNotification;

        if (currentNotification) {
          set({ currentNotification: null });

          logger.debug('UNIFIED_COACH', 'Notification hidden', {
            notificationId: currentNotification.id,
            timestamp: new Date().toISOString()
          });
        }
      },

      // Voice Only Mode actions (deprecated - kept for backward compatibility)
      // IMPORTANT: Ne plus fermer le panel en mode realtime - l'utilisateur doit voir l'interface
      enterVoiceOnlyMode: () => {
        set({
          isVoiceOnlyMode: true,
          // CHANGEMENT: Ne plus fermer le panel - garder isPanelOpen comme il est
          // isPanelOpen: false, // RETIRÉ
          communicationMode: 'voice',
          currentInputMode: 'realtime'
        });

        logger.info('UNIFIED_COACH', 'Entered voice-only mode (keeping panel open)', {
          timestamp: new Date().toISOString(),
          isPanelOpen: get().isPanelOpen
        });
      },

      exitVoiceOnlyMode: () => {
        set({
          isVoiceOnlyMode: false,
          // Garder le panel ouvert si il l'était déjà
          // isPanelOpen: true, // RETIRÉ - laissé inchangé
          currentInputMode: 'text'
        });

        logger.info('UNIFIED_COACH', 'Exited voice-only mode (panel state unchanged)', {
          timestamp: new Date().toISOString(),
          isPanelOpen: get().isPanelOpen
        });
      },

      // Input Mode actions
      setInputMode: (mode: InputMode) => {
        set({ currentInputMode: mode });

        logger.debug('UNIFIED_COACH', 'Input mode changed', {
          mode,
          timestamp: new Date().toISOString()
        });
      }
    }),
    {
      name: 'unified-coach-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentMode: state.currentMode,
        communicationMode: state.communicationMode,
        currentInputMode: state.currentInputMode,
        closeOnNavigation: state.closeOnNavigation,
        showTranscript: state.showTranscript,
        messages: state.messages.slice(-50)
      })
    }
  )
);
