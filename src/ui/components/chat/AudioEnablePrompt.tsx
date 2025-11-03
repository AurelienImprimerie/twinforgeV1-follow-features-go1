/**
 * Audio Enable Prompt
 * Composant pour demander à l'utilisateur d'activer l'audio quand l'autoplay est bloqué
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { openaiRealtimeService } from '../../../system/services/openai-realtime/openaiRealtimeService';
import logger from '../../../lib/utils/logger';

interface AudioEnablePromptProps {
  onAudioEnabled?: () => void;
  onDismiss?: () => void;
  color?: string;
}

const AudioEnablePrompt: React.FC<AudioEnablePromptProps> = ({
  onAudioEnabled,
  onDismiss,
  color = '#3b82f6'
}) => {
  const handleEnableAudio = async () => {
    logger.info('AUDIO_ENABLE_PROMPT', 'User clicked to enable audio');

    const success = await openaiRealtimeService.enableAudioPlayback();

    if (success) {
      logger.info('AUDIO_ENABLE_PROMPT', '✅ Audio enabled successfully');
      onAudioEnabled?.();
    } else {
      logger.error('AUDIO_ENABLE_PROMPT', '❌ Failed to enable audio');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '16px',
        margin: '12px',
        borderRadius: '16px',
        background: `
          linear-gradient(135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 51, 234, 0.05) 100%
          )
        `,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, color-mix(in srgb, ${color} 30%, transparent), transparent 70%), rgba(255, 255, 255, 0.1)`,
          border: `2px solid color-mix(in srgb, ${color} 40%, transparent)`,
          boxShadow: `0 0 20px color-mix(in srgb, ${color} 25%, transparent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <SpatialIcon Icon={ICONS.Volume2} size={24} style={{ color }} />
      </div>

      {/* Message */}
      <div>
        <h4
          className="text-white font-semibold text-sm mb-1"
          style={{ margin: 0 }}
        >
          Activer l'audio
        </h4>
        <p
          className="text-white/70 text-xs"
          style={{ margin: 0, lineHeight: '1.4' }}
        >
          Le navigateur a bloqué la lecture audio automatique.
          <br />
          Cliquez ci-dessous pour entendre le coach.
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <motion.button
          onClick={handleEnableAudio}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color} 80%, #000) 100%)`,
            border: 'none',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 4px 12px color-mix(in srgb, ${color} 30%, transparent)`
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SpatialIcon Icon={ICONS.Volume2} size={16} />
          Activer l'audio
        </motion.button>

        {onDismiss && (
          <motion.button
            onClick={onDismiss}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SpatialIcon Icon={ICONS.X} size={16} />
          </motion.button>
        )}
      </div>

      {/* Info */}
      <p
        className="text-white/50 text-xs"
        style={{ margin: 0, fontSize: '10px' }}
      >
        💡 Les navigateurs requièrent une interaction pour l'audio
      </p>
    </motion.div>
  );
};

export default AudioEnablePrompt;
