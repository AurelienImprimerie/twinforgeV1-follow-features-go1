/**
 * RatingSlider Component
 * Visual slider for 1-10 rating scales with tactile feedback
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface RatingSliderProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  helperText?: string;
  lowLabel?: string;
  highLabel?: string;
  color?: string;
  disabled?: boolean;
}

export const RatingSlider: React.FC<RatingSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  helperText,
  lowLabel,
  highLabel,
  color = '#06B6D4',
  disabled = false,
}) => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const currentValue = value || 0;
  const displayValue = hoveredValue !== null ? hoveredValue : currentValue;

  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  const getColorForValue = (val: number): string => {
    if (val === 0) return 'rgba(255, 255, 255, 0.1)';

    const ratio = (val - min) / (max - min);

    if (ratio < 0.3) return 'rgba(239, 68, 68, 0.8)'; // Red
    if (ratio < 0.5) return 'rgba(249, 115, 22, 0.8)'; // Orange
    if (ratio < 0.7) return 'rgba(234, 179, 8, 0.8)'; // Yellow
    return 'rgba(34, 197, 94, 0.8)'; // Green
  };

  const handleClick = (newValue: number) => {
    if (!disabled) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-white/90 text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Value display */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/60 text-xs">{lowLabel || 'Faible'}</span>
          <motion.div
            className="px-4 py-2 rounded-xl font-bold text-lg"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                ${getColorForValue(displayValue)}
              `,
              border: `2px solid ${getColorForValue(displayValue)}`,
              boxShadow: `0 0 20px ${getColorForValue(displayValue)}`,
            }}
            animate={{
              scale: displayValue > 0 ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white">{displayValue > 0 ? displayValue : '-'}</span>
          </motion.div>
          <span className="text-white/60 text-xs">{highLabel || 'Élevé'}</span>
        </div>

        {/* Interactive slider */}
        <div className="relative">
          {/* Background bar */}
          <div
            className="w-full h-12 rounded-full relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Progress fill */}
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${getColorForValue(currentValue)}, ${getColorForValue(currentValue)}80)`,
                boxShadow: `0 0 15px ${getColorForValue(currentValue)}`,
              }}
              initial={{ width: 0 }}
              animate={{
                width: currentValue > 0 ? `${((currentValue - min) / (max - min)) * 100}%` : '0%',
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />

            {/* Interactive segments */}
            <div className="absolute inset-0 flex">
              {steps.map((step) => {
                const isActive = step <= currentValue;
                const isHovered = hoveredValue === step;

                return (
                  <motion.button
                    key={step}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleClick(step)}
                    onMouseEnter={() => setHoveredValue(step)}
                    onMouseLeave={() => setHoveredValue(null)}
                    className="flex-1 relative flex items-center justify-center cursor-pointer group"
                    whileTap={{ scale: disabled ? 1 : 0.95 }}
                  >
                    {/* Divider */}
                    {step !== max && (
                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    )}

                    {/* Number label */}
                    <motion.span
                      className="text-xs font-medium relative z-10"
                      style={{
                        color: isActive || isHovered ? 'white' : 'rgba(255, 255, 255, 0.3)',
                      }}
                      animate={{
                        scale: isHovered ? 1.3 : 1,
                        y: isHovered ? -2 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {step}
                    </motion.span>

                    {/* Hover effect */}
                    {isHovered && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {helperText && (
        <p className="text-white/50 text-xs">
          {helperText}
        </p>
      )}
    </div>
  );
};
