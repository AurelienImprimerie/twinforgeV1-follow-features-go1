/**
 * BodyScanDataCollector - Collect all body scan data for user
 * Aggregates body scans, measurements, and progression trends
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '../../../../lib/utils/logger';
import type { BodyScanKnowledge, BodyScanSummary, BodyMeasurements } from '../../types';

export class BodyScanDataCollector {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async collect(userId: string): Promise<BodyScanKnowledge> {
    try {
      logger.info('BODY_SCAN_DATA_COLLECTOR', 'Starting body scan data collection', { userId });

      const recentScans = await this.collectRecentScans(userId);

      // Extract latest measurements
      const latestMeasurements = recentScans.length > 0 ? recentScans[0].measurements : null;

      // Calculate progression trend
      const progressionTrend = this.calculateProgressionTrend(recentScans);

      const lastScanDate = recentScans.length > 0 ? recentScans[0].scanDate : null;
      const hasData = recentScans.length > 0;

      logger.info('BODY_SCAN_DATA_COLLECTOR', 'Body scan data collected', {
        userId,
        scansCount: recentScans.length,
        hasLatestMeasurements: !!latestMeasurements,
        progressionTrend,
        hasData
      });

      return {
        recentScans,
        lastScanDate,
        latestMeasurements,
        progressionTrend,
        hasData
      };
    } catch (error) {
      logger.error('BODY_SCAN_DATA_COLLECTOR', 'Failed to collect body scan data', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Collect recent body scans (last 90 days)
   */
  private async collectRecentScans(userId: string): Promise<BodyScanSummary[]> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: scans, error } = await this.supabase
      .from('body_scans')
      .select('id, timestamp, weight, body_fat_percentage, bmi, waist_circumference, metrics, raw_measurements')
      .eq('user_id', userId)
      .gte('timestamp', ninetyDaysAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('BODY_SCAN_DATA_COLLECTOR', 'Failed to load body scans', { userId, error });
      return [];
    }

    if (!scans || scans.length === 0) {
      return [];
    }

    return scans.map((scan) => {
      // Extract measurements from JSONB or direct columns
      const metrics = scan.metrics as any || {};
      const rawMeasurements = scan.raw_measurements as any || {};

      return {
        id: scan.id,
        scanDate: scan.timestamp,
        scanType: 'photo_scan',
        measurements: {
          weight: scan.weight || metrics.weight || rawMeasurements.weight,
          bodyFat: scan.body_fat_percentage || metrics.bodyFat || rawMeasurements.bodyFat,
          muscleMass: metrics.muscleMass || rawMeasurements.muscleMass,
          waist: scan.waist_circumference || metrics.waist || rawMeasurements.waist,
          chest: metrics.chest || rawMeasurements.chest,
          arms: metrics.arms || rawMeasurements.arms,
          legs: metrics.legs || rawMeasurements.legs
        }
      };
    });
  }

  /**
   * Calculate progression trend based on recent scans
   */
  private calculateProgressionTrend(
    scans: BodyScanSummary[]
  ): 'improving' | 'stable' | 'declining' | null {
    if (scans.length < 2) {
      return null;
    }

    // Compare most recent scan with average of previous scans
    const latest = scans[0].measurements;
    const previous = scans.slice(1, Math.min(4, scans.length));

    // Calculate average muscle mass and body fat from previous scans
    let avgMuscleMass = 0;
    let avgBodyFat = 0;
    let muscleMassCount = 0;
    let bodyFatCount = 0;

    previous.forEach((scan) => {
      if (scan.measurements.muscleMass !== undefined) {
        avgMuscleMass += scan.measurements.muscleMass;
        muscleMassCount++;
      }
      if (scan.measurements.bodyFat !== undefined) {
        avgBodyFat += scan.measurements.bodyFat;
        bodyFatCount++;
      }
    });

    if (muscleMassCount > 0) avgMuscleMass /= muscleMassCount;
    if (bodyFatCount > 0) avgBodyFat /= bodyFatCount;

    // Determine trend (improving = more muscle OR less fat)
    let improvingScore = 0;
    let decliningScore = 0;

    if (latest.muscleMass !== undefined && muscleMassCount > 0) {
      const muscleDiff = latest.muscleMass - avgMuscleMass;
      if (muscleDiff > 0.5) improvingScore++;
      else if (muscleDiff < -0.5) decliningScore++;
    }

    if (latest.bodyFat !== undefined && bodyFatCount > 0) {
      const fatDiff = latest.bodyFat - avgBodyFat;
      if (fatDiff < -1) improvingScore++;
      else if (fatDiff > 1) decliningScore++;
    }

    if (improvingScore > decliningScore) return 'improving';
    if (decliningScore > improvingScore) return 'declining';
    return 'stable';
  }
}
