/**
 * OpenAI Whisper Service
 * Service pour la transcription audio voice-to-text
 * Utilise l'API Whisper d'OpenAI via une Edge Function Supabase
 */

import logger from '../../lib/utils/logger';

interface WhisperTranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

interface WhisperError {
  error: string;
  details?: string;
}

class OpenAIWhisperService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private stream: MediaStream | null = null;

  /**
   * Démarrer l'enregistrement audio
   */
  async startRecording(): Promise<void> {
    try {
      logger.info('WHISPER_SERVICE', 'Starting audio recording');

      // Demander l'accès au microphone
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Whisper recommande 16kHz
          channelCount: 1 // Mono
        }
      });

      logger.info('WHISPER_SERVICE', 'Microphone access granted');

      // Créer le MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      this.audioChunks = [];

      // Capturer les chunks audio
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          logger.debug('WHISPER_SERVICE', `Audio chunk captured: ${event.data.size} bytes`);
        }
      };

      // Démarrer l'enregistrement
      this.mediaRecorder.start(100); // Capturer par chunks de 100ms
      this.isRecording = true;

      logger.info('WHISPER_SERVICE', 'Recording started successfully', {
        mimeType,
        audioBitsPerSecond: 128000
      });
    } catch (error) {
      logger.error('WHISPER_SERVICE', 'Failed to start recording', { error });
      throw new Error('Impossible d\'accéder au microphone');
    }
  }

  /**
   * Arrêter l'enregistrement et retourner le blob audio
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Aucun enregistrement en cours'));
        return;
      }

      logger.info('WHISPER_SERVICE', 'Stopping recording');

      this.mediaRecorder.onstop = () => {
        const mimeType = this.getSupportedMimeType();
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        logger.info('WHISPER_SERVICE', 'Recording stopped', {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: this.audioChunks.length
        });

        // Nettoyer
        this.cleanup();

        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event) => {
        logger.error('WHISPER_SERVICE', 'MediaRecorder error', { event });
        this.cleanup();
        reject(new Error('Erreur lors de l\'enregistrement'));
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  /**
   * Transcrire un fichier audio
   */
  async transcribe(audioBlob: Blob): Promise<WhisperTranscriptionResult> {
    try {
      logger.info('WHISPER_SERVICE', 'Starting transcription', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      // Vérifier la taille minimale (1KB)
      if (audioBlob.size < 1024) {
        throw new Error('L\'enregistrement est trop court');
      }

      // Vérifier la taille maximale (25MB - limite OpenAI)
      if (audioBlob.size > 25 * 1024 * 1024) {
        throw new Error('L\'enregistrement est trop long');
      }

      // Préparer le FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Appeler l'Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/audio-transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: formData
      });

      if (!response.ok) {
        const errorData: WhisperError = await response.json();
        logger.error('WHISPER_SERVICE', 'Transcription failed', {
          status: response.status,
          error: errorData
        });
        throw new Error(errorData.error || 'Erreur lors de la transcription');
      }

      const result: WhisperTranscriptionResult = await response.json();

      logger.info('WHISPER_SERVICE', 'Transcription successful', {
        textLength: result.text.length,
        language: result.language,
        duration: result.duration
      });

      return result;
    } catch (error) {
      logger.error('WHISPER_SERVICE', 'Transcription error', { error });
      throw error;
    }
  }

  /**
   * Enregistrer et transcrire en une seule opération
   */
  async recordAndTranscribe(): Promise<string> {
    try {
      logger.info('WHISPER_SERVICE', 'Starting record and transcribe flow');

      await this.startRecording();

      // Attendre que l'utilisateur arrête l'enregistrement
      // (cette méthode sera appelée après que stopRecording ait été appelé)
      const audioBlob = await this.stopRecording();

      const result = await this.transcribe(audioBlob);

      return result.text;
    } catch (error) {
      logger.error('WHISPER_SERVICE', 'Record and transcribe error', { error });
      throw error;
    }
  }

  /**
   * Nettoyer les ressources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;

    logger.debug('WHISPER_SERVICE', 'Resources cleaned up');
  }

  /**
   * Obtenir le type MIME supporté par le navigateur
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    // Fallback
    return 'audio/webm';
  }

  /**
   * Vérifier si un enregistrement est en cours
   */
  get recording(): boolean {
    return this.isRecording;
  }

  /**
   * Annuler l'enregistrement en cours
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      logger.info('WHISPER_SERVICE', 'Cancelling recording');
      this.mediaRecorder.stop();
      this.cleanup();
    }
  }
}

// Export singleton
export const openaiWhisperService = new OpenAIWhisperService();
