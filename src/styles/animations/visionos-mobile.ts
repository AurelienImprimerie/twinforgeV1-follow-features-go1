/**
 * VisionOS 26 Mobile Animations
 * Framer Motion variants optimized for mobile performance
 * Now integrated with performance mode system
 */

import { Variants } from 'framer-motion';

/**
 * Detect if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get performance mode from body classes
 * This allows variants to be aware of the current performance mode
 */
export function getPerformanceMode(): {
  isPerformanceMode: boolean;
  mode: 'quality' | 'balanced' | 'high-performance';
} {
  const body = document.body;
  const isPerformanceMode = body.classList.contains('performance-mode');

  let mode: 'quality' | 'balanced' | 'high-performance' = 'quality';

  if (body.classList.contains('mode-balanced')) {
    mode = 'balanced';
  } else if (isPerformanceMode) {
    mode = 'high-performance';
  }

  return { isPerformanceMode, mode };
}

/**
 * Get animation config based on device capabilities, user preferences, and performance mode
 */
export function getAnimationConfig() {
  const reducedMotion = prefersReducedMotion();
  const { isPerformanceMode, mode } = getPerformanceMode();

  // High-performance mode: no animations
  if (isPerformanceMode) {
    return {
      reducedMotion: true,
      duration: 0,
      stiffness: 0,
      damping: 0,
    };
  }

  // Balanced mode: faster animations
  if (mode === 'balanced') {
    return {
      reducedMotion,
      duration: reducedMotion ? 0 : 0.2,
      stiffness: reducedMotion ? 0 : 350,
      damping: reducedMotion ? 0 : 28,
    };
  }

  // Quality mode: full animations
  return {
    reducedMotion,
    duration: reducedMotion ? 0 : 0.3,
    stiffness: reducedMotion ? 0 : 400,
    damping: reducedMotion ? 0 : 30,
  };
}

/**
 * Tab transition variants
 */
export const tabTransitions: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  enter: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    },
  }),
};

/**
 * Section card variants with staggered children
 */
export const sectionCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Field variants for form inputs
 */
export const fieldVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

/**
 * Success checkmark animation
 */
export const successCheckVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/**
 * Glow pulse for active elements
 */
export const glowPulseVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
  },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(255, 255, 255, 0)',
      '0 0 20px 4px rgba(255, 255, 255, 0.4)',
      '0 0 0 0 rgba(255, 255, 255, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Ripple effect for touch interactions
 */
export const rippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.5,
  },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Modal/Overlay variants
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Backdrop blur variants
 */
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Toast notification variants
 */
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Badge notification variants
 */
export const badgeVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Loading spinner variants
 */
export const spinnerVariants: Variants = {
  initial: {
    rotate: 0,
  },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Breathing/Pulsing animation
 */
export const breathingVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.8,
  },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Shake animation for errors
 */
export const shakeVariants: Variants = {
  initial: {
    x: 0,
  },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

/**
 * Bounce animation for attention
 */
export const bounceVariants: Variants = {
  initial: {
    y: 0,
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: 2,
    },
  },
};

/**
 * Fade in up animation
 */
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

/**
 * Slide in from side
 */
export const slideInVariants: Variants = {
  left: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  right: {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  top: {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  bottom: {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
};

/**
 * Scale pop animation
 */
export const scalePopVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Stagger container for lists
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * List item variants
 */
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

/**
 * Get simplified variants based on performance mode
 * This is the key function for adapting variants to performance mode
 */
export function getOptimizedVariants(variants: Variants): Variants {
  const config = getAnimationConfig();
  const { isPerformanceMode, mode } = getPerformanceMode();

  // High-performance mode: return empty object (no animations)
  if (isPerformanceMode || config.reducedMotion) {
    return Object.keys(variants).reduce((acc, key) => {
      const variantValue = variants[key];
      if (typeof variantValue === 'function') {
        acc[key] = variantValue;
      } else {
        acc[key] = {
          ...(variantValue as object),
          transition: { duration: 0 },
        };
      }
      return acc;
    }, {} as Variants);
  }

  // Balanced mode: adjust durations
  if (mode === 'balanced') {
    return Object.keys(variants).reduce((acc, key) => {
      const variantValue = variants[key];
      if (typeof variantValue === 'function') {
        acc[key] = variantValue;
      } else {
        const variant = variantValue as any;
        acc[key] = {
          ...variant,
          transition: variant.transition
            ? {
                ...variant.transition,
                duration: variant.transition.duration ? variant.transition.duration * 0.75 : config.duration,
                staggerChildren: variant.transition.staggerChildren
                  ? variant.transition.staggerChildren * 0.5
                  : undefined,
              }
            : { duration: config.duration },
        };
      }
      return acc;
    }, {} as Variants);
  }

  // Quality mode: return variants as-is
  return variants;
}

/**
 * Helper to create performance-aware variant getter
 * Returns a function that evaluates variants at runtime based on performance mode
 */
export function createPerformanceAwareVariants(variants: Variants) {
  return () => getOptimizedVariants(variants);
}

/**
 * Performance-aware exports - these return functions that evaluate at runtime
 */
export const getTabTransitions = () => getOptimizedVariants(tabTransitions);
export const getSectionCardVariants = () => getOptimizedVariants(sectionCardVariants);
export const getFieldVariants = () => getOptimizedVariants(fieldVariants);
export const getSuccessCheckVariants = () => getOptimizedVariants(successCheckVariants);
export const getGlowPulseVariants = () => getOptimizedVariants(glowPulseVariants);
export const getRippleVariants = () => getOptimizedVariants(rippleVariants);
export const getModalVariants = () => getOptimizedVariants(modalVariants);
export const getBackdropVariants = () => getOptimizedVariants(backdropVariants);
export const getToastVariants = () => getOptimizedVariants(toastVariants);
export const getBadgeVariants = () => getOptimizedVariants(badgeVariants);
export const getSpinnerVariants = () => getOptimizedVariants(spinnerVariants);
export const getBreathingVariants = () => getOptimizedVariants(breathingVariants);
export const getShakeVariants = () => getOptimizedVariants(shakeVariants);
export const getBounceVariants = () => getOptimizedVariants(bounceVariants);
export const getFadeInUpVariants = () => getOptimizedVariants(fadeInUpVariants);
export const getSlideInVariants = () => getOptimizedVariants(slideInVariants);
export const getScalePopVariants = () => getOptimizedVariants(scalePopVariants);
export const getStaggerContainerVariants = () => getOptimizedVariants(staggerContainerVariants);
export const getListItemVariants = () => getOptimizedVariants(listItemVariants);

export default {
  // Static variants (legacy - use getter functions above for performance mode support)
  tabTransitions,
  sectionCardVariants,
  fieldVariants,
  successCheckVariants,
  glowPulseVariants,
  rippleVariants,
  modalVariants,
  backdropVariants,
  toastVariants,
  badgeVariants,
  spinnerVariants,
  breathingVariants,
  shakeVariants,
  bounceVariants,
  fadeInUpVariants,
  slideInVariants,
  scalePopVariants,
  staggerContainerVariants,
  listItemVariants,

  // Performance-aware getter functions (recommended)
  getTabTransitions,
  getSectionCardVariants,
  getFieldVariants,
  getSuccessCheckVariants,
  getGlowPulseVariants,
  getRippleVariants,
  getModalVariants,
  getBackdropVariants,
  getToastVariants,
  getBadgeVariants,
  getSpinnerVariants,
  getBreathingVariants,
  getShakeVariants,
  getBounceVariants,
  getFadeInUpVariants,
  getSlideInVariants,
  getScalePopVariants,
  getStaggerContainerVariants,
  getListItemVariants,

  // Utilities
  getOptimizedVariants,
  getAnimationConfig,
  getPerformanceMode,
  prefersReducedMotion,
  createPerformanceAwareVariants,
};
