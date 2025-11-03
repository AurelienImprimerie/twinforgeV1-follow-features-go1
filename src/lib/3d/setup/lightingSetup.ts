/**
 * Lighting Setup
 * Professional lighting configuration for realistic avatar rendering
 */

import * as THREE from 'three';
import logger from '../../utils/logger';

/**
 * Setup professional VisionOS26 lighting system
 * Enhanced for realistic skin rendering across all skin tones
 * ENHANCED: Optimized for PBR materials with true subsurface scattering
 */
export function setupLighting(scene: THREE.Scene): void {
  // Ensure scene is properly initialized
  if (!scene) {
    throw new Error('Scene is not initialized - cannot setup lighting');
  }
  
  // ENHANCED: Professional studio lighting optimized for skin + SSS
  // CRITICAL FIX: Neutral key light to avoid bronzing very light/white skin tones
  // Intensities calibrated for IBL + SSS post-processing pipeline
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2); // Neutral white to preserve skin color
  keyLight.position.set(2, 4, 3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 5;
  keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.bias = -0.0001;
  keyLight.shadow.normalBias = 0.02;

  scene.add(keyLight);

  // ENHANCED: Neutral fill light to preserve skin color accuracy
  const fillLight = new THREE.DirectionalLight(0xfff8fa, 2.0); // Near-neutral fill with minimal warm bias
  fillLight.position.set(-2, 3, 2);
  scene.add(fillLight);

  // ENHANCED: Neutral rim light for silhouette definition
  const backLight = new THREE.DirectionalLight(0xfff8f5, 1.6); // Near-neutral rim light
  backLight.position.set(0, 2, -3);
  scene.add(backLight);

  // ENHANCED: Side lights for SSS lateral illumination
  const leftSideLight = new THREE.DirectionalLight(0xfff5f0, 0.7); // Near-neutral side light
  leftSideLight.position.set(-4, 1.5, 0);
  scene.add(leftSideLight);

  const rightSideLight = new THREE.DirectionalLight(0xfff5f0, 0.7); // Near-neutral side light
  rightSideLight.position.set(4, 1.5, 0);
  scene.add(rightSideLight);

  // ENHANCED: Rim light for SSS edge definition
  const rimLight = new THREE.DirectionalLight(0xf0f2ff, 0.5); // Cool-neutral rim light for edge definition
  rimLight.position.set(1, 4, -2);
  scene.add(rimLight);

  // CRITICAL FIX: Reduced ambient light to avoid overexposure that darkens/bronzes light skin
  // Lower intensity prevents light accumulation that can darken very light skin tones
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9); // Reduced from 1.2 to prevent bronzing
  scene.add(ambientLight);
  
  // ENHANCED: Bottom light for SSS lower body illumination
  const bottomLight = new THREE.DirectionalLight(0xfff8f0, 0.35); // Near-neutral bottom light
  bottomLight.position.set(0, -1, 2);
  scene.add(bottomLight);
  
  // CRITICAL FIX: Neutral hemisphere light to avoid color contamination
  const hemisphereLight = new THREE.HemisphereLight(0xe0f0ff, 0xf0e8e0, 0.5); // Neutral cool sky, warm ground
  scene.add(hemisphereLight);
  
  // ENHANCED: Face light for SSS facial illumination
  const faceLight = new THREE.DirectionalLight(0xfffffb, 0.35); // Near-white face light to preserve skin tone
  faceLight.position.set(0, 3, 4);
  scene.add(faceLight);
  
  logger.info('ENHANCED_SSS_LIGHTING_SETUP', 'Enhanced SSS-optimized lighting setup completed', {
    totalLights: 10,
    lightingStrategy: 'neutral_color_accurate_with_sss_optimization',
    keyLightIntensity: 3.2,
    keyLightColor: '0xffffff (neutral white)',
    ambientReduced: 'reduced_from_1.2_to_0.9_to_prevent_bronzing',
    temperatureVariation: 'neutral_spectrum_for_accurate_skin_color',
    shadowQuality: 'enhanced_with_bias_correction',
    intensityOptimization: 'balanced_for_color_preservation',
    sceneChildren: scene.children.length,
    lightsAdded: scene.children.filter(child => child.isLight).length,
    colorAccuracyOptimizations: {
      neutralColorTemperatures: true,
      reducedAmbientIntensity: true,
      multiDirectionalForSSS: true,
      veryLightSkinSupport: true,
      noBronzingEffect: true
    },
    philosophy: 'color_accurate_photo_realistic_skin_all_tones_including_very_light'
  });
}