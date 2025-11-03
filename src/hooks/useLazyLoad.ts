/**
 * useLazyLoad Hook
 * Lazy loads components when they enter the viewport using IntersectionObserver
 */

import { useEffect, useState, useRef } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}): [React.RefObject<HTMLDivElement>, boolean] => {
  const {
    rootMargin = '100px',
    threshold = 0.01,
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [rootMargin, threshold, triggerOnce]);

  return [elementRef, isVisible];
};
