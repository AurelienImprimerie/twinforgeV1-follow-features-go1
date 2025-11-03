/**
 * ConditionalMotionProfile Component
 * Adaptive motion wrapper for Profile page components
 * Automatically switches between framer-motion and CSS based on device performance
 */

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import type { ProfilePerformanceConfig } from '../../hooks/useProfilePerformance';

interface ConditionalMotionProfileProps {
  children: React.ReactNode;
  performanceConfig: ProfilePerformanceConfig;
  variants?: Variants;
  initial?: string | object;
  animate?: string | object;
  exit?: string | object;
  className?: string;
  style?: React.CSSProperties;
  enableStagger?: boolean;
}

/**
 * Adaptive motion wrapper that uses framer-motion on high-end devices
 * and falls back to CSS transitions on low-end devices
 */
export const ConditionalMotionProfile: React.FC<ConditionalMotionProfileProps> = ({
  children,
  performanceConfig,
  variants,
  initial,
  animate,
  exit,
  className = '',
  style,
  enableStagger = false,
}) => {
  const { shouldUseFramerMotion, shouldUseStagger, enableTransitions } = performanceConfig;

  // Use framer-motion on high-end devices
  if (shouldUseFramerMotion && (!enableStagger || shouldUseStagger)) {
    return (
      <motion.div
        variants={variants}
        initial={initial}
        animate={animate}
        exit={exit}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  // Fallback to CSS transitions on low-end
  const fallbackClassName = enableTransitions
    ? `${className} profile-motion-fallback`
    : className;

  return (
    <div className={fallbackClassName} style={style}>
      {children}
    </div>
  );
};

/**
 * Stagger container wrapper
 */
export const ConditionalMotionStagger: React.FC<ConditionalMotionProfileProps> = (props) => {
  return <ConditionalMotionProfile {...props} enableStagger={true} />;
};

/**
 * Simple fade-in wrapper
 */
export const ConditionalMotionFade: React.FC<Omit<ConditionalMotionProfileProps, 'variants'>> = ({
  children,
  performanceConfig,
  className,
  style,
}) => {
  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: performanceConfig.animationDuration / 1000 }
    },
  };

  return (
    <ConditionalMotionProfile
      performanceConfig={performanceConfig}
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={style}
    >
      {children}
    </ConditionalMotionProfile>
  );
};

/**
 * Slide-in wrapper
 */
export const ConditionalMotionSlide: React.FC<Omit<ConditionalMotionProfileProps, 'variants'> & {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}> = ({
  children,
  performanceConfig,
  className,
  style,
  direction = 'up',
  distance = 20,
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
    }
  };

  const slideVariants: Variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: performanceConfig.animationDuration / 1000,
        ease: 'easeOut',
      }
    },
  };

  return (
    <ConditionalMotionProfile
      performanceConfig={performanceConfig}
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={style}
    >
      {children}
    </ConditionalMotionProfile>
  );
};
