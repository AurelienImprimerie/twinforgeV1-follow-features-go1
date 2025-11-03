/**
 * Coach Functional Agent Prompts
 * Orchestrates specialized Functional Training, CrossFit, HIIT, and Circuit Training coach
 */

import { createPrompt, promptRegistry } from './promptManager';
import type { AgentType } from '../../../domain/ai/trainingAiTypes';
import {
  RECOVERY_MONITORING_SECTION,
  CROSSFIT_PHILOSOPHY_SECTION,
  WOD_FORMATS_SECTION,
  OLYMPIC_LIFTS_SECTION,
  GYMNASTIC_MOVEMENTS_SECTION,
  MONOSTRUCTURAL_CARDIO_SECTION,
  SESSION_PROGRAMMING_SECTION,
  SCALING_SYSTEM_SECTION,
  BENCHMARK_WODS_SECTION,
  SAFETY_PRINCIPLES_SECTION,
  JSON_FORMAT_SECTION,
} from './functional';

const AGENT_TYPE: AgentType = 'coach-functional';

const v1_0_0 = createPrompt()
  .setVersion('1.0.0')
  .setDescription('Coach spécialisé en Functional Training, CrossFit, HIIT, et Circuit Training')
  .setAuthor('TwinForge AI Team')
  .setSystem(`Tu es un coach IA expert en Functional Training et CrossFit avec une expertise approfondie en:
- **CrossFit**: Entraînement fonctionnel varié haute intensité (WODs, benchmarks, scaling)
- **HIIT**: High Intensity Interval Training (sprints, conditioning métabolique)
- **Functional Training**: Mouvements fonctionnels multi-articulaires
- **Circuit Training**: Enchaînements de stations avec variété

${RECOVERY_MONITORING_SECTION}

${CROSSFIT_PHILOSOPHY_SECTION}

${WOD_FORMATS_SECTION}

${OLYMPIC_LIFTS_SECTION}

${GYMNASTIC_MOVEMENTS_SECTION}

${MONOSTRUCTURAL_CARDIO_SECTION}

${SESSION_PROGRAMMING_SECTION}

${SCALING_SYSTEM_SECTION}

${BENCHMARK_WODS_SECTION}

${SAFETY_PRINCIPLES_SECTION}

${JSON_FORMAT_SECTION}`)
  .setUser(`Génère une prescription WOD Functional/CrossFit personnalisée basée sur le contexte utilisateur fourni.

**LANGUE** : TOUT le contenu doit être en français :
- Noms des exercices en français (ex: "Développé" pas "Press", "Tractions" pas "Pull-ups")
- wodName en français (ex: "Fran" peut rester "Fran" si c'est un benchmark WOD officiel)
- coachingCues en français
- scalingOptions descriptions en français
- strategyNotes en français
- Tous les textes descriptifs en français
- Les termes techniques universels (AMRAP, EMOM, RX, WOD) peuvent rester tels quels`)
  .build();

promptRegistry.register(AGENT_TYPE, v1_0_0);

export const getCoachFunctionalPrompt = (version: string = 'latest') => {
  return promptRegistry.get(AGENT_TYPE, version);
};

export const getAllCoachFunctionalPrompts = () => {
  return promptRegistry.getAll(AGENT_TYPE);
};
