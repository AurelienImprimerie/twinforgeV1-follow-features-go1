// src/app/pages/Avatar/tabs/InsightsTab.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useUserStore } from '../../../../system/store/userStore';
import { supabase } from '../../../../system/supabase/client';
import { generateMorphologyInsights } from './insights/insightsService';
import { InsightCard } from './insights/InsightCard';
import { InsightsLoadingState } from './insights/InsightsLoadingState';
import { InsightsErrorState } from './insights/InsightsErrorState';
import { NoScanState } from './insights/NoScanState';
import { SummaryDashboard } from './insights/SummaryDashboard';
import InsightsGenerationExitModal from './insights/InsightsGenerationExitModal';
import EmptyAvatarInsightsState from './insights/EmptyAvatarInsightsState';
import logger from '../../../../lib/utils/logger';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import { ConditionalMotion, ConditionalAnimatePresence } from '../../../../lib/motion/ConditionalMotion';

/**
 * Insights Tab - AI-Powered Morphology Analysis
 * Provides personalized insights, recommendations, and goal tracking
 */
const InsightsTab: React.FC = () => {
  const { profile } = useUserStore();
  const { isPerformanceMode } = usePerformanceMode();

  // Fetch latest body scan data
  const { data: latestScanData, isLoading: scanLoading } = useQuery({
    queryKey: ['body-scans', 'latest', profile?.userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_scans')
        .select('*')
        .eq('user_id', profile?.userId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.userId,
    staleTime: 5 * 60 * 1000,
  });
  
  // État pour la modale d'exit - DOIT être au début
  const [showExitModal, setShowExitModal] = React.useState(false);

  // Generate AI insights based on scan data and user profile
  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError
  } = useQuery({
    queryKey: ['morph-insights', profile?.userId, latestScanData?.id],
    queryFn: () => generateMorphologyInsights(latestScanData, profile),
    enabled: !!(latestScanData?.id && profile?.userId),
    staleTime: Infinity, // Cache indefinitely until scanId changes
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on component mount
    refetchOnReconnect: false, // Disable refetch on network reconnect
    retry: 1, // Reduce retry attempts
  });

  // Fonctions de gestion de la modale - DOIVENT être avant les returns conditionnels
  const handleDiscardAndExit = () => {
    setShowExitModal(false);
    // Navigation vers une autre page ou fermeture
    window.history.back();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // Gestion de la tentative de quitter pendant la génération - DOIT être avant les returns conditionnels
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (insightsLoading) {
        e.preventDefault();
        e.returnValue = 'Une analyse IA est en cours. Êtes-vous sûr de vouloir quitter ?';
        setShowExitModal(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [insightsLoading]);

  // Loading state
  if (scanLoading || insightsLoading) {
    return <InsightsLoadingState />;
  }

  // Error state
  if (insightsError) {
    return <InsightsErrorState error={insightsError} />;
  }

  // No saved avatar state
  if (!latestScanData) {
    return <EmptyAvatarInsightsState />;
  }

  // Main insights display
  const insights = insightsData?.insights || [];
  const summary = insightsData?.summary;
  const fallbackUsed = insightsData?.fallback_used || false;
  
  return (
    <>
      <ConditionalMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
      {/* Modale d'exit */}
      <InsightsGenerationExitModal
        isOpen={showExitModal}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancelExit}
        isGenerating={insightsLoading}
        hasError={!!insightsError}
        fallbackUsed={fallbackUsed}
      />
      
    <div className="space-y-8">
      {/* AI Summary Dashboard */}
      {summary && <SummaryDashboard summary={summary} />}

      {/* Insights Categories */}
      {insights.length > 0 && (
        <div className="space-y-6">
          {/* High Priority Insights */}
          {insights.filter(insight => insight.priority === 'high').length > 0 && (
            <ConditionalMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isPerformanceMode ? 0 : 0.2 }}
            >
              <GlassCard className="p-6 glass-card--priority">
                <h4 className="text-white font-semibold mb-6 flex items-center gap-2 glowing-title-text"
                  style={{ '--title-glow-color': '#EF4444' } as React.CSSProperties}
                >
                  <div
                    className="bodyscan-header-icon-container"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                        linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                      `,
                      border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                      boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Zap} size={16} style={{ color: '#F59E0B' }} variant="pure" />
                  </div>
                  Insights prioritaires
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                    Haute priorité
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights
                    .filter(insight => insight.priority === 'high')
                    .map((insight, index) => (
                      <InsightCard key={insight.id} insight={insight} index={index} />
                    ))}
                </div>
              </GlassCard>
            </ConditionalMotion>
          )}

          {/* Morphology Insights */}
          {insights.filter(insight => insight.category === 'morphology').length > 0 && (
            <ConditionalMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isPerformanceMode ? 0 : 0.3 }}
            >
              <GlassCard className="p-6">
                <h4 className="text-white font-semibold mb-6 flex items-center gap-2 glowing-title-text"
                  style={{ '--title-glow-color': '#8B5CF6' } as React.CSSProperties}
                >
                  <div
                    className="bodyscan-header-icon-container"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                        linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                      `,
                      border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                      boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Eye} size={16} style={{ color: '#F59E0B' }} variant="pure" />
                  </div>
                  Analyse morphologique
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights
                    .filter(insight => insight.category === 'morphology')
                    .map((insight, index) => (
                      <InsightCard key={insight.id} insight={insight} index={index} />
                    ))}
                </div>
              </GlassCard>
            </ConditionalMotion>
          )}

          {/* Fitness & Goals Insights */}
          {insights.filter(insight => ['fitness', 'goals'].includes(insight.category)).length > 0 && (
            <ConditionalMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isPerformanceMode ? 0 : 0.4 }}
            >
              <GlassCard className="p-6">
                <h4 className="text-white font-semibold mb-6 flex items-center gap-2 glowing-title-text"
                  style={{ '--title-glow-color': '#22C55E' } as React.CSSProperties}
                >
                  <div
                    className="bodyscan-header-icon-container"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                        linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                      `,
                      border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                      boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Target} size={16} style={{ color: '#F59E0B' }} variant="pure" />
                  </div>
                  Objectifs & Fitness
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights
                    .filter(insight => ['fitness', 'goals'].includes(insight.category))
                    .map((insight, index) => (
                      <InsightCard key={insight.id} insight={insight} index={index} />
                    ))}
                </div>
              </GlassCard>
            </ConditionalMotion>
          )}

          {/* Health & Nutrition Insights */}
          {insights.filter(insight => ['health', 'nutrition'].includes(insight.category)).length > 0 && (
            <ConditionalMotion
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isPerformanceMode ? 0 : 0.5 }}
            >
              <GlassCard className="p-6">
                <h4 className="text-white font-semibold mb-6 flex items-center gap-2 glowing-title-text"
                  style={{ '--title-glow-color': '#EC4899' } as React.CSSProperties}
                >
                  <div
                    className="bodyscan-header-icon-container"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                        linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
                      `,
                      border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
                      boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Heart} size={16} style={{ color: '#F59E0B' }} variant="pure" />
                  </div>
                  Santé & Nutrition
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights
                    .filter(insight => ['health', 'nutrition'].includes(insight.category))
                    .map((insight, index) => (
                      <InsightCard key={insight.id} insight={insight} index={index} />
                    ))}
                </div>
              </GlassCard>
            </ConditionalMotion>
          )}
        </div>
      )}
    </div>
      </ConditionalMotion>
    </>
  );
};

export default InsightsTab;
