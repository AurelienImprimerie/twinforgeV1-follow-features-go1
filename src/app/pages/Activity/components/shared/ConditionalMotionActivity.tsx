/**
 * ConditionalMotionActivity Component
 * Intelligent wrapper for Framer Motion in Activity module
 * Respects performance mode and adapts animation parameters
 */

import { motion, MotionProps } from 'framer-motion';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import React from 'react';

interface ConditionalMotionActivityProps extends MotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  forceStatic?: boolean;
  animationType?: 'standard' | 'complex' | 'ring' | 'particle' | 'rotation';
}

export const ConditionalMotionActivity: React.FC<ConditionalMotionActivityProps> = ({
  children,
  fallback,
  forceStatic = false,
  animationType = 'standard',
  initial,
  animate,
  exit,
  transition,
  ...props
}) => {
  const perf = useActivityPerformance();

  const shouldDisable = forceStatic || !perf.enableAnimations || (
    animationType === 'complex' && !perf.enableComplexEffects
  ) || (
    animationType === 'ring' && !perf.enableRings
  ) || (
    animationType === 'particle' && !perf.enableParticles
  ) || (
    animationType === 'rotation' && !perf.enableRotations
  );

  if (shouldDisable) {
    const FallbackComponent = fallback || (
      <div {...(props as any)}>{children}</div>
    );
    return <>{FallbackComponent}</>;
  }

  const adaptedTransition = transition ? {
    ...transition,
    duration: typeof transition === 'object' && 'duration' in transition
      ? Math.min((transition as any).duration, perf.transitionDuration * 2)
      : perf.transitionDuration,
    delay: typeof transition === 'object' && 'delay' in transition
      ? Math.min((transition as any).delay, perf.staggerDelay * 2)
      : perf.animationDelay,
  } : {
    duration: perf.transitionDuration,
    delay: perf.animationDelay,
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={adaptedTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
};
