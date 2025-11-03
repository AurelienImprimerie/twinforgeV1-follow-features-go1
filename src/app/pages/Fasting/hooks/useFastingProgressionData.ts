/**
 * Fasting Progression Data Hook
 * React Query hook for aggregated fasting progression data and trends
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/system/supabase/client';
import { useUserStore } from '@/system/store/userStore';
import { startOfDay, subDays, format, eachDayOfInterval, parseISO, isValid } from 'date-fns';
import logger from '@/lib/utils/logger';

export interface FastingProgressionMetrics {
  totalSessions: number;
  totalFastedHours: number;
  averageDuration: number;
  longestFast: number;
  bestStreak: number;
  currentStreak: number;
  successRate: number;
  consistencyScore: number;
}

export interface FastingProgressionAnalysis {
  narrativeSummary: string;
  trendAnalysis: string;
  performanceInsights: string[];
  strategicRecommendations: string[];
  motivationalMessage: string;
  nextMilestone: string;
}

export interface FastingConsistencyData {
  date: string;
  hasFasted: boolean;
  totalHours: number;
  sessionsCount: number;
  averageDuration: number;
  outcome: 'success' | 'partial' | 'missed' | 'none';
}

export interface FastingDurationTrend {
  date: string;
  averageDuration: number;
  sessionsCount: number;
  totalHours: number;
}

export interface FastingProgressionData {
  metrics: FastingProgressionMetrics;
  aiAnalysis?: FastingProgressionAnalysis;
  consistencyData: FastingConsistencyData[];
  durationTrends: FastingDurationTrend[];
  heatmapData: FastingConsistencyData[];
  dataQuality: 'excellent' | 'good' | 'limited' | 'insufficient';
  analysisDate: string;
  periodDays: number;
  aiModel?: string;
  tokensUsed?: number;
  cached?: boolean;
}

/**
 * Calculate progression metrics from sessions
 */
function calculateProgressionMetrics(sessions: any[]): FastingProgressionMetrics {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalFastedHours: 0,
      averageDuration: 0,
      longestFast: 0,
      bestStreak: 0,
      currentStreak: 0,
      successRate: 0,
      consistencyScore: 0
    };
  }

  const completedSessions = sessions.filter(s => s.status === 'completed' && s.actual_duration_hours);
  const totalFastedHours = completedSessions.reduce((sum, s) => sum + (s.actual_duration_hours || 0), 0);
  const averageDuration = completedSessions.length > 0 ? totalFastedHours / completedSessions.length : 0;
  const longestFast = Math.max(0, ...completedSessions.map(s => s.actual_duration_hours || 0));

  // Calculate success rate (sessions that met 90%+ of target)
  const successfulSessions = completedSessions.filter(s => 
    s.actual_duration_hours && s.target_hours && 
    (s.actual_duration_hours / s.target_hours) >= 0.9
  );
  const successRate = completedSessions.length > 0 ? 
    (successfulSessions.length / completedSessions.length) * 100 : 0;

  // Calculate streaks (simplified - consecutive days with sessions)
  const sessionDates = completedSessions
    .map(s => {
      try {
        const parsedDate = parseISO(s.start_time);
        if (!isValid(parsedDate)) {
          logger.warn('FASTING_PROGRESSION_METRICS', 'Invalid date in session', {
            sessionId: s.id,
            startTime: s.start_time,
            timestamp: new Date().toISOString()
          });
          return null;
        }
        return format(parsedDate, 'yyyy-MM-dd');
      } catch (error) {
        logger.error('FASTING_PROGRESSION_METRICS', 'Date parsing error', {
          sessionId: s.id,
          startTime: s.start_time,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        return null;
      }
    })
    .filter(date => date !== null) as string[];
    
  const uniqueDates = [...new Set(sessionDates)].sort();
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  // Simple streak calculation
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0 || 
        (() => {
          try {
            const currentDate = parseISO(uniqueDates[i]);
            const previousDate = parseISO(uniqueDates[i-1]);
            if (!isValid(currentDate) || !isValid(previousDate)) return false;
            return currentDate.getTime() - previousDate.getTime() === 24 * 60 * 60 * 1000;
          } catch {
            return false;
          }
        })()) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);
  
  // Current streak (from today backwards)
  const today = format(new Date(), 'yyyy-MM-dd');
  if (uniqueDates.includes(today)) {
    currentStreak = 1;
    // Count backwards from today
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      try {
        const nextDate = parseISO(uniqueDates[i+1]);
        const currentDate = parseISO(uniqueDates[i]);
        if (!isValid(nextDate) || !isValid(currentDate)) break;
        
        const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      } catch {
        break;
      }
    }
  }

  // Consistency score (0-100 based on regularity and success rate)
  const consistencyScore = Math.round((successRate * 0.7) + (Math.min(100, (uniqueDates.length / 30) * 100) * 0.3));

  return {
    totalSessions: sessions.length,
    totalFastedHours: Math.round(totalFastedHours * 10) / 10,
    averageDuration: Math.round(averageDuration * 10) / 10,
    longestFast: Math.round(longestFast * 10) / 10,
    bestStreak,
    currentStreak,
    successRate: Math.round(successRate),
    consistencyScore
  };
}

/**
 * Generate consistency data for heatmap and charts
 */
function generateConsistencyData(sessions: any[], periodDays: number): FastingConsistencyData[] {
  const endDate = new Date();
  const startDate = subDays(endDate, periodDays - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  return dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => {
      try {
        const sessionDate = parseISO(s.start_time);
        if (!isValid(sessionDate)) {
          logger.warn('FASTING_PROGRESSION_CONSISTENCY', 'Invalid session date', {
            sessionId: s.id,
            startTime: s.start_time,
            timestamp: new Date().toISOString()
          });
          return false;
        }
        return format(sessionDate, 'yyyy-MM-dd') === dateStr && s.status === 'completed';
      } catch (error) {
        logger.error('FASTING_PROGRESSION_CONSISTENCY', 'Date filtering error', {
          sessionId: s.id,
          startTime: s.start_time,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        return false;
      }
    });

    const totalHours = daySessions.reduce((sum, s) => sum + (s.actual_duration_hours || 0), 0);
    const averageDuration = daySessions.length > 0 ? totalHours / daySessions.length : 0;

    // Determine outcome based on performance
    let outcome: 'success' | 'partial' | 'missed' | 'none' = 'none';
    if (daySessions.length > 0) {
      const avgTargetCompletion = daySessions.reduce((sum, s) => {
        if (s.actual_duration_hours && s.target_hours) {
          return sum + (s.actual_duration_hours / s.target_hours);
        }
        return sum;
      }, 0) / daySessions.length;

      if (avgTargetCompletion >= 0.9) outcome = 'success';
      else if (avgTargetCompletion >= 0.5) outcome = 'partial';
      else outcome = 'missed';
    }

    return {
      date: dateStr,
      hasFasted: daySessions.length > 0,
      totalHours: Math.round(totalHours * 10) / 10,
      sessionsCount: daySessions.length,
      averageDuration: Math.round(averageDuration * 10) / 10,
      outcome
    };
  });
}

/**
 * Generate duration trends for charts
 */
function generateDurationTrends(sessions: any[], periodDays: number): FastingDurationTrend[] {
  const endDate = new Date();
  const startDate = subDays(endDate, periodDays - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  return dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => {
      try {
        const sessionDate = parseISO(s.start_time);
        if (!isValid(sessionDate)) {
          logger.warn('FASTING_PROGRESSION_TRENDS', 'Invalid session date', {
            sessionId: s.id,
            startTime: s.start_time,
            timestamp: new Date().toISOString()
          });
          return false;
        }
        return format(sessionDate, 'yyyy-MM-dd') === dateStr && s.status === 'completed';
      } catch (error) {
        logger.error('FASTING_PROGRESSION_TRENDS', 'Date filtering error', {
          sessionId: s.id,
          startTime: s.start_time,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        return false;
      }
    });

    const totalHours = daySessions.reduce((sum, s) => sum + (s.actual_duration_hours || 0), 0);
    const averageDuration = daySessions.length > 0 ? totalHours / daySessions.length : 0;

    return {
      date: dateStr,
      averageDuration: Math.round(averageDuration * 10) / 10,
      sessionsCount: daySessions.length,
      totalHours: Math.round(totalHours * 10) / 10
    };
  });
}

/**
 * Check if user has sufficient data for AI progression analysis
 */
function hasMinimumDataForProgressionAI(
  profile: any,
  sessionsCount: number,
  periodDays: number
): { sufficient: boolean; missingData: string[] } {
  const missingData: string[] = [];

  // CRITICAL DEBUG: Log all input parameters
  logger.debug('FASTING_PROGRESSION_AI_DATA_CHECK_DETAILED', 'Checking minimum data requirements with full details', {
    profileExists: !!profile,
    sessionsCount,
    periodDays,
    profileData: profile ? {
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      objective: profile.objective,
      activity_level: profile.activity_level,
      sex: profile.sex,
      hasEmotions: !!profile.emotions,
      hasNutrition: !!profile.nutrition
    } : null,
    timestamp: new Date().toISOString()
  });

  // Check profile completeness (only when bypass is not active)
  if (!profile?.weight_kg) missingData.push('Poids corporel');
  if (!profile?.height_cm) missingData.push('Taille');
  if (!profile?.objective) missingData.push('Objectif fitness');
  if (!profile?.activity_level) missingData.push('Niveau d\'activité');
  
  // Check fasting data sufficiency for AI analysis
  const minSessionsRequired = periodDays === 7 ? 5 : periodDays === 30 ? 12 : 20; // Progression requirements
  if (sessionsCount < minSessionsRequired) {
    missingData.push(`Au moins ${minSessionsRequired} sessions pour l'analyse IA`);
  }
  
  // CRITICAL DEBUG: Log check result
  logger.debug('FASTING_PROGRESSION_AI_DATA_CHECK_RESULT', 'Minimum data check result (NO BYPASS)', {
    sufficient: missingData.length === 0,
    missingDataCount: missingData.length,
    missingData,
    minSessionsRequired,
    actualSessions: sessionsCount,
    willCallEdgeFunction: missingData.length === 0,
    timestamp: new Date().toISOString()
  });

  return {
    sufficient: missingData.length === 0,
    missingData
  };
}

/**
 * Hook to fetch and process fasting progression data
 */
export function useFastingProgressionData(periodDays: number = 30) {
  const { session, profile } = useUserStore();
  const userId = session?.user?.id;

  // DEBUG: Log hook initialization
  React.useEffect(() => {
    logger.debug('FASTING_PROGRESSION_HOOK_INIT', 'Hook initialized', {
      userId,
      periodDays,
      hasProfile: !!profile,
      timestamp: new Date().toISOString()
    });
  }, [userId, periodDays, profile]);

  return useQuery({
    queryKey: ['fasting', 'progression', userId, periodDays],
    queryFn: async () => {
      logger.debug('FASTING_PROGRESSION_QUERY_START', 'Query function started', {
        userId,
        periodDays,
        timestamp: new Date().toISOString()
      });

      if (!userId) {
        logger.error('FASTING_PROGRESSION_QUERY_ERROR', 'User not authenticated', {
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error('User not authenticated');
      }

      const startDate = startOfDay(subDays(new Date(), periodDays)).toISOString();
      const endDate = new Date().toISOString();

      logger.debug('FASTING_PROGRESSION', 'Fetching progression data', {
        userId,
        periodDays,
        startDate,
        endDate,
        timestamp: new Date().toISOString()
      });

      const { data: sessions, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true });

      if (error) {
        logger.error('FASTING_PROGRESSION', 'Failed to fetch progression data', {
          error: error.message,
          userId,
          periodDays,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      const fastingSessions = sessions || [];
      
      // CRITICAL DEBUG: Log sessions data with full details
      logger.debug('FASTING_PROGRESSION_SESSIONS_DATA_DETAILED', 'Sessions fetched for progression with full details', {
        userId,
        periodDays,
        totalSessions: fastingSessions.length,
        completedSessions: fastingSessions.filter(s => s.status === 'completed').length,
        startDate,
        endDate,
        sessionsData: fastingSessions.map(s => ({
          id: s.id,
          start_time: s.start_time,
          status: s.status,
          target_hours: s.target_hours,
          actual_duration_hours: s.actual_duration_hours,
          protocol_id: s.protocol_id
        })),
        timestamp: new Date().toISOString()
      });

      // Calculate local metrics and trends (always computed)
      const metrics = calculateProgressionMetrics(fastingSessions);
      const consistencyData = generateConsistencyData(fastingSessions, periodDays);
      const durationTrends = generateDurationTrends(fastingSessions, periodDays);
      
      // CRITICAL DEBUG: Log calculated metrics
      logger.debug('FASTING_PROGRESSION_METRICS_CALCULATED', 'Metrics calculated from sessions', {
        userId,
        periodDays,
        metrics: {
          totalSessions: metrics.totalSessions,
          totalFastedHours: metrics.totalFastedHours,
          averageDuration: metrics.averageDuration,
          successRate: metrics.successRate,
          consistencyScore: metrics.consistencyScore
        },
        timestamp: new Date().toISOString()
      });

      // Determine data quality for local calculations
      let dataQuality: 'excellent' | 'good' | 'limited' | 'insufficient' = 'insufficient';
      const completedSessions = fastingSessions.filter(s => s.status === 'completed');
      
      if (completedSessions.length >= 20) dataQuality = 'excellent';
      else if (completedSessions.length >= 10) dataQuality = 'good';
      else if (completedSessions.length >= 3) dataQuality = 'limited';

      // Check if we should generate AI analysis
      const aiDataCheck = hasMinimumDataForProgressionAI(profile, completedSessions.length, periodDays);
      
      // CRITICAL DEBUG: Log AI data check with bypass state
      logger.debug('FASTING_PROGRESSION_AI_DATA_CHECK_FINAL', 'AI data check result with bypass state', {
        userId,
        periodDays,
        completedSessions: completedSessions.length,
        aiDataCheckSufficient: aiDataCheck.sufficient,
        missingData: aiDataCheck.missingData,
        willProceedToEdgeFunction: aiDataCheck.sufficient,
        profileData: {
          hasWeightKg: !!profile?.weight_kg,
          hasHeightCm: !!profile?.height_cm,
          hasObjective: !!profile?.objective,
          hasActivityLevel: !!profile?.activity_level
        },
        timestamp: new Date().toISOString()
      });

      let aiAnalysis: FastingProgressionAnalysis | undefined;
      let aiModel: string | undefined;
      let tokensUsed: number | undefined;
      let cached: boolean | undefined;

      if (aiDataCheck.sufficient) {
        try {
          // CRITICAL DEBUG: Log before Edge Function call with full payload
          const edgeFunctionPayload = {
            userId,
            periodDays,
            profile: {
              weight_kg: profile?.weight_kg,
              height_cm: profile?.height_cm,
              objective: profile?.objective,
              activity_level: profile?.activity_level,
              sex: profile?.sex,
              birthdate: profile?.birthdate,
              emotions: profile?.emotions,
              nutrition: profile?.nutrition
            }
          };
          
          logger.debug('FASTING_PROGRESSION_EDGE_CALL_PAYLOAD_DETAILED', 'About to call Edge Function with full payload', {
            userId,
            periodDays,
            profileComplete: {
              hasWeightKg: !!profile?.weight_kg,
              weightKg: profile?.weight_kg,
              hasHeightCm: !!profile?.height_cm,
              heightCm: profile?.height_cm,
              hasObjective: !!profile?.objective,
              objective: profile?.objective,
              hasActivityLevel: !!profile?.activity_level,
              activityLevel: profile?.activity_level,
              hasSex: !!profile?.sex,
              sex: profile?.sex
            },
            payloadSize: JSON.stringify(edgeFunctionPayload).length,
            timestamp: new Date().toISOString()
          });

          logger.debug('FASTING_PROGRESSION_AI', 'Calling AI progression analyzer Edge Function', {
            userId,
            periodDays,
            completedSessions: completedSessions.length,
            profileKeys: profile ? Object.keys(profile) : [],
            edgeFunctionName: 'fasting-progression-analyzer',
            timestamp: new Date().toISOString()
          });

          const { data: aiResponse, error: aiError } = await supabase.functions.invoke('fasting-progression-analyzer', {
            body: edgeFunctionPayload
          });

          // CRITICAL DEBUG: Log Edge Function response
          logger.debug('FASTING_PROGRESSION_EDGE_RESPONSE', 'Edge Function response received', {
            userId,
            periodDays,
            hasResponse: !!aiResponse,
            hasError: !!aiError,
            errorMessage: aiError?.message,
            errorDetails: aiError?.details,
            responseKeys: aiResponse ? Object.keys(aiResponse) : [],
            responseType: typeof aiResponse,
            edgeFunctionCallCompleted: true,
            timestamp: new Date().toISOString()
          });

          if (aiError) {
            logger.error('FASTING_PROGRESSION_AI', 'AI progression analysis failed', {
              error: aiError.message,
              errorDetails: aiError.details,
              errorCode: aiError.code,
              userId,
              periodDays,
              timestamp: new Date().toISOString()
            });
            // Continue without AI analysis - local metrics still available
          } else {
            if (aiResponse && typeof aiResponse === 'object') {
              aiAnalysis = aiResponse.aiAnalysis;
              aiModel = aiResponse.aiModel;
              tokensUsed = aiResponse.tokensUsed;
              cached = aiResponse.cached;
              
              logger.debug('FASTING_PROGRESSION_AI_SUCCESS', 'AI analysis extracted from response', {
                userId,
                periodDays,
                hasAiAnalysis: !!aiAnalysis,
                aiModel,
                tokensUsed,
                cached,
                timestamp: new Date().toISOString()
              });
            } else {
              logger.warn('FASTING_PROGRESSION_AI', 'Invalid AI response format', {
                userId,
                periodDays,
                responseType: typeof aiResponse,
                responseValue: aiResponse,
                timestamp: new Date().toISOString()
              });
            }

            logger.debug('FASTING_PROGRESSION_AI', 'AI progression analysis completed', {
              userId,
              periodDays,
              tokensUsed,
              cached,
              aiModel,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          logger.error('FASTING_PROGRESSION_AI', 'AI progression analysis exception', {
            error: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
            userId,
            periodDays,
            timestamp: new Date().toISOString()
          });
          // Continue without AI analysis
        }
      } else {
        logger.warn('FASTING_PROGRESSION_AI', 'Insufficient data for AI progression analysis - showing local metrics only', {
          userId,
          periodDays,
          completedSessions: completedSessions.length,
          missingData: aiDataCheck.missingData,
          aiDataCheckSufficient: aiDataCheck.sufficient,
          reasonForSkipping: 'aiDataCheck.sufficient === false',
          willShowLocalMetrics: true,
          localMetricsAvailable: metrics.totalSessions > 0,
          timestamp: new Date().toISOString()
        });
      }
      
      // DEBUG: Log calculated metrics
      logger.debug('FASTING_PROGRESSION_METRICS_CALCULATED', 'Metrics calculated', {
        userId,
        periodDays,
        metrics: {
          totalSessions: metrics.totalSessions,
          totalFastedHours: metrics.totalFastedHours,
          averageDuration: metrics.averageDuration,
          successRate: metrics.successRate,
          consistencyScore: metrics.consistencyScore
        },
        timestamp: new Date().toISOString()
      });

      const progressionData: FastingProgressionData = {
        metrics,
        aiAnalysis,
        consistencyData,
        durationTrends,
        heatmapData: consistencyData, // Same data used for heatmap
        dataQuality,
        analysisDate: new Date().toISOString(),
        periodDays,
        aiModel,
        tokensUsed,
        cached
      };

      // CRITICAL LOG: Always return metrics even without AI
      logger.debug('FASTING_PROGRESSION_FINAL', 'Progression data ready - metrics available', {
        userId,
        periodDays,
        hasMetrics: !!metrics,
        metricsSessionsCount: metrics.totalSessions,
        metricsTotalHours: metrics.totalFastedHours,
        metricsAvgDuration: metrics.averageDuration,
        metricsConsistencyScore: metrics.consistencyScore,
        hasAiAnalysis: !!aiAnalysis,
        dataQuality,
        willDisplayLocalMetrics: metrics.totalSessions > 0,
        metricsKeys: Object.keys(metrics),
        consistencyDataLength: consistencyData.length,
        timestamp: new Date().toISOString()
      });

      // CRITICAL DEBUG: Log AI data check with bypass state
      logger.debug('FASTING_PROGRESSION_AI_DATA_CHECK', 'AI data check result', {
        periodDays,
        totalSessions: fastingSessions.length,
        completedSessions: completedSessions.length,
        willProceedToEdgeFunction: aiDataCheck.sufficient,
        dataQuality,
        metrics: {
          totalFastedHours: metrics.totalFastedHours,
          successRate: metrics.successRate,
          currentStreak: metrics.currentStreak
        },
        hasAiAnalysis: !!aiAnalysis,
        aiModel,
        tokensUsed,
        cached,
        timestamp: new Date().toISOString()
      });

      return progressionData;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces deprecated cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    structuralSharing: false,
  });
}