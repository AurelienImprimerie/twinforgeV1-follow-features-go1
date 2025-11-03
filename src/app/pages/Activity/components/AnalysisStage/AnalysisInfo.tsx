import GlassCard from '../../../../../ui/cards/GlassCard';
import React from 'react';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

/**
 * Analysis Info - Conseils de la Forge Spatiale
 * Panneau d'information sur le processus d'analyse
 */
const AnalysisInfo: React.FC = () => {
  return (
    <GlassCard 
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #06B6D4 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #06B6D4 20%, transparent)',
        backdropFilter: 'blur(16px) saturate(140%)'
      }}
    >
      <h4 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, #06B6D4 15%, transparent)',
            border: '1px solid color-mix(in srgb, #06B6D4 25%, transparent)'
          }}
        >
          <SpatialIcon Icon={ICONS.Info} size={14} style={{ color: '#06B6D4' }} />
        </div>
        Processus de la Forge Spatiale
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
            <div>
              <div className="text-blue-300 font-medium">Décodage Énergétique</div>
              <div className="text-blue-200 text-xs">Transformation de votre voix en données structurées</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
            <div>
              <div className="text-cyan-300 font-medium">Analyse de Mouvement</div>
              <div className="text-cyan-200 text-xs">Identification précise de vos activités physiques</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2" />
            <div>
              <div className="text-green-300 font-medium">Calcul Énergétique</div>
              <div className="text-green-200 text-xs">Estimation des calories et métriques de performance</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
            <div>
              <div className="text-purple-300 font-medium">Optimisation Forge</div>
              <div className="text-purple-200 text-xs">Personnalisation selon votre profil énergétique</div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default AnalysisInfo;