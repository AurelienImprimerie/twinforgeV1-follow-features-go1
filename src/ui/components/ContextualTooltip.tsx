/**
 * Contextual Tooltip
 * VisionOS 26 style tooltips with rich content support
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import GlassCard from '../cards/GlassCard';
import SpatialIcon from '../icons/SpatialIcon';
import { ICONS } from '../icons/registry';

interface ContextualTooltipProps {
  content: React.ReactNode;
  title?: string;
  examples?: string[];
  learnMoreUrl?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  delay?: number;
  maxWidth?: number;
}

const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  content,
  title,
  examples = [],
  learnMoreUrl,
  placement = 'top',
  children,
  delay = 300,
  maxWidth = 320,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Calculate tooltip position
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      // Keep tooltip within viewport
      const padding = 8;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

      setPosition({ top, left });
    }
  }, [isVisible, placement]);

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 10 : -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 9999,
            maxWidth,
            pointerEvents: 'none',
          }}
        >
          <GlassCard
            className="p-4 shadow-2xl"
            style={{
              background: 'rgba(20, 20, 30, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 30px rgba(255, 255, 255, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
          >
            {/* Title */}
            {title && (
              <div className="flex items-center gap-2 mb-2">
                <SpatialIcon Icon={ICONS.Info} size={16} className="text-blue-400" />
                <h4 className="text-white font-semibold text-sm">{title}</h4>
              </div>
            )}

            {/* Main content */}
            <div className="text-white/80 text-sm leading-relaxed mb-3">
              {content}
            </div>

            {/* Examples */}
            {examples.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <SpatialIcon Icon={ICONS.Lightbulb} size={14} className="text-yellow-400" />
                  <span className="text-yellow-300 text-xs font-medium">Exemples</span>
                </div>
                <ul className="space-y-1">
                  {examples.map((example, index) => (
                    <li key={index} className="text-white/70 text-xs flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learn more link */}
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors pointer-events-auto"
              >
                <span>En savoir plus</span>
                <SpatialIcon Icon={ICONS.ExternalLink} size={12} />
              </a>
            )}

            {/* Arrow indicator */}
            <div
              className="absolute w-3 h-3 bg-inherit border-inherit"
              style={{
                [placement === 'top' ? 'bottom' : placement === 'bottom' ? 'top' : placement === 'left' ? 'right' : 'left']: -6,
                [placement === 'top' || placement === 'bottom' ? 'left' : 'top']: '50%',
                transform: `translate(-50%, 0) rotate(45deg)`,
                borderWidth: placement === 'top' ? '0 1px 1px 0' : placement === 'bottom' ? '1px 0 0 1px' : placement === 'left' ? '1px 1px 0 0' : '0 0 1px 1px',
              }}
            />
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};

export default ContextualTooltip;
