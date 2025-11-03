/**
 * Avatar Actions Utilities
 * Handles saving and navigation actions for avatar review
 */

import { supabase } from '../../../../../system/supabase/client';
import { useUserStore } from '../../../../../system/store/userStore';
import logger from '../../../../../lib/utils/logger';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Round number to 3 decimal places to eliminate micro-deltas
 */
const round3 = (n: number): number => Math.round(n * 1000) / 1000;

/**
 * Apply strict allowlist and rounding to shape parameters
 */
function roundAndAllowlistShapeParams(shapeParams: Record<string, number>): Record<string, number> {
  const rounded: Record<string, number> = {};
  
  Object.entries(shapeParams).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      rounded[key] = round3(value);
    }
  });
  
  return rounded;
}

/**
 * Apply strict allowlist and rounding to limb masses
 */
function roundAndAllowlistLimbMasses(limbMasses: Record<string, number>): Record<string, number> {
  const rounded: Record<string, number> = {};
  
  // Only include actual limb mass keys, exclude technical keys
  const allowedLimbMassKeys = ['armMass', 'forearmMass', 'thighMass', 'calfMass', 'torsoMass', 'neckMass', 'hipMass'];
  
  Object.entries(limbMasses).forEach(([key, value]) => {
    if (allowedLimbMassKeys.includes(key) && typeof value === 'number' && Number.isFinite(value)) {
      rounded[key] = round3(value);
    }
  });
  
  return rounded;
}

/**
 * Generate model checksum for GLTF model identification
 */
function generateModelChecksum(gender: 'male' | 'female'): string {
  // Simple checksum based on gender and current model version
  const modelVersion = 'v4.13'; // Update this when models change
  return `${gender}_${modelVersion}`;
}

/**
 * Prepare skin tone in sRGB format with metadata
 */
async function prepareSkinToneForPersistence(skinTone: any): Promise<any> {
  logger.info('AVATAR_SAVE_SKIN_TONE_PREP', 'AUDIT: Starting skin tone preparation for persistence', {
    inputSkinTone: skinTone,
    inputSkinToneType: typeof skinTone,
    inputSkinToneKeys: skinTone ? Object.keys(skinTone) : [],
    inputSkinToneStringified: skinTone ? JSON.stringify(skinTone) : null,
    hasRgbProperty: !!skinTone?.rgb,
    rgbValue: skinTone?.rgb,
    hasLinearF32Property: !!skinTone?.linear_f32,
    linearF32Value: skinTone?.linear_f32,
  });

  // CRITICAL FIX: Toujours re-canonicaliser l'objet skinTone en utilisant resolveSkinTone.
  // Cela garantit que l'objet est toujours un SkinToneV2 valide, quelle que soit son origine
  // ou les mutations d'état précédentes (sérialisation/désérialisation, etc.).
  const normalizeSkinToneModule = await import('../../../../../lib/scan/normalizeSkinTone');
  const resolveSkinTone = normalizeSkinToneModule.resolveSkinTone;
  const isSkinToneV2 = normalizeSkinToneModule.isSkinToneV2;
  const resolvedTone = resolveSkinTone({ skin_tone: skinTone });

  // CRITICAL: Verify the resolved tone is valid V2 format
  if (!isSkinToneV2(resolvedTone.tone)) {
    logger.error('AVATAR_SAVE_SKIN_TONE_PREP', 'CRITICAL: Resolved skin tone is NOT V2 format', {
      resolvedTone: resolvedTone.tone,
      resolvedSource: resolvedTone.source,
      hasSchema: !!resolvedTone.tone?.schema,
      schema: resolvedTone.tone?.schema,
      hasRgb: !!resolvedTone.tone?.rgb,
      hasHex: !!resolvedTone.tone?.hex,
      hasSrgbF32: !!resolvedTone.tone?.srgb_f32,
      hasLinearF32: !!resolvedTone.tone?.linear_f32,
      philosophy: 'skin_tone_v2_validation_failed_after_resolve'
    });
    throw new Error('Resolved skin tone is not in V2 format');
  }

  // CRITICAL: Verify all required V2 properties are present and valid
  const v2ValidationResults = {
    hasSchema: resolvedTone.tone.schema === 'v2',
    hasSpace: resolvedTone.tone.space === 'sRGB',
    hasFormat: resolvedTone.tone.format === 'rgb255',
    hasRgb: !!resolvedTone.tone.rgb &&
            typeof resolvedTone.tone.rgb.r === 'number' &&
            typeof resolvedTone.tone.rgb.g === 'number' &&
            typeof resolvedTone.tone.rgb.b === 'number',
    rgbInRange: resolvedTone.tone.rgb &&
                resolvedTone.tone.rgb.r >= 0 && resolvedTone.tone.rgb.r <= 255 &&
                resolvedTone.tone.rgb.g >= 0 && resolvedTone.tone.rgb.g <= 255 &&
                resolvedTone.tone.rgb.b >= 0 && resolvedTone.tone.rgb.b <= 255,
    hasHex: !!resolvedTone.tone.hex && /^#[0-9A-Fa-f]{6}$/.test(resolvedTone.tone.hex),
    hasSrgbF32: !!resolvedTone.tone.srgb_f32 &&
                typeof resolvedTone.tone.srgb_f32.r === 'number' &&
                typeof resolvedTone.tone.srgb_f32.g === 'number' &&
                typeof resolvedTone.tone.srgb_f32.b === 'number',
    srgbF32InRange: resolvedTone.tone.srgb_f32 &&
                    resolvedTone.tone.srgb_f32.r >= 0 && resolvedTone.tone.srgb_f32.r <= 1 &&
                    resolvedTone.tone.srgb_f32.g >= 0 && resolvedTone.tone.srgb_f32.g <= 1 &&
                    resolvedTone.tone.srgb_f32.b >= 0 && resolvedTone.tone.srgb_f32.b <= 1,
    hasLinearF32: !!resolvedTone.tone.linear_f32 &&
                  typeof resolvedTone.tone.linear_f32.r === 'number' &&
                  typeof resolvedTone.tone.linear_f32.g === 'number' &&
                  typeof resolvedTone.tone.linear_f32.b === 'number',
    linearF32InRange: resolvedTone.tone.linear_f32 &&
                      resolvedTone.tone.linear_f32.r >= 0 && resolvedTone.tone.linear_f32.r <= 1 &&
                      resolvedTone.tone.linear_f32.g >= 0 && resolvedTone.tone.linear_f32.g <= 1 &&
                      resolvedTone.tone.linear_f32.b >= 0 && resolvedTone.tone.linear_f32.b <= 1
  };

  const allV2PropertiesValid = Object.values(v2ValidationResults).every(v => v === true);

  if (!allV2PropertiesValid) {
    logger.error('AVATAR_SAVE_SKIN_TONE_PREP', 'CRITICAL: V2 skin tone validation failed', {
      validationResults: v2ValidationResults,
      resolvedTone: resolvedTone.tone,
      philosophy: 'skin_tone_v2_properties_validation_failed'
    });
    throw new Error('V2 skin tone properties validation failed');
  }

  logger.info('AVATAR_SAVE_V2', 'Skin tone re-canonicalized and validated before persistence', {
    originalInput: skinTone,
    resolvedTone: resolvedTone.tone,
    resolvedSource: resolvedTone.source,
    resolvedToneRGB: `rgb(${resolvedTone.tone.rgb.r}, ${resolvedTone.tone.rgb.g}, ${resolvedTone.tone.rgb.b})`,
    resolvedToneHex: resolvedTone.tone.hex,
    resolvedToneSchema: resolvedTone.tone.schema,
    resolvedToneLinearF32: resolvedTone.tone.linear_f32,
    validationResults: v2ValidationResults,
    allPropertiesValid: allV2PropertiesValid,
    philosophy: 're_canonicalize_and_validate_before_persistence'
  });

  return resolvedTone.tone;
}

/**
 * Save current avatar to user profile
 */
export async function saveCurrentAvatar(
  profile: any,
  updateProfile: (updates: any) => Promise<void>,
  completeMorphData: Record<string, number>,
  scanResults: any,
  stableMorphBounds: Record<string, any>,
  stableSelectedArchetypes: any[],
  stableLimbMasses: Record<string, number>,
  stableSkinTone: any,
  resolvedGender: 'male' | 'female',
  showToast: (toast: any) => void,
  success: () => void,
  navigate: (path: string) => void,
  queryClient?: any
) {
  // AUDIT: Log all input parameters for skin tone debugging
  logger.info('AVATAR_SAVE_AUDIT', 'Starting avatar save with complete input audit', {
    userId: profile?.userId,
    hasSkinTone: !!stableSkinTone,
    skinToneRGB: stableSkinTone ? `rgb(${stableSkinTone.rgb.r}, ${stableSkinTone.rgb.g}, ${stableSkinTone.rgb.b})` : 'none',
    skinToneHex: stableSkinTone?.hex,
    skinToneSource: stableSkinTone?.source,
    skinToneConfidence: stableSkinTone?.confidence,
    skinToneSchema: stableSkinTone?.schema,
    resolvedGender,
    completeMorphDataCount: Object.keys(completeMorphData).length,
    stableLimbMassesCount: Object.keys(stableLimbMasses).length,
    scanResultsKeys: scanResults ? Object.keys(scanResults) : [],
    philosophy: 'skin_tone_save_audit_entry_point'
  });

  if (!profile?.userId) {
    showToast({
      type: 'error',
      title: 'Erreur d\'authentification',
      message: 'Impossible de sauvegarder sans utilisateur connecté',
      duration: 4000,
    });
    return;
  }

  if (!completeMorphData || Object.keys(completeMorphData).length === 0) {
    showToast({
      type: 'error',
      title: 'Aucune donnée à sauvegarder',
      message: 'Aucune donnée morphologique disponible',
      duration: 4000,
    });
    return;
  }

  try {
    // STEP 1: Prepare final payload with exact data applied in viewer
    const finalShapeParams = roundAndAllowlistShapeParams(completeMorphData);
    const finalLimbMasses = roundAndAllowlistLimbMasses(stableLimbMasses);
    
    // Initialize updateError to prevent ReferenceError when serverScanId is falsy
    let updateError = null;
    
    // STEP 2: Prepare skin tone in sRGB format with metadata  
    const skinTonePayload = await prepareSkinToneForPersistence(stableSkinTone);
    
    // CRITICAL AUDIT: Log skinTonePayload structure after preparation
    logger.info('AVATAR_SAVE_CRITICAL_AUDIT', 'AUDIT: skinTonePayload after preparation - COMPLETE STRUCTURE', {
      skinTonePayload: skinTonePayload,
      skinTonePayloadType: typeof skinTonePayload,
      skinTonePayloadKeys: skinTonePayload ? Object.keys(skinTonePayload) : [],
      skinTonePayloadStringified: skinTonePayload ? JSON.stringify(skinTonePayload) : null,
      hasAllV2Properties: !!(skinTonePayload?.rgb && skinTonePayload?.hex && skinTonePayload?.srgb_f32 && skinTonePayload?.linear_f32 && skinTonePayload?.schema),
      v2PropertiesIntegrity: skinTonePayload ? {
        rgb: skinTonePayload.rgb,
        hex: skinTonePayload.hex,
        srgb_f32: skinTonePayload.srgb_f32,
        linear_f32: skinTonePayload.linear_f32,
        schema: skinTonePayload.schema,
        source: skinTonePayload.source,
        confidence: skinTonePayload.confidence
      } : null,
      philosophy: 'critical_skin_tone_payload_audit_after_preparation'
    });
    
    // PHASE 2: Log V2 skin tone preparation with canonical format validation
    logger.info('AVATAR_SAVE_V2', 'V2 skin tone payload preparation - canonical format validation', {
      userId: profile.userId,
      // DETAILED SKIN TONE AUDIT - BEFORE PREPARATION
      inputSkinToneAudit: stableSkinTone ? {
        hasRgbProperty: !!stableSkinTone.rgb,
        rgbValue: stableSkinTone.rgb,
        hasHexProperty: !!stableSkinTone.hex,
        hexValue: stableSkinTone.hex,
        hasSchemaProperty: !!stableSkinTone.schema,
        schemaValue: stableSkinTone.schema,
        hasLinearF32Property: !!stableSkinTone.linear_f32,
        linearF32Value: stableSkinTone.linear_f32,
        hasSrgbF32Property: !!stableSkinTone.srgb_f32,
        srgbF32Value: stableSkinTone.srgb_f32,
        hasSourceProperty: !!stableSkinTone.source,
        sourceValue: stableSkinTone.source,
        hasConfidenceProperty: !!stableSkinTone.confidence,
        confidenceValue: stableSkinTone.confidence,
        completeObjectStructure: stableSkinTone
      } : null,
      originalSkinTone: stableSkinTone ? {
        rgb: stableSkinTone.rgb,
        hex: stableSkinTone.hex,
        schema: stableSkinTone.schema,
        source: stableSkinTone.source,
        confidence: stableSkinTone.confidence
      } : null,
      preparedSkinTone: skinTonePayload ? {
        rgb: skinTonePayload.rgb,
        hex: skinTonePayload.hex,
        schema: skinTonePayload.schema,
        srgb_f32: skinTonePayload.srgb_f32,
        linear_f32: skinTonePayload.linear_f32,
        source: skinTonePayload.source,
        confidence: skinTonePayload.confidence
      } : null,
      // DETAILED SKIN TONE AUDIT - AFTER PREPARATION
      preparedSkinToneCompleteAudit: skinTonePayload ? {
        hasAllRequiredProperties: !!(skinTonePayload.rgb && skinTonePayload.hex && skinTonePayload.srgb_f32 && skinTonePayload.linear_f32),
        rgbIntegrity: skinTonePayload.rgb ? {
          r: skinTonePayload.rgb.r,
          g: skinTonePayload.rgb.g,
          b: skinTonePayload.rgb.b,
          allFinite: Number.isFinite(skinTonePayload.rgb.r) && Number.isFinite(skinTonePayload.rgb.g) && Number.isFinite(skinTonePayload.rgb.b)
        } : null,
        hexIntegrity: {
          value: skinTonePayload.hex,
          isValidHex: /^#[0-9A-Fa-f]{6}$/.test(skinTonePayload.hex || '')
        },
        srgbF32Integrity: skinTonePayload.srgb_f32 ? {
          r: skinTonePayload.srgb_f32.r,
          g: skinTonePayload.srgb_f32.g,
          b: skinTonePayload.srgb_f32.b,
          allFinite: Number.isFinite(skinTonePayload.srgb_f32.r) && Number.isFinite(skinTonePayload.srgb_f32.g) && Number.isFinite(skinTonePayload.srgb_f32.b),
          inRange: skinTonePayload.srgb_f32.r >= 0 && skinTonePayload.srgb_f32.r <= 1 &&
                   skinTonePayload.srgb_f32.g >= 0 && skinTonePayload.srgb_f32.g <= 1 &&
                   skinTonePayload.srgb_f32.b >= 0 && skinTonePayload.srgb_f32.b <= 1
        } : null,
        linearF32Integrity: skinTonePayload.linear_f32 ? {
          r: skinTonePayload.linear_f32.r,
          g: skinTonePayload.linear_f32.g,
          b: skinTonePayload.linear_f32.b,
          allFinite: Number.isFinite(skinTonePayload.linear_f32.r) && Number.isFinite(skinTonePayload.linear_f32.g) && Number.isFinite(skinTonePayload.linear_f32.b),
          inRange: skinTonePayload.linear_f32.r >= 0 && skinTonePayload.linear_f32.r <= 1 &&
                   skinTonePayload.linear_f32.g >= 0 && skinTonePayload.linear_f32.g <= 1 &&
                   skinTonePayload.linear_f32.b >= 0 && skinTonePayload.linear_f32.b <= 1
        } : null,
        completePayloadStructure: skinTonePayload
      } : null,
      skinTonePreparationSuccess: !!skinTonePayload,
      v2FormatIntegrity: !!(stableSkinTone?.rgb && skinTonePayload?.rgb && 
        stableSkinTone.rgb.r === skinTonePayload.rgb.r &&
        stableSkinTone.rgb.g === skinTonePayload.rgb.g &&
        stableSkinTone.rgb.b === skinTonePayload.rgb.b),
      philosophy: 'v2_canonical_format_validation'
    });
    
    // STEP 3: Generate model and configuration checksums
    const gltfModelId = generateModelChecksum(resolvedGender);
    const materialConfigVersion = 'pbr-v2';
    const mappingVersion = 'v1.0';
    
    // CRITICAL: Validate limb masses before persistence
    const limbMassKeys = Object.keys(finalLimbMasses);
    const expectedLimbMassKeys = ['armMass', 'forearmMass', 'thighMass', 'calfMass', 'torsoMass', 'neckMass'];
    const missingLimbMasses = expectedLimbMassKeys.filter(key => !limbMassKeys.includes(key));

    if (missingLimbMasses.length > 0) {
      logger.warn('AVATAR_SAVE', 'Missing limb masses detected', {
        missing: missingLimbMasses.join(', '),
        present: limbMassKeys.join(', ')
      });
    }

    // Log limb masses before persistence
    logger.info('AVATAR_SAVE_LIMB_MASSES', 'Limb masses before persistence', {
      count: limbMassKeys.length,
      values: finalLimbMasses
    });

    // STEP 4: Build complete saved avatar payload
    const payloadToPersist = {
      // Core morphological data (exactly as applied in viewer)
      final_shape_params: finalShapeParams,
      final_limb_masses: finalLimbMasses,
      skin_tone: skinTonePayload,
      resolved_gender: resolvedGender,

      // Versioning and model identification
      mapping_version: mappingVersion,
      gltf_model_id: gltfModelId,
      material_config_version: materialConfigVersion,

      // Legacy compatibility fields
      savedMorphData: finalShapeParams, // For backward compatibility
      morphBounds: stableMorphBounds,
      selectedArchetypes: stableSelectedArchetypes,

      // Metadata
      lastMorphSave: new Date().toISOString(),
      scanId: scanResults?.serverScanId || scanResults?.commit?.scan_id,
      avatar_version: 'v2.0', // New version with complete payload
    };
    
    // PHASE 2: Purge legacy skin tone fields from payload
    const cleanedPayload = { ...payloadToPersist };
    
    // Remove legacy skin tone fields to prevent fallback confusion
    delete (cleanedPayload as any).skinTone;
    delete (cleanedPayload as any).skinToneLegacy;
    delete (cleanedPayload as any).skin_tone_legacy;
    delete (cleanedPayload as any).legacy_skin_tone;
    
    logger.info('AVATAR_SAVE_V2', 'Legacy skin tone fields purged from payload', {
      purgedFields: ['skinTone', 'skinToneLegacy', 'skin_tone_legacy', 'legacy_skin_tone'],
      canonicalField: 'skin_tone',
      philosophy: 'legacy_purge_prevent_fallback_confusion'
    });
    
    // PHASE 2: Log complete V2 payload with canonical skin tone
    logger.info('AVATAR_SAVE_V2', 'Complete V2 payload prepared - canonical skin tone persistence', {
      userId: profile.userId,
      payloadKeys: Object.keys(payloadToPersist),
      canonicalSkinTone: payloadToPersist.skin_tone ? {
        rgb: payloadToPersist.skin_tone.rgb,
        hex: payloadToPersist.skin_tone.hex,
        schema: payloadToPersist.skin_tone.schema,
        source: payloadToPersist.skin_tone.source,
        confidence: payloadToPersist.skin_tone.confidence
      } : null,
      avatarVersion: payloadToPersist.avatar_version,
      resolvedGender: payloadToPersist.resolved_gender,
      gltfModelId: payloadToPersist.gltf_model_id,
      materialConfigVersion: payloadToPersist.material_config_version,
      v2SkinTonePersistenceReady: !!payloadToPersist.skin_tone,
      legacyFieldsPurged: true,
      philosophy: 'v2_canonical_payload_persistence'
    });
    
    // STEP 5: Save to user_profile.preferences with legacy purge
    const preferencesUpdate = {
      ...profile.preferences,
      ...cleanedPayload
    };
    
    // PHASE 2: Purge legacy skin tone fields from preferences
    delete preferencesUpdate.skinTone;
    delete preferencesUpdate.skinToneLegacy;
    delete preferencesUpdate.skin_tone_legacy;
    delete preferencesUpdate.legacy_skin_tone;
    
    logger.info('AVATAR_SAVE_V2', 'Purging legacy skin tone fields from preferences', {
      userId: profile.userId,
      purgedFromPreferences: ['skinTone', 'skinToneLegacy', 'skin_tone_legacy', 'legacy_skin_tone'],
      canonicalFieldPresent: !!preferencesUpdate.skin_tone,
      philosophy: 'preferences_legacy_purge'
    });
    
    // STEP 6: Log complete V2 payload for debugging
    logger.info('AVATAR_SAVE_V2', 'Saving avatar with V2 canonical skin tone data', {
      userId: profile.userId,
      scanId: cleanedPayload.scanId,
      resolvedGender,
      hasV2SkinTone: !!skinTonePayload,
      v2SkinToneRGB: skinTonePayload?.rgb ? `rgb(${skinTonePayload.rgb.r}, ${skinTonePayload.rgb.g}, ${skinTonePayload.rgb.b})` : 'none',
      v2SkinToneHex: skinTonePayload?.hex || 'none',
      v2SkinToneSchema: skinTonePayload?.schema || 'none',
      skinToneSource: skinTonePayload?.source,
      // COMPLETE PAYLOAD AUDIT BEFORE SAVE
      completePayloadAuditBeforeSave: {
        finalShapeParamsCount: Object.keys(cleanedPayload.final_shape_params || {}).length,
        finalLimbMassesCount: Object.keys(cleanedPayload.final_limb_masses || {}).length,
        skinToneCompleteStructure: cleanedPayload.skin_tone,
        skinToneLinearF32Present: !!(cleanedPayload.skin_tone?.linear_f32),
        skinToneSrgbF32Present: !!(cleanedPayload.skin_tone?.srgb_f32),
        skinToneRgbPresent: !!(cleanedPayload.skin_tone?.rgb),
        skinToneHexPresent: !!(cleanedPayload.skin_tone?.hex),
        avatarVersion: cleanedPayload.avatar_version,
        gltfModelId: cleanedPayload.gltf_model_id,
        materialConfigVersion: cleanedPayload.material_config_version,
        mappingVersion: cleanedPayload.mapping_version
      },
      legacyFieldsPurged: true,
      philosophy: 'v2_canonical_avatar_persistence'
    });
    
    // STEP 6: Save to user_profile.preferences
    logger.info('AVATAR_SAVE_AUDIT', 'About to call updateProfile with payload', {
      userId: profile.userId,
      payloadSkinToneIncluded: !!payloadToPersist.skin_tone,
      // FINAL PAYLOAD AUDIT BEFORE UPDATE PROFILE CALL
      finalPayloadAuditBeforeUpdateProfile: {
        preferencesKeys: Object.keys(preferencesUpdate),
        skinToneInPreferences: !!preferencesUpdate.skin_tone,
        skinToneStructureInPreferences: preferencesUpdate.skin_tone,
        skinToneLinearF32InPreferences: preferencesUpdate.skin_tone?.linear_f32,
        skinToneSrgbF32InPreferences: preferencesUpdate.skin_tone?.srgb_f32,
        skinToneRgbInPreferences: preferencesUpdate.skin_tone?.rgb,
        skinToneHexInPreferences: preferencesUpdate.skin_tone?.hex,
        avatarVersionInPreferences: preferencesUpdate.avatar_version,
        resolvedGenderInPreferences: preferencesUpdate.resolved_gender
      },
      philosophy: 'pre_update_profile_call_audit'
    });
    
    // STEP 6: Save to user_profile.preferences - updateProfile handles optimistic update + DB confirmation
    try {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          ...payloadToPersist
        }
      });

      logger.info('AVATAR_SAVE_AUDIT', 'updateProfile call completed successfully', {
        userId: profile.userId,
        updateProfileCallSuccess: true,
        payloadKeys: Object.keys(payloadToPersist),
        skinToneIncluded: !!payloadToPersist.skin_tone,
        avatarVersion: payloadToPersist.avatar_version,
        philosophy: 'update_profile_success'
      });
    } catch (updateError) {
      logger.error('AVATAR_SAVE_AUDIT', 'updateProfile call failed - database error', {
        error: updateError instanceof Error ? updateError.message : 'Unknown error',
        stack: updateError instanceof Error ? updateError.stack : undefined,
        userId: profile.userId,
        payloadKeys: Object.keys(payloadToPersist),
        philosophy: 'update_profile_database_failure'
      });
      throw updateError;
    }

    // STEP 7: Also save to body_scans if we have a scan_id (secondary persistence)
    const serverScanId = scanResults?.serverScanId || scanResults?.commit?.scan_id;
    if (serverScanId) {
      logger.info('AVATAR_SAVE_AUDIT', 'About to update body_scans table with complete avatar payload', {
        serverScanId,
        userId: profile.userId,
        skinToneIncluded: !!skinTonePayload,
        skinToneRGB: skinTonePayload?.srgb_u8 ? `rgb(${skinTonePayload.srgb_u8.r}, ${skinTonePayload.srgb_u8.g}, ${skinTonePayload.srgb_u8.b})` : 'none',
        skinToneHex: skinTonePayload?.hex || 'none',
        philosophy: 'body_scans_update_pre_call_audit'
      });
      
      const { data: updatedScan, error } = await supabase
        .from('body_scans')
        .update({
          metrics: {
            ...scanResults.estimate?.extracted_data,
            // Store complete final payload in body_scans
            final_shape_params: finalShapeParams,
            final_limb_masses: finalLimbMasses,
            skin_tone: skinTonePayload,
            resolved_gender: resolvedGender,
            mapping_version: mappingVersion,
            gltf_model_id: gltfModelId,
            material_config_version: materialConfigVersion,
            avatar_version: 'v2.0',
            user_adjusted_morph: finalShapeParams, // Legacy field
            morph_saved_at: new Date().toISOString(),
          }
        })
        .eq('id', serverScanId)
        .select('metrics')
        .single();

      updateError = error;

      // CRITICAL: Verify skin tone was persisted correctly in body_scans
      if (!error && updatedScan?.metrics) {
        const persistedBodyScanSkinTone = updatedScan.metrics.skin_tone;
        const bodyScanSkinTonePersistenceValid = persistedBodyScanSkinTone &&
                                                 persistedBodyScanSkinTone.schema === 'v2' &&
                                                 persistedBodyScanSkinTone.rgb &&
                                                 persistedBodyScanSkinTone.hex &&
                                                 persistedBodyScanSkinTone.srgb_f32 &&
                                                 persistedBodyScanSkinTone.linear_f32;

        logger.info('AVATAR_SAVE_AUDIT', 'Body scans skin tone persistence verification', {
          serverScanId,
          userId: profile.userId,
          bodyScanSkinTonePersistenceValid,
          persistedBodyScanSkinTone,
          expectedSkinTone: skinTonePayload,
          philosophy: 'body_scans_skin_tone_persistence_verification'
        });

        if (!bodyScanSkinTonePersistenceValid) {
          logger.error('AVATAR_SAVE_AUDIT', 'CRITICAL: Body scans skin tone persistence validation failed', {
            serverScanId,
            userId: profile.userId,
            persistedBodyScanSkinTone,
            expectedSkinTone: skinTonePayload,
            philosophy: 'body_scans_skin_tone_persistence_validation_failed'
          });
        }
      }
      
      if (error) {
        logger.error('AVATAR_SAVE_AUDIT', 'Failed to update body_scans table', {
          error: error.message,
          serverScanId,
          userId: profile.userId,
          philosophy: 'body_scans_update_failure_audit'
        });
      } else {
        logger.info('AVATAR_SAVE_AUDIT', 'Successfully updated body_scans table', {
          serverScanId,
          userId: profile.userId,
          philosophy: 'body_scans_update_success_audit'
        });
      }
    }
    
    // CRITICAL: Log final success confirmation
    logger.info('AVATAR_SAVE_V2', 'All V2 canonical persistence operations completed successfully', {
      userId: profile.userId,
      scanId: cleanedPayload.scanId,
      serverScanId,
      feedbackWorked: true,
      philosophy: 'complete_success_with_feedback'
    });

    // STEP 8: Invalidate React Query caches to refresh Scanner and History tabs
    if (queryClient) {
      try {
        // Invalidate body scan queries to refresh Scanner tab
        await queryClient.invalidateQueries({
          queryKey: ['body-scans', 'latest', profile.userId],
          exact: false
        });

        // Invalidate body scan history to refresh History tab
        await queryClient.invalidateQueries({
          queryKey: ['body-scan-history', profile.userId],
          exact: false
        });

        logger.info('AVATAR_SAVE_CACHE', 'Successfully invalidated React Query caches', {
          userId: profile.userId,
          invalidatedQueries: ['body-scans/latest', 'body-scan-history'],
          philosophy: 'cache_invalidation_success'
        });
      } catch (cacheError) {
        logger.error('AVATAR_SAVE_CACHE', 'Cache invalidation failed but save succeeded', {
          error: cacheError instanceof Error ? cacheError.message : 'Unknown error',
          userId: profile.userId,
          philosophy: 'cache_invalidation_failure_non_critical'
        });
        // Don't throw - save succeeded, only cache invalidation failed
      }
    } else {
      logger.warn('AVATAR_SAVE_CACHE', 'queryClient not provided, skipping cache invalidation', {
        userId: profile.userId,
        philosophy: 'cache_invalidation_skipped'
      });
    }

    // CRITICAL: Success feedback MUST work
    try {
      showToast({
        type: 'success',
        title: 'Avatar sauvegardé',
        message: 'Votre avatar a été sauvegardé avec succès',
        duration: 3000,
      });

      // Call success callback
      success();

      logger.info('AVATAR_SAVE_V2', 'Success feedback delivered successfully', {
        userId: profile.userId,
        legacyFieldsPurged: true,
        philosophy: 'v2_canonical_persistence_success_confirmed_before_feedback'
      });

      // Auto-redirect to avatar page after successful save
      if (navigate) {
        setTimeout(() => {
          navigate('/avatar#avatar');
          logger.info('AVATAR_SAVE_V2', 'Auto-redirected to avatar page after save', {
            userId: profile.userId,
            redirectPath: '/avatar#avatar',
            philosophy: 'post_save_auto_redirect'
          });
        }, 1500); // Delay to let user see the success message
      }
    } catch (feedbackError) {
      logger.error('AVATAR_SAVE_V2', 'Success feedback failed but save succeeded', {
        feedbackError: feedbackError instanceof Error ? feedbackError.message : 'Unknown error',
        userId: profile.userId,
        saveSucceeded: true,
        philosophy: 'feedback_failure_but_save_success'
      });
      // Don't throw - save succeeded, only feedback failed
    }
    
  } catch (saveError) {
    // CRITICAL: This catch handles all save failures (database errors, validation errors, etc.)
    logger.error('AVATAR_SAVE', 'Avatar save failed - operation error', {
      error: saveError instanceof Error ? saveError.message : 'Unknown error',
      errorType: saveError instanceof Error ? saveError.constructor.name : typeof saveError,
      stack: saveError instanceof Error ? saveError.stack : undefined,
      userId: profile.userId,
      scanId: scanResults?.serverScanId || scanResults?.commit?.scan_id,
      serverScanId: scanResults?.serverScanId,
      hasSkinTone: !!stableSkinTone,
      philosophy: 'save_operation_failure'
    });

    logger.error('AVATAR_SAVE_AUDIT', 'Avatar save failed - detailed error audit', {
      error: saveError instanceof Error ? saveError.message : 'Unknown error',
      errorName: saveError instanceof Error ? saveError.name : 'UnknownError',
      userId: profile.userId,
      serverScanId: scanResults?.serverScanId,
      stableSkinToneAtFailure: stableSkinTone ? {
        hasRgb: !!stableSkinTone.rgb,
        rgbValue: stableSkinTone.rgb,
        source: stableSkinTone.source,
        schema: stableSkinTone.schema
      } : null,
      payloadPreparationCompleted: !!skinTonePayload,
      philosophy: 'save_failure_detailed_audit'
    });
    
    // Safe error feedback
    try {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Erreur de base de données lors de la sauvegarde',
        duration: 4000,
      });
    } catch (toastError) {
      logger.error('AVATAR_SAVE_AUDIT', 'Error toast also failed', {
        originalError: saveError instanceof Error ? saveError.message : 'Unknown error',
        toastError: toastError instanceof Error ? toastError.message : 'Unknown error',
        userId: profile.userId,
        philosophy: 'error_toast_failure'
      });
      // Can't show toast, but error is logged
    }
    
    // Re-throw only for REAL save failures
    throw saveError;
  }
}

/**
 * Extract readable archetype name from ID
 */
function getArchetypeDisplayName(id: string): string {
  if (!id || typeof id !== 'string' || id === 'unknown') {
    return 'Adaptatif';
  }
  const parts = id.split('-');
  if (parts.length >= 2) {
    return parts[1];
  }
  return id;
}