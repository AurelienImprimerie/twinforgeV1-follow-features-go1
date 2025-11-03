/**
 * Mobile-Optimized Lighting Setup
 * Configuration d'éclairage simplifiée pour les appareils mobiles
 * Réduit de 10 lumières à 3-4 lumières essentielles
 */

import * as THREE from 'three';
import logger from '../../utils/logger';
import type { PerformanceLevel } from '../performance/mobileDetection';

export interface LightingConfig {
  performanceLevel: PerformanceLevel;
  maxLights: number;
  enableShadows: boolean;
}

/**
 * Setup ultra-optimized lighting for low-end mobile devices
 * 3 lumières seulement: Ambient + Key + Fill
 */
export function setupLowEndMobileLighting(scene: THREE.Scene): void {
  logger.info('MOBILE_LIGHTING', 'Setting up low-end mobile lighting (3 lights)', {
    philosophy: 'ultra_performance_minimal_lights'
  });

  // 1. Ambient light - base illumination (pas de calculs coûteux)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // 2. Key light - lumière principale directionnelle sans ombres
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(2, 4, 3);
  keyLight.castShadow = false; // CRITIQUE: Pas d'ombres sur mobile faible
  scene.add(keyLight);

  // 3. Fill light - lumière de remplissage pour réduire les ombres dures
  const fillLight = new THREE.DirectionalLight(0xfff8fa, 1.5);
  fillLight.position.set(-2, 2, 2);
  fillLight.castShadow = false;
  scene.add(fillLight);

  logger.info('MOBILE_LIGHTING', 'Low-end mobile lighting complete', {
    totalLights: 3,
    shadowsEnabled: false,
    ambientIntensity: 1.2,
    philosophy: 'minimal_lights_maximum_performance'
  });
}

/**
 * Setup balanced lighting for medium-performance mobile devices
 * 4 lumières: Ambient + Key + Fill + Rim
 */
export function setupMediumMobileLighting(scene: THREE.Scene): void {
  logger.info('MOBILE_LIGHTING', 'Setting up medium mobile lighting (4 lights)', {
    philosophy: 'balanced_performance_quality'
  });

  // 1. Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // 2. Key light - lumière principale
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(2, 4, 3);
  keyLight.castShadow = false; // Toujours pas d'ombres sur mobile
  scene.add(keyLight);

  // 3. Fill light
  const fillLight = new THREE.DirectionalLight(0xfff8fa, 1.8);
  fillLight.position.set(-2, 3, 2);
  fillLight.castShadow = false;
  scene.add(fillLight);

  // 4. Rim light - pour définition de la silhouette
  const rimLight = new THREE.DirectionalLight(0xfff8f5, 1.2);
  rimLight.position.set(0, 2, -3);
  rimLight.castShadow = false;
  scene.add(rimLight);

  logger.info('MOBILE_LIGHTING', 'Medium mobile lighting complete', {
    totalLights: 4,
    shadowsEnabled: false,
    philosophy: 'balanced_mobile_lighting'
  });
}

/**
 * Setup optimized lighting for tablets
 * 6 lumières avec possibilité d'ombres
 */
export function setupTabletLighting(scene: THREE.Scene, enableShadows: boolean): void {
  logger.info('MOBILE_LIGHTING', 'Setting up tablet lighting (6 lights)', {
    enableShadows,
    philosophy: 'tablet_optimized_lighting'
  });

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  // Key light with optional shadows
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
  keyLight.position.set(2, 4, 3);
  keyLight.castShadow = enableShadows;

  if (enableShadows) {
    keyLight.shadow.mapSize.width = 1024; // Réduit de 2048
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.02;
  }

  scene.add(keyLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0xfff8fa, 2.0);
  fillLight.position.set(-2, 3, 2);
  fillLight.castShadow = false;
  scene.add(fillLight);

  // Rim light
  const rimLight = new THREE.DirectionalLight(0xfff8f5, 1.6);
  rimLight.position.set(0, 2, -3);
  rimLight.castShadow = false;
  scene.add(rimLight);

  // Hemisphere light
  const hemisphereLight = new THREE.HemisphereLight(0xe0f0ff, 0xf0e8e0, 0.5);
  scene.add(hemisphereLight);

  // Face light
  const faceLight = new THREE.DirectionalLight(0xfffffb, 0.35);
  faceLight.position.set(0, 3, 4);
  faceLight.castShadow = false;
  scene.add(faceLight);

  logger.info('MOBILE_LIGHTING', 'Tablet lighting complete', {
    totalLights: 6,
    shadowsEnabled: enableShadows,
    shadowMapSize: enableShadows ? 1024 : 0,
    philosophy: 'tablet_quality_lighting'
  });
}

/**
 * Setup adaptive lighting based on device capabilities
 */
export function setupAdaptiveLighting(
  scene: THREE.Scene,
  config: LightingConfig
): void {
  const { performanceLevel, maxLights, enableShadows } = config;

  logger.info('MOBILE_LIGHTING', 'Setting up adaptive lighting', {
    performanceLevel,
    maxLights,
    enableShadows,
    philosophy: 'adaptive_lighting_setup'
  });

  // Remove any existing lights
  const lightsToRemove: THREE.Light[] = [];
  scene.traverse((obj) => {
    if (obj instanceof THREE.Light) {
      lightsToRemove.push(obj);
    }
  });

  lightsToRemove.forEach(light => {
    scene.remove(light);
    light.dispose();
  });

  // Apply appropriate lighting setup
  if (performanceLevel === 'low' || maxLights <= 3) {
    setupLowEndMobileLighting(scene);
  } else if (performanceLevel === 'medium' || maxLights <= 4) {
    setupMediumMobileLighting(scene);
  } else {
    setupTabletLighting(scene, enableShadows);
  }

  logger.info('MOBILE_LIGHTING', 'Adaptive lighting setup complete', {
    finalLightCount: scene.children.filter(child => child instanceof THREE.Light).length,
    philosophy: 'adaptive_lighting_complete'
  });
}

/**
 * Supprime toutes les lumières de la scène
 */
export function removeAllLights(scene: THREE.Scene): void {
  const lightsToRemove: THREE.Light[] = [];

  scene.traverse((obj) => {
    if (obj instanceof THREE.Light) {
      lightsToRemove.push(obj);
    }
  });

  lightsToRemove.forEach(light => {
    scene.remove(light);
    if (light instanceof THREE.DirectionalLight && light.shadow) {
      light.shadow.map?.dispose();
    }
    light.dispose();
  });

  logger.info('MOBILE_LIGHTING', 'All lights removed from scene', {
    removedCount: lightsToRemove.length,
    philosophy: 'lighting_cleanup'
  });
}
