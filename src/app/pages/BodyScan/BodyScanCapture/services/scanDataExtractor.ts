// src/app/pages/BodyScan/BodyScanCapture/services/scanDataExtractor.ts
/**
 * Scan Data Extractor
 * Extracts specific data from scan results with fallback strategies
 */

import logger from '../../../../../lib/utils/logger';

/**
 * Extract limb masses from scan data with detailed logging and fallback strategy
 */
export function extractLimbMassesFromScanData(
  matchResult: any,
  estimateResult: any,
  clientScanId: string
): Record<string, number> {
  logger.info('SCAN_DATA_EXTRACTOR', 'Starting limb masses extraction from scan data', {
    clientScanId,
    hasMatchResult: !!matchResult,
    hasEstimateResult: !!estimateResult,
    matchResultKeys: matchResult ? Object.keys(matchResult) : []
  });

  // Priority 1: From match result blended limb masses
  const blendedLimbMasses =
    matchResult?.blended_limb_masses ||
    matchResult?.advanced_matching?.blending?.blended_limb_masses;

  if (
    blendedLimbMasses &&
    typeof blendedLimbMasses === 'object' &&
    Object.keys(blendedLimbMasses).length > 0
  ) {
    logger.info('SCAN_DATA_EXTRACTOR', 'Found limb masses from match result blending', {
      clientScanId,
      limbMassesKeys: Object.keys(blendedLimbMasses),
      sampleValues: Object.entries(blendedLimbMasses)
        .slice(0, 3)
        .map(([k, v]) => ({ key: k, value: v })),
      source: 'match_result_blended'
    });
    return blendedLimbMasses;
  }

  // Priority 2: From AI refinement final limb masses
  const aiLimbMasses = matchResult?.ai_refinement?.final_limb_masses;

  if (aiLimbMasses && typeof aiLimbMasses === 'object' && Object.keys(aiLimbMasses).length > 0) {
    logger.info('SCAN_DATA_EXTRACTOR', 'Found limb masses from AI refinement', {
      clientScanId,
      limbMassesKeys: Object.keys(aiLimbMasses),
      sampleValues: Object.entries(aiLimbMasses)
        .slice(0, 3)
        .map(([k, v]) => ({ key: k, value: v })),
      source: 'ai_refinement'
    });
    return aiLimbMasses;
  }

  // Priority 3: From selected archetypes (use primary archetype)
  const selectedArchetypes = matchResult?.selected_archetypes;
  if (selectedArchetypes && Array.isArray(selectedArchetypes) && selectedArchetypes.length > 0) {
    const primaryArchetype = selectedArchetypes[0];
    const archetypeLimbMasses = primaryArchetype?.limb_masses;

    if (
      archetypeLimbMasses &&
      typeof archetypeLimbMasses === 'object' &&
      Object.keys(archetypeLimbMasses).length > 0
    ) {
      logger.info('SCAN_DATA_EXTRACTOR', 'Found limb masses from primary archetype', {
        clientScanId,
        archetypeId: primaryArchetype.id,
        archetypeName: primaryArchetype.name,
        limbMassesKeys: Object.keys(archetypeLimbMasses),
        sampleValues: Object.entries(archetypeLimbMasses)
          .slice(0, 3)
          .map(([k, v]) => ({ key: k, value: v })),
        source: 'primary_archetype'
      });
      return archetypeLimbMasses;
    }
  }

  // Fallback: Generate intelligent limb masses
  return generateIntelligentLimbMassesFallback(estimateResult, clientScanId);
}

/**
 * Generate intelligent limb masses fallback based on anthropometric data
 */
function generateIntelligentLimbMassesFallback(
  estimateResult: any,
  clientScanId: string
): Record<string, number> {
  const estimatedBMI = estimateResult?.extracted_data?.estimated_bmi || 22;
  const bodyFatPerc = estimateResult?.extracted_data?.estimated_body_fat_perc || 15;

  // Calculate BMI factor for limb mass variation
  const bmiFactor = Math.max(0.7, Math.min(1.4, estimatedBMI / 22));
  const fatFactor = Math.max(0.8, Math.min(1.3, bodyFatPerc / 15));

  // Generate varied limb masses based on anthropometric data
  const intelligentLimbMasses = {
    gate: 1.0,
    armMass: 1.0 + (bmiFactor - 1.0) * 0.3 + (fatFactor - 1.0) * 0.2,
    calfMass: 1.0 + (bmiFactor - 1.0) * 0.25 + (fatFactor - 1.0) * 0.15,
    neckMass: 1.0 + (bmiFactor - 1.0) * 0.2 + (fatFactor - 1.0) * 0.1,
    thighMass: 1.0 + (bmiFactor - 1.0) * 0.4 + (fatFactor - 1.0) * 0.3,
    torsoMass: 1.0 + (bmiFactor - 1.0) * 0.5 + (fatFactor - 1.0) * 0.4,
    forearmMass: 1.0 + (bmiFactor - 1.0) * 0.25 + (fatFactor - 1.0) * 0.15
  };

  // Clamp to reasonable ranges
  Object.keys(intelligentLimbMasses).forEach(key => {
    if (key !== 'gate') {
      intelligentLimbMasses[key] = Math.max(
        0.6,
        Math.min(1.6, intelligentLimbMasses[key])
      );
    }
  });

  logger.info('SCAN_DATA_EXTRACTOR', 'Generated intelligent limb masses fallback', {
    clientScanId,
    estimatedBMI: estimatedBMI.toFixed(2),
    bodyFatPerc: bodyFatPerc.toFixed(1),
    bmiFactor: bmiFactor.toFixed(3),
    fatFactor: fatFactor.toFixed(3),
    generatedMasses: Object.entries(intelligentLimbMasses).map(([k, v]) => ({
      key: k,
      value: v.toFixed(3)
    })),
    source: 'intelligent_fallback'
  });

  return intelligentLimbMasses;
}

/**
 * Extract measurement data from estimate result
 */
export function extractMeasurements(estimateResult: any): {
  waist_cm?: number;
  chest_cm?: number;
  hips_cm?: number;
  estimated_bmi?: number;
} {
  const rawMeasurements = estimateResult?.extracted_data?.raw_measurements || {};
  const estimatedBMI = estimateResult?.extracted_data?.estimated_bmi;

  return {
    waist_cm: rawMeasurements.waist_cm,
    chest_cm: rawMeasurements.chest_cm,
    hips_cm: rawMeasurements.hips_cm,
    estimated_bmi: estimatedBMI
  };
}

/**
 * Extract semantic profile data
 */
export function extractSemanticProfile(semanticResult: any): {
  obesity?: string;
  muscularity?: string;
  level?: string;
  morphotype?: string;
  morph_index?: number;
  muscle_index?: number;
} {
  const semanticProfile = semanticResult?.semantic_profile || {};

  return {
    obesity: semanticProfile.obesity,
    muscularity: semanticProfile.muscularity,
    level: semanticProfile.level,
    morphotype: semanticProfile.morphotype,
    morph_index: semanticProfile.morph_index,
    muscle_index: semanticProfile.muscle_index
  };
}

/**
 * Extract archetype information
 */
export function extractArchetypeInfo(matchResult: any): {
  primaryArchetypeName?: string;
  archetypeCount?: number;
  strategyUsed?: string;
} {
  const selectedArchetypes = matchResult?.selected_archetypes || [];

  return {
    primaryArchetypeName: selectedArchetypes[0]?.name,
    archetypeCount: selectedArchetypes.length,
    strategyUsed: matchResult?.strategy_used
  };
}
