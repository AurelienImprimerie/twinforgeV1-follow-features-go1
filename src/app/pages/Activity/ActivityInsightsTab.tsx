import React from 'react';
import { motion } from 'framer-motion';
import { useBlocker } from 'react-router-dom';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useActivityInsightsGenerator, useHasActivityHistory, getMinimumActivitiesForPeriod } from './hooks/useActivitiesData';
import { useActivityPeriodStore } from '../../../system/store/activityPeriodStore';
import { useUserStore } from '../../../system/store/userStore';
import { useToast } from '../../../ui/components/ToastProvider';
import { useExitModalStore } from '../../../system/store/exitModalStore';
import ActivityAnalysisLoadingSkeleton from './components/Progression/ActivityAnalysisLoadingSkeleton';
import ActivityInsightCards from './components/Progression/ActivityInsightCards';
import GlobalStatsCard from './components/Progression/GlobalStatsCard';
import ProgressionPeriodSelector from './components/Insights/ProgressionPeriodSelector';
import EmptyActivityInsightsState from './components/Insights/EmptyActivityInsightsState';
import BiometricInsightsSection from './components/Insights/BiometricInsightsSection';
import { useFeedback } from '../../../hooks/useFeedback';
import { useBiometricInsights } from '../../../hooks/useSharedActivityInsights';
import logger from '../../../lib/utils/logger';
import './styles/index.css';

const PERIOD_MAPPING = {
  'week': 'last7Days' as const,
  'month': 'last30Days' as const,
  'quarter': 'last3Months' as const,
};

/**
 * Activity Insights Tab - Onglet Insights Énergétiques
 * Affiche les conseils personnalisés et analyses IA générées par la Forge Énergétique
 * Utilise la période sélectionnée dans l'onglet Progression
 */
const ActivityInsightsTab: React.FC = () => {
  const { profile } = useUserStore();
  const { showToast } = useToast();
  const { click } = useFeedback();
  const { showModal: showExitModal } = useExitModalStore();

  // Récupérer la période depuis le store partagé
  const selectedPeriod = useActivityPeriodStore((state) => state.selectedPeriod);
  const setGlobalPeriod = useActivityPeriodStore((state) => state.setSelectedPeriod);
  const apiPeriod = PERIOD_MAPPING[selectedPeriod];

  // Suivre le nombre d'activités pour le sélecteur de période
  const [currentActivitiesCount, setCurrentActivitiesCount] = React.useState(0);

  // Vérifier l'historique d'activité
  const { data: hasActivityHistory = false } = useHasActivityHistory();

  // Générateur d'insights
  const { data: insightsData, isLoading, error } = useActivityInsightsGenerator(apiPeriod);

  // Générateur d'insights biométriques (activités enrichies uniquement)
  const {
    data: biometricData,
    isLoading: biometricLoading,
    error: biometricError
  } = useBiometricInsights({ period: apiPeriod, enabled: !!insightsData && !insightsData.insufficient_data });

  // Vérifier si on a des activités avec données biométriques
  const hasEnrichedActivities = React.useMemo(() => {
    return biometricData &&
           !biometricData.insufficient_data &&
           biometricData.enriched_activities &&
           biometricData.enriched_activities.length > 0;
  }, [biometricData]);

  // Logs de diagnostic pour le biométrique
  React.useEffect(() => {
    if (biometricData) {
      logger.info('ACTIVITY_INSIGHTS_TAB_BIOMETRIC', 'Biometric data received', {
        hasData: !!biometricData,
        insufficient: biometricData.insufficient_data,
        enrichedCount: biometricData.enriched_activities?.length || 0,
        insightsCount: biometricData.biometric_insights?.length || 0,
        timestamp: new Date().toISOString()
      });
    }
  }, [biometricData]);

  // Détecter si l'onglet insights est actif (vérifie le hash de l'URL)
  const [isTabActive, setIsTabActive] = React.useState(false);

  React.useEffect(() => {
    const checkTabActive = () => {
      const hash = window.location.hash.replace('#', '');
      setIsTabActive(hash === 'insights' || hash === '');
    };

    checkTabActive();
    window.addEventListener('hashchange', checkTabActive);
    return () => window.removeEventListener('hashchange', checkTabActive);
  }, []);

  // Bloquer la navigation pendant le chargement de l'analyse - UNIQUEMENT si l'onglet est actif
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      // Ne bloquer que si l'onglet insights est actif ET qu'on est en chargement ET qu'on change de page
      const shouldBlock = isTabActive && isLoading && currentLocation.pathname !== nextLocation.pathname;

      if (shouldBlock) {
        logger.info('ACTIVITY_INSIGHTS_TAB', 'Navigation blocked during analysis loading', {
          currentPath: currentLocation.pathname,
          nextPath: nextLocation.pathname,
          isLoading,
          timestamp: new Date().toISOString()
        });

        showExitModal({
          title: "Attention ! Analyse d'insights en cours",
          message: "Voulez-vous vraiment quitter l'analyse ? Les insights pourraient être perdus et devront être régénérés.",
          processName: "Analyse d'Insights",
          onConfirm: () => {
            logger.info('ACTIVITY_INSIGHTS_TAB', 'User confirmed exit during analysis', {
              currentPath: currentLocation.pathname,
              nextPath: nextLocation.pathname,
              timestamp: new Date().toISOString()
            });
            blocker.proceed?.();
          },
          onCancel: () => {
            logger.info('ACTIVITY_INSIGHTS_TAB', 'User cancelled exit during analysis', {
              currentPath: currentLocation.pathname,
              nextPath: nextLocation.pathname,
              timestamp: new Date().toISOString()
            });
            blocker.reset?.();
          }
        });
      }

      return shouldBlock;
    }
  );

  // Mettre à jour le nombre d'activités
  React.useEffect(() => {
    if (insightsData?.current_activities !== undefined) {
      logger.info('ACTIVITY_INSIGHTS_TAB_DIAGNOSTIC', 'Current activities count updated', {
        previousCount: currentActivitiesCount,
        newCount: insightsData.current_activities,
        summaryTotalActivities: insightsData.summary?.total_activities,
        dataConsistency: insightsData.current_activities === insightsData.summary?.total_activities ? 'consistent' : 'inconsistent',
        cached: insightsData.cached || false,
        timestamp: new Date().toISOString()
      });

      setCurrentActivitiesCount(insightsData.current_activities);
    }
  }, [insightsData?.current_activities, currentActivitiesCount, insightsData?.summary?.total_activities, insightsData?.cached]);

  // Gestion des erreurs
  React.useEffect(() => {
    if (error) {
      logger.error('ACTIVITY_INSIGHTS_TAB', 'Erreur lors de la génération des insights', {
        error: error instanceof Error ? error.message : 'Unknown error',
        selectedPeriod,
        timestamp: new Date().toISOString()
      });
      showToast({
        type: 'error',
        title: 'Erreur d\'analyse',
        message: 'Impossible de générer les insights. Veuillez réessayer.',
        duration: 4000
      });
    }
  }, [error, selectedPeriod, showToast]);

  // Handler pour le changement de période
  const handlePeriodChange = (period: 'week' | 'month' | 'quarter') => {
    click();
    setGlobalPeriod(period);

    logger.info('ACTIVITY_INSIGHTS_TAB', 'Period changed by user', {
      newPeriod: period,
      apiPeriod: PERIOD_MAPPING[period],
      timestamp: new Date().toISOString()
    });
  };

  // Calculer les seuils pour affichage
  const periodThresholds = {
    week: getMinimumActivitiesForPeriod('last7Days'),
    month: getMinimumActivitiesForPeriod('last30Days'),
    quarter: getMinimumActivitiesForPeriod('last3Months'),
  };

  const isFallbackData = insightsData?.fallback;
  const isCachedData = insightsData?.cached;

  // Affichage si pas d'historique d'activité
  if (!hasActivityHistory) {
    return <EmptyActivityInsightsState />;
  }

  // Affichage si données insuffisantes
  if (insightsData?.insufficient_data) {
    return (
      <div className="space-y-6">
        {/* Sélecteur de Période */}
        <ProgressionPeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          currentActivities={currentActivitiesCount}
          periodThresholds={periodThresholds}
          accentColor="#F59E0B"
        />

        {/* Message de données insuffisantes */}
        <GlassCard
          className="p-8 text-center"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 15%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, color-mix(in srgb, #EF4444 12%, transparent) 0%, transparent 50%),
              linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #F59E0B 30%, transparent)',
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.25),
              0 0 30px color-mix(in srgb, #F59E0B 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.15)
            `
          }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center breathing-icon"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 30%, transparent), color-mix(in srgb, #F59E0B 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
                boxShadow: '0 0 30px color-mix(in srgb, #F59E0B 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.AlertCircle} size={40} style={{ color: '#F59E0B' }} />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white">Insights en Construction</h3>
              <p className="text-white/70 text-base">Plus d'activités nécessaires</p>
            </div>
          </div>

          <div className="space-y-4 max-w-lg mx-auto">
            <p className="text-white/80 text-lg leading-relaxed">
              Vous avez <strong className="text-orange-300">{insightsData.current_activities}</strong> activité{insightsData.current_activities > 1 ? 's' : ''} enregistrée{insightsData.current_activities > 1 ? 's' : ''}.
            </p>
            <p className="text-white/70 text-base leading-relaxed">
              Il vous faut au moins <strong className="text-orange-300">{insightsData.required_activities}</strong> activités
              pour générer des insights personnalisés sur cette période.
            </p>

            <div className="mt-6 p-4 rounded-xl" style={{
              background: 'color-mix(in srgb, #3B82F6 8%, transparent)',
              border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)'
            }}>
              <div className="flex items-center gap-3 mb-3">
                <SpatialIcon Icon={ICONS.Zap} size={16} style={{ color: '#3B82F6' }} />
                <span className="text-blue-300 font-semibold text-sm">Passez à l'action !</span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed">
                Enregistrez {insightsData.required_activities - insightsData.current_activities} activité{(insightsData.required_activities - insightsData.current_activities) > 1 ? 's' : ''} supplémentaire{(insightsData.required_activities - insightsData.current_activities) > 1 ? 's' : ''}
                pour débloquer vos insights personnalisés et découvrir des recommandations sur mesure.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Affichage pour les données de fallback (mode local)
  if (isFallbackData && insightsData) {
    return (
      <div className="space-y-6">
        {/* Sélecteur de Période */}
        <ProgressionPeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          currentActivities={currentActivitiesCount}
          periodThresholds={periodThresholds}
          accentColor="#F59E0B"
        />

        {/* Bannière mode fallback local */}
        <GlassCard
          className="p-4"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #F59E0B 25%, transparent)',
            boxShadow: `0 0 16px color-mix(in srgb, #F59E0B 15%, transparent)`
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, #F59E0B 15%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 25%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Info} size={14} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <p className="text-orange-300 font-medium text-sm">
                Mode Analyse Locale
              </p>
              <p className="text-orange-200 text-xs mt-0.5">
                Insights générés localement à partir de vos données d'activité
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlobalStatsCard
            globalStats={insightsData?.summary}
            period={selectedPeriod}
            apiPeriod={apiPeriod}
          />

          <ActivityInsightCards
            insights={insightsData?.insights || []}
            summary={insightsData?.summary}
            period={selectedPeriod}
            apiPeriod={apiPeriod}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Sélecteur de Période */}
      <ProgressionPeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        currentActivities={currentActivitiesCount}
        periodThresholds={periodThresholds}
        accentColor="#F59E0B"
      />

      {/* Indicateur de fallback ou de cache */}
      {isFallbackData && (
        <GlassCard
          className="p-4"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #F59E0B 25%, transparent)',
            boxShadow: `0 0 16px color-mix(in srgb, #F59E0B 15%, transparent)`
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, #F59E0B 15%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 25%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Info} size={14} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <p className="text-orange-300 font-medium text-sm">
                Mode Analyse Locale
              </p>
              <p className="text-orange-200 text-xs mt-0.5">
                Insights générés localement à partir de vos données d'activité
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {isCachedData && !isFallbackData && (
        <GlassCard
          className="p-4"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #22C55E 8%, transparent) 0%, transparent 60%),
              var(--glass-opacity)
            `,
            borderColor: 'color-mix(in srgb, #22C55E 25%, transparent)',
            boxShadow: `0 0 16px color-mix(in srgb, #22C55E 15%, transparent)`
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, #22C55E 15%, transparent)',
                border: '1px solid color-mix(in srgb, #22C55E 25%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Check} size={14} style={{ color: '#22C55E' }} />
            </div>
            <div>
              <p className="text-green-300 font-medium text-sm">
                Données mises en cache
              </p>
              <p className="text-green-200 text-xs mt-0.5">
                Dernière analyse: {insightsData.cache_age_hours}h • Économie de coûts IA
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Contenu Principal */}
      {isLoading ? (
        <ActivityAnalysisLoadingSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Statistiques Globales */}
          <GlobalStatsCard
            globalStats={insightsData?.summary}
            period={selectedPeriod}
            apiPeriod={apiPeriod}
          />

          {/* Cartes d'Insights - Forge énergétique (plus complet) */}
          <ActivityInsightCards
            insights={insightsData?.insights || []}
            summary={insightsData?.summary}
            period={selectedPeriod}
            apiPeriod={apiPeriod}
          />

          {/* Section Insights Biométriques - Données enrichies uniquement */}
          {hasEnrichedActivities && (
            <div className="space-y-6">
              <GlassCard
                className="p-6"
                style={{
                  background: `
                    radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 60%),
                    var(--glass-opacity)
                  `,
                  borderColor: 'color-mix(in srgb, #8B5CF6 20%, transparent)'
                }}
              >
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
                    <SpatialIcon Icon={ICONS.Activity} size={20} style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Analyse Biométrique Avancée</h3>
                    <p className="text-purple-200 text-sm">Insights basés sur vos données de fréquence cardiaque et performance</p>
                  </div>
                </div>
              </GlassCard>

              {biometricLoading ? (
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
              ) : biometricError ? (
                <GlassCard className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, #EF4444 20%, transparent), color-mix(in srgb, #EF4444 10%, transparent))',
                    border: '1px solid color-mix(in srgb, #EF4444 30%, transparent)'
                  }}>
                    <SpatialIcon Icon={ICONS.AlertCircle} size={32} style={{ color: '#EF4444' }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Erreur d'analyse biométrique</h3>
                  <p className="text-white/70 text-base">Impossible de charger les insights biométriques</p>
                </GlassCard>
              ) : (
                <BiometricInsightsSection period={selectedPeriod} />
              )}
            </div>
          )}

          {/* Encouragement à connecter un wearable si pas d'activités enrichies */}
          {!biometricLoading && !hasEnrichedActivities && insightsData && !insightsData.insufficient_data && (
            <GlassCard
              className="p-6 text-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 8%, transparent) 0%, transparent 60%),
                  var(--glass-opacity)
                `,
                borderColor: 'color-mix(in srgb, #3B82F6 20%, transparent)'
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, #3B82F6 20%, transparent), color-mix(in srgb, #3B82F6 10%, transparent))',
                border: '1px solid color-mix(in srgb, #3B82F6 30%, transparent)'
              }}>
                <SpatialIcon Icon={ICONS.Watch} size={32} style={{ color: '#3B82F6' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Débloquez l'Analyse Biométrique
              </h3>
              <p className="text-white/70 text-base mb-4 max-w-md mx-auto leading-relaxed">
                Connectez une montre ou un capteur cardiaque pour accéder à des insights avancés:
                corrélation FC/Performance, détection de surentraînement, fenêtres optimales d'entraînement.
              </p>
              <div className="text-blue-300 text-sm">
                Rendez-vous dans Paramètres → Objets Connectés
              </div>
            </GlassCard>
          )}

          {/* Message "Aucun insight généré" */}
          {insightsData && (!insightsData.insights || insightsData.insights.length === 0) && (
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, #F59E0B 20%, transparent), color-mix(in srgb, #F59E0B 10%, transparent))',
                border: '1px solid color-mix(in srgb, #F59E0B 30%, transparent)'
              }}>
                <SpatialIcon Icon={ICONS.Info} size={32} style={{ color: '#F59E0B' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Aucun Insight Généré
              </h3>
              <p className="text-white/70 text-base mb-6 max-w-md mx-auto leading-relaxed">
                Aucun insight n'a été généré pour cette période.
                Continuez à enregistrer vos activités pour enrichir l'analyse
                et débloquer des insights personnalisés.
              </p>
              <div className="text-orange-300 text-sm">
                Enregistrez plus d'activités pour des insights détaillés
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ActivityInsightsTab;
