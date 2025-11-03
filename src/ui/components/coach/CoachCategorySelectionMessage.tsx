/**
 * Coach Category Selection Message
 * Affiche les catégories d'ajustement cliquables
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { ADJUSTMENT_CATEGORIES, type ExerciseAdjustmentCategory } from '../../../config/exerciseAdjustmentConfig';

interface CoachCategorySelectionMessageProps {
  exerciseName: string;
  onCategorySelect: (category: ExerciseAdjustmentCategory) => void;
  stepColor: string;
}

const CoachCategorySelectionMessage: React.FC<CoachCategorySelectionMessageProps> = ({
  exerciseName,
  onCategorySelect,
  stepColor
}) => {
  return (
    <div className="space-y-4">
      <p className="text-white/90 text-[15px] leading-relaxed">
        Super ! Qu'est-ce que tu veux ajuster sur <strong className="text-white font-semibold">{exerciseName}</strong> ?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ADJUSTMENT_CATEGORIES.map((category, index) => {
          const Icon = ICONS[category.icon as keyof typeof ICONS];
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategorySelect(category.id as ExerciseAdjustmentCategory)}
              className="category-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '16px',
                background: `
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, ${category.color} 12%, transparent) 0%, transparent 70%),
                  rgba(255, 255, 255, 0.06)
                `,
                border: `1.5px solid color-mix(in srgb, ${category.color} 30%, transparent)`,
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                boxShadow: `
                  0 2px 8px rgba(0, 0, 0, 0.15),
                  0 0 16px color-mix(in srgb, ${category.color} 10%, transparent)
                `,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                style={{
                  background: `radial-gradient(circle at center, color-mix(in srgb, ${category.color} 20%, transparent) 0%, transparent 70%)`
                }}
              />

              <div className="relative flex items-start gap-3">
                <div
                  className="p-2 rounded-xl flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${category.color} 20%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${category.color} 35%, transparent)`,
                    boxShadow: `0 0 12px color-mix(in srgb, ${category.color} 15%, transparent)`
                  }}
                >
                  {Icon && (
                    <SpatialIcon
                      Icon={Icon}
                      size={20}
                      style={{
                        color: category.color,
                        filter: `drop-shadow(0 0 6px color-mix(in srgb, ${category.color} 40%, transparent))`
                      }}
                    />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <div
                    className="font-semibold text-[14px] mb-1"
                    style={{
                      color: category.color,
                      textShadow: `0 0 8px color-mix(in srgb, ${category.color} 25%, transparent)`
                    }}
                  >
                    {category.label}
                  </div>
                  <div className="text-white/60 text-[12px] leading-tight">
                    {category.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CoachCategorySelectionMessage;
