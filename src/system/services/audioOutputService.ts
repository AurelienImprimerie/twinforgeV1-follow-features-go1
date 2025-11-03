/**
 * Audio Output Service
 * Gestion de la lecture des réponses vocales du coach
 * Décode et joue l'audio PCM16 reçu de l'API Realtime
 */

import logger from '../../lib/utils/logger';

interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

class AudioOutputService {
  private audioContext: AudioContext | null = null;
  private audioQueue: AudioChunk[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private sampleRate = 24000;
  private volume = 1.0;

  /**
   * Initialiser le service de sortie audio
   */
  async initialize(sampleRate = 24000): Promise<void> {
    try {
      logger.info('AUDIO_OUTPUT', 'Initializing audio output service', { sampleRate });

      this.sampleRate = sampleRate;

      // Créer le contexte audio s'il n'existe pas
      if (!this.audioContext) {
        logger.debug('AUDIO_OUTPUT', 'Creating AudioContext');

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('AudioContext not supported in this browser');
        }

        this.audioContext = new AudioContextClass({
          sampleRate: this.sampleRate
        });

        logger.debug('AUDIO_OUTPUT', 'AudioContext created', {
          state: this.audioContext.state,
          sampleRate: this.audioContext.sampleRate
        });
      }

      // Créer le gain node pour contrôler le volume
      logger.debug('AUDIO_OUTPUT', 'Creating gain node');
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);

      logger.info('AUDIO_OUTPUT', 'Audio output service initialized successfully');
    } catch (error) {
      logger.error('AUDIO_OUTPUT', 'Failed to initialize audio output', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Ajouter un chunk audio à la queue
   */
  addAudioChunk(base64Audio: string): void {
    if (!this.audioContext) {
      logger.warn('AUDIO_OUTPUT', 'Cannot add audio chunk: not initialized');
      return;
    }

    try {
      // Décoder le base64 en ArrayBuffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioChunk: AudioChunk = {
        data: bytes.buffer,
        timestamp: Date.now()
      };

      this.audioQueue.push(audioChunk);

      // Démarrer la lecture si pas déjà en cours
      if (!this.isPlaying) {
        this.processAudioQueue();
      }

    } catch (error) {
      logger.error('AUDIO_OUTPUT', 'Error adding audio chunk', { error });
    }
  }

  /**
   * Traiter la queue audio et jouer les chunks
   */
  private async processAudioQueue(): Promise<void> {
    if (this.isPlaying || this.audioQueue.length === 0 || !this.audioContext || !this.gainNode) {
      return;
    }

    this.isPlaying = true;

    while (this.audioQueue.length > 0) {
      const chunk = this.audioQueue.shift();
      if (!chunk) continue;

      try {
        await this.playAudioChunk(chunk.data);
      } catch (error) {
        logger.error('AUDIO_OUTPUT', 'Error playing audio chunk', { error });
      }
    }

    this.isPlaying = false;
  }

  /**
   * Jouer un chunk audio
   */
  private async playAudioChunk(pcm16Data: ArrayBuffer): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      throw new Error('Audio context not initialized');
    }

    // Reprendre le contexte s'il est suspendu
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Convertir PCM16 en Float32 pour le Web Audio API
    const pcm16Array = new Int16Array(pcm16Data);
    const float32Array = new Float32Array(pcm16Array.length);

    for (let i = 0; i < pcm16Array.length; i++) {
      // Normaliser de Int16 (-32768 to 32767) à Float32 (-1.0 to 1.0)
      float32Array[i] = pcm16Array[i] / (pcm16Array[i] < 0 ? 0x8000 : 0x7fff);
    }

    // Créer un buffer audio
    const audioBuffer = this.audioContext.createBuffer(
      1, // mono
      float32Array.length,
      this.sampleRate
    );

    // Copier les données dans le buffer
    audioBuffer.getChannelData(0).set(float32Array);

    // Créer et connecter la source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);

    this.currentSource = source;

    // Attendre la fin de la lecture
    await new Promise<void>((resolve) => {
      source.onended = () => {
        this.currentSource = null;
        resolve();
      };

      source.start(0);
    });
  }

  /**
   * Arrêter la lecture en cours
   */
  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
        this.currentSource = null;
      } catch (error) {
        logger.debug('AUDIO_OUTPUT', 'Error stopping audio source', { error });
      }
    }

    // Vider la queue
    this.audioQueue = [];
    this.isPlaying = false;

    logger.info('AUDIO_OUTPUT', 'Audio playback stopped');
  }

  /**
   * Définir le volume (0.0 à 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }

    logger.debug('AUDIO_OUTPUT', 'Volume updated', { volume: this.volume });
  }

  /**
   * Obtenir le volume actuel
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Vérifier si la lecture est en cours
   */
  get playing(): boolean {
    return this.isPlaying;
  }

  /**
   * Obtenir le nombre de chunks en attente
   */
  get queueLength(): number {
    return this.audioQueue.length;
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    logger.info('AUDIO_OUTPUT', 'Cleaning up audio output service');

    this.stop();

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioQueue = [];
  }

  /**
   * Vérifier si le service est initialisé
   */
  get initialized(): boolean {
    return this.audioContext !== null && this.gainNode !== null;
  }
}

// Export singleton
export const audioOutputService = new AudioOutputService();
