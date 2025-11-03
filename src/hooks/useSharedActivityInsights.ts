/**
 * useSharedActivityInsights
 * Shared cache for activity insights across Insights and Progression tabs
 *
 * Benefits:
 * - Single API call for both tabs
 * - Consistent data between views
 * - Optimized performance
 * - Reduced token costs
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../system/supabase/client';
import { useUserStore } from '../system/store/userStore';
import logger from '../lib/utils/logger';

export type ActivityPeriod = 'last7Days' | 'last30Days' | 'last3Months' | 'last6Months' | 'last1Year';

interface UseSharedActivityInsightsOptions {
  period: ActivityPeriod;
  enabled?: boolean;
}

interface ActivityInsight {
  type: string;
  title: string;
  content: string;
  priority: string;
  confidence: number;
  icon: string;
  color: string;
  actionable: boolean;
  action?: string;
}

interface ActivityInsightsData {
  insights: ActivityInsight[];
  distribution: {
    activity_types: any[];
    intensity_levels: any[];
    time_patterns: any[];
  };
  daily_trends: any[];
  heatmap_data: {
    weeks: any[];
    stats: {
      excellentDays: number;
      activityRate: number;
      excellenceRate: number;
      avgCaloriesPerDay: number;
      avgDurationPerDay: number;
    };
  };
  summary: {
    total_activities: number;
    total_calories: number;
    total_duration: number;
    avg_daily_calories: number;
    most_frequent_type: string;
    avg_intensity: string;
    consistency_score: number;
  };
  activities: any[];
  current_activities: number;
  cached?: boolean;
  cache_age_hours?: number;
  generated_at?: string;
  processingTime?: number;
  costUsd?: number;
  confidence?: number;
  fallback?: boolean;
  insufficient_data?: boolean;
}

interface BiometricInsightsData {
  biometric_insights: any[];
  zone_distribution: any;
  performance_trends: any;
  recovery_recommendations: any;
  summary: any;
  enriched_activities: any[];
  processingTime?: number;
  costUsd?: number;
  confidence?: number;
  insufficient_data?: boolean;
}

/**
 * Shared hook for activity insights (used by both Insights and Progression tabs)
 */
export function useSharedActivityInsights({ period, enabled = true }: UseSharedActivityInsightsOptions) {
  const { profile, session } = useUserStore();

  return useQuery({
    queryKey: ['activity-insights-shared', session?.user?.id, period],
    queryFn: async (): Promise<ActivityInsightsData> => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      logger.info('SHARED_ACTIVITY_INSIGHTS', 'Fetching activity insights', {
        userId: session.user.id,
        period,
        source: 'shared_cache',
        timestamp: new Date().toISOString(),
      });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/activity-progress-generator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            userId: session.user.id,
            period,
            userProfile: {
              weight_kg: profile?.weight_kg,
              height_cm: profile?.height_cm,
              sex: profile?.sex,
              birthdate: profile?.birthdate,
              activity_level: profile?.activity_level,
              objective: profile?.objective,
            },
            clientTraceId: `shared_insights_${period}_${Date.now()}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        logger.error('SHARED_ACTIVITY_INSIGHTS', 'Failed to fetch insights', {
          userId: session.user.id,
          period,
          status: response.status,
          error: errorData,
          timestamp: new Date().toISOString(),
        });

        throw new Error(errorData.message || errorData.error || 'Failed to fetch activity insights');
      }

      const data = await response.json();

      logger.info('SHARED_ACTIVITY_INSIGHTS', 'Insights fetched successfully', {
        userId: session.user.id,
        period,
        insightsCount: data.insights?.length || 0,
        cached: data.cached || false,
        cacheAgeHours: data.cache_age_hours,
        currentActivities: data.current_activities,
        timestamp: new Date().toISOString(),
      });

      return data;
    },
    enabled: enabled && !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes (data is already cached server-side)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}

/**
 * Hook for biometric insights (enriched activities only)
 */
export function useBiometricInsights({ period, enabled = true }: UseSharedActivityInsightsOptions) {
  const { profile, session } = useUserStore();

  return useQuery({
    queryKey: ['biometric-insights', session?.user?.id, period],
    queryFn: async (): Promise<BiometricInsightsData> => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      logger.info('BIOMETRIC_INSIGHTS', 'Fetching biometric insights', {
        userId: session.user.id,
        period,
        timestamp: new Date().toISOString(),
      });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/biometric-insights-analyzer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            userId: session.user.id,
            period,
            userProfile: {
              weight_kg: profile?.weight_kg,
              sex: profile?.sex,
              birthdate: profile?.birthdate,
              activity_level: profile?.activity_level,
              objective: profile?.objective,
            },
            clientTraceId: `biometric_insights_${period}_${Date.now()}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        // If insufficient data, return gracefully
        if (errorData.insufficient_data) {
          logger.info('BIOMETRIC_INSIGHTS', 'Insufficient enriched data', {
            userId: session.user.id,
            period,
            required: errorData.required_enriched,
            current: errorData.current_enriched,
            timestamp: new Date().toISOString(),
          });

          return {
            biometric_insights: [],
            zone_distribution: {},
            performance_trends: {},
            recovery_recommendations: {},
            summary: {},
            enriched_activities: [],
            insufficient_data: true,
          };
        }

        logger.error('BIOMETRIC_INSIGHTS', 'Failed to fetch biometric insights', {
          userId: session.user.id,
          period,
          status: response.status,
          error: errorData,
          timestamp: new Date().toISOString(),
        });

        throw new Error(errorData.message || errorData.error || 'Failed to fetch biometric insights');
      }

      const data = await response.json();

      logger.info('BIOMETRIC_INSIGHTS', 'Biometric insights fetched successfully', {
        userId: session.user.id,
        period,
        insightsCount: data.biometric_insights?.length || 0,
        enrichedActivitiesCount: data.enriched_activities?.length || 0,
        timestamp: new Date().toISOString(),
      });

      return data;
    },
    enabled: enabled && !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
}
