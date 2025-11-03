import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useFridgeScanPipeline } from '../../system/store/fridgeScan';
import { useUserStore } from '../../system/store/userStore';
import { useFridgeScanLifecycle } from './FridgeScan/hooks/useFridgeScanLifecycle';
import { useFridgeScanActions } from './FridgeScan/hooks/useFridgeScanActions';
import FridgeScanProgressHeader from './FridgeScan/components/FridgeScanProgressHeader';
import FridgeScanExitButton from './FridgeScan/components/FridgeScanExitButton';
import FridgeScanStageRenderer from './FridgeScan/components/FridgeScanStageRenderer';
import { profileCompletionService } from '../../system/profile/profileCompletionService';
import logger from '../../lib/utils/logger';

/**
 * FridgeScanPage - Scanner de Frigo
 * Page principale du pipeline de scan et génération de recettes
 */
const FridgeScanPage: React.FC = () => {
  const { profile } = useUserStore();
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get pipeline state from store
  const {
    currentStep,
    isActive,
    currentSessionId,
    simulatedOverallProgress,
    simulatedLoadingStep,
    simulatedScanProgress,
    loadingState,
    loadingMessage,
    capturedPhotos,
    rawDetectedItems,
    userEditedInventory,
    suggestedComplementaryItems,
    steps,
    startScan,
    resumePipeline,
    goToStep,
    previousStep,
    setLoadingState,
    startProgressSimulation,
    processVisionResults,
    setSuggestedComplementaryItems,
    addCapturedPhotos,
    updateInventory,
    removeCapturedPhoto,
    resetPipeline,
    addSelectedComplementaryItems
  } = useFridgeScanPipeline();

  // Initialize lifecycle management
  useFridgeScanLifecycle({
    isActive,
    currentStep,
    currentSessionId,
    simulatedOverallProgress,
    loadingState,
    capturedPhotos,
    startScan,
    resumePipeline
  });

  // Get all action handlers
  const {
    handleManualExit,
    handleInventoryUpdate,
    handleFileSelect,
    removePhoto,
    handleAnalyzePhotos
  } = useFridgeScanActions({
    currentStep,
    loadingState,
    isActive,
    currentSessionId,
    capturedPhotos,
    rawDetectedItems,
    suggestedComplementaryItems,
    goToStep,
    setLoadingState,
    startProgressSimulation,
    processVisionResults,
    setSuggestedComplementaryItems,
    addCapturedPhotos,
    updateInventory,
    removeCapturedPhoto,
    resetPipeline
  });

  // Calculate profile completion
  const profileCompletion = profile ? profileCompletionService.checkCompleteness(profile) : null;

  // Handle camera capture
  const handleCameraCapture = () => {
    logger.info('FRIDGE_SCAN_PAGE', 'Camera capture requested', {
      currentStep,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file upload
  const handleFileUpload = () => {
    logger.info('FRIDGE_SCAN_PAGE', 'File upload requested', {
      currentStep,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle continuing to validation from complement step
  const handleContinueToValidation = () => {
    logger.info('FRIDGE_SCAN_PAGE', 'Continuing to validation step', {
      currentStep,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

    goToStep('validation');
  };

  // Handle going back to photo step
  const handleBackToPhoto = () => {
    logger.info('FRIDGE_SCAN_PAGE', 'Going back to photo step', {
      currentStep,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

    goToStep('photo');
  };

  // Handle previous step
  const handleBack = () => {
    logger.info('FRIDGE_SCAN_PAGE', 'Going to previous step', {
      currentStep,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString()
    });

    previousStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Progress Header */}
      <FridgeScanProgressHeader
        currentStep={steps.find(s => s.id === currentStep) || steps[0]}
        overallProgress={simulatedOverallProgress}
        stepProgress={simulatedScanProgress}
        loadingMessage={loadingMessage}
      />

      {/* Exit Button */}
      <FridgeScanExitButton
        isActive={isActive}
        currentStep={currentStep}
        onManualExit={handleManualExit}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Stage Content */}
      <FridgeScanStageRenderer
        currentStep={currentStep}
        capturedPhotos={capturedPhotos}
        simulatedLoadingStep={simulatedLoadingStep}
        simulatedScanProgress={simulatedScanProgress}
        loadingMessage={loadingMessage}
        userEditedInventory={userEditedInventory}
        suggestedComplementaryItems={suggestedComplementaryItems}
        rawDetectedItems={rawDetectedItems}
        profileCompletion={profileCompletion}
        nudgeDismissed={nudgeDismissed}
        onCameraCapture={handleCameraCapture}
        onFileUpload={handleFileUpload}
        onRemovePhoto={removePhoto}
        onAnalyzePhotos={handleAnalyzePhotos}
        onInventoryUpdate={handleInventoryUpdate}
        onContinueToValidation={handleContinueToValidation}
        onBackToPhoto={handleBackToPhoto}
        onBack={handleBack}
        onNudgeDismiss={() => setNudgeDismissed(true)}
        addSelectedComplementaryItems={addSelectedComplementaryItems}
        goToStep={goToStep}
        previousStep={previousStep}
        handleManualExit={handleManualExit}
      />
    </motion.div>
  );
};

export default FridgeScanPage;