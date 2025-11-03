/**
 * Environment Detection Service
 * Détecte l'environnement d'exécution et les capacités disponibles
 */

import logger from '../../lib/utils/logger';

export interface EnvironmentCapabilities {
  canUseWebSocket: boolean;
  canUseVoiceMode: boolean;
  canUseTextMode: boolean;
  isStackBlitz: boolean;
  isWebContainer: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
  environmentName: string;
  limitations: string[];
  recommendations: string[];
}

class EnvironmentDetectionService {
  private capabilities: EnvironmentCapabilities | null = null;

  /**
   * Détecter l'environnement et ses capacités
   */
  detect(): EnvironmentCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    logger.info('ENV_DETECTION', 'Detecting environment capabilities');

    const hostname = window.location.hostname;
    const userAgent = navigator.userAgent;

    // Détection StackBlitz / WebContainer
    const isStackBlitz = hostname.includes('stackblitz') ||
                         hostname.includes('webcontainer') ||
                         hostname.includes('stackblitz.io');

    const isWebContainer = isStackBlitz ||
                           userAgent.includes('webcontainer');

    // Détection environnement
    const isProduction = hostname.includes('vercel.app') ||
                         hostname.includes('netlify.app') ||
                         hostname.includes('railway.app') ||
                         (!hostname.includes('localhost') && !isStackBlitz);

    const isDevelopment = hostname.includes('localhost') ||
                          hostname === '127.0.0.1';

    // Capacités WebSocket - vérifier uniquement si WebSocket existe dans le navigateur
    const canUseWebSocket = typeof WebSocket !== 'undefined';

    // Le mode vocal nécessite WebSocket - ne pas bloquer basé sur l'environnement
    // Laisser la tentative de connexion échouer naturellement si l'environnement ne supporte pas
    const canUseVoiceMode = canUseWebSocket;

    // Le mode texte est toujours disponible
    const canUseTextMode = true;

    // Nom de l'environnement
    let environmentName = 'Unknown';
    if (isStackBlitz) {
      environmentName = 'StackBlitz WebContainer';
    } else if (isDevelopment) {
      environmentName = 'Development (localhost)';
    } else if (isProduction) {
      environmentName = 'Production';
    }

    // Limitations
    const limitations: string[] = [];
    if (isWebContainer) {
      limitations.push('WebContainer peut avoir des limitations avec les WebSockets externes');
      limitations.push('Le mode vocal peut nécessiter des configurations supplémentaires');
    }

    if (!canUseWebSocket) {
      limitations.push('Les WebSockets ne sont pas disponibles dans ce navigateur');
    }

    // Recommandations
    const recommendations: string[] = [];
    if (isStackBlitz) {
      recommendations.push('Le mode vocal fonctionne via Supabase Edge Functions');
      recommendations.push('Si vous rencontrez des problèmes, vérifiez la configuration de votre edge function');
      recommendations.push('Le mode texte est toujours disponible comme alternative');
    }

    this.capabilities = {
      canUseWebSocket,
      canUseVoiceMode,
      canUseTextMode,
      isStackBlitz,
      isWebContainer,
      isProduction,
      isDevelopment,
      environmentName,
      limitations,
      recommendations
    };

    logger.info('ENV_DETECTION', 'Environment detected', {
      environment: environmentName,
      canUseVoiceMode,
      canUseTextMode,
      limitations: limitations.length,
      recommendations: recommendations.length
    });

    return this.capabilities;
  }

  /**
   * Obtenir les capacités (avec détection si nécessaire)
   */
  getCapabilities(): EnvironmentCapabilities {
    return this.capabilities || this.detect();
  }

  /**
   * Vérifier si le mode vocal est disponible
   */
  isVoiceModeAvailable(): boolean {
    return this.getCapabilities().canUseVoiceMode;
  }

  /**
   * Vérifier si on est dans StackBlitz
   */
  isInStackBlitz(): boolean {
    return this.getCapabilities().isStackBlitz;
  }

  /**
   * Obtenir un message d'erreur approprié pour le mode vocal
   */
  getVoiceModeUnavailableMessage(): string {
    const caps = this.getCapabilities();

    if (!caps.canUseWebSocket) {
      return `🚫 Le mode vocal nécessite la prise en charge des WebSockets.\n\n` +
             `Votre navigateur ou configuration réseau ne supporte pas cette fonctionnalité.\n\n` +
             `✅ Solution :\n` +
             `• Utilisez le mode texte (disponible maintenant)`;
    }

    if (caps.isStackBlitz || caps.isWebContainer) {
      return `⚠️ Tentative de connexion en mode vocal...\n\n` +
             `Note : Vous êtes dans ${caps.environmentName}. Si la connexion échoue :\n\n` +
             `✅ Solutions :\n` +
             `• Vérifiez que votre edge function Supabase est déployée\n` +
             `• Vérifiez que OPENAI_API_KEY est configurée dans les secrets Supabase\n` +
             `• Utilisez le mode texte comme alternative\n\n` +
             `💡 La connexion peut prendre quelques secondes...`;
    }

    return 'Le mode vocal n\'est pas disponible actuellement. Utilisez le mode texte.';
  }

  /**
   * Logger les informations d'environnement pour le debug
   */
  logEnvironmentInfo(): void {
    const caps = this.getCapabilities();

    console.group('🌍 Environment Information');
    console.log('Environment:', caps.environmentName);
    console.log('Voice Mode Available:', caps.canUseVoiceMode ? '✅' : '❌');
    console.log('Text Mode Available:', caps.canUseTextMode ? '✅' : '❌');
    console.log('WebSocket Support:', caps.canUseWebSocket ? '✅' : '❌');

    if (caps.limitations.length > 0) {
      console.group('⚠️ Limitations:');
      caps.limitations.forEach(limitation => console.log('-', limitation));
      console.groupEnd();
    }

    if (caps.recommendations.length > 0) {
      console.group('💡 Recommendations:');
      caps.recommendations.forEach(rec => console.log('-', rec));
      console.groupEnd();
    }

    console.groupEnd();
  }
}

// Export singleton
export const environmentDetectionService = new EnvironmentDetectionService();
