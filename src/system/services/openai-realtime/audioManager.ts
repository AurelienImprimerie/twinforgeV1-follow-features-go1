/**
 * Audio Manager
 * Manages audio element, microphone access, and audio playback
 */

import logger from '../../../lib/utils/logger';
import type { AudioDiagnostics } from './types';

export class AudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private audioPlaybackStarted = false;
  private audioAutoplayBlocked = false;
  private audioInputActive = false;

  /**
   * Initialize audio element
   */
  createAudioElement(): HTMLAudioElement {
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;
    this.audioElement.volume = 1.0;
    this.audioElement.style.display = 'none';
    document.body.appendChild(this.audioElement);

    this.setupAudioEventHandlers();

    logger.info('REALTIME_AUDIO', '🔊 Audio element created', {
      autoplay: this.audioElement.autoplay,
      volume: this.audioElement.volume
    });

    return this.audioElement;
  }

  /**
   * Request microphone access
   */
  async getMicrophoneAccess(): Promise<MediaStream> {
    logger.info('REALTIME_AUDIO', '🎤 Requesting microphone access...');

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1
        }
      });

      logger.info('REALTIME_AUDIO', '✅ Microphone access granted', {
        trackCount: this.localStream.getTracks().length,
        tracks: this.localStream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          enabled: t.enabled
        }))
      });

      return this.localStream;
    } catch (error) {
      logger.error('REALTIME_AUDIO', '❌ Failed to get microphone access', { error });
      throw new Error('Microphone access required for voice sessions');
    }
  }

  /**
   * Setup audio element event handlers
   */
  private setupAudioEventHandlers(): void {
    if (!this.audioElement) return;

    this.audioElement.onplay = () => {
      logger.info('REALTIME_AUDIO', '▶️ Audio playback started', {
        volume: this.audioElement?.volume,
        muted: this.audioElement?.muted
      });
      this.audioPlaybackStarted = true;
      this.audioAutoplayBlocked = false;
    };

    this.audioElement.onplaying = () => {
      logger.info('REALTIME_AUDIO', '🔊 Audio is playing', {
        currentTime: this.audioElement?.currentTime,
        volume: this.audioElement?.volume
      });
    };

    this.audioElement.onpause = () => {
      logger.warn('REALTIME_AUDIO', '⏸️ Audio paused unexpectedly');
    };

    this.audioElement.onerror = () => {
      logger.error('REALTIME_AUDIO', '❌ Audio playback error', {
        error: this.audioElement?.error?.message,
        code: this.audioElement?.error?.code
      });
    };

    this.audioElement.onloadeddata = () => {
      logger.info('REALTIME_AUDIO', '📦 Audio data loaded');
    };

    this.audioElement.onvolumechange = () => {
      logger.debug('REALTIME_AUDIO', '🔊 Volume changed', {
        volume: this.audioElement?.volume,
        muted: this.audioElement?.muted
      });
    };
  }

  /**
   * Handle remote audio track
   */
  async handleRemoteTrack(event: RTCTrackEvent): Promise<void> {
    logger.info('REALTIME_AUDIO', '📥 Received remote audio track', {
      streamId: event.streams[0]?.id,
      trackKind: event.track.kind,
      trackEnabled: event.track.enabled
    });

    if (this.audioElement && event.streams[0]) {
      this.audioElement.srcObject = event.streams[0];
      logger.info('REALTIME_AUDIO', '✅ Audio stream connected', {
        streamActive: event.streams[0].active,
        audioTracks: event.streams[0].getAudioTracks().length
      });

      await this.ensureAudioPlayback();
    }
  }

  /**
   * Ensure audio playback (handle autoplay blocking)
   */
  private async ensureAudioPlayback(): Promise<void> {
    if (!this.audioElement || this.audioPlaybackStarted) return;

    try {
      logger.info('REALTIME_AUDIO', '🎵 Starting audio playback...');
      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        await playPromise;
        logger.info('REALTIME_AUDIO', '✅ Audio playback started automatically');
        this.audioPlaybackStarted = true;
        this.audioAutoplayBlocked = false;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        logger.warn('REALTIME_AUDIO', '⚠️ Autoplay blocked', {
          solution: 'User interaction required'
        });
        this.audioAutoplayBlocked = true;
        this.notifyAutoplayBlocked();
      } else {
        logger.error('REALTIME_AUDIO', '❌ Failed to start playback', { error });
      }
    }
  }

  /**
   * Notify that autoplay is blocked
   */
  private notifyAutoplayBlocked(): void {
    const event = new CustomEvent('voiceCoachAutoplayBlocked', {
      detail: {
        message: 'Cliquez pour activer l\'audio du coach',
        action: 'enableAudioPlayback'
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Enable audio playback manually (after user interaction)
   */
  async enableAudioPlayback(): Promise<boolean> {
    if (!this.audioElement) {
      logger.error('REALTIME_AUDIO', '❌ No audio element');
      return false;
    }

    if (this.audioPlaybackStarted) {
      logger.info('REALTIME_AUDIO', '✅ Already started');
      return true;
    }

    try {
      logger.info('REALTIME_AUDIO', '👆 User interaction - enabling audio...');
      await this.audioElement.play();
      this.audioPlaybackStarted = true;
      this.audioAutoplayBlocked = false;
      logger.info('REALTIME_AUDIO', '✅ Audio enabled by user');
      return true;
    } catch (error) {
      logger.error('REALTIME_AUDIO', '❌ Failed to enable audio', { error });
      return false;
    }
  }

  /**
   * Verify audio input status
   */
  verifyAudioInput(): void {
    if (!this.localStream) {
      logger.warn('REALTIME_AUDIO', '⚠️ No local audio stream');
      return;
    }

    const audioTracks = this.localStream.getAudioTracks();

    if (audioTracks.length === 0) {
      logger.error('REALTIME_AUDIO', '❌ No audio tracks');
      return;
    }

    this.audioInputActive = false;

    audioTracks.forEach((track, index) => {
      logger.info('REALTIME_AUDIO', `🎤 Audio track ${index}:`, {
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      });

      if (track.readyState === 'live' && track.enabled) {
        this.audioInputActive = true;
      }
    });

    if (this.audioInputActive) {
      logger.info('REALTIME_AUDIO', '✅ Audio input verification PASSED');
    } else {
      logger.error('REALTIME_AUDIO', '❌ Audio input verification FAILED');
    }
  }

  /**
   * Get audio diagnostics
   */
  getAudioDiagnostics(): AudioDiagnostics {
    return {
      hasAudioElement: !!this.audioElement,
      isPlaybackStarted: this.audioPlaybackStarted,
      isAutoplayBlocked: this.audioAutoplayBlocked,
      volume: this.audioElement?.volume ?? 0,
      muted: this.audioElement?.muted ?? false,
      readyState: this.audioElement?.readyState ?? 0,
      networkState: this.audioElement?.networkState ?? 0,
      paused: this.audioElement?.paused ?? true,
      hasStream: !!(this.audioElement?.srcObject),
      streamActive: (this.audioElement?.srcObject as MediaStream)?.active ?? false,
      audioTracks: (this.audioElement?.srcObject as MediaStream)?.getAudioTracks().length ?? 0
    };
  }

  /**
   * Log audio diagnostics
   */
  logAudioDiagnostics(): void {
    const diagnostics = this.getAudioDiagnostics();
    logger.info('REALTIME_AUDIO', '🔍 AUDIO DIAGNOSTICS', diagnostics);
  }

  /**
   * Cleanup audio resources
   */
  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
      this.audioElement = null;
    }

    this.audioPlaybackStarted = false;
    this.audioAutoplayBlocked = false;
    this.audioInputActive = false;
  }

  /**
   * Getters
   */
  get element(): HTMLAudioElement | null {
    return this.audioElement;
  }

  get stream(): MediaStream | null {
    return this.localStream;
  }

  get isInputActive(): boolean {
    return this.audioInputActive;
  }

  get isPlaybackStarted(): boolean {
    return this.audioPlaybackStarted;
  }

  get isAutoplayBlocked(): boolean {
    return this.audioAutoplayBlocked;
  }
}
