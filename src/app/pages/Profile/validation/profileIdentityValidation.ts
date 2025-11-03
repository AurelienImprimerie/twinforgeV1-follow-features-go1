/**
 * Profile Identity Validation
 * Zod schemas and validation logic for profile identity forms
 */

import { z } from 'zod';

// Validation schema for profile identity
export const profileIdentitySchema = z.object({
  displayName: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  sex: z.enum(['male', 'female'], { required_error: 'Le genre est requis' }),
  height_cm: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? null : Number(val),
    z.number()
      .nullable()
      .refine((val) => val !== null && val > 0, { message: 'La taille est requise et doit être supérieure à 0' })
      .refine((val) => val === null || (val >= 120 && val <= 230), { 
        message: 'La taille doit être entre 120 et 230 cm' 
      })
  ),
  weight_kg: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? null : Number(val),
    z.number()
      .nullable()
      .refine((val) => val !== null && val > 0, { message: 'Le poids est requis et doit être supérieur à 0' })
      .refine((val) => val === null || (val >= 30 && val <= 300), { 
        message: 'Le poids doit être entre 30 et 300 kg' 
      })
  ),
  birthdate: z.string().nullable().optional().transform(val => !val || val === '' ? null : val),
  target_weight_kg: z.number()
    .min(30, 'Le poids cible doit être d\'au moins 30 kg')
    .max(300, 'Le poids cible ne peut pas dépasser 300 kg')
    .nullable()
    .optional()
    .transform(val => val === 0 || !val ? null : val),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete'])
    .nullable()
    .optional()
    .transform(val => !val || val === '' ? null : val),
  objective: z.enum(['fat_loss', 'recomp', 'muscle_gain'])
    .nullable()
    .optional()
    .transform(val => !val || val === '' ? null : val),
  job_category: z.enum(['office', 'field', 'shift', 'manual', 'student', 'other'])
    .nullable()
    .optional()
    .transform(val => !val || val === '' ? null : val),
  phone_number: z.string()
    .nullable()
    .optional()
    .transform(val => !val || val === '' ? null : val),
  country: z.string()
    .nullable()
    .optional()
    .transform(val => !val || val === '' ? null : val),
});

export type ProfileIdentityForm = z.infer<typeof profileIdentitySchema>;