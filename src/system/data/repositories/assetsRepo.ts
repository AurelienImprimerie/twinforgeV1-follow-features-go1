/**
 * Assets Repository - Supabase Storage Integration
 * Handles 3D model and asset loading from Supabase Storage
 */

import logger from '../../../lib/utils/logger';
import { getSignedUrl, PRIVATE_BUCKETS } from '../../../lib/storage/signedUrlService';

// Base model paths in private storage
const MODEL_PATHS = {
  male: 'M_character_uniq.glb',
  female: 'F_character_uniq_4.13.glb',
};

/**
 * Get model URL for gender - Returns signed URL for private 3D models
 */
export async function getModelUrlForGender(gender: 'male' | 'female'): Promise<string> {
  const modelPath = MODEL_PATHS[gender] || MODEL_PATHS.male;

  logger.info('ASSETS_REPO', '📦 GETTING SIGNED MODEL URL FOR GENDER', {
    inputGender: gender,
    inputGenderType: typeof gender,
    modelPath,
    isMale: gender === 'male',
    isFemale: gender === 'female',
    usedFallback: !MODEL_PATHS[gender],
    availableGenders: Object.keys(MODEL_PATHS),
    timestamp: new Date().toISOString(),
    philosophy: 'private_storage_signed_url'
  });

  // Get signed URL from private storage (1 hour expiry)
  const signedUrl = await getSignedUrl(PRIVATE_BUCKETS.MODELS_3D, modelPath);

  if (!signedUrl) {
    const errorMessage = `Failed to generate signed URL for 3D model: ${modelPath}. This may be due to:\n1. File not found in storage\n2. RLS policies blocking access\n3. User not authenticated\n4. Network connectivity issues`;
    logger.error('ASSETS_REPO', 'Failed to get signed URL for model', {
      gender,
      modelPath,
      bucket: PRIVATE_BUCKETS.MODELS_3D,
      errorMessage,
      troubleshooting: {
        step1: 'Verify user is authenticated',
        step2: 'Check RLS policies on storage.objects table',
        step3: 'Confirm file exists in bucket',
        step4: 'Review Supabase logs for detailed error'
      },
      philosophy: 'signed_url_failure'
    });
    throw new Error(errorMessage);
  }

  logger.info('ASSETS_REPO', 'Successfully retrieved signed URL for model', {
    gender,
    modelPath,
    urlLength: signedUrl.length,
    philosophy: 'signed_url_success'
  });

  return signedUrl;
}

/**
 * Get fallback model URL - same as getModelUrlForGender (no custom models)
 */
async function getFallbackModelUrl(gender: 'male' | 'female'): Promise<string> {
  const url = await getModelUrlForGender(gender);

  logger.debug('ASSETS_REPO', 'Using fallback model URL', {
    gender,
    fallbackUrl: url,
    reason: 'no_custom_models_implemented',
    timestamp: new Date().toISOString()
  });

  return url;
}