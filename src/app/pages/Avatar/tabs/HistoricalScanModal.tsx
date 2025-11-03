// src/app/pages/Avatar/tabs/HistoricalScanModal.tsx
import React, { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

// Lazy load Avatar3DViewer
const Avatar3DViewer = lazy(() => import('../../../../components/3d/Avatar3DViewer'));
import { bodyScanRepo } from '../../../../system/data/repositories/bodyScanRepo';
import { useUserStore } from '../../../../system/store/userStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoricalScanModalProps {
  scanId: string;
  onClose: () => void;
}

const HistoricalScanModal: React.FC<HistoricalScanModalProps> = ({ scanId, onClose }) => {
  const { profile } = useUserStore();
  const userProfile = profile;

  const avatar3DRef = useRef<any>(null);
  const [isViewerReady, setIsViewerReady] = useState(false);

  // Log scanId when modal receives it
  useEffect(() => {
    console.log('HISTORICAL_SCAN_MODAL: Received scanId:', scanId);
  }, [scanId]);

  const { data: scan, isLoading, error } = useQuery({
    queryKey: ['historical-scan', scanId],
    queryFn: () => bodyScanRepo.getById(scanId),
    enabled: !!scanId,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  });

  // Log loading and error states
  useEffect(() => {
    console.log('HISTORICAL_SCAN_MODAL: isLoading:', isLoading, 'error:', error);
  }, [isLoading, error]);

  // Log scan data when available
  useEffect(() => {
    if (scan) {
      console.log('HISTORICAL_SCAN_MODAL: Scan data loaded:', scan);
    }
  }, [scan]);

  const scanDate = scan ? format(new Date(scan.created_at), 'dd MMMM yyyy', { locale: fr }) : 'N/A';

  // Effet pour ajuster la caméra une fois le viewer 3D prêt
  useEffect(() => {
    if (isViewerReady && avatar3DRef.current?.resetCamera) {
      avatar3DRef.current.resetCamera();
    }
  }, [isViewerReady]);

  // Fermer la modale avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const modalContent = (
    <motion.div
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-lg flex items-start justify-center p-2 sm:p-4 pt-20 sm:pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="relative w-full max-w-6xl my-4 sm:my-8 rounded-xl overflow-y-auto flex flex-col"
        style={{ 
          height: 'calc(100vh - 8rem)',
          maxHeight: '900px',
          minHeight: '600px'
        }}
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="flex-1 p-4 sm:p-6 flex flex-col h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0 pb-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg sm:text-xl flex items-center gap-2">
              <SpatialIcon Icon={ICONS.Timeline} size={24} className="text-blue-400" />
              <span className="truncate">Scan du {scanDate}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <SpatialIcon Icon={ICONS.X} size={20} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 relative min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 3D Viewer Section */}
            <div className="lg:col-span-2 relative min-h-0">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <SpatialIcon Icon={ICONS.Loader2} size={48} className="text-purple-400 animate-spin mx-auto mb-4" />
                  <p className="text-white/70">Chargement du scan...</p>
                </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-red-400">
                  <SpatialIcon Icon={ICONS.AlertCircle} size={48} className="mx-auto mb-4" />
                  <p>Erreur de chargement du scan</p>
                  <p className="text-sm mt-2 text-red-300">{error.message}</p>
                </div>
                </div>
            )}

            {scan && !isLoading && (
                <div className="w-full h-full relative min-h-[400px]">
                {(() => {
                  // Log detailed props before passing to Avatar3DViewer
                  const morphData = scan.metrics?.final_shape_params || scan.metrics?.morph_values;
                  const limbMasses = scan.metrics?.final_limb_masses || scan.metrics?.limb_masses;
                  const skinTone = scan.metrics?.skin_tone;
                  const resolvedGender = scan.metrics?.resolved_gender || userProfile?.sex;
                  
                  console.log('HISTORICAL_SCAN_MODAL: Avatar3DViewer props:', {
                    morphData,
                    limbMasses,
                    skinTone,
                    resolvedGender,
                    scanId,
                    hasScanResult: !!scan,
                    hasUserProfile: !!userProfile
                  });
                  
                  return null;
                })()}
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><SpatialIcon Icon={ICONS.Loader2} size={32} className="text-purple-400 animate-spin" /></div>}>
                  <Avatar3DViewer
                    ref={avatar3DRef}
                    scanResult={scan}
                    userProfile={userProfile}
                    morphData={scan.metrics?.final_shape_params || scan.metrics?.morph_values}
                    limbMasses={scan.metrics?.final_limb_masses || scan.metrics?.limb_masses}
                    skinTone={scan.metrics?.skin_tone}
                    resolvedGender={scan.metrics?.resolved_gender || userProfile?.sex}
                    className="w-full h-full"
                    autoRotate={true}
                    showControls={true}
                    onViewerReady={() => setIsViewerReady(true)}
                  />
                </Suspense>
                </div>
            )}
            </div>

            {/* Information Panel */}
            {scan && !isLoading && (
              <div className="lg:col-span-1 space-y-4">
                {/* Scan Summary */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <SpatialIcon Icon={ICONS.BarChart3} size={16} className="text-blue-400" />
                    Résumé du scan
                  </h4>
                  <div className="space-y-2 text-sm">
                    {scan.metrics?.estimate_result?.processing_confidence && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Confiance</span>
                        <span className="text-white font-medium">
                          {Math.round(scan.metrics.estimate_result.processing_confidence * 100)}%
                        </span>
                      </div>
                    )}
                    {scan.metrics?.resolved_gender && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Genre détecté</span>
                        <span className="text-white font-medium capitalize">
                          {scan.metrics.resolved_gender}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/70">Date de création</span>
                      <span className="text-white font-medium">
                        {format(new Date(scan.created_at), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Measurements */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <SpatialIcon Icon={ICONS.Ruler} size={16} className="text-green-400" />
                    Mesures
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {scan.metrics?.estimate_result?.extracted_data?.raw_measurements?.weight_kg && (
                      <div className="text-center bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">Poids</p>
                        <p className="text-white font-medium">
                          {scan.metrics.estimate_result.extracted_data.raw_measurements.weight_kg.toFixed(1)} kg
                        </p>
                      </div>
                    )}
                    {scan.metrics?.estimate_result?.extracted_data?.raw_measurements?.height_cm && (
                      <div className="text-center bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">Taille</p>
                        <p className="text-white font-medium">
                          {scan.metrics.estimate_result.extracted_data.raw_measurements.height_cm.toFixed(1)} cm
                        </p>
                      </div>
                    )}
                    {scan.metrics?.estimate_result?.estimated_bmi && (
                      <div className="text-center bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">IMC</p>
                        <p className="text-white font-medium">
                          {scan.metrics.estimate_result.estimated_bmi.toFixed(1)}
                        </p>
                      </div>
                    )}
                    {scan.metrics?.estimate_result?.extracted_data?.processing_confidence && (
                      <div className="text-center bg-white/5 rounded p-2">
                        <p className="text-white/50 text-xs">Précision</p>
                        <p className="text-white font-medium">
                          {Math.round(scan.metrics.estimate_result.extracted_data.processing_confidence * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Morphology Insights */}
                {(scan.metrics?.final_shape_params || scan.metrics?.morph_values) && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <SpatialIcon Icon={ICONS.Zap} size={16} className="text-purple-400" />
                      Morphologie
                    </h4>
                    <div className="text-sm text-white/70">
                      <p>Modèle 3D généré avec {Object.keys(scan.metrics?.final_shape_params || scan.metrics?.morph_values || {}).length} paramètres morphologiques.</p>
                      {scan.metrics?.final_limb_masses && (
                        <p className="mt-2">Masses des membres ajustées pour une représentation précise.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );

  // Render modal using portal to ensure it appears above all other content
  return createPortal(modalContent, document.body);
};

export default HistoricalScanModal;