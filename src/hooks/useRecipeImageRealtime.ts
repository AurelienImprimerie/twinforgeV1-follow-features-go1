import { useEffect, useRef } from 'react';
import { supabase } from '../system/supabase/client';
import { useMealPlanGenerationPipeline } from '../system/store/mealPlanGenerationPipeline';
import logger from '../lib/utils/logger';

/**
 * Hook to listen for real-time updates to recipe images
 * This will automatically update the meal plan state when images are generated
 * OPTIMIZED: Maintains a single stable connection for all recipes
 */
export const useRecipeImageRealtime = (isActive: boolean, recipeIds: string[]) => {
  const { updateMealImageUrl } = useMealPlanGenerationPipeline();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const setupCompleteRef = useRef(false);

  useEffect(() => {
    // Only setup once when becoming active
    if (!isActive || recipeIds.length === 0) {
      return;
    }

    // If already set up, don't do anything - the channel listens to ALL recipes table updates
    if (setupCompleteRef.current && channelRef.current) {
      return;
    }

    logger.info('RECIPE_IMAGE_REALTIME', 'Setting up Realtime listener for recipe images', {
      recipeCount: recipeIds.length,
      timestamp: new Date().toISOString()
    });

    // Subscribe to ALL changes on the recipes table (no filter)
    // This way we don't need to reconnect when new recipes are added
    const channel = supabase
      .channel('recipe-images-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'recipes'
          // NO FILTER - listen to all recipe updates
        },
        (payload) => {
          const updatedRecipe = payload.new as any;

          logger.info('RECIPE_IMAGE_REALTIME', 'Received recipe update', {
            recipeId: updatedRecipe.id,
            hasImageUrl: !!updatedRecipe.image_url,
            imageUrl: updatedRecipe.image_url,
            timestamp: new Date().toISOString()
          });

          // If the recipe has an image URL, update our state
          if (updatedRecipe.image_url) {
            updateMealImageUrl(updatedRecipe.id, updatedRecipe.image_url);

            logger.info('RECIPE_IMAGE_REALTIME', 'Recipe image updated in state', {
              recipeId: updatedRecipe.id,
              imageUrl: updatedRecipe.image_url,
              timestamp: new Date().toISOString()
            });
          }
        }
      )
      .subscribe((status) => {
        logger.debug('RECIPE_IMAGE_REALTIME', 'Subscription status changed', {
          status,
          timestamp: new Date().toISOString()
        });
      });

    channelRef.current = channel;
    isSubscribedRef.current = true;
    setupCompleteRef.current = true;

    // Cleanup subscription ONLY on unmount
    return () => {
      if (channelRef.current) {
        logger.info('RECIPE_IMAGE_REALTIME', 'Cleaning up Realtime listener (unmount)', {
          timestamp: new Date().toISOString()
        });
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
        setupCompleteRef.current = false;
      }
    };
  }, [isActive]); // Only depend on isActive, NOT on recipeIds
};
