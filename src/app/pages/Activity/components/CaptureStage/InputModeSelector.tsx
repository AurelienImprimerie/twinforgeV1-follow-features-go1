import { motion } from 'framer-motion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import { useHasConnectedWearable } from '../../../../../hooks/useHasConnectedWearable';
import WearableInputOption from './WearableInputOption';
import React from 'react';

type InputMode = 'wearable' | 'audio' | 'text';

interface InputModeSelectorProps {
  selectedInputMode: InputMode | null;
  onInputModeChange: (mode: InputMode) => void;
  hasConnectedWearable: boolean;
  connectedDevicesCount: number;
  loading?: boolean;
}

/**
 * Input Mode Selector - Sélecteur de Mode d'Entrée TwinForge
 * Interface claire pour choisir entre montre connectée, enregistrement vocal ou saisie manuelle
 */
const InputModeSelector: React.FC<InputModeSelectorProps> = ({
  selectedInputMode,
  onInputModeChange,
  hasConnectedWearable,
  connectedDevicesCount,
  loading = false
}) => {
  const { click } = useFeedback();

  const handleModeChange = (mode: InputMode) => {
    click();
    onInputModeChange(mode);

    setTimeout(() => {
      const targetElement = document.querySelector('.capture-input-interface');
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const getAiMessage = () => {
    if (selectedInputMode === 'wearable') {
      return 'Vos activités sont automatiquement synchronisées depuis votre montre connectée';
    }
    if (selectedInputMode === 'audio') {
      return 'Votre enregistrement sera analysé par notre Forge IA pour extraire automatiquement les activités, durées et calories brûlées';
    }
    if (selectedInputMode === 'text') {
      return 'Votre description sera analysée par notre Forge IA pour extraire automatiquement les activités, durées et calories brûlées';
    }
    return 'Choisissez votre méthode préférée pour enregistrer vos activités';
  };

  return (
    <>
      <GlassCard className="p-6 capture-stage-card">
      <div className="mb-4">
        <div className="capture-mode-selector">
          <WearableInputOption
            hasConnectedWearable={hasConnectedWearable}
            connectedDevicesCount={connectedDevicesCount}
            selectedInputMode={selectedInputMode}
            onModeChange={handleModeChange}
            loading={loading}
          />

        <button
          onClick={() => handleModeChange('audio')}
          className={`capture-mode-button-3d ${
            selectedInputMode === 'audio' ? 'capture-mode-button-3d-active' : ''
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="capture-mode-icon-3d capture-mode-icon-3d-primary">
                <SpatialIcon
                  Icon={ICONS.Mic}
                  size={32}
                  style={{
                    color: selectedInputMode === 'audio' ? '#3B82F6' : 'rgba(255, 255, 255, 0.6)'
                  }}
                  variant="pure"
                />
              </div>
              <h4 className="text-white font-bold text-lg">Enregistrement Vocal</h4>
            </div>

            <p className="text-white/70 text-sm text-left">
              Décrivez votre activité à voix haute
            </p>

            <div className="flex items-center gap-2 text-xs text-left">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300">Rapide et naturel</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleModeChange('text')}
          className={`capture-mode-button-3d ${
            selectedInputMode === 'text' ? 'capture-mode-button-3d-active capture-mode-button-3d-active-accent' : ''
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="capture-mode-icon-3d capture-mode-icon-3d-accent">
                <SpatialIcon
                  Icon={ICONS.FileText}
                  size={32}
                  style={{
                    color: selectedInputMode === 'text' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'
                  }}
                  variant="pure"
                />
              </div>
              <h4 className="text-white font-bold text-lg">Saisie Manuelle</h4>
            </div>

            <p className="text-white/70 text-sm text-left">
              Écrivez votre description d'activité
            </p>

            <div className="flex items-center gap-2 text-xs text-left">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-purple-300">Précis et détaillé</span>
            </div>
          </div>
        </button>
        </div>

        {!loading && !hasConnectedWearable && (
          <div
            className="mt-3 px-3 py-2 rounded-xl text-xs font-medium text-center"
            style={{
              background: 'color-mix(in srgb, #64748B 10%, transparent)',
              border: '1px solid color-mix(in srgb, #64748B 20%, transparent)',
              color: '#94A3B8'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <SpatialIcon Icon={ICONS.WifiOff} size={12} style={{ color: '#94A3B8' }} />
              <span>Aucun objet connecté</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl" style={{
        background: 'color-mix(in srgb, var(--color-plasma-cyan) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-plasma-cyan) 20%, transparent)'
      }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--color-plasma-cyan) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-plasma-cyan) 25%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Zap} size={16} style={{ color: 'var(--color-plasma-cyan)' }} />
          </div>
          <div className="text-left">
            <h5 className="text-cyan-300 font-semibold text-sm">Forge IA Intelligente</h5>
            <p className="text-cyan-200 text-xs">
              {getAiMessage()}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
    </>
  );
};

export default InputModeSelector;