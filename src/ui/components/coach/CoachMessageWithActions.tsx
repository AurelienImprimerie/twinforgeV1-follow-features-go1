/**
 * Coach Message With Actions
 * Interactive coach message with CTA buttons
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { useFeedback } from '../../../hooks/useFeedback';
import { Haptics } from '../../../utils/haptics';

export interface CTAButton {
  id: string;
  label: string;
  icon?: string;
  color: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger';
}

interface CoachMessageWithActionsProps {
  message: string;
  buttons: CTAButton[];
  onButtonClick: (buttonId: string) => void;
  stepColor: string;
  className?: string;
}

const CoachMessageWithActions: React.FC<CoachMessageWithActionsProps> = ({
  message,
  buttons,
  onButtonClick,
  stepColor,
  className = ''
}) => {
  const { click } = useFeedback();

  const handleClick = (buttonId: string) => {
    click();
    Haptics.tap();
    onButtonClick(buttonId);
  };

  const getVariantStyles = (button: CTAButton) => {
    switch (button.variant) {
      case 'primary':
        return {
          background: `
            radial-gradient(circle at 30% 30%, color-mix(in srgb, ${button.color} 25%, transparent) 0%, transparent 70%),
            color-mix(in srgb, ${button.color} 18%, rgba(255, 255, 255, 0.08))
          `,
          border: `1.5px solid color-mix(in srgb, ${button.color} 40%, transparent)`,
          color: button.color,
          boxShadow: `
            0 2px 12px color-mix(in srgb, ${button.color} 20%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        };
      case 'success':
        return {
          background: `
            radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.25) 0%, transparent 70%),
            rgba(34, 197, 94, 0.15)
          `,
          border: '1.5px solid rgba(34, 197, 94, 0.4)',
          color: '#22C55E',
          boxShadow: `
            0 2px 12px rgba(34, 197, 94, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        };
      case 'danger':
        return {
          background: `
            radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.25) 0%, transparent 70%),
            rgba(239, 68, 68, 0.15)
          `,
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          color: '#EF4444',
          boxShadow: `
            0 2px 12px rgba(239, 68, 68, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        };
      case 'secondary':
      default:
        return {
          background: `
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
            rgba(255, 255, 255, 0.05)
          `,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: 'rgba(255, 255, 255, 0.9)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
        };
    }
  };

  return (
    <div className={`coach-message-with-actions ${className}`}>
      {/* Message */}
      <div
        className="p-4 rounded-2xl mb-3"
        style={{
          background: `
            radial-gradient(ellipse at 20% 10%, color-mix(in srgb, ${stepColor} 10%, transparent) 0%, transparent 50%),
            rgba(255, 255, 255, 0.06)
          `,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <p className="text-sm text-white leading-relaxed">{message}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {buttons.map((button, index) => {
          const Icon = button.icon ? ICONS[button.icon as keyof typeof ICONS] : null;
          const variantStyles = getVariantStyles(button);

          return (
            <motion.button
              key={button.id}
              onClick={() => handleClick(button.id)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm"
              style={{
                ...variantStyles,
                backdropFilter: 'blur(10px)'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 400,
                damping: 17
              }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {Icon && (
                <SpatialIcon
                  Icon={Icon}
                  size={16}
                  style={{
                    color: variantStyles.color,
                    filter: button.variant === 'primary'
                      ? `drop-shadow(0 0 8px color-mix(in srgb, ${button.color} 50%, transparent))`
                      : 'none'
                  }}
                />
              )}
              <span>{button.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CoachMessageWithActions;
