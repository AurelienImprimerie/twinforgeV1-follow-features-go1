/**
 * Brain Status Indicator
 * Shows the status of the HEAD Brain system in the chat UI
 */

import React from 'react';
import { brainCore } from '../../../system/head';

export function BrainStatusIndicator() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [healthStatus, setHealthStatus] = React.useState<'healthy' | 'degraded' | 'down'>('down');

  React.useEffect(() => {
    const checkStatus = () => {
      const initialized = brainCore.isInitialized();
      setIsInitialized(initialized);

      if (initialized) {
        const health = brainCore.getHealthStatus();
        setHealthStatus(health.brain);
      }
    };

    // Check immediately
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isInitialized) {
    return (
      <div className="brain-status-indicator brain-status-loading" title="Brain system initializing...">
        <div className="brain-status-dot brain-status-dot-loading" />
        <span className="brain-status-text">Initialisation...</span>
      </div>
    );
  }

  if (healthStatus === 'down') {
    return (
      <div className="brain-status-indicator brain-status-error" title="Brain system error">
        <div className="brain-status-dot brain-status-dot-error" />
        <span className="brain-status-text">Erreur</span>
      </div>
    );
  }

  if (healthStatus === 'degraded') {
    return (
      <div className="brain-status-indicator brain-status-warning" title="Brain system degraded">
        <div className="brain-status-dot brain-status-dot-warning" />
        <span className="brain-status-text">Dégradé</span>
      </div>
    );
  }

  return (
    <div className="brain-status-indicator brain-status-ready" title="Brain system ready - AI connaît votre contexte">
      <div className="brain-status-dot brain-status-dot-ready" />
      <span className="brain-status-text">IA contextualisée</span>
    </div>
  );
}
