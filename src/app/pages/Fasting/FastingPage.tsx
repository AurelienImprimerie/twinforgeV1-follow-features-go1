import React, { lazy, Suspense } from 'react';
import { useLocation, useBlocker } from 'react-router-dom';
import { Tabs, useTabsKeyboard } from '../../../ui/tabs';
import { useScrollMemory } from '../../../hooks/scroll/useScrollMemory';
import FastingDailyTab from './components/Tabs/FastingDailyTab';
import FastingHistoryTab from './components/Tabs/FastingHistoryTab';
import { useFeedback } from '../../../hooks/useFeedback';
import logger from '../../../lib/utils/logger';
import PageHeader from '../../../ui/page/PageHeader';
import ConfirmationModal from '../../../ui/components/ConfirmationModal';
import LoadingFallback from '../../components/LoadingFallback';

// Lazy load heavy tabs with Recharts - only loaded when user visits these tabs
const FastingInsightsTab = lazy(() => import('./components/Tabs/FastingInsightsTab'));
const FastingProgressionTab = lazy(() => import('./components/Tabs/FastingProgressionTab'));

/**
 * Get dynamic header content based on active tab
 */
function getTabHeaderContent(activeTab: string) {
  switch (activeTab) {
    case 'daily':
      return {
        icon: 'Timer' as const,
        title: 'Tracker',
        subtitle: 'Suivez vos sessions de jeûne quotidiennes',
        circuit: 'fasting' as const,
        color: '#F59E0B',
      };
    case 'insights':
      return {
        icon: 'TrendingUp' as const,
        title: 'Insights',
        subtitle: 'Analyses de vos patterns de jeûne',
        circuit: 'fasting' as const,
        color: '#10B981',
      };
    case 'progression':
      return {
        icon: 'BarChart3' as const,
        title: 'Progression',
        subtitle: 'Évolution de votre pratique du jeûne',
        circuit: 'fasting' as const,
        color: '#06B6D4',
      };
    case 'history':
      return {
        icon: 'History' as const,
        title: 'Historique',
        subtitle: 'Toutes vos sessions enregistrées',
        circuit: 'fasting' as const,
        color: '#8B5CF6',
      };
    default:
      return {
        icon: 'Timer' as const,
        title: 'Jeûne Intermittent',
        subtitle: 'Suivez et optimisez vos sessions de jeûne',
        circuit: 'fasting' as const,
        color: '#F59E0B',
      };
  }
}

/**
 * Fasting Page - Page Principale du Jeûne TwinForge
 * Structure en onglets pour suivre et analyser les sessions de jeûne
 */
const FastingPage: React.FC = () => {
  const location = useLocation();
  const { click } = useFeedback();

  // State for AI generation protection
  const [isAIGenerationLoading, setIsAIGenerationLoading] = React.useState(false);
  const [showAIGenerationExitConfirmation, setShowAIGenerationExitConfirmation] = React.useState(false);
  const [pendingAIGenerationNavigation, setPendingAIGenerationNavigation] = React.useState<(() => void) | null>(null);

  // Derive activeTab from URL hash, fallback to 'daily'
  const activeTab = React.useMemo(() => {
    const hash = location.hash.replace('#', '');
    return hash && ['daily', 'insights', 'progression', 'history'].includes(hash) ? hash : 'daily';
  }, [location.hash]);

  // Block navigation when AI generation is active
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      // Don't block if staying within the same route (tab changes)
      if (currentLocation.pathname === nextLocation.pathname) {
        return false;
      }

      // Block if AI generation is active
      return isAIGenerationLoading;
    }
  );

  // Handle blocked navigation
  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      logger.info('FASTING_PAGE_AI_EXIT', 'Navigation blocked - AI generation in progress', {
        activeTab,
        isAIGenerationLoading,
        timestamp: new Date().toISOString()
      });

      // Store the navigation in pending
      setPendingAIGenerationNavigation(() => () => {
        blocker.proceed();
      });

      // Show confirmation modal
      setShowAIGenerationExitConfirmation(true);
    }
  }, [blocker.state, activeTab, isAIGenerationLoading]);

  // Enable keyboard navigation for tabs
  useTabsKeyboard();

  // Mémoriser la position de scroll pour chaque onglet
  useScrollMemory(`fasting:${activeTab}`);

  // Get dynamic header content based on active tab
  const headerContent = getTabHeaderContent(activeTab);

  // Handle AI generation loading state changes
  const handleAIGenerationLoadingChange = React.useCallback((isLoading: boolean) => {
    setIsAIGenerationLoading(isLoading);

    logger.debug('FASTING_PAGE_AI_LOADING', 'AI generation loading state changed', {
      activeTab,
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [activeTab]);

  // Handle stopping AI generation and exiting
  const handleStopAIGenerationAndExit = () => {
    logger.info('FASTING_PAGE_AI_EXIT', 'User chose to stop AI generation and exit', {
      activeTab,
      timestamp: new Date().toISOString()
    });

    // Reset AI generation state
    setIsAIGenerationLoading(false);
    setShowAIGenerationExitConfirmation(false);

    // Proceed with navigation
    if (pendingAIGenerationNavigation) {
      pendingAIGenerationNavigation();
      setPendingAIGenerationNavigation(null);
    }
  };

  // Handle canceling exit and continuing AI generation
  const handleCancelAIGenerationExit = () => {
    logger.info('FASTING_PAGE_AI_EXIT', 'User chose to continue AI generation', {
      activeTab,
      timestamp: new Date().toISOString()
    });

    setShowAIGenerationExitConfirmation(false);
    setPendingAIGenerationNavigation(null);

    // Reset blocker
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const handleTabChange = (value: string) => {
    click();

    logger.debug('FASTING_PAGE', 'Tab change triggered', { newTab: value });
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        icon={headerContent.icon}
        title={headerContent.title}
        subtitle={headerContent.subtitle}
        circuit={headerContent.circuit}
        iconColor={headerContent.color}
      />

      <Tabs
        defaultValue={activeTab}
        className="w-full min-w-0 fasting-tabs"
        onValueChange={handleTabChange}
        forgeContext="fasting"
      >
        <Tabs.List role="tablist" aria-label="Sections du jeûne" className="mb-6 w-full">
          <Tabs.Trigger value="daily" icon="Calendar">
            <span className="tab-text">Tracker</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="insights" icon="TrendingUp">
            <span className="tab-text">Insights</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="progression" icon="BarChart3">
            <span className="tab-text">Progression</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="history" icon="History">
            <span className="tab-text">Historique</span>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Panel value="daily">
          <FastingDailyTab onLoadingChange={handleAIGenerationLoadingChange} />
        </Tabs.Panel>

        <Tabs.Panel value="insights">
          <Suspense fallback={<LoadingFallback />}>
            <FastingInsightsTab onLoadingChange={handleAIGenerationLoadingChange} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="progression">
          <Suspense fallback={<LoadingFallback />}>
            <FastingProgressionTab onLoadingChange={handleAIGenerationLoadingChange} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="history">
          <FastingHistoryTab />
        </Tabs.Panel>
      </Tabs>

      {/* AI Generation Exit Confirmation Modal */}
      {showAIGenerationExitConfirmation && (
        <ConfirmationModal
          isOpen={showAIGenerationExitConfirmation}
          title="Analyse IA en cours"
          message="Une analyse IA est en cours de génération. Êtes-vous sûr de vouloir quitter ?"
          confirmLabel="Quitter"
          cancelLabel="Continuer l'analyse"
          onConfirm={handleStopAIGenerationAndExit}
          onCancel={handleCancelAIGenerationExit}
        />
      )}
    </div>
  );
};

export default FastingPage;
