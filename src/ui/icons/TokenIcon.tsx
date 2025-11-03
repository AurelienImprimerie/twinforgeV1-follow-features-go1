import React from 'react';

interface TokenIconProps {
  size?: number;
  variant?: 'normal' | 'warning' | 'critical' | 'success';
  className?: string;
  withGlow?: boolean;
  customColor?: string;
}

const TokenIcon: React.FC<TokenIconProps> = ({
  size = 32,
  variant = 'normal',
  className = '',
  withGlow = true,
  customColor
}) => {
  const getColors = () => {
    if (customColor) {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 255, g: 107, b: 53 };
      };
      const rgb = hexToRgb(customColor);
      return {
        gradientStart: customColor,
        gradientMid: customColor,
        gradientEnd: customColor,
        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
        glowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
      };
    }

    switch (variant) {
      case 'critical':
        return {
          gradientStart: '#EF4444',
          gradientMid: '#F87171',
          gradientEnd: '#FCA5A5',
          borderColor: 'rgba(239, 68, 68, 0.5)',
          glowColor: 'rgba(239, 68, 68, 0.4)'
        };
      case 'warning':
        return {
          gradientStart: '#F59E0B',
          gradientMid: '#FBBF24',
          gradientEnd: '#FCD34D',
          borderColor: 'rgba(245, 158, 11, 0.5)',
          glowColor: 'rgba(245, 158, 11, 0.4)'
        };
      case 'success':
        return {
          gradientStart: '#10B981',
          gradientMid: '#34D399',
          gradientEnd: '#6EE7B7',
          borderColor: 'rgba(16, 185, 129, 0.5)',
          glowColor: 'rgba(16, 185, 129, 0.4)'
        };
      default:
        return {
          gradientStart: '#FF6B35',
          gradientMid: '#F7931E',
          gradientEnd: '#FDC830',
          borderColor: 'rgba(247, 147, 30, 0.5)',
          glowColor: 'rgba(253, 200, 48, 0.4)'
        };
    }
  };

  const colors = getColors();
  const viewBoxSize = 100;
  const center = viewBoxSize / 2;
  const radius = 42;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        filter: withGlow ? `drop-shadow(0 0 ${size / 4}px ${colors.glowColor})` : 'none'
      }}
    >
      <defs>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap');
            .token-text {
              font-family: 'Montserrat', sans-serif;
              font-weight: 800;
              font-style: normal;
              text-anchor: middle;
              dominant-baseline: central;
            }
          `}
        </style>

        <linearGradient id={`tokenGradient-${variant}-${customColor || 'default'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.gradientStart} />
          <stop offset="50%" stopColor={colors.gradientMid} />
          <stop offset="100%" stopColor={colors.gradientEnd} />
        </linearGradient>

        <linearGradient id={`borderGradient-${variant}-${customColor || 'default'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.gradientStart} stopOpacity="0.8" />
          <stop offset="50%" stopColor={colors.gradientMid} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.gradientEnd} stopOpacity="0.8" />
        </linearGradient>

        <filter id={`innerGlow-${variant}-${customColor || 'default'}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <radialGradient id={`shine-${variant}-${customColor || 'default'}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
          <stop offset="60%" stopColor="rgba(255, 255, 255, 0.1)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </radialGradient>
      </defs>

      <circle
        cx={center}
        cy={center}
        r={radius}
        fill={`url(#shine-${variant}-${customColor || 'default'})`}
        opacity="0.6"
      />

      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="rgba(0, 0, 0, 0.25)"
        stroke={`url(#borderGradient-${variant}-${customColor || 'default'})`}
        strokeWidth="3"
        filter={`url(#innerGlow-${variant}-${customColor || 'default'})`}
      />

      <text
        x={center}
        y={center + 2}
        className="token-text"
        fontSize="48"
        fill={`url(#tokenGradient-${variant}-${customColor || 'default'})`}
        filter={`url(#innerGlow-${variant}-${customColor || 'default'})`}
      >
        T
      </text>
    </svg>
  );
};

export default TokenIcon;
