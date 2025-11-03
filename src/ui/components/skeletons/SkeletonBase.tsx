import React from 'react';
import { ConditionalMotion } from '../../../lib/motion';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

interface SkeletonBaseProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  shimmer?: boolean;
  pulse?: boolean;
}

/**
 * SkeletonBase - Version optimisée avec ConditionalMotion
 *
 * Mode Quality: Animations Framer Motion complètes
 * Mode Performance: Animations CSS simplifiées
 */
const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
  style = {},
  shimmer = true,
  pulse = false
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  const baseStyle: React.CSSProperties = {
    width,
    height,
    borderRadius,
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  // MODE PERFORMANCE: CSS classes uniquement
  if (isPerformanceMode) {
    const performanceClasses = [
      'skeleton-performance-base',
      shimmer && 'skeleton-shimmer-performance',
      pulse && 'skeleton-pulse-performance',
      className
    ].filter(Boolean).join(' ');

    return (
      <div
        className={performanceClasses}
        style={{
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.06)',
        }}
      />
    );
  }

  // MODE QUALITY: Framer Motion avec animations riches
  const shimmerAnimation = shimmer ? {
    animate: {
      backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    },
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
      backgroundSize: '200% 100%'
    }
  } : {};

  const pulseAnimation = pulse ? {
    animate: {
      opacity: [0.6, 1, 0.6]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  } : {};

  return (
    <ConditionalMotion
      className={className}
      style={shimmer || pulse ? undefined : { ...baseStyle, background: 'rgba(255, 255, 255, 0.08)' }}
      {...(shimmer ? shimmerAnimation : {})}
      {...(pulse ? pulseAnimation : {})}
    />
  );
};

export default SkeletonBase;
