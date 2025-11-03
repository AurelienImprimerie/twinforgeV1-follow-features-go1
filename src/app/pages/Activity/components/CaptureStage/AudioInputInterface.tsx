import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import { useActivityPerformance } from '../../hooks/useActivityPerformance';
import { ConditionalMotionActivity } from '../shared/ConditionalMotionActivity';
import React, { useEffect, useRef } from 'react';

interface AudioInputInterfaceProps {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onProcessAudio: () => void;
  isProcessing: boolean;
}

/**
 * Audio Input Interface - Interface d'Enregistrement Vocal TwinForge
 * Interface dédiée à l'enregistrement audio pour la capture d'activité
 */
const AudioInputInterface: React.FC<AudioInputInterfaceProps> = ({
  isRecording,
  recordingDuration,
  audioBlob,
  onStartRecording,
  onStopRecording,
  onProcessAudio,
  isProcessing
}) => {
  const { click } = useFeedback();
  const perf = useActivityPerformance();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const perfClass = `activity-perf-${perf.mode}`;
      containerRef.current.classList.add(perfClass);
      return () => {
        containerRef.current?.classList.remove(perfClass);
      };
    }
  }, [perf.mode]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gestion du clic sur l'icône centrale du microphone
  const handleMicrophoneClick = () => {
    click();
    if (isRecording) {
      onStopRecording();
    } else if (!audioBlob) {
      onStartRecording();
    }
  };

  return (
    <div ref={containerRef}>
    <GlassCard className="capture-audio-container capture-stage-card capture-input-interface">
      <div className="space-y-6">
        {/* Icône de Microphone Centrale */}
        <div className="relative flex items-center justify-center">
          <button
            className={`capture-audio-visualizer-3d ${
              isRecording ? 'capture-audio-visualizer-recording-3d' : 'capture-audio-visualizer-idle-3d'
            }`}
            onClick={handleMicrophoneClick}
            aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
          >
            <div className="capture-audio-icon-wrapper">
              <SpatialIcon
                Icon={isRecording ? ICONS.Square : ICONS.Mic}
                size={56}
                style={{
                  color: isRecording ? '#EF4444' : '#3B82F6',
                }}
                variant="pure"
              />
            </div>
          </button>

          {/* Anneaux de Pulsation Radiale pendant l'enregistrement */}
          {isRecording && (
            <>
              <div className="capture-audio-ring-1" />
              <div className="capture-audio-ring-2" />
              <div className="capture-audio-ring-3" />
            </>
          )}
        </div>

        {/* Titre et Instructions */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">
            {isRecording ? 'Enregistrement en cours...' : 'Parlez dans le Micro'}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto">
            {isRecording 
              ? 'Décrivez votre session d\'activité physique en cours...'
              : 'Cliquez sur le microphone pour commencer à décrire votre activité'
            }
          </p>
        </div>

        {/* Durée d'enregistrement */}
        {isRecording && (
          <ConditionalMotionActivity
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: perf.transitionDuration }}
            className="text-center"
            fallback={<div className="text-center">
              <div className="capture-audio-status">
                <div className="capture-audio-status-indicator" />
                <span className="capture-audio-timer">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            </div>}
          >
            <div className="capture-audio-status">
              <div className="capture-audio-status-indicator" />
              <span className="capture-audio-timer">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          </ConditionalMotionActivity>
        )}

        {/* Contrôles d'Enregistrement */}
        <div className="flex justify-center gap-4">
          {isRecording && (
            <button
              onClick={onStopRecording}
              className="capture-action-button-3d capture-action-button-3d-danger"
            >
              <div className="flex items-center gap-3">
                <SpatialIcon Icon={ICONS.Square} size={24} className="text-white" />
                <span>Terminer l'Enregistrement</span>
              </div>
            </button>
          )}

          {audioBlob && !isRecording && !isProcessing && (
            <button
              onClick={onProcessAudio}
              className="capture-action-button-3d capture-action-button-3d-success"
            >
              <div className="flex items-center gap-3">
                <SpatialIcon Icon={ICONS.Zap} size={24} className="text-white" />
                <span>Processer ma Forge</span>
              </div>
            </button>
          )}
        </div>

        {/* Instructions d'Utilisation */}
        {!isRecording && !audioBlob && (
          <div className="mt-4 p-4 rounded-xl" style={{
            background: 'color-mix(in srgb, #3B82F6 8%, transparent)',
            border: '1px solid color-mix(in srgb, #3B82F6 20%, transparent)'
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, #3B82F6 15%, transparent)',
                  border: '1px solid color-mix(in srgb, #3B82F6 25%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Mic} size={16} style={{ color: '#3B82F6' }} />
              </div>
              <h4 className="text-blue-300 font-semibold text-sm">Cliquez sur le microphone pour commencer</h4>
            </div>
            <div className="text-blue-200 text-sm space-y-1 text-left">
              <p>• Cliquez une fois pour démarrer l'enregistrement</p>
              <p>• Parlez clairement en décrivant vos activités</p>
              <p>• Cliquez à nouveau pour arrêter l'enregistrement</p>
              <p>• Puis traitez votre enregistrement avec le bouton vert</p>
            </div>
          </div>
        )}

      </div>
    </GlassCard>
    </div>
  );
};

export default AudioInputInterface;