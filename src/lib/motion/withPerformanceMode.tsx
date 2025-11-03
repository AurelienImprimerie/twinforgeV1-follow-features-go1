/**
 * withPerformanceMode HOC
 *
 * Higher-Order Component that injects performance mode state into components
 * Useful for class components or components that need performance mode as props
 *
 * Usage:
 * ```tsx
 * interface MyComponentProps {
 *   performanceMode: {
 *     isPerformanceMode: boolean;
 *     mode: 'high-performance' | 'balanced' | 'quality';
 *     isGlassEffectsEnabled: boolean;
 *   };
 * }
 *
 * const MyComponent: React.FC<MyComponentProps> = ({ performanceMode }) => {
 *   if (performanceMode.isPerformanceMode) {
 *     return <SimplifiedVersion />;
 *   }
 *   return <FullVersion />;
 * };
 *
 * export default withPerformanceMode(MyComponent);
 * ```
 */

import React from 'react';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

export interface WithPerformanceModeProps {
  performanceMode: {
    isPerformanceMode: boolean;
    mode: 'high-performance' | 'balanced' | 'quality';
    isGlassEffectsEnabled: boolean;
  };
}

/**
 * HOC that injects performance mode state as props
 */
export function withPerformanceMode<P extends WithPerformanceModeProps>(
  Component: React.ComponentType<P>
) {
  const WithPerformanceModeComponent = (props: Omit<P, 'performanceMode'>) => {
    const { isPerformanceMode, mode, isGlassEffectsEnabled } = usePerformanceMode();

    return (
      <Component
        {...(props as P)}
        performanceMode={{
          isPerformanceMode,
          mode,
          isGlassEffectsEnabled,
        }}
      />
    );
  };

  WithPerformanceModeComponent.displayName = `withPerformanceMode(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithPerformanceModeComponent;
}

/**
 * Utility function to check if animations should be enabled
 * Based on performance mode state
 */
export function shouldEnableAnimations(performanceMode: WithPerformanceModeProps['performanceMode']): boolean {
  return !performanceMode.isPerformanceMode;
}

/**
 * Utility function to check if complex effects should be enabled
 * Based on performance mode state
 */
export function shouldEnableComplexEffects(performanceMode: WithPerformanceModeProps['performanceMode']): boolean {
  return performanceMode.mode === 'quality' || performanceMode.mode === 'balanced';
}

/**
 * Utility function to get animation duration based on performance mode
 */
export function getAnimationDuration(
  performanceMode: WithPerformanceModeProps['performanceMode'],
  defaultDuration: number = 0.3
): number {
  if (performanceMode.isPerformanceMode) {
    return 0;
  }
  if (performanceMode.mode === 'balanced') {
    return defaultDuration * 0.75; // 25% faster in balanced mode
  }
  return defaultDuration; // Full duration in quality mode
}

/**
 * Utility function to get stagger delay based on performance mode
 */
export function getStaggerDelay(
  performanceMode: WithPerformanceModeProps['performanceMode'],
  defaultDelay: number = 0.1
): number {
  if (performanceMode.isPerformanceMode) {
    return 0;
  }
  if (performanceMode.mode === 'balanced') {
    return defaultDelay * 0.5; // Halve delay in balanced mode
  }
  return defaultDelay; // Full delay in quality mode
}

export default withPerformanceMode;
