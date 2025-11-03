import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/system/store/userStore';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { useFastingProgressionData } from '../../hooks/useFastingProgressionData';
import { useTodayFastingSessions } from '../../hooks/useTodayFastingSessions';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import FastingPeriodSelector from '../Shared/FastingPeriodSelector';
import FastingProgressionLoadingSkeleton from '../Progression/FastingProgressionLoadingSkeleton';
import FastingProgressionSummaryCard from '../Progression/FastingProgressionSummaryCard';
import FastingConsistencyChart from '../Progression/FastingConsistencyChart';
import FastingStreakDiagram from '../Progression/FastingStreakDiagram';
import FastingDurationTrendChart from '../Progression/FastingDurationTrendChart';

/**
 * Get minimum sessions required for Progression AI analysis
 */
const getProgressionMinSessions = (period: number): number => {
  switch (period) {
    case 7: return 5;    // Progression requires more data than Insights
    case 30: return 12;  // Higher threshold for monthly analysis
    case 90: return 20;  // Same as Insights for quarterly
    default: return 5;
  }
};

/**
 * Fasting Progression Tab - Onglet Progression de la Forge du Temps
 * Analyse de l'évolution des performances de jeûne
 */
const FastingProgressionTab: React.FC = () => {
  const { profile, session } = useUserStore();
  const { isPerformanceMode } = usePerformanceMode();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  // Conditional motion component
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  
  // Get total sessions count for period selector
  const { data: todayData } = useTodayFastingSessions();
  
  // Fetch progression data
  const {
    data: progressionData,
    isLoading,
    error
  } = useFastingProgressionData(selectedPeriod);
  
  
  // Calculate available sessions count for the selected period
  const availableSessionsCount = progressionData?.metrics?.totalSessions || 0;
  
  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      })}
      className="space-y-6"
    >
      {/* Period Selector with Cyan Color for Progression Tab */}
      <div className="flex justify-center">
        <div className="inline-flex gap-2 p-1 rounded-lg" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: isPerformanceMode ? 'none' : 'blur(10px)'
        }}>
          {[7, 30, 90].map((period) => {
            const isSelected = selectedPeriod === period;
            const accentColor = '#06B6D4'; // Bleu cyan pour Progression
            const threshold = getProgressionMinSessions(period);
            const isAvailable = availableSessionsCount >= threshold;

            return (
              <button
                key={period}
                onClick={() => {
                  if (isAvailable) {
                    setSelectedPeriod(period);
                  }
                }}
                disabled={!isAvailable}
                className="px-6 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: isSelected ? `${accentColor}33` : 'transparent',
                  color: isSelected ? accentColor : isAvailable ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
                  border: isSelected ? `1px solid ${accentColor}66` : '1px solid transparent',
                  boxShadow: isPerformanceMode ? 'none' : (isSelected ? `0 0 20px ${accentColor}4D` : 'none'),
                  opacity: isAvailable ? 1 : 0.5,
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  transition: isPerformanceMode ? 'all 0.15s ease' : 'all 0.2s ease'
                }}
              >
                {period === 7 ? '7 jours' : period === 30 ? '30 jours' : '90 jours'}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <FastingProgressionLoadingSkeleton />
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
                Impossible de charger les données de progression.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
      
      {/* No Data State */}
      {progressionData && progressionData.metrics.totalSessions === 0 && !isLoading && (
        <GlassCard className="p-8 text-center" style={{
          background: `
            radial-gradient(ellipse at center,
              rgba(6, 182, 212, 0.15) 0%,
              rgba(34, 211, 238, 0.08) 50%,
              rgba(0, 0, 0, 0.4) 100%)
          `,
          borderColor: 'color-mix(in srgb, #06B6D4 30%, transparent)',
          boxShadow: isPerformanceMode
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : `
              0 0 30px rgba(6, 182, 212, 0.2),
              0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(1.2)'
        }}>
          <div className="space-y-6 flex flex-col items-center">
            {/* Icon */}
            <div
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
              style={{
                background: `radial-gradient(circle,
                  rgba(6, 182, 212, 0.3) 0%,
                  rgba(34, 211, 238, 0.15) 70%,
                  transparent 100%)`,
                border: '1px solid rgba(6, 182, 212, 0.4)',
                boxShadow: isPerformanceMode
                  ? '0 4px 20px rgba(0, 0, 0, 0.2)'
                  : `
                    0 0 25px rgba(6, 182, 212, 0.3),
                    0 4px 20px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `
              }}
            >
              <SpatialIcon
                Icon={ICONS.TrendingUp}
                size={48}
                className="text-cyan-400"
                style={{
                  filter: isPerformanceMode
                    ? 'none'
                    : `drop-shadow(0 0 12px rgba(6, 182, 212, 0.8))
                       drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))`
                }}
              />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Progression en Construction
              </h2>
              <p className="text-white/70 text-lg">
                Plus de sessions nécessaires pour l'analyse
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="text-center space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle,
                      rgba(6, 182, 212, 0.3) 0%,
                      rgba(34, 211, 238, 0.1) 70%,
                      transparent 100%)`,
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    boxShadow: isPerformanceMode
                      ? '0 4px 15px rgba(0, 0, 0, 0.2)'
                      : `
                        0 0 20px rgba(6, 182, 212, 0.3),
                        0 4px 15px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS.BarChart3}
                    size={24}
                    className="text-cyan-400"
                    style={{
                      filter: isPerformanceMode
                        ? 'none'
                        : `drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))
                           drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white">Graphiques Évolutifs</h3>
                <p className="text-white/60 text-sm">
                  Visualisez votre progression avec des graphiques détaillés
                </p>
              </div>

              <div className="text-center space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle,
                      rgba(6, 182, 212, 0.3) 0%,
                      rgba(34, 211, 238, 0.1) 70%,
                      transparent 100%)`,
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    boxShadow: isPerformanceMode
                      ? '0 4px 15px rgba(0, 0, 0, 0.2)'
                      : `
                        0 0 20px rgba(6, 182, 212, 0.3),
                        0 4px 15px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS.Activity}
                    size={24}
                    className="text-cyan-400"
                    style={{
                      filter: isPerformanceMode
                        ? 'none'
                        : `drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))
                           drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white">Métriques Avancées</h3>
                <p className="text-white/60 text-sm">
                  Suivez votre consistance, vos streaks et vos tendances
                </p>
              </div>

              <div className="text-center space-y-3">
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle,
                      rgba(6, 182, 212, 0.3) 0%,
                      rgba(34, 211, 238, 0.1) 70%,
                      transparent 100%)`,
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    boxShadow: isPerformanceMode
                      ? '0 4px 15px rgba(0, 0, 0, 0.2)'
                      : `
                        0 0 20px rgba(6, 182, 212, 0.3),
                        0 4px 15px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `
                  }}
                >
                  <SpatialIcon
                    Icon={ICONS.Award}
                    size={24}
                    className="text-cyan-400"
                    style={{
                      filter: isPerformanceMode
                        ? 'none'
                        : `drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))
                           drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                </div>
                <h3 className="font-semibold text-white">Suivi des Objectifs</h3>
                <p className="text-white/60 text-sm">
                  Mesurez vos progrès vers vos objectifs de jeûne
                </p>
              </div>
            </div>

            {/* 3D CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => navigate('/fasting/input')}
                className="group relative px-8 py-4 text-white font-semibold rounded-2xl"
                style={{
                  background: `linear-gradient(135deg,
                    rgba(6, 182, 212, 0.8) 0%,
                    rgba(34, 211, 238, 0.9) 100%)`,
                  border: '2px solid rgba(6, 182, 212, 0.6)',
                  boxShadow: isPerformanceMode
                    ? '0 8px 25px rgba(0, 0, 0, 0.3)'
                    : `
                      0 0 30px rgba(6, 182, 212, 0.4),
                      0 8px 25px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                    `,
                  backdropFilter: isPerformanceMode ? 'none' : 'blur(10px) saturate(1.2)',
                  transform: isPerformanceMode ? 'none' : undefined,
                  transition: isPerformanceMode ? 'all 0.15s ease' : 'all 0.3s ease'
                }}
              >
                <div className="flex items-center gap-3">
                  <SpatialIcon
                    Icon={ICONS.Timer}
                    size={24}
                    className={!isPerformanceMode ? 'group-hover:rotate-12 transition-transform duration-300' : ''}
                    style={{
                      color: 'white',
                      filter: isPerformanceMode
                        ? 'none'
                        : `drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))
                           drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3))`
                    }}
                  />
                  <span className="text-lg">Ajouter des Sessions de Jeûne</span>
                </div>

                {/* 3D Effect */}
                {!isPerformanceMode && (
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10"
                    style={{
                      background: `linear-gradient(135deg,
                        rgba(6, 182, 212, 0.6) 0%,
                        rgba(34, 211, 238, 0.6) 100%)`
                    }}
                  ></div>
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div
              className="text-white/50 text-sm p-3 rounded-xl"
              style={{
                background: `radial-gradient(ellipse at center,
                  rgba(6, 182, 212, 0.1) 0%,
                  transparent 70%)`,
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: isPerformanceMode ? 'none' : `0 0 15px rgba(6, 182, 212, 0.1)`
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <SpatialIcon
                  Icon={ICONS.Info}
                  size={16}
                  className="text-cyan-400"
                  style={{
                    filter: isPerformanceMode ? 'none' : `drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))`
                  }}
                />
                <span>
                  Continuez à enregistrer vos sessions pour débloquer des analyses détaillées de votre évolution !
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
      
      {/* Progression Content */}
      {progressionData && progressionData.metrics.totalSessions > 0 && !isLoading && (
        <div className="space-y-6">
          {/* Summary Card */}
          <FastingProgressionSummaryCard
            metrics={progressionData.metrics}
            periodDays={selectedPeriod}
            aiAnalysis={progressionData.aiAnalysis}
            aiModel={progressionData.aiModel}
            tokensUsed={progressionData.tokensUsed}
            cached={progressionData.cached}
          />

          {/* Graphiques de Progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FastingConsistencyChart
              data={progressionData.consistencyData}
              periodDays={selectedPeriod}
            />
            <FastingDurationTrendChart
              data={progressionData.durationTrend || []}
              periodDays={selectedPeriod}
            />
          </div>

          {/* Streak Diagram */}
          {progressionData.sessions && (
            <FastingStreakDiagram
              sessions={progressionData.sessions}
              periodDays={selectedPeriod}
            />
          )}
        </div>
      )}
    </MotionDiv>
  );
};

export default FastingProgressionTab;
