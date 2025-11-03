/**
 * Procedural Skin Texture System
 * Advanced ultra-realistic skin rendering with pores, color variation, and imperfections
 */

import * as THREE from 'three';
import type { SkinToneV2 } from '../../scan/normalizeSkinTone';
import logger from '../../utils/logger';
import { getGlobalTextureCache } from './TextureCacheManager';

interface ProceduralSkinConfig {
  skinTone: SkinToneV2;
  detailLevel: 'low' | 'medium' | 'high' | 'ultra';
  poreIntensity?: number;
  colorVariation?: number;
  imperfectionIntensity?: number;
  resolution?: number;
}

interface ProceduralSkinResult {
  baseColorMap: THREE.DataTexture;
  normalMap: THREE.DataTexture;
  roughnessMap: THREE.DataTexture;
  sssMap?: THREE.DataTexture; // Subsurface scattering variation map
}

/**
 * Generate complete procedural skin texture set
 */
export function generateProceduralSkinTextures(
  config: ProceduralSkinConfig
): ProceduralSkinResult {
  const {
    skinTone,
    detailLevel = 'high',
    poreIntensity = 0.6,
    colorVariation = 0.3,
    imperfectionIntensity = 0.2,
    resolution = getResolutionForDetail(detailLevel)
  } = config;

  // OPTIMIZATION: Check cache first
  const cache = getGlobalTextureCache();
  const cached = cache.get(skinTone);

  if (cached) {
    return {
      baseColorMap: cached.baseColorMap,
      normalMap: cached.normalMap,
      roughnessMap: cached.roughnessMap,
      sssMap: cached.sssMap,
    };
  }

  logger.info('PROCEDURAL_SKIN_TEXTURE', 'Generating procedural skin textures', {
    skinToneHex: skinTone.hex,
    detailLevel,
    resolution,
    poreIntensity,
    colorVariation,
    imperfectionIntensity,
    philosophy: 'ultra_realistic_procedural_generation'
  });

  // Generate base color map with subtle color variation
  const baseColorMap = generateColorVariationMap(
    skinTone,
    resolution,
    colorVariation
  );

  // Generate normal map for pores and micro-details
  const normalMap = generatePoreNormalMap(
    resolution,
    poreIntensity,
    detailLevel
  );

  // Generate roughness map for surface variation
  const roughnessMap = generateRoughnessMap(
    resolution,
    skinTone,
    imperfectionIntensity
  );

  // Generate SSS variation map (optional, for advanced rendering)
  const sssMap = generateSSSVariationMap(
    resolution,
    skinTone
  );

  logger.info('PROCEDURAL_SKIN_TEXTURE', 'Procedural textures generated successfully', {
    baseColorMapSize: `${resolution}x${resolution}`,
    normalMapSize: `${resolution}x${resolution}`,
    roughnessMapSize: `${resolution}x${resolution}`,
    sssMapGenerated: !!sssMap,
    philosophy: 'ultra_realistic_generation_complete'
  });

  const result = {
    baseColorMap,
    normalMap,
    roughnessMap,
    sssMap
  };

  // OPTIMIZATION: Store in cache for future use
  cache.set(skinTone, result);

  return result;
}

/**
 * Get appropriate resolution for detail level
 */
function getResolutionForDetail(detail: string): number {
  switch (detail) {
    case 'low': return 256;
    case 'medium': return 512;
    case 'high': return 1024;
    case 'ultra': return 2048;
    default: return 1024;
  }
}

/**
 * Generate color variation map with subtle skin tone variations
 * Simulates natural skin color inconsistencies
 */
function generateColorVariationMap(
  skinTone: SkinToneV2,
  resolution: number,
  variationIntensity: number
): THREE.DataTexture {
  const size = resolution * resolution;
  const data = new Uint8Array(4 * size);

  const baseR = skinTone.rgb.r;
  const baseG = skinTone.rgb.g;
  const baseB = skinTone.rgb.b;

  // Calculate skin luminance for adaptive variation
  const luminance = (baseR * 0.299 + baseG * 0.587 + baseB * 0.114) / 255;

  for (let i = 0; i < size; i++) {
    const x = i % resolution;
    const y = Math.floor(i / resolution);

    // Multi-scale Perlin-like noise for natural variation
    const noiseScale1 = 0.02; // Large features (blood vessels)
    const noiseScale2 = 0.1;  // Medium features (color patches)
    const noiseScale3 = 0.5;  // Small features (micro-variation)

    const noise1 = perlinNoise(x * noiseScale1, y * noiseScale1, 0);
    const noise2 = perlinNoise(x * noiseScale2, y * noiseScale2, 1);
    const noise3 = perlinNoise(x * noiseScale3, y * noiseScale3, 2);

    // Combine noise layers with different weights
    const combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;

    // Apply variation based on skin luminance
    // Darker skin: more subtle variation
    // Lighter skin: more visible color variation
    const adaptiveIntensity = variationIntensity * (0.5 + luminance * 0.5);

    // Color variation with slight reddish tint (blood circulation)
    const rVariation = combinedNoise * adaptiveIntensity * 15 + noise1 * 5; // More red variation
    const gVariation = combinedNoise * adaptiveIntensity * 10;
    const bVariation = combinedNoise * adaptiveIntensity * 8;

    const idx = i * 4;
    data[idx] = clamp(baseR + rVariation, 0, 255);
    data[idx + 1] = clamp(baseG + gVariation, 0, 255);
    data[idx + 2] = clamp(baseB + bVariation, 0, 255);
    data[idx + 3] = 255; // Alpha
  }

  const texture = new THREE.DataTexture(
    data,
    resolution,
    resolution,
    THREE.RGBAFormat
  );
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

/**
 * Generate pore normal map for realistic skin micro-structure
 */
function generatePoreNormalMap(
  resolution: number,
  intensity: number,
  detailLevel: string
): THREE.DataTexture {
  const size = resolution * resolution;
  const data = new Uint8Array(4 * size);

  // Pore density varies with detail level
  const poreScale = detailLevel === 'ultra' ? 0.15 :
                    detailLevel === 'high' ? 0.12 :
                    detailLevel === 'medium' ? 0.09 : 0.06;

  const wrinkleScale = 0.03; // Larger scale for skin folds/wrinkles

  for (let i = 0; i < size; i++) {
    const x = i % resolution;
    const y = Math.floor(i / resolution);

    // Pores pattern - small circular depressions
    const poreNoise1 = perlinNoise(x * poreScale, y * poreScale, 10);
    const poreNoise2 = perlinNoise(x * poreScale * 2, y * poreScale * 2, 11);
    const pores = Math.max(0, poreNoise1 * 0.7 + poreNoise2 * 0.3);

    // Create circular pore shapes
    const poreStrength = Math.pow(pores, 2) * intensity;

    // Wrinkles and skin folds - larger scale features
    const wrinkleNoise = perlinNoise(x * wrinkleScale, y * wrinkleScale, 12);
    const wrinkles = wrinkleNoise * 0.3;

    // Combine features
    const height = -poreStrength * 0.4 + wrinkles * 0.2;

    // Convert height to normal map (tangent space)
    // Calculate gradient for normal direction
    const dx = height - (-poreStrength * 0.4);
    const dy = height - (-poreStrength * 0.4);

    // Normal vector components (tangent space)
    const nx = dx * 5; // Amplify for visibility
    const ny = dy * 5;
    const nz = 1.0;

    // Normalize
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
    const normalX = (nx / length) * 0.5 + 0.5;
    const normalY = (ny / length) * 0.5 + 0.5;
    const normalZ = (nz / length) * 0.5 + 0.5;

    const idx = i * 4;
    data[idx] = Math.floor(normalX * 255);     // R = Normal X
    data[idx + 1] = Math.floor(normalY * 255); // G = Normal Y
    data[idx + 2] = Math.floor(normalZ * 255); // B = Normal Z
    data[idx + 3] = 255;                       // Alpha
  }

  const texture = new THREE.DataTexture(
    data,
    resolution,
    resolution,
    THREE.RGBAFormat
  );
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

/**
 * Generate roughness map with skin-specific variation
 * Simulates oily areas, dry patches, and natural surface variation
 */
function generateRoughnessMap(
  resolution: number,
  skinTone: SkinToneV2,
  imperfectionIntensity: number
): THREE.DataTexture {
  const size = resolution * resolution;
  const data = new Uint8Array(4 * size);

  // Base roughness varies with skin luminance
  const luminance = (skinTone.rgb.r * 0.299 + skinTone.rgb.g * 0.587 + skinTone.rgb.b * 0.114) / 255;
  const baseRoughness = 0.55 + luminance * 0.1; // Lighter skin slightly rougher

  for (let i = 0; i < size; i++) {
    const x = i % resolution;
    const y = Math.floor(i / resolution);

    // Oily areas (lower roughness) - T-zone, forehead
    const oilScale = 0.05;
    const oilNoise = perlinNoise(x * oilScale, y * oilScale, 20);
    const oiliness = Math.max(0, oilNoise) * 0.2;

    // Dry patches (higher roughness)
    const dryScale = 0.08;
    const dryNoise = perlinNoise(x * dryScale, y * dryScale, 21);
    const dryness = Math.max(0, dryNoise) * 0.15;

    // Micro-variation
    const microScale = 0.3;
    const microNoise = perlinNoise(x * microScale, y * microScale, 22);
    const microVariation = microNoise * 0.1 * imperfectionIntensity;

    // Combine all factors
    const finalRoughness = baseRoughness - oiliness + dryness + microVariation;
    const clampedRoughness = Math.max(0.3, Math.min(0.9, finalRoughness));

    const roughnessValue = Math.floor(clampedRoughness * 255);

    const idx = i * 4;
    data[idx] = roughnessValue;     // R
    data[idx + 1] = roughnessValue; // G
    data[idx + 2] = roughnessValue; // B
    data[idx + 3] = 255;            // Alpha
  }

  const texture = new THREE.DataTexture(
    data,
    resolution,
    resolution,
    THREE.RGBAFormat
  );
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

/**
 * Generate SSS variation map
 * Controls subsurface scattering intensity across the skin
 */
function generateSSSVariationMap(
  resolution: number,
  skinTone: SkinToneV2
): THREE.DataTexture {
  const size = resolution * resolution;
  const data = new Uint8Array(4 * size);

  const luminance = (skinTone.rgb.r * 0.299 + skinTone.rgb.g * 0.587 + skinTone.rgb.b * 0.114) / 255;
  const baseSSS = 0.5 + (1 - luminance) * 0.3; // Lighter skin = more SSS

  for (let i = 0; i < size; i++) {
    const x = i % resolution;
    const y = Math.floor(i / resolution);

    // Blood vessel areas (more SSS)
    const bloodScale = 0.04;
    const bloodNoise = perlinNoise(x * bloodScale, y * bloodScale, 30);
    const bloodFlow = Math.max(0, bloodNoise) * 0.3;

    // Bone proximity areas (less SSS)
    const boneScale = 0.06;
    const boneNoise = perlinNoise(x * boneScale, y * boneScale, 31);
    const boneProximity = Math.max(0, boneNoise) * 0.2;

    const finalSSS = baseSSS + bloodFlow - boneProximity;
    const clampedSSS = Math.max(0.2, Math.min(0.9, finalSSS));

    const sssValue = Math.floor(clampedSSS * 255);

    const idx = i * 4;
    data[idx] = sssValue;     // R
    data[idx + 1] = sssValue; // G
    data[idx + 2] = sssValue; // B
    data[idx + 3] = 255;      // Alpha
  }

  const texture = new THREE.DataTexture(
    data,
    resolution,
    resolution,
    THREE.RGBAFormat
  );
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

/**
 * Simple Perlin-like noise function for texture generation
 * Simplified version for performance
 */
function perlinNoise(x: number, y: number, seed: number): number {
  // Simple pseudo-random function based on position and seed
  const hash = (a: number) => {
    a = (a ^ 61) ^ (a >> 16);
    a = a + (a << 3);
    a = a ^ (a >> 4);
    a = a * 0x27d4eb2d;
    a = a ^ (a >> 15);
    return a;
  };

  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  // Smoothstep interpolation
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);

  // Hash corners
  const a = hash(ix + hash(iy + seed)) / 0x7fffffff;
  const b = hash(ix + 1 + hash(iy + seed)) / 0x7fffffff;
  const c = hash(ix + hash(iy + 1 + seed)) / 0x7fffffff;
  const d = hash(ix + 1 + hash(iy + 1 + seed)) / 0x7fffffff;

  // Bilinear interpolation
  return a * (1 - u) * (1 - v) +
         b * u * (1 - v) +
         c * (1 - u) * v +
         d * u * v;
}

/**
 * Clamp value to range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Apply procedural textures to material
 * CRITICAL FIX: DO NOT apply baseColorMap to material.map
 * The baseColorMap would REPLACE the base color extracted from Vision AI
 * Instead, we only apply detail maps (normal, roughness) that enhance the color
 */
export function applyProceduralTexturesToMaterial(
  material: THREE.MeshPhysicalMaterial,
  textures: ProceduralSkinResult
): void {
  // Store current color before any texture application
  const preservedColor = material.color.clone();
  const preservedColorHex = '#' + preservedColor.getHexString();

  logger.info('PROCEDURAL_SKIN_TEXTURE', 'Applying procedural textures to material', {
    materialName: material.name || 'unnamed',
    preservedColorBeforeTextures: preservedColorHex,
    hasBaseColorMap: !!textures.baseColorMap,
    hasNormalMap: !!textures.normalMap,
    hasRoughnessMap: !!textures.roughnessMap,
    hasSSSMap: !!textures.sssMap,
    philosophy: 'ultra_realistic_texture_application'
  });

  // CRITICAL FIX: DO NOT apply baseColorMap
  // Applying material.map would REPLACE the extracted skin tone color
  // Comment out the problematic lines:
  // material.map = textures.baseColorMap;
  // material.map.colorSpace = THREE.SRGBColorSpace;

  logger.warn('PROCEDURAL_SKIN_TEXTURE', '🚨 CRITICAL: BaseColorMap NOT applied to preserve Vision AI extracted color', {
    materialName: material.name || 'unnamed',
    preservedColor: preservedColorHex,
    reason: 'Applying material.map would replace the base color from scan',
    philosophy: 'color_preservation_over_procedural_variation'
  });

  // Apply normal map (pores and micro-details) - SAFE, does not affect color
  material.normalMap = textures.normalMap;
  material.normalScale = new THREE.Vector2(0.5, 0.5); // Subtle normals

  // Apply roughness map (surface variation) - SAFE, does not affect color
  material.roughnessMap = textures.roughnessMap;

  // Optional: Use SSS map for transmission variation (advanced)
  if (textures.sssMap) {
    // Store SSS map in userData for custom shader usage
    material.userData.sssMap = textures.sssMap;
  }

  // CRITICAL: Restore preserved color after texture application
  material.color.copy(preservedColor);

  material.needsUpdate = true;

  // Verify color was preserved
  const finalColorHex = '#' + material.color.getHexString();
  const colorPreserved = finalColorHex === preservedColorHex;

  logger.info('PROCEDURAL_SKIN_TEXTURE', 'Procedural textures applied - Color preservation check', {
    materialName: material.name || 'unnamed',
    preservedColorHex,
    finalColorHex,
    colorPreserved,
    colorDelta: colorPreserved ? 'ZERO' : 'COLOR_CHANGED',
    philosophy: 'ultra_realistic_texture_application_complete'
  });
}
