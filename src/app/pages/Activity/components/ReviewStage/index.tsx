import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../../../ui/components/ToastProvider';
import { useFeedback } from '../../../../../hooks/useFeedback';
import { useUserStore } from '../../../../../system/store/userStore';
import { supabase } from '../../../../../system/supabase/client';
import logger from '../../../../../lib/utils/logger';
import { calculateCalories } from './ActivityUtils';
import ActivitySummary from './ActivitySummary';
import ActivityList from './ActivityList';
import AddActivityForm from './AddActivityForm';
import ActivityInsightsDisplay from './ActivityInsightsDisplay';
import ReviewActions from './ReviewActions';
import { validateActivityData } from '../../../../../system/data/activitiesRepository';
import React from 'react';

interface Activity {
  id?: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
}

interface ReviewStageProps {
  analysisResult?: {
    activities: Activity[];
    totalCalories: number;
    totalDuration: number;
    forgeInsights: string[];
  };
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * Review Stage - Revue Énergétique TwinForge
 * Interface de validation et ajustement des données d'activité
 */
const ReviewStage: React.FC<ReviewStageProps> = ({ analysisResult, onComplete, onCancel }) => {
  const [activities, setActivities] = useState(analysisResult?.activities || []);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: '',
    duration_min: 30,
    intensity: 'medium',
    calories_est: 0
  });
  
  const { success, click, error: errorSound } = useFeedback();
  const { showToast } = useToast();
  const { profile, session } = useUserStore();
  const queryClient = useQueryClient();

  // Calculer les totaux dynamiquement
  const totalCalories = activities.reduce((sum, activity) => sum + activity.calories_est, 0);
  const totalDuration = activities.reduce((sum, activity) => sum + activity.duration_min, 0);

  // Recalculer les calories pour une activité
  const recalculateCalories = (activity: Activity): number => {
    const userWeight = profile?.weight_kg || 70; // Poids par défaut
    return calculateCalories(activity.type, activity.intensity, activity.duration_min, userWeight);
  };

  // Mettre à jour une activité
  const updateActivity = (index: number, updates: Partial<Activity>) => {
    setActivities(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      
      // Recalculer les calories si durée ou intensité changée
      if (updates.duration_min !== undefined || updates.intensity !== undefined) {
        updated[index].calories_est = recalculateCalories(updated[index]);
      }
      
      return updated;
    });
    setIsEditing(true);
  };

  // Supprimer une activité
  const removeActivity = (index: number) => {
    setActivities(prev => prev.filter((_, i) => i !== index));
    setIsEditing(true);
  };

  // Ajouter une nouvelle activité
  const addNewActivity = () => {
    if (!newActivity.type || !newActivity.duration_min) {
      showToast({
        type: 'error',
        title: 'Informations manquantes',
        message: 'Veuillez renseigner le type et la durée de l\'activité',
        duration: 3000
      });
      return;
    }

    // Validation des données avant ajout
    const validation = validateActivityData({
      type: newActivity.type,
      duration_min: newActivity.duration_min,
      intensity: newActivity.intensity,
      calories_est: 0 // Sera calculé
    });

    if (!validation.isValid) {
      showToast({
        type: 'error',
        title: 'Données invalides',
        message: validation.errors.join(', '),
        duration: 4000
      });
      return;
    }
    const userWeight = profile?.weight_kg || 70;
    const calories = calculateCalories(
      newActivity.type!,
      newActivity.intensity!,
      newActivity.duration_min!,
      userWeight
    );

    const activity: Activity = {
      type: newActivity.type!,
      duration_min: newActivity.duration_min!,
      intensity: newActivity.intensity as Activity['intensity'],
      calories_est: calories,
      notes: newActivity.notes
    };

    setActivities(prev => [...prev, activity]);
    setNewActivity({
      type: '',
      duration_min: 30,
      intensity: 'medium',
      calories_est: 0
    });
    setShowAddForm(false);
    setIsEditing(true);
    
    success();
    showToast({
      type: 'success',
      title: 'Activité ajoutée',
      message: 'Nouvelle activité ajoutée à votre forge énergétique',
      duration: 3000
    });
  };

  // Sauvegarder les activités dans Supabase
  const handleSave = async () => {
    if (!session?.user?.id) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur d\'authentification',
        message: 'Vous devez être connecté pour sauvegarder',
        duration: 4000
      });
      return;
    }

    if (activities.length === 0) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Aucune activité à sauvegarder',
        message: 'Ajoutez au moins une activité avant de sauvegarder',
        duration: 3000
      });
      return;
    }
    setIsSaving(true);
    
    try {
      logger.info('ACTIVITY_REVIEW', 'Saving activities to database', {
        userId: session.user.id,
        activitiesCount: activities.length,
        totalCalories,
        totalDuration,
        activitiesData: activities.map(a => ({
          type: a.type,
          duration_min: a.duration_min,
          intensity: a.intensity,
          calories_est: a.calories_est
        })),
        timestamp: new Date().toISOString()
      });

      // Préparer les données pour Supabase
      const currentTimestamp = new Date().toISOString();
      const activitiesToSave = activities.map(activity => ({
        user_id: session.user.id,
        type: activity.type,
        duration_min: activity.duration_min,
        intensity: activity.intensity,
        calories_est: activity.calories_est,
        notes: activity.notes || null,
        timestamp: currentTimestamp,
        created_at: currentTimestamp
      }));

      logger.info('ACTIVITY_REVIEW', 'Prepared activities for database insertion', {
        userId: session.user.id,
        activitiesToSave: activitiesToSave,
        totalActivities: activitiesToSave.length,
        timestamp: new Date().toISOString()
      });
      // Insérer dans la base de données
      const { data, error } = await supabase
        .from('activities')
        .insert(activitiesToSave)
        .select();

      if (error) {
        logger.error('ACTIVITY_REVIEW', 'Supabase insertion failed', {
          error: error.message,
          errorDetails: error,
          errorCode: error.code,
          errorHint: error.hint,
          userId: session.user.id,
          activitiesCount: activities.length,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      logger.info('ACTIVITY_REVIEW', 'Activities saved successfully', {
        userId: session.user.id,
        savedCount: data?.length || 0,
        savedActivities: data?.map(d => ({
          id: d.id,
          type: d.type,
          duration_min: d.duration_min,
          calories_est: d.calories_est,
          timestamp: d.timestamp
        })),
        timestamp: new Date().toISOString()
      });

      // Appeler sync-wearable-goals pour chaque activité créée (non-bloquant)
      if (data && data.length > 0) {
        logger.info('ACTIVITY_REVIEW', 'Starting async wearable goals sync', {
          userId: session.user.id,
          activitiesCount: data.length,
          timestamp: new Date().toISOString()
        });

        // Exécuter les syncs en arrière-plan sans bloquer l'UI
        Promise.allSettled(
          data.map(async (activity) => {
            try {
              // Timeout de 5 secondes pour chaque appel
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Sync timeout after 5s')), 5000)
              );

              const syncPromise = supabase.functions.invoke('sync-wearable-goals', {
                body: {
                  activity_id: activity.id,
                  user_id: session.user.id
                }
              });

              const { data: syncResult, error: syncError } = await Promise.race([
                syncPromise,
                timeoutPromise
              ]) as any;

              if (syncError) {
                logger.warn('ACTIVITY_REVIEW', 'Failed to sync wearable goals (non-blocking)', {
                  activityId: activity.id,
                  error: syncError.message,
                  timestamp: new Date().toISOString()
                });
              } else {
                logger.info('ACTIVITY_REVIEW', 'Wearable goals synced successfully', {
                  activityId: activity.id,
                  goalsUpdated: syncResult?.goals_updated || 0,
                  timestamp: new Date().toISOString()
                });
              }
            } catch (syncErr) {
              logger.warn('ACTIVITY_REVIEW', 'Exception during wearable goal sync (non-blocking)', {
                activityId: activity.id,
                error: syncErr instanceof Error ? syncErr.message : 'Unknown error',
                timestamp: new Date().toISOString()
              });
            }
          })
        ).then((results) => {
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          logger.info('ACTIVITY_REVIEW', 'Wearable goals sync completed', {
            total: results.length,
            successful: successCount,
            failed: results.length - successCount,
            timestamp: new Date().toISOString()
          });
        });
      }

      // CRITIQUE: Invalider TOUS les caches d'activité et forcer le refetch
      // Stratégie agressive pour garantir que l'UI se met à jour immédiatement
      logger.info('ACTIVITY_REVIEW', 'Starting aggressive cache invalidation', {
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });

      // Invalider et refetch immédiatement toutes les requêtes d'activités
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['activities'],
          refetchType: 'all' // Refetch active and inactive queries
        }),
        queryClient.refetchQueries({
          queryKey: ['activities', 'daily', session.user.id],
          type: 'all'
        }),
        queryClient.refetchQueries({
          queryKey: ['activities', 'has-history', session.user.id],
          type: 'all'
        }),
        queryClient.refetchQueries({
          queryKey: ['activities', 'recent', session.user.id],
          type: 'all'
        })
      ]);

      logger.info('ACTIVITY_REVIEW', 'All activity caches invalidated and refetched', {
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });
      success();
      showToast({
        type: 'success',
        title: 'Forge Énergétique Sauvegardée',
        message: `${activities.length} activité${activities.length > 1 ? 's' : ''} enregistrée${activities.length > 1 ? 's' : ''} avec succès`,
        duration: 4000
      });

      // Délai pour l'animation puis redirection
      setTimeout(() => {
        onComplete();
      }, 1000);

    } catch (error) {
      logger.error('ACTIVITY_REVIEW', 'Failed to save activities', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        userId: session.user.id,
        activitiesCount: activities.length,
        activitiesData: activities.map(a => ({
          type: a.type,
          duration_min: a.duration_min,
          intensity: a.intensity,
          calories_est: a.calories_est
        })),
        timestamp: new Date().toISOString()
      });

      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur de Sauvegarde',
        message: error instanceof Error ? 
          `Erreur: ${error.message}. Vérifiez votre connexion et réessayez.` :
          'Impossible de sauvegarder vos activités. Réessayez.',
        duration: 4000
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Résumé Global */}
      <ActivitySummary
        activities={activities}
        totalCalories={totalCalories}
        totalDuration={totalDuration}
      />

      {/* Liste des Activités */}
      <ActivityList
        activities={activities}
        updateActivity={updateActivity}
        removeActivity={removeActivity}
      />

      {/* Formulaire d'Ajout d'Activité */}
      <AddActivityForm
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        newActivity={newActivity}
        setNewActivity={setNewActivity}
        addNewActivity={addNewActivity}
        profile={profile}
      />

      {/* Insights de la Forge */}
      <ActivityInsightsDisplay
        forgeInsights={analysisResult?.forgeInsights}
      />

      {/* Actions de Revue */}
      <ReviewActions
        onCancel={onCancel}
        handleSave={handleSave}
        isSaving={isSaving}
        isEditing={isEditing}
      />
    </div>
  );
};

export default ReviewStage;