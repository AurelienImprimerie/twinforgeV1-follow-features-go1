import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../../../../system/store/userStore';
import { supabase } from '../../../../system/supabase/client';
import logger from '../../../../lib/utils/logger';
import type { BreastfeedingFormData, BreastfeedingType } from '../../../../domain/breastfeeding';

interface UseBreastfeedingFormReturn {
  formData: BreastfeedingFormData;
  updateFormData: (updates: Partial<BreastfeedingFormData>) => void;
  handleSave: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  resetForm: () => void;
}

const defaultFormData: BreastfeedingFormData = {
  is_breastfeeding: false,
  breastfeeding_type: null,
  baby_age_months: '',
  start_date: '',
  notes: '',
};

export function useBreastfeedingForm(): UseBreastfeedingFormReturn {
  const { session } = useUserStore();
  const userId = session?.user?.id;

  const [formData, setFormData] = useState<BreastfeedingFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadBreastfeedingData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('breastfeeding_tracking')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('USE_BREASTFEEDING_FORM', 'Failed to load breastfeeding data', { error });
        setFormData(defaultFormData);
        return;
      }

      if (data) {
        setFormData({
          is_breastfeeding: data.is_breastfeeding || false,
          breastfeeding_type: data.breastfeeding_type || null,
          baby_age_months: data.baby_age_months?.toString() || '',
          start_date: data.start_date || '',
          notes: data.notes || '',
        });
      } else {
        setFormData(defaultFormData);
      }
    } catch (error) {
      logger.error('USE_BREASTFEEDING_FORM', 'Error loading breastfeeding data', { error });
      setFormData(defaultFormData);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBreastfeedingData();
  }, [loadBreastfeedingData]);

  const updateFormData = useCallback((updates: Partial<BreastfeedingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.is_breastfeeding) {
      if (formData.baby_age_months) {
        const age = parseInt(formData.baby_age_months);
        if (isNaN(age) || age < 0 || age > 36) {
          newErrors.baby_age_months = "L'âge doit être entre 0 et 36 mois";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!userId) {
      logger.warn('USE_BREASTFEEDING_FORM', 'Cannot save: no user ID');
      return;
    }

    if (!validateForm()) {
      logger.warn('USE_BREASTFEEDING_FORM', 'Form validation failed');
      return;
    }

    try {
      setIsSaving(true);

      const dataToSave = {
        user_id: userId,
        is_breastfeeding: formData.is_breastfeeding,
        breastfeeding_type: formData.is_breastfeeding ? formData.breastfeeding_type : null,
        baby_age_months: formData.is_breastfeeding && formData.baby_age_months
          ? parseInt(formData.baby_age_months)
          : null,
        start_date: formData.is_breastfeeding && formData.start_date ? formData.start_date : null,
        notes: formData.is_breastfeeding && formData.notes ? formData.notes : null,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('breastfeeding_tracking')
        .upsert(dataToSave, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        logger.error('USE_BREASTFEEDING_FORM', 'Failed to save breastfeeding data', { error: upsertError });
        throw upsertError;
      }

      logger.info('USE_BREASTFEEDING_FORM', 'Breastfeeding data saved successfully');
    } catch (error) {
      logger.error('USE_BREASTFEEDING_FORM', 'Error saving breastfeeding data', { error });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [userId, formData, validateForm]);

  const resetForm = useCallback(() => {
    loadBreastfeedingData();
    setErrors({});
  }, [loadBreastfeedingData]);

  return {
    formData,
    updateFormData,
    handleSave,
    isLoading,
    isSaving,
    errors,
    resetForm,
  };
}
