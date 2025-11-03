/**
 * Fasting Insights Generator Hook
 * React Query hook for AI-generated fasting insights and recommendations
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/system/store/userStore';
import { supabase } from '@/system/supabase/client';
import { startOfDay, subDays } from 'date-fns';
import logger from '@/lib/utils/logger';

export interface FastingInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  priority: 'low' | 'medium' | 'high';
  title: string;
  content: string;
  actionable?: string;
  icon: string;
  color: string;
}

export interface FastingInsightsSummary {
  overallScore: number;
  keyFindings: string[];
  mainRecommendation: string;
  sentiment: 'positive' | 'neutral' | 'encouraging';
}

export interface FastingInsightsData {
  summary: FastingInsightsSummary;
  insights: FastingInsight[];
  dataQuality: 'excellent' | 'good' | 'limited' | 'insufficient';
  analysisDate: string;
  periodDays: number;
  aiModel: string;
  tokensUsed: number;
  cached: boolean;
  missingData?: string[];
}

/**
 * Check if user has sufficient data for insights generation
 */
function hasMinimumDataForInsights(
  profile: any,
  sessionsCount: number,
  periodDays: number
): { sufficient: boolean; missingData: string[] } {
  const missingData: string[] = [];
  
  // CRITICAL DEBUG: Log input parameters with detailed breakdown
  logger.debug('FASTING_INSIGHTS_MIN_DATA_CHECK', 'Checking minimum data requirements', {
    profileExists: !!profile,
    sessionsCount,
    periodDays,
    profileData: profile ? {
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      objective: profile.objective,
      activity_level: profile.activity_level
    } : null,
    minSessionsRequired: periodDays === 7 ? 3 : periodDays === 30 ? 8 : 20,
    timestamp: new Date().toISOString()
  });

  // Check profile completeness
  if (!profile?.weight_kg) missingData.push('Poids corporel');
  if (!profile?.height_cm) missingData.push('Taille');
  if (!profile?.objective) missingData.push('Objectif fitness');
  if (!profile?.activity_level) missingData.push('Niveau d\'activité');
  
  // Check fasting data sufficiency
  const minSessionsRequired = periodDays === 7 ? 3 : periodDays === 30 ? 8 : 20;
  if (sessionsCount < minSessionsRequired) {
    missingData.push(`Au moins ${minSessionsRequired} sessions de jeûne complétées`);
  }
  
  // CRITICAL DEBUG: Log check result
  logger.debug('FASTING_INSIGHTS_MIN_DATA_RESULT', 'Minimum data check result', {
    sufficient: missingData.length === 0,
    missingDataCount: missingData.length,
    missingData,
    minSessionsRequired,
    actualSessions: sessionsCount,
    willProceedToEdgeFunction: missingData.length === 0,
    timestamp: new Date().toISOString()
  });

  return {
    sufficient: missingData.length === 0,
    missingData
  };
}

/**
 * Hook to generate fasting insights with AI analysis
 */
export function useFastingInsightsGenerator(periodDays: number = 7) {
  const { session, profile } = useUserStore();
  const userId = session?.user?.id;

  // DEBUG: Log hook initialization
  React.useEffect(() => {
    logger.debug('FASTING_INSIGHTS_HOOK_INIT', 'Hook initialized', {
      userId,
      periodDays,
      hasProfile: !!profile,
      profileKeys: profile ? Object.keys(profile) : [],
      timestamp: new Date().toISOString()
    });
  }, [userId, periodDays, profile]);

  return useQuery({
    queryKey: ['fasting', 'insights', 'ai', userId, periodDays],
    queryFn: async () => {
      logger.debug('FASTING_INSIGHTS_QUERY_START', 'Query function started', {
        userId,
        periodDays,
        timestamp: new Date().toISOString()
      });

      if (!userId) {
        logger.error('FASTING_INSIGHTS_QUERY_ERROR', 'User not authenticated', {
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error('User not authenticated');
      }

      // Fetch fasting sessions count for data sufficiency check
      const startDate = startOfDay(subDays(new Date(), periodDays)).toISOString();
      const endDate = new Date().toISOString();

      logger.debug('FASTING_INSIGHTS_AI', 'Starting AI insights generation', {
        userId,
        periodDays,
        startDate,
        endDate,
        timestamp: new Date().toISOString()
      });

      const { data: sessions, error: sessionsError } = await supabase
        .from('fasting_sessions')
        .select('id, status')
        .eq('user_id', userId)
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      if (sessionsError) {
        logger.error('FASTING_INSIGHTS_AI', 'Failed to fetch sessions for data check', {
          error: sessionsError.message,
          userId,
          periodDays,
          timestamp: new Date().toISOString()
        });
        throw sessionsError;
      }

      const fastingSessions = sessions || [];
      const completedSessionsCount = fastingSessions.filter(s => s.status === 'completed').length;
      
      // DEBUG: Log sessions data
      logger.debug('FASTING_INSIGHTS_SESSIONS_DATA', 'Sessions fetched for insights', {
        userId,
        periodDays,
        totalSessions: fastingSessions.length,
        completedSessions: completedSessionsCount,
        sessionsData: fastingSessions.map(s => ({
          id: s.id,
          status: s.status,
          date: s.start_time ? s.start_time.split('T')[0] : 'invalid'
        })),
        startDate,
        endDate,
        timestamp: new Date().toISOString()
      });

      // Check data sufficiency
      const dataCheck = hasMinimumDataForInsights(profile, completedSessionsCount, periodDays);
      
      // CRITICAL DEBUG: Log data sufficiency check
      logger.debug('FASTING_INSIGHTS_DATA_CHECK', 'Data sufficiency check result', {
        userId,
        periodDays,
        completedSessionsCount,
        minRequired: periodDays === 7 ? 3 : periodDays === 30 ? 8 : 20,
        dataCheckSufficient: dataCheck.sufficient,
        missingData: dataCheck.missingData,
        willProceedToEdgeFunction: dataCheck.sufficient,
        profileData: {
          hasWeightKg: !!profile?.weight_kg,
          hasHeightCm: !!profile?.height_cm,
          hasObjective: !!profile?.objective,
          hasActivityLevel: !!profile?.activity_level
        },
        timestamp: new Date().toISOString()
      });

      // DETAILED LOGGING: Profile and data check results
      logger.debug('FASTING_INSIGHTS_AI_DATA_CHECK', 'Data sufficiency check completed', {
        userId,
        periodDays,
        profileData: {
          hasWeightKg: !!profile?.weight_kg,
          weightKg: profile?.weight_kg,
          hasHeightCm: !!profile?.height_cm,
          heightCm: profile?.height_cm,
          hasObjective: !!profile?.objective,
          objective: profile?.objective,
          hasActivityLevel: !!profile?.activity_level,
          activityLevel: profile?.activity_level,
          hasEmotions: !!profile?.emotions,
          chronotype: profile?.emotions?.chronotype,
          hasNutrition: !!profile?.nutrition,
          fastingProtocol: profile?.nutrition?.fastingWindow?.protocol
        },
        sessionsData: {
          totalSessions: fastingSessions.length,
          completedSessions: completedSessionsCount,
          minRequired: periodDays === 7 ? 3 : periodDays === 30 ? 8 : 15
        },
        dataCheckResult: {
          sufficient: dataCheck.sufficient,
          missingDataCount: dataCheck.missingData.length,
          missingData: dataCheck.missingData
        },
        timestamp: new Date().toISOString()
      });

      if (!dataCheck.sufficient) {
        logger.warn('FASTING_INSIGHTS_AI', 'Insufficient data for AI insights generation - returning basic summary', {
          userId,
          periodDays,
          sessionsCount: completedSessionsCount,
          missingData: dataCheck.missingData,
          willReturnBasicData: true,
          timestamp: new Date().toISOString()
        });
        
        return {
          summary: {
            overallScore: 0,
            keyFindings: ['Données insuffisantes pour l\'analyse IA'],
            mainRecommendation: 'Complétez votre profil et ajoutez plus de sessions de jeûne pour débloquer les insights de la Forge Spatiale',
            sentiment: 'encouraging' as const
          },
          insights: [],
          dataQuality: 'insufficient' as const,
          analysisDate: new Date().toISOString(),
          periodDays,
          aiModel: 'gpt-5-mini',
          tokensUsed: 0,
          cached: false,
          missingData: dataCheck.missingData
        };
      }

      // DEBUG: Log before Edge Function call
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
      
      logger.debug('FASTING_INSIGHTS_EDGE_CALL_PAYLOAD', 'About to call Edge Function with payload', {
        userId,
        periodDays,
        payload: edgeFunctionPayload,
        payloadSize: JSON.stringify(edgeFunctionPayload).length,
        timestamp: new Date().toISOString()
      });

      // Call AI insights generator Edge Function
      logger.debug('FASTING_INSIGHTS_AI_EDGE_CALL', 'About to call AI insights generator Edge Function', {
        userId,
        periodDays,
        profileKeys: profile ? Object.keys(profile) : [],
        completedSessionsCount,
        dataCheckPassed: true,
        timestamp: new Date().toISOString()
      });

      logger.debug('FASTING_INSIGHTS_AI', 'Calling AI insights generator Edge Function', {
        userId,
        periodDays,
        profileKeys: profile ? Object.keys(profile) : [],
        timestamp: new Date().toISOString()
      });

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('fasting-insights-generator', {
        body: edgeFunctionPayload
      });

      // DEBUG: Log Edge Function response
      logger.debug('FASTING_INSIGHTS_EDGE_RESPONSE', 'Edge Function response received', {
        userId,
        periodDays,
        hasResponse: !!aiResponse,
        hasError: !!aiError,
        errorMessage: aiError?.message,
        responseKeys: aiResponse ? Object.keys(aiResponse) : [],
        timestamp: new Date().toISOString()
      });

      if (aiError) {
        logger.error('FASTING_INSIGHTS_AI', 'AI insights generation failed', {
          error: aiError.message,
          userId,
          periodDays,
          timestamp: new Date().toISOString()
        });
        throw new Error(`AI insights generation failed: ${aiError.message}`);
      }

      const insights: FastingInsightsData = aiResponse;

      logger.debug('FASTING_INSIGHTS_AI', 'AI insights generated successfully', {
        userId,
        periodDays,
        insightsCount: insights.insights.length,
        dataQuality: insights.dataQuality,
        overallScore: insights.summary.overallScore,
        tokensUsed: insights.tokensUsed,
        cached: insights.cached,
        aiModel: insights.aiModel,
        timestamp: new Date().toISOString()
      });

      return insights;
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