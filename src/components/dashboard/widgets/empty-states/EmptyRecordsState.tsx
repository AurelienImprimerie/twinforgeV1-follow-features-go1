/**
 * EmptyRecordsState
 * État vide optimisé de l'onglet Records avec 3 cartes de valeur ajoutée
 * S'affiche quand l'utilisateur n'a encore aucun record personnel
 */

import { useNavigate } from 'react-router-dom';
import DashboardEmptyStateBase from './DashboardEmptyStateBase';

export default function EmptyRecordsState() {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    // Redirect to training page to start first session
    navigate('/training');
  };

  return (
    <DashboardEmptyStateBase
      mainIcon="Award"
      mainIconColor="#EC4899"
      glowColor="#F472B6"
      title="Tes Records Personnels t'Attendent"
      subtitle="Établis ton premier record et suis l'évolution de tes meilleures performances!"
      valueCards={[
        {
          icon: 'Zap',
          iconColor: '#EC4899',
          title: 'Détection Automatique',
          description: 'Tous tes records sont détectés et enregistrés automatiquement'
        },
        {
          icon: 'TrendingUp',
          iconColor: '#8B5CF6',
          title: 'Timeline Complète',
          description: 'Visualise ta progression avec une timeline détaillée de tes records'
        },
        {
          icon: 'Share2',
          iconColor: '#3B82F6',
          title: 'Partage & Célébration',
          description: 'Partage tes victoires et célèbre chaque nouveau record battu'
        }
      ]}
      ctaText="Établir mon premier record"
      ctaIcon="Trophy"
      onCtaClick={handleCtaClick}
    />
  );
}
