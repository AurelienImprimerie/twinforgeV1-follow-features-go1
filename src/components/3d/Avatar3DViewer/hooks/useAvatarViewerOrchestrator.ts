import { useState, useCallback, useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { useSceneLifecycle } from './useSceneLifecycle';
import { useModelLifecycle } from './useModelLifecycle';
import { useMorphLifecycle } from './useMorphLifecycle';
import { useMaterialLifecycle } from './useMaterialLifecycle';
import { processViewerPayload, processSkinTone, determineFinalGender } from '../utils/payloadProcessor';
import { useMorphologyMapping } from '../../../../hooks/useMorphologyMapping';
import { useProgressStore } from '../../../../system/store/progressStore';
import type { Avatar3DViewerProps, ViewerState } from '../utils/viewerTypes';
import logger from '../../../../lib/utils/logger';
import { DEBUG_FLAGS } from '../../../../config/debugFlags';
import * as THREE from 'three';
import { getGlobalPerformanceMonitor } from '../../../../lib/utils/PerformanceMonitor';
import { mobileMemoryMonitor, cleanupThreeJSResources } from '../../../../lib/3d/performance/mobileMemoryMonitor';

/**
 * Apply face-only clipping to hide body parts below shoulders
 * Uses a clipping plane to hide the body while keeping the head and neck visible
 */
function applyFaceOnlyClipping(model: THREE.Group): void {
  // DEBUG: Check if clipping is disabled
  if (DEBUG_FLAGS.DISABLE_FACE_CLIPPING) {
    logger.warn('FACE_CLIPPING', 'Face clipping DISABLED by debug flag', {
      philosophy: 'debug_clipping_disabled'
    });
    return;
  }

  if (DEBUG_FLAGS.SHOW_FULL_BODY_IN_FACE_MODE) {
    logger.warn('FACE_CLIPPING', 'Showing full body in face mode (debug flag)', {
      philosophy: 'debug_full_body_visible'
    });
    return;
  }

  // CRITICAL FIX: First ensure model has updated bounding boxes after morph application
  model.updateMatrixWorld(true);

  // Find the neck bone to determine accurate clipping position
  let neckBoneY = 1.2; // Default fallback
  let foundNeckBone = false;

  model.traverse((obj: THREE.Object3D) => {
    if (obj.type === 'Bone' && !foundNeckBone) {
      const boneName = obj.name.toLowerCase();
      // Look for neck bones: c_neckx, neckx, c_p_neck_01x, etc.
      if (boneName.includes('neck') && !boneName.includes('twist') && !boneName.includes('ref')) {
        obj.updateMatrixWorld(true);
        const worldPosition = new THREE.Vector3();
        obj.getWorldPosition(worldPosition);
        // Use the base of the neck as reference
        neckBoneY = worldPosition.y - 0.15; // Slightly below neck base to include full neck
        foundNeckBone = true;

        logger.info('FACE_CLIPPING', 'Found neck bone for clipping reference', {
          boneName: obj.name,
          neckBoneY: neckBoneY.toFixed(3),
          worldPosition: worldPosition.toArray(),
          philosophy: 'neck_bone_reference'
        });
      }
    }
  });

  // If no neck bone found, use a higher threshold than before (1.5 instead of 1.2)
  const CLIP_Y_THRESHOLD = foundNeckBone ? neckBoneY : 1.5;

  logger.info('FACE_CLIPPING', 'Applying face-only clipping with plane', {
    threshold: CLIP_Y_THRESHOLD,
    foundNeckBone,
    method: foundNeckBone ? 'neck_bone_based' : 'threshold_fallback',
    debugFlagsActive: false,
    philosophy: 'clip_body_preserve_head_and_neck'
  });

  let mainMeshFound = false;
  let skinnedMeshFound = false;
  let clippedMeshes = 0;
  let totalMeshes = 0;

  // CRITICAL: Find the main SkinnedMesh first (the one with morphTargets)
  let mainSkinnedMesh: THREE.SkinnedMesh | null = null;
  model.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.SkinnedMesh && obj.morphTargetDictionary) {
      const morphTargetCount = Object.keys(obj.morphTargetDictionary).length;
      if (!mainSkinnedMesh || morphTargetCount > Object.keys(mainSkinnedMesh.morphTargetDictionary || {}).length) {
        mainSkinnedMesh = obj;
      }
    }
  });

  if (mainSkinnedMesh) {
    logger.info('FACE_CLIPPING', 'Found main skinned mesh with morphs', {
      meshName: mainSkinnedMesh.name,
      morphTargetCount: Object.keys(mainSkinnedMesh.morphTargetDictionary || {}).length,
      philosophy: 'main_mesh_identified'
    });
  }

  model.traverse((obj: THREE.Object3D) => {
    if (obj.type === 'Mesh' || obj.type === 'SkinnedMesh') {
      totalMeshes++;
      const mesh = obj as THREE.Mesh | THREE.SkinnedMesh;

      // CRITICAL: Always keep the main skinned mesh visible (it has the morphs)
      const isMainMesh = mesh === mainSkinnedMesh;

      // Get bounding box to understand mesh extent - AFTER morphs are applied
      const boundingBox = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      boundingBox.getCenter(center);
      boundingBox.getSize(size);

      const minY = boundingBox.min.y;
      const maxY = boundingBox.max.y;

      logger.debug('FACE_CLIPPING', 'Analyzing mesh for clipping', {
        meshName: mesh.name,
        meshType: mesh.type,
        isMainMesh,
        centerY: center.y.toFixed(3),
        minY: minY.toFixed(3),
        maxY: maxY.toFixed(3),
        sizeY: size.y.toFixed(3),
        threshold: CLIP_Y_THRESHOLD
      });

      // STRATEGY: If this is the main mesh OR maxY >= threshold, keep visible
      if (isMainMesh || maxY >= CLIP_Y_THRESHOLD) {
        // Keep visible - this is the main mesh or contains the head
        mesh.visible = true;
        mainMeshFound = true;
        if (isMainMesh) skinnedMeshFound = true;

        logger.info('FACE_CLIPPING', 'Keeping mesh visible', {
          meshName: mesh.name,
          reason: isMainMesh ? 'main_skinned_mesh_with_morphs' : 'contains_head',
          maxY: maxY.toFixed(3),
          threshold: CLIP_Y_THRESHOLD,
          philosophy: 'preserve_mesh'
        });

        // Apply clipping plane to hide lower body on this mesh
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach(mat => {
            // Create clipping plane at threshold
            const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -CLIP_Y_THRESHOLD);
            mat.clippingPlanes = [clippingPlane];
            mat.clipShadows = true;
            mat.needsUpdate = true;
          });
          clippedMeshes++;

          logger.info('FACE_CLIPPING', 'Applied clipping plane to material', {
            meshName: mesh.name,
            materialCount: materials.length,
            philosophy: 'material_clipping_plane'
          });
        }
      } else {
        // Hide completely - this is below the threshold entirely AND not the main mesh
        mesh.visible = false;
        logger.debug('FACE_CLIPPING', 'Hiding mesh (entirely below threshold)', {
          meshName: mesh.name,
          maxY: maxY.toFixed(3),
          threshold: CLIP_Y_THRESHOLD
        });
      }
    }
  });

  logger.info('FACE_CLIPPING', 'Face-only clipping completed', {
    totalMeshes,
    clippedMeshes,
    mainMeshFound,
    skinnedMeshFound,
    threshold: CLIP_Y_THRESHOLD,
    philosophy: 'clipping_complete'
  });

  if (!mainMeshFound || !skinnedMeshFound) {
    logger.error('FACE_CLIPPING', 'CRITICAL: Main mesh visibility issue after clipping!', {
      totalMeshes,
      mainMeshFound,
      skinnedMeshFound,
      threshold: CLIP_Y_THRESHOLD,
      mainMeshName: mainSkinnedMesh?.name || 'not_found',
      philosophy: 'critical_mesh_visibility_issue'
    });
  }
}

interface UseAvatarViewerOrchestratorProps extends Avatar3DViewerProps {
  container: HTMLDivElement | null;
}

interface AvatarViewerOrchestratorResult {
  // State
  viewerState: ViewerState;
  
  // Scene references
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  controls: any;
  
  // Model references
  model: THREE.Group | null;
  mainMesh: THREE.SkinnedMesh | null;
  
  // Actions
  setCameraView: (view: 'front' | 'profile' | 'threequarter') => void;
  toggleAutoRotate: () => void;
  resetCamera: () => void;
  updateMorphData: (morphData: Record<string, number>) => void;
  retryInitialization: () => void;
  forceMorphsUpdate: (morphData: Record<string, number>) => void;
  
  // Status
  isReady: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

/**
 * Central orchestrator hook for Avatar 3D Viewer
 * Coordinates all lifecycle hooks and manages complete viewer state
 */
export function useAvatarViewerOrchestrator(
  props: UseAvatarViewerOrchestratorProps
): AvatarViewerOrchestratorResult {
  const {
    container,
    serverScanId,
    onViewerReady,
    onMorphDataChange,
    autoRotate = false,
    faceMorphData, // NOUVEAU: Récupérer faceMorphData
    faceSkinTone,  // NOUVEAU: Récupérer faceSkinTone
    faceOnly = false, // Nouveau: Récupérer faceOnly
    ...restProps
  } = props;

  // Central state management
  const [viewerState, setViewerState] = useState<ViewerState>({
    isLoading: true,
    error: null,
    isInitialized: false,
    isViewerReady: false,
    activeView: 'threequarter',
    isAutoRotating: autoRotate,
  });

  const onViewerReadyCalledRef = useRef(onViewerReady ? false : true); // Initialize to true if no callback
  const initGuardRef = useRef(false);
  // CRITICAL: Permanent flag that never resets once initialization is fully complete
  const isFullyInitializedRef = useRef(false);
  // CRITICAL: Track initialization count to detect unwanted reloads
  const initializationCountRef = useRef(0);
  // CRITICAL: Projection session lock - blocks ALL reinitialization when in projection mode
  const isProjectionSessionActiveRef = useRef(false);
  // CRITICAL: Store initial values to detect changes that should NOT trigger reloads
  const initialServerScanIdRef = useRef<string | undefined>(serverScanId);
  const initialContainerRef = useRef<HTMLDivElement | null>(null);

  // Get morphology mapping
  const { data: morphologyMapping } = useMorphologyMapping();

  // OPTIMIZED: Use refs to stabilize finalGender and processedSkinTone
  // CRITICAL: These refs are set ONCE and should NEVER change during projection mode
  const finalGenderRef = useRef<'male' | 'female'>('female');
  const processedSkinToneRef = useRef<any>(null);
  const finalGenderLockedRef = useRef(false);
  const processedSkinToneLockedRef = useRef(false);

  // CRITICAL: Store props in refs to avoid recreating onModelLoaded callback
  const propsRef = useRef(props);
  propsRef.current = props;

  const morphologyMappingRef = useRef(morphologyMapping);
  morphologyMappingRef.current = morphologyMapping;

  // Process payload and determine final gender with stable ref
  const finalGender = useMemo(() => {
    const computed = determineFinalGender(props);

    // CRITICAL: Once locked (projection mode active), NEVER allow gender changes
    if (finalGenderLockedRef.current && isProjectionSessionActiveRef.current) {
      if (computed !== finalGenderRef.current) {
        logger.error('ORCHESTRATOR', '🚨 BLOCKED: Attempted gender change during projection session', {
          lockedGender: finalGenderRef.current,
          attemptedGender: computed,
          philosophy: 'projection_session_gender_lock'
        });
      }
      return finalGenderRef.current; // Return locked value
    }

    // Only update ref if there's a real change
    if (computed !== finalGenderRef.current) {
      finalGenderRef.current = computed;
      // Lock gender when using override (projection mode)
      if (props.overrideGender) {
        finalGenderLockedRef.current = true;
        logger.info('ORCHESTRATOR', '🔒 Gender LOCKED for projection session', {
          lockedGender: computed,
          philosophy: 'gender_lock_activated'
        });
      }
    }
    return finalGenderRef.current;
  }, [
    props.savedAvatarPayload?.resolved_gender,
    props.resolvedGender,
    props.userProfile?.sex,
    props.overrideGender
  ]);

  // OPTIMIZED: Process skin tone with stable ref
  const processedSkinTone = useMemo(() => {
    const computed = processSkinTone(props);

    // CRITICAL: Once locked (projection mode active), NEVER allow skin tone changes from computed
    if (processedSkinToneLockedRef.current && isProjectionSessionActiveRef.current && !props.overrideSkinTone) {
      const currentRgb = processedSkinToneRef.current?.rgb;
      const newRgb = computed?.rgb;
      const hasChanged = !currentRgb || !newRgb ||
        Math.abs(currentRgb.r - newRgb.r) > 1 ||
        Math.abs(currentRgb.g - newRgb.g) > 1 ||
        Math.abs(currentRgb.b - newRgb.b) > 1;

      if (hasChanged) {
        logger.warn('ORCHESTRATOR', '🚨 BLOCKED: Attempted skin tone change during projection session (non-override)', {
          lockedRGB: currentRgb,
          attemptedRGB: newRgb,
          philosophy: 'projection_session_skin_tone_lock'
        });
      }
      return processedSkinToneRef.current; // Return locked value
    }

    // Only update ref if there's a real change (compare RGB values)
    const currentRgb = processedSkinToneRef.current?.rgb;
    const newRgb = computed?.rgb;
    const hasChanged = !currentRgb || !newRgb ||
      currentRgb.r !== newRgb.r ||
      currentRgb.g !== newRgb.g ||
      currentRgb.b !== newRgb.b;

    if (hasChanged) {
      processedSkinToneRef.current = computed;
      // Lock skin tone when using override (projection mode)
      if (props.overrideSkinTone) {
        processedSkinToneLockedRef.current = true;
        logger.info('ORCHESTRATOR', '🔒 Skin tone LOCKED for projection session', {
          lockedRGB: newRgb,
          philosophy: 'skin_tone_lock_activated'
        });
      }
    }
    return processedSkinToneRef.current;
  }, [
    props.savedAvatarPayload?.skin_tone,
    props.skinTone,
    props.scanResult,
    props.overrideSkinTone
  ]);

  // Log initialization values in debug mode only
  useLayoutEffect(() => {
    // CRITICAL: Only log on first mount, not on every prop change
    if (isFullyInitializedRef.current) return;

    logger.debug('ORCHESTRATOR', 'Initialization values', {
      finalGender,
      skinToneRGB: processedSkinTone?.rgb ? `rgb(${processedSkinTone.rgb.r}, ${processedSkinTone.rgb.g}, ${processedSkinTone.rgb.b})` : 'none',
      serverScanId,
      faceOnly,
      hasMorphologyMapping: !!morphologyMapping,
      hasOverrideProps: !!(props.overrideMorphData || props.overrideGender || props.overrideSkinTone),
      containerDimensions: container ? { width: container.clientWidth, height: container.clientHeight } : null,
      philosophy: 'orchestrator_initialization'
    });
  }, [finalGender, processedSkinTone, serverScanId, faceOnly, morphologyMapping, container, props.overrideMorphData, props.overrideGender, props.overrideSkinTone]);

  // Initialize scene lifecycle
  const sceneLifecycle = useSceneLifecycle({
    container,
    finalGender,
    serverScanId,
    faceOnly, // ADDED
    onSceneReady: useCallback(() => {
      logger.info('ORCHESTRATOR', 'Scene ready, proceeding to model loading', {
        serverScanId,
        philosophy: 'scene_to_model_transition'
      });

    }, [serverScanId])
  });

  // CRITICAL: Initialize morph and material lifecycles BEFORE modelLifecycle
  // because they are used in the onModelLoaded callback
  const morphLifecycle = useMorphLifecycle({
    finalGender,
    morphologyMapping,
    serverScanId
  });

  const materialLifecycle = useMaterialLifecycle({
    scene: sceneLifecycle.scene,
    skinTone: processedSkinTone,
    finalGender,
    serverScanId
  });

  // Initialize model lifecycle
  const modelLifecycle = useModelLifecycle({
    finalGender,
    serverScanId,
    onModelLoaded: useCallback(async (model, mainMesh) => {
      // CRITICAL: Use refs instead of closure variables to avoid recreating this callback
      const currentProps = propsRef.current;
      const currentMorphologyMapping = morphologyMappingRef.current;

      // Early return if morphologyMapping is not available yet
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

      // Update viewer state
      setViewerState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
      }));

      // Apply morphs and materials
      const payload = await processViewerPayload(currentProps, currentMorphologyMapping);
      if (payload.status === 'ready') {
        await morphLifecycle.applyMorphs(model, payload.shape_params, currentProps.faceMorphData, currentMorphologyMapping);

        // CRITICAL: Only apply limb masses if NOT in faceOnly mode
        if (!currentProps.faceOnly) {
          logger.info('ORCHESTRATOR', 'Applying limb masses (body mode)', {
            limbMassesCount: Object.keys(payload.limb_masses || {}).length,
            shapeParamsCount: Object.keys(payload.shape_params || {}).length,
            serverScanId,
            philosophy: 'body_mode_limb_masses'
          });
          // FIXED: Pass shape params for bone interplay evaluation
          await morphLifecycle.applyLimbMasses(model, payload.limb_masses, payload.shape_params);
        } else {
          logger.info('ORCHESTRATOR', 'Skipping limb masses application (faceOnly mode)', {
            faceOnly: currentProps.faceOnly,
            serverScanId,
            philosophy: 'face_only_skip_limb_masses'
          });
        }
      } else {
        // CRITICAL: Enhanced error handling for payload not ready
        logger.error('ORCHESTRATOR', 'Payload not ready for morph application - detailed diagnostics', {
          payloadStatus: payload.status,
          payloadError: payload.error,
          serverScanId,
          hasPayloadData: !!payload.data,
          payloadDataKeys: payload.data ? Object.keys(payload.data) : [],
          // Morphological data check
          hasMorphData: !!payload.data?.finalShapeParams,
          morphDataCount: payload.data?.finalShapeParams ? Object.keys(payload.data.finalShapeParams).length : 0,
          hasLimbMasses: !!payload.data?.finalLimbMasses,
          limbMassesCount: payload.data?.finalLimbMasses ? Object.keys(payload.data.finalLimbMasses).length : 0,
          // Gender check
          hasResolvedGender: !!payload.data?.resolvedGender,
          resolvedGenderValue: payload.data?.resolvedGender,
          // User profile check
          hasUserProfile: !!payload.data?.userProfile,
          userProfileKeys: payload.data?.userProfile ? Object.keys(payload.data.userProfile) : [],
          // Recommendations
          recommendations: [
            'Check if scan was committed successfully',
            'Verify body_scans table has all required columns',
            'Check if useProfileAvatarData is returning complete data',
            'Verify resolvedGender is persisted in database'
          ],
          philosophy: 'payload_not_ready_detailed_diagnostics'
        });

        // If in development, throw error to make it visible
        if (import.meta.env.DEV) {
          console.error('[ORCHESTRATOR] Payload not ready - Avatar cannot be rendered', {
            payload,
            serverScanId
          });
        }
      }

      await materialLifecycle.configureMaterials(currentProps.faceSkinTone || processedSkinToneRef.current);

      // Adjust camera and apply clipping for face-only mode
      if (sceneLifecycle.controls) {
        if (currentProps.faceOnly) {
          logger.info('ORCHESTRATOR', 'Adjusting camera and applying clipping for face scan focus', { serverScanId });

          // CRITICAL: Apply clipping BEFORE camera adjustments to ensure proper bounding box
          applyFaceOnlyClipping(model);

          // SAFETY: Force main mesh visibility after clipping
          if (DEBUG_FLAGS.FORCE_MESH_VISIBLE) {
            let mainMeshFound = false;
            model.traverse((obj) => {
              if (obj.type === 'SkinnedMesh' && obj instanceof THREE.SkinnedMesh) {
                if (obj.morphTargetDictionary && Object.keys(obj.morphTargetDictionary).length > 0) {
                  obj.visible = true;
                  mainMeshFound = true;
                  logger.info('ORCHESTRATOR', 'Forced main mesh visible (debug safety)', {
                    meshName: obj.name,
                    morphTargetsCount: Object.keys(obj.morphTargetDictionary).length,
                    serverScanId,
                    philosophy: 'debug_force_mesh_visible'
                  });
                }
              }
            });

            if (!mainMeshFound) {
              logger.error('ORCHESTRATOR', 'CRITICAL: Could not find main mesh to force visible!', {
                modelChildren: model.children.map(c => ({ name: c.name, type: c.type })),
                serverScanId,
                philosophy: 'critical_mesh_not_found'
              });
            }
          }

          // Configure camera for face view with improved positioning
          const headTarget = new THREE.Vector3(0, 1.65, 0); // Target slightly higher for better face framing
          sceneLifecycle.controls.setTarget(headTarget);

          // Position camera for optimal face viewing
          if (sceneLifecycle.camera) {
            const camera = sceneLifecycle.camera;
            const distance = 1.5; // Closer zoom for face details
            camera.position.set(0, 1.65, distance); // Position in front of face
            camera.lookAt(headTarget);
            camera.updateProjectionMatrix();

            // Adjust clipping planes for close-up face view
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

          // Snap to front view after positioning
          sceneLifecycle.controls.snapTo('front');
        } else {
          sceneLifecycle.controls.fitToObject(model, 0.02); // Fit to full body
        }
      }

      // Start render loop
      sceneLifecycle.startRenderLoop(viewerState.isAutoRotating, model);

      // Mark as ready
      setViewerState(prev => ({
        ...prev,
        isViewerReady: true,
      }));

      // CRITICAL: Set permanent initialization flag - this NEVER resets
      isFullyInitializedRef.current = true;

      // CRITICAL: Notify parent component that viewer is fully ready (morphs applied, materials configured)
      if (currentProps.onViewerReady) {
        logger.info('ORCHESTRATOR', 'Calling onViewerReady callback - viewer fully initialized', {
          serverScanId,
          philosophy: 'viewer_ready_callback'
        });
        currentProps.onViewerReady();
      }

      // CRITICAL: Activate projection session lock if override props present
      if (currentProps.overrideMorphData || currentProps.overrideGender || currentProps.overrideSkinTone) {
        isProjectionSessionActiveRef.current = true;
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
        initCount: initializationCountRef.current,
        totalReloads: perfMonitor.getReloadCounts().size,
        projectionSessionActive: isProjectionSessionActiveRef.current,
        philosophy: 'permanent_initialization_complete'
      });

      // Call onViewerReady only once
      if (!onViewerReadyCalledRef.current && currentProps.onViewerReady) {
        onViewerReadyCalledRef.current = true;
        setTimeout(() => {
          currentProps.onViewerReady!();
        }, 0);
      }

      // Update progress
      const progressState = useProgressStore.getState();
      if (progressState.isActive && progressState.overallProgress < 100) {
        progressState.setOverallProgress(100, 'Avatar 3D Prêt', 'Votre reflet numérique est maintenant visible');
      }

    }, [serverScanId, sceneLifecycle, viewerState.isAutoRotating])
    // NOTE: morphLifecycle and materialLifecycle are stable hooks, no need in deps
  });

  // Initialize scene when container is available
  useLayoutEffect(() => {
    // CRITICAL: Never reinitialize if fully initialized
    if (isFullyInitializedRef.current) {
      const perfMonitor = getGlobalPerformanceMonitor();
      perfMonitor.trackReload('Avatar3DViewer_SceneInit');

      logger.error('ORCHESTRATOR', '🚨 CRITICAL: Attempted reinitialize of fully initialized viewer!', {
        serverScanId,
        initialServerScanId: initialServerScanIdRef.current,
        initCount: initializationCountRef.current,
        projectionSessionActive: isProjectionSessionActiveRef.current,
        triggerSource: 'useLayoutEffect_sceneInit_dependencies',
        philosophy: 'permanent_guard_blocked_reinit'
      });
      return;
    }

    // CRITICAL: Additional guard for projection session
    if (isProjectionSessionActiveRef.current) {
      logger.error('ORCHESTRATOR', '🚨 BLOCKED: Scene init during projection session!', {
        serverScanId,
        philosophy: 'projection_session_guard_blocked_scene_init'
      });
      return;
    }

    if (!container ||
        sceneLifecycle.isInitialized ||
        sceneLifecycle.isInitializing ||
        initGuardRef.current) {
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

    initGuardRef.current = true;
    initializationCountRef.current++;

    // Store initial container ref
    if (!initialContainerRef.current) {
      initialContainerRef.current = container;
    }

    const perfMonitor = getGlobalPerformanceMonitor();
    const opId = perfMonitor.startOperation('scene_initialization', {
      serverScanId,
      initCount: initializationCountRef.current,
      containerChanged: initialContainerRef.current !== container
    });

    setViewerState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    sceneLifecycle.initializeScene().then(() => {
      perfMonitor.endOperation(opId);

      // MOBILE OPTIMIZATION: Start memory monitoring after scene initialization
      mobileMemoryMonitor.startMonitoring();
      logger.info('ORCHESTRATOR', 'Mobile memory monitoring started', {
        serverScanId,
        philosophy: 'memory_monitoring_init'
      });
    }).catch((error) => {
      perfMonitor.endOperation(opId);
      logger.error('ORCHESTRATOR', 'Scene initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        serverScanId,
        philosophy: 'scene_init_error'
      });

      setViewerState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Initialization failed',
        isLoading: false,
      }));

      initGuardRef.current = false;
    });

  }, [container]); // CRITICAL: Removed serverScanId from deps to prevent reload on scan ID changes

  // MOBILE OPTIMIZATION: Register cleanup callback for memory pressure
  useEffect(() => {
    if (!sceneLifecycle.scene) return;

    const cleanupCallback = () => {
      if (sceneLifecycle.scene) {
        cleanupThreeJSResources(sceneLifecycle.scene);
      }
    };

    mobileMemoryMonitor.onMemoryPressure(cleanupCallback);

    logger.info('ORCHESTRATOR', 'Registered Three.js cleanup callback for memory pressure', {
      serverScanId,
      philosophy: 'memory_pressure_cleanup_registered'
    });

    return () => {
      // Cleanup is handled by the monitor's internal callback list
    };
  }, [sceneLifecycle.scene, serverScanId]);

  // Separate effect to handle model loading when scene becomes available
  useLayoutEffect(() => {
    // CRITICAL: Skip if fully initialized - model already loaded
    if (isFullyInitializedRef.current) {
      logger.debug('ORCHESTRATOR', 'Skipping model loading - already fully initialized', {
        serverScanId,
        projectionSessionActive: isProjectionSessionActiveRef.current,
        triggerSource: 'useLayoutEffect_modelLoad_dependencies',
        philosophy: 'permanent_guard_prevents_reload'
      });
      return;
    }

    // CRITICAL: Additional guard for projection session
    if (isProjectionSessionActiveRef.current) {
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

    // CRITICAL FIX: Pass scene explicitly to loadModel
    modelLifecycle.loadModel(sceneLifecycle.scene).catch((error) => {
      logger.error('ORCHESTRATOR', 'Model loading failed with explicit scene reference', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sceneWasValid: !!sceneLifecycle.scene,
        sceneUuid: sceneLifecycle.scene?.uuid,
        serverScanId,
        philosophy: 'model_loading_failure_explicit_scene_reference'
      });
      
      setViewerState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Model loading failed',
        isLoading: false,
      }));
    });
  }, [
    sceneLifecycle.scene,
    sceneLifecycle.isInitialized,
    modelLifecycle.isLoading,
    modelLifecycle.loadModel
    // CRITICAL: Removed serverScanId from deps to prevent reload on scan ID changes
    // NOTE: morphLifecycle et materialLifecycle sont des objets stables créés par les hooks
    // Pas besoin de les ajouter aux dépendances car leurs méthodes sont stables
  ]);

  // OPTIMIZED: Throttled morph update system - CRITICAL: Isolated from initialization
  const lastMorphUpdateRef = useRef<number>(0);
  const morphUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMorphHashRef = useRef<string>('');
  const lastLimbMassHashRef = useRef<string>('');
  const lastSkinToneHashRef = useRef<string>('');
  const isApplyingMorphUpdateRef = useRef(false);
  const pendingUpdateRef = useRef<{ morphHash: string; limbMassHash: string; skinToneHash: string } | null>(null);
  const updateAttemptCountRef = useRef<number>(0);
  const successfulUpdateCountRef = useRef<number>(0);

  // CRITICAL: Watch for override morph data changes and update morphs in real-time with throttling
  // This effect is COMPLETELY ISOLATED from initialization - it only updates morphs, never reinitializes
  useLayoutEffect(() => {
    // CRITICAL: Skip if not fully initialized to prevent premature updates
    if (!isFullyInitializedRef.current) {
      return;
    }

    // CRITICAL: Skip if already applying update to prevent concurrent modifications
    if (isApplyingMorphUpdateRef.current) {
      return;
    }

    // Skip if model is not loaded yet or if we're still initializing
    if (!modelLifecycle.model || !modelLifecycle.modelRef.current || !viewerState.isViewerReady) {
      return;
    }

    // Skip if no override morph data is provided
    if (!props.overrideMorphData || Object.keys(props.overrideMorphData).length === 0) {
      return;
    }

    // Skip if morphology mapping is not available
    if (!morphologyMapping) {
      return;
    }

    // OPTIMIZED: Create hashes for all update types to batch changes
    const morphHash = JSON.stringify(props.overrideMorphData);
    const limbMassHash = props.overrideLimbMasses ? JSON.stringify(props.overrideLimbMasses) : '';
    const skinToneHash = props.overrideSkinTone ? JSON.stringify(props.overrideSkinTone) : '';

    // Check if anything actually changed
    const morphChanged = morphHash !== lastMorphHashRef.current;
    const limbMassChanged = limbMassHash !== lastLimbMassHashRef.current;
    const skinToneChanged = skinToneHash !== lastSkinToneHashRef.current;

    if (!morphChanged && !limbMassChanged && !skinToneChanged) {
      // Only log skip in debug mode to reduce noise
    if (import.meta.env.DEV) {
      logger.debug('ORCHESTRATOR', '✅ No changes detected, skipping update', {
        morphHash: morphHash.substring(0, 50),
        projectionSessionActive: isProjectionSessionActiveRef.current,
        philosophy: 'change_detection_skip'
      });
    }
      return; // Nothing changed, skip update
    }

    // PHASE 1 OPTIMIZATION: Only log in development mode to reduce production overhead
    if (import.meta.env.DEV) {
      logger.debug('ORCHESTRATOR', '🔄 Changes detected in override data', {
        morphChanged,
        limbMassChanged,
        skinToneChanged,
        morphKeyCount: props.overrideMorphData ? Object.keys(props.overrideMorphData).length : 0,
        limbMassKeyCount: props.overrideLimbMasses ? Object.keys(props.overrideLimbMasses).length : 0,
        projectionSessionActive: isProjectionSessionActiveRef.current,
        fullyInitialized: isFullyInitializedRef.current,
        philosophy: 'change_detection_positive'
      });
    }

    // MOBILE OPTIMIZATION: Adaptive throttle based on device
    // Mobile: 400ms to prevent excessive updates and memory pressure
    // Desktop: 150ms for responsive feedback
    const now = Date.now();
    const timeSinceLastUpdate = now - lastMorphUpdateRef.current;
    const isMobile = typeof navigator !== 'undefined' && /mobile|android|iphone|ipod/i.test(navigator.userAgent);
    const MIN_UPDATE_INTERVAL = isMobile ? 400 : 150; // ms

    const performUpdate = async () => {
      // CRITICAL: Set guard flag to prevent concurrent updates
      isApplyingMorphUpdateRef.current = true;

      try {
        const updateStartTime = Date.now();
        lastMorphUpdateRef.current = updateStartTime;

        // Retrieve pending update or use current
        const updateData = pendingUpdateRef.current || { morphHash, limbMassHash, skinToneHash };
        pendingUpdateRef.current = null;

        // Determine what changed for this specific update
        const updateMorphChanged = updateData.morphHash !== lastMorphHashRef.current;
        const updateLimbMassChanged = updateData.limbMassHash !== lastLimbMassHashRef.current;
        const updateSkinToneChanged = updateData.skinToneHash !== lastSkinToneHashRef.current;

        // OPTIMIZED: Update all hashes at once (batching)
        lastMorphHashRef.current = updateData.morphHash;
        lastLimbMassHashRef.current = updateData.limbMassHash;
        lastSkinToneHashRef.current = updateData.skinToneHash;

        updateAttemptCountRef.current++;
        // PHASE 1 OPTIMIZATION: Minimal logging - only every 5th update
        if (import.meta.env.DEV && updateAttemptCountRef.current % 5 === 1) {
          logger.debug('ORCHESTRATOR', '🎯 BATCH UPDATE START (no scene reinitialization)', {
            updateAttemptNumber: updateAttemptCountRef.current,
            morphChanged: updateMorphChanged,
            limbMassChanged: updateLimbMassChanged,
            skinToneChanged: updateSkinToneChanged,
            isFullyInitialized: isFullyInitializedRef.current,
            projectionSessionActive: isProjectionSessionActiveRef.current,
            timeSinceLastUpdate: `${timeSinceLastUpdate}ms`,
            minUpdateInterval: `${MIN_UPDATE_INTERVAL}ms`,
            philosophy: 'isolated_batch_update_start_sampled'
          });
        }

        // Apply updated morphs without reconstructing the scene (only if changed)
        if (updateMorphChanged) {
          const morphStartTime = Date.now();
          await morphLifecycle.applyMorphs(
            modelLifecycle.model!,
            props.overrideMorphData!,
            propsRef.current.faceMorphData,
            morphologyMapping
          );
          // PHASE 1 OPTIMIZATION: Only log slow operations
          const morphDuration = Date.now() - morphStartTime;
          if (morphDuration > 100 || import.meta.env.DEV) {
            logger.debug('ORCHESTRATOR', '✅ Morphs applied', {
              duration: `${morphDuration}ms`,
              philosophy: 'morph_update_complete'
            });
          }
        }

        // Apply updated limb masses if provided (only if changed)
        if (updateLimbMassChanged && props.overrideLimbMasses && Object.keys(props.overrideLimbMasses).length > 0 && !propsRef.current.faceOnly) {
          const limbStartTime = Date.now();
          await morphLifecycle.applyLimbMasses(
            modelLifecycle.model!,
            props.overrideLimbMasses
          );
          // PHASE 1 OPTIMIZATION: Only log slow operations
          const limbDuration = Date.now() - limbStartTime;
          if (limbDuration > 50 || import.meta.env.DEV) {
            logger.debug('ORCHESTRATOR', '✅ Limb masses applied', {
              duration: `${limbDuration}ms`,
              philosophy: 'limb_mass_update_complete'
            });
          }
        }

        // Update materials if skin tone changed (only if changed)
        if (updateSkinToneChanged && props.overrideSkinTone) {
          const materialStartTime = Date.now();
          await materialLifecycle.configureMaterials(props.overrideSkinTone);
          // PHASE 1 OPTIMIZATION: Only log slow operations
          const materialDuration = Date.now() - materialStartTime;
          if (materialDuration > 50 || import.meta.env.DEV) {
            logger.debug('ORCHESTRATOR', '✅ Materials updated', {
              duration: `${materialDuration}ms`,
              philosophy: 'material_update_complete'
            });
          }
        }

        const totalDuration = Date.now() - updateStartTime;
        successfulUpdateCountRef.current++;
        // PHASE 1 OPTIMIZATION: Only log slow operations (>100ms) or every 10th update
        if (totalDuration > 100 || (import.meta.env.DEV && successfulUpdateCountRef.current % 10 === 0)) {
          logger.info('ORCHESTRATOR', '✨ BATCH UPDATE COMPLETE', {
            updateNumber: successfulUpdateCountRef.current,
            totalDuration: `${totalDuration}ms`,
            morphApplied: updateMorphChanged,
            limbMassApplied: updateLimbMassChanged,
            skinToneApplied: updateSkinToneChanged,
            projectionSessionActive: isProjectionSessionActiveRef.current,
            philosophy: 'batch_update_success_sampled'
          });
        }
      } catch (error) {
        logger.error('ORCHESTRATOR', 'Error during morph-only update', {
          error: error instanceof Error ? error.message : 'Unknown error',
          updateAttemptNumber: updateAttemptCountRef.current,
          successfulUpdates: successfulUpdateCountRef.current,
          stack: error instanceof Error ? error.stack : undefined,
          philosophy: 'morph_update_error'
        });
      } finally {
        // CRITICAL: Always release the guard flag
        isApplyingMorphUpdateRef.current = false;
      }
    };

    // Store pending update for batching
    pendingUpdateRef.current = { morphHash, limbMassHash, skinToneHash };

    if (timeSinceLastUpdate >= MIN_UPDATE_INTERVAL) {
      // Enough time has passed, update immediately
      // PHASE 1 OPTIMIZATION: Removed verbose logging
      performUpdate();
    } else {
      // Schedule update for later to batch rapid changes
      const delay = MIN_UPDATE_INTERVAL - timeSinceLastUpdate;
      // PHASE 1 OPTIMIZATION: Removed verbose logging

      if (morphUpdateTimeoutRef.current) {
        clearTimeout(morphUpdateTimeoutRef.current);
      }
      morphUpdateTimeoutRef.current = setTimeout(() => {
        performUpdate();
      }, delay);
    }

    return () => {
      if (morphUpdateTimeoutRef.current) {
        clearTimeout(morphUpdateTimeoutRef.current);
      }
    };
  }, [
    props.overrideMorphData,
    props.overrideLimbMasses,
    props.overrideSkinTone,
    viewerState.isViewerReady,
    modelLifecycle.model,
    modelLifecycle.modelRef,
    morphologyMapping,
    morphLifecycle.applyMorphs,
    morphLifecycle.applyLimbMasses,
    materialLifecycle.configureMaterials
    // NOTE: faceMorphData, faceOnly, serverScanId accessed via propsRef to avoid recreating effect
  ]);

  // DIAGNOSTIC: Log projection session stats periodically (debug mode only)
  useLayoutEffect(() => {
    if (!isProjectionSessionActiveRef.current || !import.meta.env.DEV) return;

    const logInterval = setInterval(() => {
      logger.info('ORCHESTRATOR', '📊 PROJECTION SESSION STATS', {
        sessionActive: isProjectionSessionActiveRef.current,
        fullyInitialized: isFullyInitializedRef.current,
        updateAttempts: updateAttemptCountRef.current,
        successfulUpdates: successfulUpdateCountRef.current,
        successRate: updateAttemptCountRef.current > 0
          ? `${((successfulUpdateCountRef.current / updateAttemptCountRef.current) * 100).toFixed(1)}%`
          : 'N/A',
        viewerReady: viewerState.isViewerReady,
        hasModel: !!modelLifecycle.model,
        philosophy: 'projection_session_stats'
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(logInterval);
  }, [viewerState.isViewerReady, modelLifecycle.model]);

  // Camera control functions
  const setCameraView = useCallback((view: 'front' | 'profile' | 'threequarter') => {
    if (!sceneLifecycle.controls) return;
    
    setViewerState(prev => ({ ...prev, activeView: view }));
    sceneLifecycle.controls.snapTo(view === 'threequarter' ? 'threequarter' : view);
  }, [sceneLifecycle.controls]);

  const toggleAutoRotate = useCallback(() => {
    const newAutoRotate = !viewerState.isAutoRotating;
    
    setViewerState(prev => ({ ...prev, isAutoRotating: newAutoRotate }));
    
    if (sceneLifecycle.controls) {
      sceneLifecycle.controls.setAutoRotate(newAutoRotate);
    }
  }, [viewerState.isAutoRotating, sceneLifecycle.controls]);

  const resetCamera = useCallback(() => {
    if (sceneLifecycle.controls) {
      sceneLifecycle.controls.reset();
      setViewerState(prev => ({ ...prev, activeView: 'threequarter' }));
    }
  }, [sceneLifecycle.controls]);

  const updateMorphData = useCallback((newMorphData: Record<string, number>) => {
    if (modelLifecycle.modelRef.current) {
      morphLifecycle.applyMorphs(modelLifecycle.modelRef.current, newMorphData, faceMorphData, morphologyMapping); // MODIFIED: Pass faceMorphData and morphologyMapping
      onMorphDataChange?.(newMorphData);
      
      logger.debug('ORCHESTRATOR', 'Direct morph update applied via ref', {
        morphDataKeys: Object.keys(newMorphData),
        serverScanId,
        philosophy: 'direct_ref_morph_update'
      });
    }
  }, [modelLifecycle.modelRef, morphLifecycle.applyMorphs, onMorphDataChange, serverScanId, faceMorphData, morphologyMapping]); // NOUVEAU: Ajouter faceMorphData et morphologyMapping aux dépendances

  const forceMorphsUpdate = useCallback((morphData: Record<string, number>) => {
    if (modelLifecycle.modelRef.current) {
      morphLifecycle.forceMorphsUpdate(modelLifecycle.modelRef.current, morphData, faceMorphData, morphologyMapping); // MODIFIED: Pass faceMorphData and morphologyMapping
      logger.debug('ORCHESTRATOR', 'Forced morph cache reset via orchestrator', {
        serverScanId,
        philosophy: 'orchestrator_force_morph_update'
      });
    }
  }, [modelLifecycle.modelRef, morphLifecycle.forceMorphsUpdate, serverScanId, faceMorphData, morphologyMapping]); // NOUVEAU: Ajouter faceMorphData et morphologyMapping aux dépendances

  const retryInitialization = useCallback(() => {
    logger.info('ORCHESTRATOR', 'Retrying initialization with complete cleanup', {
      serverScanId,
      projectionSessionWasActive: isProjectionSessionActiveRef.current,
      philosophy: 'retry_with_cleanup'
    });

    // CRITICAL: Reset projection session lock on retry
    isProjectionSessionActiveRef.current = false;
    finalGenderLockedRef.current = false;
    processedSkinToneLockedRef.current = false;

    // MOBILE OPTIMIZATION: Stop memory monitoring before cleanup
    mobileMemoryMonitor.stopMonitoring();

    // Complete cleanup
    sceneLifecycle.cleanup();
    modelLifecycle.cleanupModel();
    morphLifecycle.resetMorphs();

    // Reset state
    setViewerState({
      isLoading: true,
      error: null,
      isInitialized: false,
      isViewerReady: false,
      activeView: 'threequarter',
      isAutoRotating: autoRotate,
    });

    onViewerReadyCalledRef.current = false;
    initGuardRef.current = false;
    isFullyInitializedRef.current = false;

    // Reset counters
    updateAttemptCountRef.current = 0;
    successfulUpdateCountRef.current = 0;

    logger.info('ORCHESTRATOR', 'Retry initialization state reset completed', {
      serverScanId,
      philosophy: 'retry_state_reset_complete'
    });
  }, [sceneLifecycle.cleanup, modelLifecycle.cleanupModel, morphLifecycle.resetMorphs, autoRotate, serverScanId]);

  // MOBILE OPTIMIZATION: Stop memory monitoring on component unmount
  useEffect(() => {
    return () => {
      mobileMemoryMonitor.stopMonitoring();
      logger.info('ORCHESTRATOR', 'Memory monitoring stopped on unmount', {
        serverScanId,
        philosophy: 'memory_monitoring_cleanup'
      });
    };
  }, [serverScanId]);

  // Determine readiness and error state
  const isReady = viewerState.isViewerReady && !viewerState.isLoading && !viewerState.error;
  const hasError = !!viewerState.error;

  return {
    // State
    viewerState,
    
    // Scene references
    scene: sceneLifecycle.scene,
    renderer: sceneLifecycle.renderer,
    camera: sceneLifecycle.camera,
    controls: sceneLifecycle.controls,
    
    // Model references
    model: modelLifecycle.model,
    mainMesh: modelLifecycle.modelRef.current,
    
    // Actions
    setCameraView,
    toggleAutoRotate,
    resetCamera,
    updateMorphData,
    retryInitialization,
    forceMorphsUpdate,
    
    // Status
    isReady,
    hasError,
    errorMessage: viewerState.error,
  };
}