// src/app/pages/BodyScan/BodyScanCapture/services/index.ts
/**
 * Scan Processing Services Index
 * Exports all modular scan processing services
 */

// Main orchestrator (backwards compatible API)
export {
  processBodyScanPipeline,
  type ScanProcessingConfig,
  type ScanProcessingResult
} from './scanProcessingService';

// Modular services
export {
  uploadPhotosToStorage,
  deletePhotosFromStorage,
  validatePhoto,
  type UploadedPhoto,
  type PhotoUploadProgress
} from './photoUploadService';

export {
  callScanEstimate,
  callScanSemantic,
  callScanMatch,
  callScanCommit
} from './edgeFunctionClient';

export {
  performAIRefinement,
  validateAIRefinement
} from './aiRefinementService';

export {
  generateInsights,
  generateRecommendations,
  calculateInsightPriority
} from './scanInsightsGenerator';

export {
  extractLimbMassesFromScanData,
  extractMeasurements,
  extractSemanticProfile,
  extractArchetypeInfo
} from './scanDataExtractor';

// New orchestrator (internal use)
export { processBodyScanPipeline as processBodyScanPipelineRefactored } from './scanProcessingOrchestrator';
