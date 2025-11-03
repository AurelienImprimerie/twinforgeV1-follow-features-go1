/**
 * Meal Photo Capture Step - Refactored Component
 * Main component orchestrating the meal photo capture flow
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MealProgressHeader from '../MealProgressHeader';
import BenefitsInfoCard from '../../../../../ui/cards/BenefitsInfoCard';
import CaptureGuide from './CaptureGuide';
import CapturedPhotoDisplay from './CapturedPhotoDisplay';
import ReadyForProcessing from './ReadyForProcessing';
import NavigationControls from './NavigationControls';
import BarcodeScannerView from './BarcodeScannerView';
import ScanTypeToggle from './ScanTypeToggle';
import EmptyBarcodeState from './EmptyBarcodeState';
import ScannedItemsList from './ScannedItemsList';
import { usePhotoHandlers } from './usePhotoHandlers';
import { mealScanBenefits, barcodeScanBenefits } from './benefitsConfig';
import type { MealPhotoCaptureStepProps } from './types';

const MealPhotoCaptureStep: React.FC<MealPhotoCaptureStepProps> = (props) => {
  const {
    scanType,
    onSelectScanType,
    capturedPhoto,
    scannedBarcodes,
    scannedProducts,
    onPhotoCapture,
    onBarcodeDetected,
    onProductPortionChange,
    onProductRemove,
    onBarcodeRemove,
    onRetake,
    onBack,
    onProceedToProcessing,
    isProcessingInProgress,
    readyForProcessingRef,
    progress,
    progressMessage,
    progressSubMessage,
  } = props;

  const {
    isValidating,
    showSuccessAnimation,
    showBarcodeScanner,
    barcodeScanMode,
    fileInputRef,
    galleryInputRef,
    barcodeImageInputRef,
    handlers
  } = usePhotoHandlers({ onPhotoCapture, onBarcodeDetected });

  const showPhotoAnalysisEmpty = scanType === 'photo-analysis' && !capturedPhoto;
  const showPhotoAnalysisCaptured = scanType === 'photo-analysis' && capturedPhoto;
  const showBarcodeEmpty = scanType === 'barcode-scan' && scannedBarcodes.length === 0 && scannedProducts.length === 0;
  const hasAnyScannedItems = scannedBarcodes.length > 0 || scannedProducts.length > 0;
  const hasAnyCapturedData = capturedPhoto || hasAnyScannedItems;

  return (
    <div className="space-y-6 pb-32" style={{ minHeight: '100vh' }}>
      <MealProgressHeader
        currentStep="capture"
        progress={progress}
        message={progressMessage}
        subMessage={progressSubMessage}
      />

      <ScanTypeToggle scanType={scanType} onSelectScanType={onSelectScanType} />

      <div className="space-y-6">
        {showPhotoAnalysisEmpty && (
          <div className="mt-6">
            <CaptureGuide
              isValidating={isValidating}
              onCameraClick={handlers.handleCameraClick}
              onGalleryClick={handlers.handleGalleryClick}
              onBarcodeClick={handlers.handleBarcodeClick}
              onBarcodeImageUpload={handlers.handleBarcodeImageUpload}
            />
          </div>
        )}

        {showPhotoAnalysisCaptured && (
          <AnimatePresence mode="wait">
            <motion.div
              key="captured"
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CapturedPhotoDisplay
                capturedPhoto={capturedPhoto}
                showSuccessAnimation={showSuccessAnimation}
                onRetake={onRetake}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {showBarcodeEmpty && (
          <EmptyBarcodeState
            onBarcodeClick={handlers.handleBarcodeClick}
            onBarcodeImageUpload={handlers.handleBarcodeImageUpload}
          />
        )}

        <ScannedItemsList
          scannedBarcodes={scannedBarcodes}
          scannedProducts={scannedProducts}
          capturedPhoto={capturedPhoto}
          onBarcodeRemove={onBarcodeRemove}
          onProductPortionChange={onProductPortionChange}
          onProductRemove={onProductRemove}
          onCameraClick={handlers.handleCameraClick}
          onGalleryClick={handlers.handleGalleryClick}
        />

        {hasAnyCapturedData && (
          <div ref={readyForProcessingRef} className="mt-8">
            <ReadyForProcessing
              onProceedToProcessing={onProceedToProcessing}
              isProcessingInProgress={isProcessingInProgress}
              hasPhoto={!!capturedPhoto}
              hasScannedBarcodes={scannedBarcodes.length > 0}
              hasScannedProducts={scannedProducts.length > 0}
              scannedBarcodesCount={scannedBarcodes.length}
              scannedProductsCount={scannedProducts.length}
            />
          </div>
        )}

        {scanType === 'photo-analysis' && !capturedPhoto && !hasAnyScannedItems && (
          <BenefitsInfoCard
            benefits={mealScanBenefits}
            themeColor="#10B981"
            title="Pourquoi scanner mes repas ?"
          />
        )}

        {scanType === 'barcode-scan' && !hasAnyScannedItems && (
          <BenefitsInfoCard
            benefits={barcodeScanBenefits}
            themeColor="#6366F1"
            title="Pourquoi scanner un code-barre ?"
          />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlers.handleFileSelect}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
          opacity: 0,
          pointerEvents: 'none'
        }}
        capture="environment"
        data-testid="camera-file-input"
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handlers.handleFileSelect}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
          opacity: 0,
          pointerEvents: 'none'
        }}
        data-testid="gallery-file-input"
      />

      <input
        ref={barcodeImageInputRef}
        type="file"
        accept="image/*"
        onChange={handlers.handleBarcodeImageSelect}
        className="hidden"
      />

      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-50"
        style={{ pointerEvents: 'none' }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <NavigationControls capturedPhoto={capturedPhoto} onBack={onBack} />
        </div>
      </div>

      {showBarcodeScanner && (
        <BarcodeScannerView
          onBarcodeDetected={handlers.handleBarcodeDetected}
          onClose={handlers.handleBarcodeClose}
          mode={barcodeScanMode}
          uploadedImage={barcodeScanMode === 'upload' ? barcodeImageInputRef.current?.files?.[0] : undefined}
        />
      )}
    </div>
  );
};

export default MealPhotoCaptureStep;
