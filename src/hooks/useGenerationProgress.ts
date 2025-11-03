/**
 * useGenerationProgress Hook
 * Time-based realistic progress tracking for training generation (2 minutes)
 * Inspired by useAnalysisProgress with smooth 1% increments
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type GenerationPhase =
  | 'idle'
  | 'starting'
  | 'analyzing'
  | 'selecting'
  | 'calculating'
  | 'completed'
  | 'error';

export interface GenerationProgress {
  phase: GenerationPhase;
  progress: number;
  message: string;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  isReady: boolean;
}

const TOTAL_GENERATION_TIME_MS = 120000; // 2 minutes (120 seconds)
const MAX_PROGRESS_BEFORE_COMPLETION = 92; // Stop at 92% until actual completion

export function useGenerationProgress() {
  const [progress, setProgress] = useState<GenerationProgress>({
    phase: 'idle',
    progress: 0,
    message: '',
    elapsedTime: 0,
    estimatedTimeRemaining: 0,
    isReady: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const phaseRef = useRef<GenerationPhase>('idle');

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Calculate smooth progress based on elapsed time
   * Progress curve: 0-92% over 2 minutes, then 92-100% on confirmation
   *
   * Phases:
   * 0-15s   (0-12%)  : starting - Connection & initialization
   * 15-40s  (12-35%) : analyzing - Profile analysis
   * 40-80s  (35-70%) : selecting - Exercise selection
   * 80-120s (70-92%) : calculating - Load calculation
   * 120s+   (92-100%): completed - Final confirmation
   */
  const calculateSmoothProgress = useCallback((
    elapsedMs: number,
    isCompleted: boolean
  ): { progress: number; phase: GenerationPhase; message: string } => {
    if (isCompleted) {
      return {
        progress: 100,
        phase: 'completed',
        message: 'Programme généré avec succès !'
      };
    }

    const elapsedSeconds = elapsedMs / 1000;

    // Phase 1: Starting (0-15s) - 0-12%
    if (elapsedSeconds < 15) {
      const phaseProgress = (elapsedSeconds / 15) * 12;
      return {
        progress: Math.floor(phaseProgress),
        phase: 'starting',
        message: 'Votre coach se prépare...'
      };
    }

    // Phase 2: Analyzing (15-40s) - 12-35%
    if (elapsedSeconds < 40) {
      const phaseProgress = 12 + ((elapsedSeconds - 15) / 25) * 23;
      return {
        progress: Math.floor(phaseProgress),
        phase: 'analyzing',
        message: 'Analyse de ton profil...'
      };
    }

    // Phase 3: Selecting (40-80s) - 35-70%
    if (elapsedSeconds < 80) {
      const phaseProgress = 35 + ((elapsedSeconds - 40) / 40) * 35;
      return {
        progress: Math.floor(phaseProgress),
        phase: 'selecting',
        message: 'Génération des exercices...'
      };
    }

    // Phase 4: Calculating (80-120s) - 70-92%
    if (elapsedSeconds < 120) {
      const phaseProgress = 70 + ((elapsedSeconds - 80) / 40) * 22;
      return {
        progress: Math.floor(Math.min(MAX_PROGRESS_BEFORE_COMPLETION, phaseProgress)),
        phase: 'calculating',
        message: 'Optimisation finale...'
      };
    }

    // Cap at 92% until actual completion
    return {
      progress: MAX_PROGRESS_BEFORE_COMPLETION,
      phase: 'calculating',
      message: 'Presque prêt...'
    };
  }, []);

  /**
   * Start progress tracking
   */
  const startProgress = useCallback(() => {
    clearTimers();
    startTimeRef.current = Date.now();
    phaseRef.current = 'starting';

    // Immediately set ready state with 0% to prevent NaN flash
    setProgress({
      phase: 'starting',
      progress: 0,
      message: 'Votre coach se prépare...',
      elapsedTime: 0,
      estimatedTimeRemaining: 120,
      isReady: true
    });

    // Update progress every 500ms for smooth animation
    intervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const { progress: currentProgress, phase, message } = calculateSmoothProgress(elapsedMs, false);

      // Update phase ref for external access
      phaseRef.current = phase;

      const remainingSeconds = Math.max(0, 120 - elapsedSeconds);

      setProgress({
        phase,
        progress: currentProgress,
        message,
        elapsedTime: elapsedSeconds,
        estimatedTimeRemaining: remainingSeconds,
        isReady: true
      });
    }, 500);
  }, [calculateSmoothProgress, clearTimers]);

  /**
   * Complete progress (jump to 100%)
   */
  const completeProgress = useCallback((success: boolean, errorMessage?: string) => {
    clearTimers();

    const totalElapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

    setProgress({
      phase: success ? 'completed' : 'error',
      progress: 100,
      message: success
        ? 'Programme généré avec succès !'
        : errorMessage || 'Erreur lors de la génération',
      elapsedTime: totalElapsedSeconds,
      estimatedTimeRemaining: 0,
      isReady: true
    });
  }, [clearTimers]);

  /**
   * Reset progress
   */
  const resetProgress = useCallback(() => {
    clearTimers();
    phaseRef.current = 'idle';

    setProgress({
      phase: 'idle',
      progress: 0,
      message: '',
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      isReady: false
    });
  }, [clearTimers]);

  /**
   * Get current phase (for external logic)
   */
  const getCurrentPhase = useCallback((): GenerationPhase => {
    return phaseRef.current;
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    progress,
    startProgress,
    completeProgress,
    resetProgress,
    getCurrentPhase,
    isGenerating: progress.phase !== 'idle' && progress.phase !== 'completed' && progress.phase !== 'error'
  };
}
