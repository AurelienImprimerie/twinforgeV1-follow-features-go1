import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';

interface RecipeFiltersProps {
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
  selectedFilters: string[];
  setSelectedFilters: (filters: string[]) => void;
  recipesCount: number;
  totalRecipesCount: number;
  isGenerating: boolean;
  maxPrepTime?: number;
  setMaxPrepTime?: (time: number | undefined) => void;
  maxCookTime?: number;
  setMaxCookTime?: (time: number | undefined) => void;
  minServings?: number;
  setMinServings?: (servings: number | undefined) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  searchFilter,
  setSearchFilter,
  selectedFilters,
  setSelectedFilters,
  recipesCount,
  totalRecipesCount,
  isGenerating,
  maxPrepTime,
  setMaxPrepTime,
  maxCookTime,
  setMaxCookTime,
  minServings,
  setMinServings
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  const MotionButton = isPerformanceMode ? 'button' : motion.button;

  const availableFilters = [
    'végétarien',
    'vegan',
    'sans gluten',
    'rapide',
    'économique',
    'protéiné',
    'léger',
    'réconfortant'
  ];

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const clearAllFilters = () => {
    setSearchFilter('');
    setSelectedFilters([]);
    setMaxPrepTime?.(undefined);
    setMaxCookTime?.(undefined);
    setMinServings?.(undefined);
  };

  const hasActiveFilters = searchFilter.length > 0 || selectedFilters.length > 0 || 
                          maxPrepTime !== undefined || maxCookTime !== undefined || minServings !== undefined;

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <GlassCard
      className="p-4 space-y-6"
      style={isPerformanceMode ? {
        background: 'linear-gradient(145deg, color-mix(in srgb, #10B981 20%, #1e293b), color-mix(in srgb, #10B981 10%, #0f172a))',
        borderColor: 'color-mix(in srgb, #10B981 40%, transparent)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      } : {
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #34D399 8%, transparent) 0%, transparent 50%),
          rgba(255, 255, 255, 0.05)
        `,
        borderColor: 'color-mix(in srgb, #10B981 25%, transparent)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px color-mix(in srgb, #10B981 15%, transparent),
          0 0 60px color-mix(in srgb, #34D399 10%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `
      }}
    >
      {/* En-tête du Filtre */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center breathing-icon"
            style={isPerformanceMode ? {
              background: 'linear-gradient(135deg, color-mix(in srgb, #10B981 35%, #1e293b), color-mix(in srgb, #10B981 25%, #0f172a))',
              border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
            } : {
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #10B981 35%, transparent), color-mix(in srgb, #10B981 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
              boxShadow: '0 0 30px color-mix(in srgb, #10B981 40%, transparent)'
            }}
          >
            <SpatialIcon
              Icon={ICONS.Filter}
              size={20}
              style={{ color: '#10B981' }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Filtrer les Recettes
            </h2>
            <p className="text-white/60 text-sm">
              Affiner votre recherche
            </p>
          </div>
        </div>

        {/* Bouton Filtres Avancés */}
        <button
          onClick={toggleAdvancedFilters}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, #10B981 15%, transparent)',
            border: '1px solid color-mix(in srgb, #10B981 30%, transparent)',
            color: 'color-mix(in srgb, #10B981 80%, white)'
          }}
        >
          <SpatialIcon 
            Icon={ICONS.Settings} 
            size={16} 
          />
          <span className="text-sm font-medium">Filtres avancés</span>
          <SpatialIcon 
            Icon={showAdvancedFilters ? ICONS.ChevronUp : ICONS.ChevronDown} 
            size={16} 
          />
        </button>
      </div>

      {/* Panneau de Filtres Avancés */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <MotionDiv
            {...(!isPerformanceMode && {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: 'auto' },
              exit: { opacity: 0, height: 0 },
              transition: { duration: 0.3 }
            })}
            className="space-y-4 overflow-hidden"
          >
            {/* Barre de recherche */}
            <div className="relative">
              <label htmlFor="search-filter" className="block text-sm font-medium text-white/80 mb-2">
                Recherche rapide
              </label>
              <input
                id="search-filter"
                type="text"
                placeholder="Rechercher une recette..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                disabled={isGenerating}
              />
            </div>

            {/* Filtres Numériques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Temps de Préparation Max */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Temps de préparation max (min)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 30"
                  value={maxPrepTime || ''}
                  onChange={(e) => setMaxPrepTime?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  disabled={isGenerating}
                  min="1"
                  max="180"
                />
              </div>

              {/* Temps de Cuisson Max */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Temps de cuisson max (min)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 45"
                  value={maxCookTime || ''}
                  onChange={(e) => setMaxCookTime?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  disabled={isGenerating}
                  min="1"
                  max="300"
                />
              </div>

              {/* Portions Min */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Portions minimum
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2"
                  value={minServings || ''}
                  onChange={(e) => setMinServings?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  disabled={isGenerating}
                  min="1"
                  max="12"
                />
              </div>
            </div>

            {/* Filtres par tags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/80">Tags diététiques</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                    disabled={isGenerating}
                  >
                    Effacer tout
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {availableFilters.map((filter) => {
                  const isSelected = selectedFilters.includes(filter);
                  return (
                    <MotionButton
                      key={filter}
                      onClick={() => toggleFilter(filter)}
                      disabled={isGenerating}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      {...(!isPerformanceMode && {
                        whileHover: !isGenerating ? { scale: 1.05 } : {},
                        whileTap: !isGenerating ? { scale: 0.95 } : {}
                      })}
                    >
                      {filter}
                    </MotionButton>
                  );
                })}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between text-sm text-white/60 mt-6 pt-2 border-t border-white/10">
        <span>
          {isGenerating ? (
            'Génération en cours...'
          ) : (
            `${recipesCount} recette${recipesCount > 1 ? 's' : ''} ${
              recipesCount !== totalRecipesCount ? `sur ${totalRecipesCount}` : ''
            }`
          )}
        </span>
        
        {hasActiveFilters && !isGenerating && (
          <div className="flex items-center gap-2">
            <SpatialIcon 
              Icon={ICONS.Filter} 
              size={14} 
              className="text-green-400"
            />
            <span className="text-green-400">
              Filtres actifs
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default RecipeFilters;