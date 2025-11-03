/**
 * Payload Processor - Data Preparation Utilities
 * Pure functions for processing and validating viewer payload data
 */

import { prepareMorphologicalPayload } from '../../../../lib/morph/preparePayload';
import { resolveSkinTone } from '../../../../lib/scan/normalizeSkinTone';
import type { MorphologyMappingData } from '../../../../hooks/useMorphologyMapping';
import type { PreparedPayload, Avatar3DViewerProps } from './viewerTypes';
import logger from '../../../../lib/utils/logger';

/**
 * Process viewer payload from props
 */
export async function processViewerPayload(
  props: Avatar3DViewerProps,
  morphologyMapping: MorphologyMappingData | null
): Promise<PreparedPayload> {
  const {
    savedAvatarPayload,
    morphData = {},
    limbMasses = {},
    userProfile,
    serverScanId,
    // NEW: Override props
    overrideMorphData,
    overrideLimbMasses,
    overrideSkinTone,
    overrideGender
  } = props;

  logger.debug('PAYLOAD_PROCESSOR', 'Processing viewer payload', {
    hasSavedAvatarPayload: !!savedAvatarPayload,
    hasMorphData: !!morphData,
    morphDataKeys: morphData ? Object.keys(morphData) : [],
    hasLimbMasses: !!limbMasses,
    limbMassesKeys: limbMasses ? Object.keys(limbMasses) : [],
    hasMorphologyMapping: !!morphologyMapping,
    hasUserProfile: !!userProfile,
    serverScanId,
    // NEW: Log override props
    hasOverrideMorphData: !!overrideMorphData,
    overrideMorphDataKeys: overrideMorphData ? Object.keys(overrideMorphData).length : 0,
    hasOverrideLimbMasses: !!overrideLimbMasses,
    overrideLimbMassesKeys: overrideLimbMasses ? Object.keys(overrideLimbMasses).length : 0,
    hasOverrideSkinTone: !!overrideSkinTone,
    hasOverrideGender: !!overrideGender,
    philosophy: 'payload_processing_audit'
  });

  // PRIORITY 0: Use override props if provided (projection mode)
  if (overrideMorphData && Object.keys(overrideMorphData).length > 0) {
    // CRITICAL: Determine gender and skin tone even in override mode
    const finalGender = determineFinalGender(props);
    const finalSkinTone = processSkinTone(props);

    logger.info('PAYLOAD_PROCESSOR', 'Using override morph data (projection mode)', {
      overrideMorphDataKeys: Object.keys(overrideMorphData).length,
      overrideLimbMassesKeys: overrideLimbMasses ? Object.keys(overrideLimbMasses).length : 0,
      hasOverrideSkinTone: !!overrideSkinTone,
      hasOverrideGender: !!overrideGender,
      finalGender,
      finalSkinToneHex: finalSkinTone?.hex,
      serverScanId,
      philosophy: 'override_morph_data_mode'
    });

    return {
      status: 'ready',
      shape_params: overrideMorphData,
      limb_masses: overrideLimbMasses || limbMasses || {},
      resolved_gender: finalGender,
      skin_tone: finalSkinTone,
      strategy: 'override_morph_data',
      confidence: 1.0
    };
  }

  // PRIORITY 1: Use savedAvatarPayload if provided (direct mode)
  if (savedAvatarPayload) {
    const payloadValidation = validateSavedAvatarPayload(savedAvatarPayload);
    
    logger.info('PAYLOAD_PROCESSOR', 'Using saved avatar payload', {
      avatarVersion: savedAvatarPayload.avatar_version,
      resolvedGender: savedAvatarPayload.resolved_gender,
      payloadValidation,
      serverScanId,
      philosophy: 'saved_avatar_payload_mode'
    });
    
    if (!payloadValidation.isValid) {
      return {
        status: 'error',
        shape_params: {},
        limb_masses: {},
        strategy: 'saved_payload_validation_failed',
        confidence: 0,
        error: `Saved avatar payload validation failed: ${payloadValidation.issues.join(', ')}`
      };
    }
    
    return {
      status: 'ready',
      shape_params: savedAvatarPayload.final_shape_params,
      limb_masses: savedAvatarPayload.final_limb_masses,
      strategy: `saved_avatar_${savedAvatarPayload.avatar_version}`,
      confidence: 0.95
    };
  }

  // PRIORITY 2: Use morphData/limbMasses OR faceMorphData from props (pipeline mode)
  const {
    faceMorphData,
    faceSkinTone
  } = props;

  const hasMorphData = morphData && Object.keys(morphData).length > 0;
  const hasFaceMorphData = faceMorphData && Object.keys(faceMorphData).length > 0;

  // If neither morphData nor faceMorphData is available, return pending
  if (!hasMorphData && !hasFaceMorphData) {
    return {
      status: 'pending',
      shape_params: {},
      limb_masses: {},
      strategy: 'pending_morph_data',
      confidence: 0,
      error: 'Morph data or face morph data not available'
    };
  }

  if (!morphologyMapping) {
    return {
      status: 'pending',
      shape_params: morphData || {},
      limb_masses: limbMasses || {},
      strategy: 'pending_morphology_mapping',
      confidence: 0,
      error: 'Morphology mapping not loaded'
    };
  }

  // For face-only mode, userProfile is optional
  // All prerequisites met
  logger.info('PAYLOAD_PROCESSOR', 'Payload ready for viewer', {
    hasMorphData,
    hasFaceMorphData,
    strategy: hasFaceMorphData ? 'face_only_mode' : 'full_body_mode',
    morphDataKeys: hasMorphData ? Object.keys(morphData).length : 0,
    faceMorphDataKeys: hasFaceMorphData ? Object.keys(faceMorphData).length : 0,
    serverScanId,
    philosophy: 'payload_ready'
  });

  return {
    status: 'ready',
    shape_params: morphData || {},
    limb_masses: limbMasses || {},
    strategy: hasFaceMorphData ? 'face_only_direct_params' : 'direct_morph_data',
    confidence: hasFaceMorphData ? 0.95 : 0.9
  };
}

/**
 * Process skin tone from various sources
 */
export function processSkinTone(props: Avatar3DViewerProps): any {
  const { savedAvatarPayload, skinTone, scanResult, serverScanId, overrideSkinTone } = props;

  // PRIORITY 0: Use override skin tone if provided
  if (overrideSkinTone) {
    const rgb = overrideSkinTone.rgb || overrideSkinTone;
    logger.info('PAYLOAD_PROCESSOR', 'Using override skin tone', {
      skinToneRGB: rgb?.r !== undefined ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'unknown',
      skinToneHex: overrideSkinTone.hex,
      confidence: overrideSkinTone.confidence?.toFixed(3),
      schema: overrideSkinTone.schema,
      serverScanId,
      philosophy: 'override_skin_tone_priority'
    });
    return overrideSkinTone;
  }

  // Build unified payload for skin tone resolver
  const unifiedPayload = {
    // V2 sources (priority)
    skin_tone: savedAvatarPayload?.skin_tone,
    avatar: { skin_tone: savedAvatarPayload?.skin_tone },
    savedAvatarPayload: { skin_tone: savedAvatarPayload?.skin_tone },
    
    // Legacy sources (fallback)
    skinTone: skinTone,
    
    // Scan sources (fallback)
    estimate: scanResult?.estimate,
    commit: scanResult?.commit,
    match: scanResult?.match,
    semantic: scanResult?.semantic
  };
  
  const { tone, source } = resolveSkinTone(unifiedPayload);

  // Validate coherence between saved avatar and scan sources
  if (savedAvatarPayload?.skin_tone && scanResult?.estimate?.extracted_data?.skin_tone) {
    const savedRGB = savedAvatarPayload.skin_tone.rgb;
    const scanRGB = scanResult.estimate.extracted_data.skin_tone;

    const maxDifference = Math.max(
      Math.abs(savedRGB.r - (scanRGB.r || 0)),
      Math.abs(savedRGB.g - (scanRGB.g || 0)),
      Math.abs(savedRGB.b - (scanRGB.b || 0))
    );

    if (maxDifference > 10) {
      logger.warn('PAYLOAD_PROCESSOR', 'Skin tone divergence detected between storage and scan', {
        savedRGB: `rgb(${savedRGB.r}, ${savedRGB.g}, ${savedRGB.b})`,
        scanRGB: `rgb(${scanRGB.r || 0}, ${scanRGB.g || 0}, ${scanRGB.b || 0})`,
        maxDifference,
        threshold: 10,
        serverScanId,
        philosophy: 'skin_tone_coherence_validation'
      });
    } else {
      logger.debug('PAYLOAD_PROCESSOR', 'Skin tone coherence validated', {
        maxDifference,
        threshold: 10,
        serverScanId,
        philosophy: 'skin_tone_coherence_ok'
      });
    }
  }

  const rgb = tone?.rgb || tone;
  logger.info('PAYLOAD_PROCESSOR', 'Skin tone resolved', {
    skinToneRGB: rgb?.r !== undefined ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'unknown',
    skinToneHex: tone?.hex,
    source: source,
    confidence: tone?.confidence?.toFixed(3),
    schema: tone?.schema,
    serverScanId,
    philosophy: 'skin_tone_processing_complete'
  });

  return tone;
}

/**
 * Validate saved avatar payload structure
 */
function validateSavedAvatarPayload(payload: any): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!payload.final_shape_params || Object.keys(payload.final_shape_params).length === 0) {
    issues.push('Missing or empty final_shape_params');
  }
  
  if (!payload.final_limb_masses || Object.keys(payload.final_limb_masses).length === 0) {
    issues.push('Missing or empty final_limb_masses');
  }
  
  if (!payload.resolved_gender || !['male', 'female'].includes(payload.resolved_gender)) {
    issues.push('Missing or invalid resolved_gender');
  }
  
  if (!payload.gltf_model_id) {
    issues.push('Missing gltf_model_id');
  }
  
  if (!payload.avatar_version || payload.avatar_version !== 'v2.0') {
    issues.push('Missing or invalid avatar_version');
  }
  
  // Validate shape params are finite numbers
  if (payload.final_shape_params) {
    Object.entries(payload.final_shape_params).forEach(([key, value]) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        issues.push(`Invalid shape param ${key}: ${value}`);
      }
    });
  }
  
  // Validate limb masses are finite numbers
  if (payload.final_limb_masses) {
    Object.entries(payload.final_limb_masses).forEach(([key, value]) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        issues.push(`Invalid limb mass ${key}: ${value}`);
      }
    });
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Generate stable hash for morph data comparison
 */
function generateMorphHash(morphData: Record<string, number>): string {
  return JSON.stringify(Object.keys(morphData).sort().map(k => [k, morphData[k]]));
}

/**
 * Normalize gender format from DB enums ('masculine'/'feminine') to model format ('male'/'female')
 * CRITICAL: This ensures consistent gender format for 3D model loading
 */
function normalizeGenderFormat(gender: string): 'male' | 'female' {
  // Handle both formats:
  // - DB format: 'masculine' | 'feminine'
  // - Model format: 'male' | 'female'
  if (gender === 'feminine' || gender === 'female') {
    return 'female';
  }
  if (gender === 'masculine' || gender === 'male') {
    return 'male';
  }

  // Fallback (should never happen)
  logger.error('PAYLOAD_PROCESSOR', '🚨 CRITICAL: Unknown gender format', {
    gender,
    fallback: 'male',
    philosophy: 'gender_normalization_fallback'
  });
  return 'male';
}

/**
 * Determine final gender from multiple sources
 * CRITICAL: Always prioritize userProfile.sex as source of truth
 */
export function determineFinalGender(props: Avatar3DViewerProps): 'male' | 'female' {
  const { savedAvatarPayload, resolvedGender, userProfile, serverScanId, overrideGender } = props;

  // PRIORITY 0: Use override gender if provided
  if (overrideGender) {
    logger.info('PAYLOAD_PROCESSOR', '🎯 USING OVERRIDE GENDER (PROJECTION MODE)', {
      overrideGenderValue: overrideGender,
      overrideGenderType: typeof overrideGender,
      serverScanId,
      hasUserProfile: !!userProfile,
      userProfileSex: userProfile?.sex,
      philosophy: 'override_gender_priority'
    });
    return overrideGender;
  }

  // PRIORITY 1: CRITICAL - Use user profile gender as SOURCE OF TRUTH
  if (userProfile?.sex) {
    // CRITICAL: Normalize gender format (handle both 'male'/'female' and 'masculine'/'feminine')
    const normalizedGender = normalizeGenderFormat(userProfile.sex);
    logger.info('PAYLOAD_PROCESSOR', '🔒 CRITICAL: Using user profile sex as source of truth', {
      profileGender: userProfile.sex,
      normalizedGender,
      serverScanId,
      hasResolvedGender: !!resolvedGender,
      hasSavedAvatarGender: !!savedAvatarPayload?.resolved_gender,
      philosophy: 'user_profile_sex_absolute_priority_normalized'
    });
    return normalizedGender;
  }

  // PRIORITY 2: Use savedAvatarPayload resolved gender if available
  if (savedAvatarPayload?.resolved_gender) {
    const normalizedGender = normalizeGenderFormat(savedAvatarPayload.resolved_gender);
    logger.info('PAYLOAD_PROCESSOR', 'Using saved avatar payload resolved gender', {
      resolvedGender: savedAvatarPayload.resolved_gender,
      normalizedGender,
      avatarVersion: savedAvatarPayload.avatar_version,
      serverScanId,
      philosophy: 'saved_avatar_gender_fallback_normalized'
    });
    return normalizedGender;
  }

  // PRIORITY 3: Use explicit resolved gender from props
  if (resolvedGender) {
    const normalizedGender = normalizeGenderFormat(resolvedGender);
    logger.info('PAYLOAD_PROCESSOR', 'Using explicit resolved gender', {
      resolvedGender,
      normalizedGender,
      serverScanId,
      philosophy: 'explicit_resolved_gender_normalized'
    });
    return normalizedGender;
  }

  // PRIORITY 4: Ultimate fallback
  const fallbackGender = 'male';
  logger.error('PAYLOAD_PROCESSOR', '🚨 CRITICAL ERROR: Using fallback gender - no gender information available', {
    fallbackGender,
    serverScanId,
    reason: 'no_gender_information_available',
    hasUserProfile: !!userProfile,
    userProfileKeys: userProfile ? Object.keys(userProfile) : [],
    philosophy: 'critical_fallback_should_not_happen'
  });
  return fallbackGender;
}