/**
 * Device Capabilities Detection - Enhanced for Performance Modes
 * Détecte automatiquement les capacités du device pour choisir le mode optimal
 */

import { useState, useEffect } from 'react';

export type PerformanceMode = 'high-performance' | 'balanced' | 'quality';

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsHover: boolean;
  supportsTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  memoryGB: number;
  cores: number;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  recommendedMode: PerformanceMode;
}

/**
 * Détecte les capacités du device
 */
function detectCapabilities(): DeviceCapabilities {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  // Detection mobile/tablet/desktop
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  // Detection hover et touch
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Detection mémoire et CPU
  const memoryGB = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;

  // Detection vitesse connexion
  const connection = (navigator as any).connection;
  let connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';

  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      connectionSpeed = 'slow';
    } else if (effectiveType === '3g') {
      connectionSpeed = 'medium';
    } else if (effectiveType === '4g' || effectiveType === '5g') {
      connectionSpeed = 'fast';
    }
  }

  // Recommandation mode basée sur les capacités
  let recommendedMode: PerformanceMode = 'balanced';

  // Mobile = toujours high-performance par défaut
  if (isMobile) {
    recommendedMode = 'high-performance';
  }
  // Desktop avec bonnes specs = quality
  else if (isDesktop && memoryGB >= 8 && cores >= 8) {
    recommendedMode = 'quality';
  }
  // Tablet ou desktop mid-range = balanced
  else {
    recommendedMode = 'balanced';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    supportsHover,
    supportsTouch,
    screenWidth: width,
    screenHeight: height,
    devicePixelRatio: dpr,
    memoryGB,
    cores,
    connectionSpeed,
    recommendedMode,
  };
}

/**
 * Hook pour détecter les capacités du device
 * Se met à jour automatiquement au resize
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() =>
    detectCapabilities()
  );

  useEffect(() => {
    const handleResize = () => {
      setCapabilities(detectCapabilities());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return capabilities;
}
