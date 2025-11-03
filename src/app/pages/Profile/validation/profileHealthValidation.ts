/**
 * Profile Health Validation
 * Zod schemas and validation logic for profile health forms
 */

import { z } from 'zod';

// Validation schema for health data
export const healthSchema = z.object({
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  physicalLimitations: z.array(z.string()).default([]),
  declaredNoIssues: z.boolean().default(false),
});

export type HealthForm = z.infer<typeof healthSchema>;