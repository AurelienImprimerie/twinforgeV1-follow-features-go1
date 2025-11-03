/**
 * Body Scan Data Mapper
 *
 * Transforms body scan data from database format (snake_case) to
 * component format (camelCase) with proper type safety and validation
 */

import logger from './logger';

/**
 * Database body scan structure (as stored in Supabase)
 */
export interface DbBodyScan {
  id: string;
  user_id: string;
  timestamp?: string;
  created_at?: string;

  // Morphological data
  morph_values?: Record<string, number>; // Final shape parameters
  limb_masses?: Record<string, number>; // Final limb masses
  skin_tone?: any; // Legacy single-value skin tone
  skin_tone_map_v2?: any; // Multi-zone skin tone V2
  resolved_gender?: 'masculine' | 'feminine';

  // Body metrics
  weight?: number;
  body_fat_percentage?: number;
  bmi?: number;
  waist_circumference?: number;
  raw_measurements?: Record<string, number>;

  // Model and version tracking
  gltf_model_id?: string;
  material_config_version?: string;
  mapping_version?: string;
  avatar_version?: string;

  // User profile at scan time
  user_profile?: {
    sex: 'male' | 'female';
    height_cm: number;
    weight_kg: number;
  };

  // Legacy fields
  morphData?: Record<string, number>;
}

/**
 * Component-expected body scan structure
 */
export interface ComponentBodyScan {
  id: string;
  userId: string;
  timestamp: string;
  createdAt: string;

  // Morphological data (camelCase)
  finalShapeParams: Record<string, number>;
  finalLimbMasses: Record<string, number>;
  skinTone: any;
  resolvedGender: 'male' | 'female';

  // Body metrics
  weight?: number;
  bodyFatPercentage?: number;
  bmi?: number;
  waistCircumference?: number;
  rawMeasurements?: Record<string, number>;

  // Model and version tracking
  gltfModelId?: string;
  materialConfigVersion?: string;
  mappingVersion?: string;
  avatarVersion?: string;

  // User profile at scan time
  userProfile: {
    sex: 'male' | 'female';
    height_cm: number;
    weight_kg: number;
  };

  // Helper flag for UI logic
  hasValidMorphData: boolean;
}

/**
 * Convert masculine/feminine to male/female
 */
function normalizeGender(gender?: 'masculine' | 'feminine' | 'male' | 'female'): 'male' | 'female' {
  if (!gender) return 'male';
  if (gender === 'masculine') return 'male';
  if (gender === 'feminine') return 'female';
  return gender;
}

/**
 * Validate that morph data has minimum required keys
 */
function isValidMorphData(morphData?: Record<string, number>): boolean {
  if (!morphData || typeof morphData !== 'object') return false;
  const keys = Object.keys(morphData);
  return keys.length > 0;
}

/**
 * Transform database body scan to component format
 */
export function mapDbScanToComponent(dbScan: DbBodyScan | null): ComponentBodyScan | null {
  if (!dbScan) {
    logger.debug('BODY_SCAN_MAPPER', 'No scan data to map', { philosophy: 'null_input' });
    return null;
  }

  logger.debug('BODY_SCAN_MAPPER', 'Starting transformation', {
    scanId: dbScan.id,
    hasMorphValues: !!dbScan.morph_values,
    morphValuesCount: dbScan.morph_values ? Object.keys(dbScan.morph_values).length : 0,
    hasLimbMasses: !!dbScan.limb_masses,
    limbMassesCount: dbScan.limb_masses ? Object.keys(dbScan.limb_masses).length : 0,
    hasResolvedGender: !!dbScan.resolved_gender,
    hasSkinTone: !!dbScan.skin_tone,
    hasSkinToneMapV2: !!dbScan.skin_tone_map_v2,
    hasWeight: !!dbScan.weight,
    philosophy: 'transformation_start'
  });

  // Extract morph values (prefer morph_values over legacy morphData)
  const finalShapeParams = dbScan.morph_values || dbScan.morphData || {};

  // Extract limb masses
  const finalLimbMasses = dbScan.limb_masses || {};

  // Extract skin tone (prefer V2 format)
  const skinTone = dbScan.skin_tone_map_v2 || dbScan.skin_tone || null;

  // Normalize gender
  const resolvedGender = normalizeGender(dbScan.resolved_gender || dbScan.user_profile?.sex);

  // Validate morph data
  const hasValidMorphData = isValidMorphData(finalShapeParams) && isValidMorphData(finalLimbMasses);

  // Build user profile
  const userProfile = dbScan.user_profile || {
    sex: resolvedGender,
    height_cm: 170,
    weight_kg: dbScan.weight || 70
  };

  const mapped: ComponentBodyScan = {
    id: dbScan.id,
    userId: dbScan.user_id,
    timestamp: dbScan.timestamp || dbScan.created_at || new Date().toISOString(),
    createdAt: dbScan.created_at || dbScan.timestamp || new Date().toISOString(),

    // Morphological data
    finalShapeParams,
    finalLimbMasses,
    skinTone,
    resolvedGender,

    // Body metrics
    weight: dbScan.weight,
    bodyFatPercentage: dbScan.body_fat_percentage,
    bmi: dbScan.bmi,
    waistCircumference: dbScan.waist_circumference,
    rawMeasurements: dbScan.raw_measurements,

    // Model and version tracking
    gltfModelId: dbScan.gltf_model_id,
    materialConfigVersion: dbScan.material_config_version,
    mappingVersion: dbScan.mapping_version,
    avatarVersion: dbScan.avatar_version,

    // User profile
    userProfile,

    // Helper flag
    hasValidMorphData
  };

  logger.info('BODY_SCAN_MAPPER', 'Transformation complete', {
    scanId: mapped.id,
    hasValidMorphData: mapped.hasValidMorphData,
    finalShapeParamsCount: Object.keys(mapped.finalShapeParams).length,
    finalLimbMassesCount: Object.keys(mapped.finalLimbMasses).length,
    resolvedGender: mapped.resolvedGender,
    hasSkinTone: !!mapped.skinTone,
    hasBodyMetrics: !!(mapped.weight && mapped.bmi),
    philosophy: 'transformation_complete'
  });

  return mapped;
}

/**
 * Validate that a scan has sufficient data for avatar rendering
 */
export function validateScanForAvatar(scan: ComponentBodyScan | null): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  if (!scan) {
    return {
      isValid: false,
      missingFields: ['scan'],
      warnings: []
    };
  }

  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!scan.finalShapeParams || Object.keys(scan.finalShapeParams).length === 0) {
    missingFields.push('finalShapeParams');
  }

  if (!scan.finalLimbMasses || Object.keys(scan.finalLimbMasses).length === 0) {
    missingFields.push('finalLimbMasses');
  }

  if (!scan.resolvedGender) {
    missingFields.push('resolvedGender');
  }

  if (!scan.userProfile || !scan.userProfile.height_cm || !scan.userProfile.weight_kg) {
    missingFields.push('userProfile');
  }

  // Check optional but recommended fields
  if (!scan.skinTone) {
    warnings.push('skinTone not available - will use default');
  }

  if (!scan.weight || !scan.bmi) {
    warnings.push('Body metrics incomplete - some insights may not be available');
  }

  const isValid = missingFields.length === 0;

  logger.debug('BODY_SCAN_MAPPER', 'Scan validation result', {
    scanId: scan.id,
    isValid,
    missingFields,
    warnings,
    philosophy: 'scan_validation'
  });

  return {
    isValid,
    missingFields,
    warnings
  };
}

/**
 * Format body metrics for display
 */
export function formatBodyMetrics(scan: ComponentBodyScan | null) {
  if (!scan) return null;

  return {
    weight: scan.weight ? `${scan.weight.toFixed(1)} kg` : 'N/A',
    bmi: scan.bmi ? scan.bmi.toFixed(1) : 'N/A',
    bodyFat: scan.bodyFatPercentage ? `${scan.bodyFatPercentage.toFixed(1)}%` : 'N/A',
    waist: scan.waistCircumference ? `${scan.waistCircumference.toFixed(0)} cm` : 'N/A',
    scanDate: scan.createdAt ? new Date(scan.createdAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A'
  };
}
