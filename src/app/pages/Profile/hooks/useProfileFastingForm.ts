/**
 * Profile Fasting Form Hook
 * Custom hook for managing profile fasting form state and operations
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserStore } from '../../../../system/store/userStore';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFeedback } from '../../../../hooks/useFeedback';
import logger from '../../../../lib/utils/logger';
import { calculateProteinTarget, canCalculateProteinTarget } from '../../../../lib/nutrition/proteinCalculator';
import { getProtocolById, suggestFastingTimes } from '../../../../lib/nutrition/fastingProtocols';
import { fastingSchema, type FastingForm } from '../validation/profileFastingValidation';
import { useUnsavedChangesStore } from '../../../../system/store/unsavedChangesStore';

export function useProfileFastingForm() {
  const { profile, updateProfile, saving } = useUserStore();
  const { showToast } = useToast();
  const { success, formSubmit } = useFeedback();
  const [sectionSaving, setSectionSaving] = React.useState<string | null>(null);

  // Calculer la cible de protéines automatiquement
  const proteinCalculation = React.useMemo(() => {
    if (canCalculateProteinTarget(profile)) {
      return calculateProteinTarget(profile);
    }
    return null;
  }, [profile?.weight_kg, profile?.objective, profile?.activity_level]);

  // État pour le protocole de jeûne sélectionné
  const [selectedFastingProtocol, setSelectedFastingProtocol] = React.useState<string>('');

  // Initialize form with current fasting data
  const form = useForm<FastingForm>({
    resolver: zodResolver(fastingSchema),
    defaultValues: {
      fastingWindow: {
        start: profile?.fastingWindow?.start || '',
        end: profile?.fastingWindow?.end || '',
        windowHours: profile?.fastingWindow?.windowHours || undefined,
        mealsPerDay: profile?.fastingWindow?.mealsPerDay || undefined,
        protocol: profile?.fastingWindow?.protocol || '',
      },
      proteinTarget_g: profile?.nutrition?.proteinTarget_g || proteinCalculation?.recommended || undefined,
      caloriesTarget: profile?.macroTargets?.kcal || undefined,
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, formState, watch, setValue, reset, trigger } = form;
  const { errors, isDirty, dirtyFields } = formState;
  const watchedValues = watch();

  // Track unsaved changes
  React.useEffect(() => {
    useUnsavedChangesStore.getState().setTabDirty('fasting', isDirty);
  }, [isDirty]);

  // Reset form when profile changes
  React.useEffect(() => {
    if (profile && !isDirty) {
      reset({
        fastingWindow: {
          start: profile.fastingWindow?.start || '',
          end: profile.fastingWindow?.end || '',
          windowHours: profile.fastingWindow?.windowHours || undefined,
          mealsPerDay: profile.fastingWindow?.mealsPerDay || undefined,
          protocol: profile.fastingWindow?.protocol || '',
        },
        proteinTarget_g: profile.nutrition?.proteinTarget_g || proteinCalculation?.recommended || undefined,
        caloriesTarget: profile.macroTargets?.kcal || undefined,
      });
    }
  }, [profile, isDirty, reset]);

  // Synchronize selectedFastingProtocol with form's watched value
  React.useEffect(() => {
    if (watchedValues.fastingWindow?.protocol !== undefined) {
      setSelectedFastingProtocol(watchedValues.fastingWindow.protocol);
    }
  }, [watchedValues.fastingWindow?.protocol]);

  // Gérer le changement de protocole de jeûne
  const handleFastingProtocolChange = (protocolId: string) => {
    setSelectedFastingProtocol(protocolId);
    
    if (protocolId === 'custom') {
      // Mode personnalisé - ne pas modifier les valeurs existantes
      setValue('fastingWindow.protocol', protocolId, { shouldDirty: true });
      return;
    }
    
    if (protocolId === '') {
      // Aucun protocole - réinitialiser
      setValue('fastingWindow.protocol', '', { shouldDirty: true });
      setValue('fastingWindow.windowHours', undefined, { shouldDirty: true });
      setValue('fastingWindow.start', '', { shouldDirty: true });
      setValue('fastingWindow.end', '', { shouldDirty: true });
      return;
    }

    const protocol = getProtocolById(protocolId);
    if (protocol) {
      // Appliquer le protocole sélectionné
      setValue('fastingWindow.protocol', protocolId, { shouldDirty: true });
      setValue('fastingWindow.windowHours', protocol.windowHours, { shouldDirty: true });
      
      // Suggérer des horaires basés sur le chronotype
      const chronotype = profile?.emotions?.chronotype;
      const suggestedTimes = suggestFastingTimes(protocol, chronotype);
      setValue('fastingWindow.start', suggestedTimes.start, { shouldDirty: true });
      setValue('fastingWindow.end', suggestedTimes.end, { shouldDirty: true });
    }
  };

  // Réinitialiser la cible de protéines à la valeur calculée
  const resetProteinTarget = () => {
    if (proteinCalculation) {
      setValue('proteinTarget_g', proteinCalculation.recommended, { shouldDirty: true });
    }
  };

  // Section-specific save handlers
  const saveFastingSection = async () => {
    setSectionSaving('fasting');
    try {
      await updateProfile({
        fastingWindow: watchedValues.fastingWindow,
        updated_at: new Date().toISOString(),
      });

      // Reset form to clear dirty state
      reset({
        fastingWindow: watchedValues.fastingWindow,
        proteinTarget_g: watchedValues.proteinTarget_g,
        caloriesTarget: watchedValues.caloriesTarget,
      });

      // Reset unsaved changes tracking for this tab
      useUnsavedChangesStore.getState().resetTabDirty('fasting');

      success();
      showToast({
        type: 'success',
        title: 'Protocole de jeûne sauvegardé',
        message: 'Votre fenêtre de jeûne a été mise à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder le protocole de jeûne',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const saveObjectivesSection = async () => {
    setSectionSaving('objectives');
    try {
      await updateProfile({
        nutrition: {
          ...profile?.nutrition,
          proteinTarget_g: watchedValues.proteinTarget_g,
        },
        macroTargets: {
          ...profile?.macroTargets,
          kcal: watchedValues.caloriesTarget,
        },
        updated_at: new Date().toISOString(),
      });

      // Reset form to clear dirty state
      reset({
        fastingWindow: watchedValues.fastingWindow,
        proteinTarget_g: watchedValues.proteinTarget_g,
        caloriesTarget: watchedValues.caloriesTarget,
      });

      // Reset unsaved changes tracking for this tab
      useUnsavedChangesStore.getState().resetTabDirty('fasting');

      success();
      showToast({
        type: 'success',
        title: 'Objectifs nutritionnels sauvegardés',
        message: 'Vos cibles ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les objectifs',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const onSubmit = async (data: FastingForm) => {
    try {
      formSubmit();
      
      logger.info('PROFILE_FASTING', 'Submitting complete fasting updates', {
        userId: profile?.userId,
        philosophy: 'complete_fasting_submission'
      });

      await updateProfile({
        fastingWindow: data.fastingWindow,
        nutrition: {
          ...profile?.nutrition,
          proteinTarget_g: data.proteinTarget_g,
        },
        macroTargets: {
          ...profile?.macroTargets,
          kcal: data.caloriesTarget,
        },
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Profil de jeûne sauvegardé',
        message: 'Toutes vos données de jeûne ont été mises à jour',
        duration: 4000,
      });

      // Reset unsaved changes tracking
      useUnsavedChangesStore.getState().resetTabDirty('fasting');

    } catch (error) {
      logger.error('PROFILE_FASTING', 'Fasting update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: profile?.userId,
      });

      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder votre profil de jeûne',
        duration: 4000,
      });
    }
  };

  // Check for section changes
  const hasFastingChanges = !!(dirtyFields.fastingWindow);
  const hasObjectivesChanges = !!(dirtyFields.proteinTarget_g || dirtyFields.caloriesTarget);

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
      saveFastingSection,
      saveObjectivesSection,
      onSubmit
    },
    state: {
      saving,
      sectionSaving,
      hasFastingChanges,
      hasObjectivesChanges
    },
    helpers: {
      proteinCalculation,
      selectedFastingProtocol,
      handleFastingProtocolChange,
      resetProteinTarget
    }
  };
}