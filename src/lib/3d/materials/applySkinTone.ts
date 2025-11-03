import * as THREE from 'three';
import logger from '../../utils/logger';
import { type SkinToneV2, isSkinToneV2 } from '../../scan/normalizeSkinTone';
import { classifyMaterial, validateMaterialForSkin } from './core/materialIdentifier';
import { calculateSkinProperties, applySkinPropertiesToMaterial } from './core/skinProperties';
import { traverseSceneForMaterials } from './core/sceneTraverser';
import { forceMaterialCompilation, updateAllMaterials } from './core/materialCompiler';
import { upgradeMaterialToPhysical, replaceMaterialOnObject, ensureValidColorProperty } from './core/materialUpgrader';

export interface SkinToneApplicationResult {
  appliedCount: number;
  skippedCount: number;
  errorCount: number;
  success: boolean;
  errorMessage?: string;
  materialsProcessed: number;
  traversalResult?: any;
  skinMaterialsFound: number;
  skinMaterialsModified: number;
  materialsUpgraded: number;
  sssEnabled: number;
}

/**
 * Apply skin tone to all skin materials in the scene
 * MODULARIZED: Uses specialized modules for each aspect of skin tone application
 */
export function applySkinToneToScene(scene: THREE.Scene, tone: SkinToneV2): SkinToneApplicationResult {
  // Input validation
  logger.info('SKIN_TONE_APPLICATION', 'Applying skin tone', {
    rgb: `rgb(${tone.rgb.r}, ${tone.rgb.g}, ${tone.rgb.b})`,
    hex: tone.hex,
    source: tone.source
  });

  // Validate V2 format
  if (!isSkinToneV2(tone)) {
    logger.error('SKIN_TONE_APPLICATION_V2', 'Invalid skin tone format - expected V2', {
      receivedTone: tone,
      philosophy: 'v2_format_validation_failed'
    });
    return {
      appliedCount: 0,
      skippedCount: 0,
      errorCount: 1,
      success: false,
      errorMessage: 'Invalid skin tone format - expected V2',
      materialsProcessed: 0,
      skinMaterialsFound: 0,
      skinMaterialsModified: 0,
      materialsUpgraded: 0,
      sssEnabled: 0
    };
  }

  // Calculate optimal skin properties
  const skinProperties = calculateSkinProperties(tone);

  // Initialize counters
  let appliedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let skinMaterialsFound = 0;
  let materialsUpgraded = 0;
  let sssEnabled = 0;
  let lastError: string | undefined;

  // Traverse scene and process materials
  const traversalResult = traverseSceneForMaterials(scene, (obj, materials) => {
    materials.forEach((material, index) => {
      try {
        // STEP 0: Ensure material has valid color property
        const colorFixed = ensureValidColorProperty(material);
        if (colorFixed) {
          logger.info('SKIN_TONE_APPLICATION_V2', 'Fixed missing color property', {
            materialName: material.name || 'unnamed',
            objectName: obj.name || 'unnamed',
            philosophy: 'color_property_initialization'
          });
        }

        // Log material processing (debug only)
        logger.debug('MATERIAL_PROCESSING', 'Processing material', {
          material: material.name || 'unnamed',
          object: obj.name || 'unnamed',
          type: material.type
        });

        // Classify material first
        const classification = classifyMaterial(material, obj.name || '');
        
        // MODIFIED: Inclure les matériaux faciaux dans la classification
        if (!classification.isSkinMaterial && !classification.isFaceMaterial) {
          logger.debug('SKIN_TONE_APPLICATION_V2', 'Material skipped - not classified as skin or face', {
            materialName: material.name || 'unnamed',
            objectName: obj.name || 'unnamed',
            classification,
            philosophy: 'material_classification_skip'
          });
          skippedCount++;
          return;
        }

        // Found a skin or face material
        skinMaterialsFound++;
        
        // STEP 1: Try to upgrade material to MeshPhysicalMaterial if needed
        let workingMaterial = material;
        const upgradeResult = upgradeMaterialToPhysical(material, material.name || 'unnamed');
        
        if (upgradeResult.upgraded && upgradeResult.reason === 'upgraded_standard_to_physical_with_sss') {
          // The upgrade function returns info but doesn't actually replace the material
          // We need to create the new material and replace it
          const oldMat = material as THREE.MeshStandardMaterial;
          const newMat = new THREE.MeshPhysicalMaterial({
            // Copy all properties from old material
            color: oldMat.color ? oldMat.color.clone() : new THREE.Color(0.8, 0.6, 0.4),
            metalness: oldMat.metalness,
            roughness: oldMat.roughness,
            map: oldMat.map,
            normalMap: oldMat.normalMap,
            roughnessMap: oldMat.roughnessMap,
            metalnessMap: oldMat.metalnessMap,
            emissiveMap: oldMat.emissiveMap,
            emissive: oldMat.emissive,
            emissiveIntensity: oldMat.emissiveIntensity,
            transparent: oldMat.transparent,
            opacity: oldMat.opacity,
            alphaTest: oldMat.alphaTest,
            side: oldMat.side,
            // SSS properties
            transmission: 0.2,
            thickness: 0.3,
            ior: 1.35,
            attenuationDistance: 0.5,
            attenuationColor: new THREE.Color(0.8, 0.4, 0.2),
            sheen: 0.25,
            sheenRoughness: 0.4,
            clearcoat: 0.15,
            clearcoatRoughness: 0.4,
            specularIntensity: 0.8,
            iridescence: 0.05,
            iridescenceIOR: 1.3,
          });
          
          newMat.name = oldMat.name;
          newMat.userData = { ...oldMat.userData };
          
          // Replace material on object
          const replaced = replaceMaterialOnObject(obj, material, newMat);
          if (replaced) {
            workingMaterial = newMat;
            materialsUpgraded++;
            sssEnabled++;
            
            // Dispose old material
            material.dispose();
            
            logger.info('MATERIAL_UPGRADER', 'Successfully upgraded and replaced material', {
              materialName: newMat.name || 'unnamed',
              objectName: obj.name || 'unnamed',
              upgradeResult,
              philosophy: 'material_upgrade_and_replacement_success'
            });
          } else {
            logger.error('MATERIAL_UPGRADER', 'Failed to replace upgraded material on object', {
              materialName: material.name || 'unnamed',
              objectName: obj.name || 'unnamed',
              philosophy: 'material_replacement_failure'
            });
            errorCount++;
            return;
          }
        } else if (upgradeResult.sssEnabled) {
          // Material was already physical, just SSS was enabled
          sssEnabled++;
        }

        // Validate material
        const validation = validateMaterialForSkin(workingMaterial);
        if (!validation.isValid) {
          logger.debug('MATERIAL_VALIDATION_FAILED', 'Material validation failed', {
            material: workingMaterial.name || 'unnamed',
            issues: validation.issues.join(', ')
          });
          skippedCount++;
          return;
        }

        // Log skin material found
        logger.info('SKIN_MATERIAL_FOUND', 'Processing skin material', {
          material: workingMaterial.name || 'unnamed',
          type: workingMaterial.type,
          upgraded: upgradeResult.upgraded
        });

        // Apply skin properties
        const success = applySkinPropertiesToMaterial(
          workingMaterial,
          skinProperties,
          workingMaterial.name || 'unnamed'
        );

        if (success) {
          appliedCount++;
          
          // Force material compilation
          forceMaterialCompilation(scene, workingMaterial.name || 'unnamed');
          
          // Success log with essential info only
          logger.info('SKIN_APPLIED', 'Skin tone applied successfully', {
            material: workingMaterial.name || 'unnamed',
            finalColor: 'color' in workingMaterial && (workingMaterial as any).color ?
              '#' + (workingMaterial as any).color.getHexString() : 'none',
            upgraded: upgradeResult.upgraded,
            sssEnabled: upgradeResult.sssEnabled
          });
        } else {
          errorCount++;
          lastError = `Failed to apply properties to material ${workingMaterial.name}`;
          logger.error('SKIN_APPLICATION_FAILED', 'Failed to apply skin properties', {
            material: workingMaterial.name || 'unnamed',
            type: workingMaterial.type
          });
        }

      } catch (materialError) {
        errorCount++;
        lastError = materialError instanceof Error ? materialError.message : 'Unknown material error';
        logger.error('MATERIAL_PROCESSING_ERROR', 'Material processing exception', {
          material: material.name || 'unnamed',
          error: lastError
        });
      }
    });
  });

  // Update all materials to ensure changes are rendered
  updateAllMaterials(scene);

  const success = appliedCount > 0 && errorCount === 0;

  // Final summary log
  logger.info('SKIN_APPLICATION_COMPLETE', 'Skin tone application complete', {
    applied: appliedCount,
    skipped: skippedCount,
    errors: errorCount,
    success,
    skinTone: `${tone.hex}`
  });

  // Log critical failure
  if (appliedCount === 0) {
    logger.error('SKIN_APPLICATION_FAILED', 'No skin materials updated', {
      totalMaterials: traversalResult.totalMaterials,
      skinMaterialsFound
    });
  }
  
  return {
    appliedCount,
    skippedCount,
    errorCount,
    success,
    errorMessage: lastError,
    materialsProcessed: traversalResult.totalMaterials,
    traversalResult,
    skinMaterialsFound,
    skinMaterialsModified: appliedCount,
    materialsUpgraded,
    sssEnabled
  };
}

