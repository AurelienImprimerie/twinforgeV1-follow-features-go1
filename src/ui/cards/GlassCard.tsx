// src/ui/cards/GlassCard.tsx
import * as React from "react";
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { HoverEffectManager, supportsAdvancedHover } from './cardUtils';
import { useFeedback } from '../../hooks/useFeedback';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

type GlassCardProps = React.PropsWithChildren<{
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  interactive?: boolean;
  elevation?: 'sm' | 'md' | 'lg';
  onClick?: React.MouseEventHandler;
  role?: string;
  tabIndex?: number;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-busy'?: boolean;
  'aria-disabled'?: boolean;
  'aria-pressed'?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  style?: React.CSSProperties;
  circuit?: string;
  variant?: string;
  isParent?: boolean;
  size?: 'sm' | 'base' | 'lg';
  /** Désactive le halo "projecteur" global, on garde juste un sheen local propre */
  spotlight?: boolean;
  /** Active/Désactive le petit sheen local sur la carte */
  sheen?: boolean;
  /** Active/Désactive l'animation progressive au scroll */
  scrollReveal?: boolean;
  /** Intensité de l'effet scroll reveal */
  scrollRevealIntensity?: 'subtle' | 'medium' | 'intense';
}>;

const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const GlassCard = React.forwardRef<HTMLElement, GlassCardProps>(({
  className,
  as = 'div',
  interactive = true,
  elevation = 'md',
  children,
  disabled = false,
  size = 'base',
  spotlight = false,
  sheen = true,
  scrollReveal = true,
  scrollRevealIntensity = 'medium',
  onPointerDown,
  style,
  ...rest
}, ref) => {
  const Comp: any = (motion as any)[as] ?? motion.div;
  const reduceMotion = useReducedMotion();
  const { glassClick } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();

  const scrollRevealHook = useScrollReveal({
    enabled: scrollReveal && !reduceMotion,
    intensity: scrollRevealIntensity,
  });

  const internalRef = React.useRef<HTMLElement>(null);
  const scrollRevealRef = scrollRevealHook.ref;

  React.useEffect(() => {
    if (ref && typeof ref === 'function') {
      ref(internalRef.current);
    } else if (ref && 'current' in ref) {
      (ref as React.MutableRefObject<HTMLElement | null>).current = internalRef.current;
    }
    if (scrollRevealRef) {
      scrollRevealRef.current = internalRef.current;
    }
  }, [ref, scrollRevealRef]);

  const [hoverEffectClass, setHoverEffectClass] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (internalRef.current && supportsAdvancedHover()) {
      const effectClass = HoverEffectManager.getInstance().getEffectClass(internalRef.current);
      setHoverEffectClass(effectClass);
    }
  }, []);

  // ACIER SUR VERRE - Enhanced pointer down handler with forge-specific audio
  const handlePointerDown = (e: React.PointerEvent) => {
    // console.log('🔊 AUDIO_DEBUG: GlassCard pointerDown', {
    //   disabled,
    //   interactive,
    //   eventType: e.type,
    //   timestamp: new Date().toISOString()
    // });
    
    if (!disabled && interactive) {
      glassClick(); // Son forge spécifique aux éléments en acier sur verre
    }
    onPointerDown?.(e);
  };

  // CRITICAL: Désactiver les animations sur mobile et appareils tactiles
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const shouldAnimate = !reduceMotion && !isMobile && !isTouchDevice && !isPerformanceMode;

  const handleMove = React.useCallback(
    (e: React.MouseEvent) => {
      // Désactiver complètement sur mobile et appareils tactiles
      if (!interactive || !hasFinePointer() || disabled || !sheen || isMobile || isTouchDevice || isPerformanceMode) return;

      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      // Mettre à jour les variables CSS pour le sheen (desktop uniquement)
      el.style.setProperty('--mx', String(px));
      el.style.setProperty('--my', String(py));
      el.style.setProperty('--sheen-size', 'var(--glass-sheen-size)');
    },
    [interactive, disabled, sheen, isMobile, isTouchDevice, isPerformanceMode]
  );

  const handleEnter = React.useCallback((e: React.MouseEvent) => {
    if (!interactive || !hasFinePointer() || disabled || !sheen || isMobile || isTouchDevice || isPerformanceMode) return;
    const el = e.currentTarget as HTMLElement;
    el.style.setProperty('--sheen-visible', '1');
  }, [interactive, disabled, sheen, isMobile, isTouchDevice, isPerformanceMode]);

  const handleLeave = React.useCallback((e: React.MouseEvent) => {
    if (!interactive || disabled || !sheen || isMobile || isTouchDevice || isPerformanceMode) return;
    const el = e.currentTarget as HTMLElement;
    el.style.removeProperty('--sheen-visible');
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  }, [interactive, disabled, sheen, isMobile, isTouchDevice, isPerformanceMode]);

  // Interactions desktop uniquement
  const interactiveDesktop = interactive && hasFinePointer() && !disabled && shouldAnimate;

  const sizeClasses = {
    sm: 'p-3',
    base: 'p-4',
    lg: 'p-6',
  };

  const elevationClasses = {
    sm: 'glass-elev-sm',
    md: 'glass-elev-md', 
    lg: 'glass-elev-lg',
  };

  return (
    <Comp
      ref={internalRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onPointerDown={handlePointerDown}
      data-hover-effect={hoverEffectClass}
      data-scroll-visible={scrollReveal ? scrollRevealHook.state.isVisible : undefined}
      data-scroll-active={scrollReveal ? scrollRevealHook.state.isVisible : undefined}
      data-intensity={scrollReveal ? scrollRevealIntensity : undefined}
      data-low-end={scrollReveal ? scrollRevealHook.isLowEnd : undefined}
      whileTap={!disabled && !reduceMotion && !isMobile && !isTouchDevice && !isPerformanceMode ? {
        scale: 0.98,
        opacity: 0.95,
        transition: {
          duration: 0.08,
          ease: "easeOut"
        }
      } : {}}
      className={clsx(
        'glass-base glass-card relative will-transform group',
        'rounded-3xl',
        scrollReveal && 'glass-card-scroll-reveal',
        sizeClasses[size],
        elevationClasses[elevation],
        interactive && 'transform-gpu preserve-3d',
        interactive && !disabled && 'cursor-pointer glass-focus',
        disabled && 'opacity-50 cursor-not-allowed',
        'z-0',
        className
      )}
      style={{
        ['--spotlight-opacity' as any]: (spotlight && !isMobile && !isTouchDevice) ? 0.6 : 0,
        ['--glass-sheen-size' as any]: (isMobile || isTouchDevice) ? '0px' : '420px',
        position: 'relative',
        isolation: 'isolate',
        ...style,
      }}
      {...(as === 'button' ? { disabled } : {})}
      {...rest}
    >
      {/* sheen local (z au-dessus du verre, masqué en radial) - desktop uniquement */}
      {sheen && !isMobile && !isTouchDevice && !isPerformanceMode && (
        <div
          aria-hidden
          className="glass-sheen pointer-events-none absolute rounded-[inherit] overflow-hidden"
          style={{
            inset: '-1px',
          }}
        />
      )}

      {/* contenu */}
      <div className="relative z-10 pointer-events-auto">{children}</div>
    </Comp>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;
