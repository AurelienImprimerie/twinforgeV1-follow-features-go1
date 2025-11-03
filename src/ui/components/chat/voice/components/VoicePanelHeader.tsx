/**
 * Voice Panel Header Component
 * Header with mode indicator, controls, and environment warnings
 */

import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../icons/SpatialIcon';
import { ICONS } from '../../../../icons/registry';

interface VoicePanelHeaderProps {
  isPanelMinimized: boolean;
  modeColor: string;
  modeIcon: string;
  modeName: string;
  voiceState: string;
  isTextMode: boolean;
  isTextProcessing: boolean;
  showTranscript: boolean;
  canUseVoiceMode: boolean;
  isStackBlitz: boolean;
  environmentName: string;
  onToggleCommunicationMode: () => void;
  onToggleTranscript: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const VoicePanelHeader: React.FC<VoicePanelHeaderProps> = ({
  isPanelMinimized,
  modeColor,
  modeIcon,
  modeName,
  voiceState,
  isTextMode,
  isTextProcessing,
  showTranscript,
  canUseVoiceMode,
  isStackBlitz,
  environmentName,
  onToggleCommunicationMode,
  onToggleTranscript,
  onMinimize,
  onMaximize,
  onClose
}) => {
  const getStatusText = () => {
    if (isTextMode) {
      return isTextProcessing ? 'Traitement...' : 'Mode texte';
    }
    switch (voiceState) {
      case 'listening': return 'En écoute...';
      case 'speaking': return 'En train de parler...';
      case 'processing': return 'Traitement...';
      case 'error': return 'Erreur de connexion';
      default: return 'Prêt à écouter';
    }
  };

  return (
    <>
      {isStackBlitz && !isPanelMinimized && (
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(251, 191, 36, 0.15)',
            borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <SpatialIcon Icon={ICONS.AlertTriangle} size={14} style={{ color: '#fbbf24' }} />
          <p style={{ fontSize: '11px', color: '#fbbf24', margin: 0 }}>
            Mode vocal indisponible en {environmentName}
          </p>
        </div>
      )}

      <div
        className="voice-panel-header"
        style={{
          padding: isPanelMinimized ? '12px' : '16px 20px',
          borderBottom: `1px solid color-mix(in srgb, ${modeColor} 20%, transparent)`,
          background: `
            linear-gradient(180deg,
              rgba(11, 14, 23, 0.6) 0%,
              rgba(11, 14, 23, 0.3) 100%
            )
          `,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexShrink: 0
        }}
      >
        {!isPanelMinimized && (
          <div className="flex items-center gap-3">
            <div
              className="mode-icon-container"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `
                  radial-gradient(circle at 30% 30%, color-mix(in srgb, ${modeColor} 30%, transparent), transparent 70%),
                  rgba(255, 255, 255, 0.1)
                `,
                border: `2px solid color-mix(in srgb, ${modeColor} 40%, transparent)`,
                boxShadow: `0 0 20px color-mix(in srgb, ${modeColor} 25%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SpatialIcon
                Icon={ICONS[modeIcon as keyof typeof ICONS] || ICONS.MessageSquare}
                size={20}
                style={{ color: modeColor }}
              />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{modeName}</h3>
              <p className="text-white/60 text-xs">{getStatusText()}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isPanelMinimized && (
            <motion.button
              onClick={onToggleCommunicationMode}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isTextMode ? `rgba(255, 255, 255, 0.15)` : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: !canUseVoiceMode && !isTextMode ? 0.5 : 1
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={
                !canUseVoiceMode && !isTextMode
                  ? 'Mode vocal indisponible dans cet environnement'
                  : isTextMode
                  ? 'Passer en mode vocal'
                  : 'Passer en mode texte'
              }
            >
              <SpatialIcon
                Icon={isTextMode ? ICONS.Mic : ICONS.MessageSquare}
                size={16}
                style={{
                  color: isTextMode ? modeColor : 'rgba(255, 255, 255, 0.7)',
                  filter: isTextMode ? `drop-shadow(0 0 8px ${modeColor})` : 'none'
                }}
              />
            </motion.button>
          )}

          {!isPanelMinimized && !isTextMode && (
            <motion.button
              onClick={onToggleTranscript}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: showTranscript ? `rgba(255, 255, 255, 0.15)` : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Afficher/masquer la transcription"
            >
              <SpatialIcon
                Icon={ICONS.FileText}
                size={16}
                style={{
                  color: showTranscript ? modeColor : 'rgba(255, 255, 255, 0.7)',
                  filter: showTranscript ? `drop-shadow(0 0 8px ${modeColor})` : 'none'
                }}
              />
            </motion.button>
          )}

          <motion.button
            onClick={isPanelMinimized ? onMaximize : onMinimize}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isPanelMinimized ? 'Agrandir' : 'Réduire'}
          >
            <SpatialIcon
              Icon={isPanelMinimized ? ICONS.Maximize2 : ICONS.Minimize2}
              size={16}
              className="text-white/70"
            />
          </motion.button>

          <motion.button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Fermer"
          >
            <SpatialIcon Icon={ICONS.X} size={18} className="text-white/70" />
          </motion.button>
        </div>
      </div>
    </>
  );
};
