/**
 * Morph Updates Hook
 * Handles real-time morph updates with throttling and batching
 */

import { useLayoutEffect, useRef, useCallback } from 'react';
import type { ViewerStateRefs } from './useViewerState';
import logger from '../../../../lib/utils/logger';

interface UseMorphUpdatesProps {
  refs: ViewerStateRefs;
  viewerState: { isViewerReady: boolean };
  modelRef: React.MutableRefObject<THREE.Group | null>;
  overrideMorphData?: Record<string, number>;
  overrideLimbMasses?: Record<string, number>;
  overrideSkinTone?: any;
  faceOnly?: boolean;
  morphologyMapping: any;
  applyMorphs: (model: THREE.Group, morphData: Record<string, number>, faceMorphData?: any, mapping?: any) => Promise<void>;
  applyLimbMasses: (model: THREE.Group, limbMasses: Record<string, number>, shapeParams?: Record<string, number>) => Promise<void>;
  configureMaterials: (skinTone: any) => Promise<void>;
}

export function useMorphUpdates({
  refs,
  viewerState,
  modelRef,
  overrideMorphData,
  overrideLimbMasses,
  overrideSkinTone,
  faceOnly,
  morphologyMapping,
  applyMorphs,
  applyLimbMasses,
  configureMaterials
}: UseMorphUpdatesProps) {
  const lastMorphUpdateRef = useRef<number>(0);
  const morphUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMorphHashRef = useRef<string>('');
  const lastLimbMassHashRef = useRef<string>('');
  const lastSkinToneHashRef = useRef<string>('');
  const isApplyingMorphUpdateRef = useRef(false);
  const pendingUpdateRef = useRef<{ morphHash: string; limbMassHash: string; skinToneHash: string } | null>(null);
  const updateAttemptCountRef = useRef<number>(0);
  const successfulUpdateCountRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (!refs.isFullyInitializedRef.current) {
      return;
    }

    if (isApplyingMorphUpdateRef.current) {
      return;
    }

    if (!modelRef.current || !viewerState.isViewerReady) {
      return;
    }

    if (!overrideMorphData || Object.keys(overrideMorphData).length === 0) {
      return;
    }

    if (!morphologyMapping) {
      return;
    }

    const morphHash = JSON.stringify(overrideMorphData);
    const limbMassHash = overrideLimbMasses ? JSON.stringify(overrideLimbMasses) : '';
    const skinToneHash = overrideSkinTone ? JSON.stringify(overrideSkinTone) : '';

    const morphChanged = morphHash !== lastMorphHashRef.current;
    const limbMassChanged = limbMassHash !== lastLimbMassHashRef.current;
    const skinToneChanged = skinToneHash !== lastSkinToneHashRef.current;

    if (!morphChanged && !limbMassChanged && !skinToneChanged) {
      if (import.meta.env.DEV) {
        logger.debug('ORCHESTRATOR', '✅ No changes detected, skipping update', {
          morphHash: morphHash.substring(0, 50),
          projectionSessionActive: refs.isProjectionSessionActiveRef.current,
          philosophy: 'change_detection_skip'
        });
      }
      return;
    }

    if (import.meta.env.DEV) {
      logger.debug('ORCHESTRATOR', '🔄 Changes detected in override data', {
        morphChanged,
        limbMassChanged,
        skinToneChanged,
        morphKeyCount: overrideMorphData ? Object.keys(overrideMorphData).length : 0,
        limbMassKeyCount: overrideLimbMasses ? Object.keys(overrideLimbMasses).length : 0,
        projectionSessionActive: refs.isProjectionSessionActiveRef.current,
        fullyInitialized: refs.isFullyInitializedRef.current,
        philosophy: 'change_detection_positive'
      });
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastMorphUpdateRef.current;
    const isMobile = typeof navigator !== 'undefined' && /mobile|android|iphone|ipod/i.test(navigator.userAgent);
    const MIN_UPDATE_INTERVAL = isMobile ? 400 : 150;

    const performUpdate = async () => {
      isApplyingMorphUpdateRef.current = true;

      try {
        const updateStartTime = Date.now();
        lastMorphUpdateRef.current = updateStartTime;

        const updateData = pendingUpdateRef.current || { morphHash, limbMassHash, skinToneHash };
        pendingUpdateRef.current = null;

        const updateMorphChanged = updateData.morphHash !== lastMorphHashRef.current;
        const updateLimbMassChanged = updateData.limbMassHash !== lastLimbMassHashRef.current;
        const updateSkinToneChanged = updateData.skinToneHash !== lastSkinToneHashRef.current;

        lastMorphHashRef.current = updateData.morphHash;
        lastLimbMassHashRef.current = updateData.limbMassHash;
        lastSkinToneHashRef.current = updateData.skinToneHash;

        updateAttemptCountRef.current++;

        if (import.meta.env.DEV && updateAttemptCountRef.current % 5 === 1) {
          logger.debug('ORCHESTRATOR', '🎯 BATCH UPDATE START (no scene reinitialization)', {
            updateAttemptNumber: updateAttemptCountRef.current,
            morphChanged: updateMorphChanged,
            limbMassChanged: updateLimbMassChanged,
            skinToneChanged: updateSkinToneChanged,
            isFullyInitialized: refs.isFullyInitializedRef.current,
            projectionSessionActive: refs.isProjectionSessionActiveRef.current,
            timeSinceLastUpdate: `${timeSinceLastUpdate}ms`,
            minUpdateInterval: `${MIN_UPDATE_INTERVAL}ms`,
            philosophy: 'isolated_batch_update_start_sampled'
          });
        }

        if (updateMorphChanged) {
          const morphStartTime = Date.now();
          await applyMorphs(
            modelRef.current!,
            overrideMorphData!,
            refs.propsRef.current.faceMorphData,
            morphologyMapping
          );
          const morphDuration = Date.now() - morphStartTime;
          if (morphDuration > 100 || import.meta.env.DEV) {
            logger.debug('ORCHESTRATOR', '✅ Morphs applied', {
              duration: `${morphDuration}ms`,
              philosophy: 'morph_update_complete'
            });
          }
        }

        if (updateLimbMassChanged && overrideLimbMasses && Object.keys(overrideLimbMasses).length > 0 && !faceOnly) {
          const limbStartTime = Date.now();
          await applyLimbMasses(modelRef.current!, overrideLimbMasses);
          const limbDuration = Date.now() - limbStartTime;
          if (limbDuration > 50 || import.meta.env.DEV) {
            logger.debug('ORCHESTRATOR', '✅ Limb masses applied', {
              duration: `${limbDuration}ms`,
              philosophy: 'limb_mass_update_complete'
            });
          }
        }

        if (updateSkinToneChanged && overrideSkinTone) {
          const materialStartTime = Date.now();
          await configureMaterials(overrideSkinTone);
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

        if (totalDuration > 100 || (import.meta.env.DEV && successfulUpdateCountRef.current % 10 === 0)) {
          logger.info('ORCHESTRATOR', '✨ BATCH UPDATE COMPLETE', {
            updateNumber: successfulUpdateCountRef.current,
            totalDuration: `${totalDuration}ms`,
            morphApplied: updateMorphChanged,
            limbMassApplied: updateLimbMassChanged,
            skinToneApplied: updateSkinToneChanged,
            projectionSessionActive: refs.isProjectionSessionActiveRef.current,
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
        isApplyingMorphUpdateRef.current = false;
      }
    };

    pendingUpdateRef.current = { morphHash, limbMassHash, skinToneHash };

    if (timeSinceLastUpdate >= MIN_UPDATE_INTERVAL) {
      performUpdate();
    } else {
      const delay = MIN_UPDATE_INTERVAL - timeSinceLastUpdate;

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
    overrideMorphData,
    overrideLimbMasses,
    overrideSkinTone,
    viewerState.isViewerReady,
    modelRef,
    morphologyMapping,
    applyMorphs,
    applyLimbMasses,
    configureMaterials,
    faceOnly,
    refs
  ]);

  const updateMorphData = useCallback((newMorphData: Record<string, number>) => {
    if (modelRef.current) {
      const faceMorphData = refs.propsRef.current.faceMorphData;
      applyMorphs(modelRef.current, newMorphData, faceMorphData, morphologyMapping);

      const onMorphDataChange = refs.propsRef.current.onMorphDataChange;
      onMorphDataChange?.(newMorphData);

      logger.debug('ORCHESTRATOR', 'Direct morph update applied via ref', {
        morphDataKeys: Object.keys(newMorphData),
        serverScanId: refs.propsRef.current.serverScanId,
        philosophy: 'direct_ref_morph_update'
      });
    }
  }, [modelRef, applyMorphs, morphologyMapping, refs]);

  return {
    updateMorphData,
    updateStats: {
      attempts: updateAttemptCountRef.current,
      successes: successfulUpdateCountRef.current
    }
  };
}
