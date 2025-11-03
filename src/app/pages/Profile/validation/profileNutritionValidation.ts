/**
 * Profile Nutrition Validation - Enhanced for Recipe Workshop
 * Zod schemas and validation logic for enhanced nutrition preferences
 */

import { z } from 'zod';

// Tri-state preference schema
const triStatePreferenceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  state: z.enum(['like', 'neutral', 'dislike', 'ban']),
  intensity: z.number().min(1).max(5).optional(),
});

// Household details schema
const householdDetailsSchema = z.object({
  adults: z.number().min(1).max(20).default(1),
  children: z.number().min(0).max(20).default(0),
  dietaryRestrictions: z.array(z.string()).default([]),
});

// Meal prep preferences schema
const mealPrepPreferencesSchema = z.object({
  weekdayTimeMin: z.number().min(5).max(180).default(30),
  weekendTimeMin: z.number().min(5).max(300).default(60),
  cookingSkill: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  preferredMealTimes: z.object({
    breakfast: z.string().optional(),
    lunch: z.string().optional(),
    dinner: z.string().optional(),
  }).optional(),
});

// Kitchen equipment schema
const kitchenEquipmentSchema = z.object({
  oven: z.boolean().default(true),
  stove: z.boolean().default(true),
  microwave: z.boolean().default(true),
  airFryer: z.boolean().default(false),
  slowCooker: z.boolean().default(false),
  blender: z.boolean().default(false),
  foodProcessor: z.boolean().default(false),
  standMixer: z.boolean().default(false),
  riceCooker: z.boolean().default(false),
  grill: z.boolean().default(false),
  steamBasket: z.boolean().default(false),
  pressureCooker: z.boolean().default(false),
});

// Food preferences schema
const foodPreferencesSchema = z.object({
  cuisines: z.array(triStatePreferenceSchema).default([]),
  ingredients: z.array(triStatePreferenceSchema).default([]),
  flavors: z.array(triStatePreferenceSchema).default([]),
});

// Sensory preferences schema
const sensoryPreferencesSchema = z.object({
  spiceTolerance: z.number().min(0).max(3).default(1),
  textureAversions: z.array(z.string()).default([]),
  temperaturePreferences: z.array(z.string()).default([]),
});

// Macro targets schema
const macroTargetsSchema = z.object({
  kcal: z.number().min(800).max(5000).optional(),
  fiberMinG: z.number().min(0).max(100).optional(),
  sugarMaxG: z.number().min(0).max(200).optional(),
  saltMaxMg: z.number().min(0).max(10000).optional(),
  carbsMaxG: z.number().min(0).max(1000).optional(),
  fatMinG: z.number().min(0).max(300).optional(),
});

// Shopping preferences schema
const shoppingPreferencesSchema = z.object({
  frequencyPerWeek: z.number().min(1).max(7).default(2),
  defaultPortionsPerMeal: z.number().min(1).max(12).default(2),
  batchCooking: z.enum(['never', 'sometimes', 'often']).default('sometimes'),
  bias: z.array(z.string()).default([]),
  preferredStores: z.array(z.string()).default([]),
  budgetPerWeek: z.number().min(0).max(1000).optional(),
});

// Enhanced nutrition schema for Recipe Workshop
export const enhancedNutritionSchema = z.object({
  // Existing fields
  diet: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  intolerances: z.array(z.string()).default([]),
  budgetLevel: z.enum(['low', 'medium', 'high']).optional(),
  noKnownAllergies: z.boolean().default(false),
  
  // New Recipe Workshop fields
  householdDetails: householdDetailsSchema.optional(),
  mealPrepPreferences: mealPrepPreferencesSchema.optional(),
  kitchenEquipment: kitchenEquipmentSchema.optional(),
  foodPreferences: foodPreferencesSchema.optional(),
  sensoryPreferences: sensoryPreferencesSchema.optional(),
  macroTargets: macroTargetsSchema.optional(),
  shoppingPreferences: shoppingPreferencesSchema.optional(),
});

export type EnhancedNutritionForm = z.infer<typeof enhancedNutritionSchema>;

// Export individual schemas for modular use
export {
  triStatePreferenceSchema,
  householdDetailsSchema,
  mealPrepPreferencesSchema,
  kitchenEquipmentSchema,
  foodPreferencesSchema,
  sensoryPreferencesSchema,
  macroTargetsSchema,
  shoppingPreferencesSchema,
};