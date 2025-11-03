// src/lib/morph/mergeFaceAndBodyMorphs.ts
import logger from '../utils/logger';

/**
 * Body morph keys that affect the face/head area
 * These keys will be merged with face-specific morphs for complete face rendering
 */
const BODY_KEYS_AFFECTING_FACE = [
  // Shape and figure keys that affect overall silhouette including neck/shoulders
  'pearFigure',
  'appleShape',
  'bodyWeight',

  // Shoulder and upper body keys that affect neck/shoulder area visible in face view
  'shoulderWidth',
  'neckLength',
  'neckThickness',

  // Overall body shape keys that may influence face proportions
  'athleteFigure',
  'bodybuilderSize',

  // Height-related keys that may affect head proportions
  'height',

  // Additional upper body keys
  'chestSize',
  'torsoLength',

  // Muscularity keys that may affect neck/jaw area
  'muscularity',
  'muscleDefinition',

  // Weight distribution keys
  'upperBodyWeight',
  'lowerBodyWeight',
];

export interface MergeMorphsResult {
  mergedMorphs: Record<string, number>;
  stats: {
    faceOnlyKeys: number;
    bodyOnlyKeys: number;
    sharedKeys: number;
    totalKeys: number;
    bodyKeysUsed: string[];
  };
}

/**
 * Merge face morph data with body morph data
 *
 * Priority rules:
 * 1. Face-specific morphs always take priority
 * 2. Body morphs are only added if they affect the face area
 * 3. All values must be finite numbers
 *
 * @param faceMorphs - Morphs from face scan (final_face_params)
 * @param bodyMorphs - Morphs from body scan (morph_values)
 * @returns Merged morph data with statistics
 */
export function mergeFaceAndBodyMorphs(
  faceMorphs: Record<string, number>,
  bodyMorphs: Record<string, number>
): MergeMorphsResult {
  logger.info('MERGE_FACE_BODY_MORPHS', 'Starting merge of face and body morphs', {
    faceMorphsCount: Object.keys(faceMorphs).length,
    bodyMorphsCount: Object.keys(bodyMorphs).length,
    bodyKeysAffectingFace: BODY_KEYS_AFFECTING_FACE.length,
    philosophy: 'morph_merge_start'
  });

  // Start with face morphs (they have priority)
  const mergedMorphs: Record<string, number> = {};
  const faceKeys = new Set<string>();

  // Add all face morphs first
  Object.entries(faceMorphs).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      mergedMorphs[key] = value;
      faceKeys.add(key);
    } else {
      logger.warn('MERGE_FACE_BODY_MORPHS', 'Skipping invalid face morph value', {
        key,
        value,
        valueType: typeof value,
        philosophy: 'invalid_face_morph_skipped'
      });
    }
  });

  // Track which body keys were actually used
  const bodyKeysUsed: string[] = [];
  let bodyOnlyKeysAdded = 0;
  let sharedKeysSkipped = 0;

  // Add body morphs that affect the face (if not already present from face morphs)
  Object.entries(bodyMorphs).forEach(([key, value]) => {
    // Skip if this key is already present from face morphs (face morphs have priority)
    if (faceKeys.has(key)) {
      sharedKeysSkipped++;
      logger.debug('MERGE_FACE_BODY_MORPHS', 'Skipping body morph - face morph takes priority', {
        key,
        faceValue: mergedMorphs[key],
        bodyValue: value,
        philosophy: 'face_priority'
      });
      return;
    }

    // Only add body keys that affect the face area
    if (!BODY_KEYS_AFFECTING_FACE.includes(key)) {
      return;
    }

    // Validate value
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      logger.warn('MERGE_FACE_BODY_MORPHS', 'Skipping invalid body morph value', {
        key,
        value,
        valueType: typeof value,
        philosophy: 'invalid_body_morph_skipped'
      });
      return;
    }

    // Add the body morph
    mergedMorphs[key] = value;
    bodyKeysUsed.push(key);
    bodyOnlyKeysAdded++;
  });

  const stats = {
    faceOnlyKeys: faceKeys.size,
    bodyOnlyKeys: bodyOnlyKeysAdded,
    sharedKeys: sharedKeysSkipped,
    totalKeys: Object.keys(mergedMorphs).length,
    bodyKeysUsed
  };

  logger.info('MERGE_FACE_BODY_MORPHS', 'Merge completed successfully', {
    ...stats,
    sampleMergedKeys: Object.keys(mergedMorphs).slice(0, 15),
    philosophy: 'morph_merge_complete'
  });

  // Log detailed breakdown of which body keys were used
  if (bodyKeysUsed.length > 0) {
    logger.info('MERGE_FACE_BODY_MORPHS', 'Body keys integrated into face viewer', {
      bodyKeysUsed,
      bodyKeysWithValues: bodyKeysUsed.map(key => ({ key, value: mergedMorphs[key] })),
      philosophy: 'body_keys_integration'
    });
  } else {
    logger.info('MERGE_FACE_BODY_MORPHS', 'No body keys were integrated (none matched criteria or all overridden by face morphs)', {
      availableBodyKeys: Object.keys(bodyMorphs).slice(0, 10),
      keysAffectingFace: BODY_KEYS_AFFECTING_FACE,
      philosophy: 'no_body_keys_used'
    });
  }

  return {
    mergedMorphs,
    stats
  };
}

/**
 * Check if body scan data should be merged with face data
 * @param faceMorphs - Face morph data
 * @param bodyMorphs - Body morph data
 * @returns true if merge would add useful data
 */
export function shouldMergeBodyMorphs(
  faceMorphs: Record<string, number>,
  bodyMorphs: Record<string, number>
): boolean {
  if (!bodyMorphs || Object.keys(bodyMorphs).length === 0) {
    return false;
  }

  // Check if any body keys that affect face are present and different from face keys
  const faceKeys = new Set(Object.keys(faceMorphs));
  const hasUsefulBodyKeys = BODY_KEYS_AFFECTING_FACE.some(
    key => key in bodyMorphs && !faceKeys.has(key)
  );

  logger.debug('MERGE_FACE_BODY_MORPHS', 'Checking if body morphs should be merged', {
    hasUsefulBodyKeys,
    bodyMorphsCount: Object.keys(bodyMorphs).length,
    faceMorphsCount: Object.keys(faceMorphs).length,
    philosophy: 'merge_decision'
  });

  return hasUsefulBodyKeys;
}
