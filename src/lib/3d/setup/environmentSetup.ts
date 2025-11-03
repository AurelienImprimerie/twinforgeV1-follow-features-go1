/**
 * Environment Setup - Image-Based Lighting (IBL)
 * Professional environment mapping for photo-realistic reflections
 */

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import logger from '../../utils/logger';

/**
 * Generate a procedural neutral studio environment map
 * Fallback for when HDRI is not available
 */
export function generateProceduralEnvironmentMap(
  renderer: THREE.WebGLRenderer
): THREE.CubeTexture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // Create a simple gradient environment
  const scene = new THREE.Scene();

  // Sky gradient (neutral warm studio lighting)
  const skyColor = new THREE.Color(0xffffff); // Bright white for highlights
  const horizonColor = new THREE.Color(0xe8dcc8); // Warm neutral
  const groundColor = new THREE.Color(0xc4b5a0); // Warm ground reflection

  // Create hemisphere light for soft fill
  const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 1.0);
  scene.add(hemiLight);

  // Add directional lights to simulate studio setup
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(5, 10, 7.5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xfff8f0, 0.8);
  fillLight.position.set(-5, 5, 5);
  scene.add(fillLight);

  // Generate environment texture from scene
  const renderTarget = pmremGenerator.fromScene(scene, 0.04);
  const envMap = renderTarget.texture;

  pmremGenerator.dispose();

  logger.info('ENVIRONMENT_SETUP', 'Procedural environment map generated', {
    type: 'neutral_studio',
    philosophy: 'fallback_ibl_for_skin_rendering'
  });

  return envMap as THREE.CubeTexture;
}

/**
 * Setup neutral studio environment for skin rendering
 * Optimized for mobile performance
 */
export function setupStudioEnvironment(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): THREE.Texture {
  logger.info('ENVIRONMENT_SETUP', 'Setting up studio environment for IBL', {
    philosophy: 'professional_ibl_skin_rendering'
  });

  // Generate procedural environment
  const envMap = generateProceduralEnvironmentMap(renderer);

  // Apply to scene
  scene.environment = envMap;

  // Keep background transparent but use environment for lighting
  scene.background = null;

  logger.info('ENVIRONMENT_SETUP', 'Studio environment configured', {
    hasEnvironment: !!scene.environment,
    philosophy: 'ibl_active_for_realistic_reflections'
  });

  return envMap;
}

/**
 * Calculate optimal environment intensity based on skin tone
 */
export function calculateEnvMapIntensity(skinLuminance: number): number {
  // Darker skin needs slightly more environment reflection
  // Lighter skin needs more subtle environment
  if (skinLuminance < 0.3) {
    return 1.4; // Dark skin
  } else if (skinLuminance > 0.7) {
    return 0.9; // Light skin
  } else {
    return 1.1; // Medium skin
  }
}

/**
 * Create a neutral color environment cube map
 * Fast generation for mobile devices
 */
export function createNeutralEnvironmentCube(
  renderer: THREE.WebGLRenderer,
  size: number = 256
): THREE.CubeTexture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  // Create simple neutral scene
  const envScene = new THREE.Scene();

  // Neutral warm ambient
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  envScene.add(ambient);

  // Warm key light
  const key = new THREE.DirectionalLight(0xfff5e6, 1.0);
  key.position.set(2, 3, 1);
  envScene.add(key);

  // Cool fill
  const fill = new THREE.DirectionalLight(0xe6f0ff, 0.4);
  fill.position.set(-2, 2, -1);
  envScene.add(fill);

  const cubeRenderTarget = pmremGenerator.fromScene(envScene);
  const envMap = cubeRenderTarget.texture;

  pmremGenerator.dispose();

  logger.info('ENVIRONMENT_SETUP', 'Neutral cube environment created', {
    size,
    philosophy: 'mobile_optimized_ibl'
  });

  return envMap as THREE.CubeTexture;
}

/**
 * Apply environment map to all materials in scene
 */
export function applyEnvironmentToMaterials(
  scene: THREE.Scene,
  envMap: THREE.Texture,
  intensity: number = 1.0
): number {
  let materialsUpdated = 0;

  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial) {

          // Apply environment map
          material.envMap = envMap;
          material.envMapIntensity = intensity;
          material.needsUpdate = true;

          materialsUpdated++;

          logger.debug('ENVIRONMENT_SETUP', 'Environment applied to material', {
            materialName: material.name || 'unnamed',
            intensity,
            philosophy: 'ibl_material_configuration'
          });
        }
      });
    }
  });

  logger.info('ENVIRONMENT_SETUP', 'Environment maps applied to scene', {
    materialsUpdated,
    intensity,
    philosophy: 'scene_ibl_complete'
  });

  return materialsUpdated;
}
