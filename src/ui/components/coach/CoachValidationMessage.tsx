/**
 * Coach Validation Message
 * Message de confirmation avec preview de l'ajustement
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

interface CoachValidationMessageProps {
  exerciseName: string;
  adjustmentLabel: string;
  summary: string;
  onValidate: () => void;
  onModify: () => void;
  stepColor: string;
}

const CoachValidationMessage: React.FC<CoachValidationMessageProps> = ({
  exerciseName,
  adjustmentLabel,
  summary,
  onValidate,
  onModify,
  stepColor
}) => {
  return (
    <div className="space-y-4">
      <p className="text-white/90 text-[15px] leading-relaxed">
        Voici ce que je vais appliquer à <strong className="text-white font-semibold">{exerciseName}</strong> :
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="preview-box"
        style={{
          padding: '18px',
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, ${stepColor} 12%, transparent) 0%, transparent 70%),
            rgba(255, 255, 255, 0.08)
          `,
          border: `1.5px solid color-mix(in srgb, ${stepColor} 30%, transparent)`,
          borderRadius: '16px',
          backdropFilter: 'blur(14px)',
          boxShadow: `
            0 2px 12px rgba(0, 0, 0, 0.2),
            0 0 20px color-mix(in srgb, ${stepColor} 12%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        }}
      >
        <div
          className="text-[13px] mb-2 uppercase tracking-wide font-bold"
          style={{
            color: stepColor,
            textShadow: `0 0 8px color-mix(in srgb, ${stepColor} 30%, transparent)`
          }}
        >
          {adjustmentLabel}
        </div>
        <div className="text-white text-[15px] font-medium leading-relaxed">
          {summary}
        </div>
      </motion.div>

      <p className="text-white/80 text-[14px]">
        Est-ce que ça te convient ? 💪
      </p>

      <div className="flex gap-3">
        <motion.button
          onClick={onValidate}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            padding: '14px 24px',
            background: `
              linear-gradient(135deg, #10B981 0%, #059669 100%)
            `,
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '14px',
            color: 'white',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: `
              0 4px 12px rgba(16, 185, 129, 0.25),
              0 0 20px rgba(16, 185, 129, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          <SpatialIcon
            Icon={ICONS.Check}
            size={18}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))'
            }}
          />
          Valider
        </motion.button>

        <motion.button
          onClick={onModify}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            padding: '14px 24px',
            background: `
              radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.15) 0%, transparent 70%),
              rgba(255, 255, 255, 0.08)
            `,
            border: '1.5px solid rgba(251, 146, 60, 0.3)',
            borderRadius: '14px',
            color: '#FB923C',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.15),
              0 0 16px rgba(251, 146, 60, 0.12)
            `,
            backdropFilter: 'blur(12px)'
          }}
        >
          <SpatialIcon
            Icon={ICONS.RefreshCw}
            size={18}
            style={{
              color: '#FB923C',
              filter: 'drop-shadow(0 0 6px rgba(251, 146, 60, 0.4))'
            }}
          />
          Modifier
        </motion.button>
      </div>
    </div>
  );
};

export default CoachValidationMessage;
