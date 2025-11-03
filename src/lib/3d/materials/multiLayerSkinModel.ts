/**
 * Multi-Layer Skin Model
 * Professional 3-layer skin rendering (Oil Layer / Epidermis / Dermis)
 * Based on Penner & Borshukov technique and GPU Gems 3
 */

import * as THREE from 'three';
import { type SkinToneV2 } from '../../scan/normalizeSkinTone';
import logger from '../../utils/logger';

/**
 * Skin layer properties
 * Each layer has different scattering and absorption characteristics
 */
interface SkinLayerProperties {
  // Layer thickness (normalized 0-1)
  thickness: number;

  // Scattering coefficient per wavelength (R, G, B)
  scattering: THREE.Vector3;

  // Absorption coefficient per wavelength (R, G, B)
  absorption: THREE.Vector3;

  // Index of refraction
  ior: number;
}

/**
 * Complete multi-layer skin configuration
 */
export interface MultiLayerSkinConfig {
  skinTone: SkinToneV2;

  // Layer properties
  oilLayer: SkinLayerProperties;
  epidermis: SkinLayerProperties;
  dermis: SkinLayerProperties;

  // Combined properties for rendering
  combinedTransmission: number;
  combinedThickness: number;
  combinedAttenuationColor: THREE.Color;
  specularTint: THREE.Color;
}

/**
 * Calculate multi-layer skin configuration based on skin tone
 * Adapts layer properties to match skin tone characteristics
 */
export function calculateMultiLayerSkinConfig(
  skinTone: SkinToneV2
): MultiLayerSkinConfig {
  const { linear_f32 } = skinTone;

  // Calculate skin tone luminance
  const luminance = linear_f32.r * 0.299 + linear_f32.g * 0.587 + linear_f32.b * 0.114;

  const isDarkSkin = luminance < 0.3;
  const isLightSkin = luminance > 0.7;

  logger.info('MULTI_LAYER_SKIN', 'Calculating multi-layer skin configuration', {
    skinToneHex: skinTone.hex,
    luminance: luminance.toFixed(3),
    skinCategory: isDarkSkin ? 'dark' : isLightSkin ? 'light' : 'medium',
    philosophy: 'professional_3_layer_model'
  });

  // LAYER 1: Oil/Sweat Layer (thin, specular)
  // This is the topmost layer, responsible for most specular reflection
  const oilLayer: SkinLayerProperties = {
    thickness: 0.02, // Very thin layer
    scattering: new THREE.Vector3(0.0, 0.0, 0.0), // No scattering in oil
    absorption: new THREE.Vector3(0.0, 0.0, 0.0), // No absorption
    ior: 1.45 // Index of refraction for skin oil
  };

  // LAYER 2: Epidermis (scattering + absorption)
  // Contains melanin, responsible for skin color
  let epidermisScattering: THREE.Vector3;
  let epidermisAbsorption: THREE.Vector3;
  let epidermisThickness: number;

  if (isDarkSkin) {
    // Dark skin: more melanin = more absorption, less scattering
    epidermisScattering = new THREE.Vector3(0.3, 0.25, 0.2);
    epidermisAbsorption = new THREE.Vector3(0.8, 0.7, 0.6); // High absorption
    epidermisThickness = 0.15;
  } else if (isLightSkin) {
    // Light skin: less melanin = less absorption, more scattering
    epidermisScattering = new THREE.Vector3(0.7, 0.6, 0.5);
    epidermisAbsorption = new THREE.Vector3(0.2, 0.15, 0.1); // Low absorption
    epidermisThickness = 0.10;
  } else {
    // Medium skin
    epidermisScattering = new THREE.Vector3(0.5, 0.45, 0.4);
    epidermisAbsorption = new THREE.Vector3(0.5, 0.4, 0.35);
    epidermisThickness = 0.12;
  }

  const epidermis: SkinLayerProperties = {
    thickness: epidermisThickness,
    scattering: epidermisScattering,
    absorption: epidermisAbsorption,
    ior: 1.4
  };

  // LAYER 3: Dermis (deep scattering)
  // Contains blood vessels, responsible for reddish undertone
  let dermisScattering: THREE.Vector3;
  let dermisAbsorption: THREE.Vector3;

  if (isDarkSkin) {
    // Dark skin: blood less visible
    dermisScattering = new THREE.Vector3(1.0, 0.3, 0.2); // Red scatters most
    dermisAbsorption = new THREE.Vector3(0.3, 0.6, 0.7); // Blue/green absorbed
  } else if (isLightSkin) {
    // Light skin: blood more visible
    dermisScattering = new THREE.Vector3(1.2, 0.4, 0.3);
    dermisAbsorption = new THREE.Vector3(0.2, 0.5, 0.6);
  } else {
    // Medium skin
    dermisScattering = new THREE.Vector3(1.1, 0.35, 0.25);
    dermisAbsorption = new THREE.Vector3(0.25, 0.55, 0.65);
  }

  const dermis: SkinLayerProperties = {
    thickness: 0.50, // Thickest layer
    scattering: dermisScattering,
    absorption: dermisAbsorption,
    ior: 1.39
  };

  // Calculate combined properties for MeshPhysicalMaterial
  const combined = calculateCombinedProperties(oilLayer, epidermis, dermis, skinTone);

  const config: MultiLayerSkinConfig = {
    skinTone,
    oilLayer,
    epidermis,
    dermis,
    ...combined
  };

  logger.info('MULTI_LAYER_SKIN', 'Multi-layer configuration calculated', {
    oilLayerThickness: oilLayer.thickness,
    epidermisThickness: epidermis.thickness,
    dermisThickness: dermis.thickness,
    combinedTransmission: combined.combinedTransmission.toFixed(3),
    combinedThickness: combined.combinedThickness.toFixed(3),
    attenuationColorHex: '#' + combined.combinedAttenuationColor.getHexString(),
    specularTintHex: '#' + combined.specularTint.getHexString(),
    philosophy: 'realistic_3_layer_approximation'
  });

  return config;
}

/**
 * Calculate combined properties from individual layers
 * Approximates multi-layer behavior for single-pass rendering
 */
function calculateCombinedProperties(
  oilLayer: SkinLayerProperties,
  epidermis: SkinLayerProperties,
  dermis: SkinLayerProperties,
  skinTone: SkinToneV2
): {
  combinedTransmission: number;
  combinedThickness: number;
  combinedAttenuationColor: THREE.Color;
  specularTint: THREE.Color;
} {
  // Calculate luminance for adaptive behavior
  const { linear_f32 } = skinTone;
  const luminance = linear_f32.r * 0.299 + linear_f32.g * 0.587 + linear_f32.b * 0.114;

  // Combined transmission (weighted average)
  // Oil layer doesn't contribute to transmission
  const epidermisWeight = epidermis.thickness / (epidermis.thickness + dermis.thickness);
  const dermisWeight = dermis.thickness / (epidermis.thickness + dermis.thickness);

  // Calculate transmission based on scattering
  const epidermisTransmission = (epidermis.scattering.x + epidermis.scattering.y + epidermis.scattering.z) / 3.0;
  const dermisTransmission = (dermis.scattering.x + dermis.scattering.y + dermis.scattering.z) / 3.0;

  // CRITICAL FIX: Reduce transmission for lighter skins to avoid darkening
  // For very light skin (luminance > 0.75), ultra-minimal transmission to preserve exact color
  let combinedTransmission = (epidermisTransmission * epidermisWeight + dermisTransmission * dermisWeight);

  // Scale to realistic range with color preservation priority
  if (luminance < 0.3) {
    // Dark skin - normal SSS
    combinedTransmission = 0.25 + (combinedTransmission * 0.15); // 0.25-0.40 range
  } else if (luminance > 0.75) {
    // Very light/white skin - CRITICAL: Ultra-minimal transmission to preserve exact color
    combinedTransmission = 0.02 + (combinedTransmission * 0.04); // 0.02-0.06 range (reduced by 85%)
  } else if (luminance > 0.65) {
    // Light skin - CRITICAL: Minimal transmission to preserve exact color
    combinedTransmission = 0.05 + (combinedTransmission * 0.06); // 0.05-0.11 range (reduced by 75%)
  } else {
    // Medium skin - moderate SSS
    combinedTransmission = 0.20 + (combinedTransmission * 0.15); // 0.20-0.35 range (reduced by 30%)
  }

  // Combined thickness (sum of layers)
  const combinedThickness = epidermis.thickness + dermis.thickness;

  // Combined attenuation color (mix of absorption characteristics)
  // This color tints the transmitted light
  // CRITICAL FIX: For light skins, use the base color directly to avoid darkening
  let attenuationR, attenuationG, attenuationB;

  if (luminance > 0.75) {
    // Very light/white skin - CRITICAL: Use exact base color with 99% preservation
    attenuationR = Math.min(1.0, linear_f32.r * 0.99 + dermis.scattering.x * 0.01);
    attenuationG = Math.min(1.0, linear_f32.g * 0.99 + dermis.scattering.y * 0.01);
    attenuationB = Math.min(1.0, linear_f32.b * 0.99 + dermis.scattering.z * 0.01);
  } else if (luminance > 0.65) {
    // Light skin - use base color with minimal tinting to preserve exact color
    attenuationR = Math.min(1.0, linear_f32.r * 0.97 + dermis.scattering.x * 0.03);
    attenuationG = Math.min(1.0, linear_f32.g * 0.97 + dermis.scattering.y * 0.03);
    attenuationB = Math.min(1.0, linear_f32.b * 0.97 + dermis.scattering.z * 0.03);
  } else {
    // Medium/dark skin - normal attenuation with blood undertone
    attenuationR = Math.min(1.0, dermis.scattering.x * 1.5 + linear_f32.r * 0.3);
    attenuationG = Math.min(1.0, dermis.scattering.y * 1.2 + linear_f32.g * 0.2);
    attenuationB = Math.min(1.0, dermis.scattering.z * 0.9 + linear_f32.b * 0.1);
  }

  const combinedAttenuationColor = new THREE.Color(attenuationR, attenuationG, attenuationB);

  // Specular tint (from oil layer + skin undertone)
  // Slightly tints the specular reflection based on skin tone
  const specularTintR = Math.min(1.0, linear_f32.r * 1.05 + 0.05);
  const specularTintG = Math.min(1.0, linear_f32.g * 1.03 + 0.03);
  const specularTintB = Math.min(1.0, linear_f32.b * 1.01 + 0.01);

  const specularTint = new THREE.Color(specularTintR, specularTintG, specularTintB);

  // CRITICAL LOG: Document color preservation adjustments
  logger.info('MULTI_LAYER_SKIN', '🎨 Combined properties calculated with color preservation', {
    luminance: luminance.toFixed(3),
    skinCategory: luminance > 0.75 ? 'very_light_max_preservation' : luminance > 0.65 ? 'light_high_preservation' : luminance < 0.3 ? 'dark_normal_sss' : 'medium_reduced_sss',
    combinedTransmission: combinedTransmission.toFixed(3),
    attenuationColorHex: '#' + combinedAttenuationColor.getHexString(),
    baseSkinToneHex: skinTone.hex,
    colorPreservationMode: luminance > 0.75 ? 'ACTIVE_MAX' : luminance > 0.65 ? 'ACTIVE' : 'DISABLED',
    attenuationVsBase: {
      rDelta: (attenuationR - linear_f32.r).toFixed(4),
      gDelta: (attenuationG - linear_f32.g).toFixed(4),
      bDelta: (attenuationB - linear_f32.b).toFixed(4)
    },
    philosophy: 'color_preservation_priority_especially_very_light_skins'
  });

  return {
    combinedTransmission,
    combinedThickness,
    combinedAttenuationColor,
    specularTint
  };
}

/**
 * Apply multi-layer skin model to MeshPhysicalMaterial
 * CRITICAL: This function applies the EXACT skin tone color from Vision AI
 * Multi-layer effects (transmission, attenuation) enhance realism WITHOUT changing base color
 */
export function applyMultiLayerSkinToMaterial(
  material: THREE.MeshPhysicalMaterial,
  config: MultiLayerSkinConfig,
  materialName: string = 'unnamed'
): void {
  try {
    // CRITICAL: Apply EXACT base color from Vision AI extracted skin tone
    // This is the PRIMARY color that will be visible on the 3D model
    logger.info('MULTI_LAYER_SKIN', '🎨 CRITICAL: Applying EXACT Vision AI skin tone color', {
      materialName,
      skinToneHex: config.skinTone.hex,
      linearRGB: {
        r: config.skinTone.linear_f32.r.toFixed(6),
        g: config.skinTone.linear_f32.g.toFixed(6),
        b: config.skinTone.linear_f32.b.toFixed(6)
      },
      rgbValues: {
        r: config.skinTone.rgb.r,
        g: config.skinTone.rgb.g,
        b: config.skinTone.rgb.b
      },
      source: config.skinTone.source,
      confidence: config.skinTone.confidence,
      philosophy: 'exact_color_application_from_vision_ai'
    });

    material.color.setRGB(
      config.skinTone.linear_f32.r,
      config.skinTone.linear_f32.g,
      config.skinTone.linear_f32.b
    );

    // Verify color was applied correctly
    const appliedColorHex = '#' + material.color.getHexString();
    logger.info('MULTI_LAYER_SKIN', '✅ Color applied - Verification', {
      materialName,
      expectedHex: config.skinTone.hex,
      appliedHex: appliedColorHex,
      colorMatch: appliedColorHex.toLowerCase() === config.skinTone.hex.toLowerCase(),
      philosophy: 'color_application_verification'
    });

    // Apply transmission properties
    material.transmission = config.combinedTransmission;
    material.thickness = config.combinedThickness;
    material.ior = config.epidermis.ior; // Use epidermis IOR

    // Apply attenuation (controls transmitted light color)
    material.attenuationDistance = 0.5;
    material.attenuationColor.copy(config.combinedAttenuationColor);

    // Apply specular tint
    if (material.specularColor) {
      material.specularColor.copy(config.specularTint);
    }
    material.specularIntensity = 0.85;

    // Apply oil layer as clearcoat
    material.clearcoat = 0.25; // Subtle clearcoat for oil layer
    material.clearcoatRoughness = 0.3; // Smooth oil layer

    // Apply epidermis roughness
    const luminance = config.skinTone.linear_f32.r * 0.299 +
                     config.skinTone.linear_f32.g * 0.587 +
                     config.skinTone.linear_f32.b * 0.114;

    material.roughness = luminance < 0.3 ? 0.45 : luminance > 0.7 ? 0.65 : 0.55;

    // Apply sheen for skin surface
    material.sheen = 0.3;
    material.sheenRoughness = 0.4;
    if (material.sheenColor) {
      material.sheenColor.copy(config.specularTint);
    }

    // Metalness always 0 for skin
    material.metalness = 0.0;

    material.needsUpdate = true;

    // CRITICAL: Final color verification after all multi-layer properties applied
    const finalColor = {
      r: material.color.r,
      g: material.color.g,
      b: material.color.b,
      hex: '#' + material.color.getHexString()
    };

    const colorPreserved =
      Math.abs(material.color.r - config.skinTone.linear_f32.r) < 0.001 &&
      Math.abs(material.color.g - config.skinTone.linear_f32.g) < 0.001 &&
      Math.abs(material.color.b - config.skinTone.linear_f32.b) < 0.001;

    logger.info('MULTI_LAYER_SKIN', 'Multi-layer skin model applied to material', {
      materialName,
      transmission: config.combinedTransmission.toFixed(3),
      thickness: config.combinedThickness.toFixed(3),
      clearcoat: material.clearcoat,
      roughness: material.roughness.toFixed(3),
      attenuationColorHex: '#' + material.attenuationColor.getHexString(),
      finalColorHex: finalColor.hex,
      expectedColorHex: config.skinTone.hex,
      colorPreserved,
      colorPreservationStatus: colorPreserved ? '✅ PRESERVED' : '❌ MODIFIED',
      philosophy: 'professional_3_layer_applied'
    });

    // CRITICAL: If color was modified by multi-layer effects, restore it
    if (!colorPreserved) {
      logger.warn('MULTI_LAYER_SKIN', '🚨 CRITICAL: Color was modified, restoring original', {
        materialName,
        modifiedColor: finalColor.hex,
        restoringTo: config.skinTone.hex,
        philosophy: 'emergency_color_restoration'
      });

      material.color.setRGB(
        config.skinTone.linear_f32.r,
        config.skinTone.linear_f32.g,
        config.skinTone.linear_f32.b
      );
      material.needsUpdate = true;
    }

  } catch (error) {
    logger.error('MULTI_LAYER_SKIN', 'Failed to apply multi-layer skin', {
      materialName,
      error: error instanceof Error ? error.message : 'Unknown error',
      philosophy: 'multi_layer_application_error'
    });
  }
}

/**
 * Calculate diffusion profile for SSS
 * Returns RGB diffusion distances for Screen-Space SSS
 */
export function calculateDiffusionProfile(
  config: MultiLayerSkinConfig
): { r: number; g: number; b: number } {
  // Red light scatters further than blue in skin
  // Based on wavelength-dependent scattering

  const epidermisScattering = config.epidermis.scattering;
  const dermisScattering = config.dermis.scattering;

  // Combine scattering from both layers
  const rDiffusion = (epidermisScattering.x + dermisScattering.x) * 0.015;
  const gDiffusion = (epidermisScattering.y + dermisScattering.y) * 0.010;
  const bDiffusion = (epidermisScattering.z + dermisScattering.z) * 0.007;

  logger.debug('MULTI_LAYER_SKIN', 'Diffusion profile calculated', {
    rDiffusion: rDiffusion.toFixed(4),
    gDiffusion: gDiffusion.toFixed(4),
    bDiffusion: bDiffusion.toFixed(4),
    philosophy: 'wavelength_dependent_scattering'
  });

  return { r: rDiffusion, g: gDiffusion, b: bDiffusion };
}
