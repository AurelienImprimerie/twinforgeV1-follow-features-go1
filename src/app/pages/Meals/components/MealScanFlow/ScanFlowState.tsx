import React from 'react';
import type { MealItem } from '../../../../system/data/repositories/mealsRepo';

export type MealScanStep = 'capture' | 'processing' | 'results';
export type ScanType = 'photo-analysis' | 'barcode-scan' | null;
export type CaptureMode = 'photo' | 'barcode';

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

export interface ScannedBarcode {
  barcode: string;
  image_url?: string;
  scannedAt: string;
  portionMultiplier: number;
}

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  image_url?: string;
  mealItem: MealItem;
  portionMultiplier: number;
  scannedAt: string;
}

export interface BarcodeAnalysisResults {
  scannedProduct: ScannedProduct;
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  productDetails: {
    name: string;
    brand?: string;
    image_url?: string;
    barcode: string;
    portionSize: string;
  };
}

export interface ScanFlowState {
  scanType: ScanType;
  currentStep: MealScanStep;
  captureMode: CaptureMode;
  capturedPhoto: CapturedMealPhoto | null;
  scannedBarcodes: ScannedBarcode[];
  scannedProducts: ScannedProduct[];
  analysisResults: any;
  barcodeAnalysisResults: BarcodeAnalysisResults | null;
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  progressSubMessage: string;
  analysisError: string | null;
  analysisMetadata: any;
  isScanningBarcode: boolean;
}

export const initialScanFlowState: ScanFlowState = {
  scanType: 'photo-analysis',
  currentStep: 'capture',
  captureMode: 'photo',
  capturedPhoto: null,
  scannedBarcodes: [],
  scannedProducts: [],
  analysisResults: null,
  barcodeAnalysisResults: null,
  isProcessing: false,
  progress: 0,
  progressMessage: 'Prêt à scanner votre repas',
  progressSubMessage: 'Prenez une photo ou sélectionnez depuis la galerie',
  analysisError: null,
  analysisMetadata: null,
  isScanningBarcode: false,
};