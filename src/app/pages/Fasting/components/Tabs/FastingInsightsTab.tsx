import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useFastingInsightsGenerator } from '../../hooks/useFastingInsightsGenerator';
import { useUserStore } from '@/system/store/userStore';
import { useExitModalStore } from '@/system/store/exitModalStore';
import { useToast } from '@/ui/components/ToastProvider';
import { useFastingHistory } from '../../hooks/useFastingHistory';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import GlassCard from '@/ui/cards/GlassCard';
import FastingPeriodSelector from '../Shared/FastingPeriodSelector';
import FastingInsightsLoadingSkeleton from '../Insights/FastingInsightsLoadingSkeleton';
import FastingInsightsSummaryCard from '../Insights/FastingInsightsSummaryCard';
import FastingInsightCard from '../Insights/FastingInsightCard';

/**
 * Get minimum sessions required for Insights AI analysis
 */
const getInsightsMinSessions = (period: number): number => {
  switch (period) {
    case 7: return 3;    // Insights requirements
    case 30: return 8;   
    case 90: return 20;  
    default: return 3;
  }
};

/**
 * Fasting Insights Tab - Onglet Insights de la Forge du Temps
 * Conseils IA personnalisés basés sur les patterns de jeûne
 */
const FastingInsightsTab: React.FC = () => {
  const { profile } = useUserStore();
  const { showModal: showExitModal } = useExitModalStore();
  const { showToast } = useToast();
  const { isPerformanceMode } = usePerformanceMode();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  // Conditional motion component
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  
  // Get available sessions count for the selected period
  const { data: historyData } = useFastingHistory(100, {
    dateRange: {
      start: new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  });
  
  const availableSessionsCount = historyData?.sessions?.filter(s => s.status === 'completed').length || 0;
  
  // Generate insights for selected period
  const { 
    data: insightsData, 
    isLoading, 
    error 
  } = useFastingInsightsGenerator(selectedPeriod);
  
  // Block navigation during insights generation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      // Block navigation during AI generation to prevent cost waste
      return isLoading && 
             currentLocation.pathname !== nextLocation.pathname &&
             !insightsData?.cached; // Don't block if data is cached (instant)
    }
  );

  // Handle blocked navigation
  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      showExitModal({
        title: "Quitter la génération IA en cours ?",
        message: "La Forge Spatiale génère vos insights personnalisés avec GPT-5 mini. Quitter maintenant annulera l'analyse et pourrait engendrer des coûts sans résultat.",
        processName: "Génération IA",
        onConfirm: () => {
          blocker.proceed();
        },
        onCancel: () => {
          blocker.reset();
        }
      });
    }
  }, [blocker, showExitModal]);


  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      })}
      className="space-y-6"
    >
      {/* Period Selector */}
      <FastingPeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        availableSessionsCount={availableSessionsCount}
        getMinSessionsForPeriod={getInsightsMinSessions}
      />
      
      {/* Loading State */}
      {isLoading && (
        <FastingInsightsLoadingSkeleton />
      )}
      
      {/* Error State */}
      {error && (
        <GlassCard className="p-6" style={{
          background: 'color-mix(in srgb, #EF4444 8%, transparent)',
          borderColor: 'color-mix(in srgb, #EF4444 20%, transparent)'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <SpatialIcon Icon={ICONS.AlertCircle} size={16} className="text-red-400" />
            </div>
            <div>
              <h4 className="text-red-300 font-semibold">Erreur d'Analyse</h4>
              <p className="text-red-200 text-sm">
                Impossible de générer les insights. Réessayez dans quelques instants.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
      
      {/* Insights Content - Only show when there are insights */}
      {insightsData && !isLoading && insightsData.insights.length > 0 && (
        <div className="space-y-6">
          {/* Summary Card */}
          <FastingInsightsSummaryCard
            summary={insightsData.summary}
            periodDays={selectedPeriod}
            aiModel={insightsData.aiModel}
            tokensUsed={insightsData.tokensUsed}
            cached={insightsData.cached}
          />

          {/* Individual Insights */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Lightbulb} size={18} className="text-green-400" />
              Insights Détaillés ({insightsData.insights.length})
            </h3>

            <div className="space-y-4">
              {insightsData.insights.map((insight, index) => (
                <FastingInsightCard
                  key={insight.id}
                  insight={insight}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* No Data State */}
      {insightsData && insightsData.insights.length === 0 && !isLoading && (
        <GlassCard className="p-8 text-center" style={{
          background: `
            radial-gradient(ellipse at center,
              rgba(16, 185, 129, 0.15) 0%,
              rgba(52, 211, 153, 0.08) 50%,
              rgba(0, 0, 0, 0.4) 100%)
          `,
          borderColor: 'color-mix(in srgb, #10B981 30%, transparent)',
          boxShadow: `
            0 0 30px rgba(16, 185, 129, 0.2),
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          backdropFilter: 'blur(20px) saturate(1.2)'
        }}>
          <div className="space-y-6 flex flex-col items-center">
            {/* Icon */}
            <div
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
              style={{
                background: `radial-gradient(circle,
                  rgba(16, 185, 129, 0.3) 0%,
                  rgba(52, 211, 153, 0.15) 70%,
                  transparent 100%)`,
                border: '1px solid rgba(16, 185, 129, 0.4)',
                boxShadow: `
                  0 0 25px rgba(16, 185, 129, 0.3),
                  0 4px 20px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <SpatialIcon
                Icon={ICONS.Lightbulb}
                size={48}
                className="text-green-400"
                style={{
                  filter: `drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))
                           drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))`
                }}
              />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Insights en Construction
              </h2>
              <p className="text-white/70 text-lg">
                Plus de sessions nécessaires pour l'analyse IA
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="text-center space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle,
                      rgba(16, 185, 129, 0.3) 0%,
                      rgba(52, 211, 153, 0.1) 70%,
                      transparent 100%)`,
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: `
                      0 0 20px rgba(16, 185, 129, 0.3),
                      0 4px 15px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS.Brain}
                    size={24}
                    className="text-green-400"
                    style={{
                      filter: `drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))
                               drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white">Analyse IA Personnalisée</h3>
                <p className="text-white/60 text-sm">
                  Découvrez vos patterns de jeûne grâce à l'intelligence artificielle
                </p>
              </div>

              <div className="text-center space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle,
                      rgba(16, 185, 129, 0.3) 0%,
                      rgba(52, 211, 153, 0.1) 70%,
                      transparent 100%)`,
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: `
                      0 0 20px rgba(16, 185, 129, 0.3),
                      0 4px 15px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS.TrendingUp}
                    size={24}
                    className="text-green-400"
                    style={{
                      filter: `drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))
                               drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white">Recommandations Avancées</h3>
                <p className="text-white/60 text-sm">
                  Obtenez des conseils adaptés à vos objectifs et votre métabolisme
                </p>
              </div>

              <div className="text-center space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle,
                      rgba(16, 185, 129, 0.3) 0%,
                      rgba(52, 211, 153, 0.1) 70%,
                      transparent 100%)`,
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: `
                      0 0 20px rgba(16, 185, 129, 0.3),
                      0 4px 15px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS.Target}
                    size={24}
                    className="text-green-400"
                    style={{
                      filter: `drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))
                               drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white">Optimisation Continue</h3>
                <p className="text-white/60 text-sm">
                  Affinez votre pratique avec des insights évoluant avec vos progrès
                </p>
              </div>
            </div>

            {/* 3D CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => navigate('/fasting/input')}
                className="group relative px-8 py-4 text-white font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg,
                    rgba(16, 185, 129, 0.8) 0%,
                    rgba(52, 211, 153, 0.9) 100%)`,
                  border: '2px solid rgba(16, 185, 129, 0.6)',
                  boxShadow: `
                    0 0 30px rgba(16, 185, 129, 0.4),
                    0 8px 25px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                  `,
                  backdropFilter: 'blur(10px) saturate(1.2)'
                }}
              >
                <div className="flex items-center gap-3">
                  <SpatialIcon
                    Icon={ICONS.Timer}
                    size={24}
                    className="group-hover:rotate-12 transition-transform duration-300"
                    style={{
                      color: 'white',
                      filter: `drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))
                               drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                  <span className="text-lg">Ajouter des Sessions de Jeûne</span>
                </div>

                {/* 3D Effect */}
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"
                  style={{
                    background: `linear-gradient(135deg,
                      rgba(16, 185, 129, 0.6) 0%,
                      rgba(52, 211, 153, 0.6) 100%)`
                  }}
                ></div>
              </button>
            </div>

            {/* Additional Info */}
            <div
              className="text-white/50 text-sm p-3 rounded-xl"
              style={{
                background: `radial-gradient(ellipse at center,
                  rgba(16, 185, 129, 0.1) 0%,
                  transparent 70%)`,
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: `0 0 15px rgba(16, 185, 129, 0.1)`
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <SpatialIcon
                  Icon={ICONS.Info}
                  size={16}
                  className="text-green-400"
                  style={{
                    filter: `drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))`
                  }}
                />
                <span>
                  Plus vous enregistrez de sessions, plus les insights deviennent précis et personnalisés !
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </MotionDiv>
  );
};

export default FastingInsightsTab;