import { useState, useEffect } from 'react';
import { useUserStore } from '../../../../system/store/userStore';
import { supabase } from '../../../../system/supabase/client';
import logger from '../../../../lib/utils/logger';
import { useToast } from '../../../../ui/components/ToastProvider';

interface MenstrualFormData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodDuration: number;
  cycleRegularity: 'regular' | 'irregular' | 'very_irregular';
}

export function useProfileMenstrualForm() {
  const profile = useUserStore((state) => state.profile);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<MenstrualFormData>({
    lastPeriodDate: '',
    averageCycleLength: 28,
    averagePeriodDuration: 5,
    cycleRegularity: 'regular',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.user_id) {
      loadMenstrualData();
    }
  }, [profile?.user_id]);

  const loadMenstrualData = async () => {
    if (!profile?.user_id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('cycle_start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          lastPeriodDate: data.cycle_start_date || '',
          averageCycleLength: data.cycle_length || 28,
          averagePeriodDuration: data.period_duration || 5,
          cycleRegularity: data.cycle_regularity || 'regular',
        });
      }
    } catch (error) {
      logger.error('MENSTRUAL_FORM', 'Failed to load menstrual data', { error });
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.lastPeriodDate) {
      newErrors.lastPeriodDate = 'Date requise';
    }

    if (formData.averageCycleLength < 21 || formData.averageCycleLength > 45) {
      newErrors.averageCycleLength = 'Doit être entre 21 et 45 jours';
    }

    if (formData.averagePeriodDuration < 2 || formData.averagePeriodDuration > 10) {
      newErrors.averagePeriodDuration = 'Doit être entre 2 et 10 jours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!profile?.user_id) {
      showToast('Profil non chargé', 'error');
      return;
    }

    if (!validate()) {
      showToast('Veuillez corriger les erreurs', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('menstrual_cycles').upsert(
        {
          user_id: profile.user_id,
          cycle_start_date: formData.lastPeriodDate,
          cycle_length: formData.averageCycleLength,
          period_duration: formData.averagePeriodDuration,
          cycle_regularity: formData.cycleRegularity,
        },
        {
          onConflict: 'user_id,cycle_start_date',
        }
      );

      if (error) throw error;

      showToast('Données sauvegardées avec succès', 'success');
      logger.info('MENSTRUAL_FORM', 'Menstrual data saved successfully');
    } catch (error) {
      logger.error('MENSTRUAL_FORM', 'Failed to save menstrual data', { error });
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<MenstrualFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  return {
    formData,
    updateFormData,
    errors,
    isLoading,
    isSaving,
    handleSave,
  };
}
