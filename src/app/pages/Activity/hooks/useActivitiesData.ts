/**
 * Activities Data Hook
 * Hook personnalisé pour gérer les données d'activité avec React Query
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useUserStore } from '../../../../system/store/userStore';
import { useToast } from '../../../../ui/components/ToastProvider';
import { useFeedback } from '../../../../hooks/useFeedback';
import {
  fetchActivitiesForDate,
  fetchRecentActivities,
  fetchGlobalActivityStats,
  getUserActivities,
  deleteActivity,
  calculateActivityStats,
  validateActivityData,
  type Activity,
  type ActivityStats
} from '../../../../system/data/activitiesRepository';
import { supabase } from '../../../../system/supabase/client';
import logger from '../../../../lib/utils/logger';
import { shouldLogDiagnostic } from '../../../../config/debugFlags';

/**
 * Hook pour récupérer l'historique des activités
 */
export function useActivityHistory(limit: number = 100) {
  const { session } = useUserStore();

  return useQuery({
    queryKey: ['activities', 'history', session?.user?.id, limit],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Récupérer les 30 derniers jours d'activités
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      return getUserActivities(session.user.id, startDate, endDate, limit);
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook pour générer des insights d'activité avec l'IA
 * Utilise l'edge function en priorité, avec fallback local en cas d'erreur
 */
export function useActivityInsightsGenerator(period: 'last7Days' | 'last30Days' | 'last3Months' | 'last6Months' | 'last1Year' = 'last7Days') {
  const { session, profile } = useUserStore();

  return useQuery({
    queryKey: ['activities', 'insights', session?.user?.id, period],
    queryFn: async () => {
      if (shouldLogDiagnostic('activity')) {
        logger.info('ACTIVITY_INSIGHTS_DIAGNOSTIC', 'queryFn execution started', {
          userId: session?.user?.id,
          period,
          executionTime: new Date().toISOString(),
          reason: 'react_query_triggered_execution',
          cacheStrategy: 'edge_function_with_local_fallback',
          timestamp: new Date().toISOString()
        });
      }

      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante. Vérifiez vos variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
      }

      // Essayer d'abord l'edge function
      try {
        const userProfileForAnalysis = {
          weight_kg: profile?.weight_kg || 70,
          height_cm: profile?.height_cm,
          sex: profile?.sex,
          birthdate: profile?.birthdate,
          activity_level: profile?.activity_level,
          objective: profile?.objective
        };

        if (shouldLogDiagnostic('activity')) {
          logger.info('ACTIVITY_INSIGHTS_DIAGNOSTIC', 'Attempting edge function call', {
            userId: session.user.id,
            period,
            endpoint: `${supabaseUrl}/functions/v1/activity-progress-generator`,
            timestamp: new Date().toISOString()
          });
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/activity-progress-generator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            period,
            userProfile: userProfileForAnalysis,
            clientTraceId: `activity_insights_${Date.now()}`
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 400 && errorData.error === 'Insufficient data') {
            logger.info('ACTIVITY_INSIGHTS', 'Insufficient data for insights generation', {
              userId: session.user.id,
              period,
              requiredActivities: errorData.required_activities,
              currentActivities: errorData.current_activities,
              timestamp: new Date().toISOString()
            });

            return {
              insufficient_data: true,
              required_activities: errorData.required_activities,
              current_activities: errorData.current_activities,
              message: errorData.message
            };
          }

          throw new Error(`Edge function error: ${response.statusText}`);
        }

        const insightsData = await response.json();

        let currentActivities = insightsData.current_activities;
        if (currentActivities === undefined || currentActivities === null) {
          currentActivities = insightsData.summary?.total_activities || 0;
        }

        const enrichedData = {
          ...insightsData,
          current_activities: currentActivities
        };

        if (shouldLogDiagnostic('activity')) {
          logger.info('ACTIVITY_INSIGHTS_DIAGNOSTIC', 'Edge function call successful', {
            userId: session.user.id,
            period,
            insightsCount: insightsData.insights?.length || 0,
            currentActivities,
            cached: insightsData.cached || false,
            timestamp: new Date().toISOString()
          });
        }

        return enrichedData;

      } catch (edgeFunctionError) {
        // L'edge function a échoué - basculer sur le fallback local
        logger.warn('ACTIVITY_INSIGHTS_DIAGNOSTIC', 'Edge function failed, falling back to local processing', {
          userId: session.user.id,
          period,
          error: edgeFunctionError instanceof Error ? edgeFunctionError.message : 'Unknown error',
          fallbackStrategy: 'local_insights_processor',
          timestamp: new Date().toISOString()
        });

        // Import dynamique du processeur local
        const { generateLocalActivityInsights } = await import('../utils/localActivityInsightsProcessor');

        try {
          const localInsights = await generateLocalActivityInsights(
            session.user.id,
            period,
            supabase
          );

          logger.info('ACTIVITY_INSIGHTS_DIAGNOSTIC', 'Local fallback completed successfully', {
            userId: session.user.id,
            period,
            insightsCount: localInsights.insights.length,
            currentActivities: localInsights.current_activities,
            fallback: true,
            timestamp: new Date().toISOString()
          });

          return localInsights;

        } catch (localError) {
          logger.error('ACTIVITY_INSIGHTS_DIAGNOSTIC', 'Both edge function and local fallback failed', {
            userId: session.user.id,
            period,
            edgeFunctionError: edgeFunctionError instanceof Error ? edgeFunctionError.message : 'Unknown',
            localError: localError instanceof Error ? localError.message : 'Unknown',
            timestamp: new Date().toISOString()
          });

          throw new Error('Impossible de générer les insights. Vérifiez votre connexion.');
        }
      }
    },
    enabled: !!session?.user?.id,
    staleTime: getStaleTimeForPeriod(period),
    gcTime: getGcTimeForPeriod(period),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Insufficient data')) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * Hook pour récupérer les activités du jour
 */
export function useTodayActivities() {
  const { session } = useUserStore();
  const today = new Date();

  return useQuery({
    queryKey: ['activities', 'daily', session?.user?.id, format(today, 'yyyy-MM-dd')],
    queryFn: () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      return fetchActivitiesForDate(session.user.id, today);
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Always fresh - données changent fréquemment
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // CRITIQUE: Always refetch on mount
    retry: 2,
  });
}

/**
 * Hook pour récupérer les statistiques du jour
 */
export function useTodayActivityStats() {
  const { data: todayActivities, isLoading, error } = useTodayActivities();

  const stats = React.useMemo(() => {
    if (!todayActivities) return null;
    return calculateActivityStats(todayActivities);
  }, [todayActivities]);

  return {
    data: stats,
    isLoading,
    error,
    activities: todayActivities || []
  };
}

/**
 * Hook pour récupérer les activités récentes
 */
export function useRecentActivities(limit: number = 10) {
  const { session } = useUserStore();

  return useQuery({
    queryKey: ['activities', 'recent', session?.user?.id, limit],
    queryFn: () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      return fetchRecentActivities(session.user.id, limit);
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Always fresh - données changent fréquemment
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always', // CRITIQUE: Always refetch on mount
    retry: 2,
  });
}

/**
 * Hook pour récupérer la dernière activité enregistrée (globale, pas uniquement aujourd'hui)
 */
export function useLastActivity() {
  const { session } = useUserStore();

  return useQuery({
    queryKey: ['activities', 'last', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('ACTIVITIES_REPO', 'Failed to fetch last activity', {
          error: error.message,
          userId: session.user.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      return data || null;
    },
    enabled: !!session?.user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer les statistiques globales
 */
export function useGlobalActivityStats() {
  const { session } = useUserStore();

  return useQuery({
    queryKey: ['activities', 'stats', 'global', session?.user?.id],
    queryFn: () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      return fetchGlobalActivityStats(session.user.id);
    },
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook pour supprimer une activité
 */
export function useDeleteActivity() {
  const { session } = useUserStore();
  const { showToast } = useToast();
  const { success, error: errorSound } = useFeedback();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Validation avant suppression
      if (!activityId || activityId.trim().length === 0) {
        throw new Error('ID d\'activité invalide');
      }

      await deleteActivity(activityId, session.user.id);
      return activityId;
    },
    onSuccess: (deletedActivityId) => {
      success();
      showToast({
        type: 'success',
        title: 'Activité supprimée',
        message: 'L\'activité a été supprimée avec succès',
        duration: 3000
      });

      // Invalider les caches pour forcer le rechargement
      queryClient.invalidateQueries({
        queryKey: ['activities', 'daily', session?.user?.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['activities', 'recent', session?.user?.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['activities', 'stats', session?.user?.id]
      });

      logger.info('ACTIVITIES_HOOK', 'Activity deleted successfully', {
        activityId: deletedActivityId,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    },
    onError: (error) => {
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur de suppression',
        message: error instanceof Error ? error.message : 'Impossible de supprimer l\'activité',
        duration: 4000
      });

      logger.error('ACTIVITIES_HOOK', 'Failed to delete activity', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * Hook pour vérifier si l'utilisateur a des activités
 */
export function useHasActivityHistory() {
  const { session } = useUserStore();

  return useQuery({
    queryKey: ['activities', 'has-history', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return false;
      }

      const { data, error } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (error) {
        logger.error('ACTIVITIES_REPO', 'Failed to check activity history', {
          error: error.message,
          userId: session.user.id,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      return (data?.length || 0) > 0;
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Always fresh - change après chaque activité sauvegardée
    refetchOnMount: 'always', // CRITIQUE: Always refetch on mount
    retry: 1,
  });
}

/**
 * Hook pour récupérer les données de progression d'activité
 */
export function useActivityProgressionData(period: 'last7Days' | 'last30Days' | 'last3Months' | 'last6Months' | 'last1Year') {
  const { session, profile } = useUserStore();

  return useQuery({
    queryKey: ['activities', 'progression', session?.user?.id, period],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      logger.info('ACTIVITY_PROGRESSION', 'Starting progression data generation', {
        userId: session.user.id,
        period,
        timestamp: new Date().toISOString()
      });

      // Simuler des données de progression pour le moment
      // TODO: Implémenter la vraie logique de progression ou appeler une Edge Function
      
      // Vérifier s'il y a assez de données
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch activities: ${error.message}`);
      }

      const requiredActivities = getMinimumActivitiesForPeriod(period);
      const currentActivities = activities?.length || 0;

      if (currentActivities < requiredActivities) {
        return {
          insufficient_data: true,
          required_activities: requiredActivities,
          current_activities: currentActivities,
          message: `Au moins ${requiredActivities} activités sont nécessaires pour l'analyse de progression`
        };
      }

      // Générer des données de progression basiques
      const summary = {
        total_activities: currentActivities,
        total_calories: activities.reduce((sum, a) => sum + a.calories_est, 0),
        total_duration: activities.reduce((sum, a) => sum + a.duration_min, 0),
        avg_daily_calories: Math.round((activities.reduce((sum, a) => sum + a.calories_est, 0)) / 7),
        most_frequent_type: 'course',
        avg_intensity: 'medium',
        consistency_score: Math.min(100, Math.round((currentActivities / requiredActivities) * 100))
      };

      return {
        summary,
        distribution: null, // TODO: Implémenter
        heatmap_data: null, // TODO: Implémenter
        daily_trends: null, // TODO: Implémenter
        insufficient_data: false,
        current_activities: currentActivities,
        required_activities: requiredActivities
      };
    },
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Fonction utilitaire pour obtenir le nombre minimum d'activités selon la période
 * Seuils réalistes alignés avec l'interface utilisateur
 */
export function getMinimumActivitiesForPeriod(period: string): number {
  // Seuils réalistes pour une analyse de qualité
  switch (period) {
    case 'last7Days': return 3;   // 3 activités sur 7 jours = minimum pour analyse hebdomadaire
    case 'last30Days': return 8;  // 8 activités sur 30 jours = minimum pour analyse mensuelle
    case 'last3Months': return 20; // 20 activités sur 90 jours = minimum pour analyse trimestrielle
    case 'last6Months': return 35;
    case 'last1Year': return 60;
    default: return 8;
  }
}

/**
 * Détermine le staleTime optimal selon la période d'analyse (complète le cache serveur)
 */
function getStaleTimeForPeriod(period: string): number {
  switch (period) {
    case 'last7Days':
      return 1000 * 60 * 60 * 12; // 12 heures - cache client plus court pour 7 jours
    case 'last30Days':
      return 1000 * 60 * 60 * 72; // 3 jours - cache client pour 30 jours
    case 'last3Months':
      return 1000 * 60 * 60 * 168; // 7 jours - cache client pour 90 jours
    case 'last6Months':
      return 1000 * 60 * 60 * 336; // 14 jours - cache client pour 6 mois
    case 'last1Year':
      return 1000 * 60 * 60 * 720; // 30 jours - cache client pour 1 an
    default:
      return 1000 * 60 * 60 * 12; // 12 heures par défaut
  }
}

/**
 * Obtenir le gcTime adaptatif selon la période
 */
function getGcTimeForPeriod(period: string): number {
  switch (period) {
    case 'last7Days': return 7 * 24 * 60 * 60 * 1000; // 7 jours
    case 'last30Days': return 14 * 24 * 60 * 60 * 1000; // 14 jours
    case 'last3Months': return 30 * 24 * 60 * 60 * 1000; // 30 jours
    case 'last6Months': return 60 * 24 * 60 * 60 * 1000; // 60 jours
    case 'last1Year': return 90 * 24 * 60 * 60 * 1000; // 90 jours
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}