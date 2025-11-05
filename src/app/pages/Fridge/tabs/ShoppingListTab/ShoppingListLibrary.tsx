import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShoppingListStore } from '../../../../../system/store/shoppingListStore';
import { supabase } from '../../../../../system/supabase/client';
import logger from '../../../../../lib/utils/logger';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { formatCentsToEuros, formatBudgetRange } from './components/shoppingListUtils';
import type { ShoppingList, ShoppingListCategory } from '../../../../../domain/shoppingList';

interface ExpandedList extends ShoppingList {
  categories: ShoppingListCategory[];
  budgetEstimation?: {
    minTotal: number;
    maxTotal: number;
    averageTotal: number;
    region?: string;
  };
}

/**
 * Shopping List Library Component
 * Displays the most recent list in detail with checkboxes + other lists minimized
 */
const ShoppingListLibrary: React.FC = () => {
  const { allShoppingLists, loadAllShoppingLists } = useShoppingListStore();
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [expandedList, setExpandedList] = useState<ExpandedList | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Auto-expand the most recent list on mount
  useEffect(() => {
    if (allShoppingLists.length > 0 && !expandedListId) {
      const mostRecent = allShoppingLists[0];
      setExpandedListId(mostRecent.id);
      loadListDetails(mostRecent.id);
    }
  }, [allShoppingLists, expandedListId]);

  // Load full details of a shopping list (categories + items)
  const loadListDetails = async (listId: string) => {
    setIsLoading(true);
    try {
      logger.info('SHOPPING_LIST_LIBRARY', 'Loading list details', { listId });

      // Fetch the list metadata
      const { data: listData, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', listId)
        .maybeSingle();

      if (listError) throw listError;
      if (!listData) throw new Error('List not found');

      // Fetch all items for this list
      const { data: itemsData, error: itemsError } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('shopping_list_id', listId)
        .order('category_name', { ascending: true });

      if (itemsError) throw itemsError;

      // Group items by category
      const categoriesMap = new Map<string, ShoppingListCategory>();

      (itemsData || []).forEach((item) => {
        const catName = item.category_name;
        if (!categoriesMap.has(catName)) {
          categoriesMap.set(catName, {
            id: `cat-${catName}`,
            name: catName,
            icon: item.category_icon || 'Package',
            color: item.category_color || '#fb923c',
            estimatedTotal: 0,
            items: []
          });
        }

        const category = categoriesMap.get(catName)!;
        category.items.push({
          id: item.id,
          name: item.item_name,
          quantity: item.quantity,
          category: catName,
          estimatedPrice: item.estimated_price_cents || 0,
          priority: item.priority || 'medium',
          isPurchased: item.is_checked || false
        });

        // Update checked items state
        if (item.is_checked) {
          setCheckedItems(prev => new Set(prev).add(item.id));
        }
      });

      const categories = Array.from(categoriesMap.values());

      // Parse budget estimation from JSONB
      const budgetEstimation = listData.budget_estimation ? {
        minTotal: listData.budget_estimation.minTotal || 0,
        maxTotal: listData.budget_estimation.maxTotal || 0,
        averageTotal: listData.budget_estimation.averageTotal || 0,
        region: listData.budget_estimation.region
      } : undefined;

      const expanded: ExpandedList = {
        id: listData.id,
        name: listData.name,
        generationMode: listData.generation_mode,
        totalItems: listData.total_items,
        completedItems: listData.completed_items || 0,
        totalEstimatedCost: listData.total_estimated_cost_cents || 0,
        categories,
        budgetEstimation,
        createdAt: new Date(listData.created_at),
        updatedAt: new Date(listData.updated_at)
      };

      setExpandedList(expanded);
      logger.info('SHOPPING_LIST_LIBRARY', 'List details loaded', {
        listId,
        categoriesCount: categories.length,
        itemsCount: expanded.totalItems
      });
    } catch (error) {
      logger.error('SHOPPING_LIST_LIBRARY', 'Failed to load list details', { error });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle an item as checked/unchecked
  const toggleItem = async (itemId: string) => {
    const isCurrentlyChecked = checkedItems.has(itemId);
    const newCheckedState = !isCurrentlyChecked;

    // Optimistic update
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedState) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
    }
    setCheckedItems(newCheckedItems);

    try {
      // Update in database
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: newCheckedState })
        .eq('id', itemId);

      if (error) throw error;

      logger.info('SHOPPING_LIST_LIBRARY', 'Item toggled', { itemId, isChecked: newCheckedState });
    } catch (error) {
      logger.error('SHOPPING_LIST_LIBRARY', 'Failed to toggle item', { error });
      // Revert optimistic update
      setCheckedItems(checkedItems);
    }
  };

  // Add a new item to the expanded list
  const handleAddItem = async () => {
    if (!expandedList || !newItemName.trim()) return;

    setIsAddingItem(true);
    try {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          shopping_list_id: expandedList.id,
          category_name: 'Divers',
          category_icon: 'Package',
          category_color: '#64748b',
          item_name: newItemName.trim(),
          quantity: newItemQuantity.trim() || '1',
          estimated_price_cents: 0,
          priority: 'medium',
          is_checked: false
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('SHOPPING_LIST_LIBRARY', 'Item added', { itemId: data.id, name: newItemName });

      // Reload list details
      await loadListDetails(expandedList.id);
      await loadAllShoppingLists();

      // Reset form
      setNewItemName('');
      setNewItemQuantity('');
    } catch (error) {
      logger.error('SHOPPING_LIST_LIBRARY', 'Failed to add item', { error });
    } finally {
      setIsAddingItem(false);
    }
  };

  // Delete an item from the list
  const handleDeleteItem = async (itemId: string) => {
    if (!expandedList) return;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      logger.info('SHOPPING_LIST_LIBRARY', 'Item deleted', { itemId });

      // Reload list details
      await loadListDetails(expandedList.id);
      await loadAllShoppingLists();
    } catch (error) {
      logger.error('SHOPPING_LIST_LIBRARY', 'Failed to delete item', { error });
    }
  };

  // Expand/collapse a list
  const handleToggleList = (listId: string) => {
    if (expandedListId === listId) {
      setExpandedListId(null);
      setExpandedList(null);
    } else {
      setExpandedListId(listId);
      loadListDetails(listId);
    }
  };

  if (allShoppingLists.length === 0) {
    return null;
  }

  const progressPercentage = expandedList
    ? (expandedList.completedItems / expandedList.totalItems) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* List of all shopping lists */}
      {allShoppingLists.map((list, index) => {
        const isExpanded = expandedListId === list.id;
        const isFirst = index === 0;

        return (
          <GlassCard
            key={list.id}
            className={`transition-all duration-300 ${
              isExpanded ? 'border-orange-400/40' : 'border-white/10'
            }`}
          >
            {/* List Header - Always visible */}
            <button
              onClick={() => handleToggleList(list.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                <SpatialIcon
                  Icon={ICONS.ShoppingCart}
                  size={24}
                  color={isExpanded ? '#fb923c' : '#94a3b8'}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {list.name}
                    </h3>
                    {isFirst && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500/20 text-orange-300 rounded-full border border-orange-400/30">
                        Récente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                    <span>{list.totalItems} articles</span>
                    <span>•</span>
                    <span>{new Date(list.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              <SpatialIcon
                Icon={isExpanded ? ICONS.ChevronUp : ICONS.ChevronDown}
                size={20}
                className="text-white/60"
              />
            </button>

            {/* Expanded Content - Details */}
            <AnimatePresence>
              {isExpanded && expandedList && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 border-t border-white/10 space-y-6">
                    {/* Budget Card */}
                    {expandedList.budgetEstimation && (
                      <div className="p-4 rounded-lg bg-slate-500/10 border border-slate-400/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <SpatialIcon Icon={ICONS.DollarSign} size={20} className="text-slate-300" />
                            <span className="text-white/80 font-medium">Budget estimé</span>
                          </div>
                          <span className="text-xl font-bold text-white">
                            {formatBudgetRange(
                              expandedList.budgetEstimation.minTotal,
                              expandedList.budgetEstimation.maxTotal
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Progression</span>
                        <span className="text-white font-semibold">
                          {expandedList.completedItems} / {expandedList.totalItems}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Categories and Items */}
                    <div className="space-y-4">
                      {expandedList.categories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <SpatialIcon
                              Icon={ICONS[category.icon as keyof typeof ICONS] || ICONS.Package}
                              size={18}
                              style={{ color: category.color }}
                            />
                            <h4 className="font-semibold text-white">{category.name}</h4>
                            <span className="text-xs text-white/50">
                              ({category.items.length})
                            </span>
                          </div>
                          <div className="space-y-1">
                            {category.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.isPurchased || checkedItems.has(item.id)}
                                  onChange={() => toggleItem(item.id)}
                                  className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-orange-500 checked:border-orange-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                  <span
                                    className={`text-white ${
                                      item.isPurchased || checkedItems.has(item.id) ? 'line-through opacity-50' : ''
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                  <span className="text-white/50 text-sm ml-2">
                                    {item.quantity}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                                >
                                  <SpatialIcon Icon={ICONS.Trash2} size={16} className="text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Item Form */}
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <SpatialIcon Icon={ICONS.Plus} size={18} />
                        Ajouter un article
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Nom de l'article"
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-400/50"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isAddingItem) {
                              handleAddItem();
                            }
                          }}
                        />
                        <input
                          type="text"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(e.target.value)}
                          placeholder="Quantité"
                          className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-400/50"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isAddingItem) {
                              handleAddItem();
                            }
                          }}
                        />
                        <button
                          onClick={handleAddItem}
                          disabled={!newItemName.trim() || isAddingItem}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold rounded-lg transition-colors"
                        >
                          {isAddingItem ? 'Ajout...' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        );
      })}

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400"></div>
          <p className="text-white/60 mt-2">Chargement...</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingListLibrary;
