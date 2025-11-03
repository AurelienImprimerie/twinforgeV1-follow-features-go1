/**
 * ConditionalMotionWrapper
 *
 * Simplified wrapper for migrating components to use ConditionalMotion
 * Automatically handles performance mode detection and variant optimization
 *
 * Usage:
 * ```tsx
 * // Before:
 * <motion.div variants={fadeIn} initial="hidden" animate="visible">
 *   content
 * </motion.div>
 *
 * // After:
 * <ConditionalMotionWrapper variants={fadeIn} initial="hidden" animate="visible">
 *   content
 * </ConditionalMotionWrapper>
 * ```
 */

import React from 'react';
import { ConditionalMotion, ConditionalMotionProps } from './ConditionalMotion';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

interface ConditionalMotionWrapperProps extends Omit<ConditionalMotionProps, 'component'> {
  /**
   * HTML element type to render (default: 'div')
   */
  component?: 'div' | 'span' | 'button' | 'section' | 'article' | 'nav' | 'header' | 'footer' | 'aside' | 'main';

  /**
   * Children to render
   */
  children?: React.ReactNode;
}

/**
 * Wrapper component that simplifies migration from motion.div to ConditionalMotion
 */
export const ConditionalMotionWrapper: React.FC<ConditionalMotionWrapperProps> = ({
  component = 'div',
  children,
  ...motionProps
}) => {
  const { isPerformanceMode, mode } = usePerformanceMode();

  // In high-performance mode, render static element with performance classes
  if (isPerformanceMode) {
    const Component = component;
    const { className = '', ...restProps } = motionProps;

    return (
      <Component
        {...(restProps as any)}
        className={`${className} performance-mode no-animations`.trim()}
      >
        {children}
      </Component>
    );
  }

  // In balanced/quality mode, use ConditionalMotion
  return (
    <ConditionalMotion
      component={component}
      {...motionProps}
    >
      {children}
    </ConditionalMotion>
  );
};

/**
 * Pre-configured wrapper for common motion.div usage
 */
export const MotionDiv: React.FC<ConditionalMotionWrapperProps> = (props) => {
  return <ConditionalMotionWrapper component="div" {...props} />;
};

/**
 * Pre-configured wrapper for common motion.span usage
 */
export const MotionSpan: React.FC<ConditionalMotionWrapperProps> = (props) => {
  return <ConditionalMotionWrapper component="span" {...props} />;
};

/**
 * Pre-configured wrapper for common motion.button usage
 */
export const MotionButton: React.FC<ConditionalMotionWrapperProps> = (props) => {
  return <ConditionalMotionWrapper component="button" {...props} />;
};

/**
 * Pre-configured wrapper for common motion.section usage
 */
export const MotionSection: React.FC<ConditionalMotionWrapperProps> = (props) => {
  return <ConditionalMotionWrapper component="section" {...props} />;
};

export default ConditionalMotionWrapper;
