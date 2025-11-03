import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';
import { PerformanceMode } from '../../system/store/performanceModeStore';

interface Feature {
  label: string;
  enabled: boolean;
}

interface PerformanceModeCardProps {
  mode: PerformanceMode;
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const PerformanceModeCard: React.FC<PerformanceModeCardProps> = ({
  mode,
  isSelected,
  isRecommended,
  onClick,
  disabled = false,
}) => {
  const getModeConfig = () => {
    switch (mode) {
      case 'high-performance':
        return {
          title: 'Performance Maximale',
          subtitle: 'Fluidité 60fps garantie',
          icon: ICONS.Zap,
          color: '#10B981',
          gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
          features: [
            { label: 'Animations désactivées', enabled: false },
            { label: 'Effets de verre remplacés', enabled: false },
            { label: 'Transitions simplifiées', enabled: false },
            { label: 'Particules désactivées', enabled: false },
            { label: 'Performance optimale', enabled: true },
            { label: 'Batterie économisée', enabled: true },
            { label: 'Fluidité maximale', enabled: true },
            { label: 'Zéro flickering', enabled: true },
          ],
          benefits: ['60fps constant', 'Batterie optimisée', 'iPhone 8+ compatible'],
        };
      case 'balanced':
        return {
          title: 'Équilibré',
          subtitle: 'Compromis idéal',
          icon: ICONS.Scale,
          color: '#3B82F6',
          gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)',
          features: [
            { label: 'Animations désactivées', enabled: false },
            { label: 'Effets de verre légers', enabled: true },
            { label: 'Transitions simplifiées', enabled: true },
            { label: 'Particules désactivées', enabled: false },
            { label: 'Fond statique', enabled: true },
            { label: 'Design sobre bleu', enabled: true },
            { label: 'Bonne performance', enabled: true },
            { label: 'Batterie économisée', enabled: true },
          ],
          benefits: ['Design + Performance', 'Bon compromis', 'iPhone 11+ recommandé'],
        };
      case 'quality':
        return {
          title: 'Qualité Premium',
          subtitle: 'Expérience complète',
          icon: ICONS.Sparkles,
          color: '#A855F7',
          gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)',
          features: [
            { label: 'Toutes les animations', enabled: true },
            { label: 'Effets de verre complets', enabled: true },
            { label: 'Transitions élaborées', enabled: true },
            { label: 'Particules et lumière', enabled: true },
            { label: 'Design immersif', enabled: true },
            { label: 'Expérience premium', enabled: true },
            { label: 'Tous les effets visuels', enabled: true },
            { label: 'Rendu haute qualité', enabled: true },
          ],
          benefits: ['Design complet', 'Tous les effets', 'iPhone 13+ / Desktop'],
        };
    }
  };

  const config = getModeConfig();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className="w-full text-left relative overflow-hidden rounded-2xl transition-all"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${config.color}30 0%, ${config.color}15 100%)`
          : config.gradient,
        border: isSelected
          ? `2px solid ${config.color}`
          : '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: isSelected
          ? `0 8px 24px ${config.color}40, 0 0 0 1px ${config.color}20`
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <SpatialIcon
              Icon={config.icon}
              size={32}
              color={config.color}
              variant="pure"
            />
            <div>
              <h3 className="text-lg font-bold text-white">
                {config.title}
              </h3>
              <p className="text-sm text-slate-400">
                {config.subtitle}
              </p>
            </div>
          </div>

          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <SpatialIcon
                Icon={ICONS.CheckCircle}
                size={24}
                color={config.color}
                variant="pure"
              />
            </motion.div>
          )}
        </div>

        {isRecommended && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              background: `${config.color}30`,
              border: `1px solid ${config.color}60`,
            }}
          >
            <SpatialIcon
              Icon={ICONS.Star}
              size={14}
              color={config.color}
              variant="pure"
            />
            <span className="text-xs font-semibold" style={{ color: config.color }}>
              Recommandé pour votre appareil
            </span>
          </motion.div>
        )}

        <div className="space-y-2 mb-4">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <SpatialIcon
                Icon={feature.enabled ? ICONS.Check : ICONS.X}
                size={16}
                color={feature.enabled ? config.color : '#64748B'}
                variant="pure"
                className="mt-0.5"
              />
              <span
                className={feature.enabled ? 'text-slate-300' : 'text-slate-500'}
                style={{
                  textDecoration: feature.enabled ? 'none' : 'line-through',
                }}
              >
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            {config.benefits.map((benefit, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(51, 65, 85, 0.6)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {isSelected && mode !== 'high-performance' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${config.color}15, transparent 70%)`,
            zIndex: 0,
          }}
        />
      )}
    </motion.button>
  );
};

export default PerformanceModeCard;
