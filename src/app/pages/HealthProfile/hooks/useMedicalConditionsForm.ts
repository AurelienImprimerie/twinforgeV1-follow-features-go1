/**
 * useMedicalConditionsForm Hook
 * Manages medical conditions and medications form state with improved error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../../../../system/store/userStore';
import type { HealthProfileV2 } from '../../../../domain/health';
import logger from '../../../../lib/utils/logger';
import { useHealthProfileSave } from './useHealthProfileSave';
import { useHealthFormDirtyState } from './useHealthFormDirtyState';

export function useMedicalConditionsForm() {
  const { profile } = useUserStore();
  const { saveSection, isSectionSaving } = useHealthProfileSave();
  const health = (profile as any)?.health as HealthProfileV2 | undefined;

  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [hasDeclaredNoIssues, setHasDeclaredNoIssues] = useState(false);
  const [initialState, setInitialState] = useState({
    conditions: [] as string[],
    medications: [] as string[],
    hasDeclaredNoIssues: false,
  });

  // Initialize from profile
  useEffect(() => {
    const conditionsData = health?.medical_history?.conditions || [];
    const medicationsData = health?.medical_history?.medications || [];
    const declaredNoIssues = health?.declaredNoIssues || false;

    setConditions(conditionsData);
    setMedications(medicationsData);
    setHasDeclaredNoIssues(declaredNoIssues);

    // Always update initial state when database values change
    setInitialState({
      conditions: conditionsData,
      medications: medicationsData,
      hasDeclaredNoIssues: declaredNoIssues,
    });

    logger.debug('MEDICAL_CONDITIONS_FORM', 'Initialized from database', {
      conditionsCount: conditionsData.length,
      medicationsCount: medicationsData.length,
      declaredNoIssues,
      timestamp: new Date().toISOString(),
    });
  }, [
    health?.medical_history?.conditions,
    health?.medical_history?.medications,
    health?.declaredNoIssues,
  ]);

  // Use intelligent dirty state detection
  const { isDirty, changedFieldsCount, resetDirtyState } = useHealthFormDirtyState({
    currentValues: { conditions, medications, hasDeclaredNoIssues },
    initialValues: initialState,
    formName: 'MEDICAL_CONDITIONS',
  });

  const addCondition = useCallback(() => {
    if (newCondition.trim()) {
      setConditions(prev => [...prev, newCondition.trim()]);
      setNewCondition('');
      if (hasDeclaredNoIssues) {
        setHasDeclaredNoIssues(false);
      }
      logger.info('MEDICAL_CONDITIONS_FORM', 'Added condition', {
        condition: newCondition.trim(),
      });
    }
  }, [newCondition, hasDeclaredNoIssues]);

  const removeCondition = useCallback((index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
    logger.info('MEDICAL_CONDITIONS_FORM', 'Removed condition', { index });
  }, []);

  const addMedication = useCallback(() => {
    if (newMedication.trim()) {
      setMedications(prev => [...prev, newMedication.trim()]);
      setNewMedication('');
      if (hasDeclaredNoIssues) {
        setHasDeclaredNoIssues(false);
      }
      logger.info('MEDICAL_CONDITIONS_FORM', 'Added medication', {
        medication: newMedication.trim(),
      });
    }
  }, [newMedication, hasDeclaredNoIssues]);

  const removeMedication = useCallback((index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
    logger.info('MEDICAL_CONDITIONS_FORM', 'Removed medication', { index });
  }, []);

  const declareNoIssues = useCallback(async () => {
    try {
      logger.info('MEDICAL_CONDITIONS_FORM', 'Declaring no health issues');

      await saveSection({
        section: 'medical_conditions',
        data: {
          conditions: [],
          medications: [],
          declaredNoIssues: true,
        },
        onSuccess: () => {
          setConditions([]);
          setMedications([]);
          setHasDeclaredNoIssues(true);
          setInitialState({
            conditions: [],
            medications: [],
            hasDeclaredNoIssues: true,
          });
          resetDirtyState({
            conditions: [],
            medications: [],
            hasDeclaredNoIssues: true,
          });
          logger.info('MEDICAL_CONDITIONS_FORM', 'Successfully declared no issues');
        },
      });
    } catch (error) {
      logger.error('MEDICAL_CONDITIONS_FORM', 'Failed to declare no issues', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [saveSection, resetDirtyState]);

  const saveChanges = useCallback(async () => {
    try {
      logger.info('MEDICAL_CONDITIONS_FORM', 'Saving medical conditions and medications', {
        conditionsCount: conditions.length,
        medicationsCount: medications.length,
        declaredNoIssues: hasDeclaredNoIssues,
      });

      await saveSection({
        section: 'medical_conditions',
        data: {
          conditions,
          medications,
          declaredNoIssues: conditions.length === 0 && medications.length === 0 ? hasDeclaredNoIssues : false,
        },
        onSuccess: () => {
          setInitialState({ conditions, medications, hasDeclaredNoIssues });
          resetDirtyState({ conditions, medications, hasDeclaredNoIssues });
          logger.info('MEDICAL_CONDITIONS_FORM', 'Successfully saved and reset dirty state', {
            conditionsCount: conditions.length,
            medicationsCount: medications.length,
          });
        },
      });
    } catch (error) {
      logger.error('MEDICAL_CONDITIONS_FORM', 'Save failed (already handled by saveSection)', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [conditions, medications, hasDeclaredNoIssues, saveSection, resetDirtyState]);

  return {
    conditions,
    medications,
    newCondition,
    newMedication,
    setNewCondition,
    setNewMedication,
    addCondition,
    removeCondition,
    addMedication,
    removeMedication,
    declareNoIssues,
    hasDeclaredNoIssues,
    saveChanges,
    saving: isSectionSaving('medical_conditions'),
    isDirty,
    changedFieldsCount,
  };
}
