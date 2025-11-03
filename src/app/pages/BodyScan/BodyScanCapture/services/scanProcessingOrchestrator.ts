// src/app/pages/BodyScan/BodyScanCapture/services/scanProcessingOrchestrator.ts
/**
 * Scan Processing Orchestrator
 * Coordinates the complete body scan processing pipeline
 * Refactored for modularity and maintainability
 */

import { useProgressStore } from '../../../../../system/store/progressStore';
import { scanAnalytics } from '../../../../../lib/utils/analytics';
import logger from '../../../../../lib/utils/logger';
import type { CapturedPhotoEnhanced } from '../../../../../domain/types';

// Import modular services
import { uploadPhotosToStorage, type UploadedPhoto } from './photoUploadService';
import {
  callScanEstimate,
  callScanSemantic,
  callScanMatch,
  callScanCommit
} from './edgeFunctionClient';
import { performAIRefinement } from './aiRefinementService';
import { generateInsights } from './scanInsightsGenerator';
import { extractSkinToneFromScanData } from '../utils/dataExtractors';
import { extractLimbMassesFromScanData } from './scanDataExtractor';

interface ScanProcessingConfig {
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

interface ScanProcessingResult {
  estimate: any;
  semantic: any;
  match: any;
  commit: any;
  completeResults: any;
}

/**
 * Process complete body scan pipeline
 */
export async function processBodyScanPipeline(
  config: ScanProcessingConfig
): Promise<ScanProcessingResult> {
  const { userId, clientScanId, capturedPhotos, stableScanParams, resolvedGender } = config;
  const progressStore = useProgressStore.getState();

  logger.info('SCAN_ORCHESTRATOR', 'Starting complete pipeline processing', {
    clientScanId,
    userId: userId.substring(0, 8) + '...',
    photosCount: capturedPhotos.length,
    userProfile: stableScanParams,
    resolvedGender,
    timestamp: new Date().toISOString()
  });

  // STEP 0: Upload photos to Supabase Storage
  progressStore.setOverallProgress(
    52,
    'Préparation des données',
    'Téléchargement sécurisé de vos photos...'
  );

  const uploadProgressInterval = setInterval(() => {
    progressStore.incrementProgress(
      1,
      'Préparation des données',
      'Téléchargement sécurisé de vos photos...'
    );
  }, 200);

  const uploadedPhotos = await uploadPhotosToStorage(userId, clientScanId, capturedPhotos);
  clearInterval(uploadProgressInterval);

  // START DYNAMIC PROCESSING
  logger.info('SCAN_ORCHESTRATOR', 'Starting dynamic processing progression', {
    clientScanId,
    startPercentage: 52,
    endPercentage: 92,
    totalSteps: 17
  });

  progressStore.startDynamicProcessing(52, 92);

  // STEP 1: scan-estimate (AI photo analysis)
  const estimateResult = await callScanEstimate(
    userId,
    uploadedPhotos,
    stableScanParams,
    resolvedGender,
    clientScanId
  );

  // STEP 2: scan-semantic (semantic classification)
  const semanticResult = await callScanSemantic(
    userId,
    uploadedPhotos,
    estimateResult,
    resolvedGender,
    clientScanId
  );

  // STEP 3: scan-match (archetype matching)
  const matchResult = await callScanMatch(
    userId,
    estimateResult,
    semanticResult,
    resolvedGender,
    clientScanId
  );

  // STEP 3.5: AI Morphological Refinement
  const enhancedMatchResult = await performAIRefinement(
    matchResult,
    uploadedPhotos,
    estimateResult,
    semanticResult,
    stableScanParams,
    resolvedGender,
    clientScanId,
    userId
  );

  // STOP DYNAMIC PROCESSING
  logger.info('SCAN_ORCHESTRATOR', 'Stopping dynamic processing before commit', {
    clientScanId
  });

  progressStore.stopDynamicProcessing();

  // STEP 4: scan-commit (data persistence)
  progressStore.setOverallProgress(
    92,
    'Sauvegarde des Données',
    'Persistance de votre avatar personnalisé...'
  );

  // Extract skin tone before commit
  const photosForExtraction = capturedPhotos.map(photo => ({
    view: photo.type,
    url: photo.url,
    report: photo.captureReport
  }));

  const skinTone = extractSkinToneFromScanData(
    photosForExtraction,
    estimateResult,
    clientScanId
  );

  logger.info('SCAN_ORCHESTRATOR', 'Skin tone extracted before commit', {
    clientScanId,
    hasSkinTone: !!skinTone,
    skinToneSchema: skinTone?.schema,
    skinToneRGB: skinTone?.rgb
      ? `rgb(${skinTone.rgb.r}, ${skinTone.rgb.g}, ${skinTone.rgb.b})`
      : 'unknown'
  });

  const commitResult = await callScanCommit(
    userId,
    estimateResult,
    enhancedMatchResult,
    semanticResult,
    capturedPhotos,
    resolvedGender,
    clientScanId,
    skinTone
  );

  // Store server scan ID
  if (commitResult.scan_id) {
    progressStore.setServerScanId(commitResult.scan_id);
  }

  // STEP 5: Complete processing
  progressStore.setProcessingStep('model_loading');
  progressStore.setOverallProgress(95, 'Finalisation', 'Préparation de votre avatar 3D...');

  await new Promise(resolve => setTimeout(resolve, 800));

  progressStore.setProcessingStep('model_loaded');
  progressStore.setOverallProgress(98, 'Prêt', 'Tout est prêt !');

  // Build complete scan results
  const completeResults = buildCompleteResults(
    estimateResult,
    semanticResult,
    enhancedMatchResult,
    commitResult,
    uploadedPhotos,
    stableScanParams,
    resolvedGender,
    clientScanId,
    userId,
    skinTone
  );

  logger.info('SCAN_ORCHESTRATOR', 'Complete pipeline processing finished successfully', {
    clientScanId,
    serverScanId: commitResult.scan_id,
    hasAllResults: !!(
      completeResults.estimate &&
      completeResults.semantic &&
      completeResults.match &&
      completeResults.commit
    ),
    finalConfidence: completeResults.estimate?.extracted_data?.processing_confidence || 0,
    aiRefined: !!enhancedMatchResult.ai_refinement?.ai_refine,
    aiConfidence: enhancedMatchResult.ai_refinement?.ai_confidence,
    insightsCount: completeResults.insights?.items?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Mark as complete
  progressStore.setComplete();
  progressStore.setOverallProgress(100, 'Terminé', 'Traitement complet !');

  logger.info('SCAN_ORCHESTRATOR', 'Processing state marked as complete', {
    clientScanId,
    serverScanId: commitResult.scan_id
  });

  return {
    estimate: estimateResult,
    semantic: semanticResult,
    match: enhancedMatchResult,
    commit: commitResult,
    completeResults
  };
}

/**
 * Build complete scan results object
 */
function buildCompleteResults(
  estimateResult: any,
  semanticResult: any,
  matchResult: any,
  commitResult: any,
  uploadedPhotos: UploadedPhoto[],
  stableScanParams: { sex: 'male' | 'female'; height_cm: number; weight_kg: number },
  resolvedGender: 'masculine' | 'feminine',
  clientScanId: string,
  userId: string,
  preExtractedSkinTone: any
) {
  logger.info('SCAN_ORCHESTRATOR', 'Building complete results with pre-extracted skin tone', {
    clientScanId,
    hasPreExtractedSkinTone: !!preExtractedSkinTone,
    skinToneSchema: preExtractedSkinTone?.schema
  });

  return {
    resolvedGender,
    estimate: estimateResult,
    semantic: semanticResult,
    match: matchResult,
    commit: commitResult,
    userId: userId,
    serverScanId: commitResult.scan_id,
    userProfile: {
      ...stableScanParams,
      sex: resolvedGender
    },
    insights: generateInsights(estimateResult, semanticResult, matchResult),
    clientScanId,
    skin_tone: preExtractedSkinTone,
    limb_masses: extractLimbMassesFromScanData(matchResult, estimateResult, clientScanId)
  };
}
