/**
 * Chat Notification Service
 * Service de gestion des notifications contextuelles du chat
 * Gère l'affichage, le timing, et la persistance des notifications
 */

import { useGlobalChatStore } from '../store/globalChatStore';
import { notificationTracker, type NotificationId } from '../../utils/notificationTracker';
import type { ChatMode, ChatNotification } from '../store/globalChatStore';
import logger from '../../lib/utils/logger';

const NOTIFICATION_MESSAGES: Record<NotificationId, string> = {
  'step1-welcome': 'Salut ! Je suis là si tu as besoin 👋',
  'step2-adjust': 'Besoin d\'ajuster ton programme ? Je suis là !',
  'training-intro': 'Prêt pour ta séance ? Clique pour commencer !',
  'nutrition-intro': 'Un conseil nutrition ? Je suis disponible !',
  'fasting-intro': 'Ton coach jeûne est là pour t\'accompagner !'
};

const NOTIFICATION_DELAYS = {
  appearance: 2000,
  duration: 3000,
  total: 5000
};

class ChatNotificationService {
  private timeoutId: NodeJS.Timeout | null = null;
  private hasShownNotification: Set<NotificationId> = new Set();

  private getNotificationForMode(mode: ChatMode, stepId?: string): NotificationId {
    if (stepId === 'step1') {
      return 'step1-welcome';
    }
    if (stepId === 'step2') {
      return 'step2-adjust';
    }

    switch (mode) {
      case 'training':
        return 'training-intro';
      case 'nutrition':
        return 'nutrition-intro';
      case 'fasting':
        return 'fasting-intro';
      default:
        return 'step1-welcome';
    }
  }

  shouldShowNotification(notificationId: NotificationId): boolean {
    if (this.hasShownNotification.has(notificationId)) {
      return false;
    }

    if (!notificationTracker.shouldShow(notificationId)) {
      logger.debug('CHAT_NOTIFICATION', 'Notification already seen max times', {
        notificationId,
        viewCount: notificationTracker.getViewCount(notificationId)
      });
      return false;
    }

    const { isOpen } = useGlobalChatStore.getState();
    if (isOpen) {
      return false;
    }

    return true;
  }

  scheduleNotification(mode: ChatMode, stepId?: string): void {
    const notificationId = this.getNotificationForMode(mode, stepId);

    if (!this.shouldShowNotification(notificationId)) {
      return;
    }

    this.clearScheduledNotification();

    this.timeoutId = setTimeout(() => {
      this.showNotification(notificationId, mode);
    }, NOTIFICATION_DELAYS.appearance);

    logger.debug('CHAT_NOTIFICATION', 'Notification scheduled', {
      notificationId,
      mode,
      stepId,
      delayMs: NOTIFICATION_DELAYS.appearance
    });
  }

  private showNotification(notificationId: NotificationId, mode: ChatMode): void {
    const { showNotification, addMessage } = useGlobalChatStore.getState();

    const message = NOTIFICATION_MESSAGES[notificationId];

    const notification: Omit<ChatNotification, 'isVisible'> = {
      id: notificationId,
      message,
      mode,
      autoHideDelay: NOTIFICATION_DELAYS.duration
    };

    showNotification(notification);
    this.hasShownNotification.add(notificationId);

    notificationTracker.markAsSeen(notificationId);

    addMessage({
      role: 'coach',
      type: 'text',
      content: message
    });

    logger.info('CHAT_NOTIFICATION', 'Notification shown', {
      notificationId,
      mode,
      message
    });

    this.timeoutId = setTimeout(() => {
      this.hideNotification(notificationId);
    }, NOTIFICATION_DELAYS.duration);
  }

  hideNotification(notificationId?: NotificationId): void {
    const { hideNotification, currentNotification } = useGlobalChatStore.getState();

    if (!currentNotification) {
      return;
    }

    if (notificationId && currentNotification.id !== notificationId) {
      return;
    }

    hideNotification();

    logger.debug('CHAT_NOTIFICATION', 'Notification hidden', {
      notificationId: currentNotification.id
    });
  }

  clearScheduledNotification(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  resetNotificationHistory(notificationId?: NotificationId): void {
    if (notificationId) {
      this.hasShownNotification.delete(notificationId);
      notificationTracker.reset(notificationId);
    } else {
      this.hasShownNotification.clear();
      notificationTracker.resetAll();
    }

    logger.info('CHAT_NOTIFICATION', 'Notification history reset', {
      notificationId: notificationId || 'all'
    });
  }

  cleanup(): void {
    this.clearScheduledNotification();
    this.hasShownNotification.clear();

    logger.debug('CHAT_NOTIFICATION', 'Service cleaned up');
  }
}

export const chatNotificationService = new ChatNotificationService();
