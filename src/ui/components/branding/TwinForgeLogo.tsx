import React from 'react';
import ForgeHammerIcon from '../../icons/ForgeHammerIcon';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';

interface TwinForgeLogoProps {
  variant?: 'desktop' | 'mobile';
  isHovered?: boolean;
  className?: string;
}

export const TwinForgeLogo: React.FC<TwinForgeLogoProps> = ({
  variant = 'desktop',
  isHovered = false,
  className = ''
}) => {
  const isDesktop = variant === 'desktop';
  const { mode } = usePerformanceMode();

  // In high-performance mode, use solid color instead of gradient
  const isHighPerformance = mode === 'high-performance';

  // Solid orange color for ultra performance mode (no gradient)
  const solidColor = '#FF8C42';

  // Gradient for normal/balanced modes
  const gradientStyle = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDC830 100%)';

  if (isDesktop) {
    return (
      <div
        className={`flex items-center ${className}`}
        style={{
          transition: 'none',
          height: '100%'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0' }}>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '25px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              color: '#E5E7EB',
              lineHeight: 1,
              textTransform: 'uppercase',
              filter: 'none',
              transition: 'none'
            }}
          >
            TWIN
          </span>
          {/* Ultra performance: solid color | Normal: gradient */}
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '25px',
              fontWeight: 800,
              letterSpacing: '1.2px',
              color: isHighPerformance ? solidColor : 'transparent',
              background: isHighPerformance ? 'none' : gradientStyle,
              WebkitBackgroundClip: isHighPerformance ? 'unset' : 'text',
              WebkitTextFillColor: isHighPerformance ? solidColor : 'transparent',
              backgroundClip: isHighPerformance ? 'unset' : 'text',
              lineHeight: 1,
              textTransform: 'uppercase',
              filter: 'none',
              transition: 'none'
            }}
          >
            FØRGE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center ${className}`}
      style={{
        transition: 'none',
        gap: '8px',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <ForgeHammerIcon
          width={42}
          height={50}
          isHovered={isHovered}
        />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        alignItems: 'flex-start',
        justifyContent: 'center',
        transform: 'translateY(2px)'
      }}>
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.8px',
            color: '#E5E7EB',
            lineHeight: 1,
            textTransform: 'uppercase',
            filter: 'none',
            transition: 'none'
          }}
        >
          TWIN
        </span>
        {/* Ultra performance: solid color | Normal: gradient */}
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '15px',
            fontWeight: 800,
            letterSpacing: '0.8px',
            color: isHighPerformance ? solidColor : 'transparent',
            background: isHighPerformance ? 'none' : gradientStyle,
            WebkitBackgroundClip: isHighPerformance ? 'unset' : 'text',
            WebkitTextFillColor: isHighPerformance ? solidColor : 'transparent',
            backgroundClip: isHighPerformance ? 'unset' : 'text',
            lineHeight: 1,
            textTransform: 'uppercase',
            filter: 'none',
            transition: 'none'
          }}
        >
          FØRGE
        </span>
      </div>
    </div>
  );
};

export default TwinForgeLogo;
