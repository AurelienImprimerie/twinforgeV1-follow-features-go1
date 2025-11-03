// src/app/pages/BodyScan/BodyScanCapture/services/aiRefinementService.ts
/**
 * AI Refinement Service
 * Handles AI morphological refinement of body scan results
 */

import { bodyScanRepo } from '../../../../../system/data/repositories/bodyScanRepo';
import logger from '../../../../../lib/utils/logger';
import type { UploadedPhoto } from './photoUploadService';

interface ScanParams {
  sex: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
}

interface AIRefinementResult {
  ai_refine: boolean;
  final_shape_params?: Record<string, number>;
  final_limb_masses?: Record<string, number>;
  ai_confidence?: number;
  refinement_deltas?: any;
  clamped_keys?: string[];
  out_of_range_count?: number;
  active_keys_count?: number;
  error?: string;
  fallback_used?: boolean;
}

/**
 * Perform AI morphological refinement
 */
export async function performAIRefinement(
  matchResult: any,
  uploadedPhotos: UploadedPhoto[],
  estimateResult: any,
  semanticResult: any,
  stableScanParams: ScanParams,
  resolvedGender: 'masculine' | 'feminine',
  clientScanId: string,
  userId: string
): Promise<any> {
  logger.info('AI_REFINEMENT_SERVICE', 'Starting AI morphological refinement', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    resolvedGender,
    mappingVersion: 'v1.0',
    blendShapeParamsCount: Object.keys(
      matchResult.selected_archetypes?.[0]?.morph_values || {}
    ).length
  });

  // Prepare photos for AI refinement
  const photosForAI = uploadedPhotos.map(photo => ({
    view: photo.view,
    url: photo.url,
    report: photo.report
  }));

  // Extract blend data
  const blendShapeParams = matchResult.selected_archetypes?.[0]?.morph_values || {};
  const blendLimbMasses = matchResult.selected_archetypes?.[0]?.limb_masses || {};

  // Prepare user measurements for AI guidance
  const userMeasurements = {
    height_cm: stableScanParams.height_cm,
    weight_kg: stableScanParams.weight_kg,
    estimated_bmi:
      estimateResult.extracted_data?.estimated_bmi ||
      stableScanParams.weight_kg / Math.pow(stableScanParams.height_cm / 100, 2),
    raw_measurements: {
      waist_cm: estimateResult.extracted_data?.raw_measurements?.waist_cm || 80,
      chest_cm: estimateResult.extracted_data?.raw_measurements?.chest_cm || 95,
      hips_cm: estimateResult.extracted_data?.raw_measurements?.hips_cm || 100
    }
  };

  let aiRefinementResult: AIRefinementResult;

  try {
    aiRefinementResult = await bodyScanRepo.refine({
      scan_id: clientScanId,
      user_id: userId,
      resolvedGender: resolvedGender,
      photos: photosForAI,
      blend_shape_params: blendShapeParams,
      blend_limb_masses: blendLimbMasses,
      k5_envelope: matchResult.k5_envelope,
      vision_classification: semanticResult.semantic_profile,
      mapping_version: 'v1.0',
      user_measurements: userMeasurements
    });

    logger.info('AI_REFINEMENT_SERVICE', 'AI refinement completed successfully', {
      clientScanId,
      resolvedGender,
      aiRefine: aiRefinementResult.ai_refine,
      finalShapeParamsCount: Object.keys(aiRefinementResult.final_shape_params || {}).length,
      finalLimbMassesCount: Object.keys(aiRefinementResult.final_limb_masses || {}).length,
      clampedKeysCount: aiRefinementResult.clamped_keys?.length || 0,
      outOfRangeCount: aiRefinementResult.out_of_range_count || 0,
      activeKeysCount: aiRefinementResult.active_keys_count || 0,
      aiConfidence: aiRefinementResult.ai_confidence,
      topDeltas: aiRefinementResult.refinement_deltas?.top_10_shape_deltas?.slice(0, 3) || []
    });

    // Enhance match result with AI refinement
    return {
      ...matchResult,
      ai_refinement: aiRefinementResult,
      final_shape_params: aiRefinementResult.final_shape_params,
      final_limb_masses: aiRefinementResult.final_limb_masses
    };
  } catch (aiError) {
    logger.warn('AI_REFINEMENT_SERVICE', 'AI refinement failed, using blend fallback', {
      clientScanId,
      resolvedGender,
      error: aiError instanceof Error ? aiError.message : 'Unknown error'
    });

    // Continue with blend data if AI refinement fails
    return {
      ...matchResult,
      ai_refinement: {
        ai_refine: false,
        error: aiError instanceof Error ? aiError.message : 'Unknown error',
        fallback_used: true
      }
    };
  }
}

/**
 * Validate AI refinement result
 */
export function validateAIRefinement(refinementResult: AIRefinementResult): boolean {
  if (!refinementResult.ai_refine) {
    return false;
  }

  if (!refinementResult.final_shape_params || !refinementResult.final_limb_masses) {
    logger.warn('AI_REFINEMENT_SERVICE', 'Invalid refinement result: missing final data');
    return false;
  }

  const shapeParamsCount = Object.keys(refinementResult.final_shape_params).length;
  const limbMassesCount = Object.keys(refinementResult.final_limb_masses).length;

  if (shapeParamsCount === 0 || limbMassesCount === 0) {
    logger.warn('AI_REFINEMENT_SERVICE', 'Invalid refinement result: empty data', {
      shapeParamsCount,
      limbMassesCount
    });
    return false;
  }

  return true;
}
