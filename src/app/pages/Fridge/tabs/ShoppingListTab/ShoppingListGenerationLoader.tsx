import React, { useEffect } from 'react';
import { useShoppingListStore } from '../../../../../system/store/shoppingListStore';
import ShoppingListMainLoader from './components/ShoppingListMainLoader';
import ShoppingListProgressSteps from './components/ShoppingListProgressSteps';

/**
 * Shopping List Generation Loader - Dynamic loading animation with progress
 */
const ShoppingListGenerationLoader: React.FC = () => {
  const { 
    isGenerating, 
    simulatedProgressPercentage, 
    currentLoadingTitle, 
    currentLoadingSubtitle,
    startSimulatedProgress,
    stopSimulatedProgress
  } = useShoppingListStore();

  React.useEffect(() => {
    if (isGenerating) {
      startSimulatedProgress();
    }
    
    return () => {
      if (!isGenerating) {
        stopSimulatedProgress();
      }
    };
  }, [isGenerating, startSimulatedProgress, stopSimulatedProgress]);

  useEffect(() => {
    // Start simulated progress when component mounts
    startSimulatedProgress();

    // Cleanup on unmount
    return () => {
      stopSimulatedProgress();
    };
  }, [startSimulatedProgress, stopSimulatedProgress]);

  return (
    <div className="space-y-6">
      {/* Main Loader Card */}
      <ShoppingListMainLoader
        currentLoadingTitle={currentLoadingTitle}
        currentLoadingSubtitle={currentLoadingSubtitle}
        simulatedProgressPercentage={simulatedProgressPercentage}
      />

      {/* Progress Steps */}
      <ShoppingListProgressSteps
        simulatedProgressPercentage={simulatedProgressPercentage}
      />
    </div>
  );
};

export default ShoppingListGenerationLoader;