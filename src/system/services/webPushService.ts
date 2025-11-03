/**
 * Web Push Service
 * Handles Web Push API interactions, service worker registration,
 * and push subscription management
 */

import { supabase } from '../supabase/client';
import logger from '../../lib/utils/logger';
import type {
  PushSubscriptionPayload,
  WebPushSubscription,
  NotificationPermissionState,
} from '../../domain/notifications';

const SERVICE_WORKER_PATH = '/sw.js';

class WebPushService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  // =============================================
  // SERVICE WORKER REGISTRATION
  // =============================================

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('WEB_PUSH', 'Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
      this.serviceWorkerRegistration = registration;
      logger.info('WEB_PUSH', 'Service Worker registered', {
        scope: registration.scope,
      });

      return registration;
    } catch (error) {
      logger.error('WEB_PUSH', 'Failed to register Service Worker', { error });
      return null;
    }
  }

  /**
   * Get active service worker registration
   */
  async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.serviceWorkerRegistration) {
      return this.serviceWorkerRegistration;
    }

    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.serviceWorkerRegistration = registration;
      return registration;
    } catch (error) {
      logger.error('WEB_PUSH', 'Failed to get Service Worker registration', { error });
      return null;
    }
  }

  // =============================================
  // PERMISSION MANAGEMENT
  // =============================================

  /**
   * Check current notification permission state
   */
  async checkPermissionState(): Promise<NotificationPermissionState> {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

    if (!isSupported) {
      return {
        permission: 'denied',
        isSupported: false,
        isSubscribed: false,
        subscription: null,
      };
    }

    const permission = Notification.permission;
    let subscription: WebPushSubscription | null = null;
    let isSubscribed = false;

    if (permission === 'granted') {
      const pushSubscription = await this.getCurrentSubscription();
      if (pushSubscription) {
        subscription = this.convertSubscriptionToWebPush(pushSubscription);
        isSubscribed = true;
      }
    }

    return {
      permission,
      isSupported,
      isSubscribed,
      subscription,
    };
  }

  /**
   * Check push permission (simple wrapper for component compatibility)
   */
  async checkPushPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      logger.warn('WEB_PUSH', 'Notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      logger.info('WEB_PUSH', 'Permission requested', { permission });
      return permission;
    } catch (error) {
      logger.error('WEB_PUSH', 'Error requesting permission', { error });
      return 'denied';
    }
  }

  // =============================================
  // SUBSCRIPTION MANAGEMENT
  // =============================================

  /**
   * Get current push subscription if exists
   */
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    const registration = await this.getServiceWorkerRegistration();
    if (!registration) {
      return null;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      logger.error('WEB_PUSH', 'Failed to get current subscription', { error });
      return null;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(userId: string): Promise<PushSubscriptionPayload | null> {
    try {
      // Check permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        logger.warn('WEB_PUSH', 'Permission not granted', { permission });
        return null;
      }

      // Get or register service worker
      const registration = await this.getServiceWorkerRegistration();
      if (!registration) {
        logger.error('WEB_PUSH', 'No service worker registration available');
        return null;
      }

      // Get VAPID public key from environment or API
      const vapidPublicKey = await this.getVapidPublicKey();
      if (!vapidPublicKey) {
        logger.error('WEB_PUSH', 'VAPID public key not available');
        return null;
      }

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      logger.info('WEB_PUSH', 'Subscribed to push notifications', {
        endpoint: subscription.endpoint,
      });

      // Convert to our payload format
      const payload = this.convertSubscriptionToPayload(subscription);
      return payload;
    } catch (error) {
      logger.error('WEB_PUSH', 'Failed to subscribe to push notifications', { error });
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      if (!subscription) {
        logger.warn('WEB_PUSH', 'No active subscription to unsubscribe');
        return true; // Already unsubscribed
      }

      const success = await subscription.unsubscribe();
      logger.info('WEB_PUSH', 'Unsubscribed from push notifications', { success });
      return success;
    } catch (error) {
      logger.error('WEB_PUSH', 'Failed to unsubscribe from push notifications', { error });
      return false;
    }
  }

  /**
   * Update existing subscription (refresh)
   */
  async refreshSubscription(userId: string): Promise<PushSubscriptionPayload | null> {
    try {
      // Unsubscribe from old subscription
      await this.unsubscribe();

      // Subscribe again
      return await this.subscribe(userId);
    } catch (error) {
      logger.error('WEB_PUSH', 'Failed to refresh subscription', { error });
      return null;
    }
  }

  // =============================================
  // VAPID KEY MANAGEMENT
  // =============================================

  /**
   * Get VAPID public key from Supabase edge function or environment
   */
  private async getVapidPublicKey(): Promise<string | null> {
    try {
      // In production, this should be fetched from your backend or edge function
      // For now, we'll use an environment variable
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        logger.warn('WEB_PUSH', 'VAPID public key not configured');
        return null;
      }

      return vapidKey;
    } catch (error) {
      logger.error('WEB_PUSH', 'Failed to get VAPID public key', { error });
      return null;
    }
  }

  // =============================================
  // TEST NOTIFICATION
  // =============================================

  /**
   * Send a test notification to verify setup
   */
  async sendTestNotification(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          notification: {
            title: 'Test Notification',
            body: 'Les notifications push fonctionnent correctement !',
            icon: '/brand/dual-ingot.svg',
            badge: '/brand/dual-ingot.svg',
            tag: 'test-notification',
            data: {
              url: '/',
            },
          },
        },
      });

      if (error) {
        logger.error('WEB_PUSH', 'Failed to send test notification', { error });
        return false;
      }

      logger.info('WEB_PUSH', 'Test notification sent', { data });
      return true;
    } catch (error) {
      logger.error('WEB_PUSH', 'Error sending test notification', { error });
      return false;
    }
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  /**
   * Convert browser PushSubscription to our payload format
   */
  private convertSubscriptionToPayload(
    subscription: PushSubscription
  ): PushSubscriptionPayload {
    const p256dh = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      subscription_endpoint: subscription.endpoint,
      subscription_keys: {
        p256dh: this.arrayBufferToBase64(p256dh!),
        auth: this.arrayBufferToBase64(auth!),
      },
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        browser: this.getBrowserInfo(),
        os: this.getOSInfo(),
      },
    };
  }

  /**
   * Convert browser PushSubscription to WebPushSubscription
   */
  private convertSubscriptionToWebPush(
    subscription: PushSubscription
  ): WebPushSubscription {
    const p256dh = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      keys: {
        p256dh: this.arrayBufferToBase64(p256dh!),
        auth: this.arrayBufferToBase64(auth!),
      },
    };
  }

  /**
   * Convert URL-safe base64 to Uint8Array for VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get browser information from user agent
   */
  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get OS information from user agent
   */
  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}

// Export singleton instance
export const webPushService = new WebPushService();
