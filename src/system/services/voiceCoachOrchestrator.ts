/**
 * Voice Coach Orchestrator - WebRTC Edition
 * Service central qui coordonne le système vocal WebRTC
 * Architecture simplifiée : audio géré automatiquement par WebRTC
 * Se concentre sur la gestion des événements et des transcriptions
 */

import logger from '../../lib/utils/logger';
import { useUnifiedCoachStore } from '../store/unifiedCoachStore';
import type { VoiceState } from '../store/unifiedCoachStore';
import { openaiRealtimeService } from './openaiRealtimeService';
import { useUserStore } from '../store/userStore';

class VoiceCoachOrchestrator {
  private isInitialized = false;
  private currentCoachMessage = ''; // Accumulation de la transcription du coach

  /**
   * Initialiser l'orchestrateur
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.debug('VOICE_ORCHESTRATOR', 'Already initialized');
      return;
    }

    try {
      logger.info('VOICE_ORCHESTRATOR', 'Initializing voice coach orchestrator (WebRTC mode)');

      // Vérifier la configuration Supabase
      logger.debug('VOICE_ORCHESTRATOR', 'Checking Supabase configuration');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        logger.error('VOICE_ORCHESTRATOR', 'Supabase configuration missing');
        throw new Error('Supabase configuration missing');
      }

      logger.debug('VOICE_ORCHESTRATOR', 'Supabase configuration OK, setting up handlers');

      // Setup event handlers pour l'API Realtime WebRTC
      logger.debug('VOICE_ORCHESTRATOR', 'Setting up Realtime handlers');
      this.setupRealtimeHandlers();

      this.isInitialized = true;

      logger.info('VOICE_ORCHESTRATOR', 'Voice coach orchestrator initialized successfully (WebRTC mode)');
    } catch (error) {
      logger.error('VOICE_ORCHESTRATOR', 'Initialization failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Démarrer une session vocale
   */
  async startVoiceSession(mode: string): Promise<void> {
    const store = useUnifiedCoachStore.getState();

    try {
      logger.info('VOICE_ORCHESTRATOR', '🚀 Starting voice session (WebRTC)', { mode });

      // Vérifier l'état actuel
      if (store.voiceState === 'listening' || store.voiceState === 'speaking') {
        logger.warn('VOICE_ORCHESTRATOR', 'Session already active');
        return;
      }

      // Passer en état connecting
      logger.info('VOICE_ORCHESTRATOR', '📡 Setting voice state to connecting');
      store.setVoiceState('connecting');

      // Run diagnostics first to identify issues early
      logger.info('VOICE_ORCHESTRATOR', '🔬 Running pre-connection diagnostics');
      const { VoiceConnectionDiagnostics } = await import('./voiceConnectionDiagnostics');
      const diagnostics = new VoiceConnectionDiagnostics();
      const results = await diagnostics.runAllTests();

      const failedTests = results.filter(r => !r.passed);
      if (failedTests.length > 0) {
        logger.error('VOICE_ORCHESTRATOR', '❌ Diagnostics failed', {
          failedTests: failedTests.map(t => ({ test: t.test, message: t.message }))
        });

        // Show detailed error to user
        const errorMessages = failedTests.map(t => `• ${t.test}: ${t.message}`).join('\n');
        throw new Error(`Voice connection prerequisites failed:\n\n${errorMessages}\n\nPlease check the console for detailed diagnostics.`);
      }

      logger.info('VOICE_ORCHESTRATOR', '✅ All diagnostics passed');

      // Récupérer le prénom de l'utilisateur
      const userProfile = useUserStore.getState().profile;
      const firstName = userProfile?.displayName || 'champion';

      // Récupérer la configuration du mode depuis unifiedCoachStore
      const modeConfig = store.modeConfigs[mode as any];

      if (!modeConfig) {
        throw new Error(`Invalid mode: ${mode}`);
      }

      // Enrichir le system prompt avec le prénom de l'utilisateur
      const personalizedSystemPrompt = `${modeConfig.systemPrompt}\n\nIMPORTANT: L'utilisateur s'appelle ${firstName}. Adresse-toi à lui par son prénom pour créer une relation plus chaleureuse et personnelle.`;

      logger.info('VOICE_ORCHESTRATOR', '👤 Personalized system prompt', { firstName, mode });

      // Connexion à l'API Realtime WebRTC via l'interface unifiée
      // Note: La demande de permissions micro est faite automatiquement par openaiRealtimeService
      logger.info('VOICE_ORCHESTRATOR', '🌐 Connecting to Realtime API via WebRTC');

      // La configuration est passée directement lors de la connexion (instructions)
      await openaiRealtimeService.connect({
        model: 'gpt-realtime-mini', // Updated to cost-efficient realtime model
        voice: 'alloy',
        temperature: 0.8,
        maxTokens: 4096,
        instructions: personalizedSystemPrompt // System prompt personnalisé avec le prénom
      });
      logger.info('VOICE_ORCHESTRATOR', '✅ Realtime API WebRTC connected successfully');

      // CRITIQUE: Configurer la session pour activer la détection vocale et les réponses
      // Le data channel est maintenant garanti d'être ouvert, donc cette configuration sera envoyée avec succès
      logger.info('VOICE_ORCHESTRATOR', '⚙️ Configuring session with VAD and transcription');
      await openaiRealtimeService.configureSession(personalizedSystemPrompt, mode as any);
      logger.info('VOICE_ORCHESTRATOR', '✅ Session configuration confirmed by server');

      // Logger les diagnostics de connexion
      const connectionDiagnostics = openaiRealtimeService.getConnectionDiagnostics();
      logger.info('VOICE_ORCHESTRATOR', '🔍 Connection diagnostics after configuration:', connectionDiagnostics);

      if (!connectionDiagnostics.audioInputActive) {
        logger.warn('VOICE_ORCHESTRATOR', '⚠️ Audio input may not be active - user speech detection might not work');
      }

      // Démarrer une conversation dans le store
      logger.info('VOICE_ORCHESTRATOR', '💬 Starting conversation in store');
      store.startConversation(mode as any);

      // IMPORTANT: Mettre à jour le mode de communication sans fermer le panel
      // L'utilisateur doit rester dans la fenêtre de chat pour voir la conversation
      logger.info('VOICE_ORCHESTRATOR', '🎙️ Setting communication mode to voice (realtime)');
      store.setCommunicationMode('voice');
      store.setInputMode('realtime');

      // Le prénom a déjà été récupéré plus haut

      // Construire le message de bienvenue personnalisé selon le mode
      const modeWelcomeMessages: Record<string, string> = {
        training: `Salut ${firstName}! Je suis ton coach sportif personnel. Prêt à donner le meilleur de toi-même aujourd'hui?`,
        nutrition: `Salut ${firstName}! Nous voilà prêts à optimiser notre alimentation. Qu'est-ce que nous allons travailler aujourd'hui?`,
        fasting: `Salut ${firstName}! Nous commençons une nouvelle session de jeûne ensemble. Comment nous sentons-nous?`,
        general: `Salut ${firstName}! Nous sommes TwinCoach, ton compagnon de progression. Qu'est-ce que nous allons accomplir aujourd'hui?`,
        'body-scan': `Salut ${firstName}! Regardons ensemble notre évolution corporelle. Prêt à découvrir nos progrès?`
      };

      const welcomeMessage = modeWelcomeMessages[mode] || `Bonjour ${firstName}! Nous sommes là pour t'accompagner. Que souhaitons-nous faire aujourd'hui?`;

      // Envoyer le message de bienvenue personnalisé automatique pour démarrer la conversation
      logger.info('VOICE_ORCHESTRATOR', '👋 Triggering personalized welcome message from coach', { firstName, mode });
      openaiRealtimeService.sendTextMessage(welcomeMessage);

      // Note: Avec WebRTC, l'audio est géré automatiquement via les tracks
      // Pas besoin de démarrer manuellement l'enregistrement

      // Passer en état listening
      logger.info('VOICE_ORCHESTRATOR', '👂 Setting voice state to listening');
      store.setVoiceState('listening');

      logger.info('VOICE_ORCHESTRATOR', '✅✅✅ Voice session started successfully - STATE = LISTENING ✅✅✅');
    } catch (error) {
      logger.error('VOICE_ORCHESTRATOR', 'Failed to start voice session', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      logger.error('VOICE_ORCHESTRATOR', '❌ CRITICAL: Voice session failed to start');
      store.setVoiceState('error');

      // Message d'erreur détaillé
      let errorMessage = 'Failed to start voice session';
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Microphone permission required';
        } else if (error.message.includes('connect') || error.message.includes('WebRTC')) {
          errorMessage = 'Unable to connect to voice service';
        } else {
          errorMessage = error.message;
        }
      }

      logger.error('VOICE_ORCHESTRATOR', '💥 Error message for user', { errorMessage });
      store.setError(errorMessage);

      throw error;
    }
  }

  /**
   * Arrêter la session vocale
   */
  async stopVoiceSession(): Promise<void> {
    try {
      logger.info('VOICE_ORCHESTRATOR', 'Stopping voice session');

      // Déconnecter de l'API (qui nettoiera automatiquement l'audio WebRTC)
      openaiRealtimeService.disconnect();

      // Terminer la conversation
      const store = useUnifiedCoachStore.getState();
      store.endConversation();

      // Reset état
      store.setVoiceState('idle');

      // NOTE: Ne pas sortir du mode voice-only ici
      // C'est fait par exitVoiceOnlyMode() dans VoiceSessionMinimal
      // qui ouvre automatiquement le chat avec l'historique

      logger.info('VOICE_ORCHESTRATOR', 'Voice session stopped');
    } catch (error) {
      logger.error('VOICE_ORCHESTRATOR', 'Error stopping voice session', { error });
    }
  }

  /**
   * Setup des handlers pour l'API Realtime
   */
  private setupRealtimeHandlers(): void {
    // Handler pour les messages reçus
    openaiRealtimeService.onMessage((message) => {
      this.handleRealtimeMessage(message);
    });

    // Handler pour les erreurs
    openaiRealtimeService.onError((error) => {
      logger.error('VOICE_ORCHESTRATOR', '❌ Realtime API error', { error: error.message, stack: error.stack });

      const store = useUnifiedCoachStore.getState();
      store.setVoiceState('error');
      store.setError(error.message);
    });

    // Handler pour la connexion
    openaiRealtimeService.onConnect(() => {
      logger.info('VOICE_ORCHESTRATOR', '✅ Realtime API WebRTC connected successfully');
    });

    // Handler pour la déconnexion
    openaiRealtimeService.onDisconnect(() => {
      logger.info('VOICE_ORCHESTRATOR', '🔌 Realtime API disconnected');
    });
  }

  // Avec WebRTC, plus besoin de gérer manuellement l'audio
  // Tout est automatique via les tracks WebRTC

  /**
   * Traiter les messages de l'API Realtime
   */
  private handleRealtimeMessage(message: any): void {
    const store = useUnifiedCoachStore.getState();

    // Logger TOUS les messages pour diagnostic
    logger.info('VOICE_ORCHESTRATOR', `📨 Received Realtime message: ${message.type}`, {
      type: message.type,
      hasContent: !!message.delta || !!message.transcript,
      hasDelta: !!message.delta,
      hasTranscript: !!message.transcript,
      hasAudio: !!message.audio,
      fullMessage: message
    });

    switch (message.type) {
      // Détection du début de parole de l'utilisateur
      case 'input_audio_buffer.speech_started':
        logger.info('VOICE_ORCHESTRATOR', '🎤 User started speaking - VAD detected speech');
        store.setVoiceState('processing');
        store.setProcessing(true);
        break;

      // Détection de la fin de parole de l'utilisateur
      case 'input_audio_buffer.speech_stopped':
        logger.info('VOICE_ORCHESTRATOR', '🔇 User stopped speaking - VAD detected silence');
        // L'état sera mis à jour quand la transcription arrive
        break;

      // Transcription de l'utilisateur en cours (delta)
      case 'conversation.item.input_audio_transcription.delta':
        if (message.delta) {
          logger.info('VOICE_ORCHESTRATOR', '📝 User transcription delta', { delta: message.delta });
          store.setCurrentTranscription(store.currentTranscription + message.delta);
        }
        break;

      // Transcription de l'utilisateur complète
      case 'conversation.item.input_audio_transcription.completed':
        if (message.transcript) {
          logger.info('VOICE_ORCHESTRATOR', '✅ User transcription completed', { transcript: message.transcript });
          store.setCurrentTranscription(message.transcript);

          // Ajouter le message utilisateur
          store.addMessage({
            role: 'user',
            content: message.transcript
          });

          // Réinitialiser la transcription courante
          store.setCurrentTranscription('');
        }
        break;

      // Item de conversation créé (pour tracker les messages)
      case 'conversation.item.created':
        logger.info('VOICE_ORCHESTRATOR', '📋 Conversation item created', {
          itemId: message.item?.id,
          itemType: message.item?.type,
          itemRole: message.item?.role
        });
        break;

      // Début de réponse du coach (audio)
      case 'response.audio.delta':
        // Avec WebRTC, l'audio est joué automatiquement
        // On se contente de mettre à jour l'état
        if (store.voiceState !== 'speaking') {
          logger.info('VOICE_ORCHESTRATOR', '🔊 Coach speaking via WebRTC, setting state to speaking');
          store.setVoiceState('speaking');
          store.setSpeaking(true);
        }
        break;

      // Transcription de la réponse du coach (delta)
      case 'response.audio_transcript.delta':
        if (message.delta) {
          logger.info('VOICE_ORCHESTRATOR', '💬 Coach transcript delta', { delta: message.delta.substring(0, 50) });
          this.currentCoachMessage += message.delta;

          // Mettre à jour le dernier message ou en créer un nouveau
          const messages = store.messages;
          const lastMessage = messages[messages.length - 1];

          if (lastMessage && lastMessage.role === 'coach') {
            // Mettre à jour via le store (Zustand handle l'immutabilité)
            logger.debug('VOICE_ORCHESTRATOR', '🔄 Updating existing coach message');
            // On ne peut pas modifier directement, il faut recréer le tableau
            const updatedMessages = messages.slice(0, -1);
            store.clearMessages();
            updatedMessages.forEach(msg => store.addMessage(msg));
            store.addMessage({
              role: 'coach',
              content: this.currentCoachMessage
            });
          } else {
            // Créer un nouveau message du coach
            logger.info('VOICE_ORCHESTRATOR', '➕ Creating new coach message');
            store.addMessage({
              role: 'coach',
              content: this.currentCoachMessage
            });
          }
        }
        break;

      // Transcription du coach complète
      case 'response.audio_transcript.done':
        if (this.currentCoachMessage) {
          logger.info('VOICE_ORCHESTRATOR', '✅ Coach transcript completed', {
            fullMessage: this.currentCoachMessage.substring(0, 100) + '...'
          });

          // Réinitialiser l'accumulation
          this.currentCoachMessage = '';
        }
        break;

      // Fin de réponse audio
      case 'response.audio.done':
        logger.info('VOICE_ORCHESTRATOR', '✅ Audio response completed');
        store.setSpeaking(false);
        break;

      // Fin de réponse complète
      case 'response.done':
        logger.info('VOICE_ORCHESTRATOR', '✅ Response done, setting state back to listening');
        store.setVoiceState('listening');
        store.setProcessing(false);
        store.setSpeaking(false);
        break;

      // Erreur
      case 'error':
        logger.error('VOICE_ORCHESTRATOR', '❌ Realtime API error from server', {
          errorMessage: message.error?.message,
          errorType: message.error?.type,
          fullMessage: message
        });
        store.setVoiceState('error');
        store.setError(message.error?.message || 'Unknown error');
        break;

      // Session mise à jour
      case 'session.updated':
        logger.info('VOICE_ORCHESTRATOR', '⚙️ Session configuration updated');
        break;

      // Début de création de réponse
      case 'response.created':
        logger.info('VOICE_ORCHESTRATOR', '🎯 Response creation started by server');
        store.setVoiceState('processing');
        store.setProcessing(true);
        break;

      default:
        logger.debug('VOICE_ORCHESTRATOR', '❓ Unhandled message type', { type: message.type });
    }
  }

  /**
   * Nettoyer l'orchestrateur
   */
  cleanup(): void {
    this.currentCoachMessage = '';
    this.isInitialized = false;
  }

  /**
   * Vérifier si l'orchestrateur est initialisé
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton
export const voiceCoachOrchestrator = new VoiceCoachOrchestrator();
