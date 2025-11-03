/**
 * Mobile-Optimized Material System
 * Simplification des matériaux pour améliorer les performances mobiles
 */

import * as THREE from 'three';
import logger from '../../utils/logger';
import type { PerformanceLevel } from '../performance/mobileDetection';

/**
 * Crée un matériau haute qualité pour mobiles hauts de gamme
 * Utilise MeshStandardMaterial avec meilleurs paramètres
 */
export function createHighEndMobileMaterial(
  skinToneRGB: { r: number; g: number; b: number }
): THREE.MeshStandardMaterial {
  const color = new THREE.Color(
    skinToneRGB.r / 255,
    skinToneRGB.g / 255,
    skinToneRGB.b / 255
  );

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.0, // Pas de métal pour la peau
    roughness: 0.5, // NOUVEAU: Plus lisse pour meilleur rendu
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
    envMapIntensity: 0.6, // NOUVEAU: Réflexions environnement plus fortes
    side: THREE.FrontSide
  });

  // Désactiver les maps avancées pour performance
  material.normalMap = null;
  material.bumpMap = null;
  material.displacementMap = null;

  logger.info('MOBILE_MATERIALS', 'Created high-end mobile material (Standard enhanced)', {
    colorRGB: skinToneRGB,
    materialType: 'MeshStandardMaterial',
    metalness: 0,
    roughness: 0.5,
    envMapIntensity: 0.6,
    philosophy: 'high_end_mobile_material'
  });

  return material;
}

export interface MobileMaterialConfig {
  performanceLevel: PerformanceLevel;
  enableProceduralTextures: boolean;
  textureQuality: 'low' | 'medium' | 'high';
  skinToneRGB: { r: number; g: number; b: number };
}

/**
 * Crée un matériau ultra-simplifié pour les appareils faibles
 * Utilise MeshLambertMaterial au lieu de MeshStandardMaterial
 */
export function createLowEndMobileMaterial(
  skinToneRGB: { r: number; g: number; b: number }
): THREE.MeshLambertMaterial {
  const color = new THREE.Color(
    skinToneRGB.r / 255,
    skinToneRGB.g / 255,
    skinToneRGB.b / 255
  );

  const material = new THREE.MeshLambertMaterial({
    color,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
    reflectivity: 0.1, // Très faible pour performance
    combine: THREE.MultiplyOperation,
    side: THREE.FrontSide
  });

  logger.info('MOBILE_MATERIALS', 'Created low-end mobile material (Lambert)', {
    colorRGB: skinToneRGB,
    materialType: 'MeshLambertMaterial',
    philosophy: 'ultra_performance_simple_material'
  });

  return material;
}

/**
 * Crée un matériau optimisé pour mobile moyen
 * Utilise MeshStandardMaterial simplifié
 */
export function createMediumMobileMaterial(
  skinToneRGB: { r: number; g: number; b: number }
): THREE.MeshStandardMaterial {
  const color = new THREE.Color(
    skinToneRGB.r / 255,
    skinToneRGB.g / 255,
    skinToneRGB.b / 255
  );

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.0, // Pas de métal pour la peau
    roughness: 0.6, // AMÉLIORÉ: Légèrement plus lisse (0.6 au lieu de 0.7)
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
    envMapIntensity: 0.4, // AMÉLIORÉ: Augmenté pour plus de réflexions (0.4 au lieu de 0.3)
    side: THREE.FrontSide
  });

  // Désactiver les maps avancées pour performance
  material.normalMap = null;
  material.bumpMap = null;
  material.displacementMap = null;

  logger.info('MOBILE_MATERIALS', 'Created medium mobile material (Standard simplified)', {
    colorRGB: skinToneRGB,
    materialType: 'MeshStandardMaterial',
    metalness: 0,
    roughness: 0.6,
    envMapIntensity: 0.4,
    philosophy: 'balanced_mobile_material'
  });

  return material;
}

/**
 * Applique des matériaux optimisés mobile à toute la scène
 */
export async function applyMobileMaterials(
  scene: THREE.Scene,
  config: MobileMaterialConfig
): Promise<{ success: boolean; materialsUpdated: number; error?: string }> {
  try {
    const { performanceLevel, skinToneRGB } = config;
    let materialsUpdated = 0;

    logger.info('MOBILE_MATERIALS', 'Applying mobile-optimized materials', {
      performanceLevel,
      skinToneRGB,
      philosophy: 'mobile_material_optimization_start'
    });

    // Parcourir tous les meshes de la scène
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;

      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

      materials.forEach((mat, index) => {
        // Skip if not a material we can optimize
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) {
          return;
        }

        // Create new optimized material based on performance level
        let newMaterial: THREE.Material;

        if (performanceLevel === 'low') {
          newMaterial = createLowEndMobileMaterial(skinToneRGB);
        } else if (performanceLevel === 'high') {
          newMaterial = createHighEndMobileMaterial(skinToneRGB);
        } else {
          newMaterial = createMediumMobileMaterial(skinToneRGB);
        }

        // Copy essential properties from old material
        newMaterial.name = mat.name;
        newMaterial.visible = mat.visible;
        newMaterial.transparent = mat.transparent;
        newMaterial.opacity = mat.opacity;
        newMaterial.side = mat.side;

        // Copy morphing properties if present
        if (mat.morphTargets) {
          (newMaterial as any).morphTargets = true;
        }
        if (mat.morphNormals) {
          (newMaterial as any).morphNormals = true;
        }

        // Copy skinning properties if present
        if ((mat as any).skinning) {
          (newMaterial as any).skinning = true;
        }

        // Replace material
        if (Array.isArray(obj.material)) {
          obj.material[index] = newMaterial;
        } else {
          obj.material = newMaterial;
        }

        // Dispose old material
        mat.dispose();

        materialsUpdated++;

        logger.debug('MOBILE_MATERIALS', 'Material replaced', {
          objectName: obj.name || 'unnamed',
          oldMaterialType: mat.type,
          newMaterialType: newMaterial.type,
          philosophy: 'mobile_material_replacement'
        });
      });
    });

    logger.info('MOBILE_MATERIALS', 'Mobile materials applied successfully', {
      materialsUpdated,
      performanceLevel,
      philosophy: 'mobile_material_optimization_complete'
    });

    return { success: true, materialsUpdated };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('MOBILE_MATERIALS', 'Failed to apply mobile materials', {
      error: errorMessage,
      philosophy: 'mobile_material_error'
    });

    return { success: false, materialsUpdated: 0, error: errorMessage };
  }
}

/**
 * Simplifie les matériaux existants sans les remplacer complètement
 * Utile pour une optimisation graduelle
 */
export function simplifyExistingMaterials(
  scene: THREE.Scene,
  performanceLevel: PerformanceLevel
): number {
  let materialsSimplified = 0;

  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

    materials.forEach((mat) => {
      if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
        // Simplify based on performance level
        if (performanceLevel === 'low') {
          // Ultra simplification
          mat.normalMap = null;
          mat.bumpMap = null;
          mat.displacementMap = null;
          mat.roughnessMap = null;
          mat.metalnessMap = null;
          mat.aoMap = null;
          mat.envMapIntensity = 0;
        } else if (performanceLevel === 'medium') {
          // Moderate simplification
          mat.normalMap = null;
          mat.bumpMap = null;
          mat.displacementMap = null;
          mat.envMapIntensity = 0.3;
        }

        mat.needsUpdate = true;
        materialsSimplified++;
      }
    });
  });

  logger.info('MOBILE_MATERIALS', 'Existing materials simplified', {
    materialsSimplified,
    performanceLevel,
    philosophy: 'mobile_material_simplification'
  });

  return materialsSimplified;
}

/**
 * Nettoie et libère toutes les ressources de matériaux de la scène
 */
export function disposeMaterialResources(scene: THREE.Scene): void {
  let materialsDisposed = 0;
  let texturesDisposed = 0;

  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

    materials.forEach((mat) => {
      // Dispose all textures
      Object.values(mat).forEach((value: any) => {
        if (value && value instanceof THREE.Texture) {
          value.dispose();
          texturesDisposed++;
        }
      });

      // Dispose material
      mat.dispose();
      materialsDisposed++;
    });
  });

  logger.info('MOBILE_MATERIALS', 'Material resources disposed', {
    materialsDisposed,
    texturesDisposed,
    philosophy: 'material_cleanup'
  });
}
