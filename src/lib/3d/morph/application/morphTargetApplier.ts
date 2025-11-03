import * as THREE from 'three';
import { 
  DIRECT_BLENDER_SHAPE_KEY_MAPPING,
  LIMB_MASS_TO_BLENDER_MAPPING,
  getBlenderShapeKey 
} from '../morphTypes';
import { isValidDBKey, isKeyBannedForGender, isValidFaceMorphKey } from '../../../morph/keys/keyValidators'; // MODIFIED: Import isValidFaceMorphKey
import type { MorphologyMappingData } from '../../../../hooks/useMorphologyMapping';
import logger from '../../../../lib/utils/logger';
import { toDbGender } from '../../../morph/keys/keyNormalizers';

/**
 * PHASE A.6: Apply morph targets to mesh with strict DB allowlisting
 * Only applies morphs that are valid and non-banned for the specific gender
 */
export async function applyMorphTargetsToMesh(
  mainMesh: THREE.SkinnedMesh,
  morphData: Record<string, number>,
  gender: 'male' | 'female',
  morphologyMapping?: MorphologyMappingData,
  minMaxBounds?: Record<string, { min: number; max: number }>,
  faceMorphData?: Record<string, number> // NOUVEAU: Ajouter faceMorphData
): Promise<void> {
  if (!morphData && !faceMorphData) { // MODIFIED: Vérifier les deux types de morphs
    logger.warn('MORPH_TARGET_APPLIER', 'PHASE A.6: No morph data provided', { 
      gender,
      philosophy: 'phase_a_no_data'
    });
    return;
  }

  // Validate mesh has morph target data
  if (!mainMesh.morphTargetDictionary || !mainMesh.morphTargetInfluences) {
    logger.error('MORPH_TARGET_APPLIER', 'PHASE A.6: Mesh missing morph target data', {
      hasDictionary: !!mainMesh.morphTargetDictionary,
      hasInfluences: !!mainMesh.morphTargetInfluences,
      philosophy: 'phase_a_mesh_validation'
    });
    return;
  }

  // CRITICAL FIX: Ensure morphologyMapping is valid before proceeding
  if (!morphologyMapping || !morphologyMapping.mapping_masculine || !morphologyMapping.mapping_feminine) {
    logger.error('MORPH_TARGET_APPLIER', 'PHASE A.6: Invalid morphologyMapping provided', {
      hasMapping: !!morphologyMapping,
      hasMasculine: !!morphologyMapping?.mapping_masculine,
      hasFeminine: !!morphologyMapping?.mapping_feminine,
      philosophy: 'phase_a_invalid_morphology_mapping_guard'
    });
    return; // Exit early if mapping is invalid
  }

  const morphTargetDictionary = mainMesh.morphTargetDictionary;
  const morphTargetInfluences = mainMesh.morphTargetInfluences;

  let appliedCount = 0;
  let skippedCount = 0;
  let bannedCount = 0;
  let invalidCount = 0;

  // MODIFIED: Fusionner les morphs corporels et faciaux, en donnant priorité aux faciaux
  const combinedMorphData = { ...morphData, ...faceMorphData };

  // DIAGNOSTIC: Log face vs body morph differences
  const faceOnlyKeys = faceMorphData ? Object.keys(faceMorphData).filter(k => !morphData || !(k in morphData)) : [];
  const overriddenKeys = faceMorphData ? Object.keys(faceMorphData).filter(k => morphData && k in morphData) : [];

  logger.info('MORPH_TARGET_APPLIER', 'Starting morph application', {
    totalMorphs: Object.keys(combinedMorphData).length,
    bodyMorphsCount: morphData ? Object.keys(morphData).length : 0,
    faceMorphsCount: faceMorphData ? Object.keys(faceMorphData).length : 0,
    faceOnlyKeys: faceOnlyKeys.length,
    overriddenKeys: overriddenKeys.length,
    gender,
    sampleKeys: Object.keys(combinedMorphData).slice(0, 10),
    sampleFaceMorphs: faceMorphData ? Object.entries(faceMorphData).slice(0, 5).map(([k, v]) => ({ key: k, value: v.toFixed(3) })) : [],
    allFaceMorphKeys: faceMorphData ? Object.keys(faceMorphData) : [],
    meshHasMorphTargets: !!mainMesh.morphTargetDictionary,
    morphTargetDictionarySize: Object.keys(mainMesh.morphTargetDictionary || {}).length,
    philosophy: 'morph_application_start_with_face_priority'
  });

  // Track skipped face morphs for detailed logging
  const skippedFaceMorphs: Array<{key: string; reason: string}> = [];

  // PHASE A.6: Apply each morph parameter with strict DB validation
  Object.entries(combinedMorphData).forEach(([morphKey, value]) => { // MODIFIED: Itérer sur les morphs combinés
    const isFaceMorph = faceMorphData && morphKey in faceMorphData;

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      invalidCount++;
      skippedCount++;
      if (isFaceMorph) skippedFaceMorphs.push({key: morphKey, reason: 'invalid_number'});
      return;
    }

    // Validate key against DB mapping (checks both morph_values and face_values)
    if (!isValidDBKey(morphKey, gender, morphologyMapping)) {
      invalidCount++;
      skippedCount++;
      if (isFaceMorph) skippedFaceMorphs.push({key: morphKey, reason: 'not_in_db_mapping'});
      return;
    }

    // Check if key is banned for this gender
    if (morphologyMapping && isKeyBannedForGender(morphKey, gender, morphologyMapping)) {
      bannedCount++;
      // Still apply to mesh but force value to 0
      const blenderKey = getBlenderShapeKey(morphKey);
      if (blenderKey && blenderKey in morphTargetDictionary) {
        const targetIndex = morphTargetDictionary[blenderKey];
        morphTargetInfluences[targetIndex] = 0;
        appliedCount++;
      }
      if (isFaceMorph) skippedFaceMorphs.push({key: morphKey, reason: 'banned_for_gender'});
      return;
    }

    // Get Blender shape key
    const blenderKey = getBlenderShapeKey(morphKey); // Use the utility function to get the Blender key

    if (blenderKey && blenderKey in morphTargetDictionary) {
      const targetIndex = morphTargetDictionary[blenderKey];
      const previousValue = morphTargetInfluences[targetIndex];

      // Apply value with DB range validation
      let finalValue = value;

      // Apply DB range clamping if mapping available
      if (morphologyMapping) {
        const genderMapping = toDbGender(gender) === 'masculine' ?
          morphologyMapping.mapping_masculine :
          morphologyMapping.mapping_feminine;

        // Check both morph_values and face_values for range
        let range = genderMapping.morph_values[morphKey];
        if (!range) {
          range = genderMapping.face_values[morphKey];
        }

        if (range) {
          finalValue = Math.max(range.min, Math.min(range.max, value));
        }
      }

      morphTargetInfluences[targetIndex] = finalValue;
      appliedCount++;
    } else {
      skippedCount++;
      if (isFaceMorph) skippedFaceMorphs.push({key: morphKey, reason: 'blender_key_not_found_in_mesh'});
    }
  });

  // DIAGNOSTIC: Log skipped face morphs if any
  if (skippedFaceMorphs.length > 0) {
    logger.warn('MORPH_TARGET_APPLIER', 'Some face morphs were skipped during application', {
      skippedCount: skippedFaceMorphs.length,
      skippedMorphs: skippedFaceMorphs,
      philosophy: 'face_morph_skipped_diagnostic'
    });
  }

  // Force mesh updates and ensure visibility
  if (appliedCount > 0) {
    if (mainMesh.geometry) {
      mainMesh.geometry.attributes.position.needsUpdate = true;
      if (mainMesh.geometry.attributes.normal) {
        mainMesh.geometry.attributes.normal.needsUpdate = true;
      }
      mainMesh.geometry.computeBoundingBox();
      mainMesh.geometry.computeBoundingSphere();
    }

    if (mainMesh.material) {
      const materials = Array.isArray(mainMesh.material) ? mainMesh.material : [mainMesh.material];
      materials.forEach(mat => {
        mat.needsUpdate = true;
      });
    }

    mainMesh.updateMatrix();
    mainMesh.updateMatrixWorld(true);

    // CRITICAL: Ensure mesh is visible and morphTargetInfluences are applied
    if (!mainMesh.visible) {
      mainMesh.visible = true;
      logger.warn('MORPH_TARGET_APPLIER', 'Mesh was hidden, forcing visible', {
        meshName: mainMesh.name,
        philosophy: 'force_mesh_visible'
      });
    }

    // Force render update by marking mesh for update
    mainMesh.userData.needsUpdate = true;

    logger.info('MORPH_TARGET_APPLIER', 'Mesh forced to update after morph application', {
      meshName: mainMesh.name,
      meshVisible: mainMesh.visible,
      geometryUpdated: true,
      materialUpdated: true,
      philosophy: 'force_mesh_update_complete'
    });
  }

  // Count face morphs that were actually applied
  const faceKeysApplied = faceMorphData ? Object.keys(faceMorphData).filter(k => {
    const blenderKey = getBlenderShapeKey(k);
    return blenderKey && blenderKey in morphTargetDictionary;
  }).length : 0;

  logger.info('MORPH_TARGET_APPLIER', 'Morph application completed', {
    applied: appliedCount,
    skipped: skippedCount,
    banned: bannedCount,
    invalid: invalidCount,
    totalProcessed: Object.keys(combinedMorphData).length,
    faceKeysApplied: faceKeysApplied,
    faceKeysTotal: faceMorphData ? Object.keys(faceMorphData).length : 0,
    faceApplicationRate: faceMorphData ? `${((faceKeysApplied / Object.keys(faceMorphData).length) * 100).toFixed(1)}%` : 'N/A',
    philosophy: 'morph_application_complete_with_face_tracking'
  });
}

/**
 * PHASE A.6: Set bone thickness using configuration-driven approach
 */
function setBoneThickness(
  bone: THREE.Bone, 
  scaleFactor: number, 
  lengthAxis: 'x'|'y'|'z' = 'y',
  config: any
) {
  // Apply axis-specific scaling (preserve length axis)
  const sx = lengthAxis === 'x' ? 1 : scaleFactor;
  const sy = lengthAxis === 'y' ? 1 : scaleFactor;
  const sz = lengthAxis === 'z' ? 1 : scaleFactor;
  
  bone.scale.set(sx, sy, sz);
  bone.updateMatrixWorld(true);
}