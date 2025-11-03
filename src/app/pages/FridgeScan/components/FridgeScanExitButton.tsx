import React from 'react';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface FridgeScanExitButtonProps {
  isActive: boolean;
  currentStep: string;
  onManualExit: () => void;
}

/**
 * Component to render the exit button conditionally
 */
const FridgeScanExitButton: React.FC<FridgeScanExitButtonProps> = ({
  isActive,
  currentStep,
  onManualExit
}) => {
  
  // Only show exit button if active and on analyze or complement step
  // For validation step, the button is integrated in ReviewEditActionsCard
  if (!isActive || currentStep === 'photo' || currentStep === 'validation') {
    return null;
  }

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={onManualExit}
        className="fridge-btn-danger px-6 py-3"
        title="Quitter l'atelier de recettes"
      >
        <div className="flex items-center gap-2">
          <SpatialIcon Icon={ICONS.X} size={16} color="rgba(239, 68, 68, 1)" variant="pure" />
          <span>Quitter l'Atelier de Recettes</span>
        </div>
      </button>
    </div>
  );
};

export default FridgeScanExitButton;