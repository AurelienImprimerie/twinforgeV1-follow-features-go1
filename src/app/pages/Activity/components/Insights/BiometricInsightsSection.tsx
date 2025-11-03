import React from 'react';
import { useUserStore } from '../../../../../system/store/userStore';
import { biometricAnalysisService } from '../../../../../system/services/biometricAnalysisService';
import type {
  HRPerformanceCorrelation,
  OvertrainingIndicator,
  OptimalTrainingWindow,
} from '../../../../../system/services/biometricAnalysisService';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import WearableConnectionBadge from '../shared/WearableConnectionBadge';
import logger from '../../../../../lib/utils/logger';

interface BiometricInsightsSectionProps {
  period: 'week' | 'month' | 'quarter';
}

const BiometricInsightsSection: React.FC<BiometricInsightsSectionProps> = ({ period }) => {
  const { profile } = useUserStore();
  const [correlation, setCorrelation] = React.useState<HRPerformanceCorrelation | null>(null);
  const [overtraining, setOvertraining] = React.useState<OvertrainingIndicator | null>(null);
  const [windows, setWindows] = React.useState<OptimalTrainingWindow[]>([]);
  const [goalsProgress, setGoalsProgress] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;

  React.useEffect(() => {
    const fetchBiometricInsights = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);
        logger.info('BIOMETRIC_INSIGHTS_SECTION', 'Fetching biometric insights from local service', {
          userId: profile.id,
          period,
          periodDays,
          timestamp: new Date().toISOString()
        });

        const [corrData, overtrainData, windowsData, goalsData] = await Promise.all([
          biometricAnalysisService.analyzeHRPerformanceCorrelation(profile.id, periodDays),
          biometricAnalysisService.detectOvertraining(profile.id),
          biometricAnalysisService.findOptimalTrainingWindows(profile.id, periodDays * 2),
          Promise.resolve([]),
        ]);

        setCorrelation(corrData);
        setOvertraining(overtrainData);
        setWindows(windowsData);
        setGoalsProgress(goalsData);

        logger.info('BIOMETRIC_INSIGHTS_SECTION', 'Biometric insights fetched successfully', {
          hasCorrelation: !!corrData,
          overtrainingSeverity: overtrainData?.severity,
          windowsCount: windowsData?.length,
          hasGoals: goalsData?.length > 0,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('BIOMETRIC_INSIGHTS_SECTION', 'Failed to fetch biometric insights', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: profile.id,
          period,
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBiometricInsights();
  }, [profile?.id, periodDays, period]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl animate-pulse"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            }}
          />
        ))}
      </div>
    );
  }

  const hasData = correlation || (overtraining && overtraining.severity !== 'none') || windows.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <WearableConnectionBadge />
        </div>
        <GlassCard className="p-8 text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, #F59E0B 20%, transparent), color-mix(in srgb, #F59E0B 10%, transparent))',
              border: '1px solid color-mix(in srgb, #F59E0B 30%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Activity} size={32} style={{ color: '#F59E0B' }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Insights Biométriques</h3>
          <p className="text-white/70 text-base max-w-md mx-auto leading-relaxed">
            Connectez un objet et enregistrez des activités avec données biométriques pour débloquer des analyses
            avancées de corrélation FC/Performance, détection de surentraînement et fenêtres optimales.
          </p>
        </GlassCard>
      </div>
    );
  }

  const severityColors = {
    none: { primary: '#22C55E', secondary: '#10B981' },
    low: { primary: '#F59E0B', secondary: '#D97706' },
    moderate: { primary: '#F97316', secondary: '#EA580C' },
    high: { primary: '#EF4444', secondary: '#DC2626' },
  };

  const trendColors = {
    improving: { primary: '#22C55E', secondary: '#10B981', icon: ICONS.TrendingUp },
    stable: { primary: '#3B82F6', secondary: '#2563EB', icon: ICONS.Minus },
    declining: { primary: '#EF4444', secondary: '#DC2626', icon: ICONS.TrendingDown },
  };

  const timeOfDayLabels = {
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
  };

  const timeOfDayIcons = {
    morning: ICONS.Sunrise,
    afternoon: ICONS.Sun,
    evening: ICONS.Moon,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <WearableConnectionBadge />
      </div>

      {correlation && (
        <GlassCard className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${trendColors[correlation.trend].primary} 25%, transparent), color-mix(in srgb, ${trendColors[correlation.trend].secondary} 15%, transparent))`,
                border: `1px solid color-mix(in srgb, ${trendColors[correlation.trend].primary} 35%, transparent)`,
                boxShadow: `0 0 20px color-mix(in srgb, ${trendColors[correlation.trend].primary} 20%, transparent)`,
              }}
            >
              <SpatialIcon Icon={ICONS.Activity} size={24} style={{ color: trendColors[correlation.trend].primary }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">Corrélation FC / Performance</h3>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{
                    background: `color-mix(in srgb, ${trendColors[correlation.trend].primary} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${trendColors[correlation.trend].primary} 25%, transparent)`,
                    color: trendColors[correlation.trend].primary,
                  }}
                >
                  <SpatialIcon Icon={trendColors[correlation.trend].icon} size={12} />
                  {correlation.trend === 'improving' && 'En amélioration'}
                  {correlation.trend === 'stable' && 'Stable'}
                  {correlation.trend === 'declining' && 'En baisse'}
                </div>
              </div>
              <p className="text-white/70 text-sm">
                Analyse de l'efficacité cardiovasculaire sur les {periodDays} derniers jours
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 mb-2">
                <SpatialIcon Icon={ICONS.Heart} size={14} style={{ color: '#EF4444' }} />
                <span className="text-white/60 text-xs font-medium">Fréquence Cardiaque Moyenne</span>
              </div>
              <p className="text-2xl font-bold text-white">{correlation.avgHeartRate.toFixed(0)} bpm</p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2 mb-2">
                <SpatialIcon Icon={ICONS.Target} size={14} style={{ color: '#3B82F6' }} />
                <span className="text-white/60 text-xs font-medium">Score d'Efficacité</span>
              </div>
              <p className="text-2xl font-bold text-white">{correlation.efficiency.toFixed(0)}%</p>
            </div>

            {correlation.avgPace && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <SpatialIcon Icon={ICONS.Zap} size={14} style={{ color: '#F59E0B' }} />
                  <span className="text-white/60 text-xs font-medium">Allure Moyenne</span>
                </div>
                <p className="text-2xl font-bold text-white">{correlation.avgPace.toFixed(1)} min/km</p>
              </div>
            )}

            {correlation.avgPower && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <SpatialIcon Icon={ICONS.Zap} size={14} style={{ color: '#8B5CF6' }} />
                  <span className="text-white/60 text-xs font-medium">Puissance Moyenne</span>
                </div>
                <p className="text-2xl font-bold text-white">{correlation.avgPower.toFixed(0)} W</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {overtraining && overtraining.severity !== 'none' && (
        <GlassCard
          className="p-6"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, ${severityColors[overtraining.severity].primary} 12%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: `color-mix(in srgb, ${severityColors[overtraining.severity].primary} 30%, transparent)`,
            boxShadow: `0 0 24px color-mix(in srgb, ${severityColors[overtraining.severity].primary} 15%, transparent)`,
          }}
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${severityColors[overtraining.severity].primary} 25%, transparent), color-mix(in srgb, ${severityColors[overtraining.severity].secondary} 15%, transparent))`,
                border: `1px solid color-mix(in srgb, ${severityColors[overtraining.severity].primary} 35%, transparent)`,
                boxShadow: `0 0 20px color-mix(in srgb, ${severityColors[overtraining.severity].primary} 25%, transparent)`,
              }}
            >
              <SpatialIcon Icon={ICONS.AlertTriangle} size={24} style={{ color: severityColors[overtraining.severity].primary }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">Détection Surentraînement</h3>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `color-mix(in srgb, ${severityColors[overtraining.severity].primary} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${severityColors[overtraining.severity].primary} 25%, transparent)`,
                    color: severityColors[overtraining.severity].primary,
                  }}
                >
                  {overtraining.severity === 'low' && 'Vigilance'}
                  {overtraining.severity === 'moderate' && 'Attention'}
                  {overtraining.severity === 'high' && 'Alerte'}
                </div>
              </div>
              <p className="text-white/70 text-sm">Score de risque: {overtraining.score}/100</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.AlertCircle} size={14} />
                Indicateurs détectés
              </h4>
              <div className="space-y-2">
                {overtraining.indicators.map((indicator, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-1 h-1 rounded-full mt-2" style={{ background: severityColors[overtraining.severity].primary }} />
                    <span className="text-white/80 text-sm">{indicator}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <SpatialIcon Icon={ICONS.Lightbulb} size={14} />
                Recommandations
              </h4>
              <div className="space-y-2">
                {overtraining.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 rounded-lg"
                    style={{
                      background: `color-mix(in srgb, ${severityColors[overtraining.severity].primary} 8%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${severityColors[overtraining.severity].primary} 15%, transparent)`,
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Check} size={14} style={{ color: severityColors[overtraining.severity].primary, marginTop: 2 }} />
                    <span className="text-white/90 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {windows.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, #8B5CF6 25%, transparent), color-mix(in srgb, #8B5CF6 15%, transparent))',
                border: '1px solid color-mix(in srgb, #8B5CF6 35%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #8B5CF6 20%, transparent)',
              }}
            >
              <SpatialIcon Icon={ICONS.Clock} size={24} style={{ color: '#8B5CF6' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Fenêtres Optimales d'Entraînement</h3>
              <p className="text-white/70 text-sm">
                Basé sur {periodDays * 2} jours d'analyse de vos performances
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {windows.map((window, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl"
                style={{
                  background: idx === 0
                    ? 'linear-gradient(135deg, color-mix(in srgb, #8B5CF6 12%, transparent), color-mix(in srgb, #8B5CF6 5%, transparent))'
                    : 'rgba(255,255,255,0.05)',
                  border: idx === 0
                    ? '1px solid color-mix(in srgb, #8B5CF6 25%, transparent)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <SpatialIcon Icon={timeOfDayIcons[window.timeOfDay]} size={20} style={{ color: '#8B5CF6' }} />
                    <div>
                      <h4 className="text-white font-semibold text-base">{timeOfDayLabels[window.timeOfDay]}</h4>
                      {idx === 0 && (
                        <span className="text-purple-300 text-xs font-medium">Meilleur créneau</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs">Confiance</p>
                    <p className="text-white font-bold text-sm">{(window.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-white/50 text-xs mb-1">Performance</p>
                    <p className="text-white font-semibold">{window.avgPerformance.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs mb-1">Récupération</p>
                    <p className="text-white font-semibold">{window.avgRecovery.toFixed(0)}%</p>
                  </div>
                </div>

                <p className="text-white/80 text-sm">{window.recommendation}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {goalsProgress.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, #10B981 25%, transparent), color-mix(in srgb, #10B981 15%, transparent))',
                border: '1px solid color-mix(in srgb, #10B981 35%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #10B981 20%, transparent)',
              }}
            >
              <SpatialIcon Icon={ICONS.Target} size={24} style={{ color: '#10B981' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Recommandations basées sur vos Objectifs</h3>
              <p className="text-white/70 text-sm">
                Insights personnalisés pour atteindre vos objectifs
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {goalsProgress.map((progressResult) => {
              const goal = progressResult.goal;
              const daysRemaining = goal.deadline
                ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null;

              const needsAcceleration = daysRemaining && daysRemaining <= 14 && progressResult.progress_percentage < 70;
              const offTrack = !progressResult.on_track && progressResult.progress_percentage < 100;

              if (!needsAcceleration && !offTrack) return null;

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl"
                  style={{
                    background: needsAcceleration
                      ? 'linear-gradient(135deg, color-mix(in srgb, #F59E0B 12%, transparent), color-mix(in srgb, #F59E0B 5%, transparent))'
                      : 'linear-gradient(135deg, color-mix(in srgb, #3B82F6 12%, transparent), color-mix(in srgb, #3B82F6 5%, transparent))',
                    border: needsAcceleration
                      ? '1px solid color-mix(in srgb, #F59E0B 25%, transparent)'
                      : '1px solid color-mix(in srgb, #3B82F6 25%, transparent)',
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <SpatialIcon
                      Icon={needsAcceleration ? ICONS.AlertTriangle : ICONS.Info}
                      size={20}
                      style={{ color: needsAcceleration ? '#F59E0B' : '#3B82F6', marginTop: 2 }}
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-base mb-1">{goal.title}</h4>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {needsAcceleration ? (
                          <>
                            <strong>Action urgente :</strong> Il vous reste {daysRemaining} jours pour atteindre cet objectif.
                            Vous êtes à {progressResult.progress_percentage.toFixed(0)}% de complétion.
                            {goal.goal_type === 'volume' && ' Augmentez votre fréquence d\'entraînement de 20% cette semaine.'}
                            {goal.goal_type === 'distance' && ' Privilégiez des séances plus longues pour maximiser la distance parcourue.'}
                            {goal.goal_type === 'endurance' && ' Intégrez 2 séances d\'interval training haute intensité cette semaine.'}
                          </>
                        ) : offTrack ? (
                          <>
                            <strong>Ajustez votre stratégie :</strong> Vous êtes légèrement en retard sur cet objectif.
                            Basé sur vos performances biométriques, {correlation && correlation.trend === 'improving'
                              ? 'vous êtes en phase d\'amélioration. Maintenez le cap avec une progression constante.'
                              : 'assurez-vous de bien récupérer entre les séances pour optimiser vos performances.'}
                          </>
                        ) : null}
                      </p>

                      {progressResult.estimated_completion_date && daysRemaining && daysRemaining > 0 && (
                        <p className="text-white/60 text-xs mt-2">
                          Estimation d'achèvement: {new Date(progressResult.estimated_completion_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {windows.length > 0 && needsAcceleration && (
                    <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-white/70 text-xs mb-1">💡 Fenêtre optimale recommandée</p>
                      <p className="text-white text-sm font-medium">
                        {windows[0].timeOfDay === 'morning' && 'Matin'}
                        {windows[0].timeOfDay === 'afternoon' && 'Après-midi'}
                        {windows[0].timeOfDay === 'evening' && 'Soir'}
                        {' '}pour maximiser vos performances et atteindre votre objectif plus rapidement
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default BiometricInsightsSection;
