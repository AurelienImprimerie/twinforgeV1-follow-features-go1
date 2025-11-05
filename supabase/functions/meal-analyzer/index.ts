import { createClient } from 'npm:@supabase/supabase-js@2.54.0';
import { checkTokenBalance, consumeTokensAtomic, createInsufficientTokensResponse } from '../_shared/tokenMiddleware.ts';
import { validateMealAnalysisRequest } from './requestValidator.ts';
import { createCSRFProtection } from '../_shared/csrfProtection.ts';

interface ScannedProductData {
  barcode: string;
  name: string;
  brand?: string;
  mealItem: DetectedFood;
  portionMultiplier: number;
}

interface MealAnalysisRequest {
  user_id: string;
  image_url?: string;
  image_data?: string;
  scanned_products?: ScannedProductData[];
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp?: string;
  user_profile_context?: {
    sex?: 'male' | 'female';
    height_cm?: number;
    weight_kg?: number;
    target_weight_kg?: number;
    activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
    objective?: 'fat_loss' | 'recomp' | 'muscle_gain';
    birthdate?: string;
    job_category?: string;
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
    health?: {
      bloodType?: string;
      chronicConditions?: string[];
      medications?: string[];
    };
    emotions?: {
      stressLevel?: number;
      sleepQuality?: number;
    };
    workout?: {
      workoutIntensity?: number;
      nextWorkoutTime?: string;
    };
    constraints?: string[];
    calculated_metrics?: {
      bmr?: number;
      tdee?: number;
      targetCalories?: number;
    };
  };
}

interface DetectedFood {
  name: string;
  category?: string;
  portion_size?: string;
  estimated_grams?: number;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidence?: number;
}

interface PersonalizedInsight {
  type: 'recommendation' | 'warning' | 'alert' | 'tip';
  category: 'nutrition' | 'timing' | 'hydration' | 'digestion' | 'performance';
  message: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: string;
}

interface ObjectiveAlignment {
  calories_vs_target: number;
  macros_balance: {
    proteins_status: 'low' | 'optimal' | 'high';
    carbs_status: 'low' | 'optimal' | 'high';
    fats_status: 'low' | 'optimal' | 'high';
  };
}

interface MealAnalysisResponse {
  success: boolean;
  error?: string;
  analysis_id: string;
  total_calories: number;
  macronutrients: {
    proteins: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  detected_foods: DetectedFood[];
  meal_name?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  confidence: number;
  analysis_metadata: {
    processing_time_ms: number;
    model_version: string;
    quality_score: number;
    image_quality: number;
    ai_model_used: string;
    tokens_used?: TokenUsage;
    fallback_used?: boolean;
    fallback_reason?: string;
  };
  personalized_insights: PersonalizedInsight[];
  objective_alignment: ObjectiveAlignment;
  ai_powered: boolean;
}

interface TokenUsage {
  input: number;
  output: number;
  total: number;
  cost_estimate_usd: number;
}

interface OpenAIVisionResponse {
  result: Partial<MealAnalysisResponse>;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
    cost_estimate_usd: number;
  };
  aiModel: string;
  fallbackUsed?: boolean;
  fallbackReason?: string;
}

interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-CSRF-Token",
};

/**
 * Detect image format from base64 data
 */
function detectImageFormat(base64Data: string): string | null {
  // Remove data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  // Get first few bytes to detect format
  try {
    const binaryString = atob(cleanBase64.substring(0, 32));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check magic numbers for image formats
    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'jpeg';
    }

    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return 'png';
    }

    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return 'gif';
    }

    // WebP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'webp';
    }

    // HEIC/HEIF: Check for 'ftyp' box and heic/mif1 brands
    const headerStr = String.fromCharCode.apply(null, Array.from(bytes.slice(0, 24)));
    if (headerStr.includes('ftyp') && (headerStr.includes('heic') || headerStr.includes('mif1') || headerStr.includes('heif'))) {
      return 'heic';
    }

    // AVIF: Check for 'ftyp' box and avif brand
    if (headerStr.includes('ftyp') && headerStr.includes('avif')) {
      return 'avif';
    }

    return null;
  } catch (error) {
    console.error('MEAL_ANALYZER', 'Error detecting image format', { error: error instanceof Error ? error.message : 'Unknown' });
    return null;
  }
}

/**
 * Validate and ensure image is in OpenAI-supported format
 */
function validateAndPrepareImageData(imageData: string): { isValid: boolean; data: string; format: string; error?: string } {
  const detectedFormat = detectImageFormat(imageData);

  console.log('IMAGE_FORMAT_DETECTION', 'Detected image format', {
    format: detectedFormat,
    dataLength: imageData.length,
    timestamp: new Date().toISOString()
  });

  // OpenAI supports: JPEG, PNG, GIF, WebP
  const supportedFormats = ['jpeg', 'png', 'gif', 'webp'];

  if (!detectedFormat) {
    return {
      isValid: false,
      data: '',
      format: 'unknown',
      error: 'Could not detect image format from data'
    };
  }

  if (!supportedFormats.includes(detectedFormat)) {
    return {
      isValid: false,
      data: '',
      format: detectedFormat,
      error: `Unsupported image format: ${detectedFormat}. OpenAI Vision API only supports JPEG, PNG, GIF, and WebP.`
    };
  }

  // Clean the base64 data - remove any data URL prefix
  const cleanData = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  // Validate base64
  try {
    atob(cleanData.substring(0, 100)); // Test decode first 100 chars
    return {
      isValid: true,
      data: cleanData,
      format: detectedFormat
    };
  } catch (error) {
    return {
      isValid: false,
      data: '',
      format: detectedFormat,
      error: 'Invalid base64 encoding'
    };
  }
}

function calculateGPT5TokenCost(inputTokens: number, outputTokens: number, model: string): TokenUsage {
  const OPENAI_PRICING = {
    'gpt-5': { input: 1.25, output: 10.00 },
    'gpt-5-mini': { input: 0.25, output: 2.00 },
    'gpt-5-nano': { input: 0.05, output: 0.40 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
  };

  const modelPricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING] || OPENAI_PRICING['gpt-5-mini'];

  const inputCost = (inputTokens / 1000000) * modelPricing.input;
  const outputCost = (outputTokens / 1000000) * modelPricing.output;

  return {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens,
    cost_estimate_usd: inputCost + outputCost
  };
}

function buildPersonalizedAnalysisPrompt(
  userContext: MealAnalysisRequest['user_profile_context'],
  scannedProducts?: ScannedProductData[]
): string {
  const hasScannedProducts = scannedProducts && scannedProducts.length > 0;
  
  let prompt = `Analyze this meal image in detail. Provide a comprehensive nutritional breakdown.`;

  if (hasScannedProducts) {
    prompt += `\n\nScanned Products Context: The user has already scanned some products with barcodes. Include these in your analysis: ${JSON.stringify(scannedProducts.map(p => ({ name: p.name, brand: p.brand, nutrition: p.mealItem })))}`;
  }

  if (userContext?.objective) {
    const objectives = {
      'fat_loss': 'fat loss and weight reduction',
      'recomp': 'body recomposition (build muscle while losing fat)',
      'muscle_gain': 'muscle gain and strength building'
    };
    prompt += `\n\nUser Goal: ${objectives[userContext.objective] || userContext.objective}.`;
  }

  if (userContext?.nutrition?.diet) {
    prompt += `\n\nDiet Type: ${userContext.nutrition.diet}.`;
  }

  if (userContext?.nutrition?.allergies && userContext.nutrition.allergies.length > 0) {
    prompt += `\n\nAllergies: ${userContext.nutrition.allergies.join(', ')}. Check for allergens.`;
  }

  if (userContext?.nutrition?.intolerances && userContext.nutrition.intolerances.length > 0) {
    prompt += `\n\nIntolerances: ${userContext.nutrition.intolerances.join(', ')}.`;
  }

  if (userContext?.calculated_metrics?.targetCalories) {
    prompt += `\n\nDaily Calorie Target: ${userContext.calculated_metrics.targetCalories} kcal.`;
  }

  if (userContext?.nutrition?.proteinTarget_g) {
    prompt += `\n\nProtein Target: ${userContext.nutrition.proteinTarget_g}g per day.`;
  }

  if (userContext?.workout?.workoutIntensity) {
    prompt += `\n\nWorkout Context: User has ${userContext.workout.workoutIntensity > 7 ? 'high' : userContext.workout.workoutIntensity > 4 ? 'moderate' : 'light'} training intensity.`;
  }

  if (userContext?.emotions?.stressLevel && userContext.emotions.stressLevel > 6) {
    prompt += `\n\nStress Level: User is experiencing elevated stress. Consider anti-inflammatory foods.`;
  }

  prompt += `\n\nProvide the response in this JSON format:
{
  "meal_name": "Descriptive meal name",
  "total_calories": <number>,
  "macronutrients": {
    "proteins": <grams>,
    "carbs": <grams>,
    "fats": <grams>,
    "fiber": <grams>,
    "sugar": <grams>,
    "sodium": <mg>
  },
  "detected_foods": [
    {
      "name": "Food name",
      "category": "protein/carb/vegetable/etc",
      "portion_size": "estimated portion",
      "estimated_grams": <number>,
      "calories": <number>,
      "proteins": <grams>,
      "carbs": <grams>,
      "fats": <grams>,
      "confidence": <0-1>
    }
  ],
  "personalized_insights": [
    {
      "type": "recommendation|warning|alert|tip",
      "category": "nutrition|timing|hydration|digestion|performance",
      "message": "Main insight message",
      "reasoning": "Why this matters for the user",
      "priority": "low|medium|high",
      "actionable": "What the user can do"
    }
  ],
  "objective_alignment": {
    "calories_vs_target": <ratio>,
    "macros_balance": {
      "proteins_status": "low|optimal|high",
      "carbs_status": "low|optimal|high",
      "fats_status": "low|optimal|high"
    }
  },
  "confidence": <0-1>,
  "quality_score": <0-1>
}`;

  return prompt;
}

async function analyzeMealWithOpenAIVision(
  imageData: string,
  userContext: MealAnalysisRequest['user_profile_context'],
  scannedProducts?: ScannedProductData[]
): Promise<OpenAIVisionResponse> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('OPENAI_VISION', 'OPENAI_API_KEY not configured');
    throw new Error('OpenAI API key not configured');
  }

  // Validate and prepare image data
  const imageValidation = validateAndPrepareImageData(imageData);

  if (!imageValidation.isValid) {
    console.error('OPENAI_VISION', 'Image validation failed', {
      error: imageValidation.error,
      format: imageValidation.format,
      timestamp: new Date().toISOString()
    });

    throw new Error(`Image validation failed: ${imageValidation.error}`);
  }

  console.log('OPENAI_VISION', 'Image validated successfully', {
    format: imageValidation.format,
    dataLength: imageValidation.data.length,
    timestamp: new Date().toISOString()
  });

  const systemPrompt = buildPersonalizedAnalysisPrompt(userContext, scannedProducts);

  const modelsToTry = ['gpt-4o', 'gpt-4o-mini'];
  const maxRetries = modelsToTry.length;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const currentModel = modelsToTry[attempt];

    try {
      console.log('OPENAI_VISION_RETRY', `Attempting OpenAI Vision with ${currentModel}`, {
        attemptNumber: attempt + 1,
        maxRetries,
        model: currentModel,
        imageFormat: imageValidation.format,
        timestamp: new Date().toISOString()
      });

      const requestBody = {
        model: currentModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${imageValidation.format};base64,${imageValidation.data}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${currentModel}): ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const messageContent = data.choices[0]?.message?.content;
      
      if (!messageContent) {
        throw new Error('No content in OpenAI response');
      }

      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      const usage: OpenAIUsage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      const tokenUsage = calculateGPT5TokenCost(usage.prompt_tokens, usage.completion_tokens, currentModel);

      console.log('OPENAI_VISION_SUCCESS', `Successfully analyzed meal with ${currentModel}`, {
        model: currentModel,
        tokensUsed: usage.total_tokens,
        costUSD: tokenUsage.cost_estimate_usd,
        attemptNumber: attempt + 1,
        timestamp: new Date().toISOString()
      });

      return {
        result,
        tokenUsage,
        aiModel: currentModel,
        fallbackUsed: false
      };
      
    } catch (error) {
      lastError = error as Error;
      console.error('OPENAI_VISION_RETRY', `Attempt ${attempt + 1} failed with ${currentModel}`, {
        model: currentModel,
        error: lastError.message,
        attemptNumber: attempt + 1,
        willRetry: attempt < maxRetries - 1,
        timestamp: new Date().toISOString()
      });
      
      if (attempt === maxRetries) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  console.error('OPENAI_VISION_RETRY', 'All OpenAI Vision attempts failed, using simplified fallback', {
    lastError: lastError?.message || 'Unknown error',
    attemptsCount: maxRetries + 1,
    modelsAttempted: modelsToTry.slice(0, maxRetries + 1),
    timestamp: new Date().toISOString()
  });
  
  const fallbackResult = generateSimplifiedFallback(imageData);
  
  return {
    result: fallbackResult,
    tokenUsage: { input: 0, output: 0, total: 0, cost_estimate_usd: 0 },
    aiModel: 'fallback',
    fallbackUsed: true,
    fallbackReason: `OpenAI Vision analysis failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  };
}

function generateSimplifiedFallback(imageData: string): Partial<MealAnalysisResponse> {
  console.log('FALLBACK_ANALYSIS', 'Generating simplified fallback analysis', {
    imageDataLength: imageData.length,
    timestamp: new Date().toISOString()
  });
  
  const estimatedCalories = 400 + Math.floor(Math.random() * 300);
  
  return {
    meal_name: 'Repas mixte (estimation)',
    total_calories: estimatedCalories,
    macronutrients: {
      proteins: Math.round(estimatedCalories * 0.15 / 4),
      carbs: Math.round(estimatedCalories * 0.50 / 4),
      fats: Math.round(estimatedCalories * 0.35 / 9),
      fiber: 5,
      sugar: 10,
      sodium: 300,
    },
    detected_foods: [
      {
        name: 'Aliments mixtes',
        category: 'mixed',
        portion_size: 'portion standard',
        estimated_grams: 300,
        calories: estimatedCalories,
        proteins: Math.round(estimatedCalories * 0.15 / 4),
        carbs: Math.round(estimatedCalories * 0.50 / 4),
        fats: Math.round(estimatedCalories * 0.35 / 9),
        confidence: 0.60
      }
    ],
    confidence: 0.60,
    quality_score: 0.60,
    personalized_insights: [
      {
        type: 'alert',
        category: 'nutrition',
        message: 'Analyse simplifiée utilisée - vérifiez les valeurs.',
        reasoning: 'Le système d\'IA n\'a pas pu traiter l\'image.',
        priority: 'medium',
        actionable: 'Vous pouvez ressayer avec une meilleure photo ou ajuster les valeurs manuellement.'
      }
    ],
    objective_alignment: {
      calories_vs_target: 1.0,
      macros_balance: {
        proteins_status: 'optimal',
        carbs_status: 'optimal',
        fats_status: 'optimal',
      },
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Use POST.',
          ai_powered: false
        }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestBody: MealAnalysisRequest = await req.json();

    const validationError = validateMealAnalysisRequest(requestBody);
    if (validationError) {
      console.error('MEAL_ANALYZER_VALIDATION', 'Request validation failed', {
        error: validationError,
        userId: requestBody.user_id,
        timestamp: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: validationError,
          ai_powered: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const csrfProtection = createCSRFProtection(supabase);
    const csrfToken = req.headers.get('x-csrf-token');

    const csrfValidation = await csrfProtection.validateRequest(
      requestBody.user_id,
      csrfToken,
      req,
      'meal-analyzer'
    );

    if (!csrfValidation.valid) {
      console.error('MEAL_ANALYZER', 'CSRF validation failed', {
        user_id: requestBody.user_id,
        error: csrfValidation.error,
        tokenProvided: !!csrfToken,
        originValidated: csrfValidation.originValidated,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'CSRF validation failed',
          message: csrfValidation.error,
          ai_powered: false
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('MEAL_ANALYZER', 'CSRF validation passed', {
      user_id: requestBody.user_id,
      tokenValidated: csrfValidation.tokenValidated,
      originValidated: csrfValidation.originValidated,
    });

    const analysisId = crypto.randomUUID();
    const startTime = Date.now();

    console.log('MEAL_ANALYZER', 'Starting meal analysis with OpenAI GPT-5 Vision', {
      analysisId,
      userId: requestBody.user_id,
      hasImageUrl: !!requestBody.image_url,
      hasImageData: !!requestBody.image_data,
      hasUserContext: !!requestBody.user_profile_context,
      userObjective: requestBody.user_profile_context?.objective,
      userAllergies: requestBody.user_profile_context?.nutrition?.allergies?.length || 0,
      mealType: requestBody.meal_type,
      timestamp: new Date().toISOString()
    });

    const estimatedTokensForVision = 100;
    const tokenCheck = await checkTokenBalance(supabase, requestBody.user_id, estimatedTokensForVision);

    if (!tokenCheck.hasEnoughTokens) {
      console.warn('MEAL_ANALYZER', 'Insufficient tokens for analysis', {
        analysisId,
        userId: requestBody.user_id,
        currentBalance: tokenCheck.currentBalance,
        requiredTokens: estimatedTokensForVision,
        timestamp: new Date().toISOString()
      });

      return createInsufficientTokensResponse(
        tokenCheck.currentBalance,
        estimatedTokensForVision,
        !tokenCheck.isSubscribed,
        corsHeaders
      );
    }

    console.log('💰 [MEAL_ANALYZER] Token check passed', {
      analysisId,
      userId: requestBody.user_id,
      currentBalance: tokenCheck.currentBalance,
      estimatedCost: estimatedTokensForVision,
      timestamp: new Date().toISOString()
    });

    let imageDataForAnalysis = requestBody.image_data;
    
    if (!imageDataForAnalysis && requestBody.image_url) {
      try {
        console.log('MEAL_ANALYZER', 'Fetching image from URL', {
          analysisId,
          imageUrl: requestBody.image_url,
          timestamp: new Date().toISOString()
        });
        
        const imageResponse = await fetch(requestBody.image_url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        imageDataForAnalysis = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        
        console.log('MEAL_ANALYZER', 'Image fetched and converted to base64', {
          analysisId,
          imageDataLength: imageDataForAnalysis.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('MEAL_ANALYZER', 'Failed to fetch image from URL', {
          analysisId,
          error: error instanceof Error ? error.message : 'Unknown error',
          imageUrl: requestBody.image_url
        });
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch image from provided URL',
            ai_powered: false
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    if (!imageDataForAnalysis) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No image data provided',
          ai_powered: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate image format before proceeding
    const preValidation = validateAndPrepareImageData(imageDataForAnalysis);
    if (!preValidation.isValid) {
      console.error('MEAL_ANALYZER', 'Image format validation failed before analysis', {
        analysisId,
        userId: requestBody.user_id,
        error: preValidation.error,
        format: preValidation.format,
        timestamp: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: preValidation.error || 'Invalid image format',
          details: `Detected format: ${preValidation.format}. Supported formats: JPEG, PNG, GIF, WebP.`,
          ai_powered: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('MEAL_ANALYZER', 'Calling OpenAI Vision API', {
      analysisId,
      userId: requestBody.user_id,
      imageDataLength: imageDataForAnalysis.length,
      imageFormat: preValidation.format,
      hasScannedProducts: !!(requestBody.scanned_products && requestBody.scanned_products.length > 0),
      scannedProductsCount: requestBody.scanned_products?.length || 0,
      timestamp: new Date().toISOString()
    });

    const visionResult = await analyzeMealWithOpenAIVision(
      imageDataForAnalysis,
      requestBody.user_profile_context,
      requestBody.scanned_products
    );

    const processingTime = Date.now() - startTime;

    console.log('MEAL_ANALYZER', 'OpenAI Vision analysis completed', {
      analysisId,
      userId: requestBody.user_id,
      aiModel: visionResult.aiModel,
      tokensUsed: visionResult.tokenUsage.total,
      costUSD: visionResult.tokenUsage.cost_estimate_usd,
      processingTimeMs: processingTime,
      fallbackUsed: visionResult.fallbackUsed || false,
      timestamp: new Date().toISOString()
    });

    const response: MealAnalysisResponse = {
      success: true,
      analysis_id: analysisId,
      total_calories: visionResult.result.total_calories || 400,
      macronutrients: visionResult.result.macronutrients || {
        proteins: 15,
        carbs: 50,
        fats: 15,
        fiber: 5,
        sugar: 10,
        sodium: 300,
      },
      detected_foods: visionResult.result.detected_foods || [],
      meal_name: visionResult.result.meal_name,
      meal_type: requestBody.meal_type || 'dinner',
      confidence: visionResult.result.confidence || 0.85,
      analysis_metadata: {
        processing_time_ms: processingTime,
        model_version: 'openai-gpt-5-vision-v1',
        quality_score: visionResult.result.quality_score || 0.85,
        image_quality: visionResult.result.quality_score || 0.85,
        ai_model_used: visionResult.aiModel,
        tokens_used: visionResult.tokenUsage,
        fallback_used: visionResult.fallbackUsed,
        fallback_reason: visionResult.fallbackReason,
      },
      personalized_insights: visionResult.result.personalized_insights || [],
      objective_alignment: visionResult.result.objective_alignment || {
        calories_vs_target: 1.0,
        macros_balance: {
          proteins_status: 'optimal',
          carbs_status: 'optimal',
          fats_status: 'optimal',
        },
      },
      ai_powered: !visionResult.fallbackUsed,
    };

    // Only consume tokens if we actually used the AI (not fallback)
    if (!visionResult.fallbackUsed && visionResult.tokenUsage.total > 0) {
      const requestId = crypto.randomUUID();
      const tokenResult = await consumeTokensAtomic(
        supabase,
        {
          userId: requestBody.user_id,
          edgeFunctionName: 'meal-analyzer',
          operationType: 'meal_analysis',
          openaiModel: visionResult.aiModel,
          openaiInputTokens: visionResult.tokenUsage.input,
          openaiOutputTokens: visionResult.tokenUsage.output,
          openaiCostUsd: visionResult.tokenUsage.cost_estimate_usd,
          metadata: { analysis_id: analysisId, model: visionResult.aiModel }
        },
        requestId
      );

      if (!tokenResult.success) {
        console.error('❌ [MEAL_ANALYZER] Token consumption failed', {
          userId: requestBody.user_id,
          error: tokenResult.error,
          requestId
        });
      } else {
        console.log('✅ [MEAL_ANALYZER] Tokens consumed successfully', {
          userId: requestBody.user_id,
          tokensConsumed: tokenResult.consumed,
          remainingBalance: tokenResult.remainingBalance,
          requestId
        });
      }
    } else {
      console.log('⏭️ [MEAL_ANALYZER] Skipping token consumption (fallback used)', {
        userId: requestBody.user_id,
        analysisId,
        fallbackUsed: visionResult.fallbackUsed,
        tokensUsed: visionResult.tokenUsage.total
      });
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('MEAL_ANALYZER', 'Critical OpenAI GPT-5 Vision analysis failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    const fallbackResult = generateSimplifiedFallback('');
    
    const response: MealAnalysisResponse = {
      success: true,
      analysis_id: crypto.randomUUID(),
      total_calories: fallbackResult.total_calories || 400,
      macronutrients: fallbackResult.macronutrients || {
        proteins: 15,
        carbs: 50,
        fats: 15,
        fiber: 5,
        sugar: 10,
        sodium: 300,
      },
      detected_foods: fallbackResult.detected_foods || [],
      meal_type: 'dinner',
      confidence: 0.50,
      analysis_metadata: {
        processing_time_ms: 500,
        model_version: 'emergency-fallback-v1',
        quality_score: 0.50,
        image_quality: 0.50,
        ai_model_used: 'emergency-fallback',
        fallback_used: true,
        fallback_reason: 'Critical system error, using emergency estimation',
      },
      personalized_insights: [
        {
          type: 'alert',
          category: 'nutrition',
          message: 'Analyse d\'urgence utilisée - veuillez vérifier les valeurs.',
          reasoning: 'Le système d\'IA a rencontré une erreur technique.',
          priority: 'high',
          actionable: 'Vous pouvez ressayer l\'analyse ou saisir les valeurs manuellement.'
        }
      ],
      objective_alignment: {
        calories_vs_target: 1.0,
        macros_balance: {
          proteins_status: 'optimal',
          carbs_status: 'optimal',
          fats_status: 'optimal',
        },
      },
      ai_powered: false,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});