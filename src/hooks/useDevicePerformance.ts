/**
 * useDevicePerformance Hook
 * Initialize and apply device capability detection
 */

import { useEffect } from 'react';
import { deviceCapabilityManager } from '../lib/device/deviceCapabilityManager';

export function useDevicePerformance() {
  useEffect(() => {
    // Apply initial configuration to DOM
    const config = deviceCapabilityManager.getConfig();
    const capabilities = deviceCapabilityManager.getCapabilities();

    document.documentElement.style.setProperty('--glass-blur-adaptive', `${config.glassBlur}px`);
    document.documentElement.style.setProperty('--animation-duration-adaptive', `${config.animationDuration}ms`);

    // Apply performance level class
    document.documentElement.classList.remove('perf-high', 'perf-medium', 'perf-low');
    document.documentElement.classList.add(`perf-${capabilities.performanceLevel}`);

    // Apply mobile class if needed
    if (capabilities.isMobile) {
      document.documentElement.classList.add('is-mobile');
    }

    // Apply effect flags
    if (!config.enableShimmer) {
      document.documentElement.classList.add('disable-shimmer');
    }
    if (!config.enablePulse) {
      document.documentElement.classList.add('disable-pulse');
    }
    if (!config.enableGlow) {
      document.documentElement.classList.add('disable-glow');
    }

    // Cleanup on unmount
    return () => {
      deviceCapabilityManager.destroy();
    };
  }, []);

  return {
    capabilities: deviceCapabilityManager.getCapabilities(),
    config: deviceCapabilityManager.getConfig(),
  };
}
