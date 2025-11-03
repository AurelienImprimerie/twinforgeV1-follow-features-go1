/**
 * Chat State Machine
 * State machine pour la conversation guidée Step 2
 */

export type ConversationStateType =
  | 'idle'
  | 'greeting'
  | 'exercise_selection'
  | 'category_selection'
  | 'option_selection'
  | 'validation'
  | 'updating'
  | 'complete';

export interface ChatState {
  type: ConversationStateType;
  selectedExerciseId?: string;
  selectedExerciseName?: string;
  selectedCategory?: string;
  selectedOption?: string;
  context?: any;
}

export const initialChatState: ChatState = {
  type: 'idle'
};

export const intentPatterns = {
  exerciseMention: /(?:exercice|mouvement|exo)\s+(\d+)/i,
  categoryKeywords: {
    volume: /(?:série|rep|répétition|volume|nombre)/i,
    intensity: /(?:charge|poids|intensité|lourd|léger|kg)/i,
    technique: /(?:technique|forme|exécution|tempo|amplitude)/i,
    equipment: /(?:équipement|matériel|barre|haltère|machine)/i,
    substitution: /(?:remplacer|changer|substituer|autre)/i,
    timing: /(?:temps|repos|pause|récupération|durée)/i
  },
  confirmation: /(?:oui|ok|valide|confirme|c'est bon|parfait)/i,
  modification: /(?:non|change|modifie|plutôt|en fait)/i
};

export function detectExerciseIntent(message: string): number | null {
  const match = message.match(intentPatterns.exerciseMention);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export function detectCategoryIntent(message: string): string | null {
  for (const [category, pattern] of Object.entries(intentPatterns.categoryKeywords)) {
    if (pattern.test(message)) {
      return category;
    }
  }
  return null;
}

export function detectConfirmationIntent(message: string): 'confirm' | 'modify' | null {
  if (intentPatterns.confirmation.test(message)) {
    return 'confirm';
  }
  if (intentPatterns.modification.test(message)) {
    return 'modify';
  }
  return null;
}

export function transitionState(
  currentState: ChatState,
  action: {
    type: 'select_exercise' | 'select_category' | 'select_option' | 'confirm' | 'reset';
    payload?: any;
  }
): ChatState {
  switch (action.type) {
    case 'select_exercise':
      return {
        type: 'category_selection',
        selectedExerciseId: action.payload.exerciseId,
        selectedExerciseName: action.payload.exerciseName
      };

    case 'select_category':
      return {
        ...currentState,
        type: 'option_selection',
        selectedCategory: action.payload.category
      };

    case 'select_option':
      return {
        ...currentState,
        type: 'validation',
        selectedOption: action.payload.option
      };

    case 'confirm':
      return {
        ...currentState,
        type: 'updating'
      };

    case 'reset':
      return initialChatState;

    default:
      return currentState;
  }
}
