import logger from '../../../../lib/utils/logger';
import { FRIDGE_SCAN_STEPS } from '../constants';
import type { FridgeScanPipelineState } from '../types';

export const createPhotoActions = (
  set: (partial: Partial<FridgeScanPipelineState>) => void,
  get: () => FridgeScanPipelineState
) => ({
  addCapturedPhotos: (photos: string[]) => {
    const currentPhotos = get().capturedPhotos;
    logger.debug('FRIDGE_SCAN_PIPELINE', 'Adding captured photos', {
      sessionId: get().currentSessionId,
      currentPhotosCount: currentPhotos.length,
      newPhotosCount: photos.length,
      timestamp: new Date().toISOString()
    });
    
    const analyzeStep = FRIDGE_SCAN_STEPS.find(step => step.id === 'analyze');
    
    set({
      capturedPhotos: [...get().capturedPhotos, ...photos],
      simulatedOverallProgress: analyzeStep?.startProgress || 20
    });

    logger.debug('FRIDGE_SCAN_PIPELINE', 'Captured photos updated', {
      sessionId: get().currentSessionId,
      totalPhotosCount: get().capturedPhotos.length,
      timestamp: new Date().toISOString()
    });

    logger.info('FRIDGE_SCAN_PIPELINE', 'Photos uploaded', {
      sessionId: get().currentSessionId,
      photosCount: photos.length,
      timestamp: new Date().toISOString()
    });
  },

  removeCapturedPhoto: (index: number) => {
    const state = get();
    const updatedPhotos = state.capturedPhotos.filter((_, i) => i !== index);
    set({ capturedPhotos: updatedPhotos });

    logger.debug('FRIDGE_SCAN_PIPELINE', 'Photo removed', {
      sessionId: state.currentSessionId,
      photoIndex: index,
      remainingPhotos: updatedPhotos.length,
      timestamp: new Date().toISOString()
    });
  }
});