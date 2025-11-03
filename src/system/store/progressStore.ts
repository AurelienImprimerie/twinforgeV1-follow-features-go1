// src/system/store/progressStore.ts
import { create } from 'zustand';
import { ICONS } from '../../ui/icons/registry';
import logger from '../../lib/utils/logger';
import { playSoundLegacy } from '../../hooks/useFeedback';

// Detailed scan status steps for dynamic progression (Body Scan)
const SCAN_STATUS_STEPS: { title: string; subtitle: string }[] = [
  { title: "Initialisation du scan", subtitle: "Configuration des algorithmes d'analyse corporelle" },
  { title: "Sécurisation des photos", subtitle: "Protection et optimisation des images" },
  { title: "Compression intelligente", subtitle: "Optimisation des données sans perte" },
  { title: "Nettoyage intelligent", subtitle: "Amélioration automatique de la qualité" },
  { title: "Prétraitement visuel", subtitle: "Normalisation des conditions d'éclairage" },
  { title: "Détection silhouette", subtitle: "Identification de 24 points anatomiques" },
  { title: "Cartographie corporelle", subtitle: "Analyse topographique 3D" },
  { title: "Estimation des mesures", subtitle: "Calcul précis des dimensions corporelles" },
  { title: "Analyse de la peau", subtitle: "Extraction des propriétés chromatiques" },
  { title: "Classification visuelle", subtitle: "Identification des caractéristiques uniques" },
  { title: "Profil morphologique", subtitle: "Classification selon 300+ archétypes" },
  { title: "Analyse sémantique", subtitle: "Interprétation des proportions corporelles" },
  { title: "Sélection d'archétypes", subtitle: "Recherche des correspondances optimales" },
  { title: "Filtrage de précision", subtitle: "Affinement des candidats morphologiques" },
  { title: "Affinage IA", subtitle: "Personnalisation par intelligence artificielle" },
  { title: "Optimisation paramétrique", subtitle: "Ajustement des valeurs morphologiques" },
  { title: "Contrôles de cohérence", subtitle: "Validation des paramètres calculés" },
  { title: "Vérification anatomique", subtitle: "Respect des proportions physiologiques" },
  { title: "Préparation du modèle 3D", subtitle: "Initialisation du mesh corporel" },
  { title: "Chargement des ressources", subtitle: "Import des textures et géométries" },
  { title: "Application des morphs", subtitle: "Déformation géométrique personnalisée" },
  { title: "Interpolation des formes", subtitle: "Transition fluide entre archétypes" },
  { title: "Répartition des masses", subtitle: "Calcul des proportions anatomiques" },
  { title: "Ajustement des volumes", subtitle: "Calibration des masses musculaires" },
  { title: "Peau & matériaux", subtitle: "Application des propriétés visuelles" },
  { title: "Configuration PBR", subtitle: "Paramétrage du rendu physique" },
  { title: "Mise en scène", subtitle: "Optimisation de la présentation 3D" },
  { title: "Éclairage dynamique", subtitle: "Configuration de l'environnement lumineux" },
  { title: "Validation finale", subtitle: "Contrôle qualité automatisé" },
  { title: "Tests de cohérence", subtitle: "Vérification de l'intégrité du modèle" },
  { title: "Avatar prêt", subtitle: "Rendu 3D disponible pour interaction" },
];

// Detailed scan status steps for dynamic progression (Face Scan)
const FACE_SCAN_DETAILED_STEPS: { title: string; subtitle: string }[] = [
  { title: "Initialisation du scan facial", subtitle: "Configuration des algorithmes d'analyse" },
  { title: "Sécurisation des photos faciales", subtitle: "Protection et optimisation des données" },
  { title: "Nettoyage intelligent du visage", subtitle: "Amélioration automatique de la qualité" },
  { title: "Détection des traits faciaux", subtitle: "Cartographie de 68 points de référence" },
  { title: "Analyse sémantique faciale", subtitle: "Classification morphologique avancée" },
  { title: "Sélection d'archétypes faciaux", subtitle: "Recherche dans la base de données" },
  { title: "Affinage IA du visage", subtitle: "Personnalisation par intelligence artificielle" },
  { title: "Contrôles de cohérence faciale", subtitle: "Validation des paramètres calculés" },
  { title: "Préparation du modèle 3D facial", subtitle: "Initialisation du mesh de base" },
  { title: "Application des morphs faciaux", subtitle: "Déformation géométrique personnalisée" },
  { title: "Peau & matériaux faciaux", subtitle: "Application des propriétés visuelles" },
  { title: "Mise en scène faciale", subtitle: "Optimisation de la présentation 3D" },
  { title: "Validation finale du visage", subtitle: "Contrôle qualité automatisé" },
  { title: "Avatar facial prêt", subtitle: "Rendu 3D disponible pour interaction" },
];


interface ProgressStep {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof ICONS;
  color: string;
}

// 4-step pipeline type
type Step = 'capture' | 'processing' | 'celebration' | 'avatar';
type FlowType = 'body' | 'face'; // Nouveau type pour distinguer les flux

interface ProgressState {
  // State properties
  isActive: boolean;
  clientScanId: string | null;
  serverScanId: string | null;
  currentStep: Step;
  overallProgress: number;
  phaseProgress: number;
  message: string;
  subMessage: string;
  steps: ProgressStep[];
  totalSteps: number;
  lastUpdateTime: number;
  flowType: FlowType | null;
  progressHistory: Array<{ step: string; progress: number; timestamp: number }>;

  // Dynamic progression state
  dynamicProgressIntervalId: number | null;
  dynamicProgressStepIndex: number;
  lastSoundThreshold: number;

  // Actions
  startProgress: (steps: ProgressStep[], clientScanId: string, flowType: FlowType) => void; // Mise à jour de la signature
  setCaptureProgress: (step: 'front_taken' | 'profile_taken' | 'done') => void;
  setProcessingStep: (step: 'upload' | 'estimate' | 'semantic' | 'match' | 'commit') => void;
  setComplete: () => void;
  setRendering: () => void;
  setRenderReady: () => void;
  setServerScanId: (serverScanId: string) => void;
  completeProgress: () => void;
  resetProgress: () => void;
  setProgressMessage: (message: string, subMessage?: string) => void;
  setProgressActive: (active: boolean) => void;
  maintainProgressForReview: () => void;
  startDynamicProcessing: (startPercentage: number, endPercentage: number) => void;
  stopDynamicProcessing: () => void;
  setOverallProgress: (percentage: number, message: string, subMessage?: string) => void;
  incrementProgress: (increment: number, message?: string, subMessage?: string) => void;
}

// PROFESSIONAL: Progress update throttling to prevent chaos
const PROGRESS_THROTTLE_MS = 100;
const MAX_PROGRESS_HISTORY = 20;

// Centralized progress mapping - single source of truth
const CAPTURE_PROGRESS_MAPPING: Record<string, number> = {
  'front_taken': 25,
  'profile_taken': 50,
  'done': 50,
};

const PROCESSING_PROGRESS_MAPPING: Record<string, { progress: number; message: string; subMessage: string }> = {
  'upload': { progress: 55, message: 'Analyse IA Avancée', subMessage: 'Téléchargement des photos...' },
  'estimate': { progress: 65, message: 'Analyse IA Avancée', subMessage: 'Extraction des mesures corporelles...' },
  'semantic': { progress: 75, message: 'Analyse IA Avancée', subMessage: 'Classification morphologique...' },
  'match': { progress: 85, message: 'Analyse IA Avancée', subMessage: 'Sélection des archétypes...' },
  'commit': { progress: 90, message: 'Analyse IA Avancée', subMessage: 'Sauvegarde des données...' },
  // PHASE 2: New 3D loading progress steps
  'model_loading': { progress: 92, message: 'Chargement de votre avatar', subMessage: 'Téléchargement du modèle 3D...' },
  'model_loaded': { progress: 94, message: 'Chargement de votre avatar', subMessage: 'Modèle 3D chargé avec succès...' },
  'morphs_applied': { progress: 97, message: 'Chargement de votre avatar', subMessage: 'Application des paramètres morphologiques...' },
  'first_frame_rendered': { progress: 100, message: 'Avatar 3D Prêt', subMessage: 'Votre reflet numérique est maintenant visible' },
};

/**
 * Progress Store - 4-step pipeline with stable IDs
 */
export const useProgressStore = create<ProgressState>((set, get) => ({
  // State properties initialization
  isActive: false,
  clientScanId: null,
  serverScanId: null,
  currentStep: 'capture',
  overallProgress: 0,
  phaseProgress: 0,
  message: '',
  subMessage: '',
  steps: [],
  totalSteps: 0,
  flowType: null,
  progressHistory: [],

  // Dynamic progression state
  dynamicProgressIntervalId: null,
  dynamicProgressStepIndex: 0,
  lastSoundThreshold: -1,

  startProgress: (steps: ProgressStep[], clientScanId: string, flowType: FlowType) => {
    if (!clientScanId || typeof clientScanId !== 'string') {
      logger.error('startProgress called without valid clientScanId', { clientScanId });
      return;
    }

    const state = get();

    // IDEMPOTENCE: Don't restart if same clientScanId is already active
    if (state.isActive && state.clientScanId === clientScanId) {
      return;
    }

    // ERROR: If different scanId is active, log error but allow override
    if (state.isActive && state.clientScanId && state.clientScanId !== clientScanId) {
      logger.error('Starting new progress while another is active', {
        activeScanId: state.clientScanId,
        newScanId: clientScanId
      });
    }
    
    const now = Date.now();
    set({
      isActive: true,
      clientScanId,
      serverScanId: null, // Will be set later by commit
      steps,
      totalSteps: steps.length,
      currentStep: 'capture',
      overallProgress: 0,
      phaseProgress: 0,
      message: steps[0]?.subtitle || '',
      subMessage: '',
      lastUpdateTime: now,
      flowType,
      progressHistory: [{ step: steps[0]?.id || '', progress: 0, timestamp: now }],
      lastSoundThreshold: -1,
    });

    logger.info('Progress started', {
      clientScanId,
      steps: steps.length
    });
  },

  setCaptureProgress: (step: 'front_taken' | 'profile_taken' | 'done') => {
    const state = get();
    if (!state.isActive) {
      logger.warn('setCaptureProgress called but progress not active', { step });
      return;
    }

    const targetProgress = CAPTURE_PROGRESS_MAPPING[step];
    if (targetProgress === undefined) {
      logger.error('Invalid capture step', { step, validSteps: Object.keys(CAPTURE_PROGRESS_MAPPING) });
      return;
    }

    // Monotonic guard
    if (targetProgress < state.overallProgress) {
      logger.debug('Rejected non-monotonic capture progress', {
        targetProgress,
        step,
        reason: 'progress_would_decrease'
      });
      return;
    }

    const now = Date.now();
    const progressEntry = { step: 'capture', progress: targetProgress, timestamp: now };
    const newHistory = [...state.progressHistory, progressEntry].slice(-MAX_PROGRESS_HISTORY);

    set({
      currentStep: 'capture',
      overallProgress: targetProgress,
      phaseProgress: targetProgress,
      message: 'Capture Photographique',
      subMessage: step === 'front_taken' ? 'Capturez votre photo de profil - tournez-vous à 90°' :
                  step === 'profile_taken' ? 'Photos capturées avec succès - Prêt pour l\'analyse IA' :
                  'Photos capturées avec succès - Prêt pour l\'analyse IA',
      lastUpdateTime: now,
      progressHistory: newHistory,
    });

    logger.info(`Capture progress: ${targetProgress}%`, {
      step,
      progress: targetProgress,
      timestamp: new Date().toISOString()
    });
  },

  setProcessingStep: (step: 'upload' | 'estimate' | 'semantic' | 'match' | 'commit') => {
    const state = get();

    // Don't update if dynamic processing is active
    if (state.dynamicProgressIntervalId !== null) {
      return;
    }

    const stepConfig = PROCESSING_PROGRESS_MAPPING[step];
    if (!stepConfig) {
      logger.error('Invalid processing step', { step, validSteps: Object.keys(PROCESSING_PROGRESS_MAPPING) });
      return;
    }

    // Monotonic guard
    if (stepConfig.progress < state.overallProgress) {
      return;
    }

    const now = Date.now();
    const progressEntry = { step, progress: stepConfig.progress, timestamp: now };
    const newHistory = [...state.progressHistory, progressEntry].slice(-MAX_PROGRESS_HISTORY);

    set({
      currentStep: 'processing',
      overallProgress: stepConfig.progress,
      phaseProgress: stepConfig.progress,
      message: stepConfig.message,
      subMessage: stepConfig.subMessage,
      lastUpdateTime: now,
      progressHistory: newHistory,
    });

    logger.info('Processing step', {
      step,
      progress: stepConfig.progress
    });
  },

  setComplete: () => {
    const state = get();
    if (!state.isActive) {
      logger.warn('setComplete called but progress not active');
      return;
    }
    
    // Stop dynamic processing if active
    get().stopDynamicProcessing();

    const now = Date.now();
    set({
      currentStep: 'celebration',
      overallProgress: 95,
      phaseProgress: 95,
      message: 'Données Traitées',
      subMessage: 'Préparation du rendu 3D...',
      lastUpdateTime: now,
    });

    logger.info('Processing completed - celebration step', {
      serverScanId: state.serverScanId,
      step: 'celebration',
      progress: 95,
      timestamp: new Date().toISOString()
    });
  },

  setRendering: () => {
    const state = get();
    if (!state.isActive) {
      logger.warn('setRendering called but progress not active');
      return;
    }

    const now = Date.now();
    set({
      currentStep: 'avatar',
      overallProgress: 98,
      phaseProgress: 98,
      message: 'Chargement de votre avatar',
      subMessage: 'Préparation du conteneur 3D...',
      lastUpdateTime: now,
    });

    logger.info('Avatar rendering started', {
      serverScanId: state.serverScanId,
      step: 'avatar',
      progress: 98,
      timestamp: new Date().toISOString()
    });
  },

  setRenderReady: () => {
    const state = get();
    if (!state.isActive) {
      logger.warn('setRenderReady called but progress not active');
      return;
    }
    
    // Stop dynamic processing if active
    get().stopDynamicProcessing();

    const now = Date.now();
    set({
      currentStep: 'avatar',
      overallProgress: 100,
      phaseProgress: 100,
      message: 'Avatar 3D Prêt',
      subMessage: 'Votre reflet numérique est maintenant visible',
      lastUpdateTime: now,
    });

    logger.info('Avatar render ready - 100% complete', {
      serverScanId: state.serverScanId,
      step: 'avatar',
      progress: 100,
      timestamp: new Date().toISOString()
    });
  },

  setServerScanId: (serverScanId: string) => {
    const state = get();
    set({ serverScanId });

    logger.info('Server scan ID set', {
      serverScanId,
      timestamp: new Date().toISOString()
    });
  },

  setProgressMessage: (message: string, subMessage?: string) => {
    set({
      message,
      subMessage: subMessage || '',
      lastUpdateTime: Date.now(),
    });
  },

  completeProgress: () => {
    const state = get();
    
    // Use setComplete instead of direct manipulation
    get().setComplete();
    
    logger.info('Progress completed successfully', {
      serverScanId: state.serverScanId,
      finalStep: 'celebration',
      timestamp: new Date().toISOString()
    });
  },

  maintainProgressForReview: () => {
    const state = get();
    const now = Date.now();
    
    logger.info('Maintaining progress for review', {
      serverScanId: state.serverScanId,
      currentProgress: state.overallProgress,
      currentStep: state.currentStep,
      timestamp: new Date().toISOString()
    });
    const reviewSteps = state.steps.length > 0 ? state.steps : [
      {
        id: 'capture',
        title: 'Capture Photographique',
        subtitle: 'Photos de face et de profil capturées',
        icon: 'Camera' as const,
        color: '#8B5CF6'
      },
      {
        id: 'processing',
        title: 'Analyse IA Avancée',
        subtitle: 'Intelligence artificielle appliquée',
        icon: 'Scan' as const,
        color: '#8B5CF6'
      },
      {
        id: 'celebration',
        title: 'Données Traitées',
        subtitle: 'Préparation du rendu 3D',
        icon: 'Check' as const,
        color: '#8B5CF6'
      },
      {
        id: 'avatar',
        title: 'Avatar 3D',
        subtitle: 'Votre reflet numérique',
        icon: 'Eye' as const,
        color: '#8B5CF6'
      }
    ];
    
    set({
      overallProgress: 95,
      phaseProgress: 95,
      currentStep: 'celebration',
      message: 'Données Traitées',
      subMessage: 'Préparation du rendu 3D...',
      lastUpdateTime: now,
      steps: reviewSteps,
    });
  },

  resetProgress: () => {
    const state = get();
    
    
    // Stop dynamic processing if active
    get().stopDynamicProcessing();
    
    logger.info('Resetting progress', {
      serverScanId: state.serverScanId,
      timestamp: new Date().toISOString()
    });
    set({
      isActive: false,
      clientScanId: null,
      serverScanId: null,
      currentStep: 'capture',
      overallProgress: 0,
      phaseProgress: 0,
      message: '',
      subMessage: '',
      steps: [],
      totalSteps: 0,
      flowType: null,
      progressHistory: [],
      dynamicProgressIntervalId: null,
      dynamicProgressStepIndex: 0,
      lastSoundThreshold: -1,
    });
  },

  setProgressActive: (active: boolean) => {
    const state = get();
    logger.info('Setting progress active', {
      active,
      serverScanId: state.serverScanId,
      timestamp: new Date().toISOString()
    });

    set({ isActive: active });
  },

  startDynamicProcessing: (startPercentage: number, endPercentage: number) => {
    const state = get();

    // Stop any existing dynamic processing
    get().stopDynamicProcessing();
    
    // Sélectionne le tableau d'étapes détaillé en fonction du flowType
    const detailedSteps = state.flowType === 'face' ? FACE_SCAN_DETAILED_STEPS : SCAN_STATUS_STEPS;

    logger.info('Starting dynamic processing progression', {
      startPercentage,
      endPercentage,
      flowType: state.flowType,
    });
    // Calculate progression increment per step
    const totalRange = endPercentage - startPercentage;
    const progressPerStep = totalRange / detailedSteps.length;
    
    // Initialize with first step
    const firstStep = detailedSteps[0];
    set({
      currentStep: 'processing',
      overallProgress: startPercentage,
      phaseProgress: startPercentage,
      message: firstStep.title,
      subMessage: firstStep.subtitle,
      dynamicProgressStepIndex: 0,
      lastUpdateTime: Date.now(),
    });

    const stateAfterInit = get();

    // Start interval for dynamic progression
    const intervalId = window.setInterval(() => {
      const currentState = get();

      const nextStepIndex = currentState.dynamicProgressStepIndex + 1;

      // Check if we've reached the end
      if (nextStepIndex >= detailedSteps.length) {
        get().stopDynamicProcessing();

        // Set final state
        set({
          overallProgress: endPercentage,
          phaseProgress: endPercentage,
          message: 'Analyse IA Terminée',
          subMessage: 'Finalisation des données...',
          lastUpdateTime: Date.now(),
        });

        const finalState = get();

        logger.info('Dynamic processing completed', {
          finalProgress: endPercentage,
        });
        return;
      }

      // Update to next step
      const nextStep = detailedSteps[nextStepIndex];
      const nextProgress = Math.min(endPercentage, startPercentage + (progressPerStep * (nextStepIndex + 1)));

      set({
        overallProgress: nextProgress,
        phaseProgress: nextProgress,
        message: nextStep.title,
        subMessage: nextStep.subtitle,
        dynamicProgressStepIndex: nextStepIndex,
        lastUpdateTime: Date.now(),
      });

      const stateAfterUpdate = get();

      logger.info('Dynamic processing step update', {
        stepIndex: nextStepIndex,
        stepTitle: nextStep.title,
        progress: nextProgress,
      });
    }, 2000); // Update every 2 seconds for smoother progression

    set({ dynamicProgressIntervalId: intervalId });

    const finalState = get();
  },
  
  stopDynamicProcessing: () => {
    const state = get();

    if (state.dynamicProgressIntervalId !== null) {
      window.clearInterval(state.dynamicProgressIntervalId);

      logger.info('Dynamic processing stopped', {
        lastStepIndex: state.dynamicProgressStepIndex,
      });

      set({
        dynamicProgressIntervalId: null,
        dynamicProgressStepIndex: 0,
      });

      const stateAfterCleanup = get();
    }
  },

  setOverallProgress: (percentage: number, message: string, subMessage?: string) => {
    const state = get();

    if (!state.isActive) {
      logger.warn('setOverallProgress called but progress not active', { percentage, message });
      return;
    }
    
    // Don't update if dynamic processing is active
    if (state.dynamicProgressIntervalId !== null) {
      return;
    }

    // Validate percentage and default to 0 if invalid (NaN, null, undefined)
    const safePercentage = Number.isFinite(percentage) && !Number.isNaN(percentage) ? 
      Math.max(0, Math.min(100, percentage)) : 0;
    
    // Log warning if invalid percentage was passed
    if (!Number.isFinite(percentage) || Number.isNaN(percentage)) {
      logger.warn('Invalid percentage passed to setOverallProgress, defaulting to 0', {
        percentageType: typeof percentage,
        safePercentage,
        message
      });
    }
    
    // Monotonic guard - only allow progress to increase
    if (safePercentage < state.overallProgress) {
      logger.debug('REJECTED non-monotonic progress update', {
        message,
        reason: 'progress_would_decrease',
      });
      return;
    }

    // VisionOS26 audio feedback every 4%
    const currentThreshold = Math.floor(safePercentage / 4); // Changed to 4% intervals
    if (currentThreshold > state.lastSoundThreshold && safePercentage > 0) {
      try {
        // Safe check: only play sound if playSoundLegacy is available
        if (typeof playSoundLegacy === 'function') {
          playSoundLegacy(500, 50); // VisionOS26 subtle progression sound - every 4%
          logger.debug('Progress audio feedback played', {
            percentage: safePercentage,
            threshold: currentThreshold,
            lastThreshold: state.lastSoundThreshold,
          });
        }
      } catch (audioError) {
        logger.warn('Progress audio feedback failed', {
          error: audioError instanceof Error ? audioError.message : String(audioError),
          percentage: safePercentage
        });
      }
      set({ lastSoundThreshold: currentThreshold });
    }

    const now = Date.now();
    const progressEntry = { step: 'custom', progress: safePercentage, timestamp: now };
    const newHistory = [...state.progressHistory, progressEntry].slice(-MAX_PROGRESS_HISTORY);

    set({
      overallProgress: safePercentage,
      phaseProgress: safePercentage,
      message: message || state.message,
      subMessage: subMessage || state.subMessage,
      lastUpdateTime: now,
      progressHistory: newHistory,
    });

    logger.info(`Overall progress: ${safePercentage}%`, {
      message,
      subMessage,
      timestamp: new Date().toISOString()
    });
  },

  incrementProgress: (increment: number, message?: string, subMessage?: string) => {
    const state = get();

    if (!state.isActive) {
      logger.warn('incrementProgress called but progress not active', { increment, message });
      return;
    }

    const newProgress = Math.min(100, state.overallProgress + increment);

    get().setOverallProgress(newProgress, message || state.message, subMessage || state.subMessage);
  },

}));
