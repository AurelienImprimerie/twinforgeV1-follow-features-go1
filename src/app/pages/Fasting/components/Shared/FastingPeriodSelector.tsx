import React from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import logger from '@/lib/utils/logger';

interface FastingPeriodSelectorProps {
  selectedPeriod: number;
  onPeriodChange: (period: number) => void;
  availableSessionsCount?: number;
  getMinSessionsForPeriod?: (period: number) => number;
  className?: string;
}

/**
 * Default minimum sessions function (used by Insights tab)
 */
const defaultGetMinSessions = (period: number): number => {
  switch (period) {
    case 7: return 3;
    case 30: return 8;
    case 90: return 20;
    default: return 3;
  }
};

/**
 * Get period label for display
 */
function getPeriodLabel(period: number): string {
  switch (period) {
    case 7: return '7 jours';
    case 30: return '30 jours';
    case 90: return '90 jours';
    default: return `${period} jours`;
  }
}

/**
 * Fasting Period Selector - Sélecteur de Période d'Analyse (Version Compacte)
 * Harmonisé avec ProgressionPeriodSelector du tracker d'activité
 */
const FastingPeriodSelector: React.FC<FastingPeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  availableSessionsCount = 0,
  getMinSessionsForPeriod = defaultGetMinSessions,
  className = ''
}) => {
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();

  const periods = [
    { value: 7, label: getPeriodLabel(7) },
    { value: 30, label: getPeriodLabel(30) },
    { value: 90, label: getPeriodLabel(90) }
  ];

  // Check if a period is available (enough sessions)
  const isPeriodAvailable = (periodValue: number) => {
    const threshold = getMinSessionsForPeriod(periodValue);
    const available = availableSessionsCount >= threshold;

    logger.debug('FASTING_PERIOD_SELECTOR', 'Period availability check', {
      periodValue,
      availableSessionsCount,
      threshold,
      available,
      calculation: `${availableSessionsCount} >= ${threshold} = ${available}`,
      timestamp: new Date().toISOString()
    });

    return available;
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="inline-flex gap-2 p-1 rounded-lg" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: isPerformanceMode ? 'none' : 'blur(10px)'
      }}>
        {periods.map((period) => {
          const isAvailable = isPeriodAvailable(period.value);
          const isSelected = selectedPeriod === period.value;
          const accentColor = '#10B981'; // Vert pour l'onglet Insights

          return (
            <button
              key={period.value}
              onClick={() => {
                if (isAvailable) {
                  click();
                  onPeriodChange(period.value);

                  logger.info('FASTING_PERIOD_SELECTOR', 'Period changed', {
                    newPeriod: period.value,
                    availableSessionsCount,
                    timestamp: new Date().toISOString()
                  });
                } else {
                  const threshold = getMinSessionsForPeriod(period.value);
                  logger.warn('FASTING_PERIOD_SELECTOR', 'Attempted to select unavailable period', {
                    period: period.value,
                    availableSessionsCount,
                    requiredSessions: threshold,
                    missingSessions: threshold - availableSessionsCount,
                    timestamp: new Date().toISOString()
                  });
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
              {period.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FastingPeriodSelector;
