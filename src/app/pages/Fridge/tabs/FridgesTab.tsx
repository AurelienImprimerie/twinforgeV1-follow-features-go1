import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../../../../system/store/userStore';
import { useFridgeScanPipeline } from '../../../../system/store/fridgeScan';
import { useMealPlanStore } from '../../../../system/store/mealPlanStore';
import { useToast } from '../../../../ui/components/ToastProvider';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import UserGuideCard from './FridgesTab/components/UserGuideCard';
import SelectedInventoryActionsCard from './FridgesTab/components/SelectedInventoryActionsCard';
import InventoryManagementHeader from './FridgesTab/components/InventoryManagementHeader';
import FridgeSessionList from './FridgesTab/components/FridgeSessionList';
import LoadingAndErrorStates from './FridgesTab/components/LoadingAndErrorStates';
import InventoryInfoCard from './FridgesTab/components/InventoryInfoCard';
import { useFridgeSessions } from './FridgesTab/hooks/useFridgeSessions';
import { useInventoryActions } from './FridgesTab/hooks/useInventoryActions';
import { useInventorySelection } from './FridgesTab/hooks/useInventorySelection';
import { formatDate, getInventoryPreview } from './FridgesTab/utils/inventoryUtils';

/**
 * Frigos Tab - Onglet des Inventaires de Frigo
 * Affiche les inventaires de frigo sauvegardés avec possibilité de générer des recettes
 */
const FridgesTab: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { session } = useUserStore();
  const { startRecipeGenerationFromInventory } = useFridgeScanPipeline();
  const { generateMealPlan } = useMealPlanStore();

  const userId = session?.user?.id;

  // Custom hooks for state management
  const { loading, sessions, error, setSessions, setLoading, refreshSessions } = useFridgeSessions(userId);

  // Refresh sessions when tab becomes visible or window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        refreshSessions();
      }
    };

    const handleFocus = () => {
      if (userId) {
        refreshSessions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId, refreshSessions]);
  const { selectedInventorySessionId, handleInventorySelect, setSelectedInventorySessionId } = useInventorySelection();
  const { handleDeleteAllInventories, handleDeleteIndividualInventory } = useInventoryActions(
    userId,
    sessions,
    setSessions,
    setLoading,
    setSelectedInventorySessionId
  );

  const selectedSession = sessions.find(session => session.id === selectedInventorySessionId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Guide utilisateur - affiché quand aucun inventaire */}
      {!loading && sessions.length === 0 && <UserGuideCard />}

      {/* Header de gestion - affiché quand il y a des inventaires */}
      {sessions.length > 0 && (
        <InventoryManagementHeader
          onDeleteAllInventories={handleDeleteAllInventories}
          onRefresh={refreshSessions}
        />
      )}

      {/* États de Chargement et d'Erreur */}
      <LoadingAndErrorStates loading={loading} error={error} />

      {/* Liste des Sessions ou État Vide */}
      {!loading && !error && (
        <FridgeSessionList
          sessions={sessions}
          selectedInventorySessionId={selectedInventorySessionId}
          onInventorySelect={handleInventorySelect}
          formatDate={formatDate}
          getInventoryPreview={getInventoryPreview}
        />
      )}

      {/* Actions pour l'inventaire sélectionné */}
      {selectedSession && (
        <SelectedInventoryActionsCard 
          session={selectedSession}
          onGenerateRecipes={startRecipeGenerationFromInventory}
          onGenerateMealPlan={generateMealPlan}
          onDeleteIndividualInventory={handleDeleteIndividualInventory}
          navigate={navigate}
          showToast={showToast}
        />
      )}

      {/* Informations sur les Données */}
      <InventoryInfoCard loading={loading} sessions={sessions} />

      {/* Delete All Inventories Button - Moved to bottom */}
      {sessions.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleDeleteAllInventories}
            className="btn-glass--danger px-8 py-3 text-base font-medium rounded-2xl"
            style={{
              borderRadius: '1rem'
            }}
          >
            <div className="flex items-center gap-3">
              <SpatialIcon Icon={ICONS.AlertTriangle} size={20} />
              <span>Supprimer tous les inventaires</span>
            </div>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default FridgesTab;