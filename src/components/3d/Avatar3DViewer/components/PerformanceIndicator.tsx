/**
 * Performance Indicator Component
 * Affiche des indicateurs visuels de performance pour les utilisateurs mobiles
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '../../../../ui/icons/registry';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { detectDeviceCapabilities, PerformanceMonitor } from '../../../../lib/3d/performance/mobileDetection';
import logger from '../../../../lib/utils/logger';

interface PerformanceIndicatorProps {
  performanceMonitor?: PerformanceMonitor;
  showDetails?: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  performanceMonitor,
  showDetails = false
}) => {
  const [fps, setFps] = useState<number>(60);
  const [averageFps, setAverageFps] = useState<number>(60);
  const [isOverheating, setIsOverheating] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof detectDeviceCapabilities> | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Detect device capabilities once
    const capabilities = detectDeviceCapabilities();
    setDeviceInfo(capabilities);

    logger.info('PERFORMANCE_INDICATOR', 'Device capabilities detected for display', {
      type: capabilities.type,
      performanceLevel: capabilities.performanceLevel,
      isLowEndDevice: capabilities.isLowEndDevice,
      philosophy: 'performance_indicator_init'
    });
  }, []);

  useEffect(() => {
    if (!performanceMonitor) return;

    const interval = setInterval(() => {
      const currentFps = performanceMonitor.getFPS();
      const avgFps = performanceMonitor.getAverageFPS();
      const overheating = performanceMonitor.isDeviceOverheating();

      setFps(currentFps);
      setAverageFps(avgFps);
      setIsOverheating(overheating);

      // Show warning if performance is degraded
      if (avgFps < 20 && !showWarning) {
        setShowWarning(true);
        logger.warn('PERFORMANCE_INDICATOR', 'Low performance detected', {
          fps: currentFps,
          averageFps: avgFps,
          philosophy: 'performance_warning'
        });
      } else if (avgFps >= 25 && showWarning) {
        setShowWarning(false);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [performanceMonitor, showWarning]);

  // Don't show indicator on desktop
  if (!deviceInfo || !deviceInfo.isMobile) {
    return null;
  }

  const getPerformanceColor = (fps: number): string => {
    if (fps >= 25) return '#10b981'; // Green
    if (fps >= 15) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getPerformanceLabel = (level: string): string => {
    switch (level) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Économie';
      default:
        return level;
    }
  };

  return (
    <>
      {/* Compact Performance Badge */}
      {!showDetails && (
        <div
          className="absolute top-4 right-4 z-10 px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${getPerformanceColor(averageFps)}40`,
            boxShadow: `0 0 20px ${getPerformanceColor(averageFps)}30`
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: getPerformanceColor(averageFps),
                boxShadow: `0 0 8px ${getPerformanceColor(averageFps)}`
              }}
            />
            <span className="text-white/90 text-xs font-medium">
              {Math.round(averageFps)} FPS
            </span>
          </div>
        </div>
      )}

      {/* Detailed Performance Info */}
      {showDetails && (
        <div
          className="absolute top-4 right-4 z-10 p-4 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '200px'
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs">FPS Actuel</span>
              <span
                className="text-sm font-bold"
                style={{ color: getPerformanceColor(fps) }}
              >
                {Math.round(fps)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs">FPS Moyen</span>
              <span
                className="text-sm font-bold"
                style={{ color: getPerformanceColor(averageFps) }}
              >
                {Math.round(averageFps)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs">Mode</span>
              <span className="text-white text-xs font-medium">
                {getPerformanceLabel(deviceInfo?.performanceLevel || 'medium')}
              </span>
            </div>

            {isOverheating && (
              <div className="pt-2 mt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-orange-400">
                  <SpatialIcon Icon={ICONS.AlertTriangle} size={12} />
                  <span className="text-xs">Surchauffe détectée</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div
              className="p-6 rounded-2xl max-w-sm mx-4"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <SpatialIcon Icon={ICONS.AlertTriangle} size={20} color="#ef4444" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Performance dégradée</h4>
                  <p className="text-white/60 text-xs">Réduction automatique de la qualité</p>
                </div>
              </div>

              <p className="text-white/80 text-xs leading-relaxed mb-4">
                Votre appareil rencontre des difficultés. La qualité d'affichage a été réduite pour éviter la surchauffe.
              </p>

              <button
                onClick={() => setShowWarning(false)}
                className="w-full py-2 px-4 rounded-lg text-xs font-medium text-white"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                Compris
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PerformanceIndicator;
