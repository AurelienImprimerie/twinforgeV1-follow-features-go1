/**
 * use3DQuality Hook
 * Determines optimal 3D rendering quality based on device capabilities
 * Integrates with existing deviceCapabilityManager
 */

import { useMemo } from 'react';
import { deviceCapabilityManager, type PerformanceLevel } from '../lib/device/deviceCapabilityManager';

export type Quality3D = 'low' | 'medium' | 'high';

interface Quality3DConfig {
  quality: Quality3D;
  enableShadows: boolean;
  enableReflections: boolean;
  enableSSS: boolean; // Subsurface Scattering
  enablePostProcessing: boolean;
  pixelRatio: number;
  antialias: boolean;
  maxLights: number;
}

/**
 * Hook to get optimal 3D quality settings based on device performance
 */
export function use3DQuality(): Quality3DConfig {
  const capabilities = deviceCapabilityManager.getCapabilities();

  return useMemo(() => {
    const performanceLevel: PerformanceLevel = capabilities.performanceLevel;

    // LOW Performance (mobile bas de gamme, anciens appareils)
    if (performanceLevel === 'low') {
      return {
        quality: 'low',
        enableShadows: false,
        enableReflections: false,
        enableSSS: false,
        enablePostProcessing: false,
        pixelRatio: Math.min(window.devicePixelRatio, 1),
        antialias: false,
        maxLights: 1,
      };
    }

    // MEDIUM Performance (mobile récent, desktop standard)
    if (performanceLevel === 'medium') {
      return {
        quality: 'medium',
        enableShadows: true,
        enableReflections: false,
        enableSSS: false,
        enablePostProcessing: false,
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        antialias: true,
        maxLights: 2,
      };
    }

    // HIGH Performance (desktop gaming, high-end mobile)
    return {
      quality: 'high',
      enableShadows: true,
      enableReflections: true,
      enableSSS: true,
      enablePostProcessing: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      antialias: true,
      maxLights: 3,
    };
  }, [capabilities.performanceLevel]);
}
