/**
 * Design Kernel - VisionOS26+ Premium System
 * Central design tokens and utilities for ultra-premium experience
 */

export const designKernel = {
  // Glass V2 System
  glass: {
    // Radius / Blur / Opacity tokens - Apple OS26 aligned
    radius: {
      sm: '12px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '28px'
    },
    blur: { sm: '8px', base: '16px', lg: '20px', xl: '24px' },
    opacity: {
      background: 0.04,  // Lighter for Apple OS26
      backgroundElevated: 0.06,
      border: 0.12,      // Reduced from 0.18
      borderSubtle: 0.08,
      tint: 0.03,
      hover: 0.08,
      active: 0.04
    },

    // Visual styling tokens
    stroke: 'rgba(255,255,255,0.12)',
    strokeSubtle: 'rgba(255,255,255,0.08)',
    innerHighlight: 'rgba(255,255,255,0.08)',
    shadow: '0 12px 36px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)',
    background: `
      radial-gradient(1100px 720px at 50% -10%, rgba(255,255,255,0.08), transparent 58%),
      linear-gradient(180deg, rgba(18,24,40,0.78), rgba(14,18,32,0.86))
    `,
    saturate: '150%',  // Increased for visionOS feel
  },
  
  // Animation System
  animation: {
    // Unified motion timings for VisionOS-like feel
    hoverMs: 180,
    tapMs: 110,
    focusMs: 160,
    ease: [0.22, 0.55, 0.12, 0.98] as [number, number, number, number],
    
    curves: {
      glass: 'cubic-bezier(0.16, 1, 0.3, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    durations: {
      fast: 150,
      base: 200,
      slow: 300,
      slower: 500,
    },
    scales: {
      hover: 1.02,
      active: 0.985,
      press: 0.95,
    },
  },
  
  // Typography Scale
  typography: {
    scales: {
      xs: { size: '0.75rem', lineHeight: 1.5 },
      sm: { size: '0.875rem', lineHeight: 1.5 },
      base: { size: '1rem', lineHeight: 1.5 },
      lg: { size: '1.125rem', lineHeight: 1.4 },
      xl: { size: '1.25rem', lineHeight: 1.4 },
      '2xl': { size: '1.5rem', lineHeight: 1.3 },
      '3xl': { size: '1.875rem', lineHeight: 1.2 },
      '4xl': { size: '2.25rem', lineHeight: 1.2 },
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
  },
  
  // Spacing System (8px grid) - Apple OS26 aligned
  spacing: {
    unit: 8,
    scales: {
      xs: 4,
      sm: 8,
      base: 12,
      md: 16,
      lg: 20,
      xl: 24,
      '2xl': 32,
      '3xl': 48,
      '4xl': 64,
    },
    // Card-specific spacing for exercise cards
    card: {
      padding: {
        mobile: 16,
        tablet: 20,
        desktop: 24,
      },
      gap: {
        section: 16,      // Gap between major card sections
        element: 12,      // Gap between related elements
        tight: 8,         // Tight spacing within components
        chips: 8,         // Spacing between chips/tags
      },
      margin: {
        top: 20,          // Top margin for card sections
        bottom: 20,       // Bottom margin for card sections
        horizontal: 16,   // Horizontal margin on mobile
      },
    },
    optimizations: {
      willChangeTimeout: 250,
      debounceResize: 16,
      throttleScroll: 16,
    },
  },
  
  // Breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
  
  // Accessibility
  a11y: {
    touchTargets: {
      minimum: 44,
      recommended: 48,
    },
    focusRing: {
      width: 2,
      offset: 2,
      color: 'var(--color-primary-500)',
    },
    contrastRatios: {
      normal: 4.5,
      large: 3,
      enhanced: 7,
    },
  },
} as const;

type DesignKernel = typeof designKernel;