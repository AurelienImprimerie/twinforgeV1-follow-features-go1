import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';

interface FridgeSession {
  id: string;
  created_at: string;
  inventory_final: any[];
  status: string;
}

interface FridgeSessionListProps {
  sessions: FridgeSession[];
  selectedInventorySessionId: string | null;
  onInventorySelect: (session: FridgeSession) => void;
  formatDate: (dateString: string) => string;
  getInventoryPreview: (inventory: any[]) => string;
}

const FridgeSessionList: React.FC<FridgeSessionListProps> = ({
  sessions,
  selectedInventorySessionId,
  onInventorySelect,
  formatDate,
  getInventoryPreview
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">
          Aucun inventaire disponible. Scannez votre frigo pour commencer !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isPerformanceMode ? (
        sessions.map((session) => (
          <div key={session.id}>
            <GlassCard
              className={`fridge-glass-inventory p-6 h-full cursor-pointer group relative overflow-hidden rounded-3xl transform-gpu preserve-3d will-transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                selectedInventorySessionId === session.id
                  ? 'fridge-glass-inventory--selected ring-2 ring-indigo-400/50'
                  : ''
              }`}
              onClick={() => onInventorySelect(session)}
            >
              <div className="flex flex-col h-full">
                {/* En-tête de la Session */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="fridge-icon-inventory w-10 h-10">
                      <SpatialIcon
                        Icon={ICONS.Package}
                        size={18}
                        color="rgba(255, 255, 255, 0.95)"
                        variant="pure"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        Inventaire
                      </h3>
                      <p className="text-white/60 text-xs">
                        {formatDate(session.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="fridge-badge-success flex items-center gap-1 px-2 py-1">
                    <SpatialIcon
                      Icon={ICONS.Package}
                      size={12}
                      color="rgba(16, 185, 129, 1)"
                      variant="pure"
                    />
                    <span className="text-emerald-300 text-xs font-medium">
                      {session.inventory_final?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Aperçu de l'Inventaire */}
                <div className="flex-1 mb-4">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {getInventoryPreview(session.inventory_final)}
                  </p>
                </div>

                {/* Indicateur de sélection */}
                <div className="flex items-center justify-center">
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedInventorySessionId === session.id
                      ? 'fridge-badge-inventory-active text-cyan-300'
                      : 'fridge-badge-inventory text-white/60'
                  }`}>
                    {selectedInventorySessionId === session.id ? 'Sélectionné' : 'Cliquer pour sélectionner'}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        ))
      ) : (
        <AnimatePresence>
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className={`fridge-glass-inventory p-6 h-full cursor-pointer group relative overflow-hidden rounded-3xl transform-gpu preserve-3d will-transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  selectedInventorySessionId === session.id
                    ? 'fridge-glass-inventory--selected ring-2 ring-indigo-400/50'
                    : ''
                }`}
                onClick={() => onInventorySelect(session)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="fridge-icon-inventory w-10 h-10">
                        <SpatialIcon
                          Icon={ICONS.Package}
                          size={18}
                          color="rgba(255, 255, 255, 0.95)"
                          variant="pure"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">
                          Inventaire
                        </h3>
                        <p className="text-white/60 text-xs">
                          {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="fridge-badge-success flex items-center gap-1 px-2 py-1">
                      <SpatialIcon
                        Icon={ICONS.Package}
                        size={12}
                        color="rgba(16, 185, 129, 1)"
                        variant="pure"
                      />
                      <span className="text-emerald-300 text-xs font-medium">
                        {session.inventory_final?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 mb-4">
                    <p className="text-white/80 text-sm leading-relaxed">
                      {getInventoryPreview(session.inventory_final)}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedInventorySessionId === session.id
                        ? 'fridge-badge-inventory-active text-cyan-300'
                        : 'fridge-badge-inventory text-white/60'
                    }`}>
                      {selectedInventorySessionId === session.id ? 'Sélectionné' : 'Cliquer pour sélectionner'}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default FridgeSessionList;