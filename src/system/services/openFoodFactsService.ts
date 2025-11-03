import logger from '../../lib/utils/logger';
import type { MealItem } from '../data/repositories/mealsRepo';

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  quantity?: string;
  image_url?: string;
  image_small_url?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sugars_100g'?: number;
    'sodium_100g'?: number;
    'energy-kcal_serving'?: number;
    'proteins_serving'?: number;
    'carbohydrates_serving'?: number;
    'fat_serving'?: number;
  };
  serving_size?: string;
  nutrition_grades?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  categories?: string;
  allergens?: string;
  ingredients_text?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  status_verbose: string;
  code: string;
  product?: OpenFoodFactsProduct;
}

export interface BarcodeProductResult {
  success: boolean;
  product?: {
    barcode: string;
    name: string;
    brand?: string;
    image_url?: string;
    portion_size?: string;
    nutrition_per_100g: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
    };
    nutrition_per_serving?: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    };
    nutriscore?: string;
    nova_group?: number;
    categories?: string;
    allergens?: string;
  };
  error?: string;
}

const OFF_API_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

const USER_AGENT = 'TwinForge/1.0 (Nutrition Tracking App; contact@twinforge.app)';

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const openFoodFactsService = {
  async getProductByBarcode(barcode: string): Promise<BarcodeProductResult> {
    logger.info('OFF_SERVICE', 'Fetching product from OpenFoodFacts', {
      barcode,
      timestamp: new Date().toISOString(),
    });

    try {
      const url = `${OFF_API_BASE_URL}/product/${barcode}?fields=code,product_name,brands,quantity,image_url,image_small_url,nutriments,serving_size,nutrition_grades,nutriscore_grade,nova_group,categories,allergens,ingredients_text`;

      const response = await fetchWithTimeout(url, {}, 8000);

      if (!response.ok) {
        logger.warn('OFF_SERVICE', 'OpenFoodFacts API returned non-OK status', {
          barcode,
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: `Produit non trouvé (HTTP ${response.status})`,
        };
      }

      const data: OpenFoodFactsResponse = await response.json();

      if (data.status !== 1 || !data.product) {
        logger.info('OFF_SERVICE', 'Product not found in OpenFoodFacts database', {
          barcode,
          status: data.status,
          status_verbose: data.status_verbose,
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: 'Produit non trouvé dans la base de données OpenFoodFacts',
        };
      }

      const product = data.product;

      if (!product.product_name || !product.nutriments) {
        logger.warn('OFF_SERVICE', 'Product found but missing essential data', {
          barcode,
          hasName: !!product.product_name,
          hasNutriments: !!product.nutriments,
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: 'Données nutritionnelles incomplètes',
        };
      }

      const nutriments = product.nutriments;

      const result: BarcodeProductResult = {
        success: true,
        product: {
          barcode: product.code,
          name: product.product_name,
          brand: product.brands,
          image_url: product.image_url || product.image_small_url,
          portion_size: product.serving_size || product.quantity,
          nutrition_per_100g: {
            calories: nutriments['energy-kcal_100g'] || 0,
            proteins: nutriments['proteins_100g'] || 0,
            carbs: nutriments['carbohydrates_100g'] || 0,
            fats: nutriments['fat_100g'] || 0,
            fiber: nutriments['fiber_100g'],
            sugar: nutriments['sugars_100g'],
            sodium: nutriments['sodium_100g'],
          },
          nutriscore: product.nutriscore_grade || product.nutrition_grades,
          nova_group: product.nova_group,
          categories: product.categories,
          allergens: product.allergens,
        },
      };

      if (
        nutriments['energy-kcal_serving'] ||
        nutriments['proteins_serving'] ||
        nutriments['carbohydrates_serving'] ||
        nutriments['fat_serving']
      ) {
        result.product!.nutrition_per_serving = {
          calories: nutriments['energy-kcal_serving'] || 0,
          proteins: nutriments['proteins_serving'] || 0,
          carbs: nutriments['carbohydrates_serving'] || 0,
          fats: nutriments['fat_serving'] || 0,
        };
      }

      logger.info('OFF_SERVICE', 'Product fetched successfully', {
        barcode,
        productName: product.product_name,
        brand: product.brands,
        hasNutritionPerServing: !!result.product?.nutrition_per_serving,
        nutriscore: result.product?.nutriscore,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('OFF_SERVICE', 'Request timeout', {
          barcode,
          error: 'Request timed out after 8 seconds',
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: 'Délai d\'attente dépassé. Veuillez réessayer.',
        };
      }

      logger.error('OFF_SERVICE', 'Error fetching product', {
        barcode,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: 'Erreur de connexion à OpenFoodFacts',
      };
    }
  },

  convertToMealItem(
    product: BarcodeProductResult['product'],
    portionMultiplier: number = 1
  ): MealItem | null {
    if (!product) return null;

    const useServing = product.nutrition_per_serving && portionMultiplier === 1;
    const nutrition = useServing
      ? product.nutrition_per_serving!
      : product.nutrition_per_100g;

    const adjustedCalories = nutrition.calories * portionMultiplier;
    const adjustedProteins = nutrition.proteins * portionMultiplier;
    const adjustedCarbs = nutrition.carbs * portionMultiplier;
    const adjustedFats = nutrition.fats * portionMultiplier;

    const portionSize = useServing
      ? product.portion_size || '1 portion'
      : portionMultiplier === 1
      ? '100g'
      : `${portionMultiplier * 100}g`;

    const mealItem: MealItem = {
      name: product.brand ? `${product.brand} ${product.name}` : product.name,
      confidence: 1.0,
      calories: Math.round(adjustedCalories),
      proteins: Math.round(adjustedProteins * 10) / 10,
      carbs: Math.round(adjustedCarbs * 10) / 10,
      fats: Math.round(adjustedFats * 10) / 10,
      fiber: product.nutrition_per_100g.fiber
        ? Math.round(product.nutrition_per_100g.fiber * portionMultiplier * 10) / 10
        : undefined,
      sugar: product.nutrition_per_100g.sugar
        ? Math.round(product.nutrition_per_100g.sugar * portionMultiplier * 10) / 10
        : undefined,
      sodium: product.nutrition_per_100g.sodium
        ? Math.round(product.nutrition_per_100g.sodium * portionMultiplier * 1000) / 1000
        : undefined,
      portion_size: portionSize,
      category: 'packaged_product',
    };

    logger.debug('OFF_SERVICE', 'Converted product to MealItem', {
      productName: product.name,
      portionMultiplier,
      useServing,
      mealItem: {
        name: mealItem.name,
        calories: mealItem.calories,
        portion_size: mealItem.portion_size,
      },
      timestamp: new Date().toISOString(),
    });

    return mealItem;
  },

  getCommonPortionMultipliers(): Array<{ label: string; value: number }> {
    return [
      { label: '¼ portion', value: 0.25 },
      { label: '½ portion', value: 0.5 },
      { label: '1 portion', value: 1 },
      { label: '1.5 portions', value: 1.5 },
      { label: '2 portions', value: 2 },
      { label: '3 portions', value: 3 },
    ];
  },
};
