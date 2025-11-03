/**
 * useSessionTimer Hook
 * Manages global session timing and exercise-specific rest timers
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SessionTimerState {
  sessionTime: number;
  restTime: number;
  isSessionRunning: boolean;
  isResting: boolean;
  isPreparingExercise: boolean;
  isPreparingSet: boolean;
}

export function useSessionTimer() {
  const [sessionTime, setSessionTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [isPreparingExercise, setIsPreparingExercise] = useState(false);
  const [isPreparingSet, setIsPreparingSet] = useState(false);

  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSessionRunning && !isResting) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
        sessionIntervalRef.current = null;
      }
    }

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    };
  }, [isSessionRunning, isResting]);

  useEffect(() => {
    if (isResting && restTime > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting, restTime]);

  const startSession = useCallback(() => {
    setIsSessionRunning(true);
  }, []);

  const pauseSession = useCallback(() => {
    setIsSessionRunning(false);
  }, []);

  const startRest = useCallback((duration: number) => {
    setRestTime(duration);
    setIsResting(true);
  }, []);

  const startExercisePreparation = useCallback(() => {
    setIsPreparingExercise(true);
  }, []);

  const finishExercisePreparation = useCallback(() => {
    setIsPreparingExercise(false);
  }, []);

  const startSetPreparation = useCallback(() => {
    setIsPreparingSet(true);
  }, []);

  const finishSetPreparation = useCallback(() => {
    setIsPreparingSet(false);
  }, []);

  const skipRest = useCallback(() => {
    setRestTime(0);
    setIsResting(false);
  }, []);

  const resetSession = useCallback(() => {
    setSessionTime(0);
    setRestTime(0);
    setIsSessionRunning(false);
    setIsResting(false);
    setIsPreparingExercise(false);
    setIsPreparingSet(false);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    sessionTime,
    restTime,
    isSessionRunning,
    isResting,
    isPreparingExercise,
    isPreparingSet,
    startSession,
    pauseSession,
    startRest,
    skipRest,
    resetSession,
    formatTime,
    startExercisePreparation,
    finishExercisePreparation,
    startSetPreparation,
    finishSetPreparation,
  };
}
