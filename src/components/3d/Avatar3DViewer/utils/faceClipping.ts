/**
 * Face Clipping Utilities
 * Handles clipping logic to show only head and neck in face-only mode
 */

import * as THREE from 'three';
import logger from '../../../../lib/utils/logger';
import { DEBUG_FLAGS } from '../../../../config/debugFlags';

interface ClippingResult {
  mainMeshFound: boolean;
  skinnedMeshFound: boolean;
  clippedMeshes: number;
  totalMeshes: number;
  threshold: number;
}

/**
 * Find the neck bone to determine accurate clipping position
 */
function findNeckBone(model: THREE.Group): { neckBoneY: number; found: boolean } {
  let neckBoneY = 1.2; // Default fallback
  let found = false;

  model.traverse((obj: THREE.Object3D) => {
    if (obj.type === 'Bone' && !found) {
      const boneName = obj.name.toLowerCase();

      if (boneName.includes('neck') && !boneName.includes('twist') && !boneName.includes('ref')) {
        obj.updateMatrixWorld(true);
        const worldPosition = new THREE.Vector3();
        obj.getWorldPosition(worldPosition);
        neckBoneY = worldPosition.y - 0.15;
        found = true;

        logger.info('FACE_CLIPPING', 'Found neck bone for clipping reference', {
          boneName: obj.name,
          neckBoneY: neckBoneY.toFixed(3),
          worldPosition: worldPosition.toArray(),
          philosophy: 'neck_bone_reference'
        });
      }
    }
  });

  return { neckBoneY, found };
}

/**
 * Find the main skinned mesh with morph targets
 */
function findMainSkinnedMesh(model: THREE.Group): THREE.SkinnedMesh | null {
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

  return mainSkinnedMesh;
}

/**
 * Apply clipping plane to a mesh material
 */
function applyClippingPlaneToMesh(
  mesh: THREE.Mesh | THREE.SkinnedMesh,
  threshold: number
): void {
  if (!mesh.material) return;

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  materials.forEach(mat => {
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -threshold);
    mat.clippingPlanes = [clippingPlane];
    mat.clipShadows = true;
    mat.needsUpdate = true;
  });

  logger.info('FACE_CLIPPING', 'Applied clipping plane to material', {
    meshName: mesh.name,
    materialCount: materials.length,
    philosophy: 'material_clipping_plane'
  });
}

/**
 * Process mesh visibility and clipping based on threshold
 */
function processMeshClipping(
  mesh: THREE.Mesh | THREE.SkinnedMesh,
  mainSkinnedMesh: THREE.SkinnedMesh | null,
  threshold: number
): { isVisible: boolean; isClipped: boolean } {
  const isMainMesh = mesh === mainSkinnedMesh;

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
    threshold
  });

  if (isMainMesh || maxY >= threshold) {
    mesh.visible = true;
    applyClippingPlaneToMesh(mesh, threshold);

    logger.info('FACE_CLIPPING', 'Keeping mesh visible', {
      meshName: mesh.name,
      reason: isMainMesh ? 'main_skinned_mesh_with_morphs' : 'contains_head',
      maxY: maxY.toFixed(3),
      threshold,
      philosophy: 'preserve_mesh'
    });

    return { isVisible: true, isClipped: true };
  } else {
    mesh.visible = false;

    logger.debug('FACE_CLIPPING', 'Hiding mesh (entirely below threshold)', {
      meshName: mesh.name,
      maxY: maxY.toFixed(3),
      threshold
    });

    return { isVisible: false, isClipped: false };
  }
}

/**
 * Apply face-only clipping to hide body parts below shoulders
 * Uses a clipping plane to hide the body while keeping the head and neck visible
 */
export function applyFaceOnlyClipping(model: THREE.Group): ClippingResult {
  if (DEBUG_FLAGS.DISABLE_FACE_CLIPPING) {
    logger.warn('FACE_CLIPPING', 'Face clipping DISABLED by debug flag', {
      philosophy: 'debug_clipping_disabled'
    });
    return { mainMeshFound: false, skinnedMeshFound: false, clippedMeshes: 0, totalMeshes: 0, threshold: 0 };
  }

  if (DEBUG_FLAGS.SHOW_FULL_BODY_IN_FACE_MODE) {
    logger.warn('FACE_CLIPPING', 'Showing full body in face mode (debug flag)', {
      philosophy: 'debug_full_body_visible'
    });
    return { mainMeshFound: false, skinnedMeshFound: false, clippedMeshes: 0, totalMeshes: 0, threshold: 0 };
  }

  model.updateMatrixWorld(true);

  const { neckBoneY, found: foundNeckBone } = findNeckBone(model);
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

  const mainSkinnedMesh = findMainSkinnedMesh(model);

  model.traverse((obj: THREE.Object3D) => {
    if (obj.type === 'Mesh' || obj.type === 'SkinnedMesh') {
      totalMeshes++;
      const mesh = obj as THREE.Mesh | THREE.SkinnedMesh;
      const isMainMesh = mesh === mainSkinnedMesh;

      const { isVisible, isClipped } = processMeshClipping(mesh, mainSkinnedMesh, CLIP_Y_THRESHOLD);

      if (isVisible) {
        mainMeshFound = true;
        if (isMainMesh) skinnedMeshFound = true;
      }

      if (isClipped) {
        clippedMeshes++;
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

  return {
    mainMeshFound,
    skinnedMeshFound,
    clippedMeshes,
    totalMeshes,
    threshold: CLIP_Y_THRESHOLD
  };
}

/**
 * Force main mesh visibility (debug mode)
 */
export function forceMainMeshVisible(model: THREE.Group, serverScanId?: string): boolean {
  if (!DEBUG_FLAGS.FORCE_MESH_VISIBLE) {
    return false;
  }

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

  return mainMeshFound;
}
