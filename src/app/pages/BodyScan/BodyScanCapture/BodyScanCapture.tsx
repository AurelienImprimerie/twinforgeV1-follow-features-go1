import React, { useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { ConditionalMotion, ConditionalAnimatePresence } from '../../../../lib/motion/ConditionalMotion';
import { useBodyScanPerformance } from '../../../../hooks/useBodyScanPerformance';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useBodyScanCaptureFlow } from './hooks/useBodyScanCaptureFlow';
import BodyScanPhotoCaptureStep from './BodyScanPhotoCaptureStep';
import { ErrorBoundary } from '../../../providers/ErrorBoundary';
import LoadingFallback from '../../../components/LoadingFallback';
import ImmersivePhotoAnalysis from './components/ImmersivePhotoAnalysis';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../../../../system/store/progressStore';
import logger from '../../../../lib/utils/logger';
import type { PhotoCaptureReport } from '../../../../domain/types';
import PageHeader from '../../../../ui/page/PageHeader';
import BodyScanProgressHeader from '../BodyScanProgressHeader';

const BodyScanCapture: React.FC = () => {
  const navigate = useNavigate();
  // Use selector to ensure component re-renders when progress changes
  const progress = useProgressStore(state => state.overallProgress);
  const message = useProgressStore(state => state.message);
  const subMessage = useProgressStore(state => state.subMessage);
  const isActive = useProgressStore(state => state.isActive);
  const steps = useProgressStore(state => state.steps);
  const progressCurrentStep = useProgressStore(state => state.currentStep);
  const startProgress = useProgressStore(state => state.startProgress);
  const performanceConfig = useBodyScanPerformance();

  // Stable scan id
  const scanIdRef = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  const {
    currentStep,
    capturedPhotos,
    setCapturedPhotos,
    scanResults,
    showValidationResults,
    validationSummary,
    userId,
    isProfileComplete,
    processingGuardRef,
    setCurrentStep,
    setScanResults,
    setShowValidationResults,
    setValidationSummary,
    onProceedToProcessing: proceedToProcessing,
    isProcessing,
  } = useBodyScanCaptureFlow({
    scanId: scanIdRef.current ?? undefined,
  });

  // Smooth scroll on step changes - Always instant for performance
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentStep]);

  // Steps for progress store (ids must match your flow)
  const bodyScanSteps = [
    { id: 'capture',     title: 'Capture Photographique', subtitle: 'Face et profil', icon: 'Camera' as const, color: '#8B5CF6' },
    { id: 'processing',  title: 'Analyse IA Avancée',     subtitle: 'Traitement en cours', icon: 'Scan' as const,   color: '#8B5CF6' },
    { id: 'celebration', title: 'Données Traitées',       subtitle: 'Préparation du rendu 3D', icon: 'Check' as const, color: '#8B5CF6' },
    { id: 'avatar',      title: 'Avatar 3D',              subtitle: 'Votre reflet numérique', icon: 'Eye' as const,   color: '#8B5CF6' },
  ];

  // Init progress once with stable id
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (!scanIdRef.current) scanIdRef.current = nanoid();
    const clientScanId = scanIdRef.current;

    const { resetProgress } = useProgressStore.getState();
    resetProgress();
    startProgress(bodyScanSteps, clientScanId, 'body');

    logger.info('BODY_SCAN_CAPTURE', 'Component initialized with scanId', {
      clientScanId,
      flowType: 'body',
      isDevelopment: import.meta.env.DEV,
      timestamp: new Date().toISOString(),
    });
  }, [startProgress]);

  const handlePhotoCapture = React.useCallback(async (
    file: File,
    type: 'front' | 'profile',
    captureReport: PhotoCaptureReport
  ) => {
    try {
      const url = URL.createObjectURL(file);
      setCapturedPhotos(prev => {
        const filtered = prev.filter(p => p.type !== type);
        const updated = [
          ...filtered,
          {
            file,
            url,
            type,
            validationResult: {
              isValid: captureReport.validation?.isValid ?? false,
              issues: captureReport.validation?.issues ?? [],
              retakeReasons: captureReport.validation?.retakeReasons ?? [],
              confidence: captureReport.validation?.confidence ?? 0,
            },
            captureReport,
          },
        ];

        logger.info('BODY_SCAN_CAPTURE', 'Photo captured successfully', {
          clientScanId: scanIdRef.current,
          photoType: type,
          totalPhotos: updated.length,
          isValid: updated.find(p => p.type === type)?.validationResult?.isValid,
        });

        return updated;
      });

      if (type === 'front') setCurrentStep('profile-photo');
    } catch (error) {
      logger.error('BODY_SCAN_CAPTURE', 'Photo capture error', {
        error,
        clientScanId: scanIdRef.current,
        photoType: type,
      });
    }
  }, [setCapturedPhotos, setCurrentStep]);

  const handleRetake = (type: 'front' | 'profile') => {
    setCapturedPhotos(prev => prev.filter(p => p.type !== type));
    setCurrentStep(type === 'front' ? 'front-photo' : 'profile-photo');

    logger.info('BODY_SCAN_CAPTURE', 'Photo retake requested', {
      clientScanId: scanIdRef.current,
      photoType: type,
    });
  };

  // Guards
  if (userId === null) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon="Shield"
          title="Authentification requise"
          subtitle="Connectez-vous pour accéder au scanner corporel"
          circuit="body-scan"
        />
        <GlassCard className="text-center p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.Shield} size={24} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Authentification requise</h3>
          <p className="text-white/60 text-sm">
            Vous devez être connecté avec un compte valide pour utiliser le scanner corporel
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon="User"
          title="Profil incomplet"
          subtitle="Complétez votre profil pour accéder au scanner corporel"
          circuit="body-scan"
        />
        <GlassCard className="text-center p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <SpatialIcon Icon={ICONS.User} size={24} className="text-yellow-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Profil incomplet</h3>
          <p className="text-white/60 text-sm mb-4">
            Veuillez renseigner votre sexe, taille et poids dans votre profil
          </p>
          <button
            onClick={() => navigate('/profile#identity')}
            className="btn-glass--primary px-6 py-3 rounded-full"
          >
            <div className="flex items-center justify-center gap-2">
              <SpatialIcon Icon={ICONS.User} size={16} />
              <span>Compléter mon profil</span>
            </div>
          </button>
        </GlassCard>
      </div>
    );
  }

  const getStepKey = () => {
    if (showValidationResults && validationSummary) return 'validation';
    if (currentStep === 'processing') return 'processing-stable';
    return currentStep;
  };

  const renderCurrentStep = (currentProgress: number, currentMessage: string, currentSubMessage: string) => {
    if (showValidationResults && validationSummary) {
      return (
        <ErrorBoundary fallback={<LoadingFallback />}>
          <div className="text-center p-8">
            <h3 className="text-white font-semibold mb-4">Validation en cours...</h3>
            <p className="text-white/60">Les résultats de validation seront bientôt disponibles.</p>
          </div>
        </ErrorBoundary>
      );
    }

    switch (currentStep) {
      case 'front-photo':
      case 'profile-photo':
        return (
          <BodyScanPhotoCaptureStep
            step={currentStep}
            capturedPhotos={capturedPhotos}
            onPhotoCapture={handlePhotoCapture}
            onRetake={(t) => {
              handleRetake(t);
              if (t === 'profile') setCapturedPhotos(prev => prev.filter(p => p.type === 'front'));
            }}
            onBack={() => {
              if (currentStep === 'profile-photo') {
                setCurrentStep('front-photo');
                setCapturedPhotos(prev => prev.filter(p => p.type === 'front'));
              } else {
                navigate('/');
              }
            }}
            onProceedToProcessing={proceedToProcessing}
            isProcessingInProgress={isProcessing}
            isProgressInitialized={isActive}
          />
        );

      case 'processing':
        return (
          <ErrorBoundary fallback={<LoadingFallback />}>
            <ImmersivePhotoAnalysis
              capturedPhotos={capturedPhotos}
              currentProgress={currentProgress}
              currentMessage={currentMessage}
              currentSubMessage={currentSubMessage}
            />
          </ErrorBoundary>
        );

      case 'results':
        return (
          <ErrorBoundary fallback={<LoadingFallback />}>
            <GlassCard className="text-center p-8">
              <SpatialIcon Icon={ICONS.Check} size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Scan terminé !</h3>
              <p className="text-white/70 text-sm mb-6">
                Votre avatar 3D a été généré avec succès
              </p>
              <button
                onClick={() => navigate('/body-scan/review', { state: { scanResults } })}
                className="btn-glass--primary px-6 py-3 rounded-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <SpatialIcon Icon={ICONS.Eye} size={16} />
                  <span>Voir mon avatar</span>
                </div>
              </button>
            </GlassCard>
          </ErrorBoundary>
        );

      default:
        return (
          <GlassCard className="text-center p-8">
            <SpatialIcon Icon={ICONS.AlertCircle} size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Étape inconnue</h3>
            <p className="text-white/60 text-sm">Une erreur est survenue dans le flux de scan</p>
          </GlassCard>
        );
    }
  };

  // Map flow currentStep to progress step ID
  const getProgressStepId = (): string => {
    switch (currentStep) {
      case 'front-photo':
      case 'profile-photo':
        return 'capture';
      case 'processing':
        return 'processing';
      case 'results':
        return 'celebration';
      default:
        return 'capture';
    }
  };

  // Masquer le header pendant la phase de célébration/résultats
  const shouldShowHeader = isActive && steps.length > 0 && currentStep !== 'results';

  return (
    <div className="space-y-6">
      {/* Body Scan Progress Header - Masqué pendant la célébration */}
      {shouldShowHeader && (
        <BodyScanProgressHeader
          steps={steps}
          currentStepId={getProgressStepId()}
          progress={progress}
          message={message}
          subMessage={subMessage}
        />
      )}

      {/* Main Content with Conditional AnimatePresence */}
      <ConditionalAnimatePresence mode="wait">
        <ConditionalMotion
          key={getStepKey()}
          initial={performanceConfig.enableInitialAnimations ? { opacity: 0, y: 20 } : false}
          animate={performanceConfig.enableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
          exit={performanceConfig.enableExitAnimations ? { opacity: 0, y: -20 } : undefined}
          transition={performanceConfig.enableFramerMotion ? { duration: 0.3 } : undefined}
        >
          {renderCurrentStep(progress, message, subMessage)}
        </ConditionalMotion>
      </ConditionalAnimatePresence>
    </div>
  );
};

export default BodyScanCapture;