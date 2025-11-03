/**
 * Background Analysis Service
 * Service pour gérer l'analyse en arrière-plan avec persistence
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import { detectEquipmentInPhoto } from './equipmentDetectionService';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DetectionJob {
  id: string;
  user_id: string;
  location_id: string;
  photo_id: string;
  status: JobStatus;
  progress_percentage: number;
  equipment_detected_count: number;
  retry_count: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PhotoJobInfo {
  photoId: string;
  photoUrl: string;
  photoOrder: number;
}

export interface BatchJobProgress {
  totalPhotos: number;
  completedPhotos: number;
  failedPhotos: number;
  pendingPhotos: number;
  processingPhotos: number;
  totalEquipmentDetected: number;
}

/**
 * Crée un job d'analyse pour une photo
 */
export async function createDetectionJob(
  userId: string,
  locationId: string,
  photoId: string
): Promise<DetectionJob> {
  try {
    logger.info('BACKGROUND_ANALYSIS', 'Creating detection job', { userId, locationId, photoId });

    const { data: job, error } = await supabase
      .from('equipment_detection_jobs')
      .insert({
        user_id: userId,
        location_id: locationId,
        photo_id: photoId,
        status: 'pending',
        progress_percentage: 0,
        equipment_detected_count: 0,
        retry_count: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('BACKGROUND_ANALYSIS', 'Detection job created', { jobId: job.id });
    return job;
  } catch (error) {
    logger.error('BACKGROUND_ANALYSIS', 'Failed to create detection job', {
      userId,
      locationId,
      photoId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Crée des jobs pour plusieurs photos (batch)
 */
export async function createBatchDetectionJobs(
  userId: string,
  locationId: string,
  photos: PhotoJobInfo[]
): Promise<DetectionJob[]> {
  try {
    logger.info('BACKGROUND_ANALYSIS', 'Creating batch detection jobs', {
      userId,
      locationId,
      photosCount: photos.length
    });

    const jobInserts = photos.map((photo) => ({
      user_id: userId,
      location_id: locationId,
      photo_id: photo.photoId,
      status: 'pending' as JobStatus,
      progress_percentage: 0,
      equipment_detected_count: 0,
      retry_count: 0
    }));

    const { data: jobs, error } = await supabase
      .from('equipment_detection_jobs')
      .insert(jobInserts)
      .select();

    if (error) {
      throw error;
    }

    logger.info('BACKGROUND_ANALYSIS', 'Batch detection jobs created', {
      jobsCount: jobs?.length || 0
    });

    return jobs || [];
  } catch (error) {
    logger.error('BACKGROUND_ANALYSIS', 'Failed to create batch detection jobs', {
      userId,
      locationId,
      photosCount: photos.length,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Récupère tous les jobs actifs d'un utilisateur
 */
export async function getActiveJobs(userId: string): Promise<DetectionJob[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('equipment_detection_jobs')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return jobs || [];
  } catch (error) {
    logger.error('BACKGROUND_ANALYSIS', 'Failed to get active jobs', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Récupère les jobs pour une location spécifique
 */
export async function getLocationJobs(
  userId: string,
  locationId: string
): Promise<DetectionJob[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('equipment_detection_jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('location_id', locationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return jobs || [];
  } catch (error) {
    logger.error('BACKGROUND_ANALYSIS', 'Failed to get location jobs', {
      userId,
      locationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Calcule la progression d'un batch de jobs
 */
export function calculateBatchProgress(jobs: DetectionJob[]): BatchJobProgress {
  const progress: BatchJobProgress = {
    totalPhotos: jobs.length,
    completedPhotos: 0,
    failedPhotos: 0,
    pendingPhotos: 0,
    processingPhotos: 0,
    totalEquipmentDetected: 0
  };

  jobs.forEach((job) => {
    switch (job.status) {
      case 'completed':
        progress.completedPhotos++;
        progress.totalEquipmentDetected += job.equipment_detected_count || 0;
        break;
      case 'failed':
        progress.failedPhotos++;
        break;
      case 'pending':
        progress.pendingPhotos++;
        break;
      case 'processing':
        progress.processingPhotos++;
        break;
    }
  });

  return progress;
}

/**
 * Met à jour le statut d'un job
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  updates: {
    progress_percentage?: number;
    equipment_detected_count?: number;
    error_message?: string;
  } = {}
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      status,
      ...updates
    };

    if (status === 'processing' && !updates.progress_percentage) {
      updateData.started_at = new Date().toISOString();
    }

    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('equipment_detection_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (error) {
      throw error;
    }

    logger.info('BACKGROUND_ANALYSIS', 'Job status updated', { jobId, status });
  } catch (error) {
    logger.error('BACKGROUND_ANALYSIS', 'Failed to update job status', {
      jobId,
      status,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Lance l'exécution d'un job spécifique
 */
export async function executeDetectionJob(
  job: DetectionJob,
  photoUrl: string,
  locationType: 'home' | 'gym' | 'outdoor'
): Promise<void> {
  try {
    logger.info('BACKGROUND_ANALYSIS', 'Executing detection job', { jobId: job.id });

    await updateJobStatus(job.id, 'processing', { progress_percentage: 10 });

    const result = await detectEquipmentInPhoto(
      photoUrl,
      job.photo_id,
      job.location_id,
      locationType
    );

    if (result.success && result.detections.length > 0) {
      await updateJobStatus(job.id, 'completed', {
        progress_percentage: 100,
        equipment_detected_count: result.equipment_count
      });
      logger.info('BACKGROUND_ANALYSIS', 'Job completed successfully', {
        jobId: job.id,
        equipmentCount: result.equipment_count
      });
    } else {
      await updateJobStatus(job.id, 'completed', {
        progress_percentage: 100,
        equipment_detected_count: 0
      });
      logger.info('BACKGROUND_ANALYSIS', 'Job completed with no detections', { jobId: job.id });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (job.retry_count < 3) {
      await supabase
        .from('equipment_detection_jobs')
        .update({
          status: 'pending',
          retry_count: job.retry_count + 1,
          error_message: errorMessage
        })
        .eq('id', job.id);

      logger.warn('BACKGROUND_ANALYSIS', 'Job failed, will retry', {
        jobId: job.id,
        retryCount: job.retry_count + 1,
        error: errorMessage
      });
    } else {
      await updateJobStatus(job.id, 'failed', {
        progress_percentage: 0,
        error_message: errorMessage
      });

      logger.error('BACKGROUND_ANALYSIS', 'Job failed after max retries', {
        jobId: job.id,
        error: errorMessage
      });
    }

    throw error;
  }
}

/**
 * Subscribe aux changements de jobs pour un utilisateur
 */
export function subscribeToJobUpdates(
  userId: string,
  onUpdate: (jobs: DetectionJob[]) => void
): () => void {
  logger.info('BACKGROUND_ANALYSIS', 'Subscribing to job updates', { userId });

  const subscription = supabase
    .channel(`detection_jobs_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'equipment_detection_jobs',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const jobs = await getActiveJobs(userId);
        onUpdate(jobs);
      }
    )
    .subscribe();

  return () => {
    logger.info('BACKGROUND_ANALYSIS', 'Unsubscribing from job updates', { userId });
    subscription.unsubscribe();
  };
}

/**
 * Nettoie les vieux jobs complétés (plus de 7 jours)
 */
export async function cleanupOldJobs(userId: string): Promise<void> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error } = await supabase
      .from('equipment_detection_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'completed')
      .lt('completed_at', sevenDaysAgo.toISOString());

    if (error) {
      throw error;
    }

    logger.info('BACKGROUND_ANALYSIS', 'Old jobs cleaned up', { userId });
  } catch (error) {
    logger.error('BACKGROUND_ANALYSIS', 'Failed to cleanup old jobs', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
