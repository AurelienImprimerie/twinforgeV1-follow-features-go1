import React from 'react';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { getProtocolById } from '@/lib/nutrition/fastingProtocols';
import FastingTipsCard from '@/app/pages/Fasting/components/Cards/FastingTipsCard';

interface FastingProtocolInfoCardProps {
  targetHours: number;
}

/**
 * Fasting Protocol Info Card - Informations sur le Protocole de Jeûne
 * Composant autonome pour afficher les détails du protocole sélectionné
 */
const FastingProtocolInfoCard: React.FC<FastingProtocolInfoCardProps> = ({ targetHours }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const eatingHours = 24 - targetHours;
  const protocolId = `${targetHours}:${eatingHours}`;
  
  // Essayer de trouver le protocole dans la base de données
  const knownProtocol = getProtocolById(protocolId);
  
  const protocolInfo = {
    name: knownProtocol?.name || `${protocolId} (Personnalisé)`,
    description: knownProtocol?.description || `${targetHours} heures de jeûne, ${eatingHours} heures d'alimentation`,
    difficulty: knownProtocol?.difficulty || 'intermediate',
    benefits: knownProtocol?.benefits || [
      'Améliore la sensibilité à l\'insuline',
      'Favorise la combustion des graisses',
      'Optimise le métabolisme'
    ]
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return '#22C55E';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return 'Intermédiaire';
    }
  };

  const difficultyColor = getDifficultyColor(protocolInfo.difficulty);

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #F59E0B 8%, transparent) 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, #F59E0B 20%, transparent)',
        boxShadow: isPerformanceMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px color-mix(in srgb, #F59E0B 15%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
      }}
    >
      <div className="space-y-4">
        {/* Header du Protocole */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #F59E0B 30%, transparent), color-mix(in srgb, #F59E0B 20%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #F59E0B 40%, transparent)',
                boxShadow: isPerformanceMode ? 'none' : '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)'
              }}
            >
              <SpatialIcon Icon={ICONS.Info} size={16} style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <h4 className="text-orange-300 font-semibold text-lg">Protocole {protocolId}</h4>
              <p className="text-orange-200 text-sm">{protocolInfo.description}</p>
            </div>
          </div>

          {/* Badge de Difficulté */}
          <div 
            className="px-3 py-1.5 rounded-full"
            style={{
              background: `color-mix(in srgb, ${difficultyColor} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${difficultyColor} 25%, transparent)`
            }}
          >
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ background: difficultyColor }} 
              />
              <span className="text-sm font-medium" style={{ color: difficultyColor }}>
                {getDifficultyLabel(protocolInfo.difficulty)}
              </span>
            </div>
          </div>
        </div>

        {/* Détails du Protocole */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl" style={{
            background: 'color-mix(in srgb, #EF4444 10%, transparent)',
            border: '1px solid color-mix(in srgb, #EF4444 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-red-400 mb-1">{targetHours}h</div>
            <div className="text-red-300 text-sm font-medium">Jeûne</div>
            <div className="text-white/50 text-xs mt-1">Durée</div>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{
            background: 'color-mix(in srgb, #10B981 10%, transparent)',
            border: '1px solid color-mix(in srgb, #10B981 20%, transparent)'
          }}>
            <div className="text-2xl font-bold text-green-400 mb-1">{eatingHours}h</div>
            <div className="text-green-300 text-sm font-medium">Alimentation</div>
            <div className="text-white/50 text-xs mt-1">Fenêtre</div>
          </div>
        </div>

        {/* Bénéfices du Protocole */}
        <div>
          <h5 className="text-orange-300 font-medium text-sm mb-3 flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Target} size={12} style={{ color: '#F59E0B' }} />
            Bénéfices de ce Protocole
          </h5>
          <div className="space-y-2">
            {protocolInfo.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="text-orange-200 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hydratation Recommandée */}
        <div 
          className="p-4 rounded-xl"
          style={{
            background: 'color-mix(in srgb, #06B6D4 8%, transparent)',
            border: '1px solid color-mix(in srgb, #06B6D4 20%, transparent)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <SpatialIcon Icon={ICONS.Droplet} size={14} style={{ color: '#06B6D4' }} />
            <span className="text-cyan-300 font-semibold text-sm">Hydratation Autorisée</span>
          </div>
          <div className="text-cyan-200 text-sm space-y-1">
            <p>• Eau pure (illimitée)</p>
            <p>• Thé et tisanes sans sucre</p>
            <p>• Café noir sans édulcorant</p>
            <p>• Eau gazeuse nature</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default FastingTipsCard;