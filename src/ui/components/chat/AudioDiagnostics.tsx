/**
 * Audio Diagnostics Component
 * Affiche les informations de diagnostic audio en temps réel
 * Utile pour debug et troubleshooting
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { openaiRealtimeService } from '../../../system/services/openai-realtime/openaiRealtimeService';

interface AudioDiagnosticsProps {
  color?: string;
  compact?: boolean;
}

const AudioDiagnostics: React.FC<AudioDiagnosticsProps> = ({
  color = '#10b981',
  compact = false
}) => {
  const [diagnostics, setDiagnostics] = useState(() => openaiRealtimeService.getAudioDiagnostics());
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Rafraîchir les diagnostics toutes les 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(openaiRealtimeService.getAudioDiagnostics());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isGood: boolean) => isGood ? '#10b981' : '#ef4444';
  const getStatusIcon = (isGood: boolean) => isGood ? ICONS.CheckCircle : ICONS.XCircle;

  if (compact && !isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <SpatialIcon Icon={ICONS.Activity} size={12} style={{ color }} />
        Audio Status
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        padding: '12px',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        fontSize: '11px',
        fontFamily: 'monospace'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SpatialIcon Icon={ICONS.Activity} size={14} style={{ color }} />
          <span className="text-white font-semibold" style={{ fontSize: '12px' }}>
            Audio Diagnostics
          </span>
        </div>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <SpatialIcon Icon={ICONS.Minimize2} size={12} />
          </button>
        )}
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Audio Element */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpatialIcon
            Icon={getStatusIcon(diagnostics.hasAudioElement)}
            size={12}
            style={{ color: getStatusColor(diagnostics.hasAudioElement) }}
          />
          <span className="text-white/70">Audio Element:</span>
          <span className="text-white font-semibold">
            {diagnostics.hasAudioElement ? 'Ready' : 'Missing'}
          </span>
        </div>

        {/* Playback Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpatialIcon
            Icon={getStatusIcon(diagnostics.isPlaybackStarted)}
            size={12}
            style={{ color: getStatusColor(diagnostics.isPlaybackStarted) }}
          />
          <span className="text-white/70">Playback:</span>
          <span className="text-white font-semibold">
            {diagnostics.isPlaybackStarted ? 'Started' : 'Not Started'}
          </span>
        </div>

        {/* Autoplay Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpatialIcon
            Icon={getStatusIcon(!diagnostics.isAutoplayBlocked)}
            size={12}
            style={{ color: getStatusColor(!diagnostics.isAutoplayBlocked) }}
          />
          <span className="text-white/70">Autoplay:</span>
          <span className="text-white font-semibold">
            {diagnostics.isAutoplayBlocked ? 'Blocked' : 'Allowed'}
          </span>
        </div>

        {/* Stream Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpatialIcon
            Icon={getStatusIcon(diagnostics.hasStream && diagnostics.streamActive)}
            size={12}
            style={{ color: getStatusColor(diagnostics.hasStream && diagnostics.streamActive) }}
          />
          <span className="text-white/70">Stream:</span>
          <span className="text-white font-semibold">
            {diagnostics.hasStream
              ? diagnostics.streamActive
                ? `Active (${diagnostics.audioTracks} track${diagnostics.audioTracks !== 1 ? 's' : ''})`
                : 'Inactive'
              : 'No Stream'}
          </span>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpatialIcon
            Icon={diagnostics.muted ? ICONS.VolumeX : ICONS.Volume2}
            size={12}
            style={{ color: diagnostics.muted ? '#ef4444' : color }}
          />
          <span className="text-white/70">Volume:</span>
          <span className="text-white font-semibold">
            {diagnostics.muted ? 'Muted' : `${Math.round(diagnostics.volume * 100)}%`}
          </span>
        </div>

        {/* Ready State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpatialIcon Icon={ICONS.Info} size={12} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          <span className="text-white/70">Ready State:</span>
          <span className="text-white/50 text-xs">
            {diagnostics.readyState} ({['nothing', 'metadata', 'current', 'future', 'enough'][diagnostics.readyState] || 'unknown'})
          </span>
        </div>

        {/* Paused State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpatialIcon
            Icon={diagnostics.paused ? ICONS.Pause : ICONS.Play}
            size={12}
            style={{ color: diagnostics.paused ? 'rgba(255, 255, 255, 0.5)' : color }}
          />
          <span className="text-white/70">State:</span>
          <span className="text-white font-semibold">
            {diagnostics.paused ? 'Paused' : 'Playing'}
          </span>
        </div>
      </div>

      {/* Log button */}
      <button
        onClick={() => openaiRealtimeService.logAudioDiagnostics()}
        style={{
          marginTop: '8px',
          padding: '6px 12px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '10px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        📋 Log to Console
      </button>
    </motion.div>
  );
};

export default AudioDiagnostics;
