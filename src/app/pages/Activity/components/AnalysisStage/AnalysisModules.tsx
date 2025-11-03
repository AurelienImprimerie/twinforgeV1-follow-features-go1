import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import { ConditionalMotionActivity } from '../shared/ConditionalMotionActivity';
import React, { useEffect, useRef } from 'react';

interface AnalysisModulesProps {
  progress: number;
}

/**
 * Analysis Modules - Modules de traitement énergétique
 * Grille des modules de traitement avec états actifs
 * Optimized with performance mode integration
 */
const AnalysisModules: React.FC<AnalysisModulesProps> = ({ progress }) => {
  const perf = useActivityPerformance();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const perfClass = `activity-perf-${perf.mode}`;
      containerRef.current.classList.add(perfClass);
      return () => {
        containerRef.current?.classList.remove(perfClass);
      };
    }
  }, [perf.mode]);

  const modules = [
    {
      icon: 'Volume2',
      label: 'Décodage Énergétique',
      sublabel: 'Extraction des données vocales',
      color: '#3B82F6',
      active: progress >= 10
    },
    {
      icon: 'Target',
      label: 'Analyse de Mouvement',
      sublabel: 'Identification des activités',
      color: '#06B6D4',
      active: progress >= 40
    },
    {
      icon: 'Zap',
      label: 'Calcul Énergétique',
      sublabel: 'Optimisation des métriques',
      color: '#10B981',
      active: progress >= 70
    }
  ];

  return (
    <div className="analysis-modules-container" ref={containerRef}>
      {modules.map((step, index) => {
        const moduleClass = `analysis-module ${step.active ? 'analysis-module-active' : ''}`;

        return (
          <ConditionalMotionActivity
            key={step.label}
            className={moduleClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: perf.transitionDuration,
              delay: index * perf.staggerDelay
            }}
            fallback={<div className={moduleClass}>
              <div className="analysis-module-icon">
                <SpatialIcon
                  Icon={ICONS[step.icon as keyof typeof ICONS]}
                  size={20}
                  style={{ color: step.color }}
                  variant="pure"
                />
              </div>
              <div className="analysis-module-title">{step.label}</div>
              <div className="analysis-module-status">{step.sublabel}</div>
            </div>}
          >
            <div className="analysis-module-icon">
              <SpatialIcon
                Icon={ICONS[step.icon as keyof typeof ICONS]}
                size={20}
                style={{ color: step.color }}
                variant="pure"
              />
            </div>
            <div className="analysis-module-title">{step.label}</div>
            <div className="analysis-module-status">{step.sublabel}</div>
          </ConditionalMotionActivity>
        );
      })}
    </div>
  );
};

export default AnalysisModules;
