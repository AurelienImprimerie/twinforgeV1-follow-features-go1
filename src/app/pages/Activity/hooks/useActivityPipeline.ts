/**
 * Activity Pipeline Hook
 * Gestion de l'état de la pipeline de suivi d'activité
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';
import logger from '../../../../lib/utils/logger';

// Types pour la pipeline (3 étapes)
export type ActivityPipelineStep = 'capture' | 'analysis' | 'review';

export interface ActivityStepData {
  id: ActivityPipelineStep;
  title: string;
  subtitle: string;
  icon: keyof typeof import('../../../../ui/icons/registry').ICONS;
  color: string;
}

export interface ActivityPipelineState {
  currentStep: ActivityPipelineStep;
  progress: number;
  overallProgress: number;
  message: string;
  subMessage: string;
  isActive: boolean;
  steps: ActivityStepData[];
  
  // Données de la pipeline
  audioData?: string;
  transcriptionResult?: {
    cleanText: string;
    originalTranscription: string;
    confidence: number;
  };
  analysisResult?: {
    activities: Array<{
      type: string;
      duration_min: number;
      intensity: 'low' | 'medium' | 'high' | 'very_high';
      calories_est: number;
      notes?: string;
    }>;
    totalCalories: number;
    totalDuration: number;
    forgeInsights: string[];
  };
}

// Configuration des étapes de la Forge Énergétique (3 étapes)
const ACTIVITY_STEPS: ActivityStepData[] = [
  {
    id: 'capture',
    title: 'Capture de Mouvement',
    subtitle: 'Enregistrez votre session énergétique',
    icon: 'Activity',
    color: '#3B82F6'
  },
  {
    id: 'analysis',
    title: 'Analyse de Forge',
    subtitle: 'Traitement de votre empreinte énergétique',
    icon: 'Zap',
    color: '#06B6D4'
  },
  {
    id: 'review',
    title: 'Revue Énergétique',
    subtitle: 'Validation et ajustement de vos données',
    icon: 'Target',
    color: '#1D4ED8'
  }
];

export function useActivityPipeline() {
  const navigate = useNavigate();
  const { success, error: errorSound } = useFeedback();
  const { showToast } = useToast();

  const [state, setState] = React.useState<ActivityPipelineState>({
    currentStep: 'capture',
    progress: 0,
    overallProgress: 0,
    message: 'Prêt à forger votre énergie',
    subMessage: 'Commencez par enregistrer votre session d\'activité',
    isActive: false,
    steps: ACTIVITY_STEPS,
  });

  // Actions de la pipeline
  const startPipeline = React.useCallback((initialStep: ActivityPipelineStep = 'capture') => {
    logger.info('ACTIVITY_PIPELINE', 'Starting activity pipeline', {
      initialStep,
      timestamp: new Date().toISOString()
    });

    const stepMessages = {
      capture: {
        message: 'Forge Énergétique Activée',
        subMessage: 'Décrivez votre session d\'activité physique'
      },
      analysis: {
        message: 'Analyse de Forge',
        subMessage: 'Traitement de votre empreinte énergétique'
      },
      review: {
        message: 'Revue Énergétique',
        subMessage: 'Validation et ajustement de vos données'
      }
    };

    const stepMessage = stepMessages[initialStep];

    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: initialStep,
      progress: 0,
      overallProgress: 0,
      message: stepMessage.message,
      subMessage: stepMessage.subMessage
    }));
  }, []);

  const setStep = React.useCallback((step: ActivityPipelineStep, progress: number, message: string, subMessage?: string) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      progress,
      overallProgress: progress,
      message,
      subMessage: subMessage || ''
    }));

    // Scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setAudioData = React.useCallback((audioData: string) => {
    setState(prev => ({
      ...prev,
      audioData
    }));
  }, []);

  const setTranscriptionResult = React.useCallback((result: ActivityPipelineState['transcriptionResult']) => {
    setState(prev => ({
      ...prev,
      transcriptionResult: result
    }));
  }, []);

  const setAnalysisResult = React.useCallback((result: ActivityPipelineState['analysisResult']) => {
    setState(prev => ({
      ...prev,
      analysisResult: result
    }));
  }, []);

  const completePipeline = React.useCallback(() => {
    logger.info('ACTIVITY_PIPELINE', 'Pipeline completed successfully', {
      activitiesCount: state.analysisResult?.activities?.length || 0,
      totalCalories: state.analysisResult?.totalCalories || 0,
      timestamp: new Date().toISOString()
    });

    setState(prev => ({
      ...prev,
      isActive: false,
      currentStep: 'capture',
      progress: 0,
      overallProgress: 0,
      message: 'Prêt à forger votre énergie',
      subMessage: 'Commencez par enregistrer votre session d\'activité',
      audioData: undefined,
      transcriptionResult: undefined,
      analysisResult: undefined
    }));

    success();
    showToast({
      type: 'success',
      title: 'Forge Énergétique Complétée',
      message: 'Vos activités ont été enregistrées avec succès',
      duration: 4000
    });

    // Redirection vers l'onglet Aujourd'hui
    setTimeout(() => {
      navigate('/activity#daily');
    }, 1000);
  }, [state.analysisResult, success, showToast, navigate]);

  const cancelPipeline = React.useCallback(() => {
    logger.info('ACTIVITY_PIPELINE', 'Pipeline cancelled by user', {
      currentStep: state.currentStep,
      progress: state.overallProgress,
      timestamp: new Date().toISOString()
    });

    setState(prev => ({
      ...prev,
      isActive: false,
      currentStep: 'capture',
      progress: 0,
      overallProgress: 0,
      message: 'Prêt à forger votre énergie',
      subMessage: 'Commencez par enregistrer votre session d\'activité',
      audioData: undefined,
      transcriptionResult: undefined,
      analysisResult: undefined
    }));

    navigate('/activity');
  }, [state.currentStep, state.overallProgress, navigate]);

  const handleError = React.useCallback((errorMessage: string, step: ActivityPipelineStep) => {
    logger.error('ACTIVITY_PIPELINE', 'Pipeline error occurred', {
      error: errorMessage,
      step,
      timestamp: new Date().toISOString()
    });

    errorSound();
    showToast({
      type: 'error',
      title: 'Erreur de la Forge',
      message: errorMessage,
      duration: 5000
    });

    // Retour à l'étape précédente ou capture
    const stepIndex = ACTIVITY_STEPS.findIndex(s => s.id === step);
    const previousStep = stepIndex > 0 ? ACTIVITY_STEPS[stepIndex - 1].id : 'capture';
    
    setState(prev => ({
      ...prev,
      currentStep: previousStep,
      overallProgress: Math.max(0, prev.overallProgress - 33),
      message: 'Erreur de Forge - Réessayez',
      subMessage: 'Une erreur est survenue, veuillez réessayer'
    }));
  }, [errorSound, showToast]);

  return {
    state,
    actions: {
      startPipeline,
      setStep,
      setAudioData,
      setTranscriptionResult,
      setAnalysisResult,
      completePipeline,
      cancelPipeline,
      handleError
    }
  };
}