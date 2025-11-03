import { create } from 'zustand';
import { useOverlayStore } from '../../system/store/overlayStore';

type ShellState = {
  drawerOpen: boolean;
  setDrawer: (open: boolean) => void;
};

/**
 * @deprecated Use useOverlayStore directly instead
 * This hook is kept for backward compatibility but delegates to overlayStore
 */
export const useShell = create<ShellState>((set, get) => {
  // Subscribe to overlay store changes
  const unsubscribe = useOverlayStore.subscribe(
    (state) => state.activeOverlayId,
    (activeOverlayId) => {
      set({ drawerOpen: activeOverlayId === 'mobileDrawer' });
    }
  );

  return {
    drawerOpen: false,
    setDrawer: (open: boolean) => {
      if (open) {
        useOverlayStore.getState().open('mobileDrawer');
      } else {
        useOverlayStore.getState().close();
      }
    },
  };
});