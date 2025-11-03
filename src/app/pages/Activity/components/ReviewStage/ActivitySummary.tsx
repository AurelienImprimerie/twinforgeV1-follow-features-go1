import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import React from 'react';

interface ActivitySummaryProps {
  activities: any[];
  totalCalories: number;
  totalDuration: number;
}

/**
 * Activity Summary - Résumé Global des Activités
 * Affiche les statistiques globales de la session d'activité avec focus sur les calories
 */
const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  activities,
  totalCalories,
  totalDuration
}) => {
  return (
    <GlassCard 
      className="p-8 text-center"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-ember-copper) 15%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #F59E0B 12%, transparent) 0%, transparent 50%),
          var(--glass-opacity)
        `,
        borderColor: 'color-mix(in srgb, var(--color-ember-copper) 30%, transparent)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px color-mix(in srgb, var(--color-ember-copper) 20%, transparent),
          0 0 60px color-mix(in srgb, #F59E0B 15%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `
      }}
    >
      {/* Focus Principal : Calories Brûlées */}
      <div className="mb-8">
        <div 
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center breathing-icon"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
              radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--color-ember-copper) 20%, transparent) 0%, transparent 50%),
              linear-gradient(135deg, color-mix(in srgb, var(--color-ember-copper) 45%, transparent), color-mix(in srgb, #F59E0B 35%, transparent))
            `,
            border: '3px solid color-mix(in srgb, var(--color-ember-copper) 70%, transparent)',
            boxShadow: `
              0 0 40px color-mix(in srgb, var(--color-ember-copper) 70%, transparent),
              0 0 80px color-mix(in srgb, var(--color-ember-copper) 50%, transparent),
              0 0 120px color-mix(in srgb, #F59E0B 40%, transparent),
              inset 0 4px 0 rgba(255,255,255,0.5),
              inset 0 -2px 0 rgba(0,0,0,0.2)
            `,
            backdropFilter: 'blur(20px) saturate(170%)',
            WebkitBackdropFilter: 'blur(20px) saturate(170%)'
          }}
        >
          <SpatialIcon
            Icon={ICONS.Fire}
            size={48}
            style={{
              color: 'var(--color-ember-copper)',
              filter: `
                drop-shadow(0 0 12px color-mix(in srgb, var(--color-ember-copper) 90%, transparent))
                drop-shadow(0 0 24px color-mix(in srgb, var(--color-ember-copper) 70%, transparent))
                drop-shadow(0 0 36px color-mix(in srgb, #F59E0B 50%, transparent))
              `
            }}
            variant="pure"
          />
        </div>

        {/* Calories - Affichage Principal */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-center gap-2">
            <span 
              className="text-6xl md:text-7xl font-black leading-none"
              style={{
                color: 'var(--color-ember-copper)',
                textShadow: `
                  0 0 20px color-mix(in srgb, var(--color-ember-copper) 60%, transparent),
                  0 0 40px color-mix(in srgb, var(--color-ember-copper) 40%, transparent),
                  0 0 60px color-mix(in srgb, #F59E0B 30%, transparent)
                `,
                letterSpacing: '-0.02em'
              }}
            >
              {totalCalories}
            </span>
            <span 
              className="text-2xl font-bold mb-2"
              style={{
                color: 'color-mix(in srgb, var(--color-ember-copper) 80%, white)',
                textShadow: '0 0 12px color-mix(in srgb, var(--color-ember-copper) 40%, transparent)'
              }}
            >
              kcal
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Énergie Forgée
          </h2>
          <p className="text-white/80 text-lg">
            Votre session énergétique a été analysée avec succès
          </p>
        </div>
      </div>

      {/* Métriques Secondaires */}
      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        {/* Nombre d'Activités */}
        <div className="text-center p-6 rounded-xl" style={{
          background: 'color-mix(in srgb, #22C55E 10%, transparent)',
          border: '1px solid color-mix(in srgb, #22C55E 20%, transparent)',
          backdropFilter: 'blur(12px) saturate(130%)'
        }}>
          <div className="text-3xl font-bold text-green-400 mb-2">{activities.length}</div>
          <div className="text-green-300 text-sm font-medium">Activités</div>
          <div className="text-white/60 text-xs mt-1">Forgées</div>
        </div>
        
        {/* Durée Totale */}
        <div className="text-center p-6 rounded-xl" style={{
          background: 'color-mix(in srgb, #3B82F6 10%, transparent)',
          border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)',
          backdropFilter: 'blur(12px) saturate(130%)'
        }}>
          <div className="text-3xl font-bold text-blue-400 mb-2">{totalDuration}</div>
          <div className="text-blue-300 text-sm font-medium">Minutes</div>
          <div className="text-white/60 text-xs mt-1">Actives</div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ActivitySummary;