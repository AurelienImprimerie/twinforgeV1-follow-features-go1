/**
 * Notification Tracker
 * Gestion de la persistance des notifications contextuelles vues par l'utilisateur
 * Best practices: localStorage avec fallback gracieux
 */

export type NotificationId =
  | 'step1-welcome'
  | 'step2-adjust'
  | 'training-intro'
  | 'nutrition-intro'
  | 'fasting-intro';

interface NotificationState {
  [key: string]: {
    seen: boolean;
    firstSeenAt?: string;
    lastSeenAt?: string;
    viewCount: number;
  };
}

const STORAGE_KEY = 'twinforge-chat-notifications-seen';
const MAX_VIEW_COUNT = 3;

class NotificationTracker {
  private state: NotificationState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): NotificationState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load notification state from localStorage:', error);
    }
    return {};
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save notification state to localStorage:', error);
    }
  }

  hasSeen(notificationId: NotificationId): boolean {
    const notif = this.state[notificationId];
    if (!notif) return false;

    return notif.seen && (notif.viewCount >= MAX_VIEW_COUNT);
  }

  markAsSeen(notificationId: NotificationId): void {
    const now = new Date().toISOString();

    if (!this.state[notificationId]) {
      this.state[notificationId] = {
        seen: true,
        firstSeenAt: now,
        lastSeenAt: now,
        viewCount: 1
      };
    } else {
      this.state[notificationId].seen = true;
      this.state[notificationId].lastSeenAt = now;
      this.state[notificationId].viewCount += 1;
    }

    this.saveState();
  }

  getViewCount(notificationId: NotificationId): number {
    return this.state[notificationId]?.viewCount || 0;
  }

  shouldShow(notificationId: NotificationId): boolean {
    const viewCount = this.getViewCount(notificationId);
    return viewCount < MAX_VIEW_COUNT;
  }

  reset(notificationId?: NotificationId): void {
    if (notificationId) {
      delete this.state[notificationId];
    } else {
      this.state = {};
    }
    this.saveState();
  }

  resetAll(): void {
    this.state = {};
    this.saveState();
  }
}

export const notificationTracker = new NotificationTracker();
