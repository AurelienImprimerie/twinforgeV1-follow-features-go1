/**
 * Inventory Actions for Meal Plan Store
 * Handles inventory loading and selection
 */

import { supabase } from '../../../supabase/client';
import logger from '../../../../lib/utils/logger';
import type { MealPlanState, InventorySession } from '../types';

export interface InventoryActions {
  loadAvailableInventories: () => Promise<void>;
  selectInventory: (inventoryId: string) => void;
}

export const createInventoryActions = (
  set: (partial: Partial<MealPlanState>) => void,
  get: () => MealPlanState
): InventoryActions => ({
  loadAvailableInventories: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      logger.info('MEAL_PLAN_STORE', 'Loading available inventories', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('recipe_sessions')
        .select('id, created_at, inventory_final, status')
        .eq('user_id', user.id)
        .not('inventory_final', 'is', null)
        .order('created_at', { ascending: false });

      // --- START ADDED LOGGING ---
      logger.debug('MEAL_PLAN_STORE', 'Raw Supabase response for recipe_sessions', {
        userId: user.id,
        data: data ? data.map(s => ({ id: s.id, created_at: s.created_at, inventory_final_length: s.inventory_final?.length, status: s.status })) : null,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
      // --- END ADDED LOGGING ---

      // Add detailed logging of raw data
      logger.debug('MEAL_PLAN_STORE', 'Raw data from Supabase before filtering', {
        userId: user.id,
        totalSessions: data?.length || 0,
        sessions: data ? data.map(session => ({
          id: session.id,
          created_at: session.created_at,
          inventory_final_type: Array.isArray(session.inventory_final) ? 'array' : typeof session.inventory_final,
          inventory_final_length: session.inventory_final?.length || 0,
          status: session.status
        })) : [],
        timestamp: new Date().toISOString()
      });

      if (error) {
        throw new Error(`Failed to load inventories: ${error.message}`);
      }

      const validInventories = (data || []).filter(session => 
        session.inventory_final && 
        Array.isArray(session.inventory_final) && 
        session.inventory_final.length > 0
      );
      // --- START ADDED LOGGING ---
      logger.debug('MEAL_PLAN_STORE', 'Filtered valid inventories', {
        userId: user.id,
        validInventoriesCount: validInventories.length,
        validInventoriesIds: validInventories.map(inv => inv.id),
        timestamp: new Date().toISOString()
      });
      // --- END ADDED LOGGING ---

      // Add detailed logging of filtered valid inventories
      logger.debug('MEAL_PLAN_STORE', 'Valid inventories after filtering', {
        userId: user.id,
        validInventoriesCount: validInventories.length,
        validInventories: validInventories.map(session => ({
          id: session.id,
          created_at: session.created_at,
          inventory_final_length: session.inventory_final?.length || 0,
          status: session.status
        })),
        timestamp: new Date().toISOString()
      });

      set({ availableInventories: validInventories });

      // Validate and update selected inventory
      const currentSelectedId = get().selectedInventoryId;
      
      if (validInventories.length > 0) {
        // Check if current selection is valid
        const isCurrentSelectionValid = currentSelectedId && 
          validInventories.some(inv => inv.id === currentSelectedId);
        
        // If no valid selection, select the first available inventory
        if (!isCurrentSelectionValid) {
          logger.info('MEAL_PLAN_STORE', 'No valid selected inventory found, defaulting to first available', {
            userId: user.id,
            currentSelectedId,
            defaultingTo: validInventories[0].id,
            timestamp: new Date().toISOString()
          });
          set({ selectedInventoryId: validInventories[0].id });
        } else {
          logger.debug('MEAL_PLAN_STORE', 'Current selected inventory is valid', {
            userId: user.id,
            currentSelectedId,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // No inventories available, clear selection
        if (currentSelectedId !== null) {
          logger.info('MEAL_PLAN_STORE', 'No inventories available, clearing selected inventory', {
            userId: user.id,
            currentSelectedId,
            timestamp: new Date().toISOString()
          });
          set({ selectedInventoryId: null });
        } else {
          logger.debug('MEAL_PLAN_STORE', 'No inventories available and selected inventory already null', {
            userId: user.id,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Ensure selectedInventoryId is always set if inventories are available
      const finalSelectedId = get().selectedInventoryId;
      if (validInventories.length > 0 && !finalSelectedId) {
        logger.info('MEAL_PLAN_STORE', 'Force selecting first available inventory', {
          userId: user.id,
          forcedSelectionId: validInventories[0].id,
          timestamp: new Date().toISOString()
        });
        set({ selectedInventoryId: validInventories[0].id });
      }

      logger.info('MEAL_PLAN_STORE', 'Available inventories loaded', {
        inventoriesCount: validInventories.length,
        selectedInventoryId: get().selectedInventoryId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('MEAL_PLAN_STORE', 'Failed to load available inventories', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  },

  selectInventory: (inventoryId: string) => {
    set({ selectedInventoryId: inventoryId });
    
    logger.info('MEAL_PLAN_STORE', 'Inventory selected', {
      inventoryId,
      timestamp: new Date().toISOString()
    });
  }
});