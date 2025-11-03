// src/app/pages/Avatar/AvatarPage.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs } from '../../../ui/tabs';
import { useScrollMemory } from '../../../hooks/scroll/useScrollMemory';
import { useFeedback } from '../../../hooks/useFeedback';
import PageHeader from '../../../ui/page/PageHeader';
import AvatarTab from './tabs/AvatarTab';
import InsightsTab from './tabs/InsightsTab';
import HistoryTab from './tabs/HistoryTab';
import ScanCTA from './tabs/ScanCTA';
import logger from '../../../lib/utils/logger';

type TabKey = 'scanCta' | 'avatar' | 'insights' | 'history';

/**
 * Récupère le contenu dynamique de l'en-tête en fonction de l'onglet actif.
 * Cela inclut l'icône, le titre, le sous-titre, le circuit et la couleur.
 */
function getTabHeaderContent(activeTab: TabKey) {
  switch (activeTab) {
    case 'scanCta':
      return {
        icon: 'Scan' as const,
        title: 'Forge Corporelle',
        subtitle: 'Capturez votre évolution corporelle avec un nouveau scan 3D',
        circuit: 'avatar' as const,
        color: '#8B5CF6',
      };
    case 'avatar':
      return {
        icon: 'Eye' as const,
        title: 'Votre Avatar 3D',
        subtitle: 'Visualisez et ajustez votre reflet numérique personnalisé',
        circuit: 'avatar' as const,
        color: '#06B6D4',
      };
    case 'insights':
      return {
        icon: 'Zap' as const,
        title: 'Insights Avatar',
        subtitle:
          'Analyses IA personnalisées et recommandations basées sur votre scan corporel',
        circuit: 'avatar' as const,
        color: '#F59E0B',
      };
    case 'history':
      return {
        icon: 'History' as const,
        title: 'Historique des Scans',
        subtitle: 'Revivez vos transformations corporelles au fil du temps',
        circuit: 'avatar' as const,
        color: '#8B5CF6',
      };
    default:
      return {
        icon: 'Eye' as const,
        title: 'Votre Avatar 3D',
        subtitle: 'Visualisez et ajustez votre reflet numérique personnalisé',
        circuit: 'avatar' as const,
        color: '#8B5CF6',
      };
  }
}

/**
 * Page principale de l'Avatar.
 * Gère la navigation par onglets (Avatar, Insights, Historique)
 * et assure que les composants s'affichent en pleine largeur.
 */
const AvatarPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { click } = useFeedback();

  const activeTab = React.useMemo<TabKey>(() => {
    const hash = location.hash.replace('#', '');
    return (['scanCta', 'avatar', 'insights', 'history'] as TabKey[]).includes(hash as TabKey)
      ? (hash as TabKey)
      : 'scanCta';
  }, [location.hash]);

  useScrollMemory(`avatar:${activeTab}`);

  const headerContent = getTabHeaderContent(activeTab);

  const handleTabChange = (value: string) => {
    const nextTab = (value || 'scanCta') as TabKey;
    click();
    logger.debug('AVATAR_PAGE', 'Changement d\'onglet déclenché', { nouvelOnglet: nextTab });

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: `#${nextTab}`,
      },
      { replace: false }
    );
  };

  return (
    <div className="space-y-6 w-full max-w-none forge-body-page-container">
      <PageHeader
        icon={headerContent.icon}
        title={headerContent.title}
        subtitle={headerContent.subtitle}
        circuit={headerContent.circuit}
        iconColor={headerContent.color}
      />

      <Tabs
        defaultValue="scanCta"
        className="w-full min-w-0 avatar-tabs"
        onValueChange={handleTabChange}
        forgeContext="avatar"
      >
        <Tabs.List
          role="tablist"
          aria-label="Sections de l'avatar"
          className="mb-4 md:mb-6 w-full"
        >
          <Tabs.Trigger value="scanCta" icon="Scan" aria-controls="panel-scancta">
            <span className="tab-text">Scanner</span>
          </Tabs.Trigger>

          <Tabs.Trigger value="avatar" icon="Eye" aria-controls="panel-avatar">
            <span className="tab-text">Avatar</span>
          </Tabs.Trigger>

          <Tabs.Trigger value="insights" icon="Zap" aria-controls="panel-insights">
            <span className="tab-text">Insights</span>
          </Tabs.Trigger>

          <Tabs.Trigger value="history" icon="History" aria-controls="panel-history">
            <span className="tab-text">Historique</span>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Panel id="panel-scancta" value="scanCta">
          <ScanCTA />
        </Tabs.Panel>

        <Tabs.Panel id="panel-avatar" value="avatar">
          <AvatarTab />
        </Tabs.Panel>

        <Tabs.Panel id="panel-insights" value="insights">
          <InsightsTab />
        </Tabs.Panel>

        <Tabs.Panel id="panel-history" value="history">
          <HistoryTab />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default AvatarPage;
