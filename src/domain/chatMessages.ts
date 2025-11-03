/**
 * Extended Chat Message Types
 * Types pour les messages interactifs du chat avec boutons CTA
 */

import type { ChatMessage } from './coachChat';
import type { ExerciseAdjustmentCategory } from '../config/exerciseAdjustmentConfig';

export type ExtendedChatMessageType =
  | 'text'
  | 'audio'
  | 'feedback'
  | 'system'
  | 'exercise-list-intro'
  | 'category-selection'
  | 'option-selection'
  | 'validation'
  | 'update-complete';

export interface Exercise {
  id: string;
  name: string;
  orderIndex: number;
  sets?: number;
  reps?: number;
  load?: string;
  tempo?: string;
  rest?: string;
  rpe?: number;
}

export interface ExerciseListData {
  exercises: Exercise[];
  programType: string;
  introText: string;
}

export interface ValidationData {
  exerciseName: string;
  adjustmentLabel: string;
  summary: string;
  currentValue?: any;
  newValue?: any;
}

export interface UpdateCompleteData {
  exerciseName: string;
  newParameters: {
    sets?: number;
    reps?: number;
    load?: string;
    tempo?: string;
    rest?: string;
  };
}

export interface ExtendedChatMessage extends Omit<ChatMessage, 'type'> {
  type: ExtendedChatMessageType;
  metadata?: {
    exerciseId?: string;
    exerciseName?: string;
    category?: ExerciseAdjustmentCategory;
    optionId?: string;
    currentValue?: any;
    newValue?: any;
    exerciseListData?: ExerciseListData;
    validationData?: ValidationData;
    updateCompleteData?: UpdateCompleteData;
  };
}
