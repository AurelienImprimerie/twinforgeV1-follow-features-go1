import React from 'react';
import { motion } from 'framer-motion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';

interface CapturedMealPhoto {
  file: File;
  url: string;
  validationResult: {
    isValid: boolean;
    issues: string[];
    confidence: number;
  };
  captureReport: any;
}

interface NavigationControlsProps {
  capturedPhoto: CapturedMealPhoto | null;
  onBack: () => void;
}

/**
 * Navigation Controls Component
 * Contrôles de navigation pour le flux de capture
 */
const NavigationControls: React.FC<NavigationControlsProps> = ({
  capturedPhoto,
  onBack,
}) => {
  const { click } = useFeedback();

  return (
    <div className="flex items-center justify-between">
      <motion.button 
        onClick={() => {
          click();
          onBack();
        }} 
        className="btn-glass--secondary-nav touch-target"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center gap-2">
          <SpatialIcon Icon={ICONS.ArrowLeft} size={16} />
          <span>Retour</span>
        </div>
      </motion.button>

      <div className="text-right">
        <p className="text-white/60 text-sm">
          {capturedPhoto ? '✓ Photo capturée' : 'Étape 1 sur 3'}
        </p>
      </div>

    </div>
  );
};

export default NavigationControls;