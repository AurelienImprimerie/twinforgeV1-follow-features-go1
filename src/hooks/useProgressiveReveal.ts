/**
 * useProgressiveReveal Hook
 * Manages progressive component reveal with timing control
 * Components appear after specified delays even if data is ready
 */

import { useState, useEffect, useRef } from 'react';

export interface ComponentVisibility {
  [key: string]: boolean;
}

export interface ComponentTiming {
  id: string;
  delayMs: number;
  dataReady: boolean;
}

interface UseProgressiveRevealOptions {
  components: ComponentTiming[];
  onAllVisible?: () => void;
}

export const useProgressiveReveal = ({
  components,
  onAllVisible
}: UseProgressiveRevealOptions) => {
  const [visibility, setVisibility] = useState<ComponentVisibility>(() => {
    const initial: ComponentVisibility = {};
    components.forEach(comp => {
      initial[comp.id] = false;
    });
    return initial;
  });

  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    components.forEach((comp) => {
      if (visibility[comp.id]) {
        return;
      }

      if (timeoutsRef.current[comp.id]) {
        clearTimeout(timeoutsRef.current[comp.id]);
      }

      timeoutsRef.current[comp.id] = setTimeout(() => {
        if (!mountedRef.current) return;

        if (comp.dataReady) {
          setVisibility(prev => ({
            ...prev,
            [comp.id]: true
          }));
        } else {
          const checkDataInterval = setInterval(() => {
            const updatedComp = components.find(c => c.id === comp.id);
            if (updatedComp?.dataReady && mountedRef.current) {
              clearInterval(checkDataInterval);
              setVisibility(prev => ({
                ...prev,
                [comp.id]: true
              }));
            }
          }, 100);

          timeoutsRef.current[`${comp.id}_interval`] = checkDataInterval as any;
        }
      }, comp.delayMs);
    });

    return () => {
      mountedRef.current = false;
      Object.values(timeoutsRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      timeoutsRef.current = {};
    };
  }, [components.map(c => `${c.id}-${c.dataReady}`).join(',')]);

  useEffect(() => {
    const allVisible = components.every(comp => visibility[comp.id]);
    if (allVisible && onAllVisible) {
      onAllVisible();
    }
  }, [visibility, components.length, onAllVisible]);

  const isVisible = (componentId: string): boolean => {
    return visibility[componentId] === true;
  };

  const allVisible = components.every(comp => visibility[comp.id]);

  return {
    isVisible,
    visibility,
    allVisible
  };
};
