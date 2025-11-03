import React from 'react';
import SkeletonBase from './SkeletonBase';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

export const SkeletonBar: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  shimmer?: boolean;
}> = ({ width = '100%', height = '16px', className = '', shimmer = true }) => (
  <SkeletonBase
    width={width}
    height={height}
    borderRadius="6px"
    className={className}
    shimmer={shimmer}
  />
);

export const SkeletonCircle: React.FC<{
  size?: number;
  className?: string;
  shimmer?: boolean;
}> = ({ size = 48, className = '', shimmer = true }) => (
  <SkeletonBase
    width={size}
    height={size}
    borderRadius="50%"
    className={className}
    shimmer={shimmer}
  />
);

export const SkeletonButton: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
}> = ({ width = '100%', height = '48px', className = '' }) => (
  <SkeletonBase
    width={width}
    height={height}
    borderRadius="12px"
    className={className}
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}
  />
);

export const SkeletonText: React.FC<{
  lines?: number;
  gap?: number;
  widths?: (string | number)[];
  className?: string;
}> = ({ lines = 3, gap = 8, widths, className = '' }) => {
  const defaultWidths = Array.from({ length: lines }, (_, i) => {
    if (i === lines - 1) return '60%';
    return '100%';
  });

  const lineWidths = widths || defaultWidths;

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBar key={i} width={lineWidths[i] || '100%'} height="14px" />
      ))}
    </div>
  );
};

export const SkeletonGrid: React.FC<{
  columns?: number;
  rows?: number;
  gap?: number;
  itemHeight?: string | number;
  className?: string;
}> = ({ columns = 3, rows = 1, gap = 16, itemHeight = '80px', className = '' }) => (
  <div
    className={className}
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap}px`
    }}
  >
    {Array.from({ length: columns * rows }).map((_, i) => (
      <SkeletonBase
        key={i}
        height={itemHeight}
        borderRadius="16px"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{
  width?: string | number;
  height?: string | number;
  padding?: string | number;
  children?: React.ReactNode;
  stepColor?: string;
  className?: string;
}> = ({
  width = '100%',
  height = 'auto',
  padding = '24px',
  children,
  stepColor = '#18E3FF',
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  if (isPerformanceMode) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          padding,
          background: `rgba(255, 255, 255, 0.06)`,
          border: `1.5px solid rgba(255, 255, 255, 0.12)`,
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width,
        height,
        padding,
        background: `
          radial-gradient(ellipse at 20% 10%, color-mix(in srgb, ${stepColor} 8%, transparent) 0%, transparent 50%),
          var(--liquid-glass-bg-elevated)
        `,
        border: `1.5px solid color-mix(in srgb, ${stepColor} 18%, rgba(255, 255, 255, 0.12))`,
        borderRadius: '20px',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
          animation: 'shimmer 2s infinite',
          pointerEvents: 'none'
        }}
      />
      {children}
    </div>
  );
};

export const SkeletonStatBox: React.FC<{
  stepColor?: string;
  className?: string;
}> = ({ stepColor = '#18E3FF', className = '' }) => (
  <div
    className={className}
    style={{
      background: 'rgba(255, 255, 255, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <SkeletonBar width="50%" height="32px" />
    <SkeletonBar width="70%" height="12px" />
  </div>
);
