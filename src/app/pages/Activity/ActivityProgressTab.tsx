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
import { useFeedback } from '../../../hooks/useFeedback';
import { useExitModalStore } from '../../../system/store/exitModalStore';
import ActivityAnalysisLoadingSkeleton from './components/Progression/ActivityAnalysisLoadingSkeleton';
import ActivityDistributionChart from './components/Progression/ActivityDistributionChart';
import ActivityHeatmap from './components/Progression/ActivityHeatmap';
import ActivityCalorieEvolutionChart from './components/Progression/ActivityCalorieEvolutionChart';
import ActivityWeeklyDistributionChart from './components/Progression/ActivityWeeklyDistributionChart';
import VO2MaxEvolutionChart from './components/Progression/VO2MaxEvolutionChart';
import HRZonesHeatmap from './components/Progression/HRZonesHeatmap';
import FitnessFatigueChart from './components/Progression/FitnessFatigueChart';
import ConnectedGoalsTracker from './components/Progression/ConnectedGoalsTracker';
import ProgressionPeriodSelector from './components/Insights/ProgressionPeriodSelector';
import EmptyActivityProgressionState from './components/Progression/EmptyActivityProgressionState';
import logger from '../../../lib/utils/logger';
import './styles/index.css';

// Mapping entre les types de période
const PERIOD_MAPPING = {
  'week': 'last7Days' as const,
  'month': 'last30Days' as const,
  'quarter': 'last3Months' as const,
};

const REVERSE_PERIOD_MAPPING = {
  'last7Days': 'week' as const,
  'last30Days': 'month' as const,
  'last3Months': 'quarter' as const,
};

/**
 * Calculer la période par défaut basée sur l'historique d'activité
 */
function calculateDefaultPeriod(hasActivityHistory: boolean, currentActivities: number): 'week' | 'month' | 'quarter' {
  logger.debug('ACTIVITY_PROGRESS_TAB_DIAGNOSTIC', 'Calculating default period', {
    hasActivityHistory,
    currentActivities,
    weekThreshold: getMinimumActivitiesForPeriod('last7Days'),
    monthThreshold: getMinimumActivitiesForPeriod('last30Days'),
    quarterThreshold: getMinimumActivitiesForPeriod('last3Months'),
    calculationTime: new Date().toISOString(),
    timestamp: new Date().toISOString()
  });

  // PRIORITÉ WEEK: Toujours privilégier la période 'week' si suffisante
  const weekThreshold = getMinimumActivitiesForPeriod('last7Days');

  // DIAGNOSTIC: Log des vérifications de seuil
  logger.debug('ACTIVITY_PROGRESS_TAB_DIAGNOSTIC', 'Threshold checks', {
    currentActivities,
    weekThreshold,
    weekAvailable: currentActivities >= weekThreshold,
    timestamp: new Date().toISOString()
  });

  // NOUVELLE LOGIQUE: Toujours privilégier 'week' pour éviter les appels API coûteux automatiques
  let defaultPeriod: 'week' | 'month' | 'quarter' = 'week';

  // Toujours retourner 'week' comme période par défaut
  // L'utilisateur peut manuellement choisir des périodes plus longues s'il le souhaite
  if (!hasActivityHistory || currentActivities < weekThreshold) {
    defaultPeriod = 'week';
    logger.debug('ACTIVITY_PROGRESS_TAB_DIAGNOSTIC', 'Default period: week (insufficient data or no history)', {
      hasActivityHistory,
      currentActivities,
      weekThreshold,
      timestamp: new Date().toISOString()
    });
  } else {
    defaultPeriod = 'week';
    logger.debug('ACTIVITY_PROGRESS_TAB_DIAGNOSTIC', 'Default period: week (prioritized to avoid auto API calls)', {
      currentActivities,
      weekThreshold,
      reasoning: 'always_prioritize_week_to_avoid_costly_auto_calls',
      timestamp: new Date().toISOString()
    });
  }
  
  logger.debug('ACTIVITY_PROGRESS_TAB_DIAGNOSTIC', 'Default period calculated', {
    defaultPeriod,
    reasoning: 'always_week_to_prevent_auto_expensive_calls',
    finalDecision: defaultPeriod,
    calculationComplete: true,
    costOptimization: 'prevents_automatic_30day_90day_api_calls',
    timestamp: new Date().toISOString()
  });
  
  return defaultPeriod;
}

/**
 * Vérifier si une période est valide pour le nombre d'activités donné
 */
function isPeriodValid(period: 'week' | 'month' | 'quarter', currentActivities: number): boolean {
  const apiPeriod = PERIOD_MAPPING[period];
  const threshold = getMinimumActivitiesForPeriod(apiPeriod);
  return currentActivities >= threshold;
}

/**
 * Activity Progress Tab - Onglet Progression de la Forge Énergétique
 * Visualisations et graphiques de l'évolution de vos activités sur différentes périodes
 */
const ActivityProgressTab: React.FC = () => {
  const { profile } = useUserStore();
  const { showToast } = useToast();
  const { click } = useFeedback();
  const { showModal: showExitModal } = useExitModalStore();

  // Vérifier l'historique d'activité
  const { data: hasActivityHistory = false } = useHasActivityHistory();

  // Calculer le nombre d'activités actuelles pour déterminer la période par défaut
  const [currentActivitiesCount, setCurrentActivitiesCount] = React.useState(0);

  // Utiliser le store Zustand pour partager la période avec l'onglet Insights
  const selectedPeriod = useActivityPeriodStore((state) => state.selectedPeriod);
  const setGlobalPeriod = useActivityPeriodStore((state) => state.setSelectedPeriod);

  // État local pour tracker si l'utilisateur a fait une sélection manuelle
  const [userHasSelectedPeriod, setUserHasSelectedPeriod] = React.useState(false);

  // Convertir la période pour le hook
  const apiPeriod = PERIOD_MAPPING[selectedPeriod];

  // Générateur d'insights
  const { data: insightsData, isLoading, error } = useActivityInsightsGenerator(apiPeriod);

  // Logs de diagnostic pour l'onglet Progression
  React.useEffect(() => {
    if (insightsData) {
      logger.info('ACTIVITY_PROGRESS_TAB_DATA', 'Insights data received', {
        hasData: !!insightsData,
        hasDistribution: !!insightsData.distribution,
        hasActivities: !!insightsData.activities,
        activitiesCount: insightsData.activities?.length || 0,
        distributionKeys: insightsData.distribution ? Object.keys(insightsData.distribution) : [],
        hasSummary: !!insightsData.summary,
        summaryKeys: insightsData.summary ? Object.keys(insightsData.summary) : [],
        timestamp: new Date().toISOString()
      });
    }
  }, [insightsData]);

  // Détecter si l'onglet progression est actif (vérifie le hash de l'URL)
  const [isTabActive, setIsTabActive] = React.useState(false);

  React.useEffect(() => {
    const checkTabActive = () => {
      const hash = window.location.hash.replace('#', '');
      setIsTabActive(hash === 'progression');
    };

    checkTabActive();
    window.addEventListener('hashchange', checkTabActive);
    return () => window.removeEventListener('hashchange', checkTabActive);
  }, []);

  // Bloquer la navigation pendant le chargement de l'analyse - UNIQUEMENT si l'onglet est actif
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      // Ne bloquer que si l'onglet progression est actif ET qu'on est en chargement ET qu'on change de page
      const shouldBlock = isTabActive && isLoading && currentLocation.pathname !== nextLocation.pathname;
      
      if (shouldBlock) {
        logger.debug('ACTIVITY_PROGRESS_TAB', 'Navigation blocked during analysis loading', {
          currentPath: currentLocation.pathname,
          nextPath: nextLocation.pathname,
          isLoading,
          timestamp: new Date().toISOString()
        });
        
        // Afficher le modal global immédiatement
        showExitModal({
          title: "Attention ! Analyse de progression en cours",
          message: "Voulez-vous vraiment quitter l'analyse de progression ? Les données d'analyse pourraient être perdues et devront être régénérées.",
          processName: "Analyse de Progression",
          onConfirm: () => {
            logger.info('ACTIVITY_PROGRESS_TAB', 'User confirmed exit during analysis', {
              currentPath: currentLocation.pathname,
              nextPath: nextLocation.pathname,
              timestamp: new Date().toISOString()
            });
            blocker.proceed?.();
          },
          onCancel: () => {
            logger.info('ACTIVITY_PROGRESS_TAB', 'User cancelled exit during analysis', {
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

  // Gestion des états d'erreur et de données insuffisantes
  const isFallbackData = insightsData?.fallback;
  const isCachedData = insightsData?.cached;

  // Mettre à jour le nombre d'activités et gérer la période intelligemment
  React.useEffect(() => {
    if (insightsData?.current_activities !== undefined) {
      logger.info('ACTIVITY_PROGRESS_TAB_DIAGNOSTIC', 'Activities count updated from insights data', {
        previousCount: currentActivitiesCount,
        newCount: insightsData.current_activities,
        summaryTotalActivities: insightsData.summary?.total_activities,
        dataConsistency: insightsData.current_activities === insightsData.summary?.total_activities ? 'consistent' : 'inconsistent',
        selectedPeriod,
        userHasSelectedPeriod,
        cacheStatus: insightsData.cached ? 'cached' : 'fresh',
        willRespectUserChoice: userHasSelectedPeriod,
        timestamp: new Date().toISOString()
      });

      setCurrentActivitiesCount(insightsData.current_activities);
      
      // CRITIQUE: Ne recalculer la période que si l'utilisateur n'a pas fait de sélection manuelle
      if (!userHasSelectedPeriod) {
        const newDefaultPeriod = calculateDefaultPeriod(hasActivityHistory, insightsData.current_activities);
        
        logger.debug('ACTIVITY_PROGRESS_TAB', 'Auto-calculating period (no user selection)', {
          currentSelectedPeriod: selectedPeriod,
          newDefaultPeriod,
          activitiesCount: insightsData.current_activities,
          willAutoSwitch: newDefaultPeriod !== selectedPeriod && !userHasSelectedPeriod,
          timestamp: new Date().toISOString()
        });
        
        // Seulement changer si différent ET que l'utilisateur n'a pas sélectionné
        if (newDefaultPeriod !== selectedPeriod && !userHasSelectedPeriod) {
          logger.debug('ACTIVITY_PROGRESS_TAB', 'Auto-switching to calculated period', {
            from: selectedPeriod,
            to: newDefaultPeriod,
            reason: 'automatic_calculation_respecting_no_user_selection',
            timestamp: new Date().toISOString()
          });
          setGlobalPeriod(newDefaultPeriod);
        }
      } else {
        // CRITIQUE: Vérifier si la période sélectionnée par l'utilisateur est encore valide
        const isCurrentPeriodValid = isPeriodValid(selectedPeriod, insightsData.current_activities);
        
        logger.debug('ACTIVITY_PROGRESS_TAB', 'Checking user-selected period validity', {
          selectedPeriod,
          activitiesCount: insightsData.current_activities,
          isCurrentPeriodValid,
          userHasSelectedPeriod,
          willRespectUserChoice: true,
          timestamp: new Date().toISOString()
        });
        
        // Si la période sélectionnée par l'utilisateur n'est plus valide, fallback gracieux
        if (!isCurrentPeriodValid) {
          // La période sélectionnée par l'utilisateur n'est plus valide, fallback intelligent
          const fallbackPeriod = calculateDefaultPeriod(hasActivityHistory, insightsData.current_activities);
          
          logger.warn('ACTIVITY_PROGRESS_TAB', 'User-selected period no longer valid, falling back', {
            invalidPeriod: selectedPeriod,
            fallbackPeriod,
            activitiesCount: insightsData.current_activities,
            reason: 'user_selected_period_became_invalid',
            timestamp: new Date().toISOString()
          });

          setGlobalPeriod(fallbackPeriod);
          // Réinitialiser le flag pour permettre de nouvelles sélections
          setUserHasSelectedPeriod(false);
          
          showToast({
            type: 'info',
            title: 'Période ajustée',
            message: `Période changée vers ${fallbackPeriod === 'week' ? '7 jours' : fallbackPeriod === 'month' ? '30 jours' : '90 jours'} (données insuffisantes pour la période précédente)`,
            duration: 4000
          });
        }
      }
    }
  }, [
    insightsData?.current_activities, 
    userHasSelectedPeriod, 
    selectedPeriod, 
    hasActivityHistory
  ]);

  // Gestion des erreurs
  React.useEffect(() => {
    if (error) {
      logger.error('ACTIVITY_PROGRESS_TAB', 'Erreur lors de la génération des insights', {
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

  const handlePeriodChange = (period: 'week' | 'month' | 'quarter') => {
    click();

    // Marquer que l'utilisateur a fait une sélection manuelle
    setUserHasSelectedPeriod(true);
    setGlobalPeriod(period);
    
    logger.debug('ACTIVITY_PROGRESS_TAB_DIAGNOSTIC', 'Period changed by user', {
      newPeriod: period,
      apiPeriod: PERIOD_MAPPING[period],
      userAction: true,
      manualSelection: true,
      userHasSelectedPeriod: true,
      timestamp: new Date().toISOString()
    });
  };

  // Calculer les seuils pour chaque période
  const periodThresholds = {
    week: getMinimumActivitiesForPeriod('last7Days'),
    month: getMinimumActivitiesForPeriod('last30Days'),
    quarter: getMinimumActivitiesForPeriod('last3Months'),
  };

  // Affichage si pas d'historique d'activité
  if (!hasActivityHistory) {
    return <EmptyActivityProgressionState />;
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
          accentColor="#10B981"
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
              <h3 className="text-2xl font-bold text-white">Forge en Construction</h3>
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

  // Affichage pour les données de fallback (erreur OpenAI mais données basiques disponibles)
  if (isFallbackData && insightsData) {
    return (
      <div className="space-y-6">
        <ProgressionPeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          currentActivities={currentActivitiesCount}
          periodThresholds={periodThresholds}
          accentColor="#10B981"
        />
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm">
            ⚠️ Analyse détaillée temporairement indisponible. Voici les visualisations de base.
          </p>
        </div>
        <div className="space-y-6">
          {/* Graphiques d'Analyse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityDistributionChart 
              data={insightsData?.distribution}
              period={selectedPeriod}
              apiPeriod={apiPeriod}
            />
            <ActivityHeatmap 
              activities={insightsData?.activities || []}
              period={selectedPeriod}
              apiPeriod={apiPeriod}
            />
          </div>
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
        accentColor="#10B981"
      />

      {/* Indicateur de cache si les données proviennent du cache */}
      {isCachedData && (
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
          {/* En-tête Explicatif */}
          <GlassCard
            className="p-6"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 8%, transparent) 0%, transparent 60%),
                var(--glass-opacity)
              `,
              borderColor: 'color-mix(in srgb, #10B981 20%, transparent)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #10B981 30%, transparent), color-mix(in srgb, #10B981 20%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #10B981 40%, transparent)',
                  boxShadow: '0 0 20px color-mix(in srgb, #10B981 30%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.BarChart3} size={20} style={{ color: '#10B981' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Visualisez votre évolution énergétique</h3>
                <p className="text-green-200 text-sm">Graphiques et tendances de vos activités sur la période sélectionnée</p>
              </div>
            </div>
          </GlassCard>

          {/* Graphiques d'Analyse */}
          {insightsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insightsData.distribution ? (
                <ActivityDistributionChart
                  data={insightsData.distribution}
                  period={selectedPeriod}
                  apiPeriod={apiPeriod}
                />
              ) : (
                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, #F59E0B 20%, transparent), color-mix(in srgb, #F59E0B 10%, transparent))',
                    border: '1px solid color-mix(in srgb, #F59E0B 30%, transparent)'
                  }}>
                    <SpatialIcon Icon={ICONS.BarChart3} size={24} style={{ color: '#F59E0B' }} />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Distribution non disponible</h4>
                  <p className="text-white/70 text-sm">Continuez à enregistrer des activités pour générer ce graphique</p>
                </GlassCard>
              )}

              {insightsData.activities && insightsData.activities.length > 0 ? (
                <ActivityHeatmap
                  activities={insightsData.activities}
                  period={selectedPeriod}
                  apiPeriod={apiPeriod}
                />
              ) : (
                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, #F59E0B 20%, transparent), color-mix(in srgb, #F59E0B 10%, transparent))',
                    border: '1px solid color-mix(in srgb, #F59E0B 30%, transparent)'
                  }}>
                    <SpatialIcon Icon={ICONS.Calendar} size={24} style={{ color: '#F59E0B' }} />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Heatmap non disponible</h4>
                  <p className="text-white/70 text-sm">Enregistrez plus d'activités pour visualiser votre heatmap</p>
                </GlassCard>
              )}
            </div>
          )}

          {/* Nouveaux Graphiques d'Évolution */}
          {profile?.id && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityCalorieEvolutionChart userId={profile.id} period={selectedPeriod} />
              <ActivityWeeklyDistributionChart userId={profile.id} period={selectedPeriod} />
            </div>
          )}

          {/* Objectifs Connectés */}
          {profile?.id && (
            <div className="space-y-6">
              <ConnectedGoalsTracker />
            </div>
          )}

          {/* Graphiques Biométriques Avancés */}
          {profile?.id && (
            <div className="space-y-6">
              <VO2MaxEvolutionChart userId={profile.id} period={selectedPeriod} />
              <HRZonesHeatmap userId={profile.id} period={selectedPeriod} />
              <FitnessFatigueChart userId={profile.id} period={selectedPeriod} />
            </div>
          )}

          {/* Encouragement à consulter l'onglet Insights */}
          <GlassCard
            className="p-6 text-center"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 60%),
                var(--glass-opacity)
              `,
              borderColor: 'color-mix(in srgb, #F59E0B 20%, transparent)'
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <SpatialIcon Icon={ICONS.Lightbulb} size={16} style={{ color: '#F59E0B' }} />
              <p className="text-white/70 text-sm">
                Consultez l'onglet <strong className="text-orange-300">Insights</strong> pour des conseils personnalisés basés sur ces données
              </p>
            </div>
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityProgressTab;