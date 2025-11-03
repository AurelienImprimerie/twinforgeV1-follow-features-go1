/**
 * Profile Identity Form Hook
 * Custom hook for managing profile identity form state and operations
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserStore } from '../../../../system/store/userStore';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFeedback } from '../../../../hooks/useFeedback';
import { profileIdentitySchema, type ProfileIdentityForm } from '../validation/profileIdentityValidation';
import logger from '../../../../lib/utils/logger';
import { useUnsavedChangesStore } from '../../../../system/store/unsavedChangesStore';

export function useProfileIdentityForm() {
  const { profile, updateProfile, saving } = useUserStore();
  const { showToast } = useToast();
  const { success, formSubmit } = useFeedback();
  const [sectionSaving, setSectionSaving] = React.useState<string | null>(null);

  // Initialize form with current profile data
  const form = useForm<ProfileIdentityForm>({
    resolver: zodResolver(profileIdentitySchema),
    defaultValues: {
      displayName: profile?.displayName || '',
      sex: profile?.sex || '',
      height_cm: profile?.height_cm ?? null,
      weight_kg: profile?.weight_kg ?? null,
      birthdate: profile?.birthdate || null,
      target_weight_kg: profile?.target_weight_kg ?? null,
      activity_level: profile?.activity_level || null,
      objective: profile?.objective || null,
      job_category: profile?.job_category || null,
      phone_number: profile?.phoneNumber || null,
      country: profile?.country || null,
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, formState, watch, setValue, reset, trigger } = form;
  const { errors, isValid, isDirty, dirtyFields } = formState;
  const watchedValues = watch();

  // Track unsaved changes
  React.useEffect(() => {
    useUnsavedChangesStore.getState().setTabDirty('identity', isDirty);
  }, [isDirty]);

  // Auto-save has been removed - manual save only

  // Section-specific save handlers
  const saveRequiredSection = async () => {
    setSectionSaving('required');
    try {
      const isRequiredValid = await trigger(['displayName', 'sex', 'height_cm', 'weight_kg']);
      if (!isRequiredValid) return;

      await updateProfile({
        displayName: watchedValues.displayName,
        sex: watchedValues.sex,
        height_cm: watchedValues.height_cm,
        weight_kg: watchedValues.weight_kg,
        updated_at: new Date().toISOString(),
      });

      // Reset form with new values to clear dirty state
      reset({
        displayName: watchedValues.displayName,
        sex: watchedValues.sex,
        height_cm: watchedValues.height_cm,
        weight_kg: watchedValues.weight_kg,
        birthdate: watchedValues.birthdate,
        target_weight_kg: watchedValues.target_weight_kg,
        activity_level: watchedValues.activity_level,
        objective: watchedValues.objective,
        job_category: watchedValues.job_category,
        phone_number: watchedValues.phone_number,
        country: watchedValues.country,
      });

      // Reset unsaved changes tracking for this tab
      useUnsavedChangesStore.getState().resetTabDirty('identity');

      success();
      showToast({
        type: 'success',
        title: 'Informations de base sauvegardées',
        message: 'Vos informations essentielles ont été mises à jour',
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

  const saveOptionalSection = async () => {
    setSectionSaving('optional');
    try {
      logger.jsonLog('PROFILE_IDENTITY_SAVE_OPTIONAL', 'Starting optional section save', {
        watchedValues: {
          birthdate: watchedValues.birthdate,
          target_weight_kg: watchedValues.target_weight_kg,
          activity_level: watchedValues.activity_level,
          objective: watchedValues.objective,
          job_category: watchedValues.job_category,
          phone_number: watchedValues.phone_number,
          country: watchedValues.country,
        },
        timestamp: new Date().toISOString()
      });

      await updateProfile({
        birthdate: watchedValues.birthdate || null,
        target_weight_kg: watchedValues.target_weight_kg || null,
        activity_level: watchedValues.activity_level || null,
        objective: watchedValues.objective || null,
        job_category: watchedValues.job_category || null,
        phoneNumber: watchedValues.phone_number || null,
        country: watchedValues.country || null,
        updated_at: new Date().toISOString(),
      });

      // Reset form with new values to clear dirty state
      reset({
        displayName: watchedValues.displayName,
        sex: watchedValues.sex,
        height_cm: watchedValues.height_cm,
        weight_kg: watchedValues.weight_kg,
        birthdate: watchedValues.birthdate,
        target_weight_kg: watchedValues.target_weight_kg,
        activity_level: watchedValues.activity_level,
        objective: watchedValues.objective,
        job_category: watchedValues.job_category,
        phone_number: watchedValues.phone_number,
        country: watchedValues.country,
      });

      // Reset unsaved changes tracking for this tab
      useUnsavedChangesStore.getState().resetTabDirty('identity');

      logger.jsonLog('PROFILE_IDENTITY_SAVE_OPTIONAL_SUCCESS', 'Optional section save completed', {
        timestamp: new Date().toISOString()
      });

      success();
      showToast({
        type: 'success',
        title: 'Informations complémentaires sauvegardées',
        message: 'Vos préférences ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les informations complémentaires',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const onSubmit = async (data: ProfileIdentityForm) => {
    try {
      formSubmit();
      
      logger.info('PROFILE_IDENTITY', 'Submitting complete profile updates', {
        userId: profile?.userId,
        philosophy: 'complete_profile_submission'
      });

      await updateProfile({
        displayName: data.displayName,
        sex: data.sex,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        birthdate: data.birthdate || null,
        target_weight_kg: data.target_weight_kg || null,
        activity_level: data.activity_level || null,
        objective: data.objective || null,
        job_category: data.job_category || null,
        phoneNumber: data.phone_number || null,
        country: data.country || null,
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Profil complet sauvegardé',
        message: 'Toutes vos informations ont été mises à jour',
        duration: 4000,
      });

      // Reset unsaved changes tracking
      useUnsavedChangesStore.getState().resetTabDirty('identity');

      // Reset form after successful save to clear isDirty state
      reset({
        displayName: data.displayName || '',
        sex: data.sex || '',
        height_cm: data.height_cm || null,
        weight_kg: data.weight_kg || null,
        birthdate: data.birthdate || null,
        target_weight_kg: data.target_weight_kg || null,
        activity_level: data.activity_level || null,
        objective: data.objective || null,
        job_category: data.job_category || null,
        phone_number: data.phone_number || null,
        country: data.country || null,
      });

    } catch (error) {
      logger.error('PROFILE_IDENTITY', 'Profile update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: profile?.userId,
      });

      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder votre profil',
        duration: 4000,
      });
    }
  };

  // Check for section changes
  const hasRequiredChanges = !!(dirtyFields.displayName || dirtyFields.sex || dirtyFields.height_cm || dirtyFields.weight_kg);
  const hasOptionalChanges = !!(dirtyFields.birthdate || dirtyFields.target_weight_kg || dirtyFields.activity_level || dirtyFields.objective || dirtyFields.job_category || dirtyFields.phone_number || dirtyFields.country);

  return {
    form: {
      register,
      handleSubmit,
      errors,
      isValid,
      isDirty,
      dirtyFields,
      watchedValues,
      setValue,
      trigger
    },
    actions: {
      saveRequiredSection,
      saveOptionalSection,
      onSubmit
    },
    state: {
      saving,
      sectionSaving,
      hasRequiredChanges,
      hasOptionalChanges
    }
  };
}