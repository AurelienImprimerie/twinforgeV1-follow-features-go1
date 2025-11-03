import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useActivityPipeline, type ActivityPipelineStep } from './hooks/useActivityPipeline';
import { useUserStore } from '../../../system/store/userStore';
import { useToast } from '../../../ui/components/ToastProvider';
import { useFeedback } from '../../../hooks';
import GlassCard from '../../../ui/cards/GlassCard';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import CaptureStage from './components/CaptureStage';
import AnalysisStage from './components/AnalysisStage';
import ReviewStage from './components/ReviewStage';
import logger from '../../../lib/utils/logger';
import ActivityPipelineProgressHeader from './components/ActivityPipelineProgressHeader';
import './styles/index.css';

type InputMode = 'wearable' | 'audio' | 'text';

/**
 * ActivityInputPage - Forge Énergétique TwinForge
 * Pipeline complète de capture, analyse et sauvegarde des activités physiques
 */
const ActivityInputPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useActivityPipeline();
  const { profile, session } = useUserStore();
  const { showToast } = useToast();
  const { error: errorSound } = useFeedback();

  // États pour le mode audio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // États pour le mode input
  const [selectedInputMode, setSelectedInputMode] = useState<InputMode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Démarrer l'enregistrement audio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingDuration(0);

      // Timer pour durée
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      logger.info('ACTIVITY_INPUT', 'Audio recording started', {
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('ACTIVITY_INPUT', 'Failed to start recording', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      errorSound();
      showToast({
        type: 'error',
        title: 'Erreur Microphone',
        message: 'Impossible d\'accéder au microphone. Vérifiez les permissions.',
        duration: 4000
      });
    }
  }, [session, errorSound, showToast]);

  // Arrêter l'enregistrement audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      logger.info('ACTIVITY_INPUT', 'Audio recording stopped', {
        duration: recordingDuration,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    }
  }, [isRecording, recordingDuration, session]);

  // Traiter l'audio (transcription + analyse)
  const processAudio = useCallback(async () => {
    if (!audioBlob) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Aucun Audio',
        message: 'Veuillez d\'abord enregistrer un audio',
        duration: 3000
      });
      return;
    }

    // Validation de la taille minimale du blob audio (au moins 1KB)
    if (audioBlob.size < 1000) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Audio Trop Court',
        message: 'L\'enregistrement est trop court. Veuillez parler au moins 2 secondes.',
        duration: 4000
      });
      logger.error('ACTIVITY_INPUT', 'Audio blob too small', {
        blobSize: audioBlob.size,
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!session?.user?.id) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Authentification requise',
        message: 'Vous devez être connecté pour continuer',
        duration: 4000
      });
      return;
    }

    setIsProcessing(true);
    actions.setStep('analysis', 33, 'Transcription Audio', 'Conversion de votre voix en texte...');

    try {
      // Convertir le Blob en Base64
      const reader = new FileReader();
      const audioBase64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          if (!result || result.length < 100) {
            reject(new Error('Failed to read audio blob or blob is empty'));
            return;
          }
          const base64 = result.split(',')[1];
          if (!base64 || base64.length === 0) {
            reject(new Error('Failed to extract base64 from audio blob'));
            return;
          }
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(audioBlob);
      });

      const audioBase64 = await audioBase64Promise;
      actions.setAudioData(audioBase64);

      logger.info('ACTIVITY_INPUT', 'Audio blob converted to base64', {
        originalBlobSize: audioBlob.size,
        base64Length: audioBase64.length,
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });

      // Étape 1: Transcription avec activity-transcriber
      logger.info('ACTIVITY_INPUT', 'Calling activity-transcriber', {
        userId: session.user.id,
        audioSize: audioBlob.size,
        base64Length: audioBase64.length,
        timestamp: new Date().toISOString()
      });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const payload = {
        audioData: audioBase64,
        userId: session.user.id,
        clientTraceId: `activity_transcription_${Date.now()}`
      };

      logger.info('ACTIVITY_INPUT', 'Transcription payload prepared', {
        hasAudioData: !!payload.audioData,
        audioDataLength: payload.audioData?.length || 0,
        hasUserId: !!payload.userId,
        userId: payload.userId,
        clientTraceId: payload.clientTraceId,
        timestamp: new Date().toISOString()
      });

      const transcriptionResponse = await fetch(`${supabaseUrl}/functions/v1/activity-transcriber`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
      }

      const transcriptionResult = await transcriptionResponse.json();
      actions.setTranscriptionResult(transcriptionResult);

      logger.info('ACTIVITY_INPUT', 'Transcription completed', {
        cleanText: transcriptionResult.cleanText,
        confidence: transcriptionResult.confidence,
        timestamp: new Date().toISOString()
      });

      // Étape 2: Analyse avec activity-analyzer
      actions.setStep('analysis', 50, 'Analyse Énergétique', 'Extraction et calcul des activités...');

      const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/activity-analyzer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cleanText: transcriptionResult.cleanText,
          userId: session.user.id,
          userProfile: {
            weight_kg: profile?.weight_kg || 70,
            height_cm: profile?.height_cm,
            sex: profile?.sex,
            age: profile?.birthdate ? new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : undefined
          },
          clientTraceId: `activity_analysis_${Date.now()}`
        })
      });

      if (!analysisResponse.ok) {
        let errorMessage = `Analysis failed: ${analysisResponse.statusText}`;
        let isNetworkError = false;
        try {
          const errorData = await analysisResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Detect network/DNS errors
          if (errorMessage.includes('dns error') ||
              errorMessage.includes('name resolution') ||
              errorMessage.includes('Network error') ||
              errorMessage.includes('Unable to reach OpenAI API')) {
            isNetworkError = true;
          }

          logger.error('ACTIVITY_INPUT', 'API Error Details (Audio Path)', {
            status: analysisResponse.status,
            statusText: analysisResponse.statusText,
            errorData,
            isNetworkError,
            timestamp: new Date().toISOString()
          });
        } catch {
          // Unable to parse error JSON
        }

        // Show user-friendly message for network errors
        if (isNetworkError) {
          errorSound();
          showToast({
            type: 'error',
            title: 'Erreur de Connexion',
            message: 'Impossible de contacter le service d\'analyse. Vérifiez votre connexion internet ou réessayez plus tard.',
            duration: 6000
          });
        }

        throw new Error(errorMessage);
      }

      const analysisResult = await analysisResponse.json();
      actions.setAnalysisResult(analysisResult);

      logger.info('ACTIVITY_INPUT', 'Analysis completed', {
        activitiesCount: analysisResult.activities.length,
        totalCalories: analysisResult.totalCalories,
        totalDuration: analysisResult.totalDuration,
        timestamp: new Date().toISOString()
      });

      // Passer à l'étape de revue
      actions.setStep('review', 100, 'Revue Énergétique', 'Validez vos activités avant sauvegarde');

    } catch (error) {
      logger.error('ACTIVITY_INPUT', 'Processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });

      actions.handleError(
        error instanceof Error ? error.message : 'Erreur lors du traitement de l\'audio',
        'analysis'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, session, profile, actions, errorSound, showToast]);

  // Traiter le texte (analyse directe)
  const processText = useCallback(async (text: string) => {
    if (!text || text.trim().length < 10) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Texte trop court',
        message: 'Veuillez saisir au moins 10 caractères',
        duration: 3000
      });
      return;
    }

    if (!session?.user?.id) {
      errorSound();
      showToast({
        type: 'error',
        title: 'Authentification requise',
        message: 'Vous devez être connecté pour continuer',
        duration: 4000
      });
      return;
    }

    setIsProcessing(true);
    actions.setStep('analysis', 33, 'Analyse Énergétique', 'Extraction et calcul des activités...');

    try {
      logger.info('ACTIVITY_INPUT', 'Processing text input', {
        textLength: text.length,
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/activity-analyzer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cleanText: text,
          userId: session.user.id,
          userProfile: {
            weight_kg: profile?.weight_kg || 70,
            height_cm: profile?.height_cm,
            sex: profile?.sex,
            age: profile?.birthdate ? new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : undefined
          },
          clientTraceId: `activity_analysis_text_${Date.now()}`
        })
      });

      if (!analysisResponse.ok) {
        let errorMessage = `Analysis failed: ${analysisResponse.statusText}`;
        let isNetworkError = false;
        try {
          const errorData = await analysisResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Detect network/DNS errors
          if (errorMessage.includes('dns error') ||
              errorMessage.includes('name resolution') ||
              errorMessage.includes('Network error') ||
              errorMessage.includes('Unable to reach OpenAI API')) {
            isNetworkError = true;
          }

          logger.error('ACTIVITY_INPUT', 'API Error Details (Text Path)', {
            status: analysisResponse.status,
            statusText: analysisResponse.statusText,
            errorData,
            isNetworkError,
            timestamp: new Date().toISOString()
          });
        } catch {
          // Unable to parse error JSON
        }

        // Show user-friendly message for network errors
        if (isNetworkError) {
          errorSound();
          showToast({
            type: 'error',
            title: 'Erreur de Connexion',
            message: 'Impossible de contacter le service d\'analyse. Vérifiez votre connexion internet ou réessayez plus tard.',
            duration: 6000
          });
        }

        throw new Error(errorMessage);
      }

      const analysisResult = await analysisResponse.json();
      actions.setAnalysisResult(analysisResult);

      logger.info('ACTIVITY_INPUT', 'Text analysis completed', {
        activitiesCount: analysisResult.activities.length,
        totalCalories: analysisResult.totalCalories,
        totalDuration: analysisResult.totalDuration,
        timestamp: new Date().toISOString()
      });

      // Passer à l'étape de revue
      actions.setStep('review', 100, 'Revue Énergétique', 'Validez vos activités avant sauvegarde');

    } catch (error) {
      logger.error('ACTIVITY_INPUT', 'Text processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });

      actions.handleError(
        error instanceof Error ? error.message : 'Erreur lors de l\'analyse du texte',
        'analysis'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [session, profile, actions, errorSound, showToast]);

  // Gérer le changement de mode input
  const handleInputModeChange = useCallback((mode: InputMode | null) => {
    setSelectedInputMode(mode);
    setAudioBlob(null);
    setRecordingDuration(0);
    logger.info('ACTIVITY_INPUT', 'Input mode changed', { mode });
  }, []);

  // Initialiser la pipeline au chargement
  React.useEffect(() => {
    actions.startPipeline('capture');

    return () => {
      // Cleanup
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-4xl mx-auto mt-4 space-y-6"
    >
      {/* Activity Pipeline Progress Header - replaces PageHeader and progress bar */}
      <ActivityPipelineProgressHeader
        steps={state.steps}
        currentStepId={state.currentStep}
        progress={state.progress}
        message={state.message}
        subMessage={state.subMessage}
      />

      {/* Contenu de l'étape actuelle */}
      <AnimatePresence mode="wait">
        {state.currentStep === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <CaptureStage
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              audioBlob={audioBlob}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onProcessAudio={processAudio}
              onProcessText={processText}
              isProcessing={isProcessing}
              selectedInputMode={selectedInputMode}
              onInputModeChange={handleInputModeChange}
            />
          </motion.div>
        )}

        {state.currentStep === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <AnalysisStage
              isProcessing={isProcessing}
              progress={state.overallProgress}
              currentMessage={state.message}
              subMessage={state.subMessage}
            />
          </motion.div>
        )}

        {state.currentStep === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ReviewStage
              analysisResult={state.analysisResult}
              onComplete={actions.completePipeline}
              onCancel={actions.cancelPipeline}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActivityInputPage;
