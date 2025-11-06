/**
 * BrainInitializer Component
 * Initializes the HEAD Brain system and provides status feedback
 */

import React from 'react';
import { useBrainInitialization } from '../../hooks';
import logger from '../../lib/utils/logger';

interface BrainInitializerProps {
  children: React.ReactNode;
}

export function BrainInitializer({ children }: BrainInitializerProps) {
  const { initialized, initializing, error, healthStatus, retryCount } = useBrainInitialization();

  // Log status changes
  React.useEffect(() => {
    if (initialized && healthStatus) {
      logger.info('BRAIN_INITIALIZER', 'Brain system ready', {
        healthStatus,
        timestamp: new Date().toISOString(),
      });
    }
  }, [initialized, healthStatus]);

  React.useEffect(() => {
    if (error) {
      logger.error('BRAIN_INITIALIZER', 'Brain initialization error', {
        error: error.message,
        retryCount,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error, retryCount]);

  // Show loading state during initialization
  if (initializing && retryCount === 0) {
    return (
      <div className="brain-initializing-screen">
        <div className="brain-loading-container">
          <div className="brain-loading-spinner" />
          <p className="brain-loading-text">Initialisation du système...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed after all retries
  if (error && retryCount >= 3) {
    return (
      <div className="brain-error-screen">
        <div className="brain-error-container">
          <div className="brain-error-icon">⚠️</div>
          <h2 className="brain-error-title">Erreur d'initialisation</h2>
          <p className="brain-error-message">
            Le système n'a pas pu s'initialiser correctement. Veuillez rafraîchir la page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="brain-error-button"
          >
            Rafraîchir
          </button>
        </div>
      </div>
    );
  }

  // Render children once initialized or if error is retriable
  return <>{children}</>;
}
