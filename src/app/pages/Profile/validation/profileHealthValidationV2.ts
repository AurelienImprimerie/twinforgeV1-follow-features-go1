/**
 * Profile Health Validation V2 - Extended for Preventive Medicine
 * Zod schemas and validation logic for comprehensive health forms
 */

import { z } from 'zod';

const surgerySchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  type: z.string().min(1, 'Le type de chirurgie est requis'),
  details: z.string().optional(),
  complications: z.string().optional(),
});

const hospitalizationSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  reason: z.string().min(1, 'La raison est requise'),
  duration_days: z.number().min(1, 'La durée doit être d\'au moins 1 jour'),
  outcome: z.string().optional(),
});

const familyHistorySchema = z.object({
  cardiovascular: z.boolean().optional(),
  diabetes: z.boolean().optional(),
  cancer: z.array(z.string()).optional(),
  hypertension: z.boolean().optional(),
  alzheimers: z.boolean().optional(),
  genetic_conditions: z.array(z.string()).optional(),
});

const vaccinationRecordSchema = z.object({
  name: z.string().min(1, 'Le nom du vaccin est requis'),
  date: z.string().min(1, 'La date est requise'),
  next_due: z.string().optional(),
  required: z.boolean().default(false),
  booster_required: z.boolean().optional(),
  location: z.string().optional(),
});

const vaccinationsSchema = z.object({
  up_to_date: z.boolean(),
  records: z.array(vaccinationRecordSchema).default([]),
  last_reviewed: z.string().optional(),
});

const vitalSignsSchema = z.object({
  blood_pressure_systolic: z.number().min(50).max(250).optional(),
  blood_pressure_diastolic: z.number().min(30).max(150).optional(),
  resting_heart_rate: z.number().min(30).max(200).optional(),
  blood_glucose_mg_dl: z.number().min(40).max(600).optional(),
  body_temperature_celsius: z.number().min(35).max(42).optional(),
  spo2_percent: z.number().min(70).max(100).optional(),
  last_measured: z.string().optional(),
});

const lifestyleSchema = z.object({
  smoking_status: z.enum(['never', 'former', 'current']).optional(),
  smoking_years: z.number().min(0).max(100).optional(),
  smoking_per_day: z.number().min(0).max(100).optional(),
  alcohol_frequency: z.enum(['never', 'occasional', 'moderate', 'frequent']).optional(),
  alcohol_units_per_week: z.number().min(0).max(200).optional(),
  sleep_hours_avg: z.number().min(0).max(24).optional(),
  sleep_quality: z.number().min(1).max(10).optional(),
  stress_level: z.number().min(1).max(10).optional(),
  physical_activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete']).optional(),
  exercise_minutes_per_week: z.number().min(0).max(10080).optional(),
  diet_quality: z.number().min(1).max(10).optional(),
});

const pregnancyHistoryItemSchema = z.object({
  year: z.number().min(1900).max(new Date().getFullYear()),
  outcome: z.string().min(1),
  complications: z.array(z.string()).optional(),
});

const reproductiveHealthSchema = z.object({
  menstrual_cycle_regular: z.boolean().optional(),
  cycle_length_days: z.number().min(20).max(45).optional(),
  pregnancy_count: z.number().min(0).max(30).optional(),
  pregnancy_history: z.array(pregnancyHistoryItemSchema).optional(),
  menopause_status: z.enum(['pre', 'peri', 'post', 'not_applicable']).optional(),
  menopause_age: z.number().min(30).max(65).optional(),
  contraception: z.string().optional(),
});

const mentalHealthSchema = z.object({
  conditions: z.array(z.string()).default([]),
  therapy: z.boolean().optional(),
  therapy_frequency: z.string().optional(),
  medications: z.array(z.string()).default([]),
  diagnosed_date: z.record(z.string()).optional(),
});

const medicalDevicesSchema = z.object({
  implants: z.array(z.string()).default([]),
  devices: z.array(z.string()).default([]),
  details: z.record(z.string()).optional(),
});

const medicalHistorySchema = z.object({
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  surgeries: z.array(surgerySchema).default([]),
  hospitalizations: z.array(hospitalizationSchema).default([]),
  chronic_diseases: z.array(z.string()).default([]),
  family_history: familyHistorySchema.optional(),
});

const basicHealthInfoSchema = z.object({
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  relationship: z.string().min(1, 'La relation est requise'),
});

const primaryCarePhysicianSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  email: z.string().email('Email invalide').optional(),
  address: z.string().optional(),
});

export const healthV2Schema = z.object({
  version: z.literal('2.0'),
  basic: basicHealthInfoSchema.optional(),
  medical_history: medicalHistorySchema.optional(),
  vaccinations: vaccinationsSchema.optional(),
  vital_signs: vitalSignsSchema.optional(),
  lifestyle: lifestyleSchema.optional(),
  reproductive_health: reproductiveHealthSchema.optional(),
  mental_health: mentalHealthSchema.optional(),
  medical_devices: medicalDevicesSchema.optional(),
  physical_limitations: z.array(z.string()).default([]),
  last_checkup_date: z.string().optional(),
  next_checkup_due: z.string().optional(),
  declaredNoIssues: z.boolean().default(false),
  emergency_contact: emergencyContactSchema.optional(),
  primary_care_physician: primaryCarePhysicianSchema.optional(),
});

export const healthV1Schema = z.object({
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  physicalLimitations: z.array(z.string()).default([]),
  declaredNoIssues: z.boolean().default(false),
});

export const healthSchema = z.union([healthV1Schema, healthV2Schema]);

export type HealthFormV2 = z.infer<typeof healthV2Schema>;
export type HealthFormV1 = z.infer<typeof healthV1Schema>;
export type HealthForm = z.infer<typeof healthSchema>;

export const basicHealthSectionSchema = z.object({
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

export const medicalHistorySectionSchema = z.object({
  conditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  chronic_diseases: z.array(z.string()).default([]),
  declaredNoIssues: z.boolean().default(false),
});

export const familyHistorySectionSchema = z.object({
  cardiovascular: z.boolean().optional(),
  diabetes: z.boolean().optional(),
  cancer: z.array(z.string()).optional(),
  hypertension: z.boolean().optional(),
  alzheimers: z.boolean().optional(),
  genetic_conditions: z.array(z.string()).optional(),
});

export const lifestyleSectionSchema = z.object({
  smoking_status: z.enum(['never', 'former', 'current']).optional(),
  smoking_years: z.number().min(0).max(100).optional(),
  alcohol_frequency: z.enum(['never', 'occasional', 'moderate', 'frequent']).optional(),
  sleep_hours_avg: z.number().min(0).max(24).optional(),
  stress_level: z.number().min(1).max(10).optional(),
  physical_activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete']).optional(),
});

export const vitalSignsSectionSchema = z.object({
  blood_pressure_systolic: z.number().min(50).max(250).optional(),
  blood_pressure_diastolic: z.number().min(30).max(150).optional(),
  resting_heart_rate: z.number().min(30).max(200).optional(),
  blood_glucose_mg_dl: z.number().min(40).max(600).optional(),
  last_measured: z.string().optional(),
});

export const vaccinationsSectionSchema = z.object({
  up_to_date: z.boolean(),
  records: z.array(vaccinationRecordSchema).default([]),
});

export type BasicHealthSectionForm = z.infer<typeof basicHealthSectionSchema>;
export type MedicalHistorySectionForm = z.infer<typeof medicalHistorySectionSchema>;
export type FamilyHistorySectionForm = z.infer<typeof familyHistorySectionSchema>;
export type LifestyleSectionForm = z.infer<typeof lifestyleSectionSchema>;
export type VitalSignsSectionForm = z.infer<typeof vitalSignsSectionSchema>;
export type VaccinationsSectionForm = z.infer<typeof vaccinationsSectionSchema>;
