/**
 * Unified Skin Tone Extraction Service
 * Single source of truth for skin tone extraction with intelligent weighted averaging
 */

import logger from '../utils/logger';
import { createCompleteSkinTone, type SkinToneV2 } from '../scan/normalizeSkinTone';
import { extractSkinToneFromPhoto } from './skinToneExtractor';

interface PhotoForExtraction {
  type: 'front' | 'profile' | 'face';
  data: ImageData;
  faceRegion?: { x: number; y: number; width: number; height: number };
}

interface ExtractionResult {
  skinTone: SkinToneV2;
  confidence: number;
  source: string;
  breakdown: {
    frontPhoto?: { r: number; g: number; b: number; confidence: number };
    profilePhoto?: { r: number; g: number; b: number; confidence: number };
    finalWeights?: { front: number; profile: number };
  };
}

/**
 * AUTHORITATIVE skin tone extraction with intelligent weighted averaging
 * Best practice: Face photo has priority, but we use both for robustness
 */
export async function extractAuthoritativeSkinTone(
  photos: PhotoForExtraction[]
): Promise<ExtractionResult> {
  logger.info('SKIN_TONE_EXTRACTION_SERVICE', 'Starting authoritative extraction', {
    photosCount: photos.length,
    photoTypes: photos.map(p => p.type),
    philosophy: 'unified_authoritative_extraction'
  });

  const extractions: Array<{
    type: string;
    r: number;
    g: number;
    b: number;
    confidence: number;
  }> = [];

  // Extract from all available photos
  for (const photo of photos) {
    try {
      const result = extractSkinToneFromPhoto(photo.data, photo.faceRegion);

      if (result && result.r && result.g && result.b) {
        extractions.push({
          type: photo.type,
          r: result.r,
          g: result.g,
          b: result.b,
          confidence: result.confidence || 0.7
        });

        logger.info('SKIN_TONE_EXTRACTION_SERVICE', 'Extracted from photo', {
          photoType: photo.type,
          rgb: `rgb(${result.r}, ${result.g}, ${result.b})`,
          confidence: result.confidence?.toFixed(3),
          hadFaceRegion: !!photo.faceRegion
        });
      }
    } catch (error) {
      logger.warn('SKIN_TONE_EXTRACTION_SERVICE', 'Failed to extract from photo', {
        photoType: photo.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (extractions.length === 0) {
    logger.warn('SKIN_TONE_EXTRACTION_SERVICE', 'No successful extractions, using default', {
      philosophy: 'extraction_fallback_to_default'
    });

    return {
      skinTone: createCompleteSkinTone(153, 108, 78, 'default_fallback', 0.5),
      confidence: 0.5,
      source: 'default_fallback',
      breakdown: {}
    };
  }

  // BEST PRACTICE: Intelligent weighted averaging
  // Face/front photos have higher weight than profile photos
  // Higher confidence extractions have more influence

  const weights = extractions.map(ext => {
    let baseWeight = 1.0;

    // Face/front photos have 1.5x priority
    if (ext.type === 'face' || ext.type === 'front') {
      baseWeight = 1.5;
    }

    // Confidence multiplier (0.5 to 1.5 range)
    const confidenceWeight = 0.5 + ext.confidence;

    return baseWeight * confidenceWeight;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);

  // Calculate weighted average
  let weightedR = 0;
  let weightedG = 0;
  let weightedB = 0;
  let weightedConfidence = 0;

  extractions.forEach((ext, i) => {
    const weight = normalizedWeights[i];
    weightedR += ext.r * weight;
    weightedG += ext.g * weight;
    weightedB += ext.b * weight;
    weightedConfidence += ext.confidence * weight;
  });

  const finalR = Math.round(weightedR);
  const finalG = Math.round(weightedG);
  const finalB = Math.round(weightedB);

  // Calculate extraction confidence
  // High when: multiple sources, high individual confidences, low variance
  const variance = calculateColorVariance(extractions, finalR, finalG, finalB);
  const multiSourceBonus = Math.min(0.2, extractions.length * 0.1);
  const lowVarianceBonus = Math.max(0, 0.3 - variance / 1000);

  const finalConfidence = Math.min(
    0.95,
    weightedConfidence * 0.5 + multiSourceBonus + lowVarianceBonus
  );

  const skinTone = createCompleteSkinTone(
    finalR,
    finalG,
    finalB,
    'unified_weighted_extraction',
    finalConfidence,
    extractions.reduce((sum, ext) => sum + ((ext as any).pixelCount || 0), 0)
  );

  const breakdown: any = {};
  extractions.forEach((ext, i) => {
    const key = ext.type === 'front' ? 'frontPhoto' : 'profilePhoto';
    breakdown[key] = {
      r: ext.r,
      g: ext.g,
      b: ext.b,
      confidence: ext.confidence
    };
  });

  if (extractions.length > 1) {
    breakdown.finalWeights = {};
    extractions.forEach((ext, i) => {
      const key = ext.type === 'front' ? 'front' : 'profile';
      breakdown.finalWeights[key] = normalizedWeights[i];
    });
  }

  logger.info('SKIN_TONE_EXTRACTION_SERVICE', 'Authoritative extraction completed', {
    finalRGB: `rgb(${finalR}, ${finalG}, ${finalB})`,
    finalHex: skinTone.hex,
    finalConfidence: finalConfidence.toFixed(3),
    extractionsUsed: extractions.length,
    breakdown,
    variance: variance.toFixed(2),
    multiSourceBonus: multiSourceBonus.toFixed(3),
    lowVarianceBonus: lowVarianceBonus.toFixed(3),
    philosophy: 'unified_authoritative_extraction_success'
  });

  return {
    skinTone,
    confidence: finalConfidence,
    source: 'unified_weighted_extraction',
    breakdown
  };
}

/**
 * Calculate color variance to assess extraction consistency
 */
function calculateColorVariance(
  extractions: Array<{ r: number; g: number; b: number }>,
  avgR: number,
  avgG: number,
  avgB: number
): number {
  if (extractions.length <= 1) return 0;

  const variances = extractions.map(ext => {
    const dr = ext.r - avgR;
    const dg = ext.g - avgG;
    const db = ext.b - avgB;
    return dr * dr + dg * dg + db * db;
  });

  return variances.reduce((sum, v) => sum + v, 0) / variances.length;
}

/**
 * Re-extract skin tone from existing scan data
 * Used for migration of legacy scans
 */
export async function reextractFromScanPhotos(
  scanId: string,
  userId: string
): Promise<SkinToneV2 | null> {
  logger.info('SKIN_TONE_EXTRACTION_SERVICE', 'Re-extracting from scan photos', {
    scanId,
    userId,
    philosophy: 'v2_migration_reextraction'
  });

  // This would fetch photos from storage and re-extract
  // Implementation depends on your storage structure
  // For now, return null to indicate manual handling needed

  return null;
}
