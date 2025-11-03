/**
 * Meals Repository - Supabase Integration
 * Handles meal data operations and AI analysis calls
 */

import { supabase } from '../../supabase/client';
import logger from '../../../lib/utils/logger';
import type { UserProfile } from '../../../domain/profile';
import { deleteMealPhoto } from '../../../lib/storage/imageUpload';

export interface MealItem {
  name: string;
  confidence: number;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  portion_size?: string;
  category?: string;
}

/**
 * Interface complète pour le contexte utilisateur transmis à l'IA
 * Toutes les données nécessaires pour une analyse personnalisée
 */
export interface UserProfileContext {
  // Données d'identité
  sex?: 'male' | 'female';
  height_cm?: number;
  weight_kg?: number;
  target_weight_kg?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  objective?: 'fat_loss' | 'recomp' | 'muscle_gain';
  birthdate?: string;
  job_category?: string;
  
  // Données nutritionnelles
  nutrition?: {
    diet?: string;
    allergies?: string[];
    intolerances?: string[];
    disliked?: string[];
    budgetLevel?: 'low' | 'medium' | 'high';
    proteinTarget_g?: number;
    fastingWindow?: {
      start?: string;
      end?: string;
      windowHours?: number;
      mealsPerDay?: number;
    };
  };
  
  // Données de santé
  health?: {
    bloodType?: string;
    conditions?: string[];
    medications?: string[];
  };
  
  // Contraintes alimentaires
  constraints?: Record<string, string>;
  
  // Données émotionnelles
  emotions?: {
    chronotype?: 'morning' | 'evening' | 'intermediate';
    stress?: number;
    sleepHours?: number;
    moodBaseline?: 'very_low' | 'low' | 'neutral' | 'good' | 'very_good';
    sensitivities?: string[];
  };
  
  // Préférences d'entraînement
  workout?: {
    type?: 'strength' | 'cardio' | 'mixed' | 'yoga' | 'pilates' | 'crossfit' | 'bodyweight' | 'sports';
    sessionsPerWeek?: number;
    preferredDuration?: number;
    equipment?: string[];
    morningWorkouts?: boolean;
    highIntensity?: boolean;
    groupWorkouts?: boolean;
    outdoorActivities?: boolean;
  };
  
  // Historique récent des repas (pour contextualiser)
  recent_meals?: Array<{
    timestamp: string;
    total_kcal: number;
    meal_type: string;
    macros: { proteins: number; carbs: number; fats: number; };
    detected_foods?: string[]; // Noms des aliments pour pattern recognition
  }>;
  
  // Métadonnées calculées
  calculated_metrics?: {
    age?: number;
    bmi?: number;
    bmr?: number; // Basal Metabolic Rate
    tdee?: number; // Total Daily Energy Expenditure
    protein_target_calculated?: number;
    daily_calorie_target?: number;
  };
}
export interface MealData {
  id?: string;
  user_id: string;
  timestamp: string;
  items: MealItem[];
  total_kcal: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_name?: string;
  photo_url?: string;
  created_at?: string;
}

export interface ScannedProductData {
  barcode: string;
  name: string;
  brand?: string;
  mealItem: MealItem;
  portionMultiplier: number;
}

export interface MealAnalysisRequest {
  user_id: string;
  image_url?: string;
  image_data?: string;
  scanned_products?: ScannedProductData[];
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp?: string;
  user_profile_context?: UserProfileContext;
}

export interface PersonalizedRecommendation {
  type: 'suggestion' | 'warning' | 'alert' | 'insight';
  category: 'nutrition' | 'health' | 'fitness' | 'timing' | 'balance';
  message: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: string;
}

export interface MealAnalysisResponse {
  success: boolean;
  analysis_id: string;
  meal_name: string;
  total_calories: number;
  macronutrients: {
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  detected_foods: MealItem[];
  meal_type: string;
  confidence: number;
  analysis_metadata: {
    processing_time_ms: number;
    model_version: string;
    quality_score: number;
    image_quality: number;
    analysis_model_used: string;
    tokens_used?: { input: number; output: number; };
  };
  personalized_insights: PersonalizedRecommendation[];
  objective_alignment: {
    calories_vs_target: number;
    macros_balance: {
      proteins_status: 'low' | 'optimal' | 'high';
      carbs_status: 'low' | 'optimal' | 'high';
      fats_status: 'low' | 'optimal' | 'high';
    };
    meal_timing_feedback?: string;
  }
  advanced_analysis: boolean;
  error?: string;
}

export interface DailySummary {
  summary: string;
  highlights: string[];
  improvements: string[];
  proactive_alerts: string[];
  overall_score: number;
  recommendations: string[];
  generated_at: string;
  analysis_system: 'advanced';
}

export interface TrendAnalysis {
  trends: Array<{
    pattern: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
    recommendations: string[];
  }>;
  strategic_advice: Array<{
    category: 'nutrition' | 'timing' | 'balance' | 'goals';
    advice: string;
    priority: 'low' | 'medium' | 'high';
    timeframe: 'immediate' | 'short_term' | 'long_term';
  }>;
  meal_classifications: Array<{
    meal_id: string;
    classification: 'balanced' | 'protein_rich' | 'needs_improvement' | 'excellent';
    reasoning: string;
    score: number;
  }>;
  diet_compliance: {
    overall_score: number;
    compliance_rate: number;
    deviations: string[];
    suggestions: string[];
  };
  generated_at: string;
  analysis_system: 'advanced' | 'standard';
}

/**
 * Meals Repository Implementation
 */
export const mealsRepo = {
  /**
   * Analyze meal image using AI
   */
  async analyzeMeal(request: MealAnalysisRequest): Promise<MealAnalysisResponse> {
    logger.info('MEALS_REPO', 'Starting meal analysis', {
      userId: request.user_id,
      hasImageUrl: !!request.image_url,
      hasImageData: !!request.image_data,
      imageDataLength: request.image_data?.length || 0,
      hasUserContext: !!request.user_profile_context,
      userObjective: request.user_profile_context?.objective,
      userAllergies: request.user_profile_context?.nutrition?.allergies?.length || 0,
      mealType: request.meal_type,
      hasScannedProducts: !!(request.scanned_products && request.scanned_products.length > 0),
      scannedProductsCount: request.scanned_products?.length || 0,
      timestamp: new Date().toISOString()
    });

    try {
      const payload = {
        ...request,
        timestamp: new Date().toISOString()
      };

      logger.info('MEALS_REPO', 'Invoking meal-analyzer edge function', {
        userId: request.user_id,
        payloadKeys: Object.keys(payload),
        payloadSize: JSON.stringify(payload).length,
        hasImage: !!(payload.image_url || payload.image_data),
        hasScannedProducts: !!(payload.scanned_products && payload.scanned_products.length > 0),
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase.functions.invoke('meal-analyzer', {
        body: payload,
      });

      // Log response details directly to console for debugging
      console.log('📡 Edge function response:', {
        hasData: !!data,
        hasError: !!error,
        error: error,
        data: data,
      });

      // If there's an error with a Response context, try to read the response body
      if (error && error.context instanceof Response) {
        try {
          const responseClone = error.context.clone();
          const errorBody = await responseClone.text();
          console.error('🔴 RESPONSE BODY from edge function (status 400):', errorBody);

          try {
            const errorJson = JSON.parse(errorBody);
            console.error('🔴 PARSED ERROR from edge function:', errorJson);
          } catch (e) {
            console.error('🔴 Could not parse error body as JSON:', e);
          }
        } catch (e) {
          console.error('🔴 Could not read response body:', e);
        }
      }

      logger.info('MEALS_REPO', 'Received response from meal-analyzer', {
        userId: request.user_id,
        hasData: !!data,
        hasError: !!error,
        dataSuccess: data?.success,
        timestamp: new Date().toISOString()
      });

      if (error) {
        // Log EVERYTHING about the error directly to console
        console.error('🔴 CRITICAL ERROR DEBUG - Edge function error:', {
          errorType: typeof error,
          errorConstructor: error?.constructor?.name,
          errorMessage: error.message,
          errorContext: error.context,
          errorName: error.name,
          errorStack: error.stack,
          fullErrorStringified: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
          allErrorKeys: Object.keys(error),
          allErrorValues: Object.values(error),
        });

        logger.error('MEALS_REPO', `Meal analysis edge function error - ${error.message}`, {
          userId: request.user_id,
          hasUserContext: !!request.user_profile_context,
          hasScannedProducts: !!(request.scanned_products && request.scanned_products.length > 0),
          timestamp: new Date().toISOString()
        });
        throw new Error(`Analyse échouée: ${error.message}`);
      }

      if (!data) {
        logger.error('MEALS_REPO', 'No data received from edge function', {
          userId: request.user_id,
          hasUserContext: !!request.user_profile_context,
          timestamp: new Date().toISOString()
        });
        throw new Error('Aucune donnée reçue du service d\'analyse');
      }

      if (!data.success) {
        logger.error('MEALS_REPO', 'Meal analysis returned success:false', {
          data,
          dataError: data.error,
          userId: request.user_id,
          hasUserContext: !!request.user_profile_context,
          timestamp: new Date().toISOString()
        });
        throw new Error(data.error || 'Analyse échouée sans détails');
      }

      logger.info('MEALS_REPO', 'Meal analysis completed successfully', {
        analysisId: data.analysis_id,
        userId: request.user_id,
        totalCalories: data.total_calories,
        detectedFoodsCount: data.detected_foods?.length || 0,
        detectedFoods: data.detected_foods?.map((f: any) => f.name).join(', '),
        confidence: data.confidence,
        insightsCount: data.personalized_insights?.length || 0,
        aiModelUsed: data.analysis_metadata?.ai_model_used,
        tokensUsed: data.analysis_metadata?.tokens_used?.total || 0,
        processingTime: data.analysis_metadata?.processing_time_ms,
        fallbackUsed: data.analysis_metadata?.fallback_used || false,
        aiPowered: data.ai_powered,
        timestamp: new Date().toISOString()
      });

      return data as MealAnalysisResponse;

    } catch (error) {
      // Gestion spéciale pour les requêtes interrompues (navigation/fermeture app)
      if (error instanceof TypeError &&
          (error.message === 'Failed to fetch' || error.message === 'undefined')) {
        logger.info('MEALS_REPO', 'Meal analysis request interrupted (user navigation/app closed)', {
          userId: request.user_id,
          errorType: 'request_interrupted',
          timestamp: new Date().toISOString()
        });
        throw error; // Re-throw pour que React Query gère l'annulation
      }

      logger.error('MEALS_REPO', 'Meal analysis exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorStack: error instanceof Error ? error.stack : undefined,
        userId: request.user_id,
        hasUserContext: !!request.user_profile_context,
        hasScannedProducts: !!(request.scanned_products && request.scanned_products.length > 0),
        timestamp: new Date().toISOString()
      });

      // Re-throw with user-friendly message if possible
      if (error instanceof Error) {
        throw new Error(`Erreur lors de l'analyse: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Generate daily AI summary using GPT-5 mini
   */
  async generateDailySummary(
    userId: string, 
    todayMeals: MealData[], 
    userProfile: any
  ): Promise<DailySummary> {
    logger.info('MEALS_REPO', 'Generating daily AI summary', {
      userId,
      mealsCount: todayMeals.length,
      hasUserProfile: !!userProfile,
      userObjective: userProfile?.objective,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase.functions.invoke('daily-nutrition-summary', {
        body: {
          user_id: userId,
          meals: todayMeals,
          user_profile: userProfile,
          analysis_date: new Date().toISOString().split('T')[0],
          model: 'gpt-5-mini'
        },
      });

      if (error) {
        logger.error('MEALS_REPO', 'Daily summary generation failed', {
          error: error.message,
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Daily summary failed: ${error.message}`);
      }

      if (!data || !data.success) {
        logger.error('MEALS_REPO', 'Daily summary invalid response', {
          data,
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error(data?.error || 'Daily summary failed');
      }

      logger.info('MEALS_REPO', 'Daily summary generated successfully', {
        userId,
        summaryLength: data.summary?.length || 0,
        highlightsCount: data.highlights?.length || 0,
        alertsCount: data.proactive_alerts?.length || 0,
        overallScore: data.overall_score,
        modelUsed: data.model_used,
        timestamp: new Date().toISOString()
      });

      return data as DailySummary;

    } catch (error) {
      // Gestion spéciale pour les requêtes interrompues (navigation/fermeture app)
      if (error instanceof TypeError && 
          (error.message === 'Failed to fetch' || error.message === 'undefined')) {
        logger.info('MEALS_REPO', 'Daily summary request interrupted (user navigation/app closed)', {
          userId,
          errorType: 'request_interrupted',
          timestamp: new Date().toISOString()
        });
        throw error; // Re-throw pour que React Query gère l'annulation
      }

      logger.error('MEALS_REPO', 'Daily summary exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  /**
   * Generate trend analysis using GPT-5 mini
   */
  async generateTrendAnalysis(
    userId: string, 
    weekMeals: MealData[], 
    userProfile: any
  ): Promise<TrendAnalysis> {
    logger.info('MEALS_REPO', 'Generating AI trend analysis', {
      userId,
      mealsCount: weekMeals.length,
      hasUserProfile: !!userProfile,
      userObjective: userProfile?.objective,
      userDiet: userProfile?.nutrition?.diet,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase.functions.invoke('nutrition-trend-analysis', {
        body: {
          user_id: userId,
          meals: weekMeals,
          user_profile: userProfile,
          analysis_period: '7_days',
          model: 'gpt-5-mini'
        },
      });

      if (error) {
        logger.error('MEALS_REPO', 'Trend analysis generation failed', {
          error: error.message,
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Trend analysis failed: ${error.message}`);
      }

      if (!data || !data.success) {
        logger.error('MEALS_REPO', 'Trend analysis invalid response', {
          data,
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error(data?.error || 'Trend analysis failed');
      }

      logger.info('MEALS_REPO', 'Trend analysis generated successfully', {
        userId,
        trendsCount: data.trends?.length || 0,
        adviceCount: data.strategic_advice?.length || 0,
        classificationsCount: data.meal_classifications?.length || 0,
        dietComplianceScore: data.diet_compliance?.overall_score,
        modelUsed: data.model_used,
        timestamp: new Date().toISOString()
      });

      return data as TrendAnalysis;

    } catch (error) {
      // Gestion spéciale pour les requêtes interrompues (navigation/fermeture app)
      if (error instanceof TypeError && 
          (error.message === 'Failed to fetch' || error.message === 'undefined')) {
        logger.info('MEALS_REPO', 'Trend analysis request interrupted (user navigation/app closed)', {
          userId,
          errorType: 'request_interrupted',
          timestamp: new Date().toISOString()
        });
        throw error; // Re-throw pour que React Query gère l'annulation
      }

      logger.error('MEALS_REPO', 'Trend analysis exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  /**
   * Save analyzed meal to database
   */
  async saveMeal(mealData: Omit<MealData, 'id' | 'created_at'>): Promise<MealData> {
    logger.info('MEALS_REPO', 'Saving meal to database', {
      userId: mealData.user_id,
      totalCalories: mealData.total_kcal,
      itemsCount: mealData.items.length,
      mealType: mealData.meal_type,
      hasPhotoUrl: !!mealData.photo_url,
      timestamp: mealData.timestamp
    });

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: mealData.user_id,
          timestamp: mealData.timestamp,
          items: mealData.items,
          total_kcal: mealData.total_kcal,
          meal_type: mealData.meal_type,
          meal_name: mealData.meal_name,
          photo_url: mealData.photo_url,
        })
        .select()
        .single();

      if (error) {
        logger.error('MEALS_REPO', 'Failed to save meal', {
          error: error.message,
          userId: mealData.user_id,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to save meal: ${error.message}`);
      }

      logger.info('MEALS_REPO', 'Meal saved successfully', {
        mealId: data.id,
        userId: mealData.user_id,
        savedMealData: {
          id: data.id,
          total_kcal: data.total_kcal,
          meal_type: data.meal_type,
          items_count: data.items?.length || 0
        },
        timestamp: new Date().toISOString()
      });

      return data as MealData;

    } catch (error) {
      logger.error('MEALS_REPO', 'Save meal exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: mealData.user_id,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  /**
   * Get user's meals for a date range
   */
  async getUserMeals(
    userId: string, 
    startDate: Date, 
    endDate: Date,
    limit: number = 100
  ): Promise<MealData[]> {
    logger.debug('MEALS_REPO', 'Fetching user meals', {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit
    });

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('MEALS_REPO', 'Failed to fetch meals', {
          error: error.message,
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to fetch meals: ${error.message}`);
      }

      logger.debug('MEALS_REPO', 'Meals fetched successfully', {
        userId,
        mealsCount: data?.length || 0,
        timestamp: new Date().toISOString()
      });

      return (data || []) as MealData[];

    } catch (error) {
      logger.error('MEALS_REPO', 'Fetch meals exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  /**
   * Get today's meals for a user
   */
  async getTodayMeals(userId: string): Promise<MealData[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    return this.getUserMeals(userId, startOfDay, endOfDay);
  },

  /**
   * Get meals for the last N days
   */
  async getRecentMeals(userId: string, days: number = 7): Promise<MealData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return this.getUserMeals(userId, startDate, endDate, days * 5); // 5 meals per day max
  },

  /**
   * Get weekly meals for trend analysis
   */
  async getWeeklyMeals(userId: string): Promise<MealData[]> {
    return this.getRecentMeals(userId, 7);
  },

  /**
   * Get monthly meals for comprehensive analysis
   */
  async getMonthlyMeals(userId: string): Promise<MealData[]> {
    return this.getRecentMeals(userId, 30);
  },

  /**
   * Get meals with enhanced metadata for insights
   */
  async getMealsWithInsights(
    userId: string, 
    days: number = 30
  ): Promise<Array<MealData & { 
    dayOfWeek: number; 
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    macroBalance: { proteins: number; carbs: number; fats: number; };
  }>> {
    const meals = await this.getRecentMeals(userId, days);
    
    return meals.map(meal => {
      const mealDate = new Date(meal.timestamp);
      const hour = mealDate.getHours();
      
      // Calculate macros from items
      const macros = meal.items.reduce((acc, item) => {
        acc.proteins += item.proteins || 0;
        acc.carbs += item.carbs || 0;
        acc.fats += item.fats || 0;
        return acc;
      }, { proteins: 0, carbs: 0, fats: 0 });
      
      return {
        ...meal,
        dayOfWeek: mealDate.getDay(),
        timeOfDay: hour < 10 ? 'morning' :
                   hour < 14 ? 'afternoon' :
                   hour < 20 ? 'evening' : 'night',
        macroBalance: macros
      };
    });
  },
  /**
   * Delete a meal
   */
  async deleteMeal(mealId: string, userId: string): Promise<void> {
    logger.info('MEALS_REPO', 'Deleting meal', {
      mealId,
      userId,
      timestamp: new Date().toISOString()
    });

    try {
      // First, get the meal to check if it has a photo
      const { data: mealData, error: fetchError } = await supabase
        .from('meals')
        .select('photo_url')
        .eq('id', mealId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        logger.warn('MEALS_REPO', 'Could not fetch meal for photo cleanup', {
          error: fetchError.message,
          mealId,
          userId,
          timestamp: new Date().toISOString()
        });
      }

      // Delete the meal from database
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId); // Ensure user can only delete their own meals

      if (error) {
        logger.error('MEALS_REPO', 'Failed to delete meal', {
          error: error.message,
          mealId,
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to delete meal: ${error.message}`);
      }

      // Delete associated photo if it exists and is from Supabase Storage
      if (mealData?.photo_url && 
          mealData.photo_url.includes('supabase.co') && 
          mealData.photo_url.includes('meal_photos')) {
        logger.info('MEALS_REPO', 'Deleting associated meal photo', {
          photoUrl: mealData.photo_url,
          mealId,
          userId,
          timestamp: new Date().toISOString()
        });

        const deleteResult = await deleteMealPhoto(mealData.photo_url, userId);
        if (!deleteResult.success) {
          logger.warn('MEALS_REPO', 'Failed to delete meal photo, but meal was deleted', {
            error: deleteResult.error,
            photoUrl: mealData.photo_url,
            mealId,
            userId,
            timestamp: new Date().toISOString()
          });
        }
      }
      logger.info('MEALS_REPO', 'Meal deleted successfully', {
        mealId,
        userId,
        photoDeleted: !!(mealData?.photo_url),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('MEALS_REPO', 'Delete meal exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        mealId,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  /**
   * Update meal data
   */
  async updateMeal(
    mealId: string, 
    userId: string, 
    updates: Partial<Omit<MealData, 'id' | 'user_id' | 'created_at'>>
  ): Promise<MealData> {
    logger.info('MEALS_REPO', 'Updating meal', {
      mealId,
      userId,
      updateKeys: Object.keys(updates),
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', mealId)
        .eq('user_id', userId) // Ensure user can only update their own meals
        .select()
        .single();

      if (error) {
        logger.error('MEALS_REPO', 'Failed to update meal', {
          error: error.message,
          mealId,
          userId,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to update meal: ${error.message}`);
      }

      logger.info('MEALS_REPO', 'Meal updated successfully', {
        mealId,
        userId,
        timestamp: new Date().toISOString()
      });

      return data as MealData;

    } catch (error) {
      logger.error('MEALS_REPO', 'Update meal exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        mealId,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },
};