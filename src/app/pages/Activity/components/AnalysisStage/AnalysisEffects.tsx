import React, { useEffect, useRef } from 'react';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';

/**
 * Analysis Effects - Effets de fond énergétiques
 * Lignes de scan, particules et grille d'analyse
 * Optimized with performance mode integration
 */
const AnalysisEffects: React.FC = () => {
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

  if (!perf.enableComplexEffects) return null;

  return (
    <div className="analysis-effects-container" ref={containerRef}>
      {perf.enableParticles && (
        <>
          <div className="analysis-particle" style={{ left: '10%', top: '20%' }} />
          <div className="analysis-particle" style={{ left: '30%', top: '60%' }} />
          <div className="analysis-particle" style={{ left: '50%', top: '30%' }} />
          <div className="analysis-particle" style={{ left: '70%', top: '70%' }} />
          <div className="analysis-particle" style={{ left: '85%', top: '40%' }} />
          <div className="analysis-particle" style={{ left: '20%', top: '80%' }} />
        </>
      )}
    </div>
  );
};

export default AnalysisEffects;
