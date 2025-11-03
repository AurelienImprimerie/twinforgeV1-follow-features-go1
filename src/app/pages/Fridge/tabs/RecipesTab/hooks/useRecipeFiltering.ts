import { useState, useEffect, useMemo } from 'react';
import type { Recipe } from '../../../../../../domain/recipe';

interface UseRecipeFilteringProps {
  allRecipes: Recipe[];
}

export const useRecipeFiltering = ({ allRecipes }: UseRecipeFilteringProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState<number | undefined>(undefined);
  const [maxCookTime, setMaxCookTime] = useState<number | undefined>(undefined);
  const [minServings, setMinServings] = useState<number | undefined>(undefined);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [initialItemsPerPage, setInitialItemsPerPage] = useState(8);

  // Set responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      const isMobile = window.innerWidth <= 768;
      const initialCount = isMobile ? 8 : 9;
      setInitialItemsPerPage(initialCount);
      setItemsPerPage(initialCount);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Filtrage des recettes
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                           recipe.description?.toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesFilters = selectedFilters.length === 0 || 
                            selectedFilters.some(filter => 
                              recipe.dietaryTags?.includes(filter) ||
                              recipe.reasons?.includes(filter)
                            );
      
      const matchesPrepTime = maxPrepTime === undefined || (recipe.prepTimeMin && recipe.prepTimeMin <= maxPrepTime);
      const matchesCookTime = maxCookTime === undefined || (recipe.cookTimeMin && recipe.cookTimeMin <= maxCookTime);
      const matchesServings = minServings === undefined || (recipe.servings && recipe.servings >= minServings);
      
      return matchesSearch && matchesFilters && matchesPrepTime && matchesCookTime && matchesServings;
    });
  }, [allRecipes, searchFilter, selectedFilters, maxPrepTime, maxCookTime, minServings]);

  // Paginated recipes for display
  const displayedRecipes = useMemo(() => {
    return filteredRecipes.slice(0, itemsPerPage);
  }, [filteredRecipes, itemsPerPage]);

  const hasMoreRecipes = filteredRecipes.length > itemsPerPage;

  // Handle load more
  const handleLoadMore = () => {
    setItemsPerPage(prev => prev + initialItemsPerPage);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchFilter('');
    setSelectedFilters([]);
    setMaxPrepTime(undefined);
    setMaxCookTime(undefined);
    setMinServings(undefined);
    setItemsPerPage(initialItemsPerPage);
  };

  return {
    searchFilter,
    setSearchFilter,
    selectedFilters,
    setSelectedFilters,
    maxPrepTime,
    setMaxPrepTime,
    maxCookTime,
    setMaxCookTime,
    minServings,
    setMinServings,
    itemsPerPage,
    initialItemsPerPage,
    filteredRecipes,
    displayedRecipes,
    hasMoreRecipes,
    handleLoadMore,
    clearAllFilters
  };
};