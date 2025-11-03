/**
 * Profile Nutrition Form Hook - Enhanced for Recipe Workshop
 * Custom hook for managing enhanced nutrition form state and operations
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserStore } from '../../../../system/store/userStore';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFeedback } from '../../../../hooks/useFeedback';
import logger from '../../../../lib/utils/logger';
import { enhancedNutritionSchema, type EnhancedNutritionForm } from '../validation/profileNutritionValidation';
import { useUnsavedChangesStore } from '../../../../system/store/unsavedChangesStore';

export function useProfileNutritionForm() {
  const { profile, updateProfile, saving } = useUserStore();
  const { showToast } = useToast();
  const { success, formSubmit } = useFeedback();
  const [sectionSaving, setSectionSaving] = React.useState<string | null>(null);

  // Initialize form with current nutrition data
  const form = useForm<EnhancedNutritionForm>({
    resolver: zodResolver(enhancedNutritionSchema),
    defaultValues: {
      // Existing fields
      diet: profile?.nutrition?.diet || '',
      allergies: profile?.nutrition?.allergies || [],
      intolerances: profile?.nutrition?.intolerances || [],
      budgetLevel: profile?.nutrition?.budgetLevel || undefined,
      noKnownAllergies: profile?.nutrition?.noKnownAllergies ?? false,
      
      // New Recipe Workshop fields
      householdDetails: {
        adults: profile?.householdDetails?.adults || 1,
        children: profile?.householdDetails?.children || 0,
        dietaryRestrictions: profile?.householdDetails?.dietaryRestrictions || [],
      },
      mealPrepPreferences: {
        weekdayTimeMin: profile?.mealPrepPreferences?.weekdayTimeMin || 30,
        weekendTimeMin: profile?.mealPrepPreferences?.weekendTimeMin || 60,
        cookingSkill: profile?.mealPrepPreferences?.cookingSkill || 'intermediate',
        preferredMealTimes: profile?.mealPrepPreferences?.preferredMealTimes || {},
      },
      kitchenEquipment: {
        oven: profile?.kitchenEquipment?.oven ?? true,
        stove: profile?.kitchenEquipment?.stove ?? true,
        microwave: profile?.kitchenEquipment?.microwave ?? true,
        airFryer: profile?.kitchenEquipment?.airFryer ?? false,
        slowCooker: profile?.kitchenEquipment?.slowCooker ?? false,
        blender: profile?.kitchenEquipment?.blender ?? false,
        foodProcessor: profile?.kitchenEquipment?.foodProcessor ?? false,
        standMixer: profile?.kitchenEquipment?.standMixer ?? false,
        riceCooker: profile?.kitchenEquipment?.riceCooker ?? false,
        grill: profile?.kitchenEquipment?.grill ?? false,
        steamBasket: profile?.kitchenEquipment?.steamBasket ?? false,
        pressureCooker: profile?.kitchenEquipment?.pressureCooker ?? false,
      },
      foodPreferences: {
        cuisines: profile?.foodPreferences?.cuisines || [],
        ingredients: profile?.foodPreferences?.ingredients || [],
        flavors: profile?.foodPreferences?.flavors || [],
      },
      sensoryPreferences: {
        spiceTolerance: profile?.sensoryPreferences?.spiceTolerance || 1,
        textureAversions: profile?.sensoryPreferences?.textureAversions || [],
        temperaturePreferences: profile?.sensoryPreferences?.temperaturePreferences || [],
      },
      macroTargets: {
        kcal: profile?.macroTargets?.kcal || undefined,
        fiberMinG: profile?.macroTargets?.fiberMinG || undefined,
        sugarMaxG: profile?.macroTargets?.sugarMaxG || undefined,
        saltMaxMg: profile?.macroTargets?.saltMaxMg || undefined,
        carbsMaxG: profile?.macroTargets?.carbsMaxG || undefined,
        fatMinG: profile?.macroTargets?.fatMinG || undefined,
      },
      shoppingPreferences: {
        frequencyPerWeek: profile?.shoppingPreferences?.frequencyPerWeek || 2,
        defaultPortionsPerMeal: profile?.shoppingPreferences?.defaultPortionsPerMeal || 2,
        batchCooking: profile?.shoppingPreferences?.batchCooking || 'sometimes',
        bias: profile?.shoppingPreferences?.bias || [],
        preferredStores: profile?.shoppingPreferences?.preferredStores || [],
        budgetPerWeek: profile?.shoppingPreferences?.budgetPerWeek || undefined,
      },
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, formState, watch, setValue, reset, trigger } = form;
  const { errors, isDirty, dirtyFields } = formState;
  const watchedValues = watch();

  // Track unsaved changes
  React.useEffect(() => {
    useUnsavedChangesStore.getState().setTabDirty('nutrition', isDirty);
  }, [isDirty]);

  // REMOVED: Reset effect that was causing unnecessary re-renders and false auto-save triggers
  // The form is now initialized once with defaultValues and only resets on explicit save success

  // Section-specific save handlers
  const saveDietSection = async () => {
    setSectionSaving('diet');
    try {
      await updateProfile({
        nutrition: {
          ...profile?.nutrition,
          diet: watchedValues.diet,
          budgetLevel: watchedValues.budgetLevel,
        },
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Régime alimentaire sauvegardé',
        message: 'Vos préférences alimentaires ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder le régime alimentaire',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const saveRestrictionsSection = async () => {
    setSectionSaving('restrictions');
    try {
      logger.debug('PROFILE_NUTRITION_RESTRICTIONS', 'Saving restrictions section', {
        allergies: watchedValues.allergies,
        intolerances: watchedValues.intolerances,
        noKnownAllergies: watchedValues.noKnownAllergies,
        userId: profile?.userId,
        philosophy: 'restrictions_save_debug'
      });

      await updateProfile({
        nutrition: {
          ...profile?.nutrition,
          allergies: watchedValues.allergies,
          intolerances: watchedValues.intolerances,
          noKnownAllergies: watchedValues.noKnownAllergies ?? false,
        },
        updated_at: new Date().toISOString(),
      });

      success();
      logger.debug('PROFILE_NUTRITION_RESTRICTIONS', 'Restrictions section saved successfully', {
        userId: profile?.userId,
        philosophy: 'restrictions_save_success'
      });
      showToast({
        type: 'success',
        title: 'Restrictions alimentaires sauvegardées',
        message: 'Vos allergies et intolérances ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      logger.error('PROFILE_NUTRITION_RESTRICTIONS', 'Failed to save restrictions section', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: profile?.userId,
        philosophy: 'restrictions_save_error'
      });
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les restrictions',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const saveEssentialsSection = async () => {
    setSectionSaving('essentials');
    try {
      await updateProfile({
        householdDetails: watchedValues.householdDetails,
        mealPrepPreferences: watchedValues.mealPrepPreferences,
        kitchenEquipment: watchedValues.kitchenEquipment,
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Informations essentielles sauvegardées',
        message: 'Votre foyer et préférences de cuisine ont été mis à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les informations essentielles',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const savePreferencesSection = async () => {
    setSectionSaving('preferences');
    try {
      await updateProfile({
        foodPreferences: watchedValues.foodPreferences,
        sensoryPreferences: watchedValues.sensoryPreferences,
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Préférences alimentaires sauvegardées',
        message: 'Vos goûts et préférences ont été mis à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les préférences',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const saveNutritionSection = async () => {
    setSectionSaving('nutrition');
    try {
      await updateProfile({
        macroTargets: watchedValues.macroTargets,
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Objectifs nutritionnels sauvegardés',
        message: 'Vos cibles nutritionnelles ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les objectifs nutritionnels',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const saveShoppingSection = async () => {
    setSectionSaving('shopping');
    try {
      await updateProfile({
        shoppingPreferences: watchedValues.shoppingPreferences,
        updated_at: new Date().toISOString(),
      });

      success();
      showToast({
        type: 'success',
        title: 'Préférences de courses sauvegardées',
        message: 'Vos habitudes de courses ont été mises à jour',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder les préférences de courses',
        duration: 4000,
      });
    } finally {
      setSectionSaving(null);
    }
  };

  const onSubmit = async (data: EnhancedNutritionForm) => {
    try {
      formSubmit();
      
      logger.debug('PROFILE_NUTRITION_SUBMIT', 'Submitting complete nutrition form', {
        nutritionData: {
          diet: data.diet,
          allergies: data.allergies,
          intolerances: data.intolerances,
          noKnownAllergies: data.noKnownAllergies,
          budgetLevel: data.budgetLevel,
        },
        userId: profile?.userId,
        philosophy: 'complete_nutrition_submit_debug'
      });

      logger.info('PROFILE_NUTRITION', 'Submitting complete enhanced nutrition updates', {
        userId: profile?.userId,
        philosophy: 'complete_enhanced_nutrition_submission'
      });

      await updateProfile({
        nutrition: {
          ...profile?.nutrition,
          diet: data.diet,
          allergies: data.allergies,
          intolerances: data.intolerances,
          budgetLevel: data.budgetLevel,
          noKnownAllergies: data.noKnownAllergies ?? false,
        },
        // Enhanced Recipe Workshop fields
        householdDetails: data.householdDetails,
        mealPrepPreferences: data.mealPrepPreferences,
        kitchenEquipment: data.kitchenEquipment,
        foodPreferences: data.foodPreferences,
        sensoryPreferences: data.sensoryPreferences,
        macroTargets: data.macroTargets,
        shoppingPreferences: data.shoppingPreferences,
        updated_at: new Date().toISOString(),
      });

      success();
      logger.debug('PROFILE_NUTRITION_SUBMIT', 'Complete nutrition form submitted successfully', {
        userId: profile?.userId,
        philosophy: 'complete_nutrition_submit_success'
      });
      showToast({
        type: 'success',
        title: 'Profil nutritionnel complet sauvegardé',
        message: 'Toutes vos données nutritionnelles ont été mises à jour',
        duration: 4000,
      });

      // Reset unsaved changes tracking
      useUnsavedChangesStore.getState().resetTabDirty('nutrition');

    } catch (error) {
      logger.error('PROFILE_NUTRITION_SUBMIT', 'Complete nutrition form submission failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: profile?.userId,
        philosophy: 'complete_nutrition_submit_error'
      });
      logger.error('PROFILE_NUTRITION', 'Enhanced nutrition update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: profile?.userId,
      });

      showToast({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder votre profil nutritionnel',
        duration: 4000,
      });
    }
  };

  // Check for section changes - properly handle nested fields
  const hasDietChanges = !!(dirtyFields.diet || dirtyFields.budgetLevel);
  const hasRestrictionsChanges = !!(dirtyFields.allergies || dirtyFields.intolerances || dirtyFields.noKnownAllergies);
  const hasEssentialsChanges = !!(
    dirtyFields.householdDetails?.adults ||
    dirtyFields.householdDetails?.children ||
    dirtyFields.householdDetails?.dietaryRestrictions ||
    dirtyFields.mealPrepPreferences?.weekdayTimeMin ||
    dirtyFields.mealPrepPreferences?.weekendTimeMin ||
    dirtyFields.mealPrepPreferences?.cookingSkill ||
    dirtyFields.mealPrepPreferences?.preferredMealTimes ||
    dirtyFields.kitchenEquipment?.oven ||
    dirtyFields.kitchenEquipment?.stove ||
    dirtyFields.kitchenEquipment?.microwave ||
    dirtyFields.kitchenEquipment?.airFryer ||
    dirtyFields.kitchenEquipment?.slowCooker ||
    dirtyFields.kitchenEquipment?.blender ||
    dirtyFields.kitchenEquipment?.foodProcessor ||
    dirtyFields.kitchenEquipment?.standMixer ||
    dirtyFields.kitchenEquipment?.riceCooker ||
    dirtyFields.kitchenEquipment?.grill ||
    dirtyFields.kitchenEquipment?.steamBasket ||
    dirtyFields.kitchenEquipment?.pressureCooker
  );
  const hasPreferencesChanges = !!(
    dirtyFields.foodPreferences?.cuisines ||
    dirtyFields.foodPreferences?.ingredients ||
    dirtyFields.foodPreferences?.flavors ||
    dirtyFields.sensoryPreferences?.spiceTolerance ||
    dirtyFields.sensoryPreferences?.textureAversions ||
    dirtyFields.sensoryPreferences?.temperaturePreferences
  );
  const hasNutritionChanges = !!(
    dirtyFields.macroTargets?.kcal ||
    dirtyFields.macroTargets?.fiberMinG ||
    dirtyFields.macroTargets?.sugarMaxG ||
    dirtyFields.macroTargets?.saltMaxMg ||
    dirtyFields.macroTargets?.carbsMaxG ||
    dirtyFields.macroTargets?.fatMinG
  );
  const hasShoppingChanges = !!(
    dirtyFields.shoppingPreferences?.frequencyPerWeek ||
    dirtyFields.shoppingPreferences?.defaultPortionsPerMeal ||
    dirtyFields.shoppingPreferences?.batchCooking ||
    dirtyFields.shoppingPreferences?.bias ||
    dirtyFields.shoppingPreferences?.preferredStores ||
    dirtyFields.shoppingPreferences?.budgetPerWeek
  );

  // Memoize return values to prevent unnecessary re-renders and infinite loops
  const formReturn = React.useMemo(() => ({
    register,
    handleSubmit,
    errors,
    isDirty,
    dirtyFields,
    watchedValues,
    setValue,
    trigger
  }), [register, handleSubmit, errors, isDirty, dirtyFields, watchedValues, setValue, trigger]);

  const actionsReturn = React.useMemo(() => ({
    saveDietSection,
    saveRestrictionsSection,
    saveEssentialsSection,
    savePreferencesSection,
    saveNutritionSection,
    saveShoppingSection,
    onSubmit
  }), [saveDietSection, saveRestrictionsSection, saveEssentialsSection, savePreferencesSection, saveNutritionSection, saveShoppingSection, onSubmit]);

  const stateReturn = React.useMemo(() => ({
    saving,
    sectionSaving,
    hasDietChanges,
    hasRestrictionsChanges,
    hasEssentialsChanges,
    hasPreferencesChanges,
    hasNutritionChanges,
    hasShoppingChanges
  }), [saving, sectionSaving, hasDietChanges, hasRestrictionsChanges, hasEssentialsChanges, hasPreferencesChanges, hasNutritionChanges, hasShoppingChanges]);

  return {
    form: formReturn,
    actions: actionsReturn,
    state: stateReturn
  };
}