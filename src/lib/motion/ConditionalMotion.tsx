import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps, AnimatePresenceProps } from 'framer-motion';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

/**
 * ConditionalMotion - Wrapper intelligent pour Framer Motion
 *
 * Mode Quality (Desktop): Utilise Framer Motion complet
 * Mode Performance (Mobile): Utilise HTML standard + CSS classes
 */

type ConditionalMotionProps = HTMLMotionProps<'div'> & {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
};

export const ConditionalMotion = React.forwardRef<HTMLDivElement, ConditionalMotionProps>(
  ({ children, as = 'div', className = '', whileHover, whileTap, animate, initial, exit, variants, transition, ...props }, ref) => {
    const { mode, isPerformanceMode } = usePerformanceMode();

    // High-performance mode: Use plain HTML with CSS classes
    if (isPerformanceMode) {
      const Component = as as any;

      // Map Framer Motion props to CSS classes
      const performanceClasses = [
        className,
        whileHover && 'motion-hover-mobile',
        whileTap && 'motion-tap-mobile',
        animate && typeof animate === 'object' && 'animate' in animate && 'motion-fade-in-mobile'
      ].filter(Boolean).join(' ');

      return (
        <Component ref={ref} className={performanceClasses} {...props}>
          {children}
        </Component>
      );
    }

    // Balanced mode: Use Framer Motion but with simplified animations
    if (mode === 'balanced') {
      const MotionComponent = motion[as] as any;

      // Simplified transition for balanced mode
      const balancedTransition = transition
        ? { ...transition, duration: (transition as any).duration ? (transition as any).duration * 0.6 : 0.3 }
        : { duration: 0.3, ease: 'easeOut' };

      return (
        <MotionComponent
          ref={ref}
          className={className}
          whileHover={whileHover}
          whileTap={whileTap}
          animate={animate}
          initial={initial}
          exit={exit}
          variants={variants}
          transition={balancedTransition}
          {...props}
        >
          {children}
        </MotionComponent>
      );
    }

    // Quality mode: Full Framer Motion with all effects
    const MotionComponent = motion[as] as any;

    return (
      <MotionComponent
        ref={ref}
        className={className}
        whileHover={whileHover}
        whileTap={whileTap}
        animate={animate}
        initial={initial}
        exit={exit}
        variants={variants}
        transition={transition}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

ConditionalMotion.displayName = 'ConditionalMotion';

/**
 * ConditionalAnimatePresence - Wrapper pour AnimatePresence
 *
 * Mode Quality: AnimatePresence complet
 * Mode Performance: Fragment simple (pas d'animations)
 */
type ConditionalAnimatePresenceProps = AnimatePresenceProps & {
  children: React.ReactNode;
};

export const ConditionalAnimatePresence: React.FC<ConditionalAnimatePresenceProps> = ({
  children,
  mode: presenceMode,
  initial = true,
  ...props
}) => {
  const { mode, isPerformanceMode } = usePerformanceMode();

  // High-performance mode: No AnimatePresence, just render children
  if (isPerformanceMode) {
    return <>{children}</>;
  }

  // Balanced and Quality modes: Use AnimatePresence
  return (
    <AnimatePresence mode={presenceMode} initial={initial} {...props}>
      {children}
    </AnimatePresence>
  );
};

/**
 * Hook pour variants conditionnels
 */
export const useConditionalVariants = <T extends Record<string, any>>(variants: T): T | undefined => {
  const { isPerformanceMode } = usePerformanceMode();
  return isPerformanceMode ? undefined : variants;
};

/**
 * Hook pour transitions conditionnelles
 */
export const useConditionalTransition = <T extends Record<string, any>>(transition: T): T | undefined => {
  const { isPerformanceMode } = usePerformanceMode();
  return isPerformanceMode ? undefined : transition;
};

/**
 * Classes CSS de remplacement pour mode performance
 */
export const motionClasses = {
  hover: 'motion-hover-mobile',
  tap: 'motion-tap-mobile',
  fadeIn: 'motion-fade-in-mobile',
  slideIn: 'motion-slide-in-mobile',
  pulse: 'pulse-mobile-static',
  breathing: 'breathing-mobile-static'
} as const;
