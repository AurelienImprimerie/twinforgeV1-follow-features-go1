/**
 * useBackgroundAnalysis Hook
 * Hook pour gérer l'analyse en arrière-plan des photos de lieux d'entraînement
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserStore } from '../system/store/userStore';
import {
  getActiveJobs,
  getLocationJobs,
  createBatchDetectionJobs,
  calculateBatchProgress,
  subscribeToJobUpdates,
  type DetectionJob,
  type BatchJobProgress,
  type PhotoJobInfo
} from '../system/services/backgroundAnalysisService';
import logger from '../lib/utils/logger';

interface UseBackgroundAnalysisReturn {
  activeJobs: DetectionJob[];
  locationJobs: { [locationId: string]: DetectionJob[] };
  batchProgress: BatchJobProgress | null;
  isAnalyzing: boolean;
  hasActiveJobs: boolean;

  startBatchAnalysis: (
    locationId: string,
    photos: PhotoJobInfo[],
    locationType: 'home' | 'gym' | 'outdoor'
  ) => Promise<void>;
  getLocationProgress: (locationId: string) => BatchJobProgress | null;
  refreshJobs: () => Promise<void>;
}

export function useBackgroundAnalysis(): UseBackgroundAnalysisReturn {
  const { profile } = useUserStore();
  const userId = profile?.userId;

  const [activeJobs, setActiveJobs] = useState<DetectionJob[]>([]);
  const [locationJobs, setLocationJobs] = useState<{ [locationId: string]: DetectionJob[] }>({});
  const [batchProgress, setBatchProgress] = useState<BatchJobProgress | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const isAnalyzing = activeJobs.length > 0;
  const hasActiveJobs = activeJobs.some((job) => job.status === 'pending' || job.status === 'processing');

  const refreshJobs = useCallback(async () => {
    if (!userId) {
      setActiveJobs([]);
      setLocationJobs({});
      setBatchProgress(null);
      return;
    }

    try {
      const jobs = await getActiveJobs(userId);
      setActiveJobs(jobs);

      const jobsByLocation: { [locationId: string]: DetectionJob[] } = {};
      jobs.forEach((job) => {
        if (!jobsByLocation[job.location_id]) {
          jobsByLocation[job.location_id] = [];
        }
        jobsByLocation[job.location_id].push(job);
      });
      setLocationJobs(jobsByLocation);

      if (jobs.length > 0) {
        const progress = calculateBatchProgress(jobs);
        setBatchProgress(progress);
      } else {
        setBatchProgress(null);
      }

      logger.info('BACKGROUND_ANALYSIS_HOOK', 'Jobs refreshed', {
        userId,
        activeJobsCount: jobs.length
      });
    } catch (error) {
      logger.error('BACKGROUND_ANALYSIS_HOOK', 'Failed to refresh jobs', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    refreshJobs();

    const unsubscribe = subscribeToJobUpdates(userId, (jobs) => {
      setActiveJobs(jobs);

      const jobsByLocation: { [locationId: string]: DetectionJob[] } = {};
      jobs.forEach((job) => {
        if (!jobsByLocation[job.location_id]) {
          jobsByLocation[job.location_id] = [];
        }
        jobsByLocation[job.location_id].push(job);
      });
      setLocationJobs(jobsByLocation);

      if (jobs.length > 0) {
        const progress = calculateBatchProgress(jobs);
        setBatchProgress(progress);
      } else {
        setBatchProgress(null);
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId, refreshJobs]);

  const startBatchAnalysis = useCallback(
    async (
      locationId: string,
      photos: PhotoJobInfo[],
      locationType: 'home' | 'gym' | 'outdoor'
    ) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        logger.info('BACKGROUND_ANALYSIS_HOOK', 'Starting batch analysis', {
          userId,
          locationId,
          photosCount: photos.length
        });

        const jobs = await createBatchDetectionJobs(userId, locationId, photos);

        setActiveJobs((prev) => [...prev, ...jobs]);

        const jobsByLocation = { ...locationJobs };
        if (!jobsByLocation[locationId]) {
          jobsByLocation[locationId] = [];
        }
        jobsByLocation[locationId].push(...jobs);
        setLocationJobs(jobsByLocation);

        const allJobs = [...activeJobs, ...jobs];
        const progress = calculateBatchProgress(allJobs);
        setBatchProgress(progress);

        logger.info('BACKGROUND_ANALYSIS_HOOK', 'Batch analysis started', {
          userId,
          locationId,
          jobsCreated: jobs.length
        });
      } catch (error) {
        logger.error('BACKGROUND_ANALYSIS_HOOK', 'Failed to start batch analysis', {
          userId,
          locationId,
          photosCount: photos.length,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    },
    [userId, activeJobs, locationJobs]
  );

  const getLocationProgress = useCallback(
    (locationId: string): BatchJobProgress | null => {
      const jobs = locationJobs[locationId];
      if (!jobs || jobs.length === 0) {
        return null;
      }
      return calculateBatchProgress(jobs);
    },
    [locationJobs]
  );

  return {
    activeJobs,
    locationJobs,
    batchProgress,
    isAnalyzing,
    hasActiveJobs,
    startBatchAnalysis,
    getLocationProgress,
    refreshJobs
  };
}
