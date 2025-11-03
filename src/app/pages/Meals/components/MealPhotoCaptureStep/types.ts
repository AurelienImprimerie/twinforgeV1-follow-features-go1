// src/app/pages/Meals/components/MealPhotoCaptureStep/types.ts
/**
 * Type definitions for MealPhotoCaptureStep
 */

import type { ScannedProduct, ScannedBarcode, ScanType } from '../MealScanFlow/ScanFlowState';

export interface CapturedMealPhoto {
  file: File;
  url: string;
  validationResult: {
    isValid: boolean;
    issues: string[];
    confidence: number;
  };
  captureReport: any;
}

export interface MealPhotoCaptureStepProps {
  scanType: ScanType;
  onSelectScanType: (scanType: ScanType) => void;
  capturedPhoto: CapturedMealPhoto | null;
  scannedBarcodes: ScannedBarcode[];
  scannedProducts: ScannedProduct[];
  onPhotoCapture: (file: File, captureReport: any) => void;
  onBarcodeDetected: (barcode: ScannedBarcode) => void;
  onProductScanned: (product: ScannedProduct) => void;
  onProductPortionChange: (barcode: string, multiplier: number) => void;
  onProductRemove: (barcode: string) => void;
  onBarcodePortionChange: (barcode: string, multiplier: number) => void;
  onBarcodeRemove: (barcode: string) => void;
  onRetake: () => void;
  onBack: () => void;
  onProceedToProcessing: () => void;
  isProcessingInProgress: boolean;
  readyForProcessingRef: React.RefObject<HTMLDivElement>;
  progress: number;
  progressMessage: string;
  progressSubMessage: string;
}

export interface BarcodeScanMode {
  mode: 'camera' | 'upload' | null;
}

export { ScannedProduct, ScannedBarcode, ScanType };
