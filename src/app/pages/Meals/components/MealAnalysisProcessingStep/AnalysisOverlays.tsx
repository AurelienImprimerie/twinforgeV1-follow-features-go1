import React from 'react';
import { motion } from 'framer-motion';

interface AnalysisOverlaysProps {
  analysisZones: Array<{ x: number; y: number; intensity: number; id: string }>;
  currentPhase: 'detection' | 'analysis' | 'calculation';
  analysisColor: string;
}

/**
 * Analysis Overlays Component
 * Overlays visuels pour l'analyse IA (lignes de scan, grille, points clés)
 */
const AnalysisOverlays: React.FC<AnalysisOverlaysProps> = ({
  analysisZones,
  currentPhase,
  analysisColor,
}) => {
  return (
    <div className="absolute inset-0 analysis-overlays perf-heavy">
      {/* Ligne de Scan Verticale */}
      <div
        className="absolute top-0 w-1 h-full opacity-70 scan-line-vertical"
        style={{
          background: `linear-gradient(180deg, 
            transparent 0%, 
            ${analysisColor}CC 30%, 
            ${analysisColor}FF 50%, 
            ${analysisColor}CC 70%, 
            transparent 100%
          )`,
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: `0 0 8px ${analysisColor}80`
        }}
      />
      
      {/* Ligne de Scan Horizontale */}
      <div
        className="absolute left-0 w-full h-1 opacity-60 scan-line-horizontal"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${analysisColor}80 30%, 
            ${analysisColor}CC 50%, 
            ${analysisColor}80 70%, 
            transparent 100%
          )`,
          top: '50%',
          transform: 'translateY(-50%)',
          boxShadow: `0 0 6px ${analysisColor}60`
        }}
      />
      
      {/* Grille d'Analyse */}
      <div className="absolute inset-0 opacity-25 analysis-grid">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(${analysisColor}30 1px, transparent 1px),
              linear-gradient(90deg, ${analysisColor}30 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
      </div>
      
      {/* Points Clés Nutritionnels */}
      <div className="absolute inset-0 nutrition-keypoints">
        {[
          { x: 25, y: 30, label: 'Protéines', color: '#EF4444' },
          { x: 75, y: 25, label: 'Lipides', color: '#8B5CF6' }
        ].map((point, index) => (
          <div
            key={point.label}
            className={`absolute w-4 h-4 rounded-full nutrition-keypoint particle-css particle-css--${index + 1}`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              background: point.color,
              boxShadow: `
                0 0 16px ${point.color}80,
                0 0 32px ${point.color}40
              `,
              border: `1px solid ${point.color}CC`,
              '--particle-color': point.color
            }}
          >
            {/* Tooltip nutritionnel */}
            <div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap pointer-events-none"
              style={{
                background: `${point.color}20`,
                border: `1px solid ${point.color}40`,
                color: point.color,
                backdropFilter: 'blur(8px)',
                opacity: currentPhase === 'detection' ? 1 : 0.3
              }}
            >
              {point.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Zones d'Analyse Dynamiques */}
      {analysisZones.slice(0, 3).map((zone) => (
        <div
          key={zone.id}
          className="absolute w-16 h-16 rounded-full pointer-events-none"
          style={{
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            background: `radial-gradient(circle, 
              ${analysisColor}${Math.round(zone.intensity * 80)} 0%, 
              ${analysisColor}${Math.round(zone.intensity * 40)} 50%, 
              transparent 70%
            )`,
            border: `1px solid ${analysisColor}40`,
            backdropFilter: 'blur(4px)'
          }}
        />
      ))}
      
      {/* Effet de Focus IA */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none ai-focus-overlay"
        style={{
          background: `
            radial-gradient(circle at center, 
              transparent 20%, 
              ${analysisColor}10 40%, 
              ${analysisColor}20 60%, 
              ${analysisColor}15 80%, 
              transparent 100%
            )
          `,
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};

export default AnalysisOverlays;