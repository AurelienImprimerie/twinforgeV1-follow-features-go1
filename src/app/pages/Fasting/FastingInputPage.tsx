import React, { useState, useRef, useEffect } from 'react';
import { useFastingPipelineWithActions, useFastingElapsedSeconds, useFastingProgressPercentage, useFastingTimerTick } from './hooks/useFastingPipeline';
import {
  FastingProgressHeader,
  FastingMetabolicPhasesCard,
  FastingTipsCard,
  FastingProtocolInfoCard,
  FastingSetupStage,
  FastingActiveStage,
  FastingCompletionStage
} from './components';
import { useUserStore } from '../../../system/store/userStore';
import { formatElapsedTime, formatElapsedTimeMinutes } from './utils/fastingUtils';
import logger from '../../../lib/utils/logger';

/**
 * Fasting Input Page - Pipeline de Démarrage/Arrêt du Jeûne TwinForge
 * Page dédiée au contrôle en temps réel des sessions de jeûne intermittent
 */
const FastingInputPage: React.FC = () => {
  const fastingStore = useFastingPipelineWithActions();
  const { currentStep, isActive, session, steps, actions } = fastingStore;
  const { profile, session: userSession } = useUserStore();

  // Enable real-time timer updates
  useFastingTimerTick();

  // Use dynamic selectors for real-time updates
  const elapsedSeconds = useFastingElapsedSeconds();
  const progressPercentage = useFastingProgressPercentage();
  
  // États pour la configuration du jeûne
  const [targetHours, setTargetHours] = useState(() => {
    // Initialize with session target if active, otherwise default to 16
    return session?.targetHours || 16;
  });
  
  // Défilement automatique fluide lors des changements d'étape
  useEffect(() => {
    const scrollToTop = () => {
      // Défilement vers le haut de la page (niveau du header dynamique)
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
      
      // Défilement du conteneur principal si nécessaire
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
      
      // Défilement des conteneurs avec scroll personnalisé
      const scrollableContainers = document.querySelectorAll('[data-scroll-container]');
      scrollableContainers.forEach((container) => {
        (container as HTMLElement).scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      });
    };
    
    // Délai court pour permettre au DOM de se mettre à jour avant le défilement
    const scrollTimer = setTimeout(scrollToTop, 150);
    
    logger.debug('FASTING_INPUT_PAGE', 'Auto-scroll triggered on step change', {
      currentStep,
      timestamp: new Date().toISOString()
    });
    
    return () => clearTimeout(scrollTimer);
  }, [currentStep]);

  // Démarrer le jeûne
  const handleStartFasting = () => {
    const protocolName = `${targetHours}:${24 - targetHours}`;
    actions.startFasting(targetHours, protocolName);
  };

  // Arrêter le jeûne
  const handleStopFasting = () => {
    actions.stopFasting();
  };

  // Rendu conditionnel basé sur l'étape de la pipeline
  const renderStageContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <FastingSetupStage
            targetHours={targetHours}
            setTargetHours={setTargetHours}
            onStartFasting={handleStartFasting}
          />
        );

      case 'active':
        return (
          <div className="space-y-6">
            <FastingActiveStage
              session={session}
              elapsedSeconds={elapsedSeconds}
              progressPercentage={progressPercentage}
              targetHours={targetHours}
              onStopFasting={handleStopFasting}
              formatElapsedTime={formatElapsedTime}
            />
            
            {/* Phases Métaboliques - Nouveau Composant */}
            <FastingMetabolicPhasesCard 
              elapsedSeconds={elapsedSeconds}
              targetHours={session?.targetHours || targetHours}
              userWeight={profile?.weight_kg}
            />
            
            {/* Conseils de Jeûne - Composant Séparé */}
            <FastingTipsCard />
          </div>
        );

      case 'completion':
        return (
          <FastingCompletionStage
            session={session}
            targetHours={targetHours}
            onSaveFastingSession={actions.saveFastingSession}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Fasting Progress Header - Visible dès l'étape 1 */}
      <FastingProgressHeader
        isActive={true}
        currentStep={currentStep}
        overallProgress={progressPercentage}
        message={
          currentStep === 'setup' ? 'Configuration Temporelle' :
          currentStep === 'active' ? 'Session de Jeûne Active' :
          'Forge du Temps Accomplie'
        }
        subMessage={
          currentStep === 'setup' ? 'Sélectionnez votre protocole et démarrez votre session de jeûne' :
          currentStep === 'active' ? 'Votre jeûne progresse selon le protocole sélectionné' :
          'Votre session de jeûne a été complétée avec succès'
        }
        steps={steps}
        elapsedTime={currentStep === 'active' ? formatElapsedTime(elapsedSeconds) : undefined}
        targetHours={session?.targetHours || targetHours}
        elapsedSeconds={elapsedSeconds}
      />
      
      <div className="fasting-stage-container">
        {renderStageContent()}
      </div>
      
      {/* Informations sur le Protocole - Affiché uniquement en mode setup */}
      {currentStep === 'setup' && (
        <div className="mt-6">
          <FastingProtocolInfoCard targetHours={targetHours} />
        </div>
      )}
    </div>
  );
};

export default FastingInputPage;