/**
 * Coach Message Renderer
 * Renders the appropriate message component based on message type
 */

import React from 'react';
import CoachMessage from './CoachMessage';
import CoachExerciseListMessage from './CoachExerciseListMessage';
import CoachCategorySelectionMessage from './CoachCategorySelectionMessage';
import CoachOptionSelectionMessage from './CoachOptionSelectionMessage';
import CoachValidationMessage from './CoachValidationMessage';
import CoachUpdateCompleteMessage from './CoachUpdateCompleteMessage';
import type { ExtendedChatMessage } from '../../../domain/chatMessages';
import type { ExerciseAdjustmentCategory } from '../../../config/exerciseAdjustmentConfig';

interface CoachMessageRendererProps {
  message: ExtendedChatMessage;
  stepColor: string;
  onExerciseClick?: (exerciseId: string, exerciseName: string) => void;
  onCategorySelect?: (category: ExerciseAdjustmentCategory) => void;
  onOptionSelect?: (optionId: string) => void;
  onValidate?: () => void;
  onModify?: () => void;
  onViewExercise?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
}

const CoachMessageRenderer: React.FC<CoachMessageRendererProps> = ({
  message,
  stepColor,
  onExerciseClick,
  onCategorySelect,
  onOptionSelect,
  onValidate,
  onModify,
  onViewExercise,
  onContinue,
  onBack
}) => {
  switch (message.type) {
    case 'exercise-list-intro':
      if (message.metadata?.exerciseListData && onExerciseClick) {
        const { exercises, programType, introText } = message.metadata.exerciseListData;
        return (
          <CoachExerciseListMessage
            exercises={exercises}
            programType={programType}
            introText={introText}
            onExerciseClick={onExerciseClick}
            stepColor={stepColor}
          />
        );
      }
      break;

    case 'category-selection':
      if (message.metadata?.exerciseName && onCategorySelect) {
        return (
          <CoachCategorySelectionMessage
            exerciseName={message.metadata.exerciseName}
            onCategorySelect={onCategorySelect}
            stepColor={stepColor}
          />
        );
      }
      break;

    case 'option-selection':
      if (message.metadata?.exerciseName && message.metadata?.category && onOptionSelect && onBack) {
        return (
          <CoachOptionSelectionMessage
            exerciseName={message.metadata.exerciseName}
            category={message.metadata.category as ExerciseAdjustmentCategory}
            onOptionSelect={onOptionSelect}
            onBack={onBack}
            stepColor={stepColor}
          />
        );
      }
      break;

    case 'validation':
      if (message.metadata?.validationData && onValidate && onModify) {
        const { exerciseName, adjustmentLabel, summary } = message.metadata.validationData;
        return (
          <CoachValidationMessage
            exerciseName={exerciseName}
            adjustmentLabel={adjustmentLabel}
            summary={summary}
            onValidate={onValidate}
            onModify={onModify}
            stepColor={stepColor}
          />
        );
      }
      break;

    case 'update-complete':
      if (message.metadata?.updateCompleteData && onViewExercise && onContinue) {
        const { exerciseName, newParameters } = message.metadata.updateCompleteData;
        return (
          <CoachUpdateCompleteMessage
            exerciseName={exerciseName}
            newParameters={newParameters}
            onViewExercise={onViewExercise}
            onContinue={onContinue}
            stepColor={stepColor}
          />
        );
      }
      break;

    default:
      return <CoachMessage message={message} stepColor={stepColor} />;
  }

  return <CoachMessage message={message} stepColor={stepColor} />;
};

export default CoachMessageRenderer;
