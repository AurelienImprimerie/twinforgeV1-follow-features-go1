import React from 'react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFastingHistory, type FastingHistoryFilters } from '../../hooks/useFastingHistory';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import FastingHistoryFilters from '../History/FastingHistoryFilters';
import FastingHistoryStatsCard from '../History/FastingHistoryStatsCard';
import FastingSessionCard from '../History/FastingSessionCard';
import FastingHistoryLoadingSkeleton from '../History/FastingHistoryLoadingSkeleton';
import EmptyFastingHistoryState from '../History/EmptyFastingHistoryState';

/**
 * Fasting History Tab - Onglet Historique de la Forge du Temps
 * Historique complet des sessions de jeûne
 */
const FastingHistoryTab: React.FC = () => {
  const { isPerformanceMode } = usePerformanceMode();
  const [filters, setFilters] = useState<FastingHistoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Conditional motion component
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;
  
  // Fetch history data with filters
  const { 
    data: historyData, 
    isLoading, 
    error 
  } = useFastingHistory(100, filters); // Fetch up to 100 sessions
  
  const handleDeleteSession = (sessionId: string) => {
    // Session will be removed automatically via React Query invalidation
  };

  return (
    <MotionDiv
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      })}
      className="space-y-6"
    >
      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-lg">Historique Temporel</h3>
          {historyData && (
            <div className="text-white/60 text-sm">
              {historyData.sessions.length} session{historyData.sessions.length > 1 ? 's' : ''}
              {historyData.sessions.length !== historyData.allSessions.length && 
                ` sur ${historyData.allSessions.length}`
              }
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-glass px-4 py-2"
        >
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Search} size={14} />
            <span>Filtres</span>
            <SpatialIcon 
              Icon={showFilters ? ICONS.ChevronUp : ICONS.ChevronDown} 
              size={12} 
            />
          </div>
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <FastingHistoryFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalSessions={historyData?.allSessions.length || 0}
            filteredSessions={historyData?.sessions.length || 0}
          />
        )}
      </AnimatePresence>
      
      {/* Loading State */}
      {isLoading && (
        <FastingHistoryLoadingSkeleton />
      )}
      
      {/* Error State */}
      {error && (
        <GlassCard className="p-6" style={{
          background: 'color-mix(in srgb, #EF4444 8%, transparent)',
          borderColor: 'color-mix(in srgb, #EF4444 20%, transparent)'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <SpatialIcon Icon={ICONS.AlertCircle} size={16} className="text-red-400" />
            </div>
            <div>
              <h4 className="text-red-300 font-semibold">Erreur de Chargement</h4>
              <p className="text-red-200 text-sm">
                Impossible de charger l'historique. Réessayez dans quelques instants.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
      
      {/* History Content */}
      {historyData && !isLoading && (
        <div className="space-y-6">
          {/* Statistics Card - Only show when there are sessions */}
          {historyData.sessions.length > 0 && (
            <FastingHistoryStatsCard stats={historyData.stats} />
          )}

          {/* Sessions List */}
          {historyData.sessions.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                <SpatialIcon Icon={ICONS.History} size={18} className="text-purple-400" />
                Sessions ({historyData.sessions.length})
              </h4>
              
              <div className="space-y-3">
                {historyData.sessions.map((session, index) => (
                  <FastingSessionCard
                    key={session.id}
                    session={session}
                    index={index}
                    onDelete={handleDeleteSession}
                  />
                ))}
              </div>
              
              {/* Load More Button si plus de sessions disponibles */}
              {historyData.allSessions.length > historyData.sessions.length && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      // TODO: Implement pagination
                    }}
                    className="btn-glass--secondary-nav px-6 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <SpatialIcon Icon={ICONS.ChevronDown} size={16} />
                      <span>Charger plus de sessions</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* No Sessions State */
            Object.keys(filters).length === 0 ? (
              <EmptyFastingHistoryState />
            ) : (
              <GlassCard className="p-8 text-center" style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 15%, transparent) 0%, transparent 60%),
                  radial-gradient(circle at 70% 80%, color-mix(in srgb, #8B5CF6 12%, transparent) 0%, transparent 50%),
                  linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
                  var(--glass-opacity)
                `,
                borderColor: 'color-mix(in srgb, #8B5CF6 30%, transparent)',
                boxShadow: isPerformanceMode
                  ? '0 12px 40px rgba(0, 0, 0, 0.25)'
                  : `
                    0 12px 40px rgba(0, 0, 0, 0.25),
                    0 0 30px color-mix(in srgb, #8B5CF6 20%, transparent),
                    inset 0 2px 0 rgba(255, 255, 255, 0.15)
                  `
              }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                          linear-gradient(135deg, color-mix(in srgb, #8B5CF6 30%, transparent), color-mix(in srgb, #8B5CF6 20%, transparent))
                        `,
                        border: '2px solid color-mix(in srgb, #8B5CF6 40%, transparent)',
                        boxShadow: isPerformanceMode ? 'none' : '0 0 30px color-mix(in srgb, #8B5CF6 30%, transparent)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.History} size={40} style={{ color: '#8B5CF6' }} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white">Aucune Session Trouvée</h3>
                      <p className="text-white/70 text-base">Aucun résultat</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 text-base leading-relaxed max-w-lg mx-auto">
                      Aucune session ne correspond aux filtres sélectionnés. Essayez de modifier vos critères de recherche.
                    </p>
                  </div>
                </div>
              </GlassCard>
            )
          )}
        </div>
      )}
    </MotionDiv>
  );
};

export default FastingHistoryTab;