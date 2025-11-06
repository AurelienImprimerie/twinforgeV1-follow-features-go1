/**
 * Chat Welcome Service
 * Gère les messages d'accueil personnalisés pour chaque mode de chat
 */

import { supabase } from '../../supabase/client';
import type { ChatMode } from '../../store/unifiedCoachStore';
import logger from '../../../lib/utils/logger';

interface WelcomeMessageOptions {
  mode: ChatMode;
  userName?: string;
  hasHistory: boolean;
}

const WELCOME_MESSAGES: Record<ChatMode, string[]> = {
  training: [
    'Prêt à te dépasser ?',
    'C\'est parti pour ta séance !',
    'Montre-moi ce que tu as dans le ventre !',
    'À fond aujourd\'hui ?'
  ],
  nutrition: [
    'Une question nutrition ?',
    'Que puis-je t\'expliquer ?',
    'Parlons alimentation !',
    'Comment je peux t\'aider ?'
  ],
  fasting: [
    'Comment te sens-tu ?',
    'Tout se passe bien ?',
    'Besoin de conseils ?',
    'Ça va ? Je suis là !'
  ],
  general: [
    'Que puis-je faire pour toi ?',
    'Comment puis-je t\'aider ?',
    'Par quoi on commence ?',
    'Je t\'écoute !'
  ],
  'body-scan': [
    'Que veux-tu analyser ?',
    'Prêt pour ton scan ?',
    'Parlons de ta progression !',
    'Comment puis-je t\'aider ?'
  ]
};

export class ChatWelcomeService {
  private static lastWelcomeIndex: Record<ChatMode, number> = {
    training: -1,
    nutrition: -1,
    fasting: -1,
    general: -1,
    'body-scan': -1
  };

  static async getWelcomeMessage(options: WelcomeMessageOptions): Promise<string> {
    const { mode, userName, hasHistory } = options;

    // Si l'utilisateur a déjà un historique, on ne montre pas de message d'accueil
    if (hasHistory) {
      return '';
    }

    // Récupérer le prénom de l'utilisateur si disponible
    let firstName = userName;
    if (!firstName) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profile')
            .select('display_name, full_name')
            .eq('user_id', user.id)
            .maybeSingle();

          // Utiliser display_name en priorité, sinon extraire le prénom de full_name
          firstName = profile?.display_name || profile?.full_name?.split(' ')[0];
        }
      } catch (error) {
        logger.debug('CHAT_WELCOME_SERVICE', 'Could not fetch user name', { error });
      }
    }

    // Sélectionner un message d'accueil en rotation
    const messages = WELCOME_MESSAGES[mode];
    const lastIndex = this.lastWelcomeIndex[mode];
    const nextIndex = (lastIndex + 1) % messages.length;
    this.lastWelcomeIndex[mode] = nextIndex;

    let welcomeText = messages[nextIndex];

    // Personnaliser avec le prénom si disponible
    if (firstName && Math.random() > 0.5) {
      welcomeText = `Salut ${firstName} ! ${welcomeText}`;
    }

    return welcomeText;
  }

  static shouldShowWelcome(messageCount: number): boolean {
    // Afficher le message d'accueil uniquement si c'est la première conversation
    return messageCount === 0;
  }

  static clearWelcomeState(mode: ChatMode): void {
    this.lastWelcomeIndex[mode] = -1;
  }
}
