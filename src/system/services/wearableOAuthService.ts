/**
 * Wearable OAuth Service
 * Handles OAuth flow initialization for wearable device providers
 */

import { supabase } from '../supabase/client';
import type { Provider } from '../../domain/connectedDevices';
import logger from '../../lib/utils/logger';
import { nanoid } from 'nanoid';

export class WearableOAuthService {
  /**
   * Initialize OAuth flow for a provider
   * Creates a secure state parameter and redirects to provider's auth URL
   */
  async initOAuthFlow(provider: Provider): Promise<void> {
    try {
      logger.info('OAUTH_INIT', 'Starting OAuth flow', { provider });

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User not authenticated');
      }

      const userId = session.session.user.id;

      // Generate secure state parameter
      const state = nanoid(32);

      // Generate PKCE code verifier for providers that support it
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Get redirect URI
      const redirectUri = this.getRedirectUri();

      // Create auth flow record in database
      const { data: authFlow, error: flowError } = await supabase
        .from('device_auth_flows')
        .insert({
          user_id: userId,
          provider,
          state,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
          status: 'pending',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        })
        .select()
        .single();

      if (flowError || !authFlow) {
        throw new Error(`Failed to create auth flow: ${flowError?.message}`);
      }

      logger.info('OAUTH_INIT', 'Auth flow created', {
        provider,
        flowId: authFlow.id,
        state,
      });

      // Build authorization URL
      const authUrl = this.buildAuthorizationUrl(
        provider,
        state,
        redirectUri,
        codeChallenge
      );

      logger.info('OAUTH_INIT', 'Redirecting to provider', { provider, authUrl });

      // Redirect to provider's authorization page
      window.location.href = authUrl;
    } catch (error) {
      logger.error('OAUTH_INIT', 'Failed to initialize OAuth flow', {
        error: error instanceof Error ? error.message : 'Unknown error',
        provider,
      });
      throw error;
    }
  }

  /**
   * Build authorization URL for a provider
   */
  private buildAuthorizationUrl(
    provider: Provider,
    state: string,
    redirectUri: string,
    codeChallenge?: string
  ): string {
    const clientIds = {
      strava: import.meta.env.VITE_STRAVA_CLIENT_ID,
      garmin: import.meta.env.VITE_GARMIN_CLIENT_ID,
      fitbit: import.meta.env.VITE_FITBIT_CLIENT_ID,
      polar: import.meta.env.VITE_POLAR_CLIENT_ID,
      wahoo: import.meta.env.VITE_WAHOO_CLIENT_ID,
      whoop: import.meta.env.VITE_WHOOP_CLIENT_ID,
      oura: import.meta.env.VITE_OURA_CLIENT_ID,
      suunto: import.meta.env.VITE_SUUNTO_CLIENT_ID,
      coros: import.meta.env.VITE_COROS_CLIENT_ID,
      google_fit: import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID,
      apple_health: '', // Apple Health uses HealthKit, not OAuth
    };

    const clientId = clientIds[provider];
    if (!clientId && provider !== 'apple_health') {
      throw new Error(`Client ID not configured for provider: ${provider}`);
    }

    // Special case for Apple Health (uses HealthKit)
    if (provider === 'apple_health') {
      throw new Error(
        'Apple Health requires native HealthKit integration, not OAuth. Please use the iOS app.'
      );
    }

    const authUrls: Record<Provider, string> = {
      strava: 'https://www.strava.com/oauth/authorize',
      garmin: 'https://connect.garmin.com/oauth/authorize',
      fitbit: 'https://www.fitbit.com/oauth2/authorize',
      polar: 'https://flow.polar.com/oauth2/authorization',
      wahoo: 'https://api.wahooligan.com/oauth/authorize',
      whoop: 'https://api.prod.whoop.com/oauth/authorize',
      oura: 'https://cloud.ouraring.com/oauth/authorize',
      suunto: 'https://cloudapi.suunto.com/oauth/authorize',
      coros: 'https://open.coros.com/oauth2/authorize',
      google_fit: 'https://accounts.google.com/o/oauth2/v2/auth',
      apple_health: '',
    };

    const scopes: Record<Provider, string> = {
      strava: 'read,activity:read_all',
      garmin: 'activities,wellness,sleep',
      fitbit: 'activity heartrate sleep weight nutrition',
      polar: 'accesslink.read_all',
      wahoo: 'workouts_read power_read',
      whoop: 'read:recovery read:workout read:sleep',
      oura: 'daily personal session',
      suunto: 'workout',
      coros: 'workouts:read',
      google_fit:
        'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read',
      apple_health: '',
    };

    const baseUrl = authUrls[provider];
    const scope = scopes[provider];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope,
    });

    // Add PKCE for providers that support it
    if (codeChallenge && ['strava', 'google_fit', 'fitbit'].includes(provider)) {
      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    // Provider-specific parameters
    if (provider === 'fitbit') {
      params.append('prompt', 'consent');
    }

    if (provider === 'google_fit') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get redirect URI for OAuth callback
   */
  private getRedirectUri(): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/wearable-oauth-callback`;
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => ('0' + byte.toString(16)).slice(-2)).join('');
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Handle OAuth callback (called after user authorizes)
   * This is typically handled by the Edge Function, but can be used for error handling
   */
  async handleCallback(code: string, state: string): Promise<void> {
    try {
      logger.info('OAUTH_CALLBACK', 'Handling OAuth callback', { state });

      // Verify state
      const { data: authFlow, error } = await supabase
        .from('device_auth_flows')
        .select('*')
        .eq('state', state)
        .eq('status', 'pending')
        .single();

      if (error || !authFlow) {
        throw new Error('Invalid or expired OAuth state');
      }

      // Update status to completed
      await supabase
        .from('device_auth_flows')
        .update({ status: 'completed' })
        .eq('id', authFlow.id);

      logger.info('OAUTH_CALLBACK', 'OAuth callback handled successfully', {
        provider: authFlow.provider,
      });
    } catch (error) {
      logger.error('OAUTH_CALLBACK', 'Failed to handle OAuth callback', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Cancel an in-progress OAuth flow
   */
  async cancelOAuthFlow(state: string): Promise<void> {
    await supabase
      .from('device_auth_flows')
      .update({ status: 'cancelled' })
      .eq('state', state);
  }
}

export const wearableOAuthService = new WearableOAuthService();
