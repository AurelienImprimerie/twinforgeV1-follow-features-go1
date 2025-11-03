// src/components/3d/Avatar3DViewer/Avatar3DViewer.tsx
import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { OrbitTouchControls } from '../../../lib/3d/camera/OrbitTouchControls';
import { useAvatarViewerOrchestrator } from './hooks/useAvatarViewerOrchestrator';
import ViewerControls from './components/ViewerControls';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import DebugInfo from './components/DebugInfo';
import type { Avatar3DViewerProps, Avatar3DViewerRef } from './utils/viewerTypes';
import logger from '../../../lib/utils/logger';

/**
 * Avatar 3D Viewer - Simplified with Central Orchestrator
 * Now uses the central orchestrator to coordinate all lifecycle hooks
 */
const Avatar3DViewer = forwardRef<Avatar3DViewerRef, Avatar3DViewerProps>((props, ref) => {
  const {
    serverScanId,
    className = '',
    showControls = true,
    faceMorphData, // Nouveau: Prop pour les morphs faciaux
    faceSkinTone,  // Nouveau: Prop pour le skin tone facial
    faceOnly = false, // Nouveau: Prop pour indiquer un viewer facial
    overrideMorphData, // Nouveau: Prop pour forcer les morphs
    overrideLimbMasses, // Nouveau: Prop pour forcer les limb masses
    overrideSkinTone, // Nouveau: Prop pour forcer le skin tone
    overrideGender, // Nouveau: Prop pour forcer le genre
    ...restProps
  } = props;

  // Container state
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  // Container ref callback
  const containerRef: ContainerRefCallback = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  // Use central orchestrator
  const orchestrator = useAvatarViewerOrchestrator({
    container,
    serverScanId,
    faceMorphData, // Nouveau: Passer les morphs faciaux à l'orchestrateur
    faceSkinTone,  // Nouveau: Passer le skin tone facial à l'orchestrateur
    faceOnly, // Nouveau: Passer faceOnly à l'orchestrateur
    overrideMorphData, // Nouveau: Passer overrideMorphData à l'orchestrateur
    overrideLimbMasses, // Nouveau: Passer overrideLimbMasses à l'orchestrateur
    overrideSkinTone, // Nouveau: Passer overrideSkinTone à l'orchestrateur
    overrideGender, // Nouveau: Passer overrideGender à l'orchestrateur
    ...restProps
  });

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getCameraControls: () => orchestrator.controls,
    updateMorphData: orchestrator.updateMorphData,
    resetCamera: orchestrator.resetCamera,
    setCameraView: orchestrator.setCameraView,
    toggleAutoRotate: orchestrator.toggleAutoRotate,
    forceMorphsUpdate: orchestrator.forceMorphsUpdate,
  }), [orchestrator]);



  return (
    <div className={`relative ${className}`}>
      <div 
        ref={containerRef}
        className="w-full h-full min-h-[300px] sm:min-h-[400px] rounded-xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-400/20 relative overflow-hidden"
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative'
        }}
      />
      
      <LoadingOverlay isLoading={orchestrator.viewerState.isLoading} />
      
      <ErrorOverlay 
        error={orchestrator.hasError ? orchestrator.errorMessage : null} 
        onRetry={orchestrator.retryInitialization} 
      />
      
      <ViewerControls
        activeView={orchestrator.viewerState.activeView}
        isAutoRotating={orchestrator.viewerState.isAutoRotating}
        onCameraViewChange={orchestrator.setCameraView}
        onAutoRotateToggle={orchestrator.toggleAutoRotate}
        onCameraReset={orchestrator.resetCamera}
        showControls={showControls && !orchestrator.viewerState.isLoading && !orchestrator.hasError}
      />

    </div>
  );
});

Avatar3DViewer.displayName = 'Avatar3DViewer';

export default Avatar3DViewer;

