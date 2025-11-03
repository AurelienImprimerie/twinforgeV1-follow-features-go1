import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useRecentActivities } from '../../hooks/useActivitiesData';
import React from 'react';

// Optimized with CSS classes - see dailyRecap.css

interface DailyStatsGridProps {
  todayStats?: {
    totalCalories: number;
    activitiesCount: number;
    totalDuration: number;
    lastActivityTime?: Date;
  };
}

/**
 * Daily Stats Grid - Grille des statistiques quotidiennes d'activité
 * Affiche les métriques clés de la journée
 * OPTIMIZED: Styles inline remplacés par classes CSS réutilisables
 */
const DailyStatsGrid: React.FC<DailyStatsGridProps> = React.memo(({ todayStats }) => {
  // Récupérer la dernière activité de l'historique
  const { data: recentActivities = [] } = useRecentActivities(1);
  const lastActivity = recentActivities[0];

  return (
    <div className="daily-stats-grid">
      {/* Énergie Quotidienne (Calories brûlées) */}
      <GlassCard className="daily-stat-card daily-stat-card-primary">
        <div className="text-center mb-6">
          <div className="daily-stat-icon-container daily-stat-icon-primary">
            <SpatialIcon Icon={ICONS.Zap} size={28} style={{ color: '#3B82F6' }} />
          </div>
          <h3 className="daily-stat-title">Énergie Brûlée Aujourd'hui</h3>
          <p className="daily-stat-subtitle">Calories du jour</p>
        </div>
        <div className="daily-stat-value">
          {todayStats?.totalCalories || 0}
        </div>
        <div className="daily-stat-label">
          kcal forgées
        </div>
      </GlassCard>

      {/* Activités Enregistrées */}
      <GlassCard className="daily-stat-card daily-stat-card-secondary">
        <div className="text-center mb-6">
          <div className="daily-stat-icon-container daily-stat-icon-secondary">
            <SpatialIcon Icon={ICONS.Activity} size={28} className="text-cyan-400" />
          </div>
          <h3 className="daily-stat-title">Activités d'Aujourd'hui</h3>
          <p className="daily-stat-subtitle">Mouvements forgés</p>
        </div>
        <div className="daily-stat-value">
          {todayStats?.activitiesCount || 0}
        </div>
        <div className="daily-stat-label">
          Sessions du jour
        </div>
      </GlassCard>

      {/* Dernière Activité de l'historique */}
      <GlassCard className="daily-stat-card daily-stat-card-accent">
        <div className="text-center mb-6">
          <div className="daily-stat-icon-container daily-stat-icon-accent">
            <SpatialIcon Icon={ICONS.Clock} size={28} className="text-purple-400" />
          </div>
          <h3 className="daily-stat-title">Dernière Activité</h3>
          <p className="daily-stat-subtitle">Historique des forges</p>
        </div>
        {lastActivity ? (
          <>
            <div className="daily-stat-value text-lg">
              {lastActivity.type}
            </div>
            <div className="daily-stat-label">
              {format(new Date(lastActivity.timestamp), 'dd MMM à HH:mm', { locale: fr })} • {lastActivity.duration_min} min
            </div>
          </>
        ) : (
          <>
            <div className="daily-stat-value">
              --:--
            </div>
            <div className="daily-stat-label">
              Aucune activité
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
});

DailyStatsGrid.displayName = 'DailyStatsGrid';

export default DailyStatsGrid;
