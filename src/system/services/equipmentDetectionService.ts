/**
 * Equipment Detection Service
 * Service pour gérer la détection automatique d'équipements via GPT-5-mini
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type { LocationType } from '../../domain/trainingLocation';

export interface EquipmentDetection {
  id?: string;
  photo_id: string;
  location_id: string;
  equipment_name: string;
  equipment_category: string;
  position_x: number;
  position_y: number;
  bbox_width?: number;
  bbox_height?: number;
  confidence_score: number;
  marker_number: number;
  detected_by_model?: string;
  analysis_metadata?: any;
  created_at?: string;
}

export interface DetectionAnalysis {
  id: string;
  photo_id: string;
  location_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  equipment_count: number;
  processing_time_ms?: number;
  model_used?: string;
  started_at: string;
  completed_at?: string;
}

export interface DetectionResult {
  success: boolean;
  detections: EquipmentDetection[];
  equipment_count: number;
  processing_time_ms: number;
  error?: string;
}

/**
 * Analyse une photo pour détecter les équipements avec GPT-5-mini
 * Wrapper avec retry automatique
 */
export async function detectEquipmentInPhoto(
  photoUrl: string,
  photoId: string,
  locationId: string,
  locationType: LocationType
): Promise<DetectionResult> {
  const MAX_RETRIES = 2; // 3 tentatives au total (1 + 2 retries)
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      logger.info('EQUIPMENT_DETECTION', `Detection attempt ${attempt}/${MAX_RETRIES + 1}`, {
        photoId,
        locationId,
        isRetry: attempt > 1
      });

      const result = await detectEquipmentInPhotoSingleAttempt(
        photoUrl,
        photoId,
        locationId,
        locationType,
        attempt
      );

      if (attempt > 1) {
        logger.info('EQUIPMENT_DETECTION', 'Retry succeeded', {
          photoId,
          attemptNumber: attempt,
          equipmentCount: result.equipment_count
        });
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // Ne pas retry si c'est un timeout (l'utilisateur a déjà attendu 3 minutes)
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('EQUIPMENT_DETECTION', 'Timeout - no retry', {
          photoId,
          attemptNumber: attempt
        });
        throw error;
      }

      // Ne pas retry si c'est la dernière tentative
      if (attempt >= MAX_RETRIES + 1) {
        logger.error('EQUIPMENT_DETECTION', 'All retries exhausted', {
          photoId,
          totalAttempts: attempt,
          finalError: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }

      // Backoff exponentiel: 2s, 4s, 8s...
      const backoffMs = Math.pow(2, attempt) * 1000;
      logger.warn('EQUIPMENT_DETECTION', `Attempt ${attempt} failed, retrying in ${backoffMs}ms`, {
        photoId,
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAttempt: attempt + 1,
        backoffMs
      });

      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // Ce code ne devrait jamais être atteint, mais TypeScript l'exige
  throw lastError || new Error('Detection failed for unknown reason');
}

/**
 * Tentative unique de détection d'équipements (sans retry)
 */
async function detectEquipmentInPhotoSingleAttempt(
  photoUrl: string,
  photoId: string,
  locationId: string,
  locationType: LocationType,
  attemptNumber: number
): Promise<DetectionResult> {
  const startTime = Date.now();
  const REQUEST_TIMEOUT_MS = 300000; // 5 minutes timeout

  try {
    logger.info('EQUIPMENT_DETECTION', 'Starting equipment detection', {
      photoId,
      locationId,
      locationType,
      photoUrl: photoUrl.substring(0, 100) + '...',
      timeoutMs: REQUEST_TIMEOUT_MS,
      attemptNumber
    });

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-equipment`;

    logger.info('EQUIPMENT_DETECTION', 'API URL constructed', {
      apiUrl,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL
    });

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      logger.warn('EQUIPMENT_DETECTION', 'Request timeout - aborting', {
        photoId,
        elapsedMs: Date.now() - startTime,
        timeoutMs: REQUEST_TIMEOUT_MS
      });
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    logger.info('EQUIPMENT_DETECTION', 'Sending POST request to edge function', {
      photoId,
      method: 'POST',
      hasAuth: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photoUrl,
        photoId,
        locationId,
        locationType
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const fetchDuration = Date.now() - startTime;
    logger.info('EQUIPMENT_DETECTION', 'Response received', {
      photoId,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      fetchDurationMs: fetchDuration,
      contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('EQUIPMENT_DETECTION', 'Non-OK response from API', {
        photoId,
        status: response.status,
        errorText: errorText.substring(0, 500)
      });

      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      throw new Error(errorData.error || `Detection failed: ${response.status} - ${response.statusText}`);
    }

    const resultText = await response.text();
    logger.info('EQUIPMENT_DETECTION', 'Response body received', {
      photoId,
      bodyLength: resultText.length,
      bodyPreview: resultText.substring(0, 200)
    });

    let result: DetectionResult;
    try {
      result = JSON.parse(resultText);
    } catch (parseError) {
      logger.error('EQUIPMENT_DETECTION', 'Failed to parse JSON response', {
        photoId,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        bodyPreview: resultText.substring(0, 500)
      });
      throw new Error('Invalid JSON response from detection service');
    }

    const totalDuration = Date.now() - startTime;
    logger.info('EQUIPMENT_DETECTION', 'Detection completed successfully', {
      photoId,
      equipment_count: result.equipment_count,
      processing_time_ms: result.processing_time_ms,
      total_client_time_ms: totalDuration,
      success: result.success
    });

    return result;
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('EQUIPMENT_DETECTION', 'Request aborted due to timeout', {
        photoId,
        locationId,
        timeoutMs: REQUEST_TIMEOUT_MS,
        elapsedMs: totalDuration
      });
      throw new Error(`La détection a dépassé le délai maximum de ${REQUEST_TIMEOUT_MS / 60000} minutes. Veuillez réessayer.`);
    }

    logger.error('EQUIPMENT_DETECTION', 'Detection failed', {
      photoId,
      locationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorStack: error instanceof Error ? error.stack : undefined,
      elapsedMs: totalDuration
    });
    throw error;
  }
}

/**
 * Récupère toutes les détections pour une photo
 */
export async function getPhotoDetections(photoId: string): Promise<EquipmentDetection[]> {
  try {
    logger.info('EQUIPMENT_DETECTION', 'Fetching photo detections', { photoId });

    const { data, error } = await supabase
      .from('training_location_equipment_detections')
      .select('*')
      .eq('photo_id', photoId)
      .order('marker_number', { ascending: true });

    if (error) {
      throw error;
    }

    logger.info('EQUIPMENT_DETECTION', 'Photo detections fetched', {
      photoId,
      count: data?.length || 0
    });

    return data || [];
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to fetch photo detections', {
      photoId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Récupère toutes les détections pour un lieu
 */
export async function getLocationDetections(locationId: string): Promise<EquipmentDetection[]> {
  try {
    logger.info('EQUIPMENT_DETECTION', 'Fetching location detections', { locationId });

    const { data, error } = await supabase
      .from('training_location_equipment_detections')
      .select('*')
      .eq('location_id', locationId)
      .order('photo_id', { ascending: true })
      .order('marker_number', { ascending: true });

    if (error) {
      throw error;
    }

    logger.info('EQUIPMENT_DETECTION', 'Location detections fetched', {
      locationId,
      count: data?.length || 0
    });

    return data || [];
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to fetch location detections', {
      locationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Récupère l'analyse d'une photo
 */
export async function getPhotoAnalysis(photoId: string): Promise<DetectionAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('training_location_photo_analyses')
      .select('*')
      .eq('photo_id', photoId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to fetch photo analysis', {
      photoId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Vérifie si une photo a déjà été analysée
 */
export async function isPhotoAnalyzed(photoId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('training_location_photo_analyses')
      .select('id')
      .eq('photo_id', photoId)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !!data;
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to check photo analysis status', {
      photoId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

/**
 * Supprime toutes les détections d'une photo pour permettre une nouvelle analyse
 */
export async function clearPhotoDetections(photoId: string): Promise<void> {
  try {
    logger.info('EQUIPMENT_DETECTION', 'Clearing photo detections', { photoId });

    const { error: detectionsError } = await supabase
      .from('training_location_equipment_detections')
      .delete()
      .eq('photo_id', photoId);

    if (detectionsError) {
      throw detectionsError;
    }

    const { error: analysisError } = await supabase
      .from('training_location_photo_analyses')
      .delete()
      .eq('photo_id', photoId);

    if (analysisError) {
      throw analysisError;
    }

    logger.info('EQUIPMENT_DETECTION', 'Photo detections cleared', { photoId });
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to clear photo detections', {
      photoId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Met à jour une détection spécifique (pour corrections manuelles)
 */
export async function updateDetection(
  detectionId: string,
  updates: Partial<EquipmentDetection>
): Promise<EquipmentDetection> {
  try {
    logger.info('EQUIPMENT_DETECTION', 'Updating detection', { detectionId });

    const { data, error } = await supabase
      .from('training_location_equipment_detections')
      .update(updates)
      .eq('id', detectionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('EQUIPMENT_DETECTION', 'Detection updated', { detectionId });

    return data;
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to update detection', {
      detectionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Supprime une détection spécifique
 */
export async function deleteDetection(detectionId: string): Promise<void> {
  try {
    logger.info('EQUIPMENT_DETECTION', 'Deleting detection', { detectionId });

    const { error } = await supabase
      .from('training_location_equipment_detections')
      .delete()
      .eq('id', detectionId);

    if (error) {
      throw error;
    }

    logger.info('EQUIPMENT_DETECTION', 'Detection deleted', { detectionId });
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to delete detection', {
      detectionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Récupère les statistiques de détection pour un lieu
 */
export async function getLocationDetectionStats(
  locationId: string
): Promise<{
  total_photos: number;
  analyzed_photos: number;
  total_equipment: number;
  unique_equipment: number;
  avg_confidence: number;
}> {
  try {
    const { data: photos, error: photosError } = await supabase
      .from('training_location_photos')
      .select('id')
      .eq('location_id', locationId);

    if (photosError) {
      throw photosError;
    }

    const totalPhotos = photos?.length || 0;

    const { data: analyses, error: analysesError } = await supabase
      .from('training_location_photo_analyses')
      .select('photo_id')
      .eq('location_id', locationId)
      .eq('status', 'completed');

    if (analysesError) {
      throw analysesError;
    }

    const analyzedPhotos = analyses?.length || 0;

    const { data: detections, error: detectionsError } = await supabase
      .from('training_location_equipment_detections')
      .select('equipment_name, confidence_score')
      .eq('location_id', locationId);

    if (detectionsError) {
      throw detectionsError;
    }

    const totalEquipment = detections?.length || 0;
    const uniqueEquipment = new Set(detections?.map((d) => d.equipment_name) || []).size;
    const avgConfidence =
      totalEquipment > 0
        ? detections!.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / totalEquipment
        : 0;

    return {
      total_photos: totalPhotos,
      analyzed_photos: analyzedPhotos,
      total_equipment: totalEquipment,
      unique_equipment: uniqueEquipment,
      avg_confidence: Math.round(avgConfidence * 100) / 100
    };
  } catch (error) {
    logger.error('EQUIPMENT_DETECTION', 'Failed to get location detection stats', {
      locationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
