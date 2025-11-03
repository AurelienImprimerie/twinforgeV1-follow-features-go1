import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenIcon from '../../ui/icons/TokenIcon';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import { TokenService, type TokenBalance } from '../../system/services/tokenService';
import { TokenBalanceInitializer } from '../../system/services/tokenBalanceInitializer';
import { useFeedback } from '@/hooks';
import { useOverlayStore } from '../../system/store/overlayStore';
import { supabase } from '../../system/supabase/client';
import logger from '../../lib/utils/logger';

interface SecureTokenBalance extends TokenBalance {
  checksum?: string;
  timestamp?: string;
}

const TokenBalanceWidget: React.FC = () => {
  const [balance, setBalance] = useState<SecureTokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const realtimeChannelRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef(false);
  const navigate = useNavigate();
  const { sidebarClick } = useFeedback();
  const { close } = useOverlayStore();

  // Generate simple checksum for data integrity validation
  const generateChecksum = useCallback((data: TokenBalance): string => {
    const str = `${data.balance}-${data.lastResetAt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }, []);

  // Validate balance data integrity
  const validateBalance = useCallback((data: SecureTokenBalance): boolean => {
    if (!data || typeof data.balance !== 'number') {
      logger.warn('TOKEN_BALANCE_WIDGET', 'Invalid balance data structure');
      return false;
    }

    if (data.checksum) {
      const expectedChecksum = generateChecksum(data);
      if (data.checksum !== expectedChecksum) {
        logger.error('TOKEN_BALANCE_WIDGET', 'Balance data integrity check failed', {
          expected: expectedChecksum,
          received: data.checksum
        });
        return false;
      }
    }

    return true;
  }, [generateChecksum]);

  // Load balance with zero-trust approach (always from DB)
  const loadBalanceSecure = useCallback(async (source: 'initial' | 'realtime' | 'polling' | 'manual' = 'manual') => {
    // Prevent concurrent loads
    if (loadingRef.current) {
      logger.debug('TOKEN_BALANCE_WIDGET', 'Load already in progress, skipping', { source });
      return;
    }

    try {
      loadingRef.current = true;
      setIsSyncing(true);

      const result = await TokenService.getTokenBalance();

      if (result) {
        const secureBalance: SecureTokenBalance = {
          ...result,
          checksum: generateChecksum(result),
          timestamp: new Date().toISOString()
        };

        if (validateBalance(secureBalance)) {
          setBalance(secureBalance);
          setLastSyncTime(new Date());

          // Only log initial loads and errors, not every single update
          if (source === 'initial') {
            logger.info('TOKEN_BALANCE_WIDGET', 'Balance loaded securely', {
              source,
              balance: result.balance,
              checksum: secureBalance.checksum
            });
          } else {
            logger.debug('TOKEN_BALANCE_WIDGET', 'Balance updated', {
              source,
              balance: result.balance
            });
          }
        } else {
          logger.error('TOKEN_BALANCE_WIDGET', 'Balance validation failed', { source });
        }
      } else {
        logger.warn('TOKEN_BALANCE_WIDGET', 'No balance data received - user may need token balance initialization', { source });

        // Try to auto-initialize via Edge Function if balance is missing
        if (source === 'initial') {
          logger.info('TOKEN_BALANCE_WIDGET', 'Attempting auto-initialization of token balance');

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const initialized = await TokenBalanceInitializer.ensureTokenBalanceExists(user.id);
            if (initialized) {
              // Reload balance after successful initialization
              logger.info('TOKEN_BALANCE_WIDGET', 'Auto-initialization successful, reloading balance');
              await loadBalanceSecure('manual');
            }
          }
        }
      }
    } catch (error) {
      logger.error('TOKEN_BALANCE_WIDGET', 'Error loading balance', {
        error: error instanceof Error ? error.message : 'Unknown error',
        source
      });
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [generateChecksum, validateBalance]);

  // Setup realtime subscription with fallback
  useEffect(() => {
    let mounted = true;
    let realtimeActive = true;
    let lastSyncTimeRef = Date.now();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      // Initial load
      await loadBalanceSecure('initial');
      lastSyncTimeRef = Date.now();

      // Setup realtime channel with enhanced logging
      const channel = supabase
        .channel(`token-balance-secure-${user.id}`, {
          config: {
            broadcast: { self: false },
            presence: { key: user.id }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_token_balance',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            if (!mounted) return;

            logger.info('TOKEN_BALANCE_WIDGET', '🔔 Realtime update received', {
              event: payload.eventType,
              oldBalance: payload.old?.available_tokens,
              newBalance: payload.new?.available_tokens,
              timestamp: new Date().toISOString()
            });

            await loadBalanceSecure('realtime');
            lastSyncTimeRef = Date.now();
          }
        )
        .subscribe((status) => {
          logger.info('TOKEN_BALANCE_WIDGET', '📡 Realtime subscription status change', {
            status,
            userId: user.id,
            channelName: `token-balance-secure-${user.id}`
          });

          if (status === 'SUBSCRIBED') {
            logger.info('TOKEN_BALANCE_WIDGET', '✅ Realtime subscription active and listening for token balance changes');
            realtimeActive = true;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            logger.error('TOKEN_BALANCE_WIDGET', '❌ Realtime subscription failed - falling back to polling', { status });
            realtimeActive = false;
          } else if (status === 'CLOSED') {
            logger.warn('TOKEN_BALANCE_WIDGET', '⚠️ Realtime connection closed', { status });
            realtimeActive = false;
          }
        });

      realtimeChannelRef.current = channel;

      // Heartbeat to detect disconnections and fallback to polling
      heartbeatIntervalRef.current = setInterval(() => {
        if (!realtimeActive && mounted) {
          logger.warn('TOKEN_BALANCE_WIDGET', '⚠️ Realtime inactive, falling back to polling');
          loadBalanceSecure('polling');
          lastSyncTimeRef = Date.now();
        }
      }, 30000); // Check every 30 seconds

      // Aggressive polling fallback for critical updates (every 30 seconds)
      // This ensures balance updates even if realtime is broken
      pollingIntervalRef.current = setInterval(() => {
        if (mounted) {
          const timeSinceLastSync = Date.now() - lastSyncTimeRef;
          // Poll every 30 seconds to catch any missed updates
          if (timeSinceLastSync > 30000) {
            logger.debug('TOKEN_BALANCE_WIDGET', '🔄 Polling for balance updates', {
              timeSinceLastSync: Math.round(timeSinceLastSync / 1000),
              realtimeActive
            });
            loadBalanceSecure('polling');
            lastSyncTimeRef = Date.now();
          }
        }
      }, 30000); // Check every 30 seconds
    };

    setupRealtime();

    return () => {
      mounted = false;

      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [loadBalanceSecure]);

  const handleClick = () => {
    sidebarClick();
    close(); // Ferme le drawer mobile s'il est ouvert
    navigate('/settings?tab=account');
  };

  if (isLoading) {
    return null;
  }

  // Show "Initialisation..." state if no balance yet
  if (!balance) {
    return (
      <button
        onClick={handleClick}
        className="sidebar-token-widget sidebar-token-widget--loading"
        title="Initialisation de votre compte..."
      >
        <div className="sidebar-token-widget-content">
          <div className="sidebar-token-widget-icon">
            <TokenIcon
              size={24}
              variant="warning"
              withGlow={true}
            />
          </div>
          <div className="sidebar-token-widget-info">
            <div className="sidebar-token-widget-balance">
              ...
            </div>
            <div className="sidebar-token-widget-label">
              Initialisation...
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="sidebar-token-widget-arrow">
              <SpatialIcon
                Icon={ICONS.ChevronRight}
                size={12}
                className="opacity-40"
              />
            </div>
          </div>
        </div>
      </button>
    );
  }

  if (!validateBalance(balance)) {
    return null;
  }

  // Show syncing indicator if data is stale
  const isStale = balance.timestamp ?
    (Date.now() - new Date(balance.timestamp).getTime() > 120000) : false;

  const getVariant = () => {
    if (balance.balance < 50) return 'critical';
    if (balance.balance < 200) return 'warning';
    return 'success';
  };

  const variant = getVariant();
  const isLow = balance.balance < 200;
  const isCritical = balance.balance < 50;

  const getWidgetClassName = () => {
    const baseClass = 'sidebar-token-widget';
    if (isCritical) return `${baseClass} sidebar-token-widget--critical`;
    if (isLow) return `${baseClass} sidebar-token-widget--low`;
    return baseClass;
  };

  return (
    <button
      onClick={handleClick}
      className={getWidgetClassName()}
      title={isSyncing ? 'Synchronisation en cours...' : `Dernière synchro: ${lastSyncTime.toLocaleTimeString()}`}
    >
      <div className="sidebar-token-widget-content">
        <div className="sidebar-token-widget-icon">
          <TokenIcon
            size={24}
            variant={variant}
            withGlow={isLow}
          />
        </div>
        <div className="sidebar-token-widget-info">
          <div className="sidebar-token-widget-balance">
            {TokenService.formatTokenAmount(balance.balance)}
          </div>
          <div className="sidebar-token-widget-label">
            {isLow ? 'Recharger mes tokens' : 'Tokens disponibles'}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isLow && (
            <div className="sidebar-token-widget-alert">
              <SpatialIcon
                Icon={ICONS.AlertCircle}
                size={12}
                className="opacity-70"
                style={{
                  color: isCritical ? '#EF4444' : '#F59E0B'
                }}
              />
            </div>
          )}
          <div className="sidebar-token-widget-arrow">
            <SpatialIcon
              Icon={ICONS.ChevronRight}
              size={12}
              className="opacity-40"
            />
          </div>
        </div>
      </div>
    </button>
  );
};

export default TokenBalanceWidget;
