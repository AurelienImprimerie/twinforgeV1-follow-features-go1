// src/app/pages/BodyScan/BodyScanCapture/utils/dataExtractors.ts
import logger from '../../../../../lib/utils/logger';
import { createCompleteSkinTone, type SkinToneV2 } from '../../../../../lib/scan/normalizeSkinTone';

/**
 * Extract skin tone from Vision AI analysis ONLY
 * Single authoritative source with intelligent lighting compensation
 * Returns V2 format compatible with database schema
 */
function extractSkinToneFromScanData(
  uploadedPhotos: any[],
  estimateResult: any,
  clientScanId: string
): SkinToneV2 {
  logger.info('DATA_EXTRACTORS', 'Extracting skin tone from Vision AI analysis', {
    clientScanId,
    hasEstimateResult: !!estimateResult,
    hasExtractedData: !!estimateResult?.extracted_data,
    philosophy: 'vision_ai_exclusive_extraction'
  });

  // EXCLUSIVE SOURCE: Vision AI analysis from scan-estimate
  const extractedSkinTone = estimateResult?.extracted_data?.skin_tone;

  if (extractedSkinTone && typeof extractedSkinTone === 'object') {
    // Check if it's already in V2 format
    if (extractedSkinTone.schema === 'v2' && extractedSkinTone.rgb) {
      logger.info('DATA_EXTRACTORS', 'Found V2 skin tone from Vision AI', {
        clientScanId,
        skinTone: `rgb(${extractedSkinTone.rgb.r}, ${extractedSkinTone.rgb.g}, ${extractedSkinTone.rgb.b})`,
        hex: extractedSkinTone.hex,
        confidence: extractedSkinTone.confidence,
        source: extractedSkinTone.source || 'vision_ai'
      });
      return extractedSkinTone as SkinToneV2;
    }

    // Legacy format - convert to V2
    if (typeof extractedSkinTone.r === 'number' &&
        typeof extractedSkinTone.g === 'number' &&
        typeof extractedSkinTone.b === 'number') {
      logger.info('DATA_EXTRACTORS', 'Converting legacy Vision AI skin tone to V2', {
        clientScanId,
        skinTone: `rgb(${extractedSkinTone.r}, ${extractedSkinTone.g}, ${extractedSkinTone.b})`,
        confidence: extractedSkinTone.confidence || 0.85
      });

      return createCompleteSkinTone(
        extractedSkinTone.r,
        extractedSkinTone.g,
        extractedSkinTone.b,
        'vision_ai_analysis',
        extractedSkinTone.confidence || 0.85,
        extractedSkinTone.pixelCount
      );
    }
  }

  // Critical: Vision AI should ALWAYS provide skin tone
  logger.error('DATA_EXTRACTORS', 'Vision AI failed to provide skin tone - this should not happen', {
    clientScanId,
    hasEstimateResult: !!estimateResult,
    hasExtractedData: !!estimateResult?.extracted_data,
    extractedSkinToneType: typeof extractedSkinTone,
    philosophy: 'vision_ai_extraction_failure'
  });

  // Emergency fallback - should trigger investigation
  return createCompleteSkinTone(
    153, 108, 78,
    'emergency_fallback',
    0.3
  );
}

/**
 * Extract limb masses from scan data with fallback strategy
 */
function extractLimbMassesFromScanData(
  matchResult: any,
  estimateResult: any,
  clientScanId: string
): Record<string, number> {
  logger.info('DATA_EXTRACTORS', 'Starting limb masses extraction from scan data', {
    clientScanId,
    hasMatchResult: !!matchResult,
    hasEstimateResult: !!estimateResult,
    matchResultKeys: matchResult ? Object.keys(matchResult) : []
  });

  // Priority 1: From match result limb masses
  if (matchResult?.limb_masses && typeof matchResult.limb_masses === 'object') {
    logger.info('DATA_EXTRACTORS', 'Found limb masses from match result', {
      clientScanId,
      limbMassesKeys: Object.keys(matchResult.limb_masses),
      source: 'match_result_limb_masses'
    });
    return matchResult.limb_masses;
  }

  // Priority 2: From estimate result limb masses
  if (estimateResult?.limb_masses && typeof estimateResult.limb_masses === 'object') {
    logger.info('DATA_EXTRACTORS', 'Found limb masses from estimate result', {
      clientScanId,
      limbMassesKeys: Object.keys(estimateResult.limb_masses),
      source: 'estimate_result_limb_masses'
    });
    return estimateResult.limb_masses;
  }

  // Fallback: Use default limb masses
  const fallbackLimbMasses = {
    armMass: 1.0,
    legMass: 1.0,
    torsoMass: 1.0,
    neckMass: 1.0,
    headMass: 1.0
  };
  
  logger.warn('DATA_EXTRACTORS', 'Using fallback limb masses', {
    clientScanId,
    fallbackLimbMasses,
    reason: 'no_valid_limb_masses_found_in_scan_data',
    source: 'fallback'
  });

  return fallbackLimbMasses;
}

/**
 * Extract user profile data from scan sources with fallback strategy
 * Returns the expected format for scan processing: { sex: 'male' | 'female', height_cm, weight_kg }
 */
function extractUserProfileFromSources(
  profile: any,
  scanResults?: any,
): { sex: 'male' | 'female'; height_cm: number; weight_kg: number } | undefined {
  logger.info('DATA_EXTRACTORS', 'Starting user profile extraction from sources', {
    hasProfile: !!profile,
    profileKeys: profile ? Object.keys(profile) : [],
    source: 'user_profile_extraction'
  });

  // Validate that profile has required fields
  if (!profile?.sex || !profile?.height_cm || !profile?.weight_kg) {
    logger.warn('DATA_EXTRACTORS', 'Profile incomplete - missing required fields', {
      hasSex: !!profile?.sex,
      hasHeight: !!profile?.height_cm,
      hasWeight: !!profile?.weight_kg,
      source: 'user_profile_extraction'
    });
    return undefined;
  }

  const extractedProfile = {
    sex: profile.sex as 'male' | 'female',
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg
  };

  logger.info('DATA_EXTRACTORS', 'User profile extracted from sources', {
    extractedProfile,
    source: 'user_profile_extraction'
  });

  return extractedProfile;
}

/**
 * Resolve gender from scan sources with fallback strategy
 * Returns 'masculine' or 'feminine' for consistency with DB enums.
 */
function resolveGenderFromSources(
  profile: any,
  scanResults: any, // This parameter is not used in this function, but kept for signature consistency
  debug: boolean, // This parameter is not used in this function, but kept for signature consistency
  clientScanId: string // This parameter is not used in this function, but kept for signature consistency
): 'masculine' | 'feminine' {
  logger.info('DATA_EXTRACTORS', 'Starting gender resolution from sources', {
    hasProfile: !!profile,
    profileSex: profile?.sex,
    source: 'gender_resolution'
  });

  // Priority 1: From user profile sex
  if (profile?.sex) {
    // Ensure the returned value is 'masculine' or 'feminine'
    const resolvedGender = profile.sex === 'male' ? 'masculine' : 'feminine';
    logger.info('DATA_EXTRACTORS', 'Gender resolved from user profile', {
      profileSex: profile.sex,
      resolvedGender,
      source: 'user_profile_sex'
    });
    return resolvedGender;
  }

  // Fallback: Default to masculine
  const fallbackGender = 'masculine';
  logger.warn('DATA_EXTRACTORS', 'Using fallback gender', {
    fallbackGender,
    reason: 'no_valid_sex_found_in_profile',
    source: 'fallback'
  });

  return fallbackGender;
}

export { 
  extractSkinToneFromScanData, 
  extractLimbMassesFromScanData,
  extractUserProfileFromSources,
  resolveGenderFromSources
};

