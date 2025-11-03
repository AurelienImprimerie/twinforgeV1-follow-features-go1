/**
 * Audio Input Service
 * Gestion de l'entrée audio (microphone), permissions et traitement
 */

import logger from '../../lib/utils/logger';

export interface AudioConfig {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface AudioLevel {
  volume: number;
  peak: number;
  isSpeaking: boolean;
}

type AudioDataCallback = (audioData: Float32Array) => void;
type AudioLevelCallback = (level: AudioLevel) => void;

class AudioInputService {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isRecording = false;
  private audioDataCallbacks: Set<AudioDataCallback> = new Set();
  private audioLevelCallbacks: Set<AudioLevelCallback> = new Set();
  private volumeThreshold = 0.01;
  private silenceThreshold = 0.005;
  private rafId: number | null = null;

  /**
   * Initialiser le service audio
   */
  async initialize(config: AudioConfig = {}): Promise<void> {
    try {
      logger.info('AUDIO_INPUT', 'Initializing audio input');

      // Demander l'accès au microphone
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.sampleRate || 24000,
          channelCount: config.channelCount || 1,
          echoCancellation: config.echoCancellation ?? true,
          noiseSuppression: config.noiseSuppression ?? true,
          autoGainControl: config.autoGainControl ?? true
        }
      });

      // Créer le contexte audio
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: config.sampleRate || 24000
      });

      // Créer les nœuds audio
      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Créer le processor pour capturer l'audio
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

      // Connecter les nœuds
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      // Handler pour le traitement audio
      this.processorNode.onaudioprocess = (event) => {
        if (this.isRecording) {
          const inputData = event.inputBuffer.getChannelData(0);
          this.audioDataCallbacks.forEach(callback => callback(inputData));
        }
      };

      logger.info('AUDIO_INPUT', 'Audio input initialized successfully');

      // Démarrer l'analyse du niveau audio
      this.startLevelMonitoring();

    } catch (error) {
      logger.error('AUDIO_INPUT', 'Failed to initialize audio input', { error });
      throw error;
    }
  }

  /**
   * Démarrer l'enregistrement
   */
  startRecording(): void {
    if (this.isRecording) {
      logger.warn('AUDIO_INPUT', 'Already recording');
      return;
    }

    if (!this.audioContext || !this.stream) {
      logger.error('AUDIO_INPUT', 'Cannot start recording: not initialized');
      return;
    }

    // Reprendre le contexte audio si suspendu
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isRecording = true;
    logger.info('AUDIO_INPUT', 'Recording started');
  }

  /**
   * Arrêter l'enregistrement
   */
  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    logger.info('AUDIO_INPUT', 'Recording stopped');
  }

  /**
   * Surveiller le niveau audio en temps réel
   */
  private startLevelMonitoring(): void {
    if (!this.analyserNode) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const monitor = () => {
      if (!this.analyserNode) return;

      this.analyserNode.getByteFrequencyData(dataArray);

      // Calculer le volume moyen
      let sum = 0;
      let peak = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        sum += value;
        if (value > peak) peak = value;
      }

      const volume = sum / bufferLength;
      const isSpeaking = volume > this.volumeThreshold;

      // Notifier les callbacks
      this.audioLevelCallbacks.forEach(callback => {
        callback({ volume, peak, isSpeaking });
      });

      this.rafId = requestAnimationFrame(monitor);
    };

    monitor();
  }

  /**
   * Arrêter la surveillance du niveau audio
   */
  private stopLevelMonitoring(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Obtenir les fréquences pour visualisation
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode) return null;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);

    return dataArray;
  }

  /**
   * Enregistrer des callbacks
   */
  onAudioData(callback: AudioDataCallback): () => void {
    this.audioDataCallbacks.add(callback);
    return () => this.audioDataCallbacks.delete(callback);
  }

  onAudioLevel(callback: AudioLevelCallback): () => void {
    this.audioLevelCallbacks.add(callback);
    return () => this.audioLevelCallbacks.delete(callback);
  }

  /**
   * Configurer les seuils de détection
   */
  setVolumeThreshold(threshold: number): void {
    this.volumeThreshold = Math.max(0, Math.min(1, threshold));
    logger.debug('AUDIO_INPUT', 'Volume threshold updated', { threshold: this.volumeThreshold });
  }

  setSilenceThreshold(threshold: number): void {
    this.silenceThreshold = Math.max(0, Math.min(1, threshold));
    logger.debug('AUDIO_INPUT', 'Silence threshold updated', { threshold: this.silenceThreshold });
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    logger.info('AUDIO_INPUT', 'Cleaning up audio input');

    this.stopRecording();
    this.stopLevelMonitoring();

    // Déconnecter les nœuds
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Fermer le contexte audio
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Arrêter le stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Vider les callbacks
    this.audioDataCallbacks.clear();
    this.audioLevelCallbacks.clear();
  }

  /**
   * Vérifier si le service est initialisé
   */
  get initialized(): boolean {
    return this.audioContext !== null && this.stream !== null;
  }

  /**
   * Vérifier si en cours d'enregistrement
   */
  get recording(): boolean {
    return this.isRecording;
  }

  /**
   * Obtenir le contexte audio
   */
  get context(): AudioContext | null {
    return this.audioContext;
  }
}

// Export singleton
export const audioInputService = new AudioInputService();
