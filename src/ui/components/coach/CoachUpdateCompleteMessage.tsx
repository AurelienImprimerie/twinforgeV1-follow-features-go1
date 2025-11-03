/**
 * Coach Update Complete Message
 * Message de succès avec CTA pour voir l'exercice mis à jour
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';

interface CoachUpdateCompleteMessageProps {
  exerciseName: string;
  newParameters: {
    sets?: number;
    reps?: number;
    load?: string;
    tempo?: string;
    rest?: string;
  };
  onViewExercise: () => void;
  onContinue: () => void;
  stepColor: string;
}

const CoachUpdateCompleteMessage: React.FC<CoachUpdateCompleteMessageProps> = ({
  exerciseName,
  newParameters,
  onViewExercise,
  onContinue,
  stepColor
}) => {
  const getParametersText = () => {
    const parts: string[] = [];
    if (newParameters.sets) parts.push(`${newParameters.sets} séries`);
    if (newParameters.reps) parts.push(`${newParameters.reps} reps`);
    if (newParameters.load) parts.push(newParameters.load);
    if (newParameters.rest) parts.push(`${newParameters.rest} repos`);
    if (newParameters.tempo) parts.push(`tempo ${newParameters.tempo}`);

    return parts.length > 0 ? parts.join(' • ') : 'Paramètres mis à jour';
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex items-start gap-3"
      >
        <div
          className="p-2.5 rounded-full flex-shrink-0"
          style={{
            background: `
              linear-gradient(135deg, #10B981 0%, #059669 100%)
            `,
            boxShadow: `
              0 4px 12px rgba(16, 185, 129, 0.3),
              0 0 20px rgba(16, 185, 129, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.25)
            `
          }}
        >
          <SpatialIcon
            Icon={ICONS.CheckCircle2}
            size={24}
            style={{
              color: 'white',
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
            }}
          />
        </div>
        <div className="flex-1">
          <div className="text-white font-bold text-[16px] mb-1">
            Modification appliquée ! ✓
          </div>
          <div className="text-white/70 text-[14px] leading-relaxed">
            <strong className="text-white">{exerciseName}</strong> a été mis à jour
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="parameters-preview"
        style={{
          padding: '14px 16px',
          background: `
            radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 70%),
            rgba(255, 255, 255, 0.06)
          `,
          border: '1.5px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          boxShadow: `
            0 2px 8px rgba(0, 0, 0, 0.15),
            0 0 16px rgba(16, 185, 129, 0.1)
          `
        }}
      >
        <div className="text-[12px] text-emerald-400 font-bold uppercase tracking-wide mb-1">
          Nouveaux paramètres
        </div>
        <div className="text-white text-[13px] font-medium">
          {getParametersText()}
        </div>
      </motion.div>

      <p className="text-white/80 text-[14px] leading-relaxed">
        Regarde la carte mise à jour ou continue tes ajustements ! 💪
      </p>

      <div className="flex gap-3">
        <motion.button
          onClick={onViewExercise}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            padding: '14px 20px',
            background: `
              radial-gradient(circle at 30% 30%, color-mix(in srgb, ${stepColor} 18%, transparent) 0%, transparent 70%),
              rgba(255, 255, 255, 0.1)
            `,
            border: `1.5px solid color-mix(in srgb, ${stepColor} 35%, transparent)`,
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: `
              0 2px 10px rgba(0, 0, 0, 0.15),
              0 0 18px color-mix(in srgb, ${stepColor} 15%, transparent)
            `,
            backdropFilter: 'blur(12px)'
          }}
        >
          <SpatialIcon
            Icon={ICONS.Eye}
            size={18}
            style={{
              color: stepColor,
              filter: `drop-shadow(0 0 6px color-mix(in srgb, ${stepColor} 45%, transparent))`
            }}
          />
          <span style={{ color: stepColor, textShadow: `0 0 8px color-mix(in srgb, ${stepColor} 30%, transparent)` }}>
            Voir l'exercice
          </span>
        </motion.button>

        <motion.button
          onClick={onContinue}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2"
          style={{
            padding: '14px 20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '14px',
            color: 'white',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <SpatialIcon
            Icon={ICONS.ArrowRight}
            size={18}
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }}
          />
          Continuer
        </motion.button>
      </div>
    </div>
  );
};

export default CoachUpdateCompleteMessage;
