// src/app/pages/BodyScan/BodyScanCapture/services/edgeFunctionClient.ts
/**
 * Edge Function Client
 * Centralized API client for scan-related Edge Functions
 */

import { bodyScanRepo } from '../../../../../system/data/repositories/bodyScanRepo';
import logger from '../../../../../lib/utils/logger';
import type { UploadedPhoto } from './photoUploadService';

interface ScanParams {
  sex: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
}

/**
 * Call scan-estimate Edge Function
 */
export async function callScanEstimate(
  userId: string,
  uploadedPhotos: UploadedPhoto[],
  stableScanParams: ScanParams,
  resolvedGender: 'masculine' | 'feminine',
  clientScanId: string
) {
  logger.info('EDGE_FUNCTION_CLIENT', 'Calling scan-estimate', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    photosCount: uploadedPhotos.length,
    userMetrics: stableScanParams
  });

  const estimateRequest = {
    user_id: userId,
    photos: uploadedPhotos,
    user_declared_height_cm: stableScanParams.height_cm,
    user_declared_weight_kg: stableScanParams.weight_kg,
    user_declared_gender: resolvedGender,
    clientScanId,
    resolvedGender
  };

  const estimateResult = await bodyScanRepo.estimate(estimateRequest);

  logger.info('EDGE_FUNCTION_CLIENT', 'scan-estimate completed', {
    clientScanId,
    hasExtractedData: !!estimateResult.extracted_data,
    confidence: estimateResult.extracted_data?.processing_confidence,
    hasSkinTone: !!estimateResult.extracted_data?.skin_tone,
    measurementsKeys: estimateResult.extracted_data?.raw_measurements
      ? Object.keys(estimateResult.extracted_data.raw_measurements)
      : []
  });

  return estimateResult;
}

/**
 * Call scan-semantic Edge Function
 */
export async function callScanSemantic(
  userId: string,
  uploadedPhotos: UploadedPhoto[],
  estimateResult: any,
  resolvedGender: 'masculine' | 'feminine',
  clientScanId: string
) {
  logger.info('EDGE_FUNCTION_CLIENT', 'Calling scan-semantic', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    hasExtractedData: !!estimateResult.extracted_data,
    estimatedBMI: estimateResult.extracted_data?.estimated_bmi
  });

  const semanticRequest = {
    user_id: userId,
    photos: uploadedPhotos,
    extracted_data: estimateResult.extracted_data,
    user_declared_gender: resolvedGender,
    clientScanId,
    resolvedGender
  };

  const semanticResult = await bodyScanRepo.semantic(semanticRequest);

  logger.info('EDGE_FUNCTION_CLIENT', 'scan-semantic completed', {
    clientScanId,
    hasSemanticProfile: !!semanticResult.semantic_profile,
    semanticConfidence: semanticResult.semantic_confidence,
    adjustmentsMade: semanticResult.adjustments_made?.length || 0,
    semanticClasses: semanticResult.semantic_profile
      ? {
          obesity: semanticResult.semantic_profile.obesity,
          muscularity: semanticResult.semantic_profile.muscularity,
          level: semanticResult.semantic_profile.level,
          morphotype: semanticResult.semantic_profile.morphotype
        }
      : null
  });

  return semanticResult;
}

/**
 * Call scan-match Edge Function
 */
export async function callScanMatch(
  userId: string,
  estimateResult: any,
  semanticResult: any,
  resolvedGender: 'masculine' | 'feminine',
  clientScanId: string
) {
  logger.info('EDGE_FUNCTION_CLIENT', 'Calling scan-match', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    userBMICalculated: estimateResult.extracted_data?.estimated_bmi,
    semanticClassification: {
      obesity: semanticResult.semantic_profile?.obesity,
      muscularity: semanticResult.semantic_profile?.muscularity,
      level: semanticResult.semantic_profile?.level,
      morphotype: semanticResult.semantic_profile?.morphotype
    }
  });

  const matchRequest = {
    user_id: userId,
    extracted_data: estimateResult.extracted_data,
    semantic_profile: semanticResult.semantic_profile,
    user_semantic_indices: {
      morph_index: semanticResult.semantic_profile.morph_index || 0,
      muscle_index: semanticResult.semantic_profile.muscle_index || 0
    },
    matching_config: {
      gender: resolvedGender,
      limit: 5
    },
    clientScanId,
    resolvedGender
  };

  const matchResult = await bodyScanRepo.match(matchRequest);

  logger.info('EDGE_FUNCTION_CLIENT', 'scan-match completed', {
    clientScanId,
    selectedArchetypesCount: matchResult.selected_archetypes?.length || 0,
    strategyUsed: matchResult.strategy_used,
    semanticCoherenceScore: matchResult.semantic_coherence_score
  });

  return matchResult;
}

/**
 * Call scan-commit Edge Function
 */
export async function callScanCommit(
  userId: string,
  estimateResult: any,
  matchResult: any,
  semanticResult: any,
  capturedPhotos: any[],
  resolvedGender: 'masculine' | 'feminine',
  clientScanId: string,
  skinTone: any
): Promise<any> {
  logger.info('EDGE_FUNCTION_CLIENT', 'Calling scan-commit', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    hasEstimateResult: !!estimateResult,
    hasMatchResult: !!matchResult,
    hasSemanticResult: !!semanticResult,
    hasAIRefinement: !!matchResult.ai_refinement,
    hasSkinTone: !!skinTone
  });

  // Extract final avatar data for persistence
  const finalShapeParams =
    matchResult.ai_refinement?.final_shape_params ||
    matchResult.final_shape_params ||
    matchResult.selected_archetypes?.[0]?.morph_values ||
    {};

  const finalLimbMasses =
    matchResult.ai_refinement?.final_limb_masses ||
    matchResult.final_limb_masses ||
    matchResult.selected_archetypes?.[0]?.limb_masses ||
    {};

  const k5Envelope = matchResult.k5_envelope || null;

  const commitRequest = {
    user_id: userId,
    resolvedGender,
    estimate_result: estimateResult,
    match_result: matchResult,
    morph_bounds: k5Envelope,
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

  logger.info('EDGE_FUNCTION_CLIENT', 'Commit request prepared', {
    clientScanId,
    finalShapeParamsCount: Object.keys(finalShapeParams).length,
    finalLimbMassesCount: Object.keys(finalLimbMasses).length,
    hasSkinTone: !!skinTone,
    skinToneSchema: skinTone?.schema,
    hasK5Envelope: !!k5Envelope
  });

  const commitResult = await bodyScanRepo.commit(commitRequest);

  logger.info('EDGE_FUNCTION_CLIENT', 'scan-commit completed', {
    clientScanId,
    serverScanId: commitResult.scan_id,
    commitSuccess: !!commitResult.success,
    processingComplete: !!commitResult.processing_complete
  });

  return commitResult;
}
