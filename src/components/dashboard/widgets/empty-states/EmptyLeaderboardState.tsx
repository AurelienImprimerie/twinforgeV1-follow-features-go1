/**
 * EmptyLeaderboardState
 * État vide de l'onglet Classement avec 3 cartes de valeur ajoutée
 * S'affiche quand le classement est vide ou que l'utilisateur n'y figure pas encore
 */

import DashboardEmptyStateBase from './DashboardEmptyStateBase';

interface EmptyLeaderboardStateProps {
  onCtaClick?: () => void;
}

export default function EmptyLeaderboardState({ onCtaClick }: EmptyLeaderboardStateProps) {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      // Scroll to top to show Coeur tab
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Optionally switch to Coeur tab
      const coeurTab = document.querySelector('[data-tab="twingame"]') as HTMLButtonElement;
      if (coeurTab) {
        coeurTab.click();
      }
    }
  };

  return (
    <DashboardEmptyStateBase
      mainIcon="Trophy"
      mainIconColor="#8B5CF6"
      glowColor="#A855F7"
      title="Rejoins le Classement TwinForge"
      subtitle="Commence à gagner des points et apparais dans le classement mondial des utilisateurs!"
      valueCards={[
        {
          icon: 'Zap',
          iconColor: '#8B5CF6',
          title: 'Classement Temps Réel',
          description: 'Le classement se met à jour automatiquement à chaque action'
        },
        {
          icon: 'Users',
          iconColor: '#3B82F6',
          title: 'Compétition Saine',
          description: 'Mesure-toi aux autres utilisateurs et motive-toi mutuellement'
        },
        {
          icon: 'Shield',
          iconColor: '#10B981',
          title: 'Anonymat Optionnel',
          description: 'Choisis d\'afficher ton nom ou de rester anonyme dans le classement'
        }
      ]}
      ctaText="Commence à gagner des points"
      ctaIcon="Sparkles"
      onCtaClick={handleCtaClick}
    />
  );
}
