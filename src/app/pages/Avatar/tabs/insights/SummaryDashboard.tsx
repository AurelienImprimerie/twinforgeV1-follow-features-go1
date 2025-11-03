import React from 'react';
import { usePerformanceMode } from '../../../../../system/context/PerformanceModeContext';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface SummaryDashboardProps {
  summary: {
    morphology_score: number;
    goal_alignment: number;
    health_indicators: number;
    recommendations_count: number;
  };
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = React.memo(({ summary }) => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <GlassCard 
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity-base)
        `,
        borderColor: 'color-mix(in srgb, #F59E0B 25%, transparent)',
        boxShadow: `
          var(--glass-shadow-sm),
          0 0 16px color-mix(in srgb, #F59E0B 10%, transparent)
        `
      }}
    >
      <ConditionalMotion
        className="slide-enter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bodyscan-flex-between mb-6">
          <h3 className="text-white font-semibold bodyscan-flex-center bodyscan-gap-sm">
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
              <SpatialIcon Icon={ICONS.BarChart3} size={16} style={{ color: '#F59E0B' }} variant="pure" />
            </div>
            Tableau de bord morphologique
          </h3>
          
          <div className="bodyscan-status-badge bodyscan-status-badge--active">
            <div className="bodyscan-status-icon" />
            <span className="bodyscan-status-text">Analyse Spatiale</span>
          </div>
        </div>

        <div className="bodyscan-grid-cols-2 md:bodyscan-grid-cols-4 bodyscan-gap-md">
          <div className="summary-metric-card summary-metric-card--blue">
            <div className="summary-metric-value">
              {Math.round(summary.morphology_score)}%
            </div>
            <div className="summary-metric-label">Score Morphologique</div>
          </div>
          
          <div className="summary-metric-card summary-metric-card--green">
            <div className="summary-metric-value">
              {Math.round(summary.goal_alignment)}%
            </div>
            <div className="summary-metric-label">Alignement Objectifs</div>
          </div>
          
          <div className="summary-metric-card summary-metric-card--purple">
            <div className="summary-metric-value">
              {Math.round(summary.health_indicators)}%
            </div>
            <div className="summary-metric-label">Indicateurs Santé</div>
          </div>
          
          <div className="summary-metric-card summary-metric-card--orange">
            <div className="summary-metric-value">
              {summary.recommendations_count}
            </div>
            <div className="summary-metric-label">Recommandations</div>
          </div>
        </div>
      </ConditionalMotion>
    </GlassCard>
  );
});

SummaryDashboard.displayName = 'SummaryDashboard';