/**
 * Create3DButton Component
 * Bouton 3D avancé avec effets de profondeur et lumière spatiale
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';

interface Create3DButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: keyof typeof ICONS;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const Create3DButton: React.FC<Create3DButtonProps> = ({
  children,
  onClick,
  icon = 'Plus',
  color = '#06B6D4',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}) => {
  const Icon = ICONS[icon];

  const sizeConfig = {
    sm: { padding: 'px-4 py-2', text: 'text-sm', iconSize: 16 },
    md: { padding: 'px-6 py-3', text: 'text-base', iconSize: 18 },
    lg: { padding: 'px-8 py-4', text: 'text-lg', iconSize: 20 }
  };

  const config = sizeConfig[size];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative rounded-xl font-semibold
        ${config.padding} ${config.text}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, ${color} 45%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, ${color} 35%, transparent) 0%, transparent 50%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)
        `,
        border: `2px solid color-mix(in srgb, ${color} 60%, transparent)`,
        boxShadow: `
          0 8px 24px rgba(0, 0, 0, 0.3),
          0 0 40px color-mix(in srgb, ${color} 30%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.25),
          inset 0 -2px 8px rgba(0, 0, 0, 0.15)
        `,
        color: '#FFFFFF',
        textShadow: `0 0 20px color-mix(in srgb, ${color} 60%, transparent)`,
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        willChange: 'transform, box-shadow',
        transform: 'translateZ(0)'
      }}
      whileHover={!disabled ? {
        y: -2,
        scale: 1.01,
        boxShadow: `
          0 12px 36px rgba(0, 0, 0, 0.4),
          0 0 60px color-mix(in srgb, ${color} 40%, transparent),
          inset 0 3px 0 rgba(255, 255, 255, 0.3),
          inset 0 -3px 10px rgba(0, 0, 0, 0.2)
        `,
        transition: { duration: 0.15, ease: 'easeOut' }
      } : undefined}
      whileTap={!disabled ? {
        y: 0,
        scale: 0.98,
        boxShadow: `
          0 2px 8px rgba(0, 0, 0, 0.5),
          0 0 20px color-mix(in srgb, ${color} 20%, transparent),
          inset 0 3px 12px rgba(0, 0, 0, 0.4)
        `,
        transition: { duration: 0.1 }
      } : undefined}
    >
      <motion.div
        className="flex items-center justify-center gap-2"
        whileHover={!disabled ? { gap: '0.625rem' } : undefined}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
          }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        >
          <SpatialIcon
            Icon={Icon}
            size={config.iconSize}
          />
        </motion.div>
        <span className="relative">
          {children}
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`
            }}
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </span>
      </motion.div>
    </motion.button>
  );
};

export default Create3DButton;
