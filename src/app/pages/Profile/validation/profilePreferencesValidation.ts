import { z } from 'zod';

/**
 * Validation Schema for Training Preferences
 * Used by ProfileTrainingTab
 */

export const preferencesSchema = z.object({
  workout: z.object({
    type: z.string().optional(),
    fitnessLevel: z.string().optional(),
    sessionsPerWeek: z.number().optional(),
    preferredDuration: z.number().optional(),
    equipment: z.array(z.string()).optional(),
    specificGoals: z.array(z.string()).optional(),
    morningWorkouts: z.boolean().optional(),
    highIntensity: z.boolean().optional(),
    groupWorkouts: z.boolean().optional(),
    outdoorActivities: z.boolean().optional(),
  }).optional(),
});

export type PreferencesForm = z.infer<typeof preferencesSchema>;
