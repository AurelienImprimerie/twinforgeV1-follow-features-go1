/**
 * Profile Health Form Hook
 * Custom hook for managing profile health form state and operations
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserStore } from '../../../../system/store/userStore';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFeedback } from '../../../../hooks/useFeedback';
import logger from '../../../../lib/utils/logger';
import { healthSchema, type HealthForm } from '../validation/profileHealthValidation';
import { useUnsavedChangesStore } from '../../../../system/store/unsavedChangesStore';

export function useProfileHealthForm() {
  const { profile, updateProfile, saving } = useUserStore();
  const { showToast } = useToast();
  const { success, formSubmit } = useFeedback();
  const [sectionSaving, setSectionSaving] = React.useState<string | null>(null);

  // Initialize form with current health data
  const form = useForm<HealthForm>({
    resolver: zodResolver(healthSchema),
    defaultValues: {
      bloodType: profile?.health?.bloodType || undefined,
      conditions: profile?.health?.conditions || [],
      medications: profile?.health?.medications || [],
      constraints: profile?.constraints ? Object.values(profile.constraints) : [],
      physicalLimitations: profile?.health?.physicalLimitations || [],
      declaredNoIssues: profile?.health?.declaredNoIssues || false,
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, formState, watch, setValue, reset, trigger } = form;
  const { errors, isDirty, dirtyFields } = formState;
  const watchedValues = watch();

  // Track unsaved changes
  React.useEffect(() => {
    useUnsavedChangesStore.getState().setTabDirty('health', isDirty);
  }, [isDirty]);

  // REMOVED: Reset effect that was causing unnecessary re-renders and false auto-save triggers
  // The form is now initialized once with defaultValues and only resets on explicit save success

  // Section-specific save handlers
  const saveBasicHealthSection = async () => {
    setSectionSaving('basic');
    try {
      await updateProfile({
        health: {
          ...profile?.health,
          bloodType: watchedValues.bloodType,
        },
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Informations de base sauvegardées',
        message: 'Vos données médicales de base ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les informations de base',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const saveMedicalSection = async () => {
    setSectionSaving('medical');
    try {
      await updateProfile({
        health: {
          ...profile?.health,
          conditions: watchedValues.conditions,
          medications: watchedValues.medications,
          physicalLimitations: watchedValues.physicalLimitations,
          declaredNoIssues: watchedValues.declaredNoIssues,
        },
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Données médicales sauvegardées',
        message: 'Vos conditions et médicaments ont été mis à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les données médicales',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const saveConstraintsSection = async () => {
    setSectionSaving('constraints');
    try {
      // Convert array to object for constraints field
      const constraintsObj = (watchedValues.constraints || []).reduce((acc, constraint, index) => {
        acc[`constraint_${index}`] = constraint;
        return acc;
      }, {} as Record<string, string>);

      await updateProfile({
        constraints: constraintsObj,
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Contraintes sauvegardées',
        message: 'Vos contraintes alimentaires ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les contraintes',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const onSubmit = async (data: HealthForm) => {
    try {
      formSubmit();
      
      logger.info('PROFILE_HEALTH', 'Submitting complete health updates', {
        userId: profile?.userId,
        philosophy: 'complete_health_submission'
      });

      // Convert constraints array to object
      const constraintsObj = (data.constraints || []).reduce((acc, constraint, index) => {
        acc[`constraint_${index}`] = constraint;
        return acc;
      }, {} as Record<string, string>);

      await updateProfile({
        health: {
          ...profile?.health,
          bloodType: data.bloodType,
          conditions: data.conditions,
          medications: data.medications,
          physicalLimitations: data.physicalLimitations,
          declaredNoIssues: data.declaredNoIssues,
        },
        constraints: constraintsObj,
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Profil santé sauvegardé',
        message: 'Toutes vos données de santé ont été mises à jour',
        duration: 4000,
      });

      // Reset unsaved changes tracking
      useUnsavedChangesStore.getState().resetTabDirty('health');

    } catch (error) {
      logger.error('PROFILE_HEALTH', 'Health update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: profile?.userId,
      });

      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder votre profil santé',
        duration: 4000,
      });
    }
  };

  // Check for section changes
  const hasBasicChanges = !!(dirtyFields.bloodType);
  const hasMedicalChanges = !!(dirtyFields.conditions || dirtyFields.medications || dirtyFields.physicalLimitations);
  const hasConstraintsChanges = !!(dirtyFields.constraints);

  return {
    form: {
      register,
      handleSubmit,
      errors,
      isDirty,
      dirtyFields,
      watchedValues,
      setValue,
      trigger
    },
    actions: {
      saveBasicHealthSection,
      saveMedicalSection,
      saveConstraintsSection,
      onSubmit
    },
    state: {
      saving,
      sectionSaving,
      hasBasicChanges,
      hasMedicalChanges,
      hasConstraintsChanges
    }
  };
}