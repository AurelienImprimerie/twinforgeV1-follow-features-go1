import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../../ui/tabs/TabsComponent';
import { ICONS } from '../../ui/icons/registry';
import { useScrollMemory } from '../../hooks/scroll/useScrollMemory';
import ActivityDailyTab from './Activity/ActivityDailyTab';
import ActivityHistoryTab from './Activity/ActivityHistoryTab';
import { useFeedback } from '../../hooks/useFeedback';
import logger from '../../lib/utils/logger';
import PageHeader from '../../ui/page/PageHeader';
import LoadingFallback from '../components/LoadingFallback';
import './Activity/styles/index.css';

// Lazy load heavy tabs with Recharts (323KB) - only loaded when user visits these tabs
const ActivityInsightsTab = lazy(() => import('./Activity/ActivityInsightsTab'));
const ActivityProgressTab = lazy(() => import('./Activity/ActivityProgressTab'));

/**
 * Get dynamic header content based on active tab
 */
function getTabHeaderContent(activeTab: string) {
  switch (activeTab) {
    case 'daily':
      return {
        icon: 'Activity' as const,
        title: 'Tracker',
        subtitle: 'Suivez votre activité physique quotidienne',
        circuit: 'activity' as const,
        color: '#3B82F6',
      };
    case 'insights':
      return {
        icon: 'BarChart3' as const,
        title: 'Insights',
        subtitle: 'Analyses avancées de vos performances',
        circuit: 'activity' as const,
        color: '#F59E0B',
      };
    case 'progression':
      return {
        icon: 'TrendingUp' as const,
        title: 'Progression',
        subtitle: 'Évolution de vos performances physiques',
        circuit: 'activity' as const,
        color: '#10B981',
      };
    case 'history':
      return {
        icon: 'History' as const,
        title: 'Historique',
        subtitle: 'Toutes vos séances et activités enregistrées',
        circuit: 'activity' as const,
        color: '#8B5CF6',
      };
    default:
      return {
        icon: 'Activity' as const,
        title: 'Activité Physique',
        subtitle: 'Suivez et analysez vos performances',
        circuit: 'activity' as const,
        color: '#3B82F6',
      };
  }
}

/**
 * Activity Page - Forge Énergétique TwinForge
 * Page principale avec 4 onglets pour le suivi d'activité
 */
const ActivityPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showFeedback } = useFeedback();

  // Derive activeTab from URL hash, fallback to 'daily'
  const activeTab = React.useMemo(() => {
    const hash = location.hash.replace('#', '');
    const decodedHash = hash ? decodeURIComponent(hash) : '';
    return decodedHash || 'daily';
  }, [location.hash]);

  const headerContent = getTabHeaderContent(activeTab);

  const handleTabChange = (value: string) => {
    logger.info('Activity tab changed', { tab: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6"
    >
      <PageHeader
        icon={headerContent.icon}
        title={headerContent.title}
        subtitle={headerContent.subtitle}
        circuit={headerContent.circuit}
        iconColor={headerContent.color}
      />

      <Tabs defaultValue="daily" className="w-full" onValueChange={handleTabChange} forgeContext="activity">
        <Tabs.List>
          <Tabs.Trigger value="daily" icon="Activity">Tracker</Tabs.Trigger>
          <Tabs.Trigger value="insights" icon="BarChart3">Insights</Tabs.Trigger>
          <Tabs.Trigger value="progression" icon="TrendingUp">Progression</Tabs.Trigger>
          <Tabs.Trigger value="history" icon="History">Historique</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Panel value="daily" className="mt-6">
          <ActivityDailyTab />
        </Tabs.Panel>

        <Tabs.Panel value="insights" className="mt-6">
          <Suspense fallback={<LoadingFallback />}>
            <ActivityInsightsTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="progression" className="mt-6">
          <Suspense fallback={<LoadingFallback />}>
            <ActivityProgressTab />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="history" className="mt-6">
          <ActivityHistoryTab />
        </Tabs.Panel>
      </Tabs>
    </motion.div>
  )
};

export default ActivityPage;