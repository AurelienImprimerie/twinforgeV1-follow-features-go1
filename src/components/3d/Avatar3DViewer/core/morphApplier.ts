import * as THREE from 'three';
import { applyMorphTargetsToMesh } from '../../../../lib/3d/morph/application/morphTargetApplier';
import { applyLimbMassToBones } from '../../../../lib/3d/bones/applyLimbMassToBones';
import logger from '../../../../lib/utils/logger';

/**
 * Apply morph data to a 3D model
 */
export async function applyMorphDataToModel(options: {
  model: THREE.Group;
  morphData?: Record<string, number>;
  faceMorphData?: Record<string, number>;
  limbMasses?: Record<string, number>;
  serverScanId?: string;
  gender?: string;
  morphologyMapping?: any;
}): Promise<void> {
  const { model, morphData, faceMorphData, limbMasses, serverScanId, gender, morphologyMapping } = options;
  
  // Find main mesh for detailed logging
  let mainMesh: THREE.SkinnedMesh | null = null;
  model.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
      if (!mainMesh || 
          Object.keys(child.morphTargetDictionary).length > Object.keys(mainMesh.morphTargetDictionary || {}).length) {
        mainMesh = child;
      }
    }
  });

  logger.info('MORPH_APPLIER', 'Main mesh verification before morph application', {
    mainMeshFound: !!mainMesh,
    mainMeshName: mainMesh?.name || 'none',
    hasMorphTargetDictionary: !!mainMesh?.morphTargetDictionary,
    morphTargetDictionarySize: mainMesh?.morphTargetDictionary ? Object.keys(mainMesh.morphTargetDictionary).length : 0,
    hasMorphTargetInfluences: !!mainMesh?.morphTargetInfluences,
    morphTargetInfluencesLength: mainMesh?.morphTargetInfluences?.length || 0,
    serverScanId
  });

  // Early return if no main mesh found
  if (!mainMesh) {
    logger.error('MORPH_APPLIER', 'No main mesh found with morph target data', { serverScanId });
    return;
  }

  // Apply morph targets
  if (morphData && Object.keys(morphData).length > 0) {
    logger.info('MORPH_APPLIER', 'Starting morph data application', {
      morphDataKeys: Object.keys(morphData),
      morphDataEntries: Object.entries(morphData).map(([key, value]) => ({ key, value })),
      serverScanId
    });
    
    await applyMorphTargetsToMesh(mainMesh, morphData, gender, morphologyMapping);
  }
  
  // Apply face morph targets if provided
  if (faceMorphData && Object.keys(faceMorphData).length > 0) {
    logger.info('MORPH_APPLIER', 'Starting face morph data application', {
      faceMorphDataKeys: Object.keys(faceMorphData),
      faceMorphDataEntries: Object.entries(faceMorphData).map(([key, value]) => ({ key, value })),
      serverScanId
    });
    
    await applyMorphTargetsToMesh(mainMesh, faceMorphData, gender, morphologyMapping);
  }
  
  // Log final state after morph application
  if (mainMesh) {
    logger.info('MORPH_APPLIER', 'Final morph target influences after application', {
      morphTargetInfluencesLength: mainMesh.morphTargetInfluences?.length || 0,
      morphTargetInfluencesValues: mainMesh.morphTargetInfluences ? mainMesh.morphTargetInfluences.slice(0, 20) : [],
      nonZeroInfluences: mainMesh.morphTargetInfluences ? 
        mainMesh.morphTargetInfluences.map((value, index) => ({ index, value })).filter(item => item.value !== 0) : [],
      serverScanId
    });
  }

  logger.info('MORPH_APPLIER', 'Morph application completed', { serverScanId });
  
  // Apply limb masses to bones
  if (limbMasses && Object.keys(limbMasses).length > 0) {
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
    
    applyLimbMassToBones(model, massesForBones, {}, {
      lengthAxis: 'y',
      log: true
    });
  }
}