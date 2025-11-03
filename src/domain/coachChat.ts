/**
 * Coach Chat Domain Types
 * Types for AI coach conversation system
 */

export type MessageRole = 'coach' | 'user' | 'system';

export type MessageType = 'text' | 'audio' | 'feedback' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
  audioUrl?: string;
  metadata?: {
    exerciseId?: string;
    feedbackType?: string;
    originalRequest?: string;
  };
}

export type FeedbackCategory =
  | 'intensity-too-easy'
  | 'intensity-perfect'
  | 'intensity-too-hard'
  | 'time-shorter'
  | 'time-ok'
  | 'time-longer'
  | 'exercise-change'
  | 'exercise-remove'
  | 'exercise-add-cardio'
  | 'equipment-missing'
  | 'equipment-prefer';

export interface FeedbackButton {
  id: FeedbackCategory;
  label: string;
  icon: string;
  color: string;
  category: 'intensity' | 'time' | 'exercise' | 'equipment';
  message: string;
}

export interface ExerciseFeedback {
  exerciseId: string;
  exerciseName: string;
  action: 'thumbs-up' | 'thumbs-down' | 'modify' | 'substitute' | 'info';
  details?: {
    newSets?: number;
    newReps?: number;
    newLoad?: number;
    reason?: string;
  };
  timestamp: Date;
}

export type CoachVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';

export interface VoiceSettings {
  voice: CoachVoice;
  speed: number;
  volume: number;
  enabled: boolean;
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  preparerData: any;
  currentPrescription: any;
  modifications: ExerciseFeedback[];
  userPreferences: {
    communicationStyle: 'concise' | 'detailed' | 'motivational';
    language: string;
  };
}

export type ConversationState =
  | 'intro'
  | 'presenting-plan'
  | 'gathering-feedback'
  | 'adjusting-plan'
  | 'finalizing'
  | 'completed';

export interface CoachPersonality {
  name: string;
  description: string;
  traits: string[];
  communicationStyle: string;
  expertiseAreas: string[];
}
