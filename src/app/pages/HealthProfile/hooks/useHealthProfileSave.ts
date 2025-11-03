/**
 * useHealthProfileSave Hook
 * Centralized save coordination for health profile with error handling and retry
 */

import { useState, useCallback, useRef } from 'react';
import { useUserStore } from '../../../../system/store/userStore';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFeedback } from '../../../../hooks/useFeedback';
import logger from '../../../../lib/utils/logger';
import type { HealthProfileV2 } from '../../../../domain/health';
import {
  analyzeHealthSaveError,
  executeWithRetry,
  validateHealthData,
  HealthSaveErrorType,
} from '../utils/healthSaveErrorHandler';

export type HealthSection =
  | 'basic'
  | 'allergies'
  | 'vaccinations'
  | 'medical_conditions'
  | 'family_history'
  | 'lifestyle'
  | 'vital_signs'
  | 'intimacy'
  | 'geographic';

interface SaveOperation {
  section: HealthSection;
  data: any;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useHealthProfileSave() {
  const { profile, updateProfile, saving: globalSaving } = useUserStore();
  const { showToast } = useToast();
  const { success: playSuccessFeedback } = useFeedback();

  const [savingSection, setSavingSection] = useState<HealthSection | null>(null);
  const [pendingOperations, setPendingOperations] = useState<SaveOperation[]>([]);
  const saveInProgress = useRef(false);

  /**
   * Save a specific health section with retry and error handling
   */
  const saveSection = useCallback(
    async (operation: SaveOperation): Promise<void> => {
      const { section, data, onSuccess, onError } = operation;

      // Prevent concurrent saves
      if (saveInProgress.current) {
        logger.warn('HEALTH_PROFILE_SAVE', 'Save already in progress, queuing operation', {
          section,
          userId: profile?.userId,
        });
        setPendingOperations((prev) => [...prev, operation]);
        return;
      }

      saveInProgress.current = true;
      setSavingSection(section);

      try {
        logger.info('HEALTH_PROFILE_SAVE', `Starting save for section: ${section}`, {
          section,
          userId: profile?.userId,
          dataKeys: Object.keys(data),
          timestamp: new Date().toISOString(),
        });

        // Validate data before save
        const validation = validateHealthData(data, { formName: section.toUpperCase() });
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Execute save with retry logic
        await executeWithRetry(
          async () => {
            const currentHealth = (profile as any)?.health as HealthProfileV2 | undefined;

            // Build updated health object based on section
            let updatedHealth: HealthProfileV2;

            switch (section) {
              case 'basic':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  basic: {
                    ...currentHealth?.basic,
                    ...data,
                  },
                };
                break;

              case 'allergies':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  medical_history: {
                    ...currentHealth?.medical_history,
                    conditions: currentHealth?.medical_history?.conditions || [],
                    medications: currentHealth?.medical_history?.medications || [],
                    allergies: data.allergies || [],
                  },
                };
                break;

              case 'vaccinations':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  vaccinations: {
                    up_to_date: data.up_to_date || false,
                    records: data.records || [],
                    last_reviewed: new Date().toISOString(),
                  },
                };
                break;

              case 'medical_conditions':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  medical_history: {
                    ...currentHealth?.medical_history,
                    conditions: data.conditions || [],
                    medications: data.medications || [],
                    allergies: currentHealth?.medical_history?.allergies || [],
                  },
                  declaredNoIssues: data.declaredNoIssues || false,
                };
                break;

              case 'family_history':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  family_history: data,
                };
                break;

              case 'lifestyle':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  lifestyle: data,
                };
                break;

              case 'vital_signs':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  vital_signs: data,
                };
                break;

              case 'intimacy':
                updatedHealth = {
                  ...currentHealth,
                  version: '2.0' as const,
                  intimacy: data,
                };
                break;

              case 'geographic':
                // Geographic data is stored at profile level, not in health
                await updateProfile({
                  country: data.country,
                  updated_at: new Date().toISOString(),
                });
                return; // Exit early, no health update needed

              default:
                throw new Error(`Unknown health section: ${section}`);
            }

            // Save to database
            await updateProfile({
              health: updatedHealth,
              updated_at: new Date().toISOString(),
            });

            logger.info('HEALTH_PROFILE_SAVE', `Successfully saved section: ${section}`, {
              section,
              userId: profile?.userId,
              timestamp: new Date().toISOString(),
            });
          },
          {
            formName: section.toUpperCase(),
            userId: profile?.userId,
          }
        );

        // Success feedback
        playSuccessFeedback();
        showToast({
          type: 'success',
          title: 'Sauvegardé',
          message: getSectionSuccessMessage(section),
          duration: 3000,
        });

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        logger.error('HEALTH_PROFILE_SAVE', `Failed to save section: ${section}`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          section,
          userId: profile?.userId,
          timestamp: new Date().toISOString(),
        });

        // Analyze and display error
        const analyzedError = analyzeHealthSaveError(error, {
          formName: section.toUpperCase(),
          userId: profile?.userId,
          data,
        });

        showToast({
          type: 'error',
          title: getErrorTitle(analyzedError.type),
          message: analyzedError.userMessage,
          duration: 5000,
        });

        if (onError) {
          onError(analyzedError);
        }

        throw error;
      } finally {
        saveInProgress.current = false;
        setSavingSection(null);

        // Process pending operations
        setPendingOperations((prev) => {
          if (prev.length > 0) {
            const [nextOp, ...rest] = prev;
            setTimeout(() => saveSection(nextOp), 100);
            return rest;
          }
          return prev;
        });
      }
    },
    [profile, updateProfile, showToast, playSuccessFeedback]
  );

  /**
   * Check if a specific section is currently saving
   */
  const isSectionSaving = useCallback(
    (section: HealthSection): boolean => {
      return savingSection === section || globalSaving;
    },
    [savingSection, globalSaving]
  );

  /**
   * Check if any section is saving
   */
  const isAnySectionSaving = useCallback((): boolean => {
    return savingSection !== null || globalSaving || pendingOperations.length > 0;
  }, [savingSection, globalSaving, pendingOperations.length]);

  return {
    saveSection,
    isSectionSaving,
    isAnySectionSaving,
    savingSection,
    pendingOperationsCount: pendingOperations.length,
  };
}

function getSectionSuccessMessage(section: HealthSection): string {
  const messages: Record<HealthSection, string> = {
    basic: 'Informations de base sauvegardées',
    allergies: 'Allergies sauvegardées',
    vaccinations: 'Vaccinations sauvegardées',
    medical_conditions: 'Conditions médicales sauvegardées',
    family_history: 'Antécédents familiaux sauvegardés',
    lifestyle: 'Informations de vie sauvegardées',
    vital_signs: 'Signes vitaux sauvegardés',
    intimacy: 'Informations intimes sauvegardées',
    geographic: 'Données géographiques sauvegardées',
  };
  return messages[section] || 'Informations sauvegardées';
}

function getErrorTitle(errorType: HealthSaveErrorType): string {
  const titles: Record<HealthSaveErrorType, string> = {
    VALIDATION: 'Erreur de validation',
    NETWORK: 'Erreur réseau',
    PERMISSION: 'Erreur de permissions',
    DATABASE: 'Erreur de base de données',
    UNKNOWN: 'Erreur inconnue',
  };
  return titles[errorType] || 'Erreur';
}

export default useHealthProfileSave;
