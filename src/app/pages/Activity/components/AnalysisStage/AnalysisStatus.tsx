import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import React from 'react';

interface AnalysisStatusProps {
  progress: number;
  currentMessage: string;
  subMessage?: string;
}

/**
 * Analysis Status - Zone de focus énergétique
 * Affichage du statut actuel de l'analyse avec métriques
 */
const AnalysisStatus: React.FC<AnalysisStatusProps> = ({ progress, currentMessage, subMessage }) => {
  const forgeColors = {
    primary: '#3B82F6',
    secondary: '#06B6D4',
  };

  // Messages de progression dynamiques pour la Forge
  const getForgeMessage = () => {
    if (progress < 20) return "Initialisation de la Forge Énergétique...";
    if (progress < 40) return "Décodage de votre empreinte énergétique...";
    if (progress < 60) return "Analyse des patterns de mouvement...";
    if (progress < 80) return "Calcul des métriques énergétiques...";
    return "Finalisation de l'analyse de Forge...";
  };

  const getSubForgeMessage = () => {
    if (progress < 20) return "Préparation des systèmes d'analyse";
    if (progress < 40) return "Extraction des données de mouvement";
    if (progress < 60) return "Identification des activités physiques";
    if (progress < 80) return "Optimisation des paramètres de forge";
    return "Compilation des résultats énergétiques";
  };

  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="mt-8 p-6 rounded-xl" style={{
      background: `
        radial-gradient(circle at center, color-mix(in srgb, ${forgeColors.primary} 8%, transparent) 0%, transparent 70%),
        rgba(255,255,255,0.04)
      `,
      border: `1px solid color-mix(in srgb, ${forgeColors.primary} 20%, transparent)`,
      backdropFilter: 'blur(8px) saturate(120%)'
    }}>
      <div className="text-center">
        <h4 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${forgeColors.primary} 20%, transparent)`,
              border: `1px solid color-mix(in srgb, ${forgeColors.primary} 30%, transparent)`
            }}
          >
            <SpatialIcon Icon={ICONS.Zap} size={12} style={{ color: forgeColors.primary }} />
          </div>
          Forge Énergétique Active
        </h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white mb-1">
              {getForgeMessage().includes('Initialisation') ? '🔄' : 
               getForgeMessage().includes('Décodage') ? '🎤' :
               getForgeMessage().includes('Analyse') ? '⚡' :
               getForgeMessage().includes('Calcul') ? '🔥' : '✨'}
            </div>
            <div className="text-xs text-white/60">Phase Active</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: forgeColors.primary }}>
              {Math.round(safeProgress)}%
            </div>
            <div className="text-xs text-white/60">Progression</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white mb-1">
              {progress < 50 ? '⏳' : progress < 80 ? '⚡' : '🎯'}
            </div>
            <div className="text-xs text-white/60">Statut</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisStatus;