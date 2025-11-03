/**
 * Camera Controls Hook
 * Manages camera positioning, views, and rotation
 */

import { useCallback } from 'react';
import type { ViewerState } from '../utils/viewerTypes';

interface UseCameraControlsProps {
  viewerState: ViewerState;
  setViewerState: (update: (prev: ViewerState) => ViewerState) => void;
  controls: any;
}

export function useCameraControls({
  viewerState,
  setViewerState,
  controls
}: UseCameraControlsProps) {
  const setCameraView = useCallback((view: 'front' | 'profile' | 'threequarter') => {
    if (!controls) return;

    setViewerState(prev => ({ ...prev, activeView: view }));
    controls.snapTo(view === 'threequarter' ? 'threequarter' : view);
  }, [controls, setViewerState]);

  const toggleAutoRotate = useCallback(() => {
    const newAutoRotate = !viewerState.isAutoRotating;

    setViewerState(prev => ({ ...prev, isAutoRotating: newAutoRotate }));

    if (controls) {
      controls.setAutoRotate(newAutoRotate);
    }
  }, [viewerState.isAutoRotating, controls, setViewerState]);

  const resetCamera = useCallback(() => {
    if (controls) {
      controls.reset();
      setViewerState(prev => ({ ...prev, activeView: 'threequarter' }));
    }
  }, [controls, setViewerState]);

  return {
    setCameraView,
    toggleAutoRotate,
    resetCamera
  };
}
