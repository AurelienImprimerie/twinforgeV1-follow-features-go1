/**
 * Connected Devices Tab - Appareils Connectés
 * Manage wearable device connections and synchronization
 * VisionOS Premium Design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../ui/icons/registry';
import { useUserStore } from '../../../system/store/userStore';
import { useWearableSync } from '../../../hooks/useWearableSync';
import { PROVIDER_CONFIGS, MVP_PROVIDERS } from '../../../domain/connectedDevices';
import type { ConnectedDevice, Provider } from '../../../domain/connectedDevices';
import logger from '../../../lib/utils/logger';
import WearableConnectionStatus from '../../../ui/components/wearable/WearableConnectionStatus';
import { supabase } from '../../../system/supabase/client';
import '../../../styles/components/profile/connected-devices.css';

const ConnectedDevicesTab: React.FC = () => {
  const { user } = useUserStore();
  const {
    devices,
    loading,
    syncing,
    refreshDevices,
    syncDevice,
    disconnectDevice,
  } = useWearableSync(user?.id || null);

  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const handleToggleSimulator = () => {
    const newState = !showSimulator;
    logger.info('[CONNECTED_DEVICES] Toggle simulation mode', {
      previousState: showSimulator,
      newState,
      userId: user?.id,
    });
    setShowSimulator(newState);
  };

  const handleConnectDevice = async (provider: Provider) => {
    logger.info('[CONNECTED_DEVICES] Connect device initiated', {
      provider,
      showSimulator,
      userId: user?.id,
    });

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      logger.error('[CONNECTED_DEVICES] Provider config not found', { provider });
      alert('Configuration du provider introuvable');
      return;
    }

    if (showSimulator) {
      logger.info('[CONNECTED_DEVICES] Simulation mode active - showing success alert', {
        provider,
        providerName: config.name,
      });
      alert(`Mode Simulation: Connexion à ${config.name} simulée avec succès!`);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectUri = `${supabaseUrl}/functions/v1/wearable-oauth-callback?provider=${provider}`;

    try {
      logger.info('[CONNECTED_DEVICES] Creating OAuth flow in database', {
        provider,
        redirectUri,
      });

      // Call RPC function to create auth flow and get state
      const { data: flowData, error: flowError } = await supabase.rpc(
        'create_device_auth_flow',
        {
          p_provider: provider,
          p_redirect_uri: redirectUri,
        }
      );

      if (flowError) {
        logger.error('[CONNECTED_DEVICES] Failed to create auth flow', {
          provider,
          error: flowError,
        });
        alert('Erreur lors de l\'initialisation de la connexion. Veuillez réessayer.');
        return;
      }

      const state = flowData.state;
      const expiresAt = flowData.expires_at;

      logger.info('[CONNECTED_DEVICES] Auth flow created successfully', {
        provider,
        state,
        expiresAt,
      });

      // Build OAuth URL with the state from database
      const authUrl = new URL(config.authUrl);
      authUrl.searchParams.set('response_type', 'code');

      const clientId = provider === 'google_fit'
        ? import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
        : 'YOUR_CLIENT_ID';

      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('scope', config.scopes.join(' '));

      if (provider === 'google_fit') {
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
      }

      logger.info('[CONNECTED_DEVICES] Redirecting to OAuth provider', {
        provider,
        authUrl: authUrl.toString(),
      });

      window.location.href = authUrl.toString();
    } catch (error) {
      logger.error('[CONNECTED_DEVICES] Unexpected error during OAuth initialization', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    }
  };

  const handleSync = async (deviceId: string) => {
    logger.info('[CONNECTED_DEVICES] Sync initiated', { deviceId, userId: user?.id });
    try {
      await syncDevice(deviceId);
      logger.info('[CONNECTED_DEVICES] Sync successful', { deviceId });
      alert('Synchronisation réussie!');
    } catch (error) {
      logger.error('[CONNECTED_DEVICES] Sync failed', {
        deviceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert(`Erreur: ${error instanceof Error ? error.message : 'Synchronisation échouée'}`);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    logger.info('[CONNECTED_DEVICES] Disconnect initiated', { deviceId, userId: user?.id });
    if (!confirm('Voulez-vous vraiment déconnecter cet appareil?')) {
      logger.info('[CONNECTED_DEVICES] Disconnect cancelled by user', { deviceId });
      return;
    }

    try {
      await disconnectDevice(deviceId);
      logger.info('[CONNECTED_DEVICES] Disconnect successful', { deviceId });
    } catch (error) {
      logger.error('[CONNECTED_DEVICES] Disconnect failed', {
        deviceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert(`Erreur: ${error instanceof Error ? error.message : 'Déconnexion échouée'}`);
    }
  };

  const getStatusBadge = (status: ConnectedDevice['status']) => {
    const badges = {
      connected: 'Connecté',
      syncing: 'Synchronisation...',
      error: 'Erreur',
      disconnected: 'Déconnecté',
      pending_auth: 'En attente',
      token_expired: 'Expiré',
    };

    return badges[status];
  };

  const isDevelopment = import.meta.env.MODE === 'development';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {isDevelopment && (
        <div className="devices-header" style={{ marginBottom: '2rem' }}>
          <button
            onClick={handleToggleSimulator}
            className={`simulation-toggle ${showSimulator ? 'active' : ''}`}
            style={{ marginLeft: 'auto' }}
          >
            <div className="simulation-toggle-content">
              <SpatialIcon Icon={ICONS.Wrench} size={18} />
              <span>{showSimulator ? 'Mode Simulation ON' : 'Mode Dev'}</span>
            </div>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="simulation-alert"
          >
            <div className="simulation-alert-content">
              <div className="simulation-alert-icon">
                <SpatialIcon Icon={ICONS.AlertCircle} size={22} color="#F59E0B" />
              </div>
              <div className="simulation-alert-text">
                <h4>Mode Simulation Activé</h4>
                <p>Les connexions aux appareils sont simulées. Idéal pour tester sans montres réelles.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginBottom: '2rem' }}>
        <WearableConnectionStatus variant="detailed" showSyncButton={true} />
      </div>

      {loading ? (
        <div className="devices-loading">
          <div className="devices-loading-spinner">
            <SpatialIcon Icon={ICONS.Loader2} size={36} color="#18E3FF" />
          </div>
          <p className="devices-loading-text">Chargement des appareils...</p>
        </div>
      ) : (
        <>
          {devices.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 className="providers-section-title">
                Mes Appareils ({devices.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {devices.map((device) => {
                  const config = PROVIDER_CONFIGS[device.provider];
                  const isExpanded = expandedDevice === device.id;

                  return (
                    <motion.div
                      key={device.id}
                      className="device-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="device-card-main">
                        <div className="device-card-info">
                          <div
                            className="device-icon-wrapper"
                            style={{
                              background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}30 100%)`,
                            }}
                          >
                            <SpatialIcon Icon={ICONS[config.icon]} size={28} color={config.color} />
                          </div>

                          <div className="device-details">
                            <h4>{device.displayName || config.name}</h4>
                            <div className="device-meta">
                              <span className={`status-badge ${device.status}`}>
                                {getStatusBadge(device.status)}
                              </span>
                              {device.lastSyncAt && (
                                <span className="device-last-sync">
                                  Dernière synchro: {new Date(device.lastSyncAt).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="device-actions">
                          <button
                            onClick={() => handleSync(device.id)}
                            disabled={syncing || device.status === 'disconnected'}
                            className="device-action-btn"
                            title="Synchroniser maintenant"
                          >
                            <SpatialIcon
                              Icon={ICONS.RefreshCw}
                              size={20}
                              className={syncing ? 'animate-spin' : ''}
                            />
                          </button>

                          <button
                            onClick={() => setExpandedDevice(isExpanded ? null : device.id)}
                            className="device-action-btn"
                            title={isExpanded ? 'Réduire' : 'Développer'}
                          >
                            <SpatialIcon
                              Icon={isExpanded ? ICONS.ChevronUp : ICONS.ChevronDown}
                              size={20}
                            />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="device-expanded"
                          >
                            <div className="device-stats-grid">
                              <div className="device-stat-item">
                                <h5>Types de données</h5>
                                <div className="data-types-chips">
                                  {config.dataTypes.slice(0, 5).map((type) => (
                                    <span key={type} className="data-type-chip">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="device-stat-item">
                                <h5>Connexion</h5>
                                <p className="device-stat-value">
                                  {new Date(device.connectedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDisconnect(device.id)}
                              className="disconnect-btn"
                            >
                              <SpatialIcon Icon={ICONS.Unlink} size={18} />
                              <span>Déconnecter</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="providers-section-title">
              Connecter un Appareil
            </h3>

            <div className="providers-grid">
              {Object.values(PROVIDER_CONFIGS)
                .filter((config) => MVP_PROVIDERS.includes(config.id as any))
                .map((config, index) => {
                const isConnected = devices.some((d) => d.provider === config.id);

                return (
                  <motion.div
                    key={config.id}
                    className={`provider-card ${isConnected ? 'connected' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <div
                      className="provider-icon-container"
                      style={{
                        background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}35 100%)`,
                      }}
                    >
                      <SpatialIcon Icon={ICONS[config.icon]} size={26} color={config.color} />
                    </div>

                    <div className="provider-info">
                      <h4>{config.name}</h4>
                      <p>{config.description}</p>
                    </div>

                    <button
                      onClick={() => handleConnectDevice(config.id)}
                      disabled={isConnected}
                      className="provider-connect-btn"
                      style={{
                        background: isConnected
                          ? undefined
                          : `radial-gradient(circle at 30% 20%, ${config.color}25 0%, transparent 60%),
                             radial-gradient(circle at 70% 80%, ${config.color}20 0%, transparent 50%),
                             linear-gradient(135deg, ${config.color}15 0%, ${config.color}30 100%)`,
                        color: isConnected ? undefined : config.color,
                        borderColor: isConnected ? undefined : `${config.color}50`,
                      }}
                    >
                      {isConnected ? 'Déjà connecté' : 'Connecter'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Coming Soon Section */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <SpatialIcon Icon={ICONS.Clock} size={20} style={{ color: '#06B6D4' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', margin: 0 }}>
                  Prochainement
                </h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: '1.5' }}>
                Garmin, Polar, Fitbit, Whoop, Oura, Suunto, Coros, et Wahoo seront bientôt disponibles.
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ConnectedDevicesTab;
