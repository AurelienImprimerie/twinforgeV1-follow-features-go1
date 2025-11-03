import React from 'react';
import { motion } from 'framer-motion';

interface DataFlowVisualizationProps {
  analysisColor: string;
}

/**
 * Data Flow Visualization Component
 * Visualisation du flux de données pendant l'analyse
 */
const DataFlowVisualization: React.FC<DataFlowVisualizationProps> = ({
  analysisColor,
}) => {
  return (
    <div className="relative overflow-hidden data-flow-container h-16 perf-heavy">
      {/* Particules de Données */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 rounded-full particle-css particle-css--${i + 1}`}
          style={{
            background: `linear-gradient(135deg, ${analysisColor}, rgba(34, 197, 94, 0.8))`,
            left: `${10 + i * 10}%`,
            top: `${40 + (i % 3) * 20}%`,
            boxShadow: `
              0 0 12px ${analysisColor}80,
              0 0 24px ${analysisColor}40
            `,
            border: `1px solid ${analysisColor}CC`,
            '--particle-color': analysisColor
          }}
        />
      ))}
      
      {/* Flux de Données Connecteurs */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.3 }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <path
            key={i}
            d={`M ${20 + i * 30} 50 Q ${40 + i * 30} 20 ${60 + i * 30} 50`}
            stroke={analysisColor}
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 4"
            style={{
              animation: `data-flow-path 3s ease-in-out infinite ${i * 0.5}s`
            }}
          />
        ))}
      </svg>
    </div>
  );
};

/* CSS Animation pour les paths */
const styles = `
@keyframes data-flow-path {
  0% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: -20; }
}
`;

// Injection du style
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default DataFlowVisualization;