import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUserStore } from '../../../system/store/userStore';
import { useActivityHistory, useDeleteActivity } from './hooks/useActivitiesData';
import { useToast } from '../../../ui/components/ToastProvider';
import { useFeedback } from '../../../hooks/useFeedback';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { getActivityIcon, getIntensityColor, getIntensityLabel } from './components/ReviewStage/ActivityUtils';
import ActivityDetailModal from './components/History/ActivityDetailModal';
import EmptyActivityHistoryState from './components/History/EmptyActivityHistoryState';
import logger from '../../../lib/utils/logger';
import './styles/index.css';

interface Activity {
  id: string;
  user_id: string;
  type: string;
  duration_min: number;
  intensity: 'low' | 'medium' | 'high' | 'very_high';
  calories_est: number;
  notes?: string;
  timestamp: string;
  created_at: string;
}

/**
 * Activity History Tab - Historique des Activités TwinForge
 * Affiche l'historique complet avec possibilité de voir les détails et supprimer
 */
const ActivityHistoryTab: React.FC = () => {
  const { profile } = useUserStore();
  const { click, success, error: errorSound } = useFeedback();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const userId = profile?.userId;
  
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Hook pour récupérer l'historique des activités
  const { data: activities, isLoading, error } = useActivityHistory(100);

  // DIAGNOSTIC: Logger l'état de l'historique
  React.useEffect(() => {
    if (activities !== undefined) {
      logger.info('ACTIVITY_HISTORY_TAB_DIAGNOSTIC', 'Activity history loaded', {
        activitiesCount: activities?.length || 0,
        hasActivities: (activities?.length || 0) > 0,
        isLoading,
        hasError: !!error,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }, [activities, isLoading, error, userId]);

  // Hook pour supprimer une activité
  const deleteActivityMutation = useDeleteActivity();

  // Gérer les erreurs de chargement
  React.useEffect(() => {
    if (error) {
      logger.error('ACTIVITY_HISTORY_TAB', 'Failed to load activity history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        timestamp: new Date().toISOString()
      });
      
      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur de Chargement',
        message: 'Impossible de charger votre historique d\'activités.',
        duration: 4000
      });
    }
  }, [error, userId, errorSound, showToast]);

  // Grouper les activités par jour
  const groupedActivities = React.useMemo(() => {
    if (!activities) return {};
    
    return activities.reduce((groups, activity) => {
      const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, Activity[]>);
  }, [activities]);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    return format(date, 'EEEE dd MMMM', { locale: fr });
  };

  const handleActivityClick = (activity: Activity) => {
    click();
    setSelectedActivity(activity);
    
    logger.info('ACTIVITY_HISTORY_TAB', 'Activity detail opened', {
      activityId: activity.id,
      activityType: activity.type,
      userId,
      timestamp: new Date().toISOString()
    });
  };

  const handleDeleteActivity = (activityId: string) => {
    logger.info('ACTIVITY_HISTORY_TAB', 'Delete activity requested from history', {
      activityId,
      userId,
      timestamp: new Date().toISOString()
    });
    
    deleteActivityMutation.mutate(activityId);
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-white/5 rounded-xl"></div>
                <div className="h-16 bg-white/5 rounded-xl"></div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  // État vide
  if (!activities || activities.length === 0) {
    return <EmptyActivityHistoryState />;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6 w-full"
      >
        {Object.entries(groupedActivities).map(([date, dayActivities]) => {
          // Calculer les totaux du jour
          const dayTotalCalories = dayActivities.reduce((sum, activity) => sum + activity.calories_est, 0);
          const dayTotalDuration = dayActivities.reduce((sum, activity) => sum + activity.duration_min, 0);
          
          return (
            <div
              key={date}
              className="activity-group-enter"
            >
              <GlassCard 
                className="p-6"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-activity-primary) 8%, transparent) 0%, transparent 60%),
                    var(--glass-opacity)
                  `,
                  borderColor: 'color-mix(in srgb, var(--color-activity-primary) 20%, transparent)'
                }}
              >
                {/* En-tête du jour */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                          linear-gradient(135deg, color-mix(in srgb, #8B5CF6 30%, transparent), color-mix(in srgb, #8B5CF6 20%, transparent))
                        `,
                        border: '2px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                        boxShadow: '0 0 20px color-mix(in srgb, #8B5CF6 30%, transparent)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Calendar} size={18} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xl">{formatDateLabel(date)}</h4>
                      <p className="text-blue-200 text-sm">Forge énergétique de la journée</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">
                      {dayTotalCalories} kcal
                    </div>
                    <div className="text-white/60 text-sm">
                      {dayActivities.length} activité{dayActivities.length > 1 ? 's' : ''} • {dayTotalDuration} min
                    </div>
                  </div>
                </div>

                {/* Liste des activités du jour */}
                <div className="space-y-3">
                  {dayActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="group relative"
                    >
                      <div
                        className="p-5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] activity-item-enter"
                        style={{
                          background: `color-mix(in srgb, ${getIntensityColor(activity.intensity)} 4%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${getIntensityColor(activity.intensity)} 12%, transparent)`,
                          backdropFilter: 'blur(8px) saturate(120%)',
                          animationDelay: `${index * 0.1}s`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `color-mix(in srgb, ${getIntensityColor(activity.intensity)} 8%, transparent)`;
                          e.currentTarget.style.borderColor = `color-mix(in srgb, ${getIntensityColor(activity.intensity)} 20%, transparent)`;
                          e.currentTarget.style.boxShadow = `0 4px 16px color-mix(in srgb, ${getIntensityColor(activity.intensity)} 15%, transparent)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `color-mix(in srgb, ${getIntensityColor(activity.intensity)} 4%, transparent)`;
                          e.currentTarget.style.borderColor = `color-mix(in srgb, ${getIntensityColor(activity.intensity)} 12%, transparent)`;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{
                                background: `
                                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%),
                                  linear-gradient(135deg, color-mix(in srgb, ${getIntensityColor(activity.intensity)} 25%, transparent), color-mix(in srgb, ${getIntensityColor(activity.intensity)} 15%, transparent))
                                `,
                                border: `1px solid color-mix(in srgb, ${getIntensityColor(activity.intensity)} 30%, transparent)`,
                                boxShadow: `0 0 12px color-mix(in srgb, ${getIntensityColor(activity.intensity)} 20%, transparent)`
                              }}
                            >
                              <SpatialIcon 
                                Icon={ICONS[getActivityIcon(activity.type) as keyof typeof ICONS]} 
                                size={18} 
                                style={{ color: getIntensityColor(activity.intensity) }} 
                              />
                            </div>
                            <div>
                              <div className="text-white font-semibold text-lg">
                                {activity.type}
                              </div>
                              <div className="text-white/70 text-sm">
                                {getIntensityLabel(activity.intensity)} • {format(new Date(activity.timestamp), 'HH:mm')}
                              </div>
                            </div>
                          
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-white font-bold text-lg">
                                {activity.duration_min} min
                              </div>
                              <div className="text-white/60 text-sm">
                                {activity.calories_est} kcal
                              </div>
                            </div>
                            
                            {/* Bouton Supprimer */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteActivity(activity.id);
                              }}
                              disabled={deleteActivityMutation.isPending}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                              title="Supprimer cette activité"
                            >
                              {deleteActivityMutation.isPending ? (
                                <SpatialIcon Icon={ICONS.Loader2} size={14} className="text-red-400 animate-spin" />
                              ) : (
                                <SpatialIcon Icon={ICONS.Trash2} size={14} className="text-red-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </motion.div>

      {/* Modal de Détail */}
      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetailModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onDelete={handleDeleteActivity}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ActivityHistoryTab;