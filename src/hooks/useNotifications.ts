/**
 * Hook for VOID OS Notification System
 */

import { useCallback, useEffect } from 'react'
import { useVoidStore } from '@/lib/void/store'
import {
  createNotification,
  playNotificationSound,
  type Notification,
  type NotificationType,
  type NotificationAction,
} from '@/lib/void/notifications'

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    addNotification: addNotificationToStore,
    markAsRead: markAsReadInStore,
    clearAll: clearAllInStore,
  } = useVoidStore()

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      actions?: NotificationAction[]
      icon?: string
      sound?: boolean
      persistent?: boolean
    }
  ) => {
    const notification = createNotification(type, title, message, options)
    
    // Play sound if enabled
    if (notification.sound) {
      playNotificationSound(type)
    }

    addNotificationToStore(notification)

    // Auto-dismiss non-persistent notifications after 5 seconds
    if (!notification.persistent && type !== 'error') {
      setTimeout(() => {
        markAsReadInStore(notification.id)
      }, 5000)
    }

    return notification.id
  }, [addNotificationToStore, markAsReadInStore])

  const markAsRead = useCallback((id: string) => {
    markAsReadInStore(id)
  }, [markAsReadInStore])

  const clearAll = useCallback(() => {
    clearAllInStore()
  }, [clearAllInStore])

  const markAllAsRead = useCallback(() => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsReadInStore(notification.id)
      }
    })
  }, [notifications, markAsReadInStore])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  }
}
