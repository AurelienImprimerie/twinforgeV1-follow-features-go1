/**
 * useProfilePerformance Hook
 * Centralized performance management for Profile page and all tabs
 * Connects to deviceCapabilityManager for adaptive rendering
 */

import { useMemo } from 'react';
import { useDeviceCapability } from '../../../../lib/device/deviceCapabilityManager';

export interface ProfilePerformanceConfig {
  // Framer Motion
  shouldUseFramerMotion: boolean;
  shouldUseStagger: boolean;
  shouldUseAnimatePresence: boolean;

  // Animations
  enableTransitions: boolean;
  animationDuration: number;
  staggerDelay: number;

  // Visual Effects
  enableGlassEffects: boolean;
  enableShadows: boolean;
  enableGradients: boolean;
  enableHoverEffects: boolean;

  // Rendering
  shouldVirtualize: (count: number) => boolean;
  shouldLazyLoad: boolean;
  shouldDeferNonCritical: boolean;

  // Performance Level
  performanceLevel: 'high' | 'medium' | 'low';
  isMobile: boolean;
}

export function useProfilePerformance(): ProfilePerformanceConfig {
  const {
    capabilities,
    config,
    shouldUseFramerMotion,
    shouldVirtualize,
    canUseEffect,
    getAnimationDuration,
  } = useDeviceCapability();

  const profileConfig = useMemo<ProfilePerformanceConfig>(() => {
    const level = capabilities.performanceLevel;
    const isMobile = capabilities.isMobile;
    const prefersReduced = capabilities.prefersReducedMotion;

    // Base configuration
    const baseConfig: ProfilePerformanceConfig = {
      // Framer Motion - disable on low-end and medium mobile
      shouldUseFramerMotion: shouldUseFramerMotion,
      shouldUseStagger: level === 'high' && !isMobile,
      shouldUseAnimatePresence: level === 'high' && !isMobile && !prefersReduced,

      // Animations - adapt to device
      enableTransitions: !prefersReduced,
      animationDuration: getAnimationDuration(),
      staggerDelay: level === 'high' ? 0.05 : level === 'medium' ? 0.03 : 0,

      // Visual Effects
      enableGlassEffects: canUseEffect('glow'),
      enableShadows: level === 'high' && !isMobile,
      enableGradients: level !== 'low',
      enableHoverEffects: !isMobile || level === 'high',

      // Rendering optimizations
      shouldVirtualize,
      shouldLazyLoad: isMobile || level === 'low' || level === 'medium',
      shouldDeferNonCritical: isMobile || level !== 'high',

      // Device info
      performanceLevel: level,
      isMobile,
    };

    return baseConfig;
  }, [
    capabilities.performanceLevel,
    capabilities.isMobile,
    capabilities.prefersReducedMotion,
    shouldUseFramerMotion,
    shouldVirtualize,
    canUseEffect,
    getAnimationDuration,
  ]);

  return profileConfig;
}

/**
 * Get adaptive variants for framer-motion based on performance level
 */
export function useProfileMotionVariants(performanceConfig: ProfilePerformanceConfig) {
  return useMemo(() => {
    const { shouldUseFramerMotion, shouldUseStagger, animationDuration, staggerDelay } = performanceConfig;

    // No animations on low-end
    if (!shouldUseFramerMotion) {
      return {
        container: {},
        item: {},
        panel: {},
      };
    }

    // Full animations on high-end
    return {
      container: shouldUseStagger ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      } : {},

      item: {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: animationDuration / 1000,
            ease: 'easeOut',
          },
        },
      },

      panel: {
        initial: { opacity: 0, y: 20 },
        enter: {
          opacity: 1,
          y: 0,
          transition: {
            duration: animationDuration / 1000,
            ease: 'easeOut',
          },
        },
        exit: {
          opacity: 0,
          y: -20,
          transition: {
            duration: animationDuration / 1000 * 0.8,
            ease: 'easeIn',
          },
        },
      },
    };
  }, [performanceConfig]);
}
