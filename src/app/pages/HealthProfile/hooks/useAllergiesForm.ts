/**
 * Allergies Form Hook
 * Manages allergies state and operations with improved error handling
 */

import React from 'react';
import { useUserStore } from '../../../../system/store/userStore';
import logger from '../../../../lib/utils/logger';
import type { HealthProfileV2 } from '../../../../domain/health';
import { useHealthProfileSave } from './useHealthProfileSave';
import { useHealthFormDirtyState } from './useHealthFormDirtyState';

interface Allergy {
  name: string;
  category: 'food' | 'medication' | 'environmental';
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
}

export function useAllergiesForm() {
  const { profile } = useUserStore();
  const { saveSection, isSectionSaving } = useHealthProfileSave();

  // Extract V2 health data
  const healthV2 = (profile as any)?.health as HealthProfileV2 | undefined;

  // Parse allergies from medical_history.allergies (string array) to structured format
  const [allergies, setAllergies] = React.useState<Allergy[]>([]);
  const [initialAllergies, setInitialAllergies] = React.useState<Allergy[]>([]);

  // Initialize allergies from database
  React.useEffect(() => {
    const storedAllergies = healthV2?.medical_history?.allergies || [];
    const parsedAllergies: Allergy[] = storedAllergies.map(name => ({
      name,
      category: 'food' as const,
      severity: 'mild' as const,
    }));

    setAllergies(parsedAllergies);

    // Always update initial state when database values change
    setInitialAllergies(parsedAllergies);

    logger.debug('ALLERGIES_FORM', 'Initialized allergies from database', {
      count: parsedAllergies.length,
      allergies: parsedAllergies,
      timestamp: new Date().toISOString(),
    });
  }, [healthV2?.medical_history?.allergies]);

  // Use intelligent dirty state detection
  const { isDirty, changedFieldsCount, resetDirtyState } = useHealthFormDirtyState({
    currentValues: { allergies },
    initialValues: { allergies: initialAllergies },
    formName: 'ALLERGIES',
  });

  const handleAddAllergy = (allergy: Allergy) => {
    setAllergies((prev) => [...prev, allergy]);
    logger.info('ALLERGIES_FORM', 'Added allergy', {
      name: allergy.name,
      category: allergy.category,
      severity: allergy.severity,
    });
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies((prev) => prev.filter((_, i) => i !== index));
    logger.info('ALLERGIES_FORM', 'Removed allergy', { index });
  };

  const handleSave = async () => {
    try {
      logger.info('ALLERGIES_FORM', 'Saving allergies', {
        userId: profile?.userId,
        count: allergies.length,
        allergies: allergies.map(a => a.name),
      });

      // Convert structured allergies to string array for database
      const allergyNames = allergies.map(a => a.name);

      await saveSection({
        section: 'allergies',
        data: { allergies: allergyNames },
        onSuccess: () => {
          setInitialAllergies(allergies);
          resetDirtyState({ allergies });
          logger.info('ALLERGIES_FORM', 'Successfully saved and reset dirty state', {
            count: allergies.length,
          });
        },
      });
    } catch (error) {
      logger.error('ALLERGIES_FORM', 'Save failed (already handled by saveSection)', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return {
    allergies,
    onAddAllergy: handleAddAllergy,
    onRemoveAllergy: handleRemoveAllergy,
    onSave: handleSave,
    isSaving: isSectionSaving('allergies'),
    isDirty,
    changedFieldsCount,
  };
}
