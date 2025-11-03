/**
 * Profile Calculations Utilities
 * BMI calculations and validation utilities for profile forms
 */

/**
 * Validate if all required values are present for calculations
 */
export function isValidForCalculations(
  height: number | undefined, 
  weight: number | undefined, 
  targetWeight: number | undefined
): boolean {
  // Require height and weight to be valid numbers > 0
  const hasValidHeight = typeof height === 'number' && !isNaN(height) && height > 0;
  const hasValidWeight = typeof weight === 'number' && !isNaN(weight) && weight > 0;
  
  // For target weight, allow undefined but if present, must be valid
  const hasValidTargetWeight = targetWeight === undefined || 
    (typeof targetWeight === 'number' && !isNaN(targetWeight) && targetWeight > 0);
  
  return hasValidHeight && hasValidWeight && hasValidTargetWeight;
}

/**
 * Calculate BMI safely with validation
 */
export function calculateBMIValue(weight: number | undefined, height: number | undefined): number {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return 0;
  }
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Validate result
  if (!Number.isFinite(bmi) || Number.isNaN(bmi)) {
    return 0;
  }
  
  return bmi;
}

/**
 * Calculate and format BMI for display
 */
export function calculateBMI(weight: number | undefined, height: number | undefined): string {
  const bmi = calculateBMIValue(weight, height);
  
  if (bmi === 0) {
    return '--';
  }
  
  return bmi.toFixed(1);
}

/**
 * Calculate weight difference safely
 */
export function calculateWeightDifference(targetWeight: number | undefined, currentWeight: number | undefined): string {
  if (!targetWeight || !currentWeight || targetWeight <= 0 || currentWeight <= 0) {
    return '--';
  }
  
  const difference = targetWeight - currentWeight;
  
  if (!Number.isFinite(difference) || Number.isNaN(difference)) {
    return '--';
  }
  
  const sign = difference > 0 ? '+' : '';
  return `${sign}${difference.toFixed(1)} kg`;
}

/**
 * Get BMI category for display
 */
export function getBMICategory(bmi: number): string {
  if (!Number.isFinite(bmi) || Number.isNaN(bmi) || bmi <= 0) {
    return '--';
  }
  
  if (bmi < 18.5) return 'Insuffisant';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Surpoids';
  return 'Obésité';
}