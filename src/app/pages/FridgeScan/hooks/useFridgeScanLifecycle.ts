import { useEffect } from 'react';
import logger from '../../../../lib/utils/logger';

interface UseFridgeScanLifecycleProps {
  isActive: boolean;
  currentStep: string;
  currentSessionId: string | null;
  simulatedOverallProgress: number;
  loadingState: string;
  capturedPhotos: string[];
  startScan: () => void;
  resumePipeline: () => void;
}

/**
 * Hook to manage the lifecycle of the FridgeScan component
 * Handles initialization, photo changes logging, unmount cleanup, and auto-scrolling
 */
export const useFridgeScanLifecycle = ({
  isActive,
  currentStep,
  currentSessionId,
  simulatedOverallProgress,
  loadingState,
  capturedPhotos,
  startScan,
  resumePipeline
}: UseFridgeScanLifecycleProps) => {
  
  // Initialize scan if not active
  useEffect(() => {
    logger.debug('FRIDGE_SCAN_PAGE', 'Component mounted, checking store state after hydration', {
      isActive,
      currentStep,
      currentSessionId,
      simulatedOverallProgress,
      loadingState,
      capturedPhotosCount: capturedPhotos.length,
      timestamp: new Date().toISOString()
    });
    
    logger.info('FRIDGE_SCAN_PAGE', 'Component mounted, checking pipeline state', {
      isActive,
      currentStep,
      loadingState,
      capturedPhotosCount: capturedPhotos.length,
      currentSessionId,
      timestamp: new Date().toISOString()
    });
    
    if (!isActive && !currentSessionId) {
      // Start a completely new scan session
      logger.info('FRIDGE_SCAN_PAGE', 'Pipeline not active, starting new scan', {
        currentStep,
        loadingState,
        currentSessionId,
        timestamp: new Date().toISOString()
      });
      startScan();
    } else if (!isActive && currentSessionId) {
      // Resume an existing session that was persisted but not active
      logger.info('FRIDGE_SCAN_PAGE', 'Resuming persisted session', {
        currentSessionId,
        currentStep,
        timestamp: new Date().toISOString()
      });
      resumePipeline();
    } else {
      logger.info('FRIDGE_SCAN_PAGE', 'Pipeline already active, maintaining current state', {
        currentStep,
        loadingState,
        isActive,
        currentSessionId,
        capturedPhotosCount: capturedPhotos.length,
        timestamp: new Date().toISOString()
      });
    }
  }, []);
  
  // Log captured photos changes for debugging
  useEffect(() => {
    logger.debug('FRIDGE_SCAN_PAGE', 'Captured photos count changed', {
      capturedPhotosCount: capturedPhotos.length,
      currentStep,
      isActive,
      currentSessionId,
      timestamp: new Date().toISOString()
    });
  }, [capturedPhotos.length]);
  
  // Reset pipeline on component unmount to prevent state persistence
  useEffect(() => {
    return () => {
      logger.info('FRIDGE_SCAN_PAGE', 'Component unmounting, cleaning up pipeline', {
        currentStep,
        isActive,
        timestamp: new Date().toISOString()
      });
      // Don't reset on unmount as it might be needed for navigation
    };
  }, []);

  // Auto-scroll on step changes
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    const scrollTimer = setTimeout(scrollToTop, 150);
    
    logger.debug('FRIDGE_SCAN_PAGE', 'Auto-scroll triggered on step change', {
      currentStep,
      timestamp: new Date().toISOString()
    });
    
    return () => clearTimeout(scrollTimer);
  }, [currentStep]);

  // Auto-scroll when photos are captured - scroll to AnalyzeCTA component
  useEffect(() => {
    if (capturedPhotos.length > 0) {
      const scrollToAnalyzeCTA = () => {
        const analyzeCTA = document.getElementById('analyze-cta');

        if (analyzeCTA) {
          analyzeCTA.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });

          logger.debug('FRIDGE_SCAN_PAGE', 'Auto-scroll to AnalyzeCTA successful', {
            capturedPhotosCount: capturedPhotos.length,
            ctaElementFound: true,
            timestamp: new Date().toISOString()
          });
        } else {
          // Retry if element not yet in DOM
          logger.debug('FRIDGE_SCAN_PAGE', 'AnalyzeCTA not found, retrying...', {
            capturedPhotosCount: capturedPhotos.length,
            timestamp: new Date().toISOString()
          });

          setTimeout(() => {
            const retryElement = document.getElementById('analyze-cta');
            if (retryElement) {
              retryElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }
          }, 200);
        }
      };

      // Delay to allow DOM update
      const scrollTimer = setTimeout(scrollToAnalyzeCTA, 500);

      logger.debug('FRIDGE_SCAN_PAGE', 'Scheduling auto-scroll to AnalyzeCTA', {
        capturedPhotosCount: capturedPhotos.length,
        timestamp: new Date().toISOString()
      });

      return () => clearTimeout(scrollTimer);
    }
  }, [capturedPhotos.length]);
};