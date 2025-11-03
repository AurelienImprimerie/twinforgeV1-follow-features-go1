/**
 * Overlay Transition Manager
 * Gère les transitions fluides entre les différents panneaux
 * Optimisé pour zéro lag sur mobile et desktop
 */

import logger from '../../lib/utils/logger';

export type TransitionConfig = {
  /** Délai avant d'ouvrir le nouveau panneau après fermeture du précédent (ms) */
  transitionDelay: number;
  /** Utiliser une transition coordonnée (fermer puis ouvrir) ou immédiate */
  useCoordinatedTransition: boolean;
  /** Activer les optimisations GPU pour les transitions */
  useGPUOptimization: boolean;
};

// Configuration par défaut pour des transitions fluides
const DEFAULT_TRANSITION_CONFIG: TransitionConfig = {
  transitionDelay: 150, // 150ms pour laisser l'animation de fermeture se jouer
  useCoordinatedTransition: true,
  useGPUOptimization: true,
};

/**
 * Configuration des transitions par appareil
 */
export const getDeviceOptimizedConfig = (): TransitionConfig => {
  // Détection du type d'appareil
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isLowEndDevice = checkIfLowEndDevice();

  // Appareil low-end: transitions plus rapides, moins d'effets
  if (isLowEndDevice) {
    return {
      transitionDelay: 100,
      useCoordinatedTransition: true,
      useGPUOptimization: true,
    };
  }

  // Mobile: transitions légères mais visibles
  if (isMobile) {
    return {
      transitionDelay: 120,
      useCoordinatedTransition: true,
      useGPUOptimization: true,
    };
  }

  // Tablette et Desktop: transitions plus riches
  return DEFAULT_TRANSITION_CONFIG;
};

/**
 * Détecte si l'appareil est considéré comme low-end
 */
function checkIfLowEndDevice(): boolean {
  // Vérifier la mémoire disponible (si l'API est disponible)
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) {
      return true;
    }
  }

  // Vérifier le nombre de cores CPU
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores && cores < 4) {
      return true;
    }
  }

  // Vérifier si le mode économie d'énergie est activé (Safari)
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.saveData) {
      return true;
    }
  }

  return false;
}

/**
 * Classe singleton pour gérer les transitions entre overlays
 */
class OverlayTransitionManager {
  private static instance: OverlayTransitionManager;
  private config: TransitionConfig;
  private pendingTransition: NodeJS.Timeout | null = null;
  private isTransitioning: boolean = false;

  private constructor() {
    this.config = getDeviceOptimizedConfig();

    // Mettre à jour la config lors du redimensionnement
    window.addEventListener('resize', this.handleResize);

    logger.info('OVERLAY_TRANSITION_MANAGER', 'Initialized', {
      config: this.config,
      timestamp: new Date().toISOString(),
    });
  }

  static getInstance(): OverlayTransitionManager {
    if (!OverlayTransitionManager.instance) {
      OverlayTransitionManager.instance = new OverlayTransitionManager();
    }
    return OverlayTransitionManager.instance;
  }

  private handleResize = () => {
    // Debounce le resize
    clearTimeout(this.pendingTransition as NodeJS.Timeout);
    this.pendingTransition = setTimeout(() => {
      const newConfig = getDeviceOptimizedConfig();
      if (JSON.stringify(newConfig) !== JSON.stringify(this.config)) {
        this.config = newConfig;
        logger.debug('OVERLAY_TRANSITION_MANAGER', 'Config updated on resize', {
          newConfig: this.config,
        });
      }
    }, 100);
  };

  /**
   * Execute une transition fluide entre deux overlays
   */
  async executeTransition(
    closeCallback: () => void,
    openCallback: () => void,
  ): Promise<void> {
    if (this.isTransitioning) {
      logger.warn('OVERLAY_TRANSITION_MANAGER', 'Transition already in progress');
      return;
    }

    this.isTransitioning = true;

    try {
      // Activer les optimisations GPU si nécessaire
      if (this.config.useGPUOptimization) {
        this.enableGPUOptimizations();
      }

      // Fermer le panneau actuel
      closeCallback();

      logger.debug('OVERLAY_TRANSITION_MANAGER', 'Closing overlay', {
        delay: this.config.transitionDelay,
      });

      // Attendre le délai de transition
      if (this.config.useCoordinatedTransition) {
        await this.delay(this.config.transitionDelay);
      }

      // Ouvrir le nouveau panneau
      openCallback();

      logger.debug('OVERLAY_TRANSITION_MANAGER', 'Opening new overlay');

      // Nettoyer les optimisations GPU après l'animation
      if (this.config.useGPUOptimization) {
        setTimeout(() => {
          this.disableGPUOptimizations();
        }, 500);
      }
    } catch (error) {
      logger.error('OVERLAY_TRANSITION_MANAGER', 'Transition error', { error });
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Vérifie si une transition est en cours
   */
  isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Obtient le délai de transition actuel
   */
  getTransitionDelay(): number {
    return this.config.transitionDelay;
  }

  /**
   * Active les optimisations GPU pour les transitions
   */
  private enableGPUOptimizations(): void {
    document.documentElement.style.setProperty('--overlay-will-change', 'transform, opacity');
    document.documentElement.style.setProperty('--overlay-transform', 'translateZ(0)');
  }

  /**
   * Désactive les optimisations GPU
   */
  private disableGPUOptimizations(): void {
    document.documentElement.style.setProperty('--overlay-will-change', 'auto');
    document.documentElement.style.setProperty('--overlay-transform', 'none');
  }

  /**
   * Utilitaire pour créer un délai
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    if (this.pendingTransition) {
      clearTimeout(this.pendingTransition);
    }
    window.removeEventListener('resize', this.handleResize);
  }
}

export const overlayTransitionManager = OverlayTransitionManager.getInstance();
