import React, { lazy, Suspense } from 'react';
import { useLocation, useNavigate, useBlocker } from 'react-router-dom';
import { Tabs, useTabsKeyboard } from '../../../ui/tabs';
import { ICONS } from '../../../ui/icons/registry';
import { useScrollMemory } from '../../../hooks/scroll/useScrollMemory';
import DailyRecapTab from './DailyRecapTab';
import MealHistoryTab from './MealHistoryTab';
import { useFeedback } from '../../../hooks/useFeedback';
import logger from '../../../lib/utils/logger';
import PageHeader from '../../../ui/page/PageHeader';
import ScanExitConfirmationModal from './components/MealScanFlow/ScanExitConfirmationModal';
import Portal from '../../../ui/components/Portal';
import LoadingFallback from '../../components/LoadingFallback';

// Lazy load heavy tabs with Recharts - only loaded when user visits these tabs
const MealInsightsTab = lazy(() => import('./MealInsightsTab'));
const ProgressionTab = lazy(() => import('./ProgressionTab'));

/**
 * Get dynamic header content based on active tab
 */
function getTabHeaderContent(activeTab: string) {
  switch (activeTab) {
    case 'daily':
      return {
        icon: 'Calendar' as const,
        title: 'Scanner',
        subtitle: 'Scannez et analysez vos repas quotidiens',
        circuit: 'meals' as const,
        color: '#10B981',
      };
    case 'insights':
      return {
        icon: 'TrendingUp' as const,
        title: 'Insights',
        subtitle: 'Analyses nutritionnelles personnalisées',
        circuit: 'meals' as const,
        color: '#F59E0B',
      };
    case 'progression':
      return {
        icon: 'BarChart3' as const,
        title: 'Progression',
        subtitle: 'Évolution de votre alimentation',
        circuit: 'meals' as const,
        color: '#06B6D4',
      };
    case 'history':
      return {
        icon: 'History' as const,
        title: 'Historique',
        subtitle: 'Tous vos repas enregistrés',
        circuit: 'meals' as const,
        color: '#8B5CF6',
      };
    default:
      return {
        icon: 'Utensils' as const,
        title: 'Nutrition',
        subtitle: 'Scannez et analysez vos repas',
        circuit: 'meals' as const,
        color: '#10B981',
      };
  }
}

/**
 * Meals Page - Page Principale des Repas TwinForge
 * Structure en onglets inspirée du Body Scan avec adaptation nutritionnelle
 */
const MealsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      logger.info('MEALS_PAGE_AI_EXIT', 'Navigation blocked - AI generation in progress', {
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
  useScrollMemory(`meals:${activeTab}`);

  // Get dynamic header content based on active tab
  const headerContent = getTabHeaderContent(activeTab);

  // Handle AI generation loading state changes
  const handleAIGenerationLoadingChange = React.useCallback((isLoading: boolean) => {
    setIsAIGenerationLoading(isLoading);
    
    logger.debug('MEALS_PAGE_AI_LOADING', 'AI generation loading state changed', {
      activeTab,
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [activeTab]);
  
  // Handle stopping AI generation and exiting
  const handleStopAIGenerationAndExit = () => {
    logger.info('MEALS_PAGE_AI_EXIT', 'User chose to stop AI generation and exit', {
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
    logger.info('MEALS_PAGE_AI_EXIT', 'User chose to continue AI generation', {
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
    
    logger.debug('MEALS_PAGE', 'Tab change triggered', { newTab: value });
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
        defaultValue="daily"
        className="w-full min-w-0 meals-tabs"
        onValueChange={handleTabChange}
        forgeContext="meals"
      >
        <Tabs.List role="tablist" aria-label="Sections des repas" className="mb-6 w-full">
          <Tabs.Trigger value="daily" icon="Calendar">
            <span className="tab-text">Scanner</span>
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
          <DailyRecapTab onLoadingChange={handleAIGenerationLoadingChange} />
        </Tabs.Panel>
        
        <Tabs.Panel value="insights">
          <Suspense fallback={<LoadingFallback />}>
            <MealInsightsTab onLoadingChange={handleAIGenerationLoadingChange} />
          </Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="progression">
          <Suspense fallback={<LoadingFallback />}>
            <ProgressionTab />
          </Suspense>
        </Tabs.Panel>
        
        <Tabs.Panel value="history">
          <MealHistoryTab />
        </Tabs.Panel>
      </Tabs>
      
      {/* AI Generation Exit Confirmation Modal */}
      <Portal>
        <ScanExitConfirmationModal
          isOpen={showAIGenerationExitConfirmation}
          onSaveAndExit={handleStopAIGenerationAndExit}
          onDiscardAndExit={handleStopAIGenerationAndExit}
          onCancel={handleCancelAIGenerationExit}
          hasResults={false}
          isProcessing={isAIGenerationLoading}
          capturedPhoto={null}
        />
      </Portal>
    </div>
  );
};

export default MealsPage;