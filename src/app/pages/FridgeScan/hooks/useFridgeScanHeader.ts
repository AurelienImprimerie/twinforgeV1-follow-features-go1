import React from 'react';
import { FRIDGE_SCAN_STEPS } from '../../../../system/store/fridgeScan';

/**
 * Get dynamic header content based on active step
 */
function getStepHeaderContent(activeStep: string) {
  switch (activeStep) {
    case 'photo':
      return {
        icon: 'Camera' as const,
        title: 'Scanner votre Frigo',
        subtitle: 'Capturez vos ingrédients disponibles avec la Forge Spatiale',
        circuit: 'fridge' as const,
        color: '#EC4899',
      };
    case 'analyze':
      return {
        icon: 'Zap' as const,
        title: 'Analyse IA en Cours',
        subtitle: 'La Forge Spatiale analyse vos ingrédients avec précision',
        circuit: 'fridge' as const,
        color: '#18E3FF',
      };
    case 'validation':
      return {
        icon: 'CheckCircle' as const,
        title: 'Inventaire Validé',
        subtitle: 'Votre inventaire est prêt. Choisissez votre prochaine action.',
        circuit: 'fridge' as const,
        color: '#22C55E',
      };
    case 'complement':
      return {
        icon: 'Plus' as const,
        title: 'Suggestions IA',
        subtitle: 'Ajoutez des ingrédients complémentaires recommandés',
        circuit: 'fridge' as const,
        color: '#8B5CF6',
      };
    default:
      return {
        icon: 'Refrigerator' as const,
        title: 'Atelier de Recettes',
        subtitle: 'Transformez vos ingrédients en délicieuses recettes',
        circuit: 'fridge' as const,
        color: '#EC4899',
      };
  }
}

/**
 * Hook to provide dynamic header content based on the current step
 */
export const useFridgeScanHeader = (currentStep: string) => {
  
  // Get dynamic header content based on active step
  const headerContent = getStepHeaderContent(currentStep);

  // Get the current step data object from FRIDGE_SCAN_STEPS
  const currentStepData = React.useMemo(() => {
    return FRIDGE_SCAN_STEPS.find(step => step.id === currentStep) || FRIDGE_SCAN_STEPS[0];
  }, [currentStep]);

  return {
    headerContent,
    currentStepData
  };
};