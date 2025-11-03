/**
 * Unified Material System
 * Single source of truth for all material configuration
 * Replaces the fragmented applySkinTone + materialConfigurator system
 */

import * as THREE from 'three';
import logger from '../../utils/logger';
import { type SkinToneV2, isSkinToneV2 } from '../../scan/normalizeSkinTone';
import { classifyMaterial, validateMaterialForSkin } from './core/materialIdentifier';
import { calculateSkinProperties } from './core/skinProperties';
import { traverseSceneForMaterials } from './core/sceneTraverser';
import { upgradeMaterialToPhysical, replaceMaterialOnObject } from './core/materialUpgrader';
import {
  generateProceduralSkinTextures,
  applyProceduralTexturesToMaterial,
  type ProceduralSkinConfig
} from './proceduralSkinTexture';
import {
  calculateMultiLayerSkinConfig,
  applyMultiLayerSkinToMaterial
} from './multiLayerSkinModel';
import { applyEnvironmentToMaterials, calculateEnvMapIntensity } from '../setup/environmentSetup';

export interface UnifiedMaterialConfig {
  scene: THREE.Scene;
  skinTone: SkinToneV2;
  enableProceduralTextures?: boolean;
  proceduralConfig?: Partial<ProceduralSkinConfig>;
  useMultiLayerModel?: boolean; // ENHANCED: Use professional 3-layer skin model
  serverScanId?: string;
}

export interface UnifiedMaterialResult {
  success: boolean;
  materialsProcessed: number;
  materialsUpgraded: number;
  skinMaterialsModified: number;
  proceduralTexturesApplied: number;
  error?: string;
}

/**
 * UNIFIED material configuration - single entry point
 * Replaces all fragmented material configuration systems
 */
export async function configureSceneMaterials(
  config: UnifiedMaterialConfig
): Promise<UnifiedMaterialResult> {
  const {
    scene,
    skinTone,
    enableProceduralTextures = true,
    proceduralConfig = {},
    useMultiLayerModel = true, // ENHANCED: Enable by default
    serverScanId
  } = config;

  logger.info('UNIFIED_MATERIAL_SYSTEM', 'Starting unified material configuration', {
    serverScanId,
    skinToneHex: skinTone.hex,
    skinToneRGB: `rgb(${skinTone.rgb.r}, ${skinTone.rgb.g}, ${skinTone.rgb.b})`,
    enableProceduralTextures,
    proceduralDetailLevel: proceduralConfig.detailLevel || 'high',
    philosophy: 'unified_single_source_of_truth'
  });

  // Validate inputs
  if (!isSkinToneV2(skinTone)) {
    logger.error('UNIFIED_MATERIAL_SYSTEM', 'Invalid skin tone format', {
      skinTone,
      philosophy: 'unified_validation_failed'
    });
    return {
      success: false,
      materialsProcessed: 0,
      materialsUpgraded: 0,
      skinMaterialsModified: 0,
      proceduralTexturesApplied: 0,
      error: 'Invalid skin tone format - expected V2'
    };
  }

  // ENHANCED: Calculate multi-layer skin configuration for professional rendering
  const multiLayerConfig = useMultiLayerModel ? calculateMultiLayerSkinConfig(skinTone) : null;

  // Calculate optimal skin properties once (fallback if multi-layer disabled)
  const skinProperties = calculateSkinProperties(skinTone);

  // Calculate environment map intensity based on skin tone
  const luminance = skinTone.linear_f32.r * 0.299 + skinTone.linear_f32.g * 0.587 + skinTone.linear_f32.b * 0.114;
  const envMapIntensity = calculateEnvMapIntensity(luminance);

  // Apply environment map to all materials
  if (scene.environment) {
    applyEnvironmentToMaterials(scene, scene.environment, envMapIntensity);
  }

  // Generate procedural textures once (if enabled)
  let proceduralTextures: ReturnType<typeof generateProceduralSkinTextures> | null = null;
  if (enableProceduralTextures) {
    try {
      proceduralTextures = generateProceduralSkinTextures({
        skinTone,
        detailLevel: proceduralConfig.detailLevel || 'high',
        poreIntensity: proceduralConfig.poreIntensity ?? 0.6,
        colorVariation: proceduralConfig.colorVariation ?? 0.3,
        imperfectionIntensity: proceduralConfig.imperfectionIntensity ?? 0.2,
        resolution: proceduralConfig.resolution
      });

      logger.info('UNIFIED_MATERIAL_SYSTEM', 'Procedural textures generated', {
        detailLevel: proceduralConfig.detailLevel || 'high',
        philosophy: 'ultra_realistic_textures_ready'
      });
    } catch (error) {
      logger.error('UNIFIED_MATERIAL_SYSTEM', 'Failed to generate procedural textures', {
        error: error instanceof Error ? error.message : 'Unknown error',
        philosophy: 'procedural_generation_failed'
      });
      // Continue without procedural textures
    }
  }

  // Track statistics
  let materialsProcessed = 0;
  let materialsUpgraded = 0;
  let skinMaterialsModified = 0;
  let proceduralTexturesApplied = 0;
  let errorCount = 0;

  // Traverse scene and configure materials (single pass)
  const traversalResult = traverseSceneForMaterials(scene, (obj, materials) => {
    materials.forEach((material, index) => {
      try {
        materialsProcessed++;

        // Classify material
        const classification = classifyMaterial(material, obj.name || '');

        if (!classification.isSkinMaterial && !classification.isFaceMaterial) {
          return; // Skip non-skin materials
        }

        // Upgrade to MeshPhysicalMaterial if needed
        let workingMaterial = material;
        if (!(material instanceof THREE.MeshPhysicalMaterial)) {
          const upgraded = upgradeMaterialToPhysicalMaterial(material, obj);
          if (upgraded) {
            workingMaterial = upgraded;
            materialsUpgraded++;
          } else {
            logger.warn('UNIFIED_MATERIAL_SYSTEM', 'Failed to upgrade material', {
              materialName: material.name || 'unnamed',
              objectName: obj.name || 'unnamed'
            });
            return;
          }
        }

        // Validate material
        const validation = validateMaterialForSkin(workingMaterial);
        if (!validation.isValid) {
          logger.warn('UNIFIED_MATERIAL_SYSTEM', 'Material validation failed', {
            materialName: workingMaterial.name || 'unnamed',
            issues: validation.issues
          });
          return;
        }

        // ENHANCED: Apply multi-layer skin model if enabled, otherwise use standard properties
        const success = multiLayerConfig
          ? (applyMultiLayerSkinToMaterial(
              workingMaterial as THREE.MeshPhysicalMaterial,
              multiLayerConfig,
              workingMaterial.name || 'unnamed'
            ), true)
          : applyUnifiedSkinProperties(
              workingMaterial as THREE.MeshPhysicalMaterial,
              skinProperties,
              skinTone
            );

        if (success) {
          skinMaterialsModified++;

          // Apply procedural textures if available
          if (proceduralTextures && workingMaterial instanceof THREE.MeshPhysicalMaterial) {
            applyProceduralTexturesToMaterial(
              workingMaterial,
              proceduralTextures
            );
            proceduralTexturesApplied++;
          }

          logger.debug('UNIFIED_MATERIAL_SYSTEM', 'Material configured successfully', {
            materialName: workingMaterial.name || 'unnamed',
            objectName: obj.name || 'unnamed',
            proceduralApplied: !!proceduralTextures
          });
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        logger.error('UNIFIED_MATERIAL_SYSTEM', 'Error configuring material', {
          materialName: material.name || 'unnamed',
          objectName: obj.name || 'unnamed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  });

  // CRITICAL: Final color verification pass
  // Traverse scene one more time to verify all skin materials have correct color
  let colorVerificationIssues = 0;
  scene.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.Mesh && obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => {
        // Check if this is a skin material
        const classification = classifyMaterial(mat, obj.name || '');
        if (classification.isSkinMaterial || classification.isFaceMaterial) {
          // Verify color matches expected skin tone
          const currentColor = (mat as any).color;
          if (currentColor && currentColor instanceof THREE.Color) {
            const currentHex = '#' + currentColor.getHexString();
            const expectedR = skinTone.linear_f32.r;
            const expectedG = skinTone.linear_f32.g;
            const expectedB = skinTone.linear_f32.b;

            const colorDelta = Math.abs(currentColor.r - expectedR) +
                              Math.abs(currentColor.g - expectedG) +
                              Math.abs(currentColor.b - expectedB);

            if (colorDelta > 0.01) {
              colorVerificationIssues++;
              logger.warn('UNIFIED_MATERIAL_SYSTEM', '🚨 Final verification: Color mismatch detected, correcting', {
                materialName: mat.name || 'unnamed',
                objectName: obj.name || 'unnamed',
                currentColor: currentHex,
                expectedColor: skinTone.hex,
                colorDelta: colorDelta.toFixed(6),
                philosophy: 'final_color_verification_correction'
              });

              // FORCE correct color
              currentColor.setRGB(expectedR, expectedG, expectedB);
            }
          }
        }
        mat.needsUpdate = true;
      });
    }
  });

  if (colorVerificationIssues > 0) {
    logger.warn('UNIFIED_MATERIAL_SYSTEM', `⚠️ Corrected ${colorVerificationIssues} color mismatches in final verification`, {
      issuesFound: colorVerificationIssues,
      correctedTo: skinTone.hex,
      philosophy: 'final_color_enforcement'
    });
  }

  const success = skinMaterialsModified > 0 && errorCount === 0;

  logger.info('UNIFIED_MATERIAL_SYSTEM', 'Unified material configuration completed', {
    success,
    materialsProcessed,
    materialsUpgraded,
    skinMaterialsModified,
    proceduralTexturesApplied,
    errorCount,
    totalObjects: traversalResult.totalObjects,
    philosophy: 'unified_single_source_complete'
  });

  return {
    success,
    materialsProcessed,
    materialsUpgraded,
    skinMaterialsModified,
    proceduralTexturesApplied,
    error: errorCount > 0 ? `${errorCount} materials failed to configure` : undefined
  };
}

/**
 * Apply unified skin properties to material
 * Combines color, PBR, and SSS in a single operation
 */
function applyUnifiedSkinProperties(
  material: THREE.MeshPhysicalMaterial,
  skinProperties: ReturnType<typeof calculateSkinProperties>,
  skinTone: SkinToneV2
): boolean {
  try {
    // Base color (linear space for Three.js)
    material.color.setRGB(
      skinProperties.baseColor.r,
      skinProperties.baseColor.g,
      skinProperties.baseColor.b
    );

    // PBR properties
    material.metalness = skinProperties.metalness;
    material.roughness = skinProperties.roughness;

    // Subsurface Scattering (SSS)
    material.transmission = skinProperties.transmission;
    material.thickness = skinProperties.thickness;
    material.ior = skinProperties.ior;
    material.attenuationDistance = skinProperties.attenuationDistance;
    material.attenuationColor = new THREE.Color(
      skinProperties.attenuationColor.r,
      skinProperties.attenuationColor.g,
      skinProperties.attenuationColor.b
    );

    // Surface properties
    material.sheen = skinProperties.sheen;
    material.sheenRoughness = skinProperties.sheenRoughness;
    material.clearcoat = skinProperties.clearcoat;
    material.clearcoatRoughness = skinProperties.clearcoatRoughness;
    material.specularIntensity = skinProperties.specularIntensity;
    material.iridescence = skinProperties.iridescence;
    material.iridescenceIOR = skinProperties.iridescenceIOR;

    // Sheen color matching skin tone
    if (material.sheenColor) {
      const sheenR = Math.min(1.0, skinProperties.baseColor.r * 1.05);
      const sheenG = Math.min(1.0, skinProperties.baseColor.g * 1.02);
      const sheenB = Math.min(1.0, skinProperties.baseColor.b * 0.98);
      material.sheenColor.setRGB(sheenR, sheenG, sheenB);
    }

    material.needsUpdate = true;

    return true;
  } catch (error) {
    logger.error('UNIFIED_MATERIAL_SYSTEM', 'Failed to apply skin properties', {
      materialName: material.name || 'unnamed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

/**
 * Upgrade material to MeshPhysicalMaterial and replace on object
 */
function upgradeMaterialToPhysicalMaterial(
  oldMaterial: THREE.Material,
  obj: THREE.Object3D
): THREE.MeshPhysicalMaterial | null {
  try {
    if (!(oldMaterial instanceof THREE.MeshStandardMaterial)) {
      return null;
    }

    const oldMat = oldMaterial as THREE.MeshStandardMaterial;
    const newMat = new THREE.MeshPhysicalMaterial({
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
      // SSS defaults
      transmission: 0.2,
      thickness: 0.3,
      ior: 1.35,
      attenuationDistance: 0.5,
      attenuationColor: new THREE.Color(0.8, 0.4, 0.2)
    });

    newMat.name = oldMat.name;
    newMat.userData = { ...oldMat.userData };

    const replaced = replaceMaterialOnObject(obj, oldMaterial, newMat);
    if (replaced) {
      oldMaterial.dispose();
      return newMat;
    }

    return null;
  } catch (error) {
    logger.error('UNIFIED_MATERIAL_SYSTEM', 'Material upgrade failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}
