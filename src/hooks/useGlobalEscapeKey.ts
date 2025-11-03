/**
 * Global Escape Key Handler
 * Closes the topmost open overlay when Escape is pressed
 */

import { useEffect } from 'react';
import { useOverlayStore } from '../system/store/overlayStore';
import logger from '../lib/utils/logger';

export const useGlobalEscapeKey = () => {
  const { activeOverlayId, close } = useOverlayStore();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      // Close any active overlay
      if (activeOverlayId !== 'none') {
        logger.debug('ESCAPE_KEY', 'Closing overlay', { overlayId: activeOverlayId });
        close();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    };

    document.addEventListener('keydown', handleEscape, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleEscape, { capture: true });
    };
  }, [activeOverlayId, close]);
};
