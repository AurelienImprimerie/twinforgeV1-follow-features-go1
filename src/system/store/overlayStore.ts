/**
 * Overlay Store - Gestion centralisée des panneaux superposés
 * Store unique pour gérer l'état d'ouverture des panneaux sur mobile
 */

import { create } from 'zustand';
import logger from '../../lib/utils/logger';
import { overlayTransitionManager } from './overlayTransitionManager';

export type OverlayId = 'none' | 'mobileDrawer' | 'centralMenu' | 'userPanel' | 'sidebar' | 'chatDrawer';

interface OverlayState {
  activeOverlayId: OverlayId;
  previousOverlayId: OverlayId;
  
  // Actions
  open: (overlayId: Exclude<OverlayId, 'none'>) => void;
  close: () => void;
  toggle: (overlayId: Exclude<OverlayId, 'none'>) => void;
  isOpen: (overlayId: Exclude<OverlayId, 'none'>) => boolean;
  isAnyOpen: () => boolean;
}

/**
 * Z-Index Hierarchy Constants
 * Ensure proper stacking of overlays
 */
export const Z_INDEX = {
  BOTTOM_BAR: 9996,
  SIDEBAR: 9997,
  CHAT_NOTIFICATION: 9997,
  FLOATING_CHAT_BUTTON: 9994,
  CHAT_DRAWER: 9995,
  USER_PANEL: 9998,
  CENTRAL_MENU: 9998,
  MOBILE_DRAWER: 9998,
  BACKDROP: 9993,
  MODAL: 9999,
} as const;

/**
 * Store centralisé pour la gestion des overlays
 * Garantit qu'un seul panneau est ouvert à la fois
 * Gère les z-index, backdrop, et escape key
 */
export const useOverlayStore = create<OverlayState>((set, get) => ({
  activeOverlayId: 'none',
  previousOverlayId: 'none',

  open: (overlayId: Exclude<OverlayId, 'none'>) => {
    const currentState = get();

    logger.debug('OVERLAY_STORE', 'Opening overlay', {
      overlayId,
      currentActiveOverlay: currentState.activeOverlayId,
      willCloseExisting: currentState.activeOverlayId !== 'none',
      timestamp: new Date().toISOString()
    });

    // Si un autre panneau est ouvert, utiliser le transition manager pour une transition fluide
    if (currentState.activeOverlayId !== 'none' && currentState.activeOverlayId !== overlayId) {
      logger.info('OVERLAY_STORE', 'Closing existing overlay before opening new one', {
        closingOverlay: currentState.activeOverlayId,
        openingOverlay: overlayId,
        timestamp: new Date().toISOString()
      });

      // Utiliser le transition manager pour une transition optimisée
      overlayTransitionManager.executeTransition(
        // Fermer le panneau actuel
        () => {
          set({
            previousOverlayId: currentState.activeOverlayId,
            activeOverlayId: 'none',
          });
        },
        // Ouvrir le nouveau panneau
        () => {
          set({
            previousOverlayId: 'none',
            activeOverlayId: overlayId,
          });

          logger.info('OVERLAY_STORE', 'Overlay opened successfully after transition', {
            overlayId,
            timestamp: new Date().toISOString()
          });
        }
      );
    } else {
      // Ouverture directe si aucun panneau n'est ouvert
      set({
        previousOverlayId: currentState.activeOverlayId,
        activeOverlayId: overlayId,
      });

      logger.info('OVERLAY_STORE', 'Overlay opened successfully', {
        overlayId,
        previousOverlay: currentState.activeOverlayId,
        timestamp: new Date().toISOString()
      });
    }
  },

  close: () => {
    const currentState = get();
    
    if (currentState.activeOverlayId === 'none') {
      logger.debug('OVERLAY_STORE', 'Close called but no overlay is open', {
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.debug('OVERLAY_STORE', 'Closing overlay', {
      closingOverlay: currentState.activeOverlayId,
      timestamp: new Date().toISOString()
    });

    set({
      previousOverlayId: currentState.activeOverlayId,
      activeOverlayId: 'none',
    });

    logger.info('OVERLAY_STORE', 'Overlay closed successfully', {
      closedOverlay: currentState.previousOverlayId,
      timestamp: new Date().toISOString()
    });
  },

  toggle: (overlayId: Exclude<OverlayId, 'none'>) => {
    const currentState = get();
    
    if (currentState.activeOverlayId === overlayId) {
      get().close();
    } else {
      get().open(overlayId);
    }
  },

  isOpen: (overlayId: Exclude<OverlayId, 'none'>) => {
    return get().activeOverlayId === overlayId;
  },

  isAnyOpen: () => {
    return get().activeOverlayId !== 'none';
  },
}));

/**
 * Hook to get z-index for a specific overlay
 */
export const useOverlayZIndex = (overlayId: Exclude<OverlayId, 'none'>): number => {
  const mapping: Record<Exclude<OverlayId, 'none'>, number> = {
    mobileDrawer: Z_INDEX.MOBILE_DRAWER,
    centralMenu: Z_INDEX.CENTRAL_MENU,
    userPanel: Z_INDEX.USER_PANEL,
    sidebar: Z_INDEX.SIDEBAR,
    chatDrawer: Z_INDEX.CHAT_DRAWER,
  };
  return mapping[overlayId];
};