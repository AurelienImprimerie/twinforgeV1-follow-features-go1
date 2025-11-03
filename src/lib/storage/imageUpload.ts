import { supabase } from '../../system/supabase/client';
import logger from '../utils/logger';
import { getSignedUrl, PRIVATE_BUCKETS } from './signedUrlService';

export interface UploadResult {
  success: boolean;
  signedUrl?: string;
  uploadPath?: string;
  error?: string;
}

/**
 * Upload a meal photo to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The user ID for organizing files
 * @returns Upload result with success status and public URL
 */
export async function uploadMealPhoto(file: File, userId: string): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${timestamp}-${randomString}.${fileExt}`;

    logger.debug('MEAL_PHOTO_UPLOAD', 'Uploading meal photo', {
      fileName,
      fileSize: file.size,
      fileType: file.type
    });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('meal-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      logger.error('MEAL_PHOTO_UPLOAD', 'Failed to upload meal photo', {
        error: error.message,
        fileName
      });
      return {
        success: false,
        error: error.message
      };
    }

    // Get signed URL for private storage (1 hour expiry)
    const signedUrl = await getSignedUrl(PRIVATE_BUCKETS.MEAL_PHOTOS, fileName);

    if (!signedUrl) {
      logger.error('MEAL_PHOTO_UPLOAD', 'Failed to get signed URL for meal photo', {
        fileName
      });
      return {
        success: false,
        error: 'Failed to generate signed URL'
      };
    }

    logger.info('MEAL_PHOTO_UPLOAD', 'Meal photo uploaded successfully with signed URL', {
      fileName,
      hasSignedUrl: true
    });

    return {
      success: true,
      signedUrl,
      uploadPath: fileName
    };
  } catch (error) {
    logger.error('MEAL_PHOTO_UPLOAD', 'Error uploading meal photo', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convert image file to base64 for AI processing
 * @param file - The image file
 * @returns Base64 encoded string
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/xxx;base64, prefix
    };

    reader.onerror = (error) => {
      logger.error('IMAGE_TO_BASE64', 'Failed to convert image to base64', { error });
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload (if needed)
 * @param file - The image file
 * @param maxWidth - Maximum width (default 1920)
 * @param maxHeight - Maximum height (default 1920)
 * @param quality - Compression quality 0-1 (default 0.8)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Delete a meal photo from Supabase Storage
 * @param photoUrl - The public URL of the photo to delete
 */
export async function deleteMealPhoto(photoUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('meal-photos') + 1).join('/');

    logger.debug('MEAL_PHOTO_DELETE', 'Deleting meal photo', { filePath });

    const { error } = await supabase.storage
      .from('meal-photos')
      .remove([filePath]);

    if (error) {
      logger.error('MEAL_PHOTO_DELETE', 'Failed to delete meal photo', {
        error: error.message,
        filePath
      });
      throw error;
    }

    logger.info('MEAL_PHOTO_DELETE', 'Meal photo deleted successfully', { filePath });
  } catch (error) {
    logger.error('MEAL_PHOTO_DELETE', 'Error deleting meal photo', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
