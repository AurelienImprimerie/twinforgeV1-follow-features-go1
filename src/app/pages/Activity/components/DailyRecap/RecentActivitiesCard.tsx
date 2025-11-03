import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import WearableConnectionBadge from '../shared/WearableConnectionBadge';
import React from 'react';

interface Activity {
  id: string;
  type: string;
  duration_min: number;
  calories_est: number;
  intensity: string;
  timestamp: string;
  notes?: string;
}

interface RecentActivitiesCardProps {
  todayActivities?: Activity[];
  todayStats?: {
    totalCalories: number;
    activitiesCount: number;
    totalDuration: number;
  };
  hasAnyActivityHistory?: boolean;
  onActivityClick?: (activity: Activity) => void;
  deletingActivityId?: string;
  onDeleteActivity?: (activityId: string) => void;
}

/**
 * Obtenir l'icône appropriée pour un type d'activité
 */
function getActivityIcon(activityType: string): keyof typeof ICONS {
  const type = activityType.toLowerCase();
  
  if (type.includes('course') || type.includes('running')) return 'Activity';
  if (type.includes('marche') || type.includes('walk')) return 'Activity';
  if (type.includes('velo') || type.includes('bike')) return 'Activity';
  if (type.includes('natation') || type.includes('swim')) return 'Activity';
  if (type.includes('musculation') || type.includes('weight')) return 'Dumbbell';
  if (type.includes('yoga')) return 'Smile';
  if (type.includes('football') || type.includes('sport')) return 'Target';
  
  return 'Zap'; // Icône par défaut
}

/**
 * Obtenir la couleur d'intensité
 */
function getIntensityColor(intensity: string): string {
  switch (intensity) {
    case 'low': return '#22C55E';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'very_high': return '#DC2626';
    default: return '#3B82F6';
  }
}

/**
 * Recent Activities Card - Dernières activités enregistrées
 * Affiche la liste des dernières activités (pas uniquement aujourd'hui)
 */
const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({
  todayActivities = [],
  todayStats,
  hasAnyActivityHistory = false,
  onActivityClick,
  deletingActivityId,
  onDeleteActivity
}) => {
  const handleDeleteActivity = (activityId: string) => {
    if (onDeleteActivity) {
      onDeleteActivity(activityId);
    }
  };

  return (
    <GlassCard className="recent-activities-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="activity-summary-icon activity-icon-primary activity-icon-container-md">
          <SpatialIcon Icon={ICONS.History} size={20} style={{ color: 'var(--color-activity-primary)' }} />
        </div>
        <div>
          <h3 className="activity-summary-title">Dernières Activités</h3>
          <p className="activity-summary-subtitle">Historique de vos dernières sessions</p>
        </div>
      </div>

      {todayActivities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.Activity} size={32} className="text-blue-400" />
          </div>
          <p className="text-white/70 text-sm mb-2">
            Aucune activité enregistrée.
          </p>
          <p className="text-white/50 text-xs">
            Commencez votre voyage énergétique en enregistrant votre première activité !
          </p>
        </div>
      ) : (
        <div className="recent-activities-list">
          {todayActivities.map((activity, index) => (
            <div key={activity.id} className="group relative">
              <div
                className="recent-activity-item activity-item-enter"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => onActivityClick?.(activity)}
              >
                <div className="recent-activity-item-header">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
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
                        Icon={ICONS[getActivityIcon(activity.type)]}
                        size={16}
                        style={{ color: getIntensityColor(activity.intensity) }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="recent-activity-item-type">
                          {activity.type}
                        </div>
                        <WearableConnectionBadge activityId={activity.id} />
                      </div>
                      <div className="recent-activity-item-time">
                        {activity.duration_min} min • {format(new Date(activity.timestamp), 'dd MMM HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </div>

                  <div className="recent-activity-item-stats">
                    <div className="recent-activity-item-stat">
                      <div className="text-white font-bold text-lg">
                        {activity.calories_est} kcal
                      </div>
                      <div className="text-white/60 text-xs">Brûlées</div>
                    </div>

                    {onDeleteActivity && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteActivity(activity.id);
                        }}
                        disabled={deletingActivityId === activity.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                        title="Supprimer cette activité"
                      >
                        {deletingActivityId === activity.id ? (
                          <SpatialIcon Icon={ICONS.Loader2} size={14} className="text-red-400 animate-spin" />
                        ) : (
                          <SpatialIcon Icon={ICONS.Trash2} size={14} className="text-red-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default RecentActivitiesCard;