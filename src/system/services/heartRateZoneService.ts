/**
 * Heart Rate Zone Service
 * Manages heart rate zone calculations and feedback
 */

import {
  HEART_RATE_ZONES,
  calculateHeartRateZone,
  calculateMaxHeartRate,
  getZoneHeartRateRange,
  type HeartRateZone,
  type HeartRateZoneConfig,
} from '../../domain/enduranceSession';
import logger from '../../lib/utils/logger';

class HeartRateZoneService {
  /**
   * Get zone configuration
   */
  getZoneConfig(zone: HeartRateZone): HeartRateZoneConfig {
    return HEART_RATE_ZONES[zone];
  }

  /**
   * Get all zones configuration
   */
  getAllZonesConfig(): Record<HeartRateZone, HeartRateZoneConfig> {
    return HEART_RATE_ZONES;
  }

  /**
   * Calculate FCMax based on age
   */
  calculateFCMax(age: number): number {
    return calculateMaxHeartRate(age);
  }

  /**
   * Determine zone from heart rate and max heart rate
   */
  determineZone(heartRate: number, maxHeartRate: number): HeartRateZone {
    return calculateHeartRateZone(heartRate, maxHeartRate);
  }

  /**
   * Get heart rate range for a zone
   */
  getZoneRange(zone: HeartRateZone, maxHeartRate: number): { min: number; max: number } {
    return getZoneHeartRateRange(zone, maxHeartRate);
  }

  /**
   * Check if heart rate is within target zone
   */
  isInTargetZone(
    heartRate: number,
    targetZone: HeartRateZone,
    maxHeartRate: number,
    tolerance: number = 5
  ): {
    isInZone: boolean;
    deviation: 'too_low' | 'perfect' | 'too_high' | null;
    difference: number;
  } {
    const range = this.getZoneRange(targetZone, maxHeartRate);
    const currentZone = this.determineZone(heartRate, maxHeartRate);

    const isInZone = heartRate >= range.min - tolerance && heartRate <= range.max + tolerance;

    let deviation: 'too_low' | 'perfect' | 'too_high' | null = null;
    let difference = 0;

    if (heartRate < range.min - tolerance) {
      deviation = 'too_low';
      difference = range.min - heartRate;
    } else if (heartRate > range.max + tolerance) {
      deviation = 'too_high';
      difference = heartRate - range.max;
    } else {
      deviation = 'perfect';
    }

    logger.debug('HEART_RATE_ZONE_SERVICE', 'Zone check', {
      heartRate,
      targetZone,
      currentZone,
      isInZone,
      deviation,
      difference,
    });

    return { isInZone, deviation, difference };
  }

  /**
   * Get feedback message for zone deviation
   */
  getZoneFeedback(
    heartRate: number,
    targetZone: HeartRateZone,
    maxHeartRate: number
  ): string | null {
    const check = this.isInTargetZone(heartRate, targetZone, maxHeartRate);

    if (check.deviation === 'perfect') {
      return null; // No feedback needed
    }

    if (check.deviation === 'too_low') {
      return `Tu es en dessous de ${targetZone}, augmente légèrement l'intensité`;
    }

    if (check.deviation === 'too_high') {
      const currentZone = this.determineZone(heartRate, maxHeartRate);
      return `Tu es en ${currentZone}, reviens en ${targetZone}`;
    }

    return null;
  }

  /**
   * Get zone color for UI display
   */
  getZoneColor(zone: HeartRateZone): string {
    return HEART_RATE_ZONES[zone].color;
  }

  /**
   * Calculate percentage of FCMax
   */
  calculateFCMaxPercentage(heartRate: number, maxHeartRate: number): number {
    return Math.round((heartRate / maxHeartRate) * 100);
  }

  /**
   * Parse zone string (e.g., "Z2", "Z3-Z4") and return primary zone
   */
  parseZoneString(zoneString: string): HeartRateZone | null {
    if (!zoneString) return null;

    const match = zoneString.match(/Z([1-5])/);
    if (match) {
      return `Z${match[1]}` as HeartRateZone;
    }

    return null;
  }

  /**
   * Get recommended zone for different training types
   */
  getRecommendedZone(trainingType: string): HeartRateZone {
    const zoneMap: Record<string, HeartRateZone> = {
      recovery: 'Z1',
      easy: 'Z2',
      base: 'Z2',
      tempo: 'Z3',
      threshold: 'Z4',
      vo2max: 'Z5',
      intervals: 'Z5',
    };

    return zoneMap[trainingType.toLowerCase()] || 'Z2';
  }

  /**
   * Calculate average zone from time distribution
   */
  calculateAverageZone(zonesDistribution: Record<HeartRateZone, number>): number {
    const zoneValues: Record<HeartRateZone, number> = {
      Z1: 1,
      Z2: 2,
      Z3: 3,
      Z4: 4,
      Z5: 5,
    };

    let totalTime = 0;
    let weightedSum = 0;

    Object.entries(zonesDistribution).forEach(([zone, time]) => {
      const zoneValue = zoneValues[zone as HeartRateZone];
      totalTime += time;
      weightedSum += zoneValue * time;
    });

    if (totalTime === 0) return 2; // Default to Z2

    return Math.round(weightedSum / totalTime);
  }

  /**
   * Get zone label with description
   */
  getZoneLabel(zone: HeartRateZone, includeDescription: boolean = false): string {
    const config = HEART_RATE_ZONES[zone];
    if (includeDescription) {
      return `${config.zone} - ${config.label}: ${config.description}`;
    }
    return `${config.zone} - ${config.label}`;
  }

  /**
   * Validate heart rate value
   */
  isValidHeartRate(heartRate: number): boolean {
    return heartRate >= 40 && heartRate <= 220;
  }
}

export const heartRateZoneService = new HeartRateZoneService();
