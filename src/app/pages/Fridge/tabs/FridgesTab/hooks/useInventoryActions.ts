import { useCallback } from 'react';
import { useToast } from '../../../../../../ui/components/ToastProvider';
import { useExitModalStore } from '../../../../../../system/store/exitModalStore';
import { supabase } from '../../../../../../system/supabase/client';

export const useInventoryActions = (
  userId: string | undefined,
  sessions: any[],
  setSessions: (sessions: any[]) => void,
  setLoading: (loading: boolean) => void,
  setSelectedInventorySessionId: (id: string | null) => void
) => {
  const { showToast } = useToast();
  const { showModal } = useExitModalStore();

  const handleDeleteAllInventories = useCallback(() => {
    if (!userId || sessions.length === 0) return;

    showModal({
      title: 'Supprimer tous les inventaires',
      message: 'Êtes-vous sûr de vouloir supprimer tous vos inventaires de frigo ? Cette action est irréversible.',
      confirmText: 'Supprimer tout',
      cancelText: 'Annuler',
      onConfirm: async () => {
        setLoading(true);
        try {
          // Delete all recipes associated with user's sessions
          const sessionIds = sessions.map(session => session.id);
          
          if (sessionIds.length > 0) {
            const { error: recipesError } = await supabase
              .from('recipes')
              .delete()
              .in('session_id', sessionIds);

            if (recipesError) {
              console.error('Error deleting recipes:', recipesError);
              throw recipesError;
            }

            // Delete all recipe sessions
            const { error: sessionsError } = await supabase
              .from('recipe_sessions')
              .delete()
              .eq('user_id', userId);

            if (sessionsError) {
              console.error('Error deleting recipe sessions:', sessionsError);
              throw sessionsError;
            }
          }

          setSessions([]);
          setSelectedInventorySessionId(null);
          showToast('Tous les inventaires ont été supprimés avec succès', 'success');
        } catch (error) {
          console.error('Error deleting all inventories:', error);
          showToast('Erreur lors de la suppression des inventaires', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  }, [userId, sessions, setSessions, setLoading, setSelectedInventorySessionId, showModal, showToast]);

  const handleDeleteIndividualInventory = useCallback((inventoryId: string) => {
    if (!userId) return;

    const inventoryToDelete = sessions.find(session => session.id === inventoryId);
    if (!inventoryToDelete) return;

    showModal({
      title: 'Supprimer cet inventaire',
      message: `Êtes-vous sûr de vouloir supprimer l'inventaire du ${new Date(inventoryToDelete.created_at).toLocaleDateString('fr-FR')} ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        setLoading(true);
        try {
          // Delete associated recipes first
          const { error: recipesError } = await supabase
            .from('recipes')
            .delete()
            .eq('session_id', inventoryId);

          if (recipesError) {
            console.error('Error deleting recipes:', recipesError);
            throw recipesError;
          }

          // Delete the recipe session
          const { error: sessionError } = await supabase
            .from('recipe_sessions')
            .delete()
            .eq('id', inventoryId)
            .eq('user_id', userId);

          if (sessionError) {
            console.error('Error deleting recipe session:', sessionError);
            throw sessionError;
          }

          // Update local state
          const updatedSessions = sessions.filter(session => session.id !== inventoryId);
          setSessions(updatedSessions);
          
          // Reset selection if the deleted inventory was selected
          setSelectedInventorySessionId(null);
          
          showToast('Inventaire supprimé avec succès', 'success');
        } catch (error) {
          console.error('Error deleting individual inventory:', error);
          showToast('Erreur lors de la suppression de l\'inventaire', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  }, [userId, sessions, setSessions, setLoading, setSelectedInventorySessionId, showModal, showToast]);

  return {
    handleDeleteAllInventories,
    handleDeleteIndividualInventory
  };
};