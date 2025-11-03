import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';

interface ActionButtonsProps {
  isSaving: boolean;
  onSaveMeal: () => Promise<void>;
  onRetake: () => void;
  onNewScan: () => void;
  analysisResults: any;
}

/**
 * Action Buttons - Boutons d'action pour les résultats
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSaving,
  onSaveMeal,
  onRetake,
  onNewScan,
  analysisResults,
}) => {
  const reduceMotion = useReducedMotion();
  const { click, formSubmit } = useFeedback();

  const handleSaveMeal = async () => {
    formSubmit(); // Audio feedback for save start
    
    try {
      // Appeler la fonction de sauvegarde du parent qui gère tout
      await onSaveMeal();
    } catch (error) {
      // Les erreurs sont gérées par le parent
      console.error('ActionButtons: Save meal failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.1 : 0.6,
        delay: reduceMotion ? 0 : 0.4
      }}
      className="space-y-4"
    >
      {/* Bouton Principal - Sauvegarder */}
      <button
        onClick={handleSaveMeal}
        disabled={isSaving}
        className="btn-save-meal-cta touch-feedback-css"
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          <div className={isSaving ? 'icon-spin-css' : ''}>
            <SpatialIcon
              Icon={isSaving ? ICONS.Loader2 : ICONS.Check}
              size={24}
            />
          </div>
          <span className="text-2xl font-bold text-white">
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder le Repas'}
          </span>
        </div>
      </button>

      {/* Actions Secondaires */}
      <div className="meal-secondary-actions-grid">
        <button
          onClick={() => {
            click();
            onRetake();
          }}
          className="btn-meal-secondary retake touch-target touch-feedback-css"
        >
          <div className="flex items-center justify-center gap-3">
            <SpatialIcon Icon={ICONS.RotateCcw} size={18} />
            <span className="font-medium">Reprendre</span>
          </div>
        </button>

        <button
          onClick={() => {
            click();
            onNewScan();
          }}
          className="btn-meal-secondary new-scan touch-target touch-feedback-css"
        >
          <div className="flex items-center justify-center gap-3">
            <SpatialIcon Icon={ICONS.Plus} size={18} />
            <span className="font-medium">Nouveau Scan</span>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default ActionButtons;