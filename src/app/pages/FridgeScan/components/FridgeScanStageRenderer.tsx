import React from 'react';
import type { SuggestedFridgeItem } from '../../../../system/store/fridgeScan/types';
import CaptureMainCTA from './CaptureMainCTA';
import CapturedPhotosDisplay from './CapturedPhotosDisplay';
import AnalyzeCTA from './AnalyzeCTA';
import WhyScanMyFridgeCard from './WhyScanMyFridgeCard';
import LoadingAnalysisCard from './LoadingAnalysisCard';
import ContextualInfoCard from './ContextualInfoCard';
import ComplementStage from '../stages/ComplementStage';
import ReviewEditStage from '../stages/ReviewEditStage';
import ProfileNudge from '../../../../ui/components/ProfileNudge';

interface FridgeScanStageRendererProps {
  currentStep: string;
  capturedPhotos: string[];
  simulatedLoadingStep: any;
  simulatedScanProgress: number;
  loadingMessage: string;
  userEditedInventory: any[];
  suggestedComplementaryItems: SuggestedFridgeItem[];
  rawDetectedItems: any[];
  profileCompletion: any;
  nudgeDismissed: boolean;
  onCameraCapture: () => void;
  onFileUpload: () => void;
  onRemovePhoto: (index: number) => void;
  onAnalyzePhotos: () => void;
  onInventoryUpdate: (inventory: any[]) => void;
  onContinueToValidation: () => void;
  onBackToPhoto: () => void;
  onBack: () => void;
  onNudgeDismiss: () => void;
  addSelectedComplementaryItems: (items: SuggestedFridgeItem[]) => void;
  goToStep: (step: string) => void;
  previousStep: () => void;
  handleManualExit: () => void;
}

/**
 * Component responsible for rendering the correct stage content based on currentStep
 */
const FridgeScanStageRenderer: React.FC<FridgeScanStageRendererProps> = ({
  currentStep,
  capturedPhotos,
  simulatedLoadingStep,
  simulatedScanProgress,
  loadingMessage,
  userEditedInventory,
  suggestedComplementaryItems,
  rawDetectedItems,
  profileCompletion,
  nudgeDismissed,
  onCameraCapture,
  onFileUpload,
  onRemovePhoto,
  onAnalyzePhotos,
  onInventoryUpdate,
  onContinueToValidation,
  onBackToPhoto,
  onBack,
  onNudgeDismiss,
  addSelectedComplementaryItems,
  goToStep,
  previousStep,
  handleManualExit
}) => {
  
  const renderStageContent = () => {
    switch (currentStep) {
      case 'photo':
        return (
          <div className="space-y-6">
            <CaptureMainCTA
              onCameraCapture={onCameraCapture}
              onFileUpload={onFileUpload}
              fileInputRef={React.createRef()}
            />
            
            {capturedPhotos.length > 0 && (
              <CapturedPhotosDisplay
                capturedPhotos={capturedPhotos}
                onRemovePhoto={onRemovePhoto}
              />
            )}
            
            {capturedPhotos.length > 0 && (
              <AnalyzeCTA
                capturedPhotosCount={capturedPhotos.length}
                onAnalyzePhotos={onAnalyzePhotos}
              />
            )}
            
            {/* Profile Nudge - Positioned after main CTA */}
            {profileCompletion && !profileCompletion.isSufficient && !nudgeDismissed && (
              <ProfileNudge
                completion={profileCompletion}
                variant="card"
                onDismiss={onNudgeDismiss}
                showDismiss={true}
              />
            )}
            
            <WhyScanMyFridgeCard />
          </div>
        );

      case 'analyze':
        return (
          <div className="space-y-6">
            <LoadingAnalysisCard
              simulatedLoadingStep={simulatedLoadingStep}
              simulatedScanProgress={simulatedScanProgress}
              loadingMessage={loadingMessage}
            />
            <ContextualInfoCard />
          </div>
        );

      case 'complement':
        return (
          <ComplementStage
            userEditedInventory={userEditedInventory}
            suggestedComplementaryItems={suggestedComplementaryItems}
            addSelectedComplementaryItems={addSelectedComplementaryItems}
            onContinueToValidation={onContinueToValidation}
            onBackToPhoto={onBackToPhoto}
          />
        );

      case 'validation':
        return (
          <ReviewEditStage
            rawDetectedItems={rawDetectedItems}
            userEditedInventory={userEditedInventory}
            suggestedComplementaryItems={suggestedComplementaryItems}
            addSelectedComplementaryItems={addSelectedComplementaryItems}
            onInventoryUpdate={onInventoryUpdate}
            onContinue={() => {}}
            onBack={onBack}
            isLoading={false}
            handleManualExit={handleManualExit}
          />
        );

      case 'recipes':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Génération des recettes en cours...
              </h3>
              <p className="text-gray-600">
                Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <CaptureMainCTA
              onCameraCapture={onCameraCapture}
              onFileUpload={onFileUpload}
              fileInputRef={React.createRef()}
            />
          </div>
        );
    }
  };

  return (
    <div className="fridge-scan-stage-container">
      {renderStageContent()}
    </div>
  );
};

export default FridgeScanStageRenderer;