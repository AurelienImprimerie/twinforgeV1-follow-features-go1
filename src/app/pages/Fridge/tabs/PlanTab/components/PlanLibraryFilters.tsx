import React from 'react';
import { Search, Archive, X } from 'lucide-react';
import { useFeedback } from '../../../../../../hooks/useFeedback';

interface PlanLibraryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  selectedWeekFilter: number | null;
  onWeekFilterChange: (week: number | null) => void;
  availableWeeks: number[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const PlanLibraryFilters: React.FC<PlanLibraryFiltersProps> = ({
  searchQuery,
  onSearchChange,
  showArchived,
  onShowArchivedChange,
  selectedWeekFilter,
  onWeekFilterChange,
  availableWeeks,
  onClearFilters,
  hasActiveFilters
}) => {
  const { click } = useFeedback();

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filtres</h3>
        {hasActiveFilters && (
          <button
            onClick={() => {
              click();
              onClearFilters();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un plan..."
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Show archived toggle */}
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <Archive className="w-5 h-5 text-white/70" />
          <span className="text-white">Afficher les plans archivés</span>
        </div>
        <button
          onClick={() => {
            click();
            onShowArchivedChange(!showArchived);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showArchived ? 'bg-primary' : 'bg-white/20'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showArchived ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Week filter */}
      {availableWeeks.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Filtrer par semaine
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                click();
                onWeekFilterChange(null);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedWeekFilter === null
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Toutes
            </button>
            {availableWeeks.map((week) => (
              <button
                key={week}
                onClick={() => {
                  click();
                  onWeekFilterChange(week);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedWeekFilter === week
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Semaine {week}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanLibraryFilters;
