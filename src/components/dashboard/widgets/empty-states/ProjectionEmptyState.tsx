/**
 * ProjectionEmptyState - État empty pour le composant Projection de Progression
 * Affiche 3 résumés d'actions prioritaires pour gagner les premiers XP
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { scrollToSection } from '@/utils/navigationUtils';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

interface ActionCardProps {
  icon: string;
  xp: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}

function ActionCard({ icon, xp, title, description, color, delay }: ActionCardProps) {
  const { performanceMode } = usePerformanceMode();
  const handleClick = () => {
    scrollToSection('gaming-actions-widget', { offset: 100, behavior: 'smooth' });
  };

  // En mode high performance, on utilise des backgrounds opaques
  const cardStyle = performanceMode === 'high' ? {
    background: '#1a2332',
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  } : {
    background: `
      linear-gradient(135deg,
        color-mix(in srgb, ${color} 8%, transparent) 0%,
        color-mix(in srgb, ${color} 3%, transparent) 100%
      )
    `,
    border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
    boxShadow: `0 4px 20px color-mix(in srgb, ${color} 10%, transparent)`
  };

  const hoverEffect = performanceMode === 'high' ? {} : {
    scale: 1.02,
    boxShadow: `0 8px 30px color-mix(in srgb, ${color} 20%, transparent)`
  };

  return (
    <motion.div
      className="relative p-6 rounded-2xl overflow-hidden cursor-pointer group"
      style={cardStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect}
      onClick={handleClick}
    >
      {/* Background Glow Effect - DÉSACTIVÉ en mode high performance */}
      {performanceMode !== 'high' && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, color-mix(in srgb, ${color} 15%, transparent) 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />
      )}

      <div className="relative z-10">
        {/* Icon + XP Badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={performanceMode === 'high' ? {
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            } : {
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`
            }}
          >
            <SpatialIcon name={icon} size={24} color={performanceMode === 'high' ? '#F7931E' : color} />
          </div>

          <div
            className="px-3 py-1.5 rounded-full text-sm font-bold"
            style={performanceMode === 'high' ? {
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F7931E'
            } : {
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
              color: color
            }}
          >
            +{xp} XP
          </div>
        </div>

        {/* Title + Description */}
        <div className="mb-4 space-y-2">
          <div className="text-lg font-bold text-white">{title}</div>
          <div className="text-sm text-white/70">{description}</div>
        </div>

        {/* CTA Button */}
        <motion.button
          className="w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group-hover:gap-3"
          style={performanceMode === 'high' ? {
            background: 'rgba(255, 255, 255, 0.10)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#F7931E'
          } : {
            background: `color-mix(in srgb, ${color} 20%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
            color: color
          }}
          whileHover={performanceMode === 'high' ? {
            background: 'rgba(255, 255, 255, 0.12)'
          } : {
            background: `color-mix(in srgb, ${color} 30%, transparent)`
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Commencer</span>
          <SpatialIcon name="ArrowRight" size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export function ProjectionEmptyState() {
  const actions = [
    {
      icon: 'Utensils',
      xp: '25',
      title: 'Scanner un repas',
      description: 'Scanne ton prochain repas pour débloquer tes premières prédictions',
      color: '#F7931E'
    },
    {
      icon: 'Dumbbell',
      title: 'Logger une activité',
      xp: '30',
      description: 'Enregistre ta première séance d\'entraînement',
      color: '#FBBF24'
    },
    {
      icon: 'Clock',
      xp: '20',
      title: 'Démarrer un jeûne',
      description: 'Lance ton premier cycle de jeûne intermittent',
      color: '#F59E0B'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <ActionCard
          key={action.title}
          icon={action.icon}
          xp={action.xp}
          title={action.title}
          description={action.description}
          color={action.color}
          delay={0.1 + index * 0.1}
        />
      ))}
    </div>
  );
}
