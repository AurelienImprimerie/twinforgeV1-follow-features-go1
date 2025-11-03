import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { useFastingProtocolsFromHistory, type FastingHistoryFilters } from '../../hooks/useFastingHistory';
import { FASTING_PROTOCOLS } from '@/lib/nutrition/fastingProtocols';

interface FastingHistoryFiltersProps {
  filters: FastingHistoryFilters;
  onFiltersChange: (filters: FastingHistoryFilters) => void;
  totalSessions: number;
  filteredSessions: number;
  className?: string;
}

/**
 * Fasting History Filters - Filtres pour l'Historique de Jeûne
 * Interface de filtrage avancé pour l'historique des sessions
 */
const FastingHistoryFilters: React.FC<FastingHistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  totalSessions,
  filteredSessions,
  className = ''
}) => {
  const { data: availableProtocols } = useFastingProtocolsFromHistory();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleFilterChange = (key: keyof FastingHistoryFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FastingHistoryFilters];
    return value !== undefined && value !== '' && value !== 'all';
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <GlassCard 
        className="p-4"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 8%, transparent) 0%, transparent 60%),
            var(--glass-opacity)
          `,
          borderColor: 'color-mix(in srgb, #8B5CF6 20%, transparent)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.2),
            0 0 20px color-mix(in srgb, #8B5CF6 12%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.12)
          `
        }}
      >
        <div className="space-y-4">
          {/* Header avec Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, #8B5CF6 15%, transparent)',
                  border: '1px solid color-mix(in srgb, #8B5CF6 25%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Search} size={14} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <h4 className="text-purple-300 font-semibold">Filtres d'Historique</h4>
                <p className="text-purple-200 text-sm">
                  {filteredSessions} / {totalSessions} sessions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-glass--secondary-nav px-3 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-1">
                    <SpatialIcon Icon={ICONS.RotateCcw} size={12} />
                    <span>Reset</span>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn-glass px-3 py-1.5"
              >
                <SpatialIcon 
                  Icon={isExpanded ? ICONS.ChevronUp : ICONS.ChevronDown} 
                  size={14} 
                />
              </button>
            </div>
          </div>

          {/* Filtres Rapides */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
              className="glass-input text-sm py-2 px-3"
              style={{ minWidth: '120px' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétées</option>
              <option value="cancelled">Annulées</option>
            </select>

            {/* Protocol Filter */}
            {availableProtocols && availableProtocols.length > 0 && (
              <select
                value={filters.protocol || ''}
                onChange={(e) => handleFilterChange('protocol', e.target.value || undefined)}
                className="glass-input text-sm py-2 px-3"
                style={{ minWidth: '140px' }}
              >
                <option value="">Tous les protocoles</option>
                {availableProtocols.map(protocol => {
                  const protocolInfo = FASTING_PROTOCOLS.find(p => p.id === protocol);
                  return (
                    <option key={protocol} value={protocol}>
                      {protocolInfo?.name || protocol}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Filtres Avancés */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-4 border-t border-white/10"
            >
              {/* Duration Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Durée minimale (heures)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="48"
                    step="0.5"
                    value={filters.minDuration || ''}
                    onChange={(e) => handleFilterChange('minDuration', e.target.value ? Number(e.target.value) : undefined)}
                    className="glass-input text-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Durée maximale (heures)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="48"
                    step="0.5"
                    value={filters.maxDuration || ''}
                    onChange={(e) => handleFilterChange('maxDuration', e.target.value ? Number(e.target.value) : undefined)}
                    className="glass-input text-sm"
                    placeholder="48"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          start: new Date(e.target.value)
                        });
                      } else {
                        const { start, ...rest } = filters.dateRange || {};
                        handleFilterChange('dateRange', Object.keys(rest).length > 0 ? rest : undefined);
                      }
                    }}
                    className="glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFilterChange('dateRange', {
                          ...filters.dateRange,
                          end: new Date(e.target.value)
                        });
                      } else {
                        const { end, ...rest } = filters.dateRange || {};
                        handleFilterChange('dateRange', Object.keys(rest).length > 0 ? rest : undefined);
                      }
                    }}
                    className="glass-input text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
              {filters.status && filters.status !== 'all' && (
                <div className="chip chip--on flex items-center gap-1">
                  <span>Statut: {filters.status === 'completed' ? 'Complétées' : 'Annulées'}</span>
                  <button onClick={() => handleFilterChange('status', undefined)}>
                    <SpatialIcon Icon={ICONS.X} size={10} />
                  </button>
                </div>
              )}
              
              {filters.protocol && (
                <div className="chip chip--on flex items-center gap-1">
                  <span>Protocole: {filters.protocol}</span>
                  <button onClick={() => handleFilterChange('protocol', undefined)}>
                    <SpatialIcon Icon={ICONS.X} size={10} />
                  </button>
                </div>
              )}
              
              {filters.minDuration !== undefined && (
                <div className="chip chip--on flex items-center gap-1">
                  <span>Min: {filters.minDuration}h</span>
                  <button onClick={() => handleFilterChange('minDuration', undefined)}>
                    <SpatialIcon Icon={ICONS.X} size={10} />
                  </button>
                </div>
              )}
              
              {filters.maxDuration !== undefined && (
                <div className="chip chip--on flex items-center gap-1">
                  <span>Max: {filters.maxDuration}h</span>
                  <button onClick={() => handleFilterChange('maxDuration', undefined)}>
                    <SpatialIcon Icon={ICONS.X} size={10} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default FastingHistoryFilters;