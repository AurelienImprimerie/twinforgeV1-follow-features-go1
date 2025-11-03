/**
 * PWA Install Hook - TwinForge PWA Integration
 * Handles PWA installation detection and user guidance
 */

import React, { useEffect } from 'react';
import logger from '../lib/utils/logger';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
  canShowPrompt: boolean;
  installPromptEvent: BeforeInstallPromptEvent | null;
}

interface PWAInstallActions {
  showInstallPrompt: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  checkInstallStatus: () => void;
}

/**
 * Detect user platform for PWA installation guidance
 */
function detectPlatform(): 'android' | 'ios' | 'desktop' | 'unknown' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  if (window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * Check if PWA is already installed/running in standalone mode
 */
function isPWAInstalled(): boolean {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Check if launched from home screen (Android)
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return true;
  }
  
  return false;
}

/**
 * PWA Install Hook - Complete PWA installation management
 */
export function usePWAInstall(): PWAInstallState & PWAInstallActions {
  const [installPromptEvent, setInstallPromptEvent] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [platform, setPlatform] = React.useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown');

  // Initialize PWA state
  useEffect(() => {
    const detectedPlatform = detectPlatform();
    const installedStatus = isPWAInstalled();
    
    setPlatform(detectedPlatform);
    setIsInstalled(installedStatus);
    
    logger.info('PWA_INSTALL', 'PWA state initialized', {
      platform: detectedPlatform,
      isInstalled: installedStatus,
      userAgent: navigator.userAgent.substring(0, 100),
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
      timestamp: new Date().toISOString()
    });
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      
      // Prevent the default browser install prompt
      e.preventDefault();
      
      // Store the event for later use
      setInstallPromptEvent(event);
      setIsInstallable(true);
      
      logger.info('PWA_INSTALL', 'beforeinstallprompt event captured', {
        platforms: event.platforms,
        canPrompt: true,
        timestamp: new Date().toISOString()
      });
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPromptEvent(null);
      
      logger.info('PWA_INSTALL', 'PWA installed successfully', {
        platform,
        timestamp: new Date().toISOString()
      });
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [platform]);

  // Monitor display mode changes
  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      const newIsInstalled = e.matches || (window.navigator as any).standalone === true;
      setIsInstalled(newIsInstalled);
      
      logger.info('PWA_INSTALL', 'Display mode changed', {
        isStandalone: e.matches,
        isInstalled: newIsInstalled,
        timestamp: new Date().toISOString()
      });
    };

    standaloneQuery.addEventListener('change', handleDisplayModeChange);
    
    return () => {
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  // Show install prompt
  const showInstallPrompt = async (): Promise<boolean> => {
    if (!installPromptEvent) {
      logger.warn('PWA_INSTALL', 'No install prompt event available', {
        platform,
        isInstallable,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    try {
      logger.info('PWA_INSTALL', 'Showing install prompt', {
        platform,
        timestamp: new Date().toISOString()
      });

      // Show the install prompt
      await installPromptEvent.prompt();
      
      // Wait for user choice
      const choiceResult = await installPromptEvent.userChoice;
      
      logger.info('PWA_INSTALL', 'User install choice', {
        outcome: choiceResult.outcome,
        platform: choiceResult.platform,
        timestamp: new Date().toISOString()
      });

      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPromptEvent(null);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('PWA_INSTALL', 'Install prompt failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        platform,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  };

  // Dismiss install prompt
  const dismissInstallPrompt = () => {
    setIsInstallable(false);
    setInstallPromptEvent(null);
    
    logger.info('PWA_INSTALL', 'Install prompt dismissed by user', {
      platform,
      timestamp: new Date().toISOString()
    });
  };

  // Check install status
  const checkInstallStatus = () => {
    const installedStatus = isPWAInstalled();
    setIsInstalled(installedStatus);
    
    logger.debug('PWA_INSTALL', 'Install status checked', {
      isInstalled: installedStatus,
      platform,
      timestamp: new Date().toISOString()
    });
  };

  return {
    // State
    isInstallable,
    isInstalled,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    platform,
    canShowPrompt: !!installPromptEvent,
    installPromptEvent,
    
    // Actions
    showInstallPrompt,
    dismissInstallPrompt,
    checkInstallStatus,
  };
}