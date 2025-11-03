import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../../../../system/store/userStore';
import ProfileCompletenessAlert from '../../../../ui/components/profile/ProfileCompletenessAlert';
import FridgeScanMainCTA from '../components/FridgeScanMainCTA';
import RecentScansCard from '../components/RecentScansCard';
import ScannerStatsCard from '../components/ScannerStatsCard';
import EmptyFridgeScannerState from './ScannerTab/EmptyFridgeScannerState';
import { useFridgeScanPipeline } from '../../../../system/store/fridgeScan';

/**
 * ScannerTab - Premier onglet de la Forge Culinaire
 * Affiche le CTA principal pour scanner un frigo et les composants illustratifs
 */
const ScannerTab: React.FC = () => {
  const { profile, session } = useUserStore();
  const { loadRecentSessions } = useFridgeScanPipeline();

  // Charger les sessions récentes au montage du composant
  useEffect(() => {
    loadRecentSessions();
  }, [loadRecentSessions]);

  // Vérification si l'utilisateur a déjà des sessions de scan de frigo
  // Utilise recipe_sessions comme l'onglet Inventaire pour la cohérence
  const { data: hasAnyFridgeScanHistory = false, isLoading } = useQuery({
    queryKey: ['fridge-scan-sessions', 'has-history', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;

      const { supabase } = await import('../../../../system/supabase/client');
      const { data, error } = await supabase
        .from('recipe_sessions')
        .select('id')
        .eq('user_id', session.user.id)
        .not('inventory_final', 'is', null)
        .limit(1);

      if (error) return false;
      return (data?.length || 0) > 0;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 1000, // 5 secondes pour détecter rapidement les nouveaux scans
    gcTime: 0, // Ne pas garder en cache trop longtemps
    refetchOnMount: true, // Toujours refetch au montage
  });

  // Afficher l'empty state si aucun historique
  if (!isLoading && !hasAnyFridgeScanHistory) {
    return <EmptyFridgeScannerState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Alerte de profil incomplet pour les recommandations culinaires */}
      <ProfileCompletenessAlert
        profile={profile}
        forgeContext="culinary"
      />

      {/* CTA Principal de Scanner */}
      <FridgeScanMainCTA />

      {/* Grille de composants illustratifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historique récent des scans */}
        <RecentScansCard />

        {/* Statistiques et insights */}
        <ScannerStatsCard />
      </div>
    </motion.div>
  );
};

export default ScannerTab;
