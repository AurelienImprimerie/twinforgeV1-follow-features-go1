import { supabase } from '../supabase/client';
import { useUserStore } from '../store/userStore';
import logger from '../../lib/utils/logger';

export interface LogoutOptions {
  clearAllData?: boolean;
  redirectUrl?: string;
}

export class LogoutService {
  private static isLoggingOut = false;

  static async logout(options: LogoutOptions = {}): Promise<void> {
    if (this.isLoggingOut) {
      logger.warn('LOGOUT_SERVICE', 'Logout already in progress');
      return;
    }

    this.isLoggingOut = true;

    try {
      logger.info('LOGOUT_SERVICE', 'Starting logout process', {
        clearAllData: options.clearAllData,
        redirectUrl: options.redirectUrl,
        timestamp: new Date().toISOString()
      });

      const { setSession, setProfile, setAuthReady } = useUserStore.getState();

      logger.info('LOGOUT_SERVICE', 'Signing out from Supabase');
      await supabase.auth.signOut();

      logger.info('LOGOUT_SERVICE', 'Clearing user store state');
      setSession(null);
      setProfile(null);
      setAuthReady(false);

      if (options.clearAllData) {
        logger.info('LOGOUT_SERVICE', 'Clearing all local data');
        this.clearAllLocalData();
      }

      logger.info('LOGOUT_SERVICE', 'Logout completed successfully');

      const redirectUrl = options.redirectUrl || '/';
      logger.info('LOGOUT_SERVICE', 'Redirecting to login page', { url: redirectUrl });

      window.location.href = redirectUrl;
    } catch (error) {
      logger.error('LOGOUT_SERVICE', 'Error during logout', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      logger.warn('LOGOUT_SERVICE', 'Forcing redirect despite error');
      window.location.href = '/';
    } finally {
      this.isLoggingOut = false;
    }
  }

  private static clearAllLocalData(): void {
    try {
      const keysToPreserve = ['theme', 'language'];

      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();

      logger.info('LOGOUT_SERVICE', 'Local data cleared', {
        preservedKeys: keysToPreserve
      });
    } catch (error) {
      logger.error('LOGOUT_SERVICE', 'Error clearing local data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async softLogout(): Promise<void> {
    return this.logout({ clearAllData: false });
  }

  static async hardLogout(): Promise<void> {
    return this.logout({ clearAllData: true });
  }
}
