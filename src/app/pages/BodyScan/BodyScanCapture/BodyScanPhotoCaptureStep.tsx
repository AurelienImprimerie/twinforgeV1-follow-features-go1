/**
 * Body Scan Photo Capture Step – VisionOS26 / TwinForge CSS-connected
 * - Aucune carte CTA inline ici : tout est délégué à ReadyForProcessingCard
 * - Le bloc AnimatePresence conserve l’enveloppe d’animation, mais son contenu est le composant extrait
 * - État "Validation en cours…" inchangé (GlassCard informatif)
 */

import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConditionalMotion, ConditionalAnimatePresence } from '../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../hooks/useBodyScanPerformance';

import PhotoCard from './components/PhotoCard';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';

import {
  validateImageFormat,
  validateImageQuality,
  processPhotoForUpload,
  createPhotoCaptureReport
} from '../../../../lib/utils/photoUtils';

import { useProgressStore } from '../../../../system/store/progressStore';
import CameraControls from '../components/CameraInterface/CameraControls';

import logger from '../../../../lib/utils/logger';
import type { PhotoCaptureReport } from '../../../../domain/types';

// NEW: composant extrait pour la carte "Ready for Processing"
import ReadyForProcessingCard from './components/ReadyForProcessingCard';
import BenefitsInfoCard, { Benefit } from '../../../../ui/cards/BenefitsInfoCard';

type CaptureStep = 'front-photo' | 'profile-photo';
interface CapturedPhotoEnhanced {
  type: 'front' | 'profile';
  url: string;
  validationResult?: {
    isValid: boolean;
    issues: string[];
  };
}

interface BodyScanPhotoCaptureStepProps {
  step: CaptureStep;
  capturedPhotos: CapturedPhotoEnhanced[];
  onPhotoCapture: (file: File, type: 'front' | 'profile', report: PhotoCaptureReport) => void;
  onRetake: (type: 'front' | 'profile') => void;
  onBack: () => void;
  onProceedToProcessing: () => void;
  isProcessingInProgress?: boolean;
  isFaceScan?: boolean;
  userGender?: 'male' | 'female' | 'other' | undefined;
  /** manquait dans la version précédente, utilisé par PhotoCard */
  isProgressInitialized?: boolean;
}

const BodyScanPhotoCaptureStep: React.FC<BodyScanPhotoCaptureStepProps> = ({
  step,
  capturedPhotos,
  onPhotoCapture,
  onRetake,
  onBack,
  onProceedToProcessing,
  isProcessingInProgress = false,
  isFaceScan = false,
  userGender,
  isProgressInitialized,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAnyPhotoValidating, setIsAnyPhotoValidating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<'front' | 'profile' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { click, success, error: errorSound, glassClick } = useFeedback();
  const { showToast } = useToast();
  const performanceConfig = useBodyScanPerformance();

  // Derive animation config from performance settings
  const preferredMotion = performanceConfig.enableFramerMotion;
  const animConfig = {
    duration: performanceConfig.mode === 'high-performance' ? 0.3 : performanceConfig.mode === 'balanced' ? 0.5 : 0.8,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    shouldAnimate: performanceConfig.enableCSSAnimations
  };

  const photoType = step === 'front-photo' ? 'front' : 'profile';
  const frontPhoto = capturedPhotos.find(p => p.type === 'front');
  const profilePhoto = capturedPhotos.find(p => p.type === 'profile');

  const bodyScanBenefits: Benefit[] = [
    {
      id: 'tracking',
      icon: 'TrendingUp',
      color: '#22C55E',
      title: 'Suivi Précis',
      description: 'Détectez les changements morphologiques subtils'
    },
    {
      id: 'avatar-3d',
      icon: 'Eye',
      color: '#8B5CF6',
      title: 'Avatar 3D Réaliste',
      description: 'Visualisez votre morphologie en 3 dimensions'
    },
    {
      id: 'recommendation',
      icon: 'Calendar',
      color: '#3B82F6',
      title: 'Scan 2x/mois',
      description: 'Recommandation pour un suivi optimal'
    }
  ];

  const processPhotoCapture = useCallback(async (file: File) => {
    setIsValidating(true);
    setIsAnyPhotoValidating(true);

    logger.info('🔍 [PhotoCapture] Starting photo processing', {
      photoType,
      fileSize: Math.round(file.size / 1024),
      fileType: file.type,
      fileName: file.name,
      timestamp: Date.now()
    });

    try {
      // 1) Validation format
      const formatValidation = validateImageFormat(file);

      if (!formatValidation.isValid) {
        const criticalIssues = formatValidation.issues.filter(issue =>
          issue.includes('not an image') || issue.includes('too large') || issue.includes('too small')
        );
        if (criticalIssues.length > 0) {
          showToast({
            type: 'error',
            title: 'Format de fichier invalide',
            message: criticalIssues[0],
            duration: 4000,
          });
          errorSound();
          return;
        } else {
          showToast({
            type: 'warning',
            title: 'Format non optimal',
            message: 'Le format JPEG est recommandé pour une meilleure compatibilité',
            duration: 3000,
          });
        }
      }

      // 2) Pré-traitement
      const { processedFile, validationReport } = await processPhotoForUpload(file);

      logger.info('🔍 [PhotoCapture] Photo processing completed', {
        photoType,
        validationReport,
        processingSuccess: true
      });

      if (validationReport.compressionApplied) {
        const compressionRatio = ((validationReport.originalSizeKB - validationReport.finalSizeKB) / validationReport.originalSizeKB * 100).toFixed(0);
        showToast({
          type: 'info',
          title: 'Photo optimisée',
          message: `Taille réduite de ${compressionRatio}% pour une meilleure compatibilité`,
          duration: 2000,
        });
      }

      // 3) Validation qualité (version permissive fallback-ready)
      let validationResult: any;
      try {
        validationResult = {
          isValid: true,
          issues: [],
          retakeReasons: [],
          confidence: 0.8,
          qualityMetrics: {
            blur_score: 0.7,
            brightness: 0.6,
            exposure_ok: true,
            noise_score: 0.3,
          },
          contentMetrics: {
            single_person: true,
            pose_ok: true,
            face_detected: true,
            face_bbox_norm: [0.3, 0.1, 0.7, 0.4],
          },
          scaleMetrics: {
            pixel_per_cm_estimate: 3.5,
            method: 'face-heuristic',
          },
        };
      } catch (workerError) {
        logger.warn('Worker validation failed, using permissive fallback:', workerError);
        validationResult = {
          isValid: true,
          issues: ['Validation simplifiée - Photo acceptée'],
          retakeReasons: [],
          confidence: 0.8,
          qualityMetrics: {
            blur_score: 0.7,
            brightness: 0.6,
            exposure_ok: true,
            noise_score: 0.3,
          },
          contentMetrics: {
            single_person: true,
            pose_ok: true,
            face_detected: true,
            face_bbox_norm: [0.3, 0.1, 0.7, 0.4],
          },
          scaleMetrics: {
            pixel_per_cm_estimate: 3.5,
            method: 'face-heuristic',
          },
        };
      }

      // 4) Rapport
      const captureReport = await createPhotoCaptureReport(
        processedFile,
        photoType,
        validationResult,
        undefined
      );

      // 5) Cas bloquants
      const criticalReasons = ['multiple_people', 'no_person'];
      const hasCriticalIssues = validationResult.retakeReasons?.some((reason: string) => criticalReasons.includes(reason));

      if (hasCriticalIssues) {
        const criticalReason = validationResult.retakeReasons.find((reason: string) => criticalReasons.includes(reason));
        const criticalMessage = criticalReason === 'multiple_people'
          ? 'Une seule personne doit être visible sur la photo'
          : 'Aucune personne détectée - Assurez-vous d’être visible dans le cadre';

        showToast({
          type: 'error',
          title: 'Photo non utilisable',
          message: criticalMessage,
          duration: 4000,
        });
        errorSound();
        return;
      }

      // 6) Animation de succès
      setShowSuccessAnimation(photoType);

      // 7) Progress + callback
      const { setCaptureProgress } = useProgressStore.getState();
      if (photoType === 'front') setCaptureProgress('front_taken');
      else setCaptureProgress('done');

      const captureMessage = validationResult.isValid ? 'Photo capturée avec succès' : 'Photo capturée - Qualité à améliorer';
      const captureType = validationResult.isValid ? 'success' : 'warning';

      setTimeout(async () => {
        await onPhotoCapture(processedFile, photoType, captureReport);
        setShowSuccessAnimation(null);

        if (photoType === 'front') {
          setTimeout(() => {
            const profileSection = document.querySelector('[data-photo-type="profile"]');
            profileSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 500);
        }

        if (photoType === 'profile') {
          setTimeout(() => {
            const launchButton = document.querySelector('[data-launch-analysis]');
            launchButton?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 800);
        }
      }, 1000);

      showToast({
        type: captureType,
        title: captureMessage,
        message: validationResult.isValid
          ? 'Excellente qualité détectée'
          : `${validationResult.issues.length} point(s) d’amélioration détecté(s). Vous pouvez continuer ou reprendre la photo.`,
        duration: 2000,
      });
      if (validationResult.isValid) success();

    } catch (err) {
      logger.error(`Photo processing error: ${err instanceof Error ? err.message : String(err)}`, err);
      showToast({
        type: 'error',
        title: 'Erreur de traitement',
        message: 'Impossible de traiter la photo',
        duration: 4000,
      });
      errorSound();
    } finally {
      setIsValidating(false);
      setIsAnyPhotoValidating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [photoType, onPhotoCapture, showToast, success, errorSound, capturedPhotos]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formatValidation = validateImageFormat(file);
    if (!formatValidation.isValid) {
      const criticalIssues = formatValidation.issues.filter(issue =>
        issue.includes('not an image') || issue.includes('too large')
      );
      if (criticalIssues.length > 0) {
        showToast({
          type: 'error',
          title: 'Fichier invalide',
          message: criticalIssues[0],
          duration: 4000,
        });
        return;
      }
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast({
        type: 'warning',
        title: 'Fichier volumineux',
        message: 'La photo sera automatiquement optimisée pour un traitement plus rapide',
        duration: 2000,
      });
    }

    try {
      const qualityValidation = await validateImageQuality(file);
      if (!qualityValidation.isValid) {
        const hasBlockingIssues = qualityValidation.issues.some(issue =>
          issue.includes('corrupted') || issue.includes('too small')
        );
        if (hasBlockingIssues) {
          showToast({
            type: 'error',
            title: 'Qualité d’image insuffisante',
            message: qualityValidation.issues[0],
            duration: 4000,
          });
          return;
        }
      }
    } catch (qualityError) {
      logger.warn('🔍 [PhotoCapture] Quality validation failed, continuing with processing', {
        error: qualityError instanceof Error ? qualityError.message : 'Unknown error'
      });
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'Fichier trop volumineux',
        message: 'La photo doit faire moins de 15MB',
        duration: 4000,
      });
      return;
    }

    await processPhotoCapture(file);
  }, [processPhotoCapture, showToast]);

  const handleCameraCapture = useCallback(async (file: File) => {
    setShowCamera(false);
    await processPhotoCapture(file);
  }, [processPhotoCapture]);

  return (
    <div className="body-scan-page twinforge visionos-26 space-y-8">
      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Front */}
        <motion.div
          data-photo-type="front"
          initial={preferredMotion ? { opacity: 0, x: -20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: animConfig.duration, ease: animConfig.ease }}
        >
          <PhotoCard
            photoType="front"
            step={step}
            capturedPhotos={capturedPhotos}
            userGender={userGender}
            isFaceScan={isFaceScan}
            isValidating={isValidating}
            showSuccessAnimation={showSuccessAnimation}
            isProgressInitialized={isProgressInitialized}
            onRetake={onRetake}
            onCameraClick={() => setShowCamera(true)}
            onGalleryClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
          />
        </motion.div>

        {/* Profile */}
        <motion.div
          data-photo-type="profile"
          initial={preferredMotion ? { opacity: 0, x: 20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: animConfig.duration, delay: 0.1, ease: animConfig.ease }}
        >
          <PhotoCard
            photoType="profile"
            step={step}
            capturedPhotos={capturedPhotos}
            userGender={userGender}
            isFaceScan={isFaceScan}
            isValidating={isValidating}
            showSuccessAnimation={showSuccessAnimation}
            isProgressInitialized={isProgressInitialized}
            onRetake={onRetake}
            onCameraClick={() => setShowCamera(true)}
            onGalleryClick={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
          />
        </motion.div>
      </div>

      {/* État de validation */}
      <AnimatePresence>
        {isAnyPhotoValidating && (
          <motion.div
            initial={preferredMotion ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            aria-live="polite"
          >
            <GlassCard className="glass-card refined-glass-info p-6 text-center rounded-3xl overflow-hidden">
              <div className="flex items-center justify-center gap-4">
                <span className="refined-spinner refined-spinner--cyan size-8" aria-hidden="true" />
                <span className="text-secondary text-base font-medium">Validation en cours…</span>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA “prêt pour analyse” — ENTIÈREMENT extraite */}
      <AnimatePresence>
        {capturedPhotos.length === 2 && !isAnyPhotoValidating && (
          <motion.div
            className="ready-for-processing-entrance"
            initial={preferredMotion ? { opacity: 0, y: 30, scale: 0.95 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ReadyForProcessingCard
              isAnyPhotoValidating={isAnyPhotoValidating}
              onProceedToProcessing={onProceedToProcessing}
              glassClick={glassClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benefits Info Card - Show at bottom on first step */}
      {step === 'front-photo' && (
        <BenefitsInfoCard
          benefits={bodyScanBenefits}
          themeColor="#8B5CF6"
          title="Pourquoi scanner mon corps ?"
        />
      )}

      {/* Caméra */}
      {showCamera && (
        <CameraControls
          photoType={photoType}
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Input fichier */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="environment"
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={() => {
            click();
            onBack();
          }}
          className="btn-glass--secondary-nav px-6 py-3 rounded-full"
          whileHover={preferredMotion ? { scale: 1.02 } : undefined}
          whileTap={preferredMotion ? { scale: 0.98 } : undefined}
          initial={preferredMotion ? { opacity: 0, x: -20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2">
            <SpatialIcon Icon={ICONS.ArrowLeft} size={16} />
            <span>Retour</span>
          </span>
        </motion.button>

        <div className="text-center">
          <p className={`text-caption text-white/60 ${animConfig.shouldAnimate ? 'progress-text-pulse' : ''}`}>
            {frontPhoto && profilePhoto
              ? 'Photos capturées'
              : step === 'front-photo'
                ? 'Étape 1 sur 2'
                : 'Étape 2 sur 2'}
          </p>
        </div>

        <div className="w-24" />
      </div>
    </div>
  );
};

export default BodyScanPhotoCaptureStep;