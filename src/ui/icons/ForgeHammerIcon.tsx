import React from 'react';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

interface ForgeHammerIconProps {
  width?: number;
  height?: number;
  className?: string;
  isHovered?: boolean;
}

export const ForgeHammerIcon: React.FC<ForgeHammerIconProps> = ({
  width = 85,
  height = 70,
  className = '',
  isHovered = false
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const uniqueId = React.useId();
  const gradId = `forgeGrad-${uniqueId}`;
  const gradHoverId = `forgeGradHover-${uniqueId}`;
  const filterId = `hammerGlow-${uniqueId}`;

  return (
    <svg
      viewBox="0 0 85 70"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: isPerformanceMode
          ? 'none'
          : (isHovered
            ? 'drop-shadow(0 0 12px rgba(253, 200, 48, 0.5))'
            : 'drop-shadow(0 0 6px rgba(247, 147, 30, 0.3))')
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#F7931E', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FDC830', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id={gradHoverId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        </linearGradient>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M 20 10 L 85 10 L 85 28 L 65 28 L 65 70 L 40 70 L 40 28 L 20 28 Z"
        fill={isPerformanceMode ? `url(#${gradId})` : (isHovered ? `url(#${gradHoverId})` : `url(#${gradId})`)}
        filter={isPerformanceMode ? 'none' : `url(#${filterId})`}
        stroke="rgba(15, 23, 42, 0.8)"
        strokeWidth="2.5"
      />

      <path
        d="M 23 13 L 82 13 L 82 25 L 65 25 L 65 67 L 40 67 L 40 25 L 23 25 Z"
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Cercles décoratifs statiques - sans animation */}
      <circle cx="80" cy="18" r="3" fill="#FDC830" opacity={isHovered ? 1 : 0.9} />
      <circle cx="25" cy="16" r="2.5" fill="#FF6B35" opacity={isHovered ? 0.9 : 0.8} />
      <circle cx="75" cy="24" r="2" fill="#FDC830" opacity={isHovered ? 0.8 : 0.7} />
      <circle cx="52" cy="12" r="2.5" fill="#F7931E" opacity={isHovered ? 0.9 : 0.75} />
    </svg>
  );
};

export default ForgeHammerIcon;
