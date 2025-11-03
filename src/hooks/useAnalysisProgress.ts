/**
 * useAnalysisProgress Hook
 * Photo-based progress tracking with smooth 1% increments
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type AnalysisPhase =
  | 'idle'
  | 'preparing'
  | 'analyzing'
  | 'completed'
  | 'error';

export interface AnalysisProgress {
  phase: AnalysisPhase;
  progress: number;
  message: string;
  elapsedTime: number;
  currentPhotoIndex: number;
  totalPhotos: number;
  photosCompleted: number;
  estimatedTimeRemaining: number;
}

const AVERAGE_TIME_PER_PHOTO_MS = 75000; // 75 seconds average based on logs
const MAX_PROGRESS_PER_PHOTO = 95; // Stop at 95% until actual completion

export function useAnalysisProgress(totalPhotos: number = 1) {
  const [progress, setProgress] = useState<AnalysisProgress>({
    phase: 'idle',
    progress: 0,
    message: '',
    elapsedTime: 0,
    currentPhotoIndex: 0,
    totalPhotos,
    photosCompleted: 0,
    estimatedTimeRemaining: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const photoStartTimesRef = useRef<number[]>([]);
  const currentPhotoIndexRef = useRef<number>(0);
  const photosCompletedRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Calculate smooth progress based on elapsed time
   * Progress per photo: 0-95% based on elapsed time, 95-100% on confirmation
   */
  const calculateSmoothProgress = useCallback((
    photoIndex: number,
    photoElapsedMs: number,
    isCompleted: boolean
  ): number => {
    if (isCompleted) {
      return 100;
    }

    // Calculate progress for this photo (0-95%)
    const progressForThisPhoto = Math.min(
      MAX_PROGRESS_PER_PHOTO,
      (photoElapsedMs / AVERAGE_TIME_PER_PHOTO_MS) * MAX_PROGRESS_PER_PHOTO
    );

    return Math.floor(progressForThisPhoto);
  }, []);

  /**
   * Calculate overall progress across all photos
   */
  const calculateOverallProgress = useCallback((): number => {
    const completedPhotosProgress = (photosCompletedRef.current / totalPhotos) * 100;

    if (currentPhotoIndexRef.current >= totalPhotos) {
      return 100;
    }

    // Add progress from current photo
    const currentPhotoStartTime = photoStartTimesRef.current[currentPhotoIndexRef.current] || Date.now();
    const currentPhotoElapsed = Date.now() - currentPhotoStartTime;
    const currentPhotoProgress = calculateSmoothProgress(
      currentPhotoIndexRef.current,
      currentPhotoElapsed,
      false
    );

    const currentPhotoContribution = (currentPhotoProgress / 100) * (100 / totalPhotos);

    return Math.floor(completedPhotosProgress + currentPhotoContribution);
  }, [totalPhotos, calculateSmoothProgress]);

  /**
   * Start analyzing (called once at the beginning)
   */
  const startProgress = useCallback(() => {
    clearTimers();
    startTimeRef.current = Date.now();
    currentPhotoIndexRef.current = 0;
    photosCompletedRef.current = 0;
    photoStartTimesRef.current = [Date.now()];

    setProgress({
      phase: 'preparing',
      progress: 0,
      message: 'Préparation de l\'analyse...',
      elapsedTime: 0,
      currentPhotoIndex: 0,
      totalPhotos,
      photosCompleted: 0,
      estimatedTimeRemaining: totalPhotos * (AVERAGE_TIME_PER_PHOTO_MS / 1000)
    });

    // Start smooth progress updates every 500ms
    intervalRef.current = setInterval(() => {
      const totalElapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const overallProgress = calculateOverallProgress();

      const remainingPhotos = totalPhotos - photosCompletedRef.current;
      const estimatedRemaining = Math.max(0, remainingPhotos * (AVERAGE_TIME_PER_PHOTO_MS / 1000));

      setProgress(prev => ({
        ...prev,
        progress: overallProgress,
        elapsedTime: totalElapsedSeconds,
        estimatedTimeRemaining: Math.floor(estimatedRemaining),
        message: currentPhotoIndexRef.current < totalPhotos
          ? `Analyse photo ${currentPhotoIndexRef.current + 1} / ${totalPhotos}...`
          : 'Finalisation...'
      }));
    }, 500);
  }, [totalPhotos, calculateOverallProgress, clearTimers]);

  /**
   * Mark a photo as started
   */
  const startPhotoAnalysis = useCallback((photoIndex: number) => {
    currentPhotoIndexRef.current = photoIndex;
    photoStartTimesRef.current[photoIndex] = Date.now();

    setProgress(prev => ({
      ...prev,
      phase: 'analyzing',
      currentPhotoIndex: photoIndex,
      message: `Analyse photo ${photoIndex + 1} / ${totalPhotos}...`
    }));
  }, [totalPhotos]);

  /**
   * Mark a photo as completed
   */
  const completePhotoAnalysis = useCallback((photoIndex: number, equipmentCount: number) => {
    photosCompletedRef.current++;

    setProgress(prev => ({
      ...prev,
      photosCompleted: photosCompletedRef.current,
      message: `Photo ${photoIndex + 1} terminée: ${equipmentCount} équipement${equipmentCount > 1 ? 's' : ''} détecté${equipmentCount > 1 ? 's' : ''}`
    }));

    // If there are more photos, prepare for the next one
    if (photoIndex + 1 < totalPhotos) {
      currentPhotoIndexRef.current = photoIndex + 1;
      photoStartTimesRef.current[photoIndex + 1] = Date.now();
    }
  }, [totalPhotos]);

  /**
   * Complete entire analysis
   */
  const completeProgress = useCallback((success: boolean, totalEquipmentCount?: number) => {
    clearTimers();

    setProgress({
      phase: success ? 'completed' : 'error',
      progress: 100,
      message: success
        ? `Analyse terminée: ${totalEquipmentCount || 0} équipement${totalEquipmentCount && totalEquipmentCount > 1 ? 's' : ''} détecté${totalEquipmentCount && totalEquipmentCount > 1 ? 's' : ''} au total`
        : 'Erreur lors de l\'analyse',
      elapsedTime: Math.floor((Date.now() - startTimeRef.current) / 1000),
      currentPhotoIndex: totalPhotos,
      totalPhotos,
      photosCompleted: success ? totalPhotos : photosCompletedRef.current,
      estimatedTimeRemaining: 0
    });
  }, [totalPhotos, clearTimers]);

  /**
   * Reset progress
   */
  const resetProgress = useCallback(() => {
    clearTimers();
    currentPhotoIndexRef.current = 0;
    photosCompletedRef.current = 0;
    photoStartTimesRef.current = [];

    setProgress({
      phase: 'idle',
      progress: 0,
      message: '',
      elapsedTime: 0,
      currentPhotoIndex: 0,
      totalPhotos,
      photosCompleted: 0,
      estimatedTimeRemaining: 0
    });
  }, [totalPhotos, clearTimers]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    progress,
    startProgress,
    startPhotoAnalysis,
    completePhotoAnalysis,
    completeProgress,
    resetProgress,
    isAnalyzing: progress.phase !== 'idle' && progress.phase !== 'completed' && progress.phase !== 'error'
  };
}
