/**
 * Viewer State Management Hook
 * Manages central state and refs for the Avatar 3D Viewer
 */

import { useState, useRef, useMemo } from 'react';
import type { ViewerState } from '../utils/viewerTypes';
import { processViewerPayload, processSkinTone, determineFinalGender } from '../utils/payloadProcessor';
import type { Avatar3DViewerProps } from '../utils/viewerTypes';
import logger from '../../../../lib/utils/logger';

interface UseViewerStateProps {
  props: Avatar3DViewerProps;
  autoRotate?: boolean;
  onViewerReady?: () => void;
}

export interface ViewerStateRefs {
  onViewerReadyCalledRef: React.MutableRefObject<boolean>;
  initGuardRef: React.MutableRefObject<boolean>;
  isFullyInitializedRef: React.MutableRefObject<boolean>;
  initializationCountRef: React.MutableRefObject<number>;
  isProjectionSessionActiveRef: React.MutableRefObject<boolean>;
  initialServerScanIdRef: React.MutableRefObject<string | undefined>;
  initialContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  finalGenderRef: React.MutableRefObject<'male' | 'female'>;
  processedSkinToneRef: React.MutableRefObject<any>;
  finalGenderLockedRef: React.MutableRefObject<boolean>;
  processedSkinToneLockedRef: React.MutableRefObject<boolean>;
  propsRef: React.MutableRefObject<Avatar3DViewerProps>;
  morphologyMappingRef: React.MutableRefObject<any>;
}

export function useViewerState({
  props,
  autoRotate = false,
  onViewerReady
}: UseViewerStateProps) {
  const [viewerState, setViewerState] = useState<ViewerState>({
    isLoading: true,
    error: null,
    isInitialized: false,
    isViewerReady: false,
    activeView: 'threequarter',
    isAutoRotating: autoRotate,
  });

  const refs: ViewerStateRefs = {
    onViewerReadyCalledRef: useRef(onViewerReady ? false : true),
    initGuardRef: useRef(false),
    isFullyInitializedRef: useRef(false),
    initializationCountRef: useRef(0),
    isProjectionSessionActiveRef: useRef(false),
    initialServerScanIdRef: useRef(props.serverScanId),
    initialContainerRef: useRef<HTMLDivElement | null>(null),
    finalGenderRef: useRef<'male' | 'female'>('female'),
    processedSkinToneRef: useRef<any>(null),
    finalGenderLockedRef: useRef(false),
    processedSkinToneLockedRef: useRef(false),
    propsRef: useRef(props),
    morphologyMappingRef: useRef(null)
  };

  refs.propsRef.current = props;

  const finalGender = useMemo(() => {
    const computed = determineFinalGender(props);

    if (refs.finalGenderLockedRef.current && refs.isProjectionSessionActiveRef.current) {
      if (computed !== refs.finalGenderRef.current) {
        logger.error('ORCHESTRATOR', '🚨 BLOCKED: Attempted gender change during projection session', {
          lockedGender: refs.finalGenderRef.current,
          attemptedGender: computed,
          philosophy: 'projection_session_gender_lock'
        });
      }
      return refs.finalGenderRef.current;
    }

    if (computed !== refs.finalGenderRef.current) {
      refs.finalGenderRef.current = computed;
      if (props.overrideGender) {
        refs.finalGenderLockedRef.current = true;
        logger.info('ORCHESTRATOR', '🔒 Gender LOCKED for projection session', {
          lockedGender: computed,
          philosophy: 'gender_lock_activated'
        });
      }
    }
    return refs.finalGenderRef.current;
  }, [
    props.savedAvatarPayload?.resolved_gender,
    props.resolvedGender,
    props.userProfile?.sex,
    props.overrideGender
  ]);

  const processedSkinTone = useMemo(() => {
    const computed = processSkinTone(props);

    if (refs.processedSkinToneLockedRef.current && refs.isProjectionSessionActiveRef.current && !props.overrideSkinTone) {
      const currentRgb = refs.processedSkinToneRef.current?.rgb;
      const newRgb = computed?.rgb;
      const hasChanged = !currentRgb || !newRgb ||
        Math.abs(currentRgb.r - newRgb.r) > 1 ||
        Math.abs(currentRgb.g - newRgb.g) > 1 ||
        Math.abs(currentRgb.b - newRgb.b) > 1;

      if (hasChanged) {
        logger.warn('ORCHESTRATOR', '🚨 BLOCKED: Attempted skin tone change during projection session (non-override)', {
          lockedRGB: currentRgb,
          attemptedRGB: newRgb,
          philosophy: 'projection_session_skin_tone_lock'
        });
      }
      return refs.processedSkinToneRef.current;
    }

    const currentRgb = refs.processedSkinToneRef.current?.rgb;
    const newRgb = computed?.rgb;
    const hasChanged = !currentRgb || !newRgb ||
      currentRgb.r !== newRgb.r ||
      currentRgb.g !== newRgb.g ||
      currentRgb.b !== newRgb.b;

    if (hasChanged) {
      refs.processedSkinToneRef.current = computed;
      if (props.overrideSkinTone) {
        refs.processedSkinToneLockedRef.current = true;
        logger.info('ORCHESTRATOR', '🔒 Skin tone LOCKED for projection session', {
          lockedRGB: newRgb,
          philosophy: 'skin_tone_lock_activated'
        });
      }
    }
    return refs.processedSkinToneRef.current;
  }, [
    props.savedAvatarPayload?.skin_tone,
    props.skinTone,
    props.scanResult,
    props.overrideSkinTone
  ]);

  const isReady = viewerState.isViewerReady && !viewerState.isLoading && !viewerState.error;
  const hasError = !!viewerState.error;

  return {
    viewerState,
    setViewerState,
    refs,
    finalGender,
    processedSkinTone,
    isReady,
    hasError
  };
}
