/**
 * Update morphs in-place without recreating the scene
 * Critical for mobile performance in projection mode
 */

import * as THREE from 'three';
import logger from '../../utils/logger';

interface UpdateMorphsInPlaceOptions {
  model: THREE.Group;
  targetMorphData: Record<string, number>;
  morphologyMapping: any;
  serverScanId?: string;
  smoothTransition?: boolean;
  transitionDuration?: number; // milliseconds
}

/**
 * Updates morph target influences directly on the existing mesh
 * without triggering any React re-renders or scene reinitializations.
 *
 * This is the KEY optimization for mobile performance in projection mode.
 */
export async function updateMorphsInPlace({
  model,
  targetMorphData,
  morphologyMapping,
  serverScanId,
  smoothTransition = false,
  transitionDuration = 300
}: UpdateMorphsInPlaceOptions): Promise<void> {
  if (!model || !targetMorphData || !morphologyMapping) {
    logger.warn('UPDATE_MORPHS_IN_PLACE', 'Invalid inputs', {
      hasModel: !!model,
      hasTargetMorphData: !!targetMorphData,
      hasMorphologyMapping: !!morphologyMapping,
      serverScanId
    });
    return;
  }

  // Find main mesh
  let mainMesh: THREE.SkinnedMesh | null = null;
  model.traverse((obj) => {
    if (obj instanceof THREE.SkinnedMesh && obj.morphTargetDictionary) {
      if (!mainMesh || Object.keys(obj.morphTargetDictionary).length > Object.keys(mainMesh.morphTargetDictionary).length) {
        mainMesh = obj;
      }
    }
  });

  if (!mainMesh || !mainMesh.morphTargetInfluences) {
    logger.error('UPDATE_MORPHS_IN_PLACE', 'No main mesh found', { serverScanId });
    return;
  }

  // Store current influences for smooth transition
  const currentInfluences = smoothTransition ? [...mainMesh.morphTargetInfluences] : null;

  // Update influences directly
  let updatedCount = 0;
  for (const [shapeName, targetValue] of Object.entries(targetMorphData)) {
    const morphTargetName = morphologyMapping[shapeName];
    if (!morphTargetName) continue;

    const morphIndex = mainMesh.morphTargetDictionary[morphTargetName];
    if (morphIndex === undefined) continue;

    // Direct update - no React, no reinitialization
    mainMesh.morphTargetInfluences[morphIndex] = targetValue;
    updatedCount++;
  }

  // Force geometry update
  if (mainMesh.geometry) {
    mainMesh.geometry.computeBoundingSphere();
    mainMesh.geometry.computeBoundingBox();
  }

  // Mark for re-render
  mainMesh.morphTargetInfluences = [...mainMesh.morphTargetInfluences];

  logger.info('UPDATE_MORPHS_IN_PLACE', '✅ Morphs updated in-place (no reinitialization)', {
    updatedCount,
    totalMorphs: Object.keys(targetMorphData).length,
    meshName: mainMesh.name,
    smoothTransition,
    serverScanId,
    philosophy: 'in_place_morph_update_success'
  });
}

/**
 * Gets current morph values from the mesh without going through React state
 */
export function getCurrentMorphValues(
  model: THREE.Group,
  morphologyMapping: any
): Record<string, number> | null {
  let mainMesh: THREE.SkinnedMesh | null = null;
  model.traverse((obj) => {
    if (obj instanceof THREE.SkinnedMesh && obj.morphTargetDictionary) {
      if (!mainMesh || Object.keys(obj.morphTargetDictionary).length > Object.keys(mainMesh.morphTargetDictionary).length) {
        mainMesh = obj;
      }
    }
  });

  if (!mainMesh || !mainMesh.morphTargetInfluences) {
    return null;
  }

  const currentValues: Record<string, number> = {};

  // Reverse mapping: morphTarget -> shapeName
  const reverseMapping: Record<string, string> = {};
  for (const [shapeName, morphTargetName] of Object.entries(morphologyMapping)) {
    reverseMapping[morphTargetName as string] = shapeName;
  }

  for (const [morphTargetName, morphIndex] of Object.entries(mainMesh.morphTargetDictionary)) {
    const shapeName = reverseMapping[morphTargetName];
    if (shapeName && typeof morphIndex === 'number') {
      currentValues[shapeName] = mainMesh.morphTargetInfluences[morphIndex] || 0;
    }
  }

  return currentValues;
}
