/**
 * useBodyScanPerformance Hook
 * Hook centralisé pour gérer les optimisations de performance du BodyScan
 * Connecté au système de performance global (PerformanceModeContext)
 */

import { useMemo } from 'react';
import { usePerformanceMode } from '../system/context/PerformanceModeContext';

export interface BodyScanPerformanceConfig {
  // Modes de performance
  isPerformanceMode: boolean;
  mode: 'high-performance' | 'balanced' | 'quality';

  // Flags d'activation des fonctionnalités
  enableFramerMotion: boolean;
  enableAnimatePresence: boolean;
  enableWhileHover: boolean;
  enableWhileTap: boolean;
  enableInitialAnimations: boolean;
  enableExitAnimations: boolean;
  enableStaggerAnimations: boolean;
  enableLoadingAnimations: boolean;

  // Animations CSS
  enableCSSAnimations: boolean;
  enableBreathingAnimations: boolean;
  enablePulseAnimations: boolean;
  enableParticleEffects: boolean;
  enableShimmerEffects: boolean;
  enableCelebrationEffects: boolean;

  // Effets GPU coûteux
  enableBackdropFilter: boolean;
  enableComplexShadows: boolean;
  enableGradientAnimations: boolean;
  enableBlurEffects: boolean;

  // Overlays et décorations
  enableScanLineOverlays: boolean;
  enableAnalysisGrids: boolean;
  enableDataParticles: boolean;
  enableGlowEffects: boolean;

  // Optimisations images
  imageLoadingStrategy: 'eager' | 'lazy';
  imageFetchPriority: 'high' | 'low' | 'auto';
}

/**
 * Hook principal pour la gestion de performance du BodyScan
 */
export const useBodyScanPerformance = (): BodyScanPerformanceConfig => {
  const { mode, isPerformanceMode } = usePerformanceMode();

  const config = useMemo<BodyScanPerformanceConfig>(() => {
    // MODE HIGH-PERFORMANCE (Mobile optimisé)
    if (mode === 'high-performance' || isPerformanceMode) {
      return {
        isPerformanceMode: true,
        mode: 'high-performance',

        // Désactiver toutes les animations Framer Motion
        enableFramerMotion: false,
        enableAnimatePresence: false,
        enableWhileHover: false,
        enableWhileTap: false,
        enableInitialAnimations: false,
        enableExitAnimations: false,
        enableStaggerAnimations: false,
        enableLoadingAnimations: false,

        // Désactiver animations CSS décoratives
        enableCSSAnimations: false,
        enableBreathingAnimations: false,
        enablePulseAnimations: false,
        enableParticleEffects: false,
        enableShimmerEffects: false,
        enableCelebrationEffects: false,

        // Désactiver effets GPU coûteux
        enableBackdropFilter: false,
        enableComplexShadows: false,
        enableGradientAnimations: false,
        enableBlurEffects: false,

        // Désactiver overlays et décorations
        enableScanLineOverlays: false,
        enableAnalysisGrids: false,
        enableDataParticles: false,
        enableGlowEffects: false,

        // Images: lazy loading par défaut
        imageLoadingStrategy: 'lazy',
        imageFetchPriority: 'auto',
      };
    }

    // MODE BALANCED (Desktop mid-range)
    if (mode === 'balanced') {
      return {
        isPerformanceMode: false,
        mode: 'balanced',

        // Animations Framer Motion réduites
        enableFramerMotion: true,
        enableAnimatePresence: true,
        enableWhileHover: true,
        enableWhileTap: true,
        enableInitialAnimations: true,
        enableExitAnimations: false,
        enableStaggerAnimations: true,
        enableLoadingAnimations: true,

        // Animations CSS modérées
        enableCSSAnimations: true,
        enableBreathingAnimations: true,
        enablePulseAnimations: true,
        enableParticleEffects: false,
        enableShimmerEffects: true,
        enableCelebrationEffects: true,

        // Effets GPU modérés
        enableBackdropFilter: true,
        enableComplexShadows: false,
        enableGradientAnimations: false,
        enableBlurEffects: true,

        // Overlays modérés
        enableScanLineOverlays: true,
        enableAnalysisGrids: true,
        enableDataParticles: false,
        enableGlowEffects: true,

        // Images: mix de stratégies
        imageLoadingStrategy: 'lazy',
        imageFetchPriority: 'auto',
      };
    }

    // MODE QUALITY (Desktop haute performance)
    return {
      isPerformanceMode: false,
      mode: 'quality',

      // Toutes les animations Framer Motion activées
      enableFramerMotion: true,
      enableAnimatePresence: true,
      enableWhileHover: true,
      enableWhileTap: true,
      enableInitialAnimations: true,
      enableExitAnimations: true,
      enableStaggerAnimations: true,
      enableLoadingAnimations: true,

      // Toutes les animations CSS activées
      enableCSSAnimations: true,
      enableBreathingAnimations: true,
      enablePulseAnimations: true,
      enableParticleEffects: true,
      enableShimmerEffects: true,
      enableCelebrationEffects: true,

      // Tous les effets GPU activés
      enableBackdropFilter: true,
      enableComplexShadows: true,
      enableGradientAnimations: true,
      enableBlurEffects: true,

      // Tous les overlays activés
      enableScanLineOverlays: true,
      enableAnalysisGrids: true,
      enableDataParticles: true,
      enableGlowEffects: true,

      // Images: priorité haute pour critique
      imageLoadingStrategy: 'eager',
      imageFetchPriority: 'high',
    };
  }, [mode, isPerformanceMode]);

  return config;
};

/**
 * Hook pour obtenir des variants Framer Motion conditionnels
 * Retourne undefined en mode performance pour désactiver les animations
 */
export const useBodyScanVariants = <T extends Record<string, any>>(
  variants: T
): T | undefined => {
  const { enableFramerMotion } = useBodyScanPerformance();
  return enableFramerMotion ? variants : undefined;
};

/**
 * Hook pour obtenir des transitions Framer Motion conditionnelles
 * Retourne undefined en mode performance pour désactiver les animations
 */
export const useBodyScanTransition = <T extends Record<string, any>>(
  transition: T
): T | undefined => {
  const { enableFramerMotion } = useBodyScanPerformance();
  return enableFramerMotion ? transition : undefined;
};

/**
 * Hook pour déterminer si un composant doit s'animer
 * Usage: const shouldAnimate = useBodyScanShouldAnimate();
 */
export const useBodyScanShouldAnimate = (): boolean => {
  const { enableCSSAnimations } = useBodyScanPerformance();
  return enableCSSAnimations;
};
