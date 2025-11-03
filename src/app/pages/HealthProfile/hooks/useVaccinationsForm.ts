/**
 * Vaccinations Form Hook
 * Manages vaccination state and interactions with improved error handling
 */

import React from 'react';
import { useUserStore } from '../../../../system/store/userStore';
import logger from '../../../../lib/utils/logger';
import type { VaccinationRecord, HealthProfileV2, CountryHealthData } from '../../../../domain/health';
import { useHealthProfileSave } from './useHealthProfileSave';
import { useHealthFormDirtyState } from './useHealthFormDirtyState';

export function useVaccinationsForm(countryData: CountryHealthData | null) {
  const { profile } = useUserStore();
  const { saveSection, isSectionSaving } = useHealthProfileSave();

  // Extract V2 health data
  const healthV2 = (profile as any)?.health as HealthProfileV2 | undefined;
  const [vaccinations, setVaccinations] = React.useState<VaccinationRecord[]>([]);
  const [upToDate, setUpToDate] = React.useState(false);
  const [initialState, setInitialState] = React.useState({
    vaccinations: [] as VaccinationRecord[],
    upToDate: false,
  });

  const handleAddVaccination = (vaccination: VaccinationRecord) => {
    setVaccinations((prev) => [...prev, vaccination]);
    logger.info('VACCINATIONS_FORM', 'Added vaccination', { name: vaccination.name });
  };

  const handleUpdateVaccination = (index: number, vaccination: VaccinationRecord) => {
    setVaccinations((prev) => {
      const updated = [...prev];
      updated[index] = vaccination;
      return updated;
    });
    logger.info('VACCINATIONS_FORM', 'Updated vaccination', { index, name: vaccination.name });
  };

  const handleRemoveVaccination = (index: number) => {
    setVaccinations((prev) => prev.filter((_, i) => i !== index));
    logger.info('VACCINATIONS_FORM', 'Removed vaccination', { index });
  };

  // Initialize from database
  React.useEffect(() => {
    const records = healthV2?.vaccinations?.records || [];
    const isUpToDate = healthV2?.vaccinations?.up_to_date || false;

    setVaccinations(records);
    setUpToDate(isUpToDate);

    // Always update initial state when database values change
    setInitialState({
      vaccinations: records,
      upToDate: isUpToDate,
    });

    logger.debug('VACCINATIONS_FORM', 'Initialized vaccinations from database', {
      recordsCount: records.length,
      upToDate: isUpToDate,
      timestamp: new Date().toISOString(),
    });
  }, [healthV2?.vaccinations?.records, healthV2?.vaccinations?.up_to_date]);

  // Use intelligent dirty state detection
  const { isDirty, changedFieldsCount, resetDirtyState } = useHealthFormDirtyState({
    currentValues: { vaccinations, upToDate },
    initialValues: initialState,
    formName: 'VACCINATIONS',
  });

  const handleToggleUpToDate = (checked: boolean) => {
    setUpToDate(checked);
    logger.info('VACCINATIONS_FORM', 'Toggled up to date status', { checked });
  };

  const handleSave = async () => {
    try {
      logger.info('VACCINATIONS_FORM', 'Saving vaccinations', {
        userId: profile?.userId,
        count: vaccinations.length,
        upToDate,
      });

      await saveSection({
        section: 'vaccinations',
        data: {
          up_to_date: upToDate,
          records: vaccinations,
        },
        onSuccess: () => {
          setInitialState({ vaccinations, upToDate });
          resetDirtyState({ vaccinations, upToDate });
          logger.info('VACCINATIONS_FORM', 'Successfully saved and reset dirty state', {
            recordsCount: vaccinations.length,
            upToDate,
          });
        },
      });
    } catch (error) {
      logger.error('VACCINATIONS_FORM', 'Save failed (already handled by saveSection)', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return {
    vaccinations,
    upToDate,
    onAddVaccination: handleAddVaccination,
    onUpdateVaccination: handleUpdateVaccination,
    onRemoveVaccination: handleRemoveVaccination,
    onToggleUpToDate: handleToggleUpToDate,
    onSave: handleSave,
    isSaving: isSectionSaving('vaccinations'),
    isDirty,
    changedFieldsCount,
  };
}
