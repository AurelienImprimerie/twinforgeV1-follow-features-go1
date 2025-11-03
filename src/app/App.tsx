// src/app/App.tsx
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useMealPlanStore } from '../system/store/mealPlanStore';
import { useExitModalStore } from '../system/store/exitModalStore';
import { cancelMealPlanGeneration, cancelDetailedRecipeGeneration } from '../system/store/mealPlanStore/actions/generationActions';
import { usePWAUpdate } from '../hooks/usePWAUpdate';
import clsx from 'clsx';
import { useToast } from '../ui/components/ToastProvider';
import React, { Suspense, useEffect } from 'react';
import InstallPrompt from '../ui/components/InstallPrompt';
import UpdateNotification from '../ui/components/UpdateNotification';
import WelcomeTokensNotification from '../ui/components/WelcomeTokensNotification';
import { Outlet, useLocation } from 'react-router-dom';
import logger from '../lib/utils/logger';
import { useOverlayStore } from '../system/store/overlayStore';
import { useGlobalEscapeKey } from '../hooks/useGlobalEscapeKey';
import LoadingFallback from './components/LoadingFallback';
import { Header } from './shell/Header/Header';
import Sidebar from './shell/Sidebar';
import NewMobileBottomBar from './shell/NewMobileBottomBar';
import GlobalExitModal from '../ui/components/GlobalExitModal';
import CentralActionsMenu from './shell/CentralActionsMenu';
import FloatingChatButton from '../ui/components/chat/FloatingChatButton';
import GlobalChatDrawer from '../ui/components/chat/GlobalChatDrawer';

function AppContent() {
  const { isInstallable, isInstalled } = usePWAInstall();
  const { isUpdateAvailable, updateInfo, applyUpdate, dismissUpdate } = usePWAUpdate();
  const { showToast } = useToast();
  const location = useLocation();
  const { isAnyOpen, isOpen: checkIsOpen, close } = useOverlayStore();
  const isCentralMenuOpen = checkIsOpen('centralMenu');

  useGlobalEscapeKey();

  React.useEffect(() => {
    const anyOverlayOpen = isAnyOpen();
    if (anyOverlayOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalHeight = document.body.style.height;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      logger.debug('OVERLAY_BODY_LOCK', 'Body scroll locked', {
        anyOverlayOpen,
        timestamp: new Date().toISOString(),
      });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.height = originalHeight;
        logger.debug('OVERLAY_BODY_UNLOCK', 'Body scroll unlocked', {
          timestamp: new Date().toISOString(),
        });
      };
    }
  }, [isAnyOpen]);

  React.useEffect(() => {
    const scrollToTop = () => {
      try {
        // Scroll immédiat vers le haut - pas de smooth pour éviter les problèmes de timing
        document.documentElement.scrollTo(0, 0);
        window.scrollTo(0, 0);

        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.scrollTo(0, 0);

        const scrollableContainers = document.querySelectorAll('[data-scroll-container]');
        scrollableContainers.forEach((c) => {
          (c as HTMLElement).scrollTo(0, 0);
        });
      } catch (error) {
        logger.warn('APP_NAVIGATION', 'Scroll error', { error });
      }
    };

    // Scroll immédiat sans timeout pour assurer la visibilité du header
    scrollToTop();

    logger.debug('APP_NAVIGATION', 'Scroll to top on route change', {
      newPath: location.pathname,
      previousScrollY: window.scrollY,
      pwa: { isInstallable, isInstalled, isUpdateAvailable },
      timestamp: new Date().toISOString(),
    });
  }, [location.pathname]);
  const { isGenerating, isGeneratingDetailedRecipes, cancelDetailedRecipeGeneration: cancelDetailedRecipes } = useMealPlanStore();
  const { isOpen, showModal, hideModal } = useExitModalStore();

  const shouldApplyBodyScanClass =
    location.pathname.startsWith('/body-scan') || location.pathname.startsWith('/avatar');
  const shouldExpandWidth =
    location.pathname.startsWith('/body-scan') || location.pathname.startsWith('/avatar');

  // Block navigation during meal plan generation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGenerating || isGeneratingDetailedRecipes) {
        e.preventDefault();
        e.returnValue = '';
        showModal({
          title: isGenerating ? 'Génération de plan en cours' : 'Génération de recettes en cours',
          message: isGenerating 
            ? 'Votre plan alimentaire est en cours de génération. Êtes-vous sûr de vouloir quitter ?'
            : 'Les recettes détaillées sont en cours de génération. Êtes-vous sûr de vouloir quitter ?',
          processName: isGenerating ? 'Génération de Plan Alimentaire' : 'Génération de Recettes Détaillées',
          onConfirm: () => {
            if (isGenerating) {
              cancelMealPlanGeneration();
            }
            if (isGeneratingDetailedRecipes) {
              cancelDetailedRecipes();
            }
            hideModal();
            window.location.reload();
          },
          onCancel: hideModal
        });
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isGenerating || isGeneratingDetailedRecipes) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        showModal({
          title: isGenerating ? 'Génération de plan en cours' : 'Génération de recettes en cours',
          message: isGenerating 
            ? 'Votre plan alimentaire est en cours de génération. Êtes-vous sûr de vouloir quitter ?'
            : 'Les recettes détaillées sont en cours de génération. Êtes-vous sûr de vouloir quitter ?',
          processName: isGenerating ? 'Génération de Plan Alimentaire' : 'Génération de Recettes Détaillées',
          onConfirm: () => {
            if (isGenerating) {
              cancelMealPlanGeneration();
            }
            if (isGeneratingDetailedRecipes) {
              cancelDetailedRecipes();
            }
            hideModal();
            window.history.back();
          },
          onCancel: hideModal
        });
      }
    };

    if (isGenerating || isGeneratingDetailedRecipes) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Prevent back navigation
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isGenerating, isGeneratingDetailedRecipes, showModal, hideModal, cancelDetailedRecipes]);


  return (
    <div
      className="min-h-screen flex flex-col z-auto-important will-change-auto-important position-static-important transform-none-important filter-none-important perspective-none-important contain-none-important isolation-auto-important overflow-visible-important"
      style={{ position: 'relative', zIndex: 0 }}
    >
      <Header />

      {/* Parent flex : on autorise la contraction des enfants */}
      <div className="flex-1 flex min-w-0 position-static-important overflow-visible-important transform-none-important filter-none-important perspective-none-important contain-none-important isolation-auto-important z-auto-important">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-col lg:w-[240px] xl:w-[260px] shrink-0 ml-6 mr-3 pt-20">
          <Sidebar />
        </div>

        {/* MAIN — fix mobile: min-w-0 pour éviter le rognage à droite */}
        <main
          id="main-content"
          className={`flex-1 min-w-0 px-4 py-4 md:px-6 lg:px-6 xl:px-8 md:pb-4 pt-20 pb-32 ${
            shouldApplyBodyScanClass ? 'body-scan-page' : ''
          }`}
          style={{
            position: 'relative',
            overflow: 'visible',          // laisse passer les glows
            minHeight: '100dvh',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}
          role="main"
          aria-label="Contenu principal de l'application"
        >
          <div className={clsx('w-full min-w-0', { 'mx-auto': !shouldExpandWidth })}>
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {isInstallable && !isInstalled && (
        <InstallPrompt
          variant="floating"
          onInstallSuccess={() =>
            showToast({
              type: 'success',
              title: 'TwinForge installé !',
              message: "L'application est maintenant disponible sur votre écran d'accueil",
              duration: 4000,
            })
          }
        />
      )}

      <UpdateNotification
        isVisible={isUpdateAvailable}
        onUpdate={async () => {
          try {
            await applyUpdate();
            showToast({
              type: 'success',
              title: 'Mise à jour appliquée',
              message: 'TwinForge redémarre avec la nouvelle version',
              duration: 4000,
            });
          } catch (error) {
            logger.error('PWA_UPDATE', 'Failed to apply update', {
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
            });
            showToast({
              type: 'error',
              title: 'Erreur de mise à jour',
              message: "Impossible d'appliquer la mise à jour. Réessayez plus tard.",
              duration: 4000,
            });
          }
        }}
        onDismiss={dismissUpdate}
        updateInfo={updateInfo}
      />

      <NewMobileBottomBar />
      <GlobalExitModal />

      {/* Welcome Tokens Notification - Shows to new users after account creation */}
      <WelcomeTokensNotification />

      {/* Central Actions Menu - Accessible depuis mobile (via bottom bar) et desktop (via header) */}
      <CentralActionsMenu
        isOpen={isCentralMenuOpen}
        onClose={close}
      />

      {/* Floating Chat Button - Accessible from anywhere */}
      <FloatingChatButton />

      {/* Global Chat Drawer - Unified Coach Interface with Realtime */}
      <GlobalChatDrawer />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}