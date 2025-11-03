/**
 * Automatic Token Refresh Hook
 *
 * Monitors Supabase session expiration and refreshes tokens automatically
 * before they expire to prevent user disconnections.
 *
 * Security Features:
 * - Refreshes 5 minutes before expiration
 * - Handles refresh failures gracefully
 * - Logs suspicious activity
 * - Prevents race conditions with mutex lock
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../system/supabase/client';
import logger from '../lib/utils/logger';
import { useUserStore } from '../system/store/userStore';

interface TokenRefreshState {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  nextRefreshAt: Date | null;
  failureCount: number;
}

const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes before expiration
const MAX_REFRESH_FAILURES = 3; // Force logout after 3 consecutive failures
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

export const useTokenRefresh = () => {
  const [state, setState] = useState<TokenRefreshState>({
    isRefreshing: false,
    lastRefresh: null,
    nextRefreshAt: null,
    failureCount: 0,
  });

  const isRefreshingRef = useRef(false); // Mutex to prevent concurrent refreshes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { setSession } = useUserStore();

  /**
   * Calculate when the next refresh should occur
   */
  const calculateNextRefresh = (expiresAt: number): Date => {
    const expiresAtMs = expiresAt * 1000; // Convert to milliseconds
    const refreshAtMs = expiresAtMs - REFRESH_BEFORE_EXPIRY_MS;
    return new Date(refreshAtMs);
  };

  /**
   * Perform token refresh
   */
  const refreshToken = async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      logger.debug('TOKEN_REFRESH', 'Refresh already in progress, skipping');
      return false;
    }

    isRefreshingRef.current = true;
    setState(prev => ({ ...prev, isRefreshing: true }));

    try {
      logger.info('TOKEN_REFRESH', 'Starting token refresh');

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('No session returned after refresh');
      }

      // Update session in store
      setSession(data.session);

      const nextRefresh = calculateNextRefresh(data.session.expires_at!);

      setState(prev => ({
        isRefreshing: false,
        lastRefresh: new Date(),
        nextRefreshAt: nextRefresh,
        failureCount: 0, // Reset failure count on success
      }));

      logger.info('TOKEN_REFRESH', 'Token refreshed successfully', {
        expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
        nextRefreshAt: nextRefresh.toISOString(),
      });

      return true;
    } catch (error) {
      const failureCount = state.failureCount + 1;

      setState(prev => ({
        ...prev,
        isRefreshing: false,
        failureCount,
      }));

      logger.error('TOKEN_REFRESH', 'Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        failureCount,
        willForceLogout: failureCount >= MAX_REFRESH_FAILURES,
      });

      // Force logout after too many failures (potential security issue)
      if (failureCount >= MAX_REFRESH_FAILURES) {
        logger.error('TOKEN_REFRESH', 'Max refresh failures reached, forcing logout', {
          failureCount,
        });

        // Sign out the user
        await supabase.auth.signOut();
        setSession(null);

        // Redirect to login
        window.location.href = '/';
      }

      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  /**
   * Check if token needs refresh
   */
  const checkAndRefresh = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        logger.debug('TOKEN_REFRESH', 'No active session, skipping refresh check');
        return;
      }

      const now = Date.now();
      const expiresAtMs = session.expires_at! * 1000;
      const timeUntilExpiry = expiresAtMs - now;

      // Refresh if within the refresh window
      if (timeUntilExpiry <= REFRESH_BEFORE_EXPIRY_MS) {
        logger.info('TOKEN_REFRESH', 'Token expiring soon, initiating refresh', {
          timeUntilExpiryMinutes: Math.floor(timeUntilExpiry / 60000),
        });
        await refreshToken();
      } else {
        // Update next refresh time without refreshing
        const nextRefresh = calculateNextRefresh(session.expires_at!);
        setState(prev => ({
          ...prev,
          nextRefreshAt: nextRefresh,
        }));
      }
    } catch (error) {
      logger.error('TOKEN_REFRESH', 'Error checking token expiration', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Initialize token refresh monitoring
   */
  useEffect(() => {
    // Initial check
    checkAndRefresh();

    // Set up periodic checks
    intervalRef.current = setInterval(checkAndRefresh, REFRESH_CHECK_INTERVAL_MS);

    logger.info('TOKEN_REFRESH', 'Token refresh monitoring initialized', {
      checkIntervalMinutes: REFRESH_CHECK_INTERVAL_MS / 60000,
      refreshBeforeExpiryMinutes: REFRESH_BEFORE_EXPIRY_MS / 60000,
    });

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      logger.debug('TOKEN_REFRESH', 'Token refresh monitoring stopped');
    };
  }, []);

  /**
   * Manual refresh trigger (for testing or explicit refresh needs)
   */
  const manualRefresh = async () => {
    logger.info('TOKEN_REFRESH', 'Manual token refresh triggered');
    return await refreshToken();
  };

  return {
    isRefreshing: state.isRefreshing,
    lastRefresh: state.lastRefresh,
    nextRefreshAt: state.nextRefreshAt,
    failureCount: state.failureCount,
    manualRefresh,
  };
};
