import React from 'react';
import { motion } from 'framer-motion';
import { ICONS } from '../icons/registry';
import SpatialIcon from '../icons/SpatialIcon';
import { CIRCUIT_COLORS, type CircuitKey } from '../theme/circuits';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';

type Props = {
  icon?: keyof typeof ICONS;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  circuit?: CircuitKey;
  iconColor?: string;
};

export default function PageHeader({
  icon = 'Home',
  title,
  subtitle,
  actions,
  className = '',
  circuit = 'home',
  iconColor
}: Props) {
  const { isPerformanceMode } = usePerformanceMode();

  // Gestion spéciale pour certains circuits
  const finalIcon = (() => {
    if (circuit === 'track') return ICONS.Target;
    return ICONS[icon];
  })();

  // Utiliser la couleur spécifique ou celle du circuit
  const finalCircuitColor = iconColor || CIRCUIT_COLORS[circuit];
  
  return (
    <header
      className={`pt-6 md:pt-8 mb-4 md:mb-6 will-change-transform-important ${className}`}
      role="banner"
      aria-labelledby="page-title"
    >
      <div className="flex flex-row items-center gap-6 mb-8">
        {/* Icône avec rendu optimisé selon le mode */}
        {isPerformanceMode ? (
          // MODE PERFORMANCE: Rendu simplifié mais attrayant avec ombre colorée légère
          <div className="flex-shrink-0">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg,
                  color-mix(in srgb, ${finalCircuitColor} 25%, #1e293b),
                  color-mix(in srgb, ${finalCircuitColor} 12%, #0f172a)
                )`,
                border: `2px solid color-mix(in srgb, ${finalCircuitColor} 50%, transparent)`,
                boxShadow: `
                  0 8px 24px rgba(0, 0, 0, 0.4),
                  0 2px 8px color-mix(in srgb, ${finalCircuitColor} 20%, transparent),
                  0 4px 16px color-mix(in srgb, ${finalCircuitColor} 15%, transparent),
                  inset 0 2px 0 rgba(255, 255, 255, 0.15),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.2)
                `,
              }}
              role="img"
              aria-label={`Icône de la page ${title}`}
            >
              {/* Subtle accent bar on top */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(90deg,
                    transparent,
                    color-mix(in srgb, ${finalCircuitColor} 60%, transparent),
                    transparent
                  )`,
                }}
              />
              <SpatialIcon
                Icon={finalIcon}
                size={48}
                variant="pure"
                className="text-white relative z-10"
                style={{
                  color: finalCircuitColor,
                  filter: `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 3px color-mix(in srgb, ${finalCircuitColor} 25%, transparent))`,
                  opacity: 1
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        ) : (
          // MODE QUALITÉ: Rendu avec effets complets
          <div
            className="breathing-icon flex-shrink-0"
            style={{
              '--animation-duration-slower': '5s'
            }}
          >
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg"
              style={{
                '--header-icon-radius': '24px',
                borderRadius: 'var(--header-icon-radius)',
                WebkitMaskImage: 'radial-gradient(white, black)',
                maskImage: 'radial-gradient(white, black)',
                background: `
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, ${finalCircuitColor} 40%, transparent) 0%, transparent 60%),
                  radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--brand-primary) 35%, transparent) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, color-mix(in srgb, ${finalCircuitColor} 25%, transparent) 0%, transparent 70%),
                  rgba(255, 255, 255, 0.15)
                `,
                border: `2px solid color-mix(in srgb, ${finalCircuitColor} 60%, transparent)`,
                boxShadow: `
                  0 16px 64px color-mix(in srgb, ${finalCircuitColor} 45%, transparent),
                  0 0 100px color-mix(in srgb, ${finalCircuitColor} 35%, transparent),
                  0 0 160px color-mix(in srgb, var(--brand-primary) 25%, transparent),
                  inset 0 4px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -3px 0 rgba(0, 0, 0, 0.15)
                `,
                backdropFilter: 'blur(24px) saturate(200%)',
                WebkitBackdropFilter: 'blur(24px) saturate(200%)',
                willChange: 'transform, box-shadow',
                transform: 'translateZ(0)',
              }}
              role="img"
              aria-label={`Icône de la page ${title}`}
            >
              <SpatialIcon
                Icon={finalIcon}
                size={48}
                variant="pure"
                className="text-white relative z-10"
                style={{
                  color: finalCircuitColor,
                  filter: `drop-shadow(0 0 30px color-mix(in srgb, ${finalCircuitColor} 90%, transparent)) drop-shadow(0 0 60px color-mix(in srgb, ${finalCircuitColor} 60%, transparent))`,
                  textShadow: `0 0 40px color-mix(in srgb, ${finalCircuitColor} 80%, transparent), 0 0 80px color-mix(in srgb, var(--brand-primary) 40%, transparent)`
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        {/* Titre et sous-titre alignés à gauche */}
        <div className="space-y-2 text-left flex-1 min-w-0">
          <h1
            id="page-title"
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white page-header-title"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              textShadow: isPerformanceMode
                ? '0 2px 8px rgba(0, 0, 0, 0.6)'
                : `0 0 40px color-mix(in srgb, ${finalCircuitColor} 50%, transparent)`,
              lineHeight: '1.2'
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed page-header-subtitle"
              style={{
                color: `color-mix(in srgb, #E5E7EB 90%, ${finalCircuitColor} 10%)`,
                textShadow: isPerformanceMode
                  ? '0 1px 4px rgba(0, 0, 0, 0.5)'
                  : '0 0 20px rgba(0, 0, 0, 0.5)',
                lineHeight: '1.4'
              }}
              aria-describedby="page-title"
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="mt-3 md:mt-4 flex justify-center" role="group" aria-label="Actions de la page">
          {actions}
        </div>
      )}
    </header>
  );
}