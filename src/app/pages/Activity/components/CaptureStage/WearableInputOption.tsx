import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import React from 'react';

type InputMode = 'wearable' | 'audio' | 'text';

interface WearableInputOptionProps {
  hasConnectedWearable: boolean;
  connectedDevicesCount: number;
  selectedInputMode: InputMode | null;
  onModeChange: (mode: InputMode) => void;
  loading?: boolean;
}

const WearableInputOption: React.FC<WearableInputOptionProps> = ({
  hasConnectedWearable,
  connectedDevicesCount,
  selectedInputMode,
  onModeChange,
  loading = false
}) => {
  const navigate = useNavigate();
  const { click } = useFeedback();

  const handleClick = () => {
    click();

    if (!hasConnectedWearable) {
      navigate('/settings?tab=appareils');
    } else {
      onModeChange('wearable');
    }
  };

  const isSelected = selectedInputMode === 'wearable';

  if (loading) {
    return (
      <div className="capture-mode-button-3d opacity-50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="capture-mode-icon-3d capture-mode-icon-3d-success">
              <SpatialIcon
                Icon={ICONS.Loader2}
                size={32}
                className="text-white/60 animate-spin"
                variant="pure"
              />
            </div>
            <h4 className="text-white font-bold text-lg">Chargement...</h4>
          </div>

          <p className="text-white/70 text-sm text-left">
            Vérification de vos appareils
          </p>
        </div>
      </div>
    );
  }

  if (!hasConnectedWearable) {
    return (
      <button
        onClick={handleClick}
        className={`capture-mode-button-3d ${
          isSelected ? 'capture-mode-button-3d-active capture-mode-button-3d-active-info' : ''
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="capture-mode-icon-3d capture-mode-icon-3d-info">
              <SpatialIcon
                Icon={ICONS.Watch}
                size={32}
                style={{
                  color: isSelected ? '#0EA5E9' : 'rgba(255, 255, 255, 0.6)'
                }}
                variant="pure"
              />
            </div>
            <h4 className="text-white font-bold text-lg">Montre Connectée</h4>
            <div className="flex-1" />
            <SpatialIcon
              Icon={ICONS.ChevronRight}
              size={24}
              className="text-white/40"
            />
          </div>

          <p className="text-white/70 text-sm text-left">
            Connectez votre montre pour un tracking automatique
          </p>

          <div className="flex items-center gap-2 text-xs text-left">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-sky-300">Tracking automatique et précis</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`capture-mode-button-3d ${
        isSelected ? 'capture-mode-button-3d-active capture-mode-button-3d-active-success' : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="capture-mode-icon-3d capture-mode-icon-3d-success relative">
            <SpatialIcon
              Icon={ICONS.Watch}
              size={32}
              style={{
                color: isSelected ? '#22C55E' : 'rgba(255, 255, 255, 0.6)'
              }}
              variant="pure"
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white/20"
              style={{
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)'
              }}
            />
          </div>
          <h4 className="text-white font-bold text-lg">Montre Connectée</h4>
        </div>

        <p className="text-white/70 text-sm text-left">
          {connectedDevicesCount} appareil{connectedDevicesCount > 1 ? 's' : ''} connecté{connectedDevicesCount > 1 ? 's' : ''}
        </p>

        <div className="flex items-center gap-2 text-xs text-left">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300">Synchronisation active</span>
        </div>
      </div>
    </button>
  );
};

export default WearableInputOption;
