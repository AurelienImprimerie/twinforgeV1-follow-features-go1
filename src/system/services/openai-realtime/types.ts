/**
 * OpenAI Realtime API - Type Definitions
 * Shared types and interfaces for the Realtime WebRTC service
 */

import type { ChatMode } from '../../store/unifiedCoachStore';

export type VoiceType = 'alloy' | 'echo' | 'shimmer' | 'fable' | 'onyx' | 'nova';

export interface RealtimeConfig {
  model: string;
  voice: VoiceType;
  temperature?: number;
  maxTokens?: number;
  instructions?: string;
}

export interface RealtimeMessage {
  type: string;
  [key: string]: any;
}

export type MessageHandler = (message: RealtimeMessage) => void;
export type ErrorHandler = (error: Error) => void;
export type ConnectionHandler = () => void;

export interface ConnectionDiagnostics {
  isConnected: boolean;
  sessionConfigured: boolean;
  audioInputActive: boolean;
  peerConnectionState: string;
  iceConnectionState: string;
  dataChannelState: string;
  localStreamActive: boolean;
  audioTracksCount: number;
}

export interface AudioDiagnostics {
  hasAudioElement: boolean;
  isPlaybackStarted: boolean;
  isAutoplayBlocked: boolean;
  volume: number;
  muted: boolean;
  readyState: number;
  networkState: number;
  paused: boolean;
  hasStream: boolean;
  streamActive: boolean;
  audioTracks: number;
}

export { ChatMode };
