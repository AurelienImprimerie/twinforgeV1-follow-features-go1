/**
 * Profile Fasting Validation
 * Zod schemas and validation logic for profile fasting forms
 */

import { z } from 'zod';

// Validation schema for fasting data
export const fastingSchema = z.object({
  fastingWindow: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    windowHours: z.number().min(8).max(24).optional(),
    mealsPerDay: z.number().min(1).max(8).optional(),
    protocol: z.string().optional(),
  }).optional(),
  proteinTarget_g: z.number().min(0).max(300).optional(),
  caloriesTarget: z.number().min(800).max(5000).optional(),
});

export type FastingForm = z.infer<typeof fastingSchema>;