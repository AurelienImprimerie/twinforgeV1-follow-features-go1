/**
 * Coach Option Selection Message
 * Affiche les options d'ajustement spécifiques à une catégorie
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import {
  EXERCISE_ADJUSTMENT_BUTTONS,
  type ExerciseAdjustmentCategory
} from '../../../config/exerciseAdjustmentConfig';

interface CoachOptionSelectionMessageProps {
  exerciseName: string;
  category: ExerciseAdjustmentCategory;
  onOptionSelect: (optionId: string) => void;
  onBack: () => void;
  stepColor: string;
}

const CoachOptionSelectionMessage: React.FC<CoachOptionSelectionMessageProps> = ({
  exerciseName,
  category,
  onOptionSelect,
  onBack,
  stepColor
}) => {
  const options = EXERCISE_ADJUSTMENT_BUTTONS.filter(btn => btn.category === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <motion.button
          onClick={onBack}
          className="back-button p-2 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <SpatialIcon Icon={ICONS.ArrowLeft} size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />
        </motion.button>
        <p className="text-white/90 text-[15px] leading-relaxed flex-1">
          Comment veux-tu ajuster <strong className="text-white font-semibold">{exerciseName}</strong> ?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          const Icon = ICONS[option.icon as keyof typeof ICONS];
          return (
            <motion.button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className="option-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '14px',
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, ${option.color} 10%, transparent) 0%, transparent 70%),
                  rgba(255, 255, 255, 0.06)
                `,
                border: `1.5px solid color-mix(in srgb, ${option.color} 25%, transparent)`,
                borderRadius: '14px',
                backdropFilter: 'blur(12px)',
                boxShadow: `
                  0 2px 8px rgba(0, 0, 0, 0.12),
                  0 0 12px color-mix(in srgb, ${option.color} 8%, transparent)
                `,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {Icon && (
                  <div
                    className="icon-container w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, color-mix(in srgb, ${option.color} 25%, transparent) 0%, transparent 70%),
                        color-mix(in srgb, ${option.color} 15%, rgba(255, 255, 255, 0.08))
                      `,
                      border: `1px solid color-mix(in srgb, ${option.color} 35%, transparent)`,
                      boxShadow: `0 0 10px color-mix(in srgb, ${option.color} 20%, transparent)`
                    }}
                  >
                    <SpatialIcon
                      Icon={Icon}
                      size={14}
                      style={{
                        color: option.color,
                        filter: `drop-shadow(0 0 6px color-mix(in srgb, ${option.color} 45%, transparent))`
                      }}
                    />
                  </div>
                )}
                <span
                  className="font-bold text-[13px]"
                  style={{
                    color: option.color,
                    textShadow: `0 0 8px color-mix(in srgb, ${option.color} 25%, transparent)`
                  }}
                >
                  {option.label}
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-tight line-clamp-2 ml-9">
                {option.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CoachOptionSelectionMessage;
