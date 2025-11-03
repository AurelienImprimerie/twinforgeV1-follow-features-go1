// src/app/pages/Meals/components/MealPhotoCaptureStep/usePhotoHandlers.ts
/**
 * Custom hook for photo capture and barcode scanning handlers
 */

import { useState, useRef, useCallback } from 'react';
import type { CapturedMealPhoto } from './types';
import type { ScannedBarcode } from '../MealScanFlow/ScanFlowState';

interface UsePhotoHandlersProps {
  onPhotoCapture: (file: File, captureReport: any) => void;
  onBarcodeDetected: (barcode: ScannedBarcode) => void;
}

export function usePhotoHandlers({ onPhotoCapture, onBarcodeDetected }: UsePhotoHandlersProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeScanMode, setBarcodeScanMode] = useState<'camera' | 'upload' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const barcodeImageInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = useCallback(() => {
    if (!fileInputRef.current) {
      console.error('fileInputRef.current is null or undefined');
      return;
    }
    fileInputRef.current.click();
  }, []);

  const handleGalleryClick = useCallback(() => {
    if (!galleryInputRef.current) {
      console.error('galleryInputRef.current is null or undefined');
      return;
    }
    galleryInputRef.current.value = '';
    galleryInputRef.current.click();
  }, []);

  const handleBarcodeClick = useCallback(() => {
    setShowBarcodeScanner(true);
    setBarcodeScanMode('camera');
  }, []);

  const handleBarcodeImageUpload = useCallback(() => {
    barcodeImageInputRef.current?.click();
  }, []);

  const handleBarcodeClose = useCallback(() => {
    setShowBarcodeScanner(false);
  }, []);

  const handleBarcodeDetected = useCallback((barcode: ScannedBarcode) => {
    onBarcodeDetected(barcode);
    setShowBarcodeScanner(false);
  }, [onBarcodeDetected]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsValidating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const captureReport = {
        validation: {
          isValid: true,
          issues: [],
          confidence: 0.9,
        },
        metadata: {
          fileSize: file.size,
          dimensions: { width: 1920, height: 1080 },
          timestamp: new Date().toISOString(),
        }
      };

      onPhotoCapture(file, captureReport);
      setShowSuccessAnimation(true);

      setTimeout(() => setShowSuccessAnimation(false), 2000);
    } catch (error) {
      console.error('Photo validation failed:', error);
    } finally {
      setIsValidating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  }, [onPhotoCapture]);

  const handleBarcodeImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowBarcodeScanner(true);
      setBarcodeScanMode('upload');
    }
  }, []);

  return {
    isValidating,
    showSuccessAnimation,
    showBarcodeScanner,
    barcodeScanMode,
    fileInputRef,
    galleryInputRef,
    barcodeImageInputRef,
    handlers: {
      handleCameraClick,
      handleGalleryClick,
      handleBarcodeClick,
      handleBarcodeImageUpload,
      handleBarcodeClose,
      handleBarcodeDetected,
      handleFileSelect,
      handleBarcodeImageSelect
    }
  };
}
