/**
 * useWearableTracking Hook
 * Manages wearable device tracking state during training sessions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useHasConnectedWearable } from './useHasConnectedWearable';

export interface WearableSessionMetrics {
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  calories?: number;
  distance?: number;
  steps?: number;
  activeMinutes?: number;
}

interface UseWearableTrackingOptions {
  sessionId: string;
  userId: string;
  autoStart?: boolean;
}

interface WearableTrackingState {
  isTracking: boolean;
  deviceInfo: {
    deviceName: string;
    deviceId: string;
  } | null;
  hasWearable: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseWearableTrackingReturn extends WearableTrackingState {
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<WearableSessionMetrics | null>;
  resetTracking: () => void;
}

/**
 * Hook to manage wearable tracking during training sessions
 */
export function useWearableTracking({
  sessionId,
  userId,
  autoStart = false
}: UseWearableTrackingOptions): UseWearableTrackingReturn {
  const { hasWearable, deviceName, deviceId } = useHasConnectedWearable();

  const [state, setState] = useState<WearableTrackingState>({
    isTracking: false,
    deviceInfo: null,
    hasWearable: false,
    isLoading: false,
    error: null
  });

  const sessionStartTimeRef = useRef<string | null>(null);
  const trackingInitializedRef = useRef(false);

  // Update hasWearable and deviceInfo when hook data changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      hasWearable,
      deviceInfo: hasWearable && deviceName && deviceId
        ? { deviceName, deviceId }
        : null
    }));
  }, [hasWearable, deviceName, deviceId]);

  /**
   * Start tracking wearable data for the session
   */
  const startTracking = useCallback(async () => {
    if (!hasWearable || state.isTracking || !sessionId || !userId) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const startTime = new Date().toISOString();
      sessionStartTimeRef.current = startTime;


      setState(prev => ({
        ...prev,
        isTracking: true,
        isLoading: false,
        error: null
      }));

      console.log('[useWearableTracking] Started tracking for session:', sessionId);
    } catch (error) {
      console.error('[useWearableTracking] Failed to start tracking:', error);
      setState(prev => ({
        ...prev,
        isTracking: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start tracking'
      }));
    }
  }, [hasWearable, state.isTracking, sessionId, userId]);

  /**
   * Stop tracking and collect wearable data
   */
  const stopTracking = useCallback(async (): Promise<WearableSessionMetrics | null> => {
    if (!state.isTracking || !sessionId || !userId) {
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const endTime = new Date().toISOString();
      const wearableData: WearableSessionMetrics = {};

      setState(prev => ({
        ...prev,
        isTracking: false,
        isLoading: false,
        error: null
      }));

      console.log('[useWearableTracking] Stopped tracking, collected data:', wearableData);

      return wearableData;
    } catch (error) {
      console.error('[useWearableTracking] Failed to stop tracking:', error);
      setState(prev => ({
        ...prev,
        isTracking: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to stop tracking'
      }));
      return null;
    }
  }, [state.isTracking, sessionId, userId]);

  /**
   * Reset tracking state (for cleanup or session restart)
   */
  const resetTracking = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTracking: false,
      isLoading: false,
      error: null
    }));
    sessionStartTimeRef.current = null;
    trackingInitializedRef.current = false;
  }, []);

  // Auto-start tracking if enabled and wearable is connected
  useEffect(() => {
    if (
      autoStart &&
      hasWearable &&
      !state.isTracking &&
      !trackingInitializedRef.current &&
      sessionId &&
      userId
    ) {
      trackingInitializedRef.current = true;
      startTracking();
    }
  }, [autoStart, hasWearable, state.isTracking, sessionId, userId, startTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isTracking) {
        // Don't call stopTracking here as it might interfere with data collection
        // The parent component should handle proper cleanup
        console.log('[useWearableTracking] Component unmounting with active tracking');
      }
    };
  }, [state.isTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
    resetTracking
  };
}
