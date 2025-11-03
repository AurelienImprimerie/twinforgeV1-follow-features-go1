/**
 * Motion Library - Performance-Aware Animation System
 * Centralized exports for all motion utilities
 */

// Core ConditionalMotion system
export {
  ConditionalMotion,
  ConditionalAnimatePresence,
  useConditionalVariants,
  useConditionalTransition,
  motionClasses
} from './ConditionalMotion';

// Migration utilities
export {
  ConditionalMotionWrapper,
  MotionDiv,
  MotionSpan,
  MotionButton,
  MotionSection,
} from './ConditionalMotionWrapper';

export {
  withPerformanceMode,
  shouldEnableAnimations,
  shouldEnableComplexEffects,
  getAnimationDuration,
  getStaggerDelay,
} from './withPerformanceMode';

export type { WithPerformanceModeProps } from './withPerformanceMode';

export {
  useConditionalAnimation,
  useFadeAnimation,
  useSlideUpAnimation,
  useScaleAnimation,
  useStaggerAnimation,
} from './useConditionalAnimation';

export type {
  ConditionalAnimationOptions,
  ConditionalAnimationResult
} from './useConditionalAnimation';
