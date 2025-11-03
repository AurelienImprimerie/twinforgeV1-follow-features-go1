/**
 * useNotifications Hook
 * Hook React pour gérer facilement les notifications du chat
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { unifiedNotificationService, type NotificationId } from '../system/services/unifiedNotificationService';

export function useNotifications() {
  const location = useLocation();
  const isOpen = false;
  const currentNotification = null;

  const scheduleContextualNotification = useCallback(() => {
    if (isOpen) return;

    let notificationId: NotificationId;

    if (location.pathname.includes('/pipeline/step-2')) {
      notificationId = 'step2-adjust';
    } else if (location.pathname.includes('/training')) {
      notificationId = 'training-intro';
    } else if (location.pathname.includes('/meals') || location.pathname.includes('/fridge')) {
      notificationId = 'nutrition-intro';
    } else if (location.pathname.includes('/fasting')) {
      notificationId = 'fasting-intro';
    } else {
      notificationId = 'step1-welcome';
    }

    unifiedNotificationService.scheduleNotification(notificationId);
  }, [location.pathname, isOpen]);

  useEffect(() => {
    scheduleContextualNotification();

    return () => {
      unifiedNotificationService.cancelScheduled();
    };
  }, [scheduleContextualNotification]);

  const hideNotification = useCallback(() => {
    if (currentNotification) {
      unifiedNotificationService.hideNotification(currentNotification.id as NotificationId);
    }
  }, [currentNotification]);

  const resetNotification = useCallback((notificationId?: NotificationId) => {
    unifiedNotificationService.resetNotification(notificationId);
  }, []);

  return {
    scheduleNotification: unifiedNotificationService.scheduleNotification.bind(unifiedNotificationService),
    queueNotification: unifiedNotificationService.queueNotification.bind(unifiedNotificationService),
    hideNotification,
    resetNotification,
    currentNotification
  };
}
