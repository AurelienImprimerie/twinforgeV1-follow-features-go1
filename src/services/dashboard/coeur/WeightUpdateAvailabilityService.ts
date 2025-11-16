/**
 * WeightUpdateAvailabilityService
 *
 * Centralized service for managing weight update availability and validation.
 * Enforces the 7-day restriction rule to prevent XP farming abuse.
 */

import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';
import {
  WEIGHT_UPDATE_CONSTANTS,
  WEIGHT_UPDATE_ERROR_MESSAGES,
  WEIGHT_UPDATE_INFO_MESSAGES,
} from '@/constants/weightUpdate';

export interface WeightUpdateAvailabilityStatus {
  isAvailable: boolean;
  isFirstUpdate: boolean;
  daysUntilAvailable: number;
  daysSinceRegistration: number;
  lastUpdateDate: string | null;
  firstEligibleDate: string | null;
  message: string;
  canProceed: boolean;
}

export interface WeightUpdateValidationResult {
  valid: boolean;
  message: string;
  daysRemaining: number;
  isFirstUpdate: boolean;
}

class WeightUpdateAvailabilityService {
  /**
   * Check if weight update is currently available for the user
   */
  async checkAvailability(userId?: string): Promise<WeightUpdateAvailabilityStatus> {
    try {
      logger.info('WEIGHT_UPDATE_AVAILABILITY', 'Checking weight update availability', {
        userId: userId || 'current_user',
      });

      // Call RPC function to check availability
      const { data, error } = await supabase.rpc('check_weekly_actions_availability');

      if (error) {
        logger.error('WEIGHT_UPDATE_AVAILABILITY', 'Error checking availability', {
          error: error.message,
        });
        throw error;
      }

      if (!data || data.length === 0) {
        logger.warn('WEIGHT_UPDATE_AVAILABILITY', 'No availability data returned');

        // Return default unavailable state
        return {
          isAvailable: false,
          isFirstUpdate: true,
          daysUntilAvailable: WEIGHT_UPDATE_CONSTANTS.MINIMUM_DAYS_AFTER_REGISTRATION,
          daysSinceRegistration: 0,
          lastUpdateDate: null,
          firstEligibleDate: null,
          message: WEIGHT_UPDATE_ERROR_MESSAGES.NOT_ELIGIBLE,
          canProceed: false,
        };
      }

      const availability = data[0];

      // Generate appropriate message
      let message: string;
      if (availability.weight_update_available) {
        message = WEIGHT_UPDATE_INFO_MESSAGES.AVAILABLE_NOW;
      } else if (availability.is_first_weight_update) {
        message = WEIGHT_UPDATE_INFO_MESSAGES.FIRST_UPDATE_COUNTDOWN(
          availability.days_until_weight_update
        );
      } else {
        message = WEIGHT_UPDATE_INFO_MESSAGES.NEXT_UPDATE_COUNTDOWN(
          availability.days_until_weight_update
        );
      }

      const status: WeightUpdateAvailabilityStatus = {
        isAvailable: availability.weight_update_available,
        isFirstUpdate: availability.is_first_weight_update,
        daysUntilAvailable: availability.days_until_weight_update,
        daysSinceRegistration: availability.days_since_registration,
        lastUpdateDate: availability.last_weight_update_date,
        firstEligibleDate: availability.first_weight_update_eligible_at,
        message,
        canProceed: availability.weight_update_available,
      };

      logger.info('WEIGHT_UPDATE_AVAILABILITY', 'Availability check complete', {
        isAvailable: status.isAvailable,
        isFirstUpdate: status.isFirstUpdate,
        daysUntilAvailable: status.daysUntilAvailable,
      });

      return status;
    } catch (error: any) {
      logger.error('WEIGHT_UPDATE_AVAILABILITY', 'Failed to check availability', {
        error: error?.message || 'Unknown error',
      });

      // Return unavailable state on error
      return {
        isAvailable: false,
        isFirstUpdate: true,
        daysUntilAvailable: WEIGHT_UPDATE_CONSTANTS.MINIMUM_DAYS_AFTER_REGISTRATION,
        daysSinceRegistration: 0,
        lastUpdateDate: null,
        firstEligibleDate: null,
        message: WEIGHT_UPDATE_ERROR_MESSAGES.NOT_ELIGIBLE,
        canProceed: false,
      };
    }
  }

  /**
   * Get days until next weight update becomes available
   */
  async getDaysUntilNextUpdate(): Promise<number> {
    const status = await this.checkAvailability();
    return status.daysUntilAvailable;
  }

  /**
   * Get comprehensive weight update status with all information
   */
  async getStatus(): Promise<WeightUpdateAvailabilityStatus> {
    return this.checkAvailability();
  }

  /**
   * Validate if weight update attempt is allowed
   * This should be called before attempting to submit a weight update
   */
  async validateUpdateAttempt(): Promise<WeightUpdateValidationResult> {
    try {
      const status = await this.checkAvailability();

      if (!status.isAvailable) {
        const errorMessage = status.isFirstUpdate
          ? WEIGHT_UPDATE_ERROR_MESSAGES.FIRST_UPDATE_TOO_EARLY(status.daysUntilAvailable)
          : WEIGHT_UPDATE_ERROR_MESSAGES.UPDATE_TOO_FREQUENT(status.daysUntilAvailable);

        logger.warn('WEIGHT_UPDATE_VALIDATION', 'Update attempt blocked', {
          isFirstUpdate: status.isFirstUpdate,
          daysUntilAvailable: status.daysUntilAvailable,
        });

        return {
          valid: false,
          message: errorMessage,
          daysRemaining: status.daysUntilAvailable,
          isFirstUpdate: status.isFirstUpdate,
        };
      }

      logger.info('WEIGHT_UPDATE_VALIDATION', 'Update attempt validated');

      return {
        valid: true,
        message: WEIGHT_UPDATE_INFO_MESSAGES.READY_TO_UPDATE,
        daysRemaining: 0,
        isFirstUpdate: status.isFirstUpdate,
      };
    } catch (error: any) {
      logger.error('WEIGHT_UPDATE_VALIDATION', 'Validation failed', {
        error: error?.message || 'Unknown error',
      });

      return {
        valid: false,
        message: WEIGHT_UPDATE_ERROR_MESSAGES.NOT_ELIGIBLE,
        daysRemaining: WEIGHT_UPDATE_CONSTANTS.MINIMUM_DAYS_BETWEEN_UPDATES,
        isFirstUpdate: false,
      };
    }
  }

  /**
   * Check if user is eligible for first weight update (7 days after registration)
   */
  async isEligibleForFirstUpdate(): Promise<boolean> {
    const status = await this.checkAvailability();
    return status.isFirstUpdate && status.isAvailable;
  }

  /**
   * Get formatted countdown message
   */
  async getCountdownMessage(): Promise<string> {
    const status = await this.checkAvailability();

    if (status.isAvailable) {
      return WEIGHT_UPDATE_INFO_MESSAGES.AVAILABLE_NOW;
    }

    if (status.isFirstUpdate) {
      return WEIGHT_UPDATE_INFO_MESSAGES.FIRST_UPDATE_COUNTDOWN(status.daysUntilAvailable);
    }

    return WEIGHT_UPDATE_INFO_MESSAGES.NEXT_UPDATE_COUNTDOWN(status.daysUntilAvailable);
  }

  /**
   * Get hours until next update (more precise than days)
   */
  async getHoursUntilNextUpdate(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('check_weekly_actions_availability');

      if (error || !data || data.length === 0) {
        return WEIGHT_UPDATE_CONSTANTS.MINIMUM_DAYS_BETWEEN_UPDATES * 24;
      }

      const availability = data[0];

      if (availability.weight_update_available) {
        return 0;
      }

      // Calculate precise hours
      const targetDate = availability.is_first_weight_update
        ? new Date(availability.first_weight_update_eligible_at)
        : new Date(new Date(availability.last_weight_update_date).getTime() + 7 * 24 * 60 * 60 * 1000);

      const now = new Date();
      const hoursRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60)));

      return hoursRemaining;
    } catch (error) {
      logger.error('WEIGHT_UPDATE_AVAILABILITY', 'Failed to calculate hours', { error });
      return WEIGHT_UPDATE_CONSTANTS.MINIMUM_DAYS_BETWEEN_UPDATES * 24;
    }
  }

  /**
   * Format availability status for display
   */
  formatStatus(status: WeightUpdateAvailabilityStatus): string {
    if (status.isAvailable) {
      return 'Disponible maintenant';
    }

    const days = status.daysUntilAvailable;
    const dayText = days > 1 ? 'jours' : 'jour';

    if (status.isFirstUpdate) {
      return `Disponible dans ${days} ${dayText} (première pesée)`;
    }

    return `Disponible dans ${days} ${dayText}`;
  }
}

// Export singleton instance
export const weightUpdateAvailabilityService = new WeightUpdateAvailabilityService();

// Export class for testing
export default WeightUpdateAvailabilityService;
