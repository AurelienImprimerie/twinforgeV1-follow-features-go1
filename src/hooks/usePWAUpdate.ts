/**
 * PWA Update Hook - TwinForge Service Worker Updates
 * Manages Service Worker updates and user notifications
 */

import React, { useEffect } from 'react';
import logger from '../lib/utils/logger';

interface PWAUpdateState {
  isUpdateAvailable: boolean;
  isUpdating: boolean;
  updateInfo: {
    version?: string;
    features?: string[];
    isRequired?: boolean;
  } | null;
}

interface PWAUpdateActions {
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  checkForUpdates: () => void;
}

/**
 * PWA Update Hook - Complete Service Worker update management
 */
export function usePWAUpdate(): PWAUpdateState & PWAUpdateActions {
  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateInfo, setUpdateInfo] = React.useState<PWAUpdateState['updateInfo']>(null);
  const [waitingServiceWorker, setWaitingServiceWorker] = React.useState<ServiceWorker | null>(null);

  // Listen for Service Worker updates
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      logger.info('PWA_UPDATE', 'Service Worker not supported', {
        userAgent: navigator.userAgent.substring(0, 100),
        timestamp: new Date().toISOString()
      });
      return;
    }

    const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
      const waitingSW = registration.waiting;
      
      if (waitingSW) {
        setWaitingServiceWorker(waitingSW);
        setIsUpdateAvailable(true);
        setUpdateInfo({
          version: 'Nouvelle version',
          features: [
            'Améliorations de performance',
            'Nouvelles fonctionnalités',
            'Corrections de bugs'
          ],
          isRequired: false
        });
        
        logger.info('PWA_UPDATE', 'Service Worker update detected', {
          swState: waitingSW.state,
          timestamp: new Date().toISOString()
        });
      }
    };

    const handleControllerChange = () => {
      logger.info('PWA_UPDATE', 'Service Worker controller changed', {
        timestamp: new Date().toISOString()
      });
      
      // Reload the page to activate the new Service Worker
      window.location.reload();
    };

    // Check for existing Service Worker registration
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                handleServiceWorkerUpdate(registration);
              }
            });
          }
        });

        // Check if there's already a waiting Service Worker
        if (registration.waiting) {
          handleServiceWorkerUpdate(registration);
        }
      }
    });

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Listen for messages from Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      try {
        // Ensure event.data is an object, not a string
        const data = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;

        if (data && data.type === 'UPDATE_AVAILABLE') {
          setIsUpdateAvailable(true);
          setUpdateInfo(data.updateInfo || null);

          logger.info('PWA_UPDATE', 'Update message received from Service Worker', {
            updateInfo: data.updateInfo,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        // Silently ignore parse errors from service worker messages
        logger.warn('PWA_UPDATE', 'Failed to parse service worker message', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Apply update
  const applyUpdate = async (): Promise<void> => {
    if (!waitingServiceWorker) {
      logger.warn('PWA_UPDATE', 'No waiting Service Worker available for update', {
        timestamp: new Date().toISOString()
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      logger.info('PWA_UPDATE', 'Applying Service Worker update', {
        swState: waitingServiceWorker.state,
        timestamp: new Date().toISOString()
      });

      // Tell the waiting Service Worker to skip waiting and become active
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // The controllerchange event will handle the page reload
      
    } catch (error) {
      logger.error('PWA_UPDATE', 'Failed to apply update', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      setIsUpdating(false);
    }
  };

  // Dismiss update notification
  const dismissUpdate = () => {
    setIsUpdateAvailable(false);
    setUpdateInfo(null);
    setWaitingServiceWorker(null);
    
    logger.info('PWA_UPDATE', 'Update notification dismissed', {
      timestamp: new Date().toISOString()
    });
  };

  // Check for updates manually
  const checkForUpdates = () => {
    if (!('serviceWorker' in navigator)) return;
    
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        logger.info('PWA_UPDATE', 'Manually checking for updates', {
          timestamp: new Date().toISOString()
        });
        
        registration.update();
      }
    });
  };

  return {
    // State
    isUpdateAvailable,
    isUpdating,
    updateInfo,
    
    // Actions
    applyUpdate,
    dismissUpdate,
    checkForUpdates,
  };
}