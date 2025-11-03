import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollRevealOptions {
  threshold?: number[];
  rootMargin?: string;
  enabled?: boolean;
  intensity?: 'subtle' | 'medium' | 'intense';
}

interface ScrollRevealState {
  isVisible: boolean;
  scrollProgress: number;
  centerProximity: number;
}

const DEFAULT_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const DEFAULT_ROOT_MARGIN = '0px 0px -10% 0px';

const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection && connection.saveData) return true;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  return hardwareConcurrency < 4;
};

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = DEFAULT_THRESHOLDS,
    rootMargin = DEFAULT_ROOT_MARGIN,
    enabled = true,
    intensity = 'medium',
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<ScrollRevealState>({
    isVisible: false,
    scrollProgress: 0,
    centerProximity: 0,
  });

  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const reduceMotion = shouldReduceMotion();
  const isLowEnd = isLowEndDevice();

  const calculateCenterProximity = useCallback((entry: IntersectionObserverEntry): number => {
    const rect = entry.boundingClientRect;
    const viewportHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const distance = Math.abs(elementCenter - viewportCenter);
    const maxDistance = viewportHeight / 2;
    const proximity = Math.max(0, 1 - distance / maxDistance);
    return proximity;
  }, []);

  const updateState = useCallback((entry: IntersectionObserverEntry) => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 16) return;
    lastUpdateRef.current = now;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const isVisible = entry.isIntersecting;
      const scrollProgress = entry.intersectionRatio;
      const centerProximity = calculateCenterProximity(entry);

      setState({
        isVisible,
        scrollProgress,
        centerProximity,
      });

      if (elementRef.current) {
        const element = elementRef.current;
        element.style.setProperty('--scroll-progress', String(scrollProgress));
        element.style.setProperty('--scroll-proximity', String(centerProximity));

        const tintIntensity = centerProximity * scrollProgress;
        element.style.setProperty('--scroll-tint-intensity', String(tintIntensity));

        if (!isLowEnd && !reduceMotion) {
          const blurAmount = 20 - (centerProximity * 4);
          element.style.setProperty('--scroll-blur-amount', `${blurAmount}px`);

          const glowOpacity = centerProximity * 0.3;
          element.style.setProperty('--scroll-glow-opacity', String(glowOpacity));
        }
      }
    });
  }, [calculateCenterProximity, isLowEnd, reduceMotion]);

  useEffect(() => {
    if (!enabled || reduceMotion || !elementRef.current) {
      return;
    }

    const element = elementRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          updateState(entry);
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      observer.disconnect();
    };
  }, [enabled, threshold, rootMargin, updateState, reduceMotion]);

  const getIntensityModifier = useCallback((): number => {
    switch (intensity) {
      case 'subtle':
        return 0.5;
      case 'intense':
        return 1.5;
      default:
        return 1.0;
    }
  }, [intensity]);

  return {
    ref: elementRef,
    state,
    isLowEnd,
    reduceMotion,
    intensityModifier: getIntensityModifier(),
  };
};
