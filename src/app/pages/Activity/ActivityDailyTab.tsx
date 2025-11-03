import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useUserStore } from '../../../system/store/userStore';
import { useTodayActivities, useTodayActivityStats, useDeleteActivity, useRecentActivities } from './hooks/useActivitiesData';
import { useToast } from '../../../ui/components/ToastProvider';
import { useFeedback } from '../../../hooks/useFeedback';
import logger from '../../../lib/utils/logger';
import ProfileCompletenessAlert from '../../../ui/components/profile/ProfileCompletenessAlert';
import DynamicActivityCTA from './components/DailyRecap/DynamicActivityCTA';
import DailyStatsGrid from './components/DailyRecap/DailyStatsGrid';
import CalorieProgressCard from './components/DailyRecap/CalorieProgressCard';
import ActivitySummaryCard from './components/DailyRecap/ActivitySummaryCard';
import RecentActivitiesCard from './components/DailyRecap/RecentActivitiesCard';
import WearableEnrichedSection from './components/DailyRecap/WearableEnrichedSection';
import EmptyActivityDailyState from './components/DailyRecap/EmptyActivityDailyState';
import './styles/index.css';

/**
 * Activity Daily Tab - Onglet Aujourd'hui de la Forge Énergétique
 * Affiche le résumé du jour et permet d'ajouter de nouvelles activités
 */
const ActivityDailyTab: React.FC = () => {
  const { profile, session } = useUserStore();
  const { showToast } = useToast();
  const { success, error: errorSound } = useFeedback();
  
  // Récupération des données réelles d'activité
  const {
    data: todayStats,
    isLoading: statsLoading,
    error: statsError,
    activities: todayActivities
  } = useTodayActivityStats();

  // Récupérer les dernières activités (pas uniquement aujourd'hui)
  const { data: recentActivities = [], isLoading: recentLoading } = useRecentActivities(10);

  // Hook pour la suppression d'activités
  const deleteActivityMutation = useDeleteActivity();

  // Vérification si l'utilisateur a un historique d'activités
  const { data: hasAnyActivityHistory = false } = useQuery({
    queryKey: ['activities', 'has-history', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { supabase } = await import('../../../system/supabase/client');
      const { data, error } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);
      
      if (error) {
        logger.error('ACTIVITY_DAILY_TAB', 'Failed to check activity history', {
          error: error.message,
          userId: session.user.id,
          timestamp: new Date().toISOString()
        });
        return false;
      }
      
      return (data?.length || 0) > 0;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Gestion des erreurs de chargement
  React.useEffect(() => {
    if (statsError) {
      logger.error('ACTIVITY_DAILY_TAB', 'Failed to load activity stats', {
        error: statsError instanceof Error ? statsError.message : 'Unknown error',
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur de Chargement',
        message: 'Impossible de charger vos activités. Vérifiez votre connexion.',
        duration: 4000
      });
    }
  }, [statsError, session?.user?.id, errorSound, showToast]);

  const handleActivityClick = (activity: any) => {
    logger.info('ACTIVITY_DAILY_TAB', 'Activity clicked for details', {
      activityId: activity.id,
      activityType: activity.type,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implémenter le modal de détail d'activité
    showToast({
      type: 'info',
      title: 'Détail d\'Activité',
      message: `${activity.type} - ${activity.duration_min} min - ${activity.calories_est} kcal`,
      duration: 3000
    });
  };

  const handleDeleteActivity = (activityId: string) => {
    logger.info('ACTIVITY_DAILY_TAB', 'Delete activity requested', {
      activityId,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    });
    
    deleteActivityMutation.mutate(activityId);
  };

  // Affichage de l'état de chargement
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <ProfileCompletenessAlert profile={profile} forgeContext="activity" />

        {/* Skeleton pour le chargement */}
        <div className="space-y-4">
          <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Afficher l'empty state si aucune activité du tout
  // IMPORTANT: Ne pas afficher si on est en train de charger
  if (!statsLoading && !recentLoading && !hasAnyActivityHistory) {
    return <EmptyActivityDailyState />;
  }

  // Si on a un historique d'activités, toujours afficher l'UI complète
  // même si il n'y a pas d'activités aujourd'hui

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      <ProfileCompletenessAlert
        profile={profile}
        forgeContext="activity"
      />

      <DynamicActivityCTA
        todayStats={todayStats}
        profile={profile}
      />


      <DailyStatsGrid
        todayStats={todayStats}
      />

      <CalorieProgressCard
        todayStats={todayStats}
        profile={profile}
        todayActivities={todayActivities}
      />

      <ActivitySummaryCard
        todayStats={todayStats}
        profile={profile}
      />

      <RecentActivitiesCard
        todayActivities={recentActivities}
        todayStats={todayStats}
        hasAnyActivityHistory={hasAnyActivityHistory}
        deletingActivityId={deleteActivityMutation.isPending ? 'deleting' : undefined}
        onActivityClick={handleActivityClick}
        onDeleteActivity={handleDeleteActivity}
      />

      {todayActivities && todayActivities.some((a: any) => a.wearable_device_id) && (
        <WearableEnrichedSection
          activities={todayActivities}
          className="mt-6"
        />
      )}
    </motion.div>
  );
};

export default ActivityDailyTab;