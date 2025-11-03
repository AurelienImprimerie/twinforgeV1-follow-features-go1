/**
 * Voice Feedback Transcription Service
 * Handles voice recording and transcription using OpenAI Whisper API
 *
 * Follows OpenAI and MDN best practices for MediaRecorder API
 * with comprehensive error handling and cross-browser support
 */

import logger from '../../lib/utils/logger';

export interface TranscriptionResult {
  text: string;
  duration: number;
  language?: string;
  confidence?: number;
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioBlob?: Blob;
}

export enum RecordingErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  DEVICE_IN_USE = 'DEVICE_IN_USE',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  SECURITY_ERROR = 'SECURITY_ERROR',
  INVALID_STATE = 'INVALID_STATE',
  UNKNOWN = 'UNKNOWN',
}

export interface RecordingError {
  type: RecordingErrorType;
  message: string;
  userMessage: string;
  suggestion: string;
}

class VoiceFeedbackTranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private stream: MediaStream | null = null;
  private hiddenAudio: HTMLAudioElement | null = null;
  private isInitializing: boolean = false;

  /**
   * Check if browser supports audio recording
   */
  isBrowserSupported(): boolean {
    const isSupported = !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );

    if (!isSupported) {
      logger.warn('VOICE_TRANSCRIPTION', 'Browser does not support audio recording', {
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!(navigator.mediaDevices?.getUserMedia),
        hasMediaRecorder: !!window.MediaRecorder,
      });
    }

    return isSupported;
  }

  /**
   * Check if current context is secure (HTTPS or localhost)
   */
  isSecureContext(): boolean {
    return window.isSecureContext;
  }

  /**
   * Categorize and format getUserMedia errors
   */
  private categorizeError(error: Error): RecordingError {
    const errorName = error.name;
    const errorMessage = error.message.toLowerCase();

    // Permission denied errors
    if (
      errorName === 'NotAllowedError' ||
      errorName === 'PermissionDeniedError' ||
      errorMessage.includes('permission')
    ) {
      return {
        type: RecordingErrorType.PERMISSION_DENIED,
        message: error.message,
        userMessage: 'Accès au microphone refusé',
        suggestion:
          'Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur, puis réessayez.',
      };
    }

    // Device not found errors
    if (
      errorName === 'NotFoundError' ||
      errorName === 'DevicesNotFoundError' ||
      errorMessage.includes('not found')
    ) {
      return {
        type: RecordingErrorType.DEVICE_NOT_FOUND,
        message: error.message,
        userMessage: 'Aucun microphone détecté',
        suggestion:
          'Veuillez connecter un microphone à votre appareil et réessayez.',
      };
    }

    // Device in use errors
    if (
      errorName === 'NotReadableError' ||
      errorName === 'TrackStartError' ||
      errorMessage.includes('in use') ||
      errorMessage.includes('already')
    ) {
      return {
        type: RecordingErrorType.DEVICE_IN_USE,
        message: error.message,
        userMessage: 'Microphone déjà utilisé',
        suggestion:
          'Le microphone est utilisé par une autre application. Fermez les autres applications utilisant le microphone et réessayez.',
      };
    }

    // Browser not supported
    if (
      errorMessage.includes('not supported') ||
      errorMessage.includes('unsupported')
    ) {
      return {
        type: RecordingErrorType.NOT_SUPPORTED,
        message: error.message,
        userMessage: 'Navigateur non supporté',
        suggestion:
          'Veuillez utiliser un navigateur récent comme Chrome, Firefox ou Safari.',
      };
    }

    // Security errors
    if (
      errorName === 'SecurityError' ||
      errorMessage.includes('secure') ||
      errorMessage.includes('https')
    ) {
      return {
        type: RecordingErrorType.SECURITY_ERROR,
        message: error.message,
        userMessage: 'Contexte non sécurisé',
        suggestion:
          'L\'enregistrement audio nécessite une connexion sécurisée (HTTPS).',
      };
    }

    // Default unknown error
    return {
      type: RecordingErrorType.UNKNOWN,
      message: error.message,
      userMessage: 'Erreur d\'enregistrement',
      suggestion:
        'Une erreur inattendue s\'est produite. Veuillez rafraîchir la page et réessayer.',
    };
  }

  /**
   * Request microphone permission and initialize recorder
   */
  async initializeRecorder(): Promise<void> {
    // Prevent concurrent initialization
    if (this.isInitializing) {
      logger.warn('VOICE_TRANSCRIPTION', 'Already initializing recorder');
      return;
    }

    this.isInitializing = true;

    try {
      // Check browser support
      if (!this.isBrowserSupported()) {
        const error = new Error('Browser does not support audio recording');
        error.name = 'NotSupportedError';
        throw error;
      }

      // Check secure context
      if (!this.isSecureContext()) {
        logger.warn('VOICE_TRANSCRIPTION', 'Not in secure context');
      }

      // Cleanup any existing recorder
      this.cleanup();

      logger.info('VOICE_TRANSCRIPTION', 'Requesting microphone access');

      // Request microphone access with optimal settings
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Validate stream has active audio tracks
      const audioTracks = this.stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available in stream');
      }

      logger.info('VOICE_TRANSCRIPTION', 'Stream acquired', {
        trackCount: audioTracks.length,
        trackLabel: audioTracks[0].label,
        trackEnabled: audioTracks[0].enabled,
        trackReadyState: audioTracks[0].readyState,
      });

      // Create hidden audio element to keep stream alive (best practice)
      this.hiddenAudio = document.createElement('audio');
      this.hiddenAudio.srcObject = this.stream;
      this.hiddenAudio.muted = true;
      this.hiddenAudio.play().catch((e) => {
        logger.warn('VOICE_TRANSCRIPTION', 'Hidden audio play failed', { error: e });
      });

      // Choose best available audio format
      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported audio format found');
      }

      logger.info('VOICE_TRANSCRIPTION', 'Using audio format', { mimeType });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
      });

      // Setup data handler
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
          logger.debug('VOICE_TRANSCRIPTION', 'Audio chunk received', {
            size: event.data.size,
            totalChunks: this.audioChunks.length,
          });
        }
      };

      // Setup error handler
      this.mediaRecorder.onerror = (event) => {
        logger.error('VOICE_TRANSCRIPTION', 'MediaRecorder error', {
          error: event,
        });
      };

      // Wait a bit for stream to stabilize
      await new Promise((resolve) => setTimeout(resolve, 100));

      logger.info('VOICE_TRANSCRIPTION', 'Recorder initialized successfully', {
        state: this.mediaRecorder.state,
        mimeType: this.mediaRecorder.mimeType,
      });
    } catch (error) {
      const categorizedError = error instanceof Error ? this.categorizeError(error) : null;

      logger.error('VOICE_TRANSCRIPTION', 'Failed to initialize recorder', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: categorizedError?.type,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Cleanup on error
      this.cleanup();

      // Re-throw with categorized error
      if (categorizedError) {
        const enhancedError = new Error(categorizedError.userMessage);
        enhancedError.name = categorizedError.type;
        (enhancedError as any).suggestion = categorizedError.suggestion;
        throw enhancedError;
      }

      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Get best supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus', // Best quality and compression (Chrome, Firefox)
      'audio/webm',              // Fallback webm
      'audio/ogg;codecs=opus',   // Firefox preference
      'audio/ogg',               // Older Firefox
      'audio/mp4',               // Safari
      'audio/mpeg',              // Fallback
      'audio/wav',               // Maximum compatibility
    ];

    logger.debug('VOICE_TRANSCRIPTION', 'Testing audio format support');

    for (const type of types) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          logger.info('VOICE_TRANSCRIPTION', 'Found supported format', { type });
          return type;
        }
      } catch (error) {
        logger.warn('VOICE_TRANSCRIPTION', 'Error testing format', {
          type,
          error: error instanceof Error ? error.message : 'Unknown',
        });
      }
    }

    logger.error('VOICE_TRANSCRIPTION', 'No supported audio format found');
    return '';
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    try {
      // Initialize if needed
      if (!this.mediaRecorder) {
        await this.initializeRecorder();
      }

      // Validate recorder exists
      if (!this.mediaRecorder) {
        throw new Error('Media recorder not initialized');
      }

      // Check if already recording
      if (this.mediaRecorder.state === 'recording') {
        logger.warn('VOICE_TRANSCRIPTION', 'Already recording');
        return;
      }

      // Validate stream is still active
      if (this.stream) {
        const tracks = this.stream.getAudioTracks();
        if (tracks.length === 0 || tracks[0].readyState !== 'live') {
          logger.warn('VOICE_TRANSCRIPTION', 'Stream not active, reinitializing');
          await this.initializeRecorder();

          if (!this.mediaRecorder) {
            throw new Error('Failed to reinitialize recorder');
          }
        }
      }

      // Reset audio chunks
      this.audioChunks = [];
      this.recordingStartTime = Date.now();

      // Start recording with timeslice for regular data chunks
      this.mediaRecorder.start(100);

      // Verify recording started
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (this.mediaRecorder.state !== 'recording') {
        throw new Error('Failed to start recording');
      }

      logger.info('VOICE_TRANSCRIPTION', 'Recording started', {
        state: this.mediaRecorder.state,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('VOICE_TRANSCRIPTION', 'Failed to start recording', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Media recorder not initialized'));
        return;
      }

      if (this.mediaRecorder.state !== 'recording') {
        reject(new Error('Not currently recording'));
        return;
      }

      // Setup stop handler
      this.mediaRecorder.onstop = () => {
        try {
          const duration = Date.now() - this.recordingStartTime;
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';

          // Validate we have audio data
          if (this.audioChunks.length === 0) {
            reject(new Error('No audio data recorded'));
            return;
          }

          const audioBlob = new Blob(this.audioChunks, { type: mimeType });

          // Validate blob size
          if (audioBlob.size === 0) {
            reject(new Error('Audio blob is empty'));
            return;
          }

          logger.info('VOICE_TRANSCRIPTION', 'Recording stopped', {
            duration,
            size: audioBlob.size,
            type: audioBlob.type,
            chunks: this.audioChunks.length,
          });

          resolve(audioBlob);
        } catch (error) {
          logger.error('VOICE_TRANSCRIPTION', 'Error creating audio blob', {
            error: error instanceof Error ? error.message : 'Unknown',
          });
          reject(error);
        }
      };

      // Setup error handler
      this.mediaRecorder.onerror = (event) => {
        logger.error('VOICE_TRANSCRIPTION', 'Error stopping recording', { event });
        reject(new Error('Recording error occurred'));
      };

      try {
        this.mediaRecorder.stop();
        this.stopStream();
      } catch (error) {
        logger.error('VOICE_TRANSCRIPTION', 'Exception stopping recorder', {
          error: error instanceof Error ? error.message : 'Unknown',
        });
        reject(error);
      }
    });
  }

  /**
   * Cancel recording without saving
   */
  cancelRecording(): void {
    try {
      if (this.mediaRecorder) {
        if (
          this.mediaRecorder.state === 'recording' ||
          this.mediaRecorder.state === 'paused'
        ) {
          this.mediaRecorder.stop();
        }
      }
      this.stopStream();
      this.audioChunks = [];
      logger.info('VOICE_TRANSCRIPTION', 'Recording cancelled');
    } catch (error) {
      logger.error('VOICE_TRANSCRIPTION', 'Error cancelling recording', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  /**
   * Stop media stream and release microphone
   */
  private stopStream(): void {
    try {
      // Stop hidden audio element
      if (this.hiddenAudio) {
        this.hiddenAudio.pause();
        this.hiddenAudio.srcObject = null;
        this.hiddenAudio = null;
      }

      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach((track) => {
          track.stop();
          logger.debug('VOICE_TRANSCRIPTION', 'Track stopped', {
            kind: track.kind,
            label: track.label,
          });
        });
        this.stream = null;
        logger.info('VOICE_TRANSCRIPTION', 'Media stream stopped');
      }
    } catch (error) {
      logger.error('VOICE_TRANSCRIPTION', 'Error stopping stream', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  /**
   * Get current recording duration in seconds
   */
  getRecordingDuration(): number {
    if (this.mediaRecorder?.state === 'recording') {
      return Math.floor((Date.now() - this.recordingStartTime) / 1000);
    }
    return 0;
  }

  /**
   * Transcribe audio blob using OpenAI Whisper API
   */
  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
      logger.info('VOICE_TRANSCRIPTION', 'Starting transcription', {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      // Convert blob to proper format if needed
      const audioFile = await this.prepareAudioFile(audioBlob);

      // Call OpenAI Whisper API via edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables not configured');
      }

      const formData = new FormData();
      formData.append('file', audioFile, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'fr'); // French by default

      const response = await fetch(
        `${supabaseUrl}/functions/v1/training-voice-transcribe`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            apikey: supabaseAnonKey,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('VOICE_TRANSCRIPTION', 'Transcription API error', {
          status: response.status,
          error: errorText,
        });
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Transcription failed');
      }

      const transcriptionTime = Date.now() - startTime;

      logger.info('VOICE_TRANSCRIPTION', 'Transcription completed', {
        text: result.data.text,
        language: result.data.language,
        duration: transcriptionTime,
      });

      return {
        text: result.data.text,
        duration: transcriptionTime,
        language: result.data.language,
        confidence: result.data.confidence,
      };
    } catch (error) {
      const transcriptionTime = Date.now() - startTime;

      logger.error('VOICE_TRANSCRIPTION', 'Transcription failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: transcriptionTime,
      });

      throw error;
    }
  }

  /**
   * Prepare audio file for transcription (convert if needed)
   */
  private async prepareAudioFile(audioBlob: Blob): Promise<File> {
    // Whisper accepts various formats, but webm/opus is preferred
    const file = new File([audioBlob], 'recording.webm', {
      type: audioBlob.type || 'audio/webm',
    });

    return file;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    try {
      this.cancelRecording();
      this.audioChunks = [];
      this.mediaRecorder = null;
      this.isInitializing = false;
      logger.info('VOICE_TRANSCRIPTION', 'Service cleaned up');
    } catch (error) {
      logger.error('VOICE_TRANSCRIPTION', 'Error during cleanup', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  /**
   * Get current recorder state for debugging
   */
  getState(): {
    hasRecorder: boolean;
    recorderState: string | null;
    hasStream: boolean;
    streamActive: boolean;
    trackCount: number;
  } {
    const audioTracks = this.stream?.getAudioTracks() || [];
    return {
      hasRecorder: !!this.mediaRecorder,
      recorderState: this.mediaRecorder?.state || null,
      hasStream: !!this.stream,
      streamActive: audioTracks.length > 0 && audioTracks[0].readyState === 'live',
      trackCount: audioTracks.length,
    };
  }
}

export const voiceFeedbackTranscriptionService =
  new VoiceFeedbackTranscriptionService();
