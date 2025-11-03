/**
 * Viewer Initialization Hook
 * Handles scene and model initialization lifecycle
 */

import { useLayoutEffect, useCallback } from 'react';
import * as THREE from 'three';
import type { ViewerStateRefs } from './useViewerState';
import { applyFaceOnlyClipping, forceMainMeshVisible } from '../utils/faceClipping';
import { processViewerPayload } from '../utils/payloadProcessor';
import { useProgressStore } from '../../../../system/store/progressStore';
import { getGlobalPerformanceMonitor } from '../../../../lib/utils/PerformanceMonitor';
import { mobileMemoryMonitor, cleanupThreeJSResources } from '../../../../lib/3d/performance/mobileMemoryMonitor';
import logger from '../../../../lib/utils/logger';

interface UseViewerInitializationProps {
  container: HTMLDivElement | null;
  refs: ViewerStateRefs;
  viewerState: any;
  setViewerState: any;
  sceneLifecycle: any;
  modelLifecycle: any;
  morphLifecycle: any;
  materialLifecycle: any;
  finalGender: 'male' | 'female';
  processedSkinTone: any;
  serverScanId?: string;
  faceOnly?: boolean;
  autoRotate?: boolean;
}

export function useViewerInitialization({
  container,
  refs,
  viewerState,
  setViewerState,
  sceneLifecycle,
  modelLifecycle,
  morphLifecycle,
  materialLifecycle,
  finalGender,
  processedSkinTone,
  serverScanId,
  faceOnly,
  autoRotate
}: UseViewerInitializationProps) {
  const handleModelLoaded = useCallback(async (model: THREE.Group, mainMesh: THREE.SkinnedMesh) => {
    const currentProps = refs.propsRef.current;
    const currentMorphologyMapping = refs.morphologyMappingRef.current;

    if (!currentMorphologyMapping) {
      logger.info('ORCHESTRATOR', 'Model loaded but morphologyMapping not available yet, deferring morph application', {
        serverScanId,
        philosophy: 'morphology_mapping_not_ready'
      });
      return;
    }

    logger.info('ORCHESTRATOR', 'Model loaded callback - detailed inspection', {
      modelInstanceName: model.name,
      modelInstanceChildren: model.children.length,
      mainMeshName: mainMesh.name,
      mainMeshType: mainMesh.type,
      hasMorphTargetDictionary: !!mainMesh.morphTargetDictionary,
      morphTargetDictionarySize: mainMesh.morphTargetDictionary ? Object.keys(mainMesh.morphTargetDictionary).length : 0,
      morphTargetDictionaryKeys: mainMesh.morphTargetDictionary ? Object.keys(mainMesh.morphTargetDictionary).slice(0, 10) : [],
      hasMorphTargetInfluences: !!mainMesh.morphTargetInfluences,
      morphTargetInfluencesLength: mainMesh.morphTargetInfluences ? mainMesh.morphTargetInfluences.length : 0,
      morphTargetInfluencesInitialValues: mainMesh.morphTargetInfluences ? mainMesh.morphTargetInfluences.slice(0, 10) : [],
      serverScanId
    });

    logger.info('ORCHESTRATOR', 'Model loaded, applying morphs and materials', {
      modelName: model.name,
      mainMeshName: mainMesh.name,
      serverScanId,
      philosophy: 'model_to_morph_transition'
    });

    setViewerState((prev: any) => ({
      ...prev,
      isLoading: false,
      isInitialized: true,
    }));

    const payload = await processViewerPayload(currentProps, currentMorphologyMapping);
    if (payload.status === 'ready') {
      await morphLifecycle.applyMorphs(model, payload.shape_params, currentProps.faceMorphData, currentMorphologyMapping);

      if (!currentProps.faceOnly) {
        logger.info('ORCHESTRATOR', 'Applying limb masses (body mode)', {
          limbMassesCount: Object.keys(payload.limb_masses || {}).length,
          shapeParamsCount: Object.keys(payload.shape_params || {}).length,
          serverScanId,
          philosophy: 'body_mode_limb_masses'
        });
        await morphLifecycle.applyLimbMasses(model, payload.limb_masses, payload.shape_params);
      } else {
        logger.info('ORCHESTRATOR', 'Skipping limb masses application (faceOnly mode)', {
          faceOnly: currentProps.faceOnly,
          serverScanId,
          philosophy: 'face_only_skip_limb_masses'
        });
      }
    } else {
      logger.error('ORCHESTRATOR', 'Payload not ready for morph application - detailed diagnostics', {
        payloadStatus: payload.status,
        payloadError: payload.error,
        serverScanId,
        hasPayloadData: !!payload.data,
        payloadDataKeys: payload.data ? Object.keys(payload.data) : [],
        philosophy: 'payload_not_ready_detailed_diagnostics'
      });

      if (import.meta.env.DEV) {
        console.error('[ORCHESTRATOR] Payload not ready - Avatar cannot be rendered', {
          payload,
          serverScanId
        });
      }
    }

    await materialLifecycle.configureMaterials(currentProps.faceSkinTone || processedSkinTone);

    if (sceneLifecycle.controls) {
      if (currentProps.faceOnly) {
        logger.info('ORCHESTRATOR', 'Adjusting camera and applying clipping for face scan focus', { serverScanId });

        applyFaceOnlyClipping(model);
        forceMainMeshVisible(model, serverScanId);

        const headTarget = new THREE.Vector3(0, 1.65, 0);
        sceneLifecycle.controls.setTarget(headTarget);

        if (sceneLifecycle.camera) {
          const camera = sceneLifecycle.camera;
          const distance = 1.5;
          camera.position.set(0, 1.65, distance);
          camera.lookAt(headTarget);
          camera.updateProjectionMatrix();

          camera.near = 0.1;
          camera.far = 10;
          camera.updateProjectionMatrix();

          logger.info('ORCHESTRATOR', 'Camera positioned for face view', {
            cameraPosition: camera.position.toArray(),
            targetPosition: headTarget.toArray(),
            distance,
            near: camera.near,
            far: camera.far,
            serverScanId,
            philosophy: 'face_camera_optimized'
          });
        }

        sceneLifecycle.controls.snapTo('front');
      } else {
        sceneLifecycle.controls.fitToObject(model, 0.02);
      }
    }

    sceneLifecycle.startRenderLoop(viewerState.isAutoRotating, model);

    setViewerState((prev: any) => ({
      ...prev,
      isViewerReady: true,
    }));

    refs.isFullyInitializedRef.current = true;

    if (currentProps.onViewerReady) {
      logger.info('ORCHESTRATOR', 'Calling onViewerReady callback - viewer fully initialized', {
        serverScanId,
        philosophy: 'viewer_ready_callback'
      });
      currentProps.onViewerReady();
    }

    if (currentProps.overrideMorphData || currentProps.overrideGender || currentProps.overrideSkinTone) {
      refs.isProjectionSessionActiveRef.current = true;
      logger.info('ORCHESTRATOR', '🔒 PROJECTION SESSION ACTIVE - All reinitialization BLOCKED', {
        hasOverrideMorphData: !!currentProps.overrideMorphData,
        hasOverrideGender: !!currentProps.overrideGender,
        hasOverrideSkinTone: !!currentProps.overrideSkinTone,
        serverScanId,
        philosophy: 'projection_session_lock_activated'
      });
    }

    const perfMonitor = getGlobalPerformanceMonitor();
    logger.info('ORCHESTRATOR', 'Viewer fully initialized - permanent flag set', {
      serverScanId,
      initCount: refs.initializationCountRef.current,
      totalReloads: perfMonitor.getReloadCounts().size,
      projectionSessionActive: refs.isProjectionSessionActiveRef.current,
      philosophy: 'permanent_initialization_complete'
    });

    if (!refs.onViewerReadyCalledRef.current && currentProps.onViewerReady) {
      refs.onViewerReadyCalledRef.current = true;
      setTimeout(() => {
        currentProps.onViewerReady!();
      }, 0);
    }

    const progressState = useProgressStore.getState();
    if (progressState.isActive && progressState.overallProgress < 100) {
      progressState.setOverallProgress(100, 'Avatar 3D Prêt', 'Votre reflet numérique est maintenant visible');
    }
  }, [
    refs,
    serverScanId,
    sceneLifecycle,
    morphLifecycle,
    materialLifecycle,
    processedSkinTone,
    viewerState.isAutoRotating,
    setViewerState
  ]);

  useLayoutEffect(() => {
    if (refs.isFullyInitializedRef.current) {
      const perfMonitor = getGlobalPerformanceMonitor();
      perfMonitor.trackReload('Avatar3DViewer_SceneInit');

      logger.error('ORCHESTRATOR', '🚨 CRITICAL: Attempted reinitialize of fully initialized viewer!', {
        serverScanId,
        initialServerScanId: refs.initialServerScanIdRef.current,
        initCount: refs.initializationCountRef.current,
        projectionSessionActive: refs.isProjectionSessionActiveRef.current,
        triggerSource: 'useLayoutEffect_sceneInit_dependencies',
        philosophy: 'permanent_guard_blocked_reinit'
      });
      return;
    }

    if (refs.isProjectionSessionActiveRef.current) {
      logger.error('ORCHESTRATOR', '🚨 BLOCKED: Scene init during projection session!', {
        serverScanId,
        philosophy: 'projection_session_guard_blocked_scene_init'
      });
      return;
    }

    if (!container ||
        sceneLifecycle.isInitialized ||
        sceneLifecycle.isInitializing ||
        refs.initGuardRef.current) {
      return;
    }

    if (container.clientWidth === 0 || container.clientHeight === 0) {
      logger.warn('ORCHESTRATOR', 'Container has zero dimensions, deferring initialization', {
        containerSize: { width: container.clientWidth, height: container.clientHeight },
        serverScanId,
        philosophy: 'container_dimensions_invalid'
      });
      return;
    }

    refs.initGuardRef.current = true;
    refs.initializationCountRef.current++;

    if (!refs.initialContainerRef.current) {
      refs.initialContainerRef.current = container;
    }

    const perfMonitor = getGlobalPerformanceMonitor();
    const opId = perfMonitor.startOperation('scene_initialization', {
      serverScanId,
      initCount: refs.initializationCountRef.current,
      containerChanged: refs.initialContainerRef.current !== container
    });

    setViewerState((prev: any) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    sceneLifecycle.initializeScene().then(() => {
      perfMonitor.endOperation(opId);
      mobileMemoryMonitor.startMonitoring();
      logger.info('ORCHESTRATOR', 'Mobile memory monitoring started', {
        serverScanId,
        philosophy: 'memory_monitoring_init'
      });
    }).catch((error: Error) => {
      perfMonitor.endOperation(opId);
      logger.error('ORCHESTRATOR', 'Scene initialization failed', {
        error: error.message,
        serverScanId,
        philosophy: 'scene_init_error'
      });

      setViewerState((prev: any) => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));

      refs.initGuardRef.current = false;
    });
  }, [container, sceneLifecycle, serverScanId, refs, setViewerState]);

  useLayoutEffect(() => {
    if (refs.isFullyInitializedRef.current) {
      logger.debug('ORCHESTRATOR', 'Skipping model loading - already fully initialized', {
        serverScanId,
        projectionSessionActive: refs.isProjectionSessionActiveRef.current,
        triggerSource: 'useLayoutEffect_modelLoad_dependencies',
        philosophy: 'permanent_guard_prevents_reload'
      });
      return;
    }

    if (refs.isProjectionSessionActiveRef.current) {
      logger.error('ORCHESTRATOR', '🚨 BLOCKED: Model load during projection session!', {
        serverScanId,
        philosophy: 'projection_session_guard_blocked_model_load'
      });
      return;
    }

    if (!sceneLifecycle.scene || !sceneLifecycle.isInitialized || modelLifecycle.isLoading) {
      logger.debug('ORCHESTRATOR', 'Model loading conditions not met', {
        hasScene: !!sceneLifecycle.scene,
        sceneInitialized: sceneLifecycle.isInitialized,
        modelIsLoading: modelLifecycle.isLoading,
        serverScanId,
        philosophy: 'model_loading_conditions_check'
      });
      return;
    }

    logger.info('ORCHESTRATOR', 'Scene verified available, triggering model loading with explicit scene reference', {
      hasScene: !!sceneLifecycle.scene,
      sceneInitialized: sceneLifecycle.isInitialized,
      sceneChildren: sceneLifecycle.scene.children.length,
      sceneUuid: sceneLifecycle.scene.uuid,
      serverScanId,
      philosophy: 'scene_verified_explicit_reference_model_loading'
    });

    modelLifecycle.loadModel(sceneLifecycle.scene).catch((error: Error) => {
      logger.error('ORCHESTRATOR', 'Model loading failed with explicit scene reference', {
        error: error.message,
        sceneWasValid: !!sceneLifecycle.scene,
        sceneUuid: sceneLifecycle.scene?.uuid,
        serverScanId,
        philosophy: 'model_loading_failure_explicit_scene_reference'
      });

      setViewerState((prev: any) => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    });
  }, [
    sceneLifecycle.scene,
    sceneLifecycle.isInitialized,
    modelLifecycle.isLoading,
    modelLifecycle.loadModel,
    serverScanId,
    refs,
    setViewerState
  ]);

  const retryInitialization = useCallback(() => {
    logger.info('ORCHESTRATOR', 'Retrying initialization with complete cleanup', {
      serverScanId,
      projectionSessionWasActive: refs.isProjectionSessionActiveRef.current,
      philosophy: 'retry_with_cleanup'
    });

    refs.isProjectionSessionActiveRef.current = false;
    refs.finalGenderLockedRef.current = false;
    refs.processedSkinToneLockedRef.current = false;

    mobileMemoryMonitor.stopMonitoring();

    sceneLifecycle.cleanup();
    modelLifecycle.cleanupModel();
    morphLifecycle.resetMorphs();

    setViewerState({
      isLoading: true,
      error: null,
      isInitialized: false,
      isViewerReady: false,
      activeView: 'threequarter',
      isAutoRotating: autoRotate,
    });

    refs.onViewerReadyCalledRef.current = false;
    refs.initGuardRef.current = false;
    refs.isFullyInitializedRef.current = false;

    logger.info('ORCHESTRATOR', 'Retry initialization state reset completed', {
      serverScanId,
      philosophy: 'retry_state_reset_complete'
    });
  }, [
    sceneLifecycle,
    modelLifecycle,
    morphLifecycle,
    autoRotate,
    serverScanId,
    refs,
    setViewerState
  ]);

  return {
    handleModelLoaded,
    retryInitialization
  };
}
