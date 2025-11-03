import { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { applyMorphDataToModel } from '../core/morphApplier';
import { applyLimbMassToBones } from '../../../../lib/3d/bones/applyLimbMassToBones';
import { useMorphologyMapping } from '../../../../hooks/useMorphologyMapping';
import logger from '../../../../lib/utils/logger';
import { MorphStreamOrchestrator } from '../../../../lib/3d/morph/MorphStreamOrchestrator';
import { getGlobalPerformanceMonitor } from '../../../../lib/utils/PerformanceMonitor';

interface UseMorphLifecycleProps {
  finalGender: 'male' | 'female';
  morphologyMapping?: any;
  serverScanId?: string;
}

/**
 * Hook for managing morph application lifecycle with React state
 */
export function useMorphLifecycle({
  finalGender,
  morphologyMapping,
  serverScanId
}: UseMorphLifecycleProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const morphsAppliedRef = useRef<boolean>(false);
  const lastAppliedHashRef = useRef<string | null>(null);
  const morphStreamOrchestrator = useRef<MorphStreamOrchestrator | null>(null);
  const useProgressiveApplication = useRef<boolean>(true); // Enable progressive morphs by default

  // Apply morphs to model
  const applyMorphs = useCallback(async (
    model: THREE.Group,
    morphData: Record<string, number>,
    faceMorphData?: Record<string, number>, // ADDED
    callerMorphologyMapping?: any // ADDED: Accept morphologyMapping from caller
  ) => {
    // Use caller's morphologyMapping if provided, otherwise use hook's morphologyMapping
    const effectiveMorphologyMapping = callerMorphologyMapping || morphologyMapping;
    
    // Early validation of morphologyMapping
    if (!effectiveMorphologyMapping) {
      logger.warn('MORPH_LIFECYCLE', 'Cannot apply morphs - morphologyMapping not available', {
        hasCallerMapping: !!callerMorphologyMapping,
        hasHookMapping: !!morphologyMapping,
        serverScanId,
        philosophy: 'morphology_mapping_validation'
      });
      return;
    }

    // Log morph application in debug mode only
    logger.debug('MORPH_LIFECYCLE', 'applyMorphs called', {
      hasModel: !!model,
      morphDataCount: morphData ? Object.keys(morphData).length : 0,
      faceMorphDataCount: faceMorphData ? Object.keys(faceMorphData).length : 0,
      serverScanId,
      philosophy: 'morph_application_call'
    });

    if (!model || (!morphData && !faceMorphData) || (Object.keys(morphData).length === 0 && Object.keys(faceMorphData || {}).length === 0)) { // MODIFIED
      logger.warn('MORPH_LIFECYCLE', 'Cannot apply morphs - invalid input', {
        hasModel: !!model,
        hasMorphData: !!morphData,
        morphDataKeys: morphData ? Object.keys(morphData).length : 0,
        hasFaceMorphData: !!faceMorphData, // ADDED
        faceMorphDataKeys: faceMorphData ? Object.keys(faceMorphData).length : 0, // ADDED
        serverScanId,
        philosophy: 'input_validation'
      });
      return;
    }

    // Generate hash for deduplication
    const morphHash = JSON.stringify(Object.keys(morphData).sort().map(k => [k, morphData[k]]));
    const faceMorphHash = JSON.stringify(Object.keys(faceMorphData || {}).sort().map(k => [k, (faceMorphData || {})[k]])); // ADDED
    const combinedHash = `${morphHash}-${faceMorphHash}`; // ADDED
    
    if (lastAppliedHashRef.current === combinedHash) { // MODIFIED
      logger.debug('MORPH_LIFECYCLE', 'Skipping morph application - same data', {
        serverScanId,
        philosophy: 'deduplication'
      });
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      logger.info('MORPH_LIFECYCLE', 'Applying morphs to model', {
        morphDataCount: Object.keys(morphData).length,
        faceMorphDataCount: Object.keys(faceMorphData || {}).length, // ADDED
        serverScanId,
        philosophy: 'morph_application_start'
      });

      await applyMorphDataToModel({
        model,
        morphData,
        gender: finalGender,
        morphologyMapping: effectiveMorphologyMapping, // Use effective mapping
        serverScanId,
        faceMorphData // ADDED
      });

      // Log final morph target influences after application - IMPROVED DETECTION
      let mainMesh: THREE.SkinnedMesh | null = null;

      // Strategy 1: Direct children search
      const directSkinnedMesh = model.children.find(child => child.type === 'SkinnedMesh') as THREE.SkinnedMesh;
      if (directSkinnedMesh) {
        mainMesh = directSkinnedMesh;
      }

      // Strategy 2: Deep traversal if not found in direct children
      if (!mainMesh) {
        model.traverse((child) => {
          if (child.type === 'SkinnedMesh' && child instanceof THREE.SkinnedMesh) {
            if (!mainMesh ||
                (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > Object.keys(mainMesh.morphTargetDictionary || {}).length)) {
              mainMesh = child;
            }
          }
        });
      }

      if (mainMesh) {
        const nonZeroInfluences = mainMesh.morphTargetInfluences ?
          mainMesh.morphTargetInfluences
            .map((value, index) => ({ index, value, name: Object.keys(mainMesh!.morphTargetDictionary || {}).find(k => mainMesh!.morphTargetDictionary![k] === index) }))
            .filter(item => item.value !== 0) : [];

        logger.info('MORPH_LIFECYCLE', 'Final morphTargetInfluences after application', {
          meshName: mainMesh.name,
          meshVisible: mainMesh.visible,
          morphTargetInfluencesLength: mainMesh.morphTargetInfluences?.length || 0,
          nonZeroCount: nonZeroInfluences.length,
          nonZeroInfluences: nonZeroInfluences.slice(0, 10),
          morphTargetDictionarySize: Object.keys(mainMesh.morphTargetDictionary || {}).length,
          geometryMorphTargetsLength: mainMesh.geometry?.morphTargets?.length,
          serverScanId,
          philosophy: 'morph_influences_verification'
        });
      } else {
        logger.error('MORPH_LIFECYCLE', 'Could not find main SkinnedMesh for morphTargetInfluences logging', {
          modelChildren: model.children.map(c => ({ name: c.name, type: c.type })),
          modelChildrenCount: model.children.length,
          serverScanId,
          philosophy: 'critical_mesh_detection_failed'
        });
      }

      lastAppliedHashRef.current = combinedHash; // MODIFIED
      morphsAppliedRef.current = true;

      logger.info('MORPH_LIFECYCLE', 'Morphs applied successfully', {
        serverScanId,
        philosophy: 'morph_application_complete'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      logger.error('MORPH_LIFECYCLE', 'Morph application failed', {
        error: errorMessage,
        serverScanId,
        philosophy: 'morph_application_error'
      });
    } finally {
      setIsApplying(false);
    }
  }, [finalGender, morphologyMapping, serverScanId]);

  // Apply limb masses to model
  const applyLimbMasses = useCallback(async (
    model: THREE.Group,
    limbMasses: Record<string, number>,
    shapeParams?: Record<string, number> // ADDED: Accept shape params for bone interplay evaluation
  ) => {
    if (!model || !limbMasses || Object.keys(limbMasses).length === 0) {
      logger.warn('MORPH_LIFECYCLE', 'Cannot apply limb masses - invalid input', {
        hasModel: !!model,
        hasLimbMasses: !!limbMasses,
        limbMassesKeys: limbMasses ? Object.keys(limbMasses).length : 0,
        serverScanId,
        philosophy: 'limb_mass_input_validation'
      });
      return;
    }

    try {
      logger.info('MORPH_LIFECYCLE', 'Applying limb masses to model', {
        limbMassesCount: Object.keys(limbMasses).length,
        shapeParamsCount: shapeParams ? Object.keys(shapeParams).length : 0,
        serverScanId,
        philosophy: 'limb_mass_application_start'
      });

      const massesForBones = {
        gate: limbMasses.gate ?? 1,
        isActive: limbMasses.isActive ?? true,
        armMass: limbMasses.armMass,
        forearmMass: limbMasses.forearmMass,
        thighMass: limbMasses.thighMass,
        calfMass: limbMasses.calfMass,
        neckMass: limbMasses.neckMass,
        hipMass: limbMasses.hipMass,
      };

      // FIXED: Pass shape params instead of empty object
      applyLimbMassToBones(model, massesForBones, shapeParams || {}, {
        lengthAxis: 'y',
        log: true
      });

      logger.info('MORPH_LIFECYCLE', 'Limb masses applied successfully', {
        serverScanId,
        philosophy: 'limb_mass_application_complete'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('MORPH_LIFECYCLE', 'Limb mass application failed', {
        error: errorMessage,
        serverScanId,
        philosophy: 'limb_mass_application_error'
      });
    }
  }, [serverScanId]);

  // Apply morphs with smooth interpolation for real-time updates
  const applyMorphsLive = useCallback(async (
    model: THREE.Group,
    targetMorphData: Record<string, number>,
    options?: {
      transitionDuration?: number; // milliseconds
      skipDuplicateCheck?: boolean;
    }
  ) => {
    const { transitionDuration = 0, skipDuplicateCheck = false } = options || {};

    if (!model || !targetMorphData || Object.keys(targetMorphData).length === 0) {
      logger.warn('MORPH_LIFECYCLE', 'Cannot apply live morphs - invalid input', {
        hasModel: !!model,
        hasTargetMorphData: !!targetMorphData,
        serverScanId,
        philosophy: 'live_morph_input_validation'
      });
      return;
    }

    // Skip duplicate check if requested (for forced updates)
    if (!skipDuplicateCheck) {
      const targetHash = JSON.stringify(Object.keys(targetMorphData).sort().map(k => [k, targetMorphData[k]]));
      if (lastAppliedHashRef.current === targetHash) {
        logger.debug('MORPH_LIFECYCLE', 'Skipping live morph - same data', {
          serverScanId,
          philosophy: 'live_morph_deduplication'
        });
        return;
      }
    }

    try {
      logger.info('MORPH_LIFECYCLE', 'Applying live morphs with transition', {
        targetMorphCount: Object.keys(targetMorphData).length,
        transitionDuration,
        serverScanId,
        philosophy: 'live_morph_application_start'
      });

      // For now, apply morphs directly (tweening will be added in next step)
      await applyMorphDataToModel({
        model,
        morphData: targetMorphData,
        gender: finalGender,
        morphologyMapping: morphologyMapping,
        serverScanId
      });

      const targetHash = JSON.stringify(Object.keys(targetMorphData).sort().map(k => [k, targetMorphData[k]]));
      lastAppliedHashRef.current = targetHash;

      logger.info('MORPH_LIFECYCLE', 'Live morphs applied successfully', {
        serverScanId,
        philosophy: 'live_morph_application_complete'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('MORPH_LIFECYCLE', 'Live morph application failed', {
        error: errorMessage,
        serverScanId,
        philosophy: 'live_morph_application_error'
      });
    }
  }, [finalGender, morphologyMapping, serverScanId]);

  // Reset morph state
  const resetMorphs = useCallback(async () => {
    // This function needs to be implemented based on how you want to reset.
    // For now, it's a placeholder. You might want to re-apply initial morphs.
    logger.warn('MORPH_LIFECYCLE', 'resetMorphs called - not fully implemented yet', { serverScanId });
  }, [serverScanId]);

  return {
    // State
    isApplying,
    error,
    morphsApplied: morphsAppliedRef.current,

    // Actions
    applyMorphs,
    applyMorphsLive,
    applyLimbMasses,
    resetMorphs,
    forceMorphsUpdate: useCallback(async (model?: THREE.Group, morphData?: Record<string, number>, faceMorphData?: Record<string, number>, callerMorphologyMapping?: any) => { // MODIFIED: Add callerMorphologyMapping parameter
      lastAppliedHashRef.current = null;
      logger.debug('MORPH_LIFECYCLE', 'Forced morph cache reset with immediate reapplication', {
        serverScanId,
        hasModel: !!model,
        hasMorphData: !!morphData,
        hasFaceMorphData: !!faceMorphData, // ADDED
        hasCallerMorphologyMapping: !!callerMorphologyMapping, // ADDED
        philosophy: 'force_morph_reapplication_immediate'
      });
      
      // Force immediate reapplication if model and morphData are provided
      if (model && (morphData || faceMorphData) && (Object.keys(morphData || {}).length > 0 || Object.keys(faceMorphData || {}).length > 0)) { // MODIFIED
        await applyMorphs(model, morphData || {}, faceMorphData || {}, callerMorphologyMapping); // MODIFIED: Pass callerMorphologyMapping
        logger.debug('MORPH_LIFECYCLE', 'Immediate morph reapplication completed', {
          serverScanId,
          philosophy: 'immediate_reapplication_after_cache_reset'
        });
      }
    }, [serverScanId, applyMorphs])
  };
}
