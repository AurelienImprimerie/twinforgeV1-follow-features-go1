/**
 * Feedback Panel
 * Predefined feedback buttons for quick coach interaction
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { FEEDBACK_BUTTONS, FEEDBACK_CATEGORIES } from '../../../config/feedbackButtonsConfig';
import type { FeedbackCategory } from '../../../domain/coachChat';
import { useFeedback } from '../../../hooks/useFeedback';
import { Haptics } from '../../../utils/haptics';

interface FeedbackPanelProps {
  onFeedbackSelect: (category: FeedbackCategory, message: string) => void;
  stepColor: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  onFeedbackSelect,
  stepColor,
  isExpanded = true,
  onToggleExpand
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { click } = useFeedback();

  const handleFeedbackClick = (button: typeof FEEDBACK_BUTTONS[0]) => {
    onFeedbackSelect(button.id, button.message);
    click();
    Haptics.press();

    setTimeout(() => {
      if (onToggleExpand) {
        onToggleExpand();
      }
    }, 300);
  };

  const filteredButtons = selectedCategory
    ? FEEDBACK_BUTTONS.filter(b => b.category === selectedCategory)
    : FEEDBACK_BUTTONS;

  return (
    <div className="feedback-panel">
      {/* Toggle Button (if collapsible) */}
      {onToggleExpand && (
        <motion.button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between p-3 rounded-xl mb-2"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid color-mix(in srgb, ${stepColor} 20%, transparent)`
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.MessageSquare} size={18} style={{ color: stepColor }} />
            <span className="text-sm font-medium text-white">Feedback Rapide</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <SpatialIcon Icon={ICONS.ChevronDown} size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </motion.div>
        </motion.button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Category Filter */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 hide-scrollbar">
              <motion.button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
                style={{
                  background: !selectedCategory
                    ? `color-mix(in srgb, ${stepColor} 20%, transparent)`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: !selectedCategory
                    ? `1px solid color-mix(in srgb, ${stepColor} 40%, transparent)`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: !selectedCategory ? stepColor : 'rgba(255,255,255,0.7)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Tout
              </motion.button>

              {FEEDBACK_CATEGORIES.map((cat) => {
                const Icon = ICONS[cat.icon as keyof typeof ICONS];
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
                    style={{
                      background: selectedCategory === cat.id
                        ? `color-mix(in srgb, ${cat.color} 20%, transparent)`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedCategory === cat.id
                        ? `1px solid color-mix(in srgb, ${cat.color} 40%, transparent)`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      color: selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.7)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {Icon && <SpatialIcon Icon={Icon} size={12} />}
                    {cat.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback Buttons Grid */}
            <motion.div
              className="grid grid-cols-2 gap-2"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredButtons.map((button) => {
                  const Icon = ICONS[button.icon as keyof typeof ICONS];
                  return (
                    <motion.button
                      key={button.id}
                      onClick={() => handleFeedbackClick(button)}
                      className="p-3 rounded-xl text-left"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 30%, color-mix(in srgb, ${button.color} 12%, transparent) 0%, transparent 70%),
                          rgba(255, 255, 255, 0.06)
                        `,
                        border: `1px solid color-mix(in srgb, ${button.color} 25%, transparent)`,
                        boxShadow: `
                          0 2px 8px rgba(0, 0, 0, 0.15),
                          0 0 16px color-mix(in srgb, ${button.color} 10%, transparent),
                          inset 0 1px 0 rgba(255, 255, 255, 0.08)
                        `
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: `
                          0 4px 12px rgba(0, 0, 0, 0.2),
                          0 0 24px color-mix(in srgb, ${button.color} 20%, transparent),
                          inset 0 1px 0 rgba(255, 255, 255, 0.12)
                        `
                      }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {Icon && (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                              background: `color-mix(in srgb, ${button.color} 20%, transparent)`,
                              border: `1px solid color-mix(in srgb, ${button.color} 40%, transparent)`
                            }}
                          >
                            <SpatialIcon
                              Icon={Icon}
                              size={12}
                              style={{
                                color: button.color,
                                filter: `drop-shadow(0 0 6px color-mix(in srgb, ${button.color} 50%, transparent))`
                              }}
                            />
                          </div>
                        )}
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: button.color,
                            textShadow: `0 0 8px color-mix(in srgb, ${button.color} 30%, transparent)`
                          }}
                        >
                          {button.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 leading-tight line-clamp-2">
                        {button.message}
                      </p>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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

export default FeedbackPanel;
