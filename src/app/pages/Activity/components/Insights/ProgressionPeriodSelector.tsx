import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import logger from '../../../../../lib/utils/logger';
import React from 'react';

interface ProgressionPeriodSelectorProps {
  selectedPeriod: 'week' | 'month' | 'quarter';
  onPeriodChange: (period: 'week' | 'month' | 'quarter') => void;
  currentActivities: number;
  periodThresholds: {
    week: number;
    month: number;
    quarter: number;
  };
  accentColor?: string;
}

/**
 * Obtenir le label de période dynamique
 */
function getPeriodLabel(period: 'week' | 'month' | 'quarter'): string {
  switch (period) {
    case 'week':
      return '7 derniers jours';
    case 'month':
      return '30 derniers jours';
    case 'quarter':
      return '90 derniers jours';
    default:
      return '';
  }
}

/**
 * Obtenir le label court de période
 */
function getShortPeriodLabel(period: 'week' | 'month' | 'quarter'): string {
  switch (period) {
    case 'week':
      return 'Semaine';
    case 'month':
      return 'Mois';
    case 'quarter':
      return 'Trimestre';
    default:
      return '';
  }
}

const ProgressionPeriodSelector: React.FC<ProgressionPeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  currentActivities,
  periodThresholds,
  accentColor = '#10B981'
}) => {
  const { click } = useFeedback();

  // DIAGNOSTIC: Log de débogage pour la logique de sélection
  React.useEffect(() => {
    logger.info('PROGRESSION_PERIOD_SELECTOR_DIAGNOSTIC', 'Component state debug', {
      selectedPeriod,
      currentActivities,
      periodThresholds,
      componentRenderTime: new Date().toISOString(),
      propsReceived: {
        selectedPeriod,
        currentActivities,
        periodThresholds
      },
      timestamp: new Date().toISOString()
    });
  }, [selectedPeriod, currentActivities, periodThresholds]);

  const periods = [
    { 
      value: 'week' as const, 
      label: getShortPeriodLabel('week'), 
      fullLabel: getPeriodLabel('week'),
      icon: ICONS.Calendar,
      threshold: periodThresholds.week
    },
    { 
      value: 'month' as const, 
      label: getShortPeriodLabel('month'), 
      fullLabel: getPeriodLabel('month'),
      icon: ICONS.CalendarDays,
      threshold: periodThresholds.month
    },
    { 
      value: 'quarter' as const, 
      label: getShortPeriodLabel('quarter'), 
      fullLabel: getPeriodLabel('quarter'),
      icon: ICONS.CalendarRange,
      threshold: periodThresholds.quarter
    }
  ];

  // CORRECTION: Vérifier si une période est disponible (assez d'activités)
  const isPeriodAvailable = (threshold: number) => {
    const available = currentActivities >= threshold;
    logger.debug('PROGRESSION_PERIOD_SELECTOR_DIAGNOSTIC', 'Period availability check', {
      currentActivities,
      threshold,
      available,
      calculation: `${currentActivities} >= ${threshold} = ${available}`,
      timestamp: new Date().toISOString()
    });
    return available;
  };

  return (
    <div className="flex justify-center">
      <div className="inline-flex gap-2 p-1 rounded-lg" style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {periods.map((period) => {
          const isAvailable = isPeriodAvailable(period.threshold);
          const isSelected = selectedPeriod === period.value;

          // DIAGNOSTIC: Log détaillé pour chaque période au moment du rendu
          logger.debug('PROGRESSION_PERIOD_SELECTOR_DIAGNOSTIC', 'Period button render state', {
            periodValue: period.value,
            periodLabel: period.label,
            periodThreshold: period.threshold,
            currentActivities,
            isAvailable,
            isSelected,
            willShowLock: !isAvailable,
            willBeDisabled: !isAvailable,
            calculation: `${currentActivities} >= ${period.threshold} = ${isAvailable}`,
            renderTime: new Date().toISOString(),
            timestamp: new Date().toISOString()
          });

          // Log détaillé pour chaque période
          logger.debug('PROGRESSION_PERIOD_SELECTOR', 'Period button state', {
            periodValue: period.value,
            periodThreshold: period.threshold,
            isAvailable,
            isSelected,
            currentActivities,
            timestamp: new Date().toISOString()
          });

          return (
            <button
              key={period.value}
              onClick={() => {
                if (isAvailable) {
                  click();
                  onPeriodChange(period.value);
                  logger.info('PROGRESSION_PERIOD_SELECTOR_DIAGNOSTIC', 'Period changed', {
                    newPeriod: period.value,
                    wasAvailable: isAvailable,
                    currentActivities,
                    threshold: period.threshold,
                    timestamp: new Date().toISOString()
                  });
                } else {
                  logger.warn('PROGRESSION_PERIOD_SELECTOR_DIAGNOSTIC', 'Attempted to select unavailable period', {
                    period: period.value,
                    currentActivities,
                    requiredActivities: period.threshold,
                    missingActivities: period.threshold - currentActivities,
                    timestamp: new Date().toISOString()
                  });
                }
              }}
              disabled={!isAvailable}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: isSelected ? `${accentColor}33` : 'transparent',
                color: isSelected ? accentColor : isAvailable ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
                border: isSelected ? `1px solid ${accentColor}66` : '1px solid transparent',
                boxShadow: isSelected ? `0 0 20px ${accentColor}4D` : 'none',
                opacity: isAvailable ? 1 : 0.5,
                cursor: isAvailable ? 'pointer' : 'not-allowed'
              }}
            >
              {period.value === 'week' ? '7 jours' : period.value === 'month' ? '30 jours' : '90 jours'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressionPeriodSelector;