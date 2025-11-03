import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

interface GlassCardCTAProps {
  children: React.ReactNode;
  className?: string;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const GlassCardCTA = React.forwardRef<HTMLDivElement, GlassCardCTAProps>(
  ({ children, className, color, onClick, disabled = false, style }, ref) => {
    const reduceMotion = useReducedMotion();
    const { isPerformanceMode } = usePerformanceMode();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const shouldAnimate = !reduceMotion && !isMobile && !isPerformanceMode;

    return (
      <motion.div
        ref={ref}
        onClick={disabled ? undefined : onClick}
        className={clsx(
          'glass-card-cta relative rounded-3xl p-6',
          'transform-gpu will-transform',
          !disabled && 'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={{
          '--cta-color': color,
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${color} 15%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, ${color} 10%, transparent) 0%, transparent 60%),
            rgba(255, 255, 255, 0.08)
          `,
          border: `2px solid color-mix(in srgb, ${color} 25%, transparent)`,
          boxShadow: `
            0 4px 16px rgba(0, 0, 0, 0.2),
            0 0 32px color-mix(in srgb, ${color} 20%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
          `,
          isolation: 'isolate',
          position: 'relative',
          ...style,
        } as React.CSSProperties}
        whileHover={
          !disabled && shouldAnimate
            ? {
                scale: 1.02,
                y: -4,
                boxShadow: `
                  0 8px 24px rgba(0, 0, 0, 0.25),
                  0 0 48px color-mix(in srgb, ${color} 30%, transparent),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                transition: {
                  duration: 0.3,
                  ease: 'easeOut',
                },
              }
            : {}
        }
        whileTap={
          !disabled && shouldAnimate
            ? {
                scale: 0.98,
                y: 0,
                transition: {
                  duration: 0.15,
                  ease: 'easeOut',
                },
              }
            : {}
        }
        animate={
          !disabled && shouldAnimate
            ? {
                boxShadow: [
                  `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 32px color-mix(in srgb, ${color} 20%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                  `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 40px color-mix(in srgb, ${color} 25%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                  `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 32px color-mix(in srgb, ${color} 20%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                ],
              }
            : {}
        }
        transition={{
          boxShadow: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            opacity: 0.6,
          }}
        />

        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCardCTA.displayName = 'GlassCardCTA';

export default GlassCardCTA;
