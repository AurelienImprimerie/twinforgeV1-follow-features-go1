/**
 * useConditionalAnimation
 *
 * Hook for conditional animation properties based on performance mode
 * Provides optimized animation configs and variants
 *
 * Usage:
 * ```tsx
 * const { variants, shouldAnimate, animationConfig } = useConditionalAnimation({
 *   variants: myVariants,
 *   enabledInBalanced: true,
 * });
 *
 * return (
 *   <motion.div
 *     variants={variants}
 *     animate={shouldAnimate ? 'visible' : false}
 *     {...animationConfig}
 *   >
 *     content
 *   </motion.div>
 * );
 * ```
 */

import { Variants } from 'framer-motion';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

export interface ConditionalAnimationOptions {
  /**
   * Animation variants to use
   */
  variants?: Variants;

  /**
   * Whether animations are enabled in balanced mode (default: true)
   */
  enabledInBalanced?: boolean;

  /**
   * Default animation duration (will be adjusted based on performance mode)
   */
  duration?: number;

  /**
   * Default stagger delay for children (will be adjusted based on performance mode)
   */
  staggerDelay?: number;
}

export interface ConditionalAnimationResult {
  /**
   * Optimized variants (empty object in performance mode)
   */
  variants: Variants;

  /**
   * Whether animations should be active
   */
  shouldAnimate: boolean;

  /**
   * Optimized animation configuration
   */
  animationConfig: {
    transition?: {
      duration: number;
      staggerChildren?: number;
      type?: string;
      stiffness?: number;
      damping?: number;
    };
  };

  /**
   * Performance mode state
   */
  performanceMode: {
    isPerformanceMode: boolean;
    mode: 'high-performance' | 'balanced' | 'quality';
    isGlassEffectsEnabled: boolean;
  };
}

/**
 * Hook that provides conditional animation configuration based on performance mode
 */
export function useConditionalAnimation(
  options: ConditionalAnimationOptions = {}
): ConditionalAnimationResult {
  const {
    variants = {},
    enabledInBalanced = true,
    duration = 0.3,
    staggerDelay = 0.1,
  } = options;

  const { isPerformanceMode, mode, isGlassEffectsEnabled } = usePerformanceMode();

  // Determine if animations should be active
  const shouldAnimate = !isPerformanceMode && (mode === 'quality' || (mode === 'balanced' && enabledInBalanced));

  // Return optimized variants and config
  if (!shouldAnimate) {
    return {
      variants: {},
      shouldAnimate: false,
      animationConfig: {
        transition: {
          duration: 0,
        },
      },
      performanceMode: {
        isPerformanceMode,
        mode,
        isGlassEffectsEnabled,
      },
    };
  }

  // Adjust timing for balanced mode
  const adjustedDuration = mode === 'balanced' ? duration * 0.75 : duration;
  const adjustedStagger = mode === 'balanced' ? staggerDelay * 0.5 : staggerDelay;

  return {
    variants,
    shouldAnimate: true,
    animationConfig: {
      transition: {
        duration: adjustedDuration,
        staggerChildren: adjustedStagger,
        type: 'spring',
        stiffness: 400,
        damping: 30,
      },
    },
    performanceMode: {
      isPerformanceMode,
      mode,
      isGlassEffectsEnabled,
    },
  };
}

/**
 * Hook for simple fade animations with performance optimization
 */
export function useFadeAnimation(enabledInBalanced: boolean = true) {
  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return useConditionalAnimation({
    variants: fadeVariants,
    enabledInBalanced,
    duration: 0.2,
  });
}

/**
 * Hook for slide-up animations with performance optimization
 */
export function useSlideUpAnimation(enabledInBalanced: boolean = true) {
  const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return useConditionalAnimation({
    variants: slideUpVariants,
    enabledInBalanced,
    duration: 0.3,
  });
}

/**
 * Hook for scale animations with performance optimization
 */
export function useScaleAnimation(enabledInBalanced: boolean = true) {
  const scaleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return useConditionalAnimation({
    variants: scaleVariants,
    enabledInBalanced,
    duration: 0.25,
  });
}

/**
 * Hook for stagger container animations with performance optimization
 */
export function useStaggerAnimation(staggerDelay: number = 0.1, enabledInBalanced: boolean = true) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const result = useConditionalAnimation({
    variants: containerVariants,
    enabledInBalanced,
    staggerDelay,
  });

  return {
    ...result,
    itemVariants: result.shouldAnimate ? itemVariants : {},
  };
}

export default useConditionalAnimation;
