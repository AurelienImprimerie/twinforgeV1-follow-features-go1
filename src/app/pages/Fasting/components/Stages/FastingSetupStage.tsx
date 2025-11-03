import React from 'react';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

interface FastingSetupStageProps {
  targetHours: number;
  setTargetHours: (hours: number) => void;
  onStartFasting: () => void;
}

/**
 * Fasting Setup Stage - Configuration du Protocole de Jeûne
 * Interface de configuration pour démarrer une session de jeûne
 */
const FastingSetupStage: React.FC<FastingSetupStageProps> = ({
  targetHours,
  setTargetHours,
  onStartFasting
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  return (
    <GlassCard
      className="p-8 text-center"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 15%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #EF4444 12%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #F59E0B 30%, transparent)',
        boxShadow: isPerformanceMode
          ? '0 20px 60px rgba(0, 0, 0, 0.4)'
          : `
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 0 40px color-mix(in srgb, #F59E0B 20%, transparent),
            0 0 80px color-mix(in srgb, #EF4444 15%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.2)
          `,
        backdropFilter: isPerformanceMode ? 'none' : 'blur(28px) saturate(170%)'
      }}
    >
      <div className="space-y-6">
        {/* Icône Centrale de la Forge du Temps */}
        <div className="flex items-center justify-center w-full">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                radial-gradient(circle at 70% 70%, color-mix(in srgb, #F59E0B 20%, transparent) 0%, transparent 50%),
                linear-gradient(135deg, color-mix(in srgb, #F59E0B 45%, transparent), color-mix(in srgb, #EF4444 35%, transparent))
              `,
              border: `4px solid color-mix(in srgb, #F59E0B 70%, transparent)`,
              boxShadow: isPerformanceMode
                ? 'none'
                : `
                  0 0 40px color-mix(in srgb, #F59E0B 70%, transparent),
                  0 0 80px color-mix(in srgb, #F59E0B 50%, transparent),
                  0 0 120px color-mix(in srgb, #EF4444 40%, transparent),
                  inset 0 4px 0 rgba(255,255,255,0.5),
                  inset 0 -3px 0 rgba(0,0,0,0.2)
                `,
              backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(170%)',
              WebkitBackdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(170%)',
              transition: 'all 0.3s ease',
              margin: '0 auto'
            }}
          >
            <SpatialIcon
              Icon={ICONS.Timer}
              size={64}
              style={{
                color: '#F59E0B',
                filter: isPerformanceMode
                  ? 'none'
                  : `
                    drop-shadow(0 0 16px color-mix(in srgb, #F59E0B 90%, transparent))
                    drop-shadow(0 0 32px color-mix(in srgb, #F59E0B 70%, transparent))
                    drop-shadow(0 0 48px color-mix(in srgb, #EF4444 50%, transparent))
                  `
              }}
              variant="pure"
            />
          </div>
        </div>

        {/* Statut et Configuration */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Prêt à Jeûner
          </h2>
          <p className="text-white/80 text-lg">
            Configurez votre protocole et démarrez votre session
          </p>
          
          {/* Sélecteur de Protocole */}
          <div className="max-w-xs mx-auto">
            <label className="block text-white/90 text-sm font-medium mb-2">
              Protocole de jeûne
            </label>
            <select
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="glass-input w-full text-center"
              style={{
                background: 'color-mix(in srgb, #F59E0B 8%, transparent)',
                border: '1px solid color-mix(in srgb, #F59E0B 25%, transparent)'
              }}
            >
              <option value={14}>14:10 - Débutant</option>
              <option value={16}>16:8 - Classique</option>
              <option value={18}>18:6 - Intermédiaire</option>
              <option value={20}>20:4 - Warrior</option>
              <option value={24}>24:0 - OMAD</option>
            </select>
          </div>
        </div>

        {/* Bouton de Démarrage */}
        <div className="flex justify-center">
          <button
            onClick={onStartFasting}
            className="px-8 py-4 text-xl font-bold rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, 
                color-mix(in srgb, #22C55E 80%, transparent), 
                color-mix(in srgb, #10B981 60%, transparent)
              )`,
              border: '3px solid color-mix(in srgb, #22C55E 60%, transparent)',
              boxShadow: isPerformanceMode
                ? '0 16px 50px color-mix(in srgb, #22C55E 50%, transparent)'
                : `
                  0 16px 50px color-mix(in srgb, #22C55E 50%, transparent),
                  0 0 80px color-mix(in srgb, #22C55E 40%, transparent),
                  inset 0 4px 0 rgba(255,255,255,0.5)
                `,
              backdropFilter: isPerformanceMode ? 'none' : 'blur(24px) saturate(170%)',
              color: '#fff',
              transition: 'all 0.2s ease'
            }}
          >
            <div className="flex items-center gap-3">
              <SpatialIcon Icon={ICONS.Timer} size={28} className="text-white" />
              <span>Démarrer le Jeûne</span>
            </div>
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default FastingSetupStage;