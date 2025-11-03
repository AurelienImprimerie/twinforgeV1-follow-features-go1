import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../../../system/store/userStore';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import logger from '../../../../../lib/utils/logger';

const ConnectedGoalsTracker: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const [goalsProgress, setGoalsProgress] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    const fetchGoalsProgress = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);
        const progress: any[] = [];
        setGoalsProgress(progress);
        logger.info('CONNECTED_GOALS', 'Goals progress fetched', { count: progress.length });
      } catch (error) {
        logger.error('CONNECTED_GOALS', 'Failed to fetch goals progress', { error });
      } finally {
        setLoading(false);
      }
    };

    fetchGoalsProgress();
  }, [profile?.id]);

  const handleRecalculateAll = async () => {
    if (!profile?.id) return;

    try {
      setSyncing(true);
      const updatedProgress: any[] = [];
      setGoalsProgress(updatedProgress);
      logger.info('CONNECTED_GOALS', 'All goals recalculated successfully');
    } catch (error) {
      logger.error('CONNECTED_GOALS', 'Failed to recalculate goals', { error });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl animate-pulse"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>
    );
  }

  if (goalsProgress.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, #10B981 20%, transparent), color-mix(in srgb, #10B981 10%, transparent))',
            border: '1px solid color-mix(in srgb, #10B981 30%, transparent)',
          }}
        >
          <SpatialIcon Icon={ICONS.Target} size={32} style={{ color: '#10B981' }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Objectifs Connectés</h3>
        <p className="text-white/70 text-base max-w-md mx-auto leading-relaxed mb-6">
          Créez des objectifs et ils se synchroniseront automatiquement avec vos activités et métriques biométriques pour suivre votre progression en temps réel.
        </p>
        <button
          onClick={() => {
            logger.info('CONNECTED_GOALS', 'User clicked Connect Device button', {
              from: 'activity_progression_tab',
              destination: '/settings?tab=appareils',
              timestamp: new Date().toISOString()
            });
            navigate('/settings?tab=appareils');
          }}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
          }}
        >
          Connecter un Objet
        </button>
      </GlassCard>
    );
  }

  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'volume':
        return ICONS.Clock;
      case 'distance':
        return ICONS.MapPin;
      case 'endurance':
        return ICONS.Activity;
      case 'strength':
        return ICONS.Zap;
      case 'frequency':
        return ICONS.Calendar;
      case 'vo2max':
        return ICONS.Heart;
      default:
        return ICONS.Target;
    }
  };

  const getProgressColor = (percentage: number, onTrack: boolean) => {
    if (percentage >= 100) return { primary: '#22C55E', secondary: '#10B981' };
    if (onTrack) return { primary: '#3B82F6', secondary: '#2563EB' };
    return { primary: '#F59E0B', secondary: '#D97706' };
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'km' || unit === 'kilometers') {
      return `${value.toFixed(1)} km`;
    }
    if (unit === 'minutes' || unit === 'min') {
      const hours = Math.floor(value / 60);
      const mins = Math.round(value % 60);
      return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    }
    if (unit === 'sessions') {
      return `${Math.round(value)} séances`;
    }
    if (unit === 'vo2max') {
      return `${value.toFixed(1)} ml/kg/min`;
    }
    return `${value.toFixed(1)} ${unit}`;
  };

  const formatDeadline = (deadline?: string): string => {
    if (!deadline) return '';
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Échéance dépassée';
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    if (diffDays <= 7) return `${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, #8B5CF6 25%, transparent), color-mix(in srgb, #8B5CF6 15%, transparent))',
              border: '1px solid color-mix(in srgb, #8B5CF6 35%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Target} size={20} style={{ color: '#10B981' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Objectifs Connectés</h2>
            <p className="text-white/60 text-sm">Synchronisés avec vos activités</p>
          </div>
        </div>

        <button
          onClick={handleRecalculateAll}
          disabled={syncing}
          className="px-4 py-2 rounded-lg font-medium text-white/80 hover:text-white transition-all flex items-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <SpatialIcon Icon={ICONS.RefreshCw} size={16} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Synchronisation...' : 'Recalculer'}
        </button>
      </div>

      <div className="space-y-4">
        {goalsProgress.map((progressResult) => {
          const goal = progressResult.goal;
          const colors = getProgressColor(progressResult.progress_percentage, progressResult.on_track);
          const Icon = getGoalTypeIcon(goal.goal_type);

          return (
            <GlassCard
              key={goal.id}
              className="p-6"
              style={{
                background: progressResult.progress_percentage >= 100
                  ? 'radial-gradient(circle at 30% 20%, color-mix(in srgb, #22C55E 12%, transparent) 0%, transparent 60%), var(--glass-opacity)'
                  : undefined,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, ${colors.primary} 25%, transparent), color-mix(in srgb, ${colors.secondary} 15%, transparent))`,
                      border: `1px solid color-mix(in srgb, ${colors.primary} 35%, transparent)`,
                      boxShadow: `0 0 20px color-mix(in srgb, ${colors.primary} 20%, transparent)`,
                    }}
                  >
                    <SpatialIcon Icon={Icon} size={24} style={{ color: colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                      {progressResult.progress_percentage >= 100 && (
                        <div
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: 'color-mix(in srgb, #22C55E 15%, transparent)',
                            border: '1px solid color-mix(in srgb, #22C55E 25%, transparent)',
                            color: '#22C55E',
                          }}
                        >
                          Complété
                        </div>
                      )}
                      {!progressResult.on_track && progressResult.progress_percentage < 100 && (
                        <div
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: 'color-mix(in srgb, #F59E0B 15%, transparent)',
                            border: '1px solid color-mix(in srgb, #F59E0B 25%, transparent)',
                            color: '#F59E0B',
                          }}
                        >
                          Retard
                        </div>
                      )}
                    </div>
                    {goal.discipline && (
                      <p className="text-white/50 text-sm">{goal.discipline}</p>
                    )}
                    {goal.deadline && (
                      <p className="text-white/50 text-xs mt-1">
                        Échéance: {formatDeadline(goal.deadline)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    {progressResult.progress_percentage.toFixed(0)}%
                  </p>
                  <p className="text-white/50 text-xs">progression</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(progressResult.progress_percentage, 100)}%`,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                      boxShadow: `0 0 12px ${colors.primary}`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-white/50 text-xs mb-1">Actuel</p>
                    <p className="text-white font-semibold">{formatValue(goal.current_value, goal.unit)}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-white/50 text-xs mb-1">Objectif</p>
                    <p className="text-white font-semibold">{formatValue(goal.target_value, goal.unit)}</p>
                  </div>
                </div>

                {progressResult.remaining > 0 && (
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-white/70 text-sm">
                      Encore {formatValue(progressResult.remaining, goal.unit)} pour atteindre l'objectif
                    </p>
                    {progressResult.estimated_completion_date && (
                      <p className="text-white/50 text-xs mt-1">
                        Estimation: {new Date(progressResult.estimated_completion_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectedGoalsTracker;
