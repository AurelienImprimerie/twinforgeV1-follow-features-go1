/**
 * Event Types - Training and System Events
 * Defines all events that can be emitted by the Head System
 */

export type EventType =
  // Training Session Events
  | 'session:started'
  | 'session:paused'
  | 'session:resumed'
  | 'session:completed'
  | 'session:abandoned'

  // Exercise Events
  | 'exercise:started'
  | 'exercise:completed'
  | 'exercise:skipped'

  // Set Events
  | 'set:started'
  | 'set:completed'
  | 'set:failed'

  // Rest Events
  | 'rest:started'
  | 'rest:ended'
  | 'rest:skipped'

  // Performance Events
  | 'rpe:reported'
  | 'load:adjusted'
  | 'reps:adjusted'
  | 'pain:reported'
  | 'fatigue:reported'

  // Milestone Events
  | 'record:achieved'
  | 'milestone:reached'

  // User Interaction Events
  | 'question:asked'
  | 'feedback:provided'
  | 'motivation:requested'

  // System Events
  | 'context:refreshed'
  | 'data:synced';

export interface BaseEvent {
  type: EventType;
  timestamp: number;
  userId: string;
  sessionId?: string;
}

export interface SessionStartedEvent extends BaseEvent {
  type: 'session:started';
  discipline: string;
  totalExercises: number;
  expectedDuration: number;
}

export interface SessionCompletedEvent extends BaseEvent {
  type: 'session:completed';
  duration: number;
  exercisesCompleted: number;
  totalSets: number;
  averageRPE?: number;
}

export interface ExerciseStartedEvent extends BaseEvent {
  type: 'exercise:started';
  exerciseName: string;
  exerciseIndex: number;
  totalExercises: number;
  load?: number;
  targetReps: string;
  totalSets: number;
}

export interface ExerciseCompletedEvent extends BaseEvent {
  type: 'exercise:completed';
  exerciseName: string;
  exerciseIndex: number;
  setsCompleted: number;
  averageRPE?: number;
}

export interface SetStartedEvent extends BaseEvent {
  type: 'set:started';
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  load?: number;
  targetReps: string;
}

export interface SetCompletedEvent extends BaseEvent {
  type: 'set:completed';
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  load?: number;
  actualReps: number | string;
  rpe?: number;
  notes?: string;
}

export interface RestStartedEvent extends BaseEvent {
  type: 'rest:started';
  exerciseName: string;
  setNumber: number;
  duration: number;
}

export interface RestEndedEvent extends BaseEvent {
  type: 'rest:ended';
  exerciseName: string;
  setNumber: number;
  actualDuration: number;
}

export interface RPEReportedEvent extends BaseEvent {
  type: 'rpe:reported';
  exerciseName: string;
  setNumber: number;
  rpe: number;
  load?: number;
}

export interface LoadAdjustedEvent extends BaseEvent {
  type: 'load:adjusted';
  exerciseName: string;
  previousLoad: number;
  newLoad: number;
  reason: 'too_easy' | 'too_hard' | 'pain' | 'user_choice';
}

export interface PainReportedEvent extends BaseEvent {
  type: 'pain:reported';
  exerciseName: string;
  setNumber?: number;
  painLevel: number;
  location: string;
  description?: string;
}

export interface RecordAchievedEvent extends BaseEvent {
  type: 'record:achieved';
  exerciseName: string;
  recordType: 'weight' | 'reps' | 'volume';
  previousValue: number | string;
  newValue: number | string;
}

export interface QuestionAskedEvent extends BaseEvent {
  type: 'question:asked';
  question: string;
  context: 'training' | 'nutrition' | 'general';
  exerciseName?: string;
}

export interface FeedbackProvidedEvent extends BaseEvent {
  type: 'feedback:provided';
  feedbackType: 'positive' | 'negative' | 'neutral';
  message: string;
  context?: string;
}

export type TrainingEvent =
  | SessionStartedEvent
  | SessionCompletedEvent
  | ExerciseStartedEvent
  | ExerciseCompletedEvent
  | SetStartedEvent
  | SetCompletedEvent
  | RestStartedEvent
  | RestEndedEvent
  | RPEReportedEvent
  | LoadAdjustedEvent
  | PainReportedEvent
  | RecordAchievedEvent
  | QuestionAskedEvent
  | FeedbackProvidedEvent;

export type EventListener<T extends TrainingEvent = TrainingEvent> = (event: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}
