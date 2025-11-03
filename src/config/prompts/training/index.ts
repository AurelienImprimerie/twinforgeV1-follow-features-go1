/**
 * Training Prompts - Central Export
 * Initialize and export all training prompts
 */

import { registerContextCollectorPrompts } from './contextCollectorPrompts';
import { registerCoachForcePrompts } from './coachForcePrompts';
import { registerCoachEndurancePrompts } from './coachEndurancePrompts';

export { promptRegistry, createPrompt, type PromptTemplate } from './promptManager';
export * from './coachCalisthenicsPrompts';
export * from './coachFunctionalPrompts';
export * from './coachCompetitionsPrompts';

/**
 * Initialize all training prompts
 * Call this once at app startup
 */
export function initializeTrainingPrompts(): void {
  registerContextCollectorPrompts();
  registerCoachForcePrompts();
  registerCoachEndurancePrompts();

  // Calisthenics, Functional, and Competitions prompts are registered automatically via module import

  // More coach prompts will be registered in future phases
  // registerCoachCombatPrompts();
  // registerCoachWellnessPrompts();
  // registerCoachSportsPrompts();
  // registerCoachMixedPrompts();
}
