import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { useUserStore } from '@/system/store/userStore';
import { useToast } from '@/ui/components/ToastProvider';
import { useFeedback } from '@/hooks/useFeedback';
import { useProgressStore } from '@/system/store/progressStore';
import FaceScanProgressHeader from './FaceScan/FaceScanProgressHeader';
import FaceScanPhotoCaptureStep from './FaceScan/FaceScanPhotoCaptureStep';
import { faceScanRepo } from '@/system/data/repositories/faceScanRepo';
import type { PhotoCaptureReport, CapturedPhotoEnhanced } from '@/domain/types';
import logger from '@/lib/utils/logger';
import { useNavigate } from 'react-router-dom';
import { toDbGender } from '@/lib/morph/keys/keyNormalizers';
import { supabase } from '@/system/supabase/client';
import ImmersiveFaceAnalysis from './FaceScan/components/ImmersiveFaceAnalysis';
import FaceScanCelebrationStep from './FaceScan/FaceScanCelebrationStep';
import FaceScanReviewPage from './FaceScan/FaceScanReviewPage';

type FaceScanStep = 'capture' | 'processing' | 'results';

// Définition des étapes spécifiques au scan facial
const FACE_SCAN_STEPS = [
  { id: 'capture', title: 'Capture Photo Faciale', subtitle: 'Photos de face et de profil', icon: 'Camera' as const, color: '#18E3FF' },
  { id: 'processing', title: 'Analyse Faciale Avancée', subtitle: 'Traitement de votre visage', icon: 'Scan' as const, color: '#18E3FF' },
  { id: 'results', title: 'Avatar Facial Prêt', subtitle: 'Votre reflet numérique est complet', icon: 'Check' as const, color: '#18E3FF' },
];

const FaceScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, sessionInfo, updateProfile } = useUserStore();
  const { showToast } = useToast();
  const { success, error: errorSound } = useFeedback();
  const { startProgress, setOverallProgress, setComplete, resetProgress, startDynamicProcessing, stopDynamicProcessing, setServerScanId, progress, message, subMessage, isActive, steps, currentStep: progressStep } = useProgressStore();

  // State for the face scan flow
  const [currentStep, setCurrentStep] = useState<FaceScanStep>('capture');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotoEnhanced[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingGuardRef = useRef(false);
  const clientScanIdRef = useRef<string | null>(null);
  const [isProgressInitialized, setIsProgressInitialized] = useState(false);

  // Initialize flow
  useEffect(() => {
    // Only initialize once per mount
    if (!clientScanIdRef.current) {
      const newScanId = nanoid();
      clientScanIdRef.current = newScanId;

      logger.info('FACE_SCAN_PAGE', 'Initializing face scan flow', {
        clientScanId: newScanId,
        timestamp: new Date().toISOString()
      });

      // Only reset if there's an active scan from a different flow
      const currentState = useProgressStore.getState();
      if (currentState.isActive && currentState.clientScanId !== newScanId) {
        logger.warn('FACE_SCAN_PAGE', 'Resetting progress for different scan', {
          previousScanId: currentState.clientScanId,
          newScanId
        });
        resetProgress();
      }

      startProgress(FACE_SCAN_STEPS, newScanId, 'face');
      setIsProgressInitialized(true);
    }

    return () => {
      // Only cleanup if this is truly unmounting (not just re-rendering)
      logger.info('FACE_SCAN_PAGE', 'Face scan page unmounting', {
        clientScanId: clientScanIdRef.current,
        timestamp: new Date().toISOString()
      });

      stopDynamicProcessing();
      // Don't reset progress or clientScanId here - let next mount handle it
    };
  }, []);

  const userId = useMemo(() => sessionInfo?.userId || profile?.userId || null, [sessionInfo, profile]);
  const userGender = useMemo(() => profile?.sex || 'male', [profile?.sex]);

  const handlePhotoCapture = useCallback(async (
    file: File,
    type: 'front' | 'profile',
    captureReport: PhotoCaptureReport
  ) => {
    const photo: CapturedPhotoEnhanced = {
      file,
      url: URL.createObjectURL(file),
      type,
      validationResult: {
        isValid: captureReport.validation?.isValid ?? false,
        issues: captureReport.validation?.issues ?? [],
        retakeReasons: captureReport.validation?.retakeReasons ?? [],
        confidence: captureReport.validation?.confidence ?? 0,
      },
      captureReport,
    };

    setCapturedPhotos(prev => {
      const filtered = prev.filter(p => p.type !== type);
      const newPhotos = [...filtered, photo];
      logger.info('FACE_SCAN_FLOW', 'Photo captured', { type, count: newPhotos.length });
      return newPhotos;
    });

    if (useProgressStore.getState().isActive) {
      if (type === 'front') {
        setOverallProgress(33, 'Capture Photo Faciale', 'Photo de face capturée');
      } else if (type === 'profile') {
        setOverallProgress(66, 'Capture Photo Faciale', 'Photo de profil capturée');
      }
    } else {
      logger.warn('FACE_SCAN_FLOW', 'Progress store is not active when calling setOverallProgress for photo capture.');
    }
  }, [setOverallProgress]);

  const handleRetake = useCallback((type: 'front' | 'profile') => {
    setCapturedPhotos(prev => prev.filter(p => p.type !== type));
    logger.info('FACE_SCAN_FLOW', 'Photo retake', { type });
  }, []);

  const onProceedToProcessing = useCallback(async () => {
    if (processingGuardRef.current) {
      logger.warn('FACE_SCAN_FLOW', 'Processing already in progress, ignoring duplicate call.');
      return;
    }

    if (capturedPhotos.length < 2) {
      showToast({ type: 'error', title: 'Photos manquantes', message: 'Veuillez capturer les deux photos (face et profil).' });
      return;
    }
    if (!userId) {
      showToast({ type: 'error', title: 'Erreur', message: 'Utilisateur non identifié.' });
      return;
    }

    if (!useProgressStore.getState().isActive) {
      logger.error('FACE_SCAN_FLOW', 'Progress store is not active, cannot start processing pipeline.');
      showToast({ type: 'error', title: 'Erreur interne', message: 'Le système de progression n\'est pas actif. Veuillez recharger la page.' });
      return;
    }

    processingGuardRef.current = true;
    setIsProcessing(true);
    setCurrentStep('processing');
    
    startDynamicProcessing(70, 95);

    const clientScanId = clientScanIdRef.current!;

    try {
      logger.info('FACE_SCAN_FLOW', '=== START FACE SCAN PIPELINE ===', {
        clientScanId,
        userId,
        userGender,
        photosCount: capturedPhotos.length,
        timestamp: new Date().toISOString(),
        philosophy: 'pipeline_start'
      });

      // Step 1: Upload photos to Supabase Storage
      logger.info('FACE_SCAN_FLOW', '=== Step 1/5: Uploading photos to storage ===', {
        clientScanId,
        photosToUpload: capturedPhotos.map(p => p.type),
        photosCount: capturedPhotos.length,
        timestamp: new Date().toISOString(),
        philosophy: 'pipeline_step_1_upload'
      });

      const uploadedPhotos = await Promise.all(capturedPhotos.map(async (photo) => {
        const filePath = `face-scans/${userId}/${clientScanId}/${photo.type}.jpg`;
        const { data, error: uploadError } = await supabase.storage
          .from('body-scans') // CHANGEMENT ICI : 'avatars' -> 'body-scans'
          .upload(filePath, photo.file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          logger.error('FACE_SCAN_FLOW', `Failed to upload ${photo.type} photo to Supabase Storage`, { uploadError });
          throw new Error(`Failed to upload photo: ${uploadError.message}`);
        }

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('body-scans') // CHANGEMENT ICI : 'avatars' -> 'body-scans'
          .createSignedUrl(filePath, 300);

        if (signedUrlError) {
          logger.error('FACE_SCAN_FLOW', `Failed to create signed URL for ${photo.type} photo`, { signedUrlError });
          throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
        }

        if (!signedUrlData || !signedUrlData.signedUrl) {
            logger.error('FACE_SCAN_FLOW', `Signed URL data is invalid or empty for ${photo.type} photo`, { signedUrlData, filePath });
            throw new Error(`Invalid or empty signed URL for ${photo.type} photo`);
        }

        logger.info('FACE_SCAN_FLOW', `Photo uploaded successfully: ${photo.type}`, {
            clientScanId,
            photoType: photo.type,
            signedUrl: signedUrlData.signedUrl.substring(0, 100) + '...',
            filePath,
            hasCaptureReport: !!photo.captureReport,
            hasSkinTone: !!photo.captureReport?.skin_tone,
            timestamp: new Date().toISOString()
        });

        return {
          url: signedUrlData.signedUrl,
          view: photo.type,
          report: photo.captureReport
        };
      }));

      logger.info('FACE_SCAN_FLOW', 'All photos uploaded successfully', {
        clientScanId,
        uploadedCount: uploadedPhotos.length,
        photos: uploadedPhotos.map(p => ({
          view: p.view,
          hasUrl: !!p.url,
          hasReport: !!p.report,
          hasSkinTone: !!p.report?.skin_tone
        })),
        timestamp: new Date().toISOString()
      });

      // Step 2: Semantic Analysis
      logger.info('FACE_SCAN_FLOW', '=== Step 2/5: Starting semantic analysis ===', {
        clientScanId,
        uploadedPhotosCount: uploadedPhotos.length,
        userGender,
        timestamp: new Date().toISOString(),
        philosophy: 'pipeline_step_2_semantic'
      });

      const semanticResult = await faceScanRepo.semantic({
        user_id: userId,
        photos: uploadedPhotos,
        user_declared_gender: userGender,
        clientScanId,
      });
      logger.info('FACE_SCAN_FLOW', 'Semantic analysis completed successfully', {
        clientScanId,
        semanticProfile: semanticResult.semantic_profile,
        confidence: semanticResult.semantic_confidence,
        adjustments: semanticResult.adjustments_made?.length || 0,
        timestamp: new Date().toISOString(),
        philosophy: 'semantic_complete'
      });

      // Step 3: Archetype Matching
      logger.info('FACE_SCAN_FLOW', '=== Step 3/5: Starting archetype matching ===', {
        clientScanId,
        semanticProfile: {
          face_shape: semanticResult.semantic_profile.face_shape,
          eye_shape: semanticResult.semantic_profile.eye_shape,
          nose_type: semanticResult.semantic_profile.nose_type,
          lip_fullness: semanticResult.semantic_profile.lip_fullness,
        },
        semanticConfidence: semanticResult.semantic_confidence,
        timestamp: new Date().toISOString(),
        philosophy: 'pipeline_step_3_matching'
      });

      const matchResult = await faceScanRepo.match({
        user_id: userId,
        face_semantic_profile: {
          face_shape: semanticResult.semantic_profile.face_shape,
          eye_shape: semanticResult.semantic_profile.eye_shape,
          nose_type: semanticResult.semantic_profile.nose_type,
          lip_fullness: semanticResult.semantic_profile.lip_fullness,
          gender: userGender,
        },
        clientScanId,
      });
      logger.info('FACE_SCAN_FLOW', 'Archetype matching completed successfully', {
        clientScanId,
        selectedArchetypesCount: matchResult.selected_archetypes?.length || 0,
        topArchetype: matchResult.selected_archetypes?.[0]?.name,
        topScore: matchResult.selected_archetypes?.[0]?.score,
        k5EnvelopeKeys: Object.keys(matchResult.k5_envelope || {}).length,
        timestamp: new Date().toISOString(),
        philosophy: 'match_complete'
      });

      // Step 4: AI Refinement
      logger.info('FACE_SCAN_FLOW', '=== Step 4/5: Starting AI morphology refinement ===', {
        clientScanId,
        blendFaceParamsCount: Object.keys(matchResult.selected_archetypes?.[0]?.face_values || {}).length,
        hasK5Envelope: !!matchResult.k5_envelope,
        selectedArchetypesCount: matchResult.selected_archetypes?.length || 0,
        topArchetype: matchResult.selected_archetypes?.[0]?.name,
        timestamp: new Date().toISOString(),
        philosophy: 'pipeline_step_4_refinement'
      });

      const refineResult = await faceScanRepo.refine({
        scan_id: clientScanId,
        user_id: userId,
        resolvedGender: userGender,
        photos: uploadedPhotos,
        blend_face_params: matchResult.selected_archetypes?.[0]?.face_values || {},
        mapping_version: 'v1.0',
        k5_envelope: matchResult.k5_envelope,
        face_semantic_profile: semanticResult.semantic_profile,
      });
      logger.info('FACE_SCAN_FLOW', 'AI refinement completed successfully', {
        clientScanId,
        finalFaceParamsCount: Object.keys(refineResult.final_face_params || {}).length,
        aiRefine: refineResult.ai_refine,
        aiConfidence: refineResult.ai_confidence,
        adjustmentsMade: refineResult.adjustments_made?.length || 0,
        timestamp: new Date().toISOString(),
        philosophy: 'refine_complete'
      });

      // Step 5: Commit to Database
      logger.info('FACE_SCAN_FLOW', '=== Step 5/5: Committing scan to database ===', {
        clientScanId,
        hasSkinTone: !!uploadedPhotos[0]?.report?.skin_tone,
        finalFaceParamsCount: Object.keys(refineResult.final_face_params || {}).length,
        aiRefine: refineResult.ai_refine,
        aiConfidence: refineResult.ai_confidence,
        timestamp: new Date().toISOString(),
        philosophy: 'pipeline_step_5_commit'
      });

      const commitResult = await faceScanRepo.commit({
        user_id: userId,
        resolvedGender: userGender,
        estimate_result: {},
        semantic_result: semanticResult,
        match_result: matchResult,
        refine_result: refineResult,
        photos_metadata: uploadedPhotos,
        skin_tone: uploadedPhotos[0]?.report?.skin_tone || {},
        clientScanId,
      });
      logger.info('FACE_SCAN_FLOW', 'Database commit completed successfully', {
        clientScanId,
        serverScanId: commitResult.scan_id,
        success: commitResult.success,
        processingComplete: commitResult.processing_complete,
        timestamp: new Date().toISOString(),
        philosophy: 'commit_complete'
      });

      setServerScanId(commitResult.scan_id);

      await updateProfile({
        preferences: {
          ...profile?.preferences,
          face: {
            final_face_params: refineResult.final_face_params,
            skin_tone: uploadedPhotos[0]?.report?.skin_tone || {},
            resolved_gender: userGender,
            last_face_scan_id: commitResult.scan_id,
            updated_at: new Date().toISOString(),
          },
        },
      });
      logger.info('FACE_SCAN_FLOW', '=== FACE SCAN PIPELINE COMPLETED SUCCESSFULLY ===', {
        clientScanId,
        serverScanId: commitResult.scan_id,
        userId,
        finalFaceParamsCount: Object.keys(refineResult.final_face_params || {}).length,
        hasSkinTone: !!uploadedPhotos[0]?.report?.skin_tone,
        timestamp: new Date().toISOString(),
        philosophy: 'pipeline_success'
      });

      stopDynamicProcessing();
      setComplete();
      success();

      logger.info('FACE_SCAN_FLOW', 'Navigating to celebration page', {
        clientScanId,
        serverScanId: commitResult.scan_id,
        from: 'face-scan',
        to: '/face-scan/celebration',
        timestamp: new Date().toISOString(),
        philosophy: 'navigation_to_celebration'
      });

      navigate('/face-scan/celebration', {
        state: {
          scanResults: {
            ...commitResult,
            clientScanId,
            resolvedGender: userGender,
            semantic: semanticResult,
            match: matchResult,
            refine: refineResult,
            photos: uploadedPhotos
          }
        }
      });

      showToast({ type: 'success', title: 'Scan facial terminé !', message: 'Votre avatar facial a été mis à jour.' });

    } catch (err) {
      logger.error('FACE_SCAN_FLOW', 'Face scan pipeline failed', { error: err });
      errorSound();
      showToast({ type: 'error', title: 'Erreur de scan facial', message: err instanceof Error ? err.message : 'Une erreur inattendue est survenue.' });
      setCurrentStep('capture');
      resetProgress();
      stopDynamicProcessing();
    } finally {
      setIsProcessing(false);
      processingGuardRef.current = false;
    }
  }, [capturedPhotos, userId, userGender, showToast, success, errorSound, setComplete, resetProgress, startDynamicProcessing, stopDynamicProcessing, setServerScanId, profile, updateProfile, navigate]);

  const renderContent = () => {
    if (!isProgressInitialized) {
      return <GlassCard className="text-center p-8">Chargement de la progression...</GlassCard>;
    }

    if (currentStep === 'capture') {
      return (
        <FaceScanPhotoCaptureStep
          step={capturedPhotos.length === 0 ? 'front-photo' : 'profile-photo'}
          capturedPhotos={capturedPhotos}
          onPhotoCapture={handlePhotoCapture}
          onRetake={handleRetake}
          onBack={() => navigate('/avatar#avatar')}
          onProceedToProcessing={onProceedToProcessing}
          isProcessingInProgress={isProcessing}
          isProgressInitialized={isProgressInitialized}
        />
      );
    } else if (currentStep === 'processing') {
      return (
        <ImmersiveFaceAnalysis // MODIFIED: Use ImmersiveFaceAnalysis
          capturedPhotos={capturedPhotos}
          currentProgress={useProgressStore.getState().overallProgress}
          currentMessage={useProgressStore.getState().message}
          currentSubMessage={useProgressStore.getState().subMessage}
        />
      );
    } else if (currentStep === 'results') {
      return (
        <GlassCard className="text-center p-8">
          <SpatialIcon Icon={ICONS.Check} size={48} className="text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-3">Scan facial terminé !</h3>
          <p className="text-white/70 text-sm mb-6">
            Votre avatar facial a été mis à jour.
          </p>
          <button
            onClick={() => navigate('/avatar#avatar')}
            className="btn-glass--primary px-6 py-3"
          >
            <div className="flex items-center justify-center gap-2">
              <SpatialIcon Icon={ICONS.Eye} size={16} />
              <span>Voir mon avatar</span>
            </div>
          </button>
        </GlassCard>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 space-y-6 forge-body-page-container">
      {/* Face Scan Progress Header - Always visible when progress is active */}
      {isActive && steps.length > 0 && (
        <FaceScanProgressHeader
          steps={steps}
          currentStepId={progressStep}
          progress={progress}
          message={message}
          subMessage={subMessage}
        />
      )}

      {/* Main Content with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full overflow-y-auto"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FaceScanPage;

