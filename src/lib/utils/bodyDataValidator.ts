// src/lib/utils/bodyDataValidator.ts
import logger from './logger';
import type { BodyScanData } from '../../hooks/useBodyScanData';

interface ProfilePreferences {
  final_shape_params?: Record<string, number>;
  final_limb_masses?: Record<string, number>;
  skin_tone?: any;
  avatar_version?: string;
  resolved_gender?: 'male' | 'female';
}

interface ValidationResult {
  isValid: boolean;
  hasBodyScan: boolean;
  hasProfileData: boolean;
  isSynchronized: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Validates body scan data consistency between database and profile preferences
 * This helps identify data synchronization issues
 */
export function validateBodyDataConsistency(
  bodyScanData: BodyScanData | null,
  profilePreferences: ProfilePreferences | null
): ValidationResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  const hasBodyScan = !!bodyScanData;
  const hasProfileData = !!(
    profilePreferences?.final_shape_params &&
    Object.keys(profilePreferences.final_shape_params).length > 0
  );

  // Check if body scan exists (WARNING only, not blocking)
  if (!hasBodyScan) {
    recommendations.push('Complete a body scan to enable projection features');
    logger.info('BODY_DATA_VALIDATOR', 'No body scan found (expected for new users)', {
      philosophy: 'no_body_scan_warning'
    });
  }

  // Check if profile preferences have avatar data (WARNING only, not blocking)
  if (!hasProfileData) {
    if (hasBodyScan) {
      recommendations.push('Avatar data should be in profile after scan commit');
      logger.warn('BODY_DATA_VALIDATOR', 'Body scan exists but no profile data', {
        hasMorphValues: !!(bodyScanData?.morph_values && Object.keys(bodyScanData.morph_values).length > 0),
        hasLimbMasses: !!(bodyScanData?.limb_masses && Object.keys(bodyScanData.limb_masses).length > 0),
        philosophy: 'body_scan_without_profile_data'
      });
    } else {
      logger.info('BODY_DATA_VALIDATOR', 'No avatar data (expected for new users)', {
        philosophy: 'no_avatar_data_info'
      });
    }
  }

  // Check synchronization if both exist
  let isSynchronized = true;
  if (hasBodyScan && hasProfileData) {
    // Compare morph values count
    const scanMorphCount = bodyScanData?.morph_values
      ? Object.keys(bodyScanData.morph_values).length
      : 0;
    const profileMorphCount = profilePreferences?.final_shape_params
      ? Object.keys(profilePreferences.final_shape_params).length
      : 0;

    if (scanMorphCount !== profileMorphCount) {
      isSynchronized = false;
      issues.push(
        `Morph values count mismatch: scan has ${scanMorphCount}, profile has ${profileMorphCount}`
      );
      recommendations.push('Consider re-committing the scan to synchronize data');
    }

    // Compare limb masses
    const scanLimbCount = bodyScanData?.limb_masses
      ? Object.keys(bodyScanData.limb_masses).length
      : 0;
    const profileLimbCount = profilePreferences?.final_limb_masses
      ? Object.keys(profilePreferences.final_limb_masses).length
      : 0;

    if (scanLimbCount !== profileLimbCount) {
      isSynchronized = false;
      issues.push(
        `Limb masses count mismatch: scan has ${scanLimbCount}, profile has ${profileLimbCount}`
      );
    }

    // Check avatar version
    if (profilePreferences?.avatar_version !== 'v2.0') {
      issues.push(
        `Profile avatar version is ${profilePreferences?.avatar_version || 'unknown'}, expected v2.0`
      );
      recommendations.push('Complete a new scan to upgrade to avatar version v2.0');
    }
  }

  const isValid = issues.length === 0;

  // Log validation result
  logger.info('BODY_DATA_VALIDATOR', 'Validation completed', {
    isValid,
    hasBodyScan,
    hasProfileData,
    isSynchronized,
    issuesCount: issues.length,
    issues,
    recommendations,
    philosophy: 'body_data_validation'
  });

  return {
    isValid,
    hasBodyScan,
    hasProfileData,
    isSynchronized,
    issues,
    recommendations
  };
}

/**
 * Logs detailed diagnostic information about body scan data
 */
export function logBodyDataDiagnostics(
  bodyScanData: BodyScanData | null,
  profilePreferences: ProfilePreferences | null
) {
  logger.info('BODY_DATA_DIAGNOSTICS', 'Body data diagnostic report', {
    bodyScan: bodyScanData
      ? {
          id: bodyScanData.id,
          timestamp: bodyScanData.timestamp,
          created_at: bodyScanData.created_at,
          hasMorphValues: !!bodyScanData.morph_values,
          morphValuesCount: bodyScanData.morph_values
            ? Object.keys(bodyScanData.morph_values).length
            : 0,
          hasLimbMasses: !!bodyScanData.limb_masses,
          limbMassesCount: bodyScanData.limb_masses
            ? Object.keys(bodyScanData.limb_masses).length
            : 0,
          hasWeight: !!bodyScanData.weight,
          weight: bodyScanData.weight,
          hasBodyFat: !!bodyScanData.body_fat_percentage,
          bodyFatPercentage: bodyScanData.body_fat_percentage,
          hasSkinTone: !!bodyScanData.skin_tone,
          resolvedGender: bodyScanData.resolved_gender
        }
      : null,
    profilePreferences: profilePreferences
      ? {
          hasFinalShapeParams: !!profilePreferences.final_shape_params,
          finalShapeParamsCount: profilePreferences.final_shape_params
            ? Object.keys(profilePreferences.final_shape_params).length
            : 0,
          hasFinalLimbMasses: !!profilePreferences.final_limb_masses,
          finalLimbMassesCount: profilePreferences.final_limb_masses
            ? Object.keys(profilePreferences.final_limb_masses).length
            : 0,
          hasSkinTone: !!profilePreferences.skin_tone,
          avatarVersion: profilePreferences.avatar_version,
          resolvedGender: profilePreferences.resolved_gender
        }
      : null,
    philosophy: 'body_data_diagnostics'
  });
}
