/**
 * Coach Message Component
 * Individual message bubble in coach chat
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { useGlobalChatStore } from '../../../system/store/globalChatStore';
import type { ChatMessage } from '../../../domain/coachChat';

interface CTAButton {
  id: string;
  label: string;
  icon?: keyof typeof ICONS;
  variant?: 'primary' | 'secondary';
}

interface CoachMessageProps {
  message: ChatMessage;
  stepColor: string;
  showCTA?: boolean;
  ctaButtons?: CTAButton[];
  onCTAClick?: (buttonId: string) => void;
}

const CoachMessage: React.FC<CoachMessageProps> = ({
  message,
  stepColor,
  showCTA = false,
  ctaButtons = [],
  onCTAClick
}) => {
  const { currentMode } = useGlobalChatStore();
  const isTrainingMode = currentMode === 'training';
  const isCoach = message.role === 'coach';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-4"
      >
        <div className="system-message px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 flex items-center gap-2">
          <SpatialIcon Icon={ICONS.Info} size={12} />
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isCoach ? -10 : 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isCoach ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div className={`flex flex-col gap-2 ${isCoach ? 'items-start' : 'items-end'} max-w-[85%]`}>
        {/* Message Row: Avatar + Bubble */}
        <div className={`flex ${isCoach ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
          {/* Avatar */}
          {isCoach && (
            <div
              className="message-avatar w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 40%, transparent) 0%, transparent 70%),
                  rgba(255, 255, 255, 0.1)
                `,
                border: `1.5px solid color-mix(in srgb, ${stepColor} 50%, transparent)`,
                boxShadow: `0 0 12px color-mix(in srgb, ${stepColor} 30%, transparent)`
              }}
            >
              <SpatialIcon
                Icon={ICONS.Zap}
                size={16}
                style={{
                  color: stepColor,
                  filter: `drop-shadow(0 0 8px color-mix(in srgb, ${stepColor} 60%, transparent))`
                }}
              />
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`coach-message-bubble ${isCoach ? 'coach-message-bubble--coach' : 'coach-message-bubble--user'} ${isCoach ? 'px-4' : 'px-5'} py-3 rounded-2xl relative`}
            style={{
              background: isCoach
                ? `
                    radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 15%, transparent) 0%, transparent 70%),
                    rgba(255, 255, 255, 0.08)
                  `
                : 'rgba(255, 255, 255, 0.12)',
              border: isCoach
                ? `1px solid color-mix(in srgb, ${stepColor} 25%, transparent)`
                : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isCoach
                ? `
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    0 0 16px color-mix(in srgb, ${stepColor} 15%, transparent),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `
                : `
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15)
                  `,
              backdropFilter: 'blur(12px) saturate(140%)',
              WebkitBackdropFilter: 'blur(12px) saturate(140%)',
              borderRadius: isCoach ? '4px 16px 16px 16px' : '16px 4px 16px 16px'
            }}
          >
            <p className="message-content-text text-sm text-white leading-relaxed" style={{
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              hyphens: 'none',
              WebkitHyphens: 'none',
              MozHyphens: 'none',
              msHyphens: 'none'
            }}>
              {message.content}
            </p>

            {/* Audio indicator if present */}
            {message.type === 'audio' && (
              <div className="audio-message-indicator flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                <SpatialIcon Icon={ICONS.Volume2} size={12} style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-xs text-white/60">Message vocal</span>
              </div>
            )}

            {/* Timestamp */}
            <div className={`message-timestamp text-[10px] text-white/40 mt-1 ${isCoach ? 'text-left' : 'text-right'}`}>
              {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* CTA Buttons for Coach Messages in Training Mode - Below the bubble, aligned left */}
        {isCoach && showCTA && isTrainingMode && ctaButtons.length > 0 && (
          <div className="flex flex-col gap-2 pl-10 self-stretch">
            {ctaButtons.map((button, index) => {
              const Icon = button.icon ? ICONS[button.icon] : null;
              const isPrimary = button.variant === 'primary';

              return (
                <motion.button
                  key={button.id}
                  onClick={() => onCTAClick?.(button.id)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 400, damping: 17 }}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: isPrimary
                      ? `
                          radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 25%, transparent) 0%, transparent 70%),
                          color-mix(in srgb, ${stepColor} 18%, rgba(255, 255, 255, 0.08))
                        `
                      : `
                          radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%),
                          rgba(255, 255, 255, 0.05)
                        `,
                    border: isPrimary
                      ? `1.5px solid color-mix(in srgb, ${stepColor} 35%, transparent)`
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isPrimary
                      ? `
                          0 2px 12px color-mix(in srgb, ${stepColor} 20%, transparent),
                          inset 0 1px 0 rgba(255, 255, 255, 0.12)
                        `
                      : 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                    color: isPrimary ? stepColor : 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  {Icon && (
                    <SpatialIcon
                      Icon={Icon}
                      size={14}
                      style={{
                        color: isPrimary ? stepColor : 'rgba(255, 255, 255, 0.8)',
                        filter: isPrimary
                          ? `drop-shadow(0 0 8px color-mix(in srgb, ${stepColor} 50%, transparent))`
                          : 'none'
                      }}
                    />
                  )}
                  <span>{button.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CoachMessage;
