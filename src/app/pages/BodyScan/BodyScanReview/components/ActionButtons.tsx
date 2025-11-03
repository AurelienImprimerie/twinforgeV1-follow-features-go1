import React from 'react';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';

interface ActionButtonsProps {
  isViewerReady: boolean;
  onSaveAvatar: () => void;
  onNewScan: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isViewerReady,
  onSaveAvatar,
  onNewScan
}) => {
  return (
    <div className="review-action-buttons">
      <button
        onClick={onSaveAvatar}
        disabled={!isViewerReady}
        className={`review-action-button ${
          isViewerReady ? 'review-action-button--primary' : 'review-action-button--primary review-action-button--disabled'
        }`}
      >
        <div className="bodyscan-flex-center bodyscan-gap-sm">
          <SpatialIcon Icon={ICONS.Save} size={20} />
          <span>Sauvegarder cet avatar</span>
        </div>
      </button>
      
      <button
        onClick={onNewScan}
        className="review-action-button review-action-button--secondary"
      >
        <div className="bodyscan-flex-center bodyscan-gap-sm">
          <SpatialIcon Icon={ICONS.Scan} size={20} />
          <span>Nouveau scan</span>
        </div>
      </button>
    </div>
  );
};

export default ActionButtons;
