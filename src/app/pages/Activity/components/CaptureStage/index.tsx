import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import InputModeSelector from './InputModeSelector';
import AudioInputInterface from './AudioInputInterface';
import TextInputInterface from './TextInputInterface';
import WearableInputInterface from './WearableInputInterface';
import { useHasConnectedWearable } from '../../../../../hooks/useHasConnectedWearable';
import BenefitsInfoCard, { Benefit } from '../../../../../ui/cards/BenefitsInfoCard';
import React from 'react';

type InputMode = 'wearable' | 'audio' | 'text';

interface CaptureStageProps {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onProcessAudio: () => void;
  onProcessText: (text: string) => void;
  isProcessing: boolean;
  selectedInputMode: InputMode | null;
  onInputModeChange: (mode: InputMode | null) => void;
}

/**
 * Capture Stage - Forge de Mouvement TwinForge (Orchestrateur Principal)
 * Interface modulaire pour montre connectée, enregistrement audio ou saisie texte
 */
const CaptureStage: React.FC<CaptureStageProps> = ({
  isRecording,
  recordingDuration,
  audioBlob,
  onStartRecording,
  onStopRecording,
  onProcessAudio,
  onProcessText,
  isProcessing,
  selectedInputMode,
  onInputModeChange
}) => {
  const [textInput, setTextInput] = useState('');
  const { hasConnectedWearable, connectedDevicesCount, loading } = useHasConnectedWearable();

  useEffect(() => {
    if (!loading && hasConnectedWearable && selectedInputMode === null) {
      onInputModeChange('wearable');
    }
  }, [hasConnectedWearable, loading, selectedInputMode, onInputModeChange]);

  const handleTextInputChange = (text: string) => {
    setTextInput(text);
  };

  const handleProcessText = (text: string) => {
    onProcessText(text);
  };

  const activityTrackerBenefits: Benefit[] = [
    {
      id: 'wearable',
      icon: 'Watch',
      color: '#22C55E',
      title: 'Objet Connecté',
      description: 'Synchronisation automatique recommandée'
    },
    {
      id: 'daily',
      icon: 'Calendar',
      color: '#3B82F6',
      title: 'Saisie Quotidienne',
      description: 'Recommandé si pas d\'objet connecté'
    },
    {
      id: 'insights',
      icon: 'Zap',
      color: '#8B5CF6',
      title: 'Insights IA',
      description: 'Analyse et recommandations personnalisées'
    }
  ];

  return (
    <div className="space-y-6">
      <InputModeSelector
        selectedInputMode={selectedInputMode}
        onInputModeChange={onInputModeChange}
        hasConnectedWearable={hasConnectedWearable}
        connectedDevicesCount={connectedDevicesCount}
        loading={loading}
      />

      <AnimatePresence mode="wait">
        {selectedInputMode === 'wearable' && (
          <WearableInputInterface
            key="wearable-interface"
            connectedDevicesCount={connectedDevicesCount}
          />
        )}

        {selectedInputMode === 'audio' && (
          <AudioInputInterface
            key="audio-interface"
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            audioBlob={audioBlob}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onProcessAudio={onProcessAudio}
            isProcessing={isProcessing}
          />
        )}

        {selectedInputMode === 'text' && (
          <TextInputInterface
            key="text-interface"
            textInput={textInput}
            onTextInputChange={handleTextInputChange}
            onProcessText={handleProcessText}
            isProcessing={isProcessing}
          />
        )}
      </AnimatePresence>

      <BenefitsInfoCard
        benefits={activityTrackerBenefits}
        themeColor="#3B82F6"
        title="Pourquoi tracker mes activités ?"
      />
    </div>
  );
};

export default CaptureStage;