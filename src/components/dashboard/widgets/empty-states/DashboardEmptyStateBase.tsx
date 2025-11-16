/**
 * DashboardEmptyStateBase - Composant réutilisable pour les états empty du Dashboard
 *
 * Structure standardisée:
 * - Icône principale animée
 * - Titre dynamique
 * - Sous-titre dynamique
 * - 3 résumés de valeur ajoutée
 * - CTA vers actions prioritaires
 */

import { motion } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import type { IconName } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

interface ValueCard {
  icon: IconName;
  iconColor: string;
  title: string;
  description: string;
}

interface DashboardEmptyStateBaseProps {
  mainIcon: IconName;
  mainIconColor: string;
  glowColor: string;
  title: string;
  subtitle: string;
  valueCards: [ValueCard, ValueCard, ValueCard];
  ctaText: string;
  ctaIcon: IconName;
  onCtaClick: () => void;
  backgroundColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
}

export default function DashboardEmptyStateBase({
  mainIcon,
  mainIconColor,
  glowColor,
  title,
  subtitle,
  valueCards,
  ctaText,
  ctaIcon,
  onCtaClick,
  backgroundColor,
  borderColor,
  children
}: DashboardEmptyStateBaseProps) {
  const { performanceMode } = usePerformanceMode();

  return (
    <motion.div
      className="glass-card-premium p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
      style={{
        background: backgroundColor || `
          radial-gradient(circle at 30% 30%, ${mainIconColor}30 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, ${glowColor}25 0%, transparent 50%),
          ${mainIconColor}05
        `,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: `2px solid ${borderColor || mainIconColor}40`,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Effects - Static */}

      {/* Header avec illustration - Static */}
      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Icône principale - Statique */}
            <div
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${mainIconColor}40, ${mainIconColor}20)`,
                border: `2px solid ${mainIconColor}50`,
                boxShadow: `0 0 20px ${mainIconColor}30`,
              }}
            >
              <SpatialIcon name={mainIcon} size={48} color={mainIconColor} glowColor={glowColor} variant="pure" />
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white">{title}</h3>
        <p className="text-base text-white/70 max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      {/* 3 Cartes de Valeur Ajoutée */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {valueCards.map((card, index) => (
          <motion.div
            key={index}
            className="glass-card rounded-xl p-4 text-center space-y-3"
            style={{
              background: `radial-gradient(circle, ${card.iconColor}15 0%, transparent 70%)`,
              border: `1px solid ${card.iconColor}30`
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div
              className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${card.iconColor}30 0%, ${card.iconColor}10 70%, transparent 100%)`,
                border: `1px solid ${card.iconColor}40`,
                boxShadow: `0 0 20px ${card.iconColor}30`
              }}
            >
              <SpatialIcon
                name={card.icon}
                size={24}
                color={card.iconColor}
                style={{
                  filter: `drop-shadow(0 0 8px ${card.iconColor}60)`
                }}
              />
            </div>
            <h4 className="font-semibold text-white">{card.title}</h4>
            <p className="text-sm text-white/60">{card.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA Principal */}
      <div className="relative z-10 text-center">
        <button
          onClick={onCtaClick}
          className="group relative px-8 py-4 text-white font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${mainIconColor}80 0%, ${glowColor}90 100%)`,
            border: `2px solid ${mainIconColor}60`,
            boxShadow: `
              0 0 30px ${mainIconColor}40,
              0 8px 25px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2)
            `,
            backdropFilter: 'blur(10px) saturate(1.2)'
          }}
        >
          <div className="flex items-center gap-3">
            <SpatialIcon
              name={ctaIcon}
              size={24}
              className="group-hover:scale-110 transition-transform duration-300"
              style={{
                color: 'white',
                filter: `drop-shadow(0 0 10px ${mainIconColor}80)`
              }}
            />
            <span className="text-lg">{ctaText}</span>
          </div>

          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${mainIconColor}60 0%, ${glowColor}60 100%)`,
              pointerEvents: 'none'
            }}
          />
        </button>
      </div>

      {/* Children - Pour contenu additionnel */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </motion.div>
  );
}
