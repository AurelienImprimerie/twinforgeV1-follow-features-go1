/**
 * Hook: usePanelExclusivity
 * Gère l'exclusivité des panneaux et la protection contre les clics rapides
 */

import { useCallback, useRef } from 'react';
import { useOverlayStore, type OverlayId } from '../system/store/overlayStore';
import { overlayTransitionManager } from '../system/store/overlayTransitionManager';
import logger from '../lib/utils/logger';

interface UsePanelExclusivityOptions {
  /** ID du panneau concerné */
  overlayId: Exclude<OverlayId, 'none'>;
  /** Délai minimum entre deux actions (ms) pour éviter les doubles clics */
  debounceDelay?: number;
  /** Callback appelé avant l'ouverture */
  onBeforeOpen?: () => void;
  /** Callback appelé après l'ouverture */
  onAfterOpen?: () => void;
  /** Callback appelé avant la fermeture */
  onBeforeClose?: () => void;
  /** Callback appelé après la fermeture */
  onAfterClose?: () => void;
}

export const usePanelExclusivity = (options: UsePanelExclusivityOptions) => {
  const { overlayId, debounceDelay = 300, onBeforeOpen, onAfterOpen, onBeforeClose, onAfterClose } = options;

  const { isOpen, open, close, toggle } = useOverlayStore();
  const lastActionTime = useRef<number>(0);
  const isPanelOpen = isOpen(overlayId);

  /**
   * Vérifie si une action peut être exécutée (protection contre les clics rapides)
   */
  const canExecuteAction = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime.current;

    // Vérifier si on est en période de transition
    if (overlayTransitionManager.isInTransition()) {
      logger.debug('PANEL_EXCLUSIVITY', 'Action blocked - transition in progress', {
        overlayId,
        timestamp: new Date().toISOString(),
      });
      return false;
    }

    // Vérifier le délai de debounce
    if (timeSinceLastAction < debounceDelay) {
      logger.debug('PANEL_EXCLUSIVITY', 'Action blocked - too soon', {
        overlayId,
        timeSinceLastAction,
        debounceDelay,
        timestamp: new Date().toISOString(),
      });
      return false;
    }

    lastActionTime.current = now;
    return true;
  }, [overlayId, debounceDelay]);

  /**
   * Ouvre le panneau de manière sécurisée
   */
  const safeOpen = useCallback(() => {
    if (!canExecuteAction()) return;

    logger.debug('PANEL_EXCLUSIVITY', 'Opening panel', {
      overlayId,
      timestamp: new Date().toISOString(),
    });

    onBeforeOpen?.();
    open(overlayId);

    // Appeler le callback après ouverture avec un léger délai
    setTimeout(() => {
      onAfterOpen?.();
    }, 50);
  }, [overlayId, canExecuteAction, onBeforeOpen, onAfterOpen, open]);

  /**
   * Ferme le panneau de manière sécurisée
   */
  const safeClose = useCallback(() => {
    if (!canExecuteAction()) return;

    logger.debug('PANEL_EXCLUSIVITY', 'Closing panel', {
      overlayId,
      timestamp: new Date().toISOString(),
    });

    onBeforeClose?.();
    close();

    // Appeler le callback après fermeture avec un léger délai
    setTimeout(() => {
      onAfterClose?.();
    }, 50);
  }, [overlayId, canExecuteAction, onBeforeClose, onAfterClose, close]);

  /**
   * Toggle le panneau de manière sécurisée
   */
  const safeToggle = useCallback(() => {
    if (!canExecuteAction()) return;

    logger.debug('PANEL_EXCLUSIVITY', 'Toggling panel', {
      overlayId,
      currentState: isPanelOpen,
      timestamp: new Date().toISOString(),
    });

    if (isPanelOpen) {
      onBeforeClose?.();
    } else {
      onBeforeOpen?.();
    }

    toggle(overlayId);

    // Appeler le callback approprié après le toggle
    setTimeout(() => {
      if (isPanelOpen) {
        onAfterClose?.();
      } else {
        onAfterOpen?.();
      }
    }, 50);
  }, [overlayId, isPanelOpen, canExecuteAction, onBeforeOpen, onAfterOpen, onBeforeClose, onAfterClose, toggle]);

  return {
    /** Indique si le panneau est actuellement ouvert */
    isOpen: isPanelOpen,
    /** Ouvre le panneau de manière sécurisée */
    open: safeOpen,
    /** Ferme le panneau de manière sécurisée */
    close: safeClose,
    /** Toggle le panneau de manière sécurisée */
    toggle: safeToggle,
    /** Indique si une transition est en cours */
    isTransitioning: overlayTransitionManager.isInTransition(),
  };
};
