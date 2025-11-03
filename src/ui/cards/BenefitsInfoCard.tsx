import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';

export interface Benefit {
  id: string;
  icon: keyof typeof ICONS;
  color: string;
  title: string;
  description: string;
}

interface BenefitsInfoCardProps {
  benefits: Benefit[];
  themeColor: string;
  title?: string;
  className?: string;
}

const BenefitsInfoCard: React.FC<BenefitsInfoCardProps> = ({
  benefits,
  themeColor,
  title = "Pourquoi utiliser cette fonctionnalité ?",
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <GlassCard
        className="p-4"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${themeColor} 6%, transparent) 0%, transparent 60%),
            var(--glass-opacity-base)
          `,
          borderColor: `color-mix(in srgb, ${themeColor} 20%, transparent)`,
          boxShadow: `
            var(--glass-shadow-sm),
            0 0 12px color-mix(in srgb, ${themeColor} 8%, transparent)
          `
        }}
      >
        {/* Title with Glow Icon */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center breathing-icon"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, ${themeColor} 40%, transparent), color-mix(in srgb, ${themeColor} 30%, transparent))
              `,
              border: `2px solid color-mix(in srgb, ${themeColor} 60%, transparent)`,
              boxShadow: `
                0 0 20px color-mix(in srgb, ${themeColor} 50%, transparent),
                inset 0 2px 0 rgba(255,255,255,0.3)
              `
            }}
          >
            <SpatialIcon Icon={ICONS.Info} size={14} style={{ color: themeColor }} variant="pure" />
          </div>
          <h4 className="text-white/90 font-medium text-sm">{title}</h4>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              className="benefit-card"
              style={{
                background: `color-mix(in srgb, ${benefit.color} 6%, transparent)`,
                border: `1px solid color-mix(in srgb, ${benefit.color} 15%, transparent)`,
                borderRadius: '12px',
                padding: '12px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
              whileHover={{
                y: -2,
                borderColor: `color-mix(in srgb, ${benefit.color} 30%, transparent)`,
                background: `color-mix(in srgb, ${benefit.color} 10%, transparent)`
              }}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center mb-2"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, ${benefit.color} 25%, transparent), color-mix(in srgb, ${benefit.color} 15%, transparent))
                  `,
                  border: `1px solid color-mix(in srgb, ${benefit.color} 30%, transparent)`,
                  boxShadow: `0 0 12px color-mix(in srgb, ${benefit.color} 20%, transparent)`
                }}
              >
                <SpatialIcon
                  Icon={ICONS[benefit.icon]}
                  size={16}
                  style={{ color: benefit.color }}
                  variant="pure"
                />
              </div>

              {/* Title */}
              <div className="text-white font-semibold text-sm mb-1">
                {benefit.title}
              </div>

              {/* Description */}
              <div className="text-white/70 text-xs leading-relaxed">
                {benefit.description}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default BenefitsInfoCard;
