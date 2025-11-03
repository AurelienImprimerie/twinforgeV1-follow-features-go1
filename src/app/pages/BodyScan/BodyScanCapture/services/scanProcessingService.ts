// src/app/pages/BodyScan/BodyScanCapture/services/scanProcessingService.ts
/**
 * Scan Processing Service
 * Handles the complete body scan processing pipeline
 *
 * REFACTORED: This file now delegates to modular services:
 * - photoUploadService: Photo upload and storage management
 * - edgeFunctionClient: Edge Function API calls
 * - aiRefinementService: AI morphological refinement
 * - scanInsightsGenerator: Insights generation
 * - scanDataExtractor: Data extraction utilities
 * - scanProcessingOrchestrator: Main pipeline orchestrator
 *
 * This file maintains backward compatibility while using the new architecture.
 */

import logger from '../../../../../lib/utils/logger';
import type { CapturedPhotoEnhanced } from '../../../../../domain/types';

// Import the new orchestrator
import { processBodyScanPipeline as processBodyScanPipelineRefactored } from './scanProcessingOrchestrator';

export interface ScanProcessingConfig {
  userId: string;
  clientScanId: string;
  capturedPhotos: CapturedPhotoEnhanced[];
  stableScanParams: {
    sex: 'male' | 'female';
    height_cm: number;
    weight_kg: number;
  };
  resolvedGender: 'masculine' | 'feminine';
}

export interface ScanProcessingResult {
  estimate: any;
  semantic: any;
  match: any;
  commit: any;
  completeResults: any;
}

/**
 * Process complete body scan pipeline
 *
 * REFACTORED: This function now delegates to the modular orchestrator
 * while maintaining the same API for backward compatibility.
 */
export async function processBodyScanPipeline(
  config: ScanProcessingConfig
): Promise<ScanProcessingResult> {
  logger.info('SCAN_PROCESSING_SERVICE', 'Delegating to refactored orchestrator', {
    clientScanId: config.clientScanId,
    userId: config.userId.substring(0, 8) + '...',
    photosCount: config.capturedPhotos.length,
    architecture: 'modular_v2'
  });

  // Delegate to the new modular orchestrator
  return await processBodyScanPipelineRefactored(config);
}

// DEPRECATED: Moved to photoUploadService.ts
// Kept for reference only

// DEPRECATED: Moved to edgeFunctionClient.ts
// Kept for reference only

// DEPRECATED: Moved to edgeFunctionClient.ts
// Kept for reference only

// DEPRECATED: Moved to edgeFunctionClient.ts
// Kept for reference only

// DEPRECATED: Moved to aiRefinementService.ts
// Kept for reference only

// DEPRECATED: Moved to edgeFunctionClient.ts
// Kept for reference only
/*
async function callScanCommit(
  userId: string,
  estimateResult: any,
  matchResult: any,
  semanticResult: any,
  capturedPhotos: CapturedPhotoEnhanced[],
  resolvedGender: 'masculine' | 'feminine',
  clientScanId: string
): Promise<{ commitResult: any; skinTone: any }> {
  logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: Starting scan-commit', {
    clientScanId,
    requestData: {
      userId,
      hasEstimateResult: !!estimateResult,
      hasMatchResult: !!matchResult,
      hasSemanticResult: !!semanticResult,
      hasAIRefinement: !!matchResult.ai_refinement
    }
  });

  // DEBUG: Log matchResult structure to identify available properties
  logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: Analyzing matchResult structure', {
    clientScanId,
    matchResultKeys: matchResult ? Object.keys(matchResult) : [],
    hasK5Envelope: !!matchResult?.k5_envelope,
    hasMorphBounds: !!matchResult?.morph_bounds,
    hasSelectedArchetypes: !!matchResult?.selected_archetypes,
    selectedArchetypesCount: matchResult?.selected_archetypes?.length || 0,
    hasAIRefinement: !!matchResult?.ai_refinement,
    philosophy: 'debug_match_result_structure'
  });

  // CRITICAL: Extract final avatar data for persistence
  const finalShapeParams = matchResult.ai_refinement?.final_shape_params ||
                          matchResult.final_shape_params ||
                          matchResult.selected_archetypes?.[0]?.morph_values || {};
  const finalLimbMasses = matchResult.ai_refinement?.final_limb_masses ||
                         matchResult.final_limb_masses ||
                         matchResult.selected_archetypes?.[0]?.limb_masses || {};

  // CRITICAL FIX: Use the V2 skin tone extractor from dataExtractors
  logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: 🔍 About to import V2 skin tone extractor', {
    clientScanId,
    philosophy: 'pre_skin_tone_extraction_import'
  });

  let skinTone;
  try {
    // Simple log to verify we reach this point
    console.log('🔍 [SKIN TONE DEBUG] Starting extraction, photos count:', capturedPhotos?.length || 0);

    const { extractSkinToneFromScanData: extractSkinToneV2 } = await import('../utils/dataExtractors');
    logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: ✅ V2 extractor imported successfully', {
      clientScanId,
      philosophy: 'extractor_import_success'
    });

    // CRITICAL FIX: Convert capturedPhotos to format expected by extractor
    // The extractor expects photos with { report: { skin_tone } }
    // capturedPhotos has { captureReport: { skin_tone } }
    const photosForExtraction = capturedPhotos.map(photo => ({
      view: photo.type,
      url: photo.url,
      report: photo.captureReport  // Map captureReport to report
    }));

    // Pass converted photos to use Priority 1 (photo capture reports with correct skin tone)
    skinTone = extractSkinToneV2(photosForExtraction, estimateResult, clientScanId);

    logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: ✅ Skin tone extracted successfully', {
      clientScanId,
      hasSkinTone: !!skinTone,
      skinToneType: typeof skinTone,
      skinToneKeys: skinTone && typeof skinTone === 'object' ? Object.keys(skinTone) : [],
      skinToneSchema: skinTone?.schema,
      skinToneRGB: skinTone?.rgb ? `rgb(${skinTone.rgb.r}, ${skinTone.rgb.g}, ${skinTone.rgb.b})` : 'unknown',
      skinToneHex: skinTone?.hex || 'unknown',
      philosophy: 'skin_tone_extraction_success'
    });
  } catch (skinToneError) {
    logger.error('SCAN_PROCESSING_SERVICE', 'Step 4: ❌ Skin tone extraction FAILED', {
      clientScanId,
      error: skinToneError instanceof Error ? skinToneError.message : String(skinToneError),
      stack: skinToneError instanceof Error ? skinToneError.stack : undefined,
      errorType: skinToneError?.constructor?.name,
      errorName: skinToneError instanceof Error ? skinToneError.name : 'unknown',
      capturedPhotosCount: capturedPhotos?.length || 0,
      hasEstimateResult: !!estimateResult,
      philosophy: 'skin_tone_extraction_fatal_error'
    });

    // Log full error to console for debugging
    console.error('🚨 [SKIN TONE EXTRACTION ERROR] Full error details:', skinToneError);

    throw skinToneError;
  }

  // CRITICAL FIX: Use k5_envelope instead of morph_bounds
  // scan-match returns k5_envelope, not morph_bounds
  const k5Envelope = matchResult.k5_envelope || null;

  logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: Building commit request', {
    clientScanId,
    hasFinalShapeParams: !!finalShapeParams,
    finalShapeParamsCount: Object.keys(finalShapeParams).length,
    finalShapeParamsKeys: Object.keys(finalShapeParams).slice(0, 5),
    hasFinalLimbMasses: !!finalLimbMasses,
    finalLimbMassesCount: Object.keys(finalLimbMasses).length,
    finalLimbMassesKeys: Object.keys(finalLimbMasses),
    hasSkinTone: !!skinTone,
    hasK5Envelope: !!k5Envelope,
    hasAIRefinement: !!matchResult.ai_refinement,
    aiRefined: !!matchResult.ai_refinement?.ai_refine,
    philosophy: 'pre_commit_request_construction_v2'
  });

  const commitRequest = {
    user_id: userId,
    resolvedGender,
    estimate_result: estimateResult,
    match_result: matchResult,
    morph_bounds: k5Envelope, // FIXED: Use k5_envelope from matchResult
    semantic_result: semanticResult,
    ai_refinement_result: matchResult.ai_refinement,
    validation_metadata: {},
    temporal_analysis: {},
    smoothing_metadata: {},
    visionfit_result: {},
    photos_metadata: capturedPhotos.map(photo => ({
      type: photo.type,
      captureReport: photo.captureReport
    })),
    // CRITICAL: Include complete avatar data for server persistence
    final_shape_params: finalShapeParams,
    final_limb_masses: finalLimbMasses,
    skin_tone: skinTone,
    resolved_gender: resolvedGender,
    mapping_version: 'v1.0',
    gltf_model_id: `${resolvedGender}_v4.13`,
    material_config_version: 'pbr-v2',
    avatar_version: 'v2.0',
    clientScanId
  };

  // CRITICAL: Log the complete commit request structure AND skin tone details before sending
  logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: Complete commit request prepared', {
    clientScanId,
    requestKeys: Object.keys(commitRequest),
    finalDataSummary: {
      finalShapeParamsCount: Object.keys(finalShapeParams).length,
      finalLimbMassesCount: Object.keys(finalLimbMasses).length,
      skinTonePresent: !!skinTone,
      aiRefinementPresent: !!matchResult.ai_refinement,
      aiRefine: matchResult.ai_refinement?.ai_refine || false,
      k5EnvelopePresent: !!k5Envelope
    },
    philosophy: 'commit_request_structure_audit_v2'
  });

  // CRITICAL: Log complete skin tone structure before sending to scan-commit
  logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: 🎨 SKIN TONE BEFORE COMMIT', {
    clientScanId,
    skinToneComplete: skinTone,
    skinToneKeys: skinTone && typeof skinTone === 'object' ? Object.keys(skinTone) : [],
    skinToneSchema: skinTone?.schema,
    skinToneRGB: skinTone?.rgb,
    skinToneHex: skinTone?.hex,
    skinToneSource: skinTone?.source,
    skinToneConfidence: skinTone?.confidence,
    philosophy: 'CRITICAL_SKIN_TONE_AUDIT_BEFORE_COMMIT'
  });

  try {
    logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: Complete avatar data prepared for commit', {
      clientScanId,
      finalShapeParamsCount: Object.keys(finalShapeParams).length,
      finalLimbMassesCount: Object.keys(finalLimbMasses).length,
      hasSkinTone: !!skinTone,
      skinToneType: typeof skinTone,
      skinToneKeys: skinTone && typeof skinTone === 'object' ? Object.keys(skinTone) : [],
      skinToneV2: skinTone && skinTone.rgb ? {
        rgb: `rgb(${skinTone.rgb.r}, ${skinTone.rgb.g}, ${skinTone.rgb.b})`,
        hex: skinTone.hex,
        schema: skinTone.schema,
        source: skinTone.source,
        confidence: skinTone.confidence
      } : 'invalid_or_missing',
      skinToneRaw: JSON.stringify(skinTone),
      resolvedGender,
      philosophy: 'complete_avatar_data_v2_for_server_persistence'
    });
  } catch (logError) {
    logger.error('SCAN_PROCESSING_SERVICE', 'Failed to log skin tone structure', {
      clientScanId,
      error: logError instanceof Error ? logError.message : String(logError),
      skinToneType: typeof skinTone,
      skinToneStringified: String(skinTone)
    });
  }

  logger.info('SCAN_PROCESSING_SERVICE', '🚨 CRITICAL: About to call bodyScanRepo.commit', {
    clientScanId,
    requestKeys: Object.keys(commitRequest),
    requestSummary: {
      user_id: commitRequest.user_id?.substring(0, 8) + '...',
      resolved_gender: commitRequest.resolvedGender,
      has_final_shape_params: !!commitRequest.final_shape_params,
      final_shape_params_count: commitRequest.final_shape_params ? Object.keys(commitRequest.final_shape_params).length : 0,
      has_final_limb_masses: !!commitRequest.final_limb_masses,
      final_limb_masses_count: commitRequest.final_limb_masses ? Object.keys(commitRequest.final_limb_masses).length : 0,
      has_skin_tone: !!commitRequest.skin_tone,
      skin_tone_type: typeof commitRequest.skin_tone,
      skin_tone_preview: commitRequest.skin_tone && typeof commitRequest.skin_tone === 'object' ? {
        has_rgb: !!commitRequest.skin_tone.rgb,
        has_hex: !!commitRequest.skin_tone.hex,
        has_schema: !!commitRequest.skin_tone.schema,
        schema_value: commitRequest.skin_tone.schema
      } : 'not_object'
    },
    philosophy: 'pre_commit_call_audit'
  });

  let commitResult;
  try {
    commitResult = await bodyScanRepo.commit(commitRequest);
    logger.info('SCAN_PROCESSING_SERVICE', '✅ bodyScanRepo.commit returned successfully', {
      clientScanId,
      hasResult: !!commitResult,
      resultKeys: commitResult ? Object.keys(commitResult) : []
    });
  } catch (commitError) {
    logger.error('SCAN_PROCESSING_SERVICE', '❌ bodyScanRepo.commit threw error', {
      clientScanId,
      error: commitError instanceof Error ? commitError.message : String(commitError),
      stack: commitError instanceof Error ? commitError.stack : undefined,
      errorType: commitError?.constructor?.name || typeof commitError
    });
    throw commitError;
  }

  logger.info('SCAN_PROCESSING_SERVICE', 'Step 4: scan-commit completed', {
    clientScanId,
    serverScanId: commitResult.scan_id,
    commitSuccess: !!commitResult.success,
    processingComplete: !!commitResult.processing_complete
  });

  // Return both commitResult and skinTone for use in buildCompleteResults
  return { commitResult, skinTone };
}
*/

// DEPRECATED: Moved to scanProcessingOrchestrator.ts
// Kept for reference only

// DEPRECATED: Moved to scanInsightsGenerator.ts
// Kept for reference only

/**
 * DEPRECATED: This function has been replaced by the V2 version in dataExtractors.ts
 * Kept as emergency fallback only if pre-extracted skin tone is not available
 * @deprecated Use extractSkinToneFromScanData from dataExtractors.ts instead
 */
function extractSkinToneFromScanData(
  uploadedPhotos: any[],
  estimateResult: any,
  clientScanId: string
): { r: number; g: number; b: number; confidence?: number } {
  logger.warn('SKIN_TONE_EXTRACTION_DEPRECATED', 'Using deprecated skin tone extraction - should use V2 from dataExtractors', {
    clientScanId,
    uploadedPhotosCount: uploadedPhotos?.length || 0,
    hasEstimateResult: !!estimateResult,
    philosophy: 'emergency_fallback_only'
  });

  // Priority 1: From estimate extracted_data (Vision AI)
  const extractedSkinTone = estimateResult?.extracted_data?.skin_tone;

  // Check for V2 format
  if (extractedSkinTone?.schema === 'v2' && extractedSkinTone?.rgb) {
    logger.info('SKIN_TONE_EXTRACTION_DEPRECATED', 'Found V2 skin tone from Vision AI', {
      clientScanId,
      skinTone: `rgb(${extractedSkinTone.rgb.r}, ${extractedSkinTone.rgb.g}, ${extractedSkinTone.rgb.b})`,
      confidence: extractedSkinTone.confidence || 'unknown',
      source: 'estimate_extracted_data_v2'
    });
    return {
      r: extractedSkinTone.rgb.r,
      g: extractedSkinTone.rgb.g,
      b: extractedSkinTone.rgb.b,
      confidence: extractedSkinTone.confidence
    };
  }

  // Check for legacy format
  if (extractedSkinTone && typeof extractedSkinTone === 'object' &&
      typeof extractedSkinTone.r === 'number' && typeof extractedSkinTone.g === 'number' && typeof extractedSkinTone.b === 'number') {
    logger.info('SKIN_TONE_EXTRACTION_DEPRECATED', 'Found legacy skin tone from Vision AI', {
      clientScanId,
      skinTone: `rgb(${extractedSkinTone.r}, ${extractedSkinTone.g}, ${extractedSkinTone.b})`,
      confidence: extractedSkinTone.confidence || 'unknown',
      source: 'estimate_extracted_data_legacy'
    });
    return extractedSkinTone;
  }

  // Emergency fallback
  const fallbackSkinTone = { r: 153, g: 108, b: 78, confidence: 0.5 };
  logger.error('SKIN_TONE_EXTRACTION_DEPRECATED', 'Using emergency fallback - this should not happen', {
    clientScanId,
    fallbackSkinTone: `rgb(${fallbackSkinTone.r}, ${fallbackSkinTone.g}, ${fallbackSkinTone.b})`,
    reason: 'no_valid_skin_tone_found_in_scan_data',
    source: 'emergency_fallback'
  });

  return fallbackSkinTone;
}

// DEPRECATED: Moved to scanDataExtractor.ts
// Kept for reference only
/*
function extractLimbMassesFromScanData(
  matchResult: any,
  estimateResult: any,
  clientScanId: string
): Record<string, number> {
  logger.info('LIMB_MASSES_EXTRACTION', 'Starting limb masses extraction from scan data', {
    clientScanId,
    hasMatchResult: !!matchResult,
    hasEstimateResult: !!estimateResult,
    matchResultKeys: matchResult ? Object.keys(matchResult) : []
  });

  // Priority 1: From match result blended limb masses
  const blendedLimbMasses = matchResult?.blended_limb_masses || 
                           matchResult?.advanced_matching?.blending?.blended_limb_masses;

  if (blendedLimbMasses && typeof blendedLimbMasses === 'object' && Object.keys(blendedLimbMasses).length > 0) {
    logger.info('LIMB_MASSES_EXTRACTION', 'Found limb masses from match result blending', {
      clientScanId,
      limbMassesKeys: Object.keys(blendedLimbMasses),
      sampleValues: Object.entries(blendedLimbMasses).slice(0, 3).map(([k, v]) => ({ key: k, value: v })),
      source: 'match_result_blended'
    });
    return blendedLimbMasses;
  }

  // Priority 2: From selected archetypes (use primary archetype)
  const selectedArchetypes = matchResult?.selected_archetypes;
  if (selectedArchetypes && Array.isArray(selectedArchetypes) && selectedArchetypes.length > 0) {
    const primaryArchetype = selectedArchetypes[0];
    const archetypeLimbMasses = primaryArchetype?.limb_masses;

    if (archetypeLimbMasses && typeof archetypeLimbMasses === 'object' && Object.keys(archetypeLimbMasses).length > 0) {
      logger.info('LIMB_MASSES_EXTRACTION', 'Found limb masses from primary archetype', {
        clientScanId,
        archetypeId: primaryArchetype.id,
        archetypeName: primaryArchetype.name,
        limbMassesKeys: Object.keys(archetypeLimbMasses),
        sampleValues: Object.entries(archetypeLimbMasses).slice(0, 3).map(([k, v]) => ({ key: k, value: v })),
        source: 'primary_archetype'
      });
      return archetypeLimbMasses;
    }
  }

  // Fallback: Generate intelligent limb masses
  return generateIntelligentLimbMassesFallback(estimateResult, clientScanId);
}
*/

// DEPRECATED: Helper function - moved to scanDataExtractor.ts
// Kept for reference only
/*
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
    forearmMass: 1.0 + (bmiFactor - 1.0) * 0.25 + (fatFactor - 1.0) * 0.15,
  };

  // Clamp to reasonable ranges
  Object.keys(intelligentLimbMasses).forEach(key => {
    if (key !== 'gate') {
      intelligentLimbMasses[key] = Math.max(0.6, Math.min(1.6, intelligentLimbMasses[key]));
    }
  });

  logger.info('LIMB_MASSES_EXTRACTION', 'Generated intelligent limb masses fallback', {
    clientScanId,
    estimatedBMI: estimatedBMI.toFixed(2),
    bodyFatPerc: bodyFatPerc.toFixed(1),
    bmiFactor: bmiFactor.toFixed(3),
    fatFactor: fatFactor.toFixed(3),
    generatedMasses: Object.entries(intelligentLimbMasses).map(([k, v]) => ({ key: k, value: v.toFixed(3) }))
  });

  return intelligentLimbMasses;
}
*/
