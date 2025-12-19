/**
 * VOID OS Notification System
 */

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'lead'
  | 'message'
  | 'reminder'
  | 'payment'

export interface NotificationAction {
  label: string
  action: () => void
  primary?: boolean
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  actions?: NotificationAction[]
  icon?: string
  sound?: boolean
  persistent?: boolean // Don't auto-dismiss
}

/**
 * Generate notification ID
 */
export function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Create a notification
 */
export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    actions?: NotificationAction[]
    icon?: string
    sound?: boolean
    persistent?: boolean
  }
): Notification {
  return {
    id: generateNotificationId(),
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    actions: options?.actions,
    icon: options?.icon,
    sound: options?.sound ?? (type === 'error' || type === 'lead'),
    persistent: options?.persistent,
  }
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
    lead: '🔔',
    message: '💬',
    reminder: '⏰',
    payment: '💰',
  }
  return icons[type] || 'ℹ️'
}

/**
 * Play notification sound
 */
export function playNotificationSound(type: NotificationType): void {
  // Only play sound for important notifications
  if (type === 'error' || type === 'lead' || type === 'payment') {
    // Use Web Audio API for subtle notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = type === 'error' ? 400 : 600
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      // Fallback: silent if Web Audio API not available
      console.warn('[Notifications] Could not play sound:', error)
    }
  }
}

/**
 * Format notification timestamp
 */
export function formatNotificationTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'Just now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return new Date(timestamp).toLocaleDateString()
  }
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(notifications: Notification[]): {
  today: Notification[]
  yesterday: Notification[]
  thisWeek: Notification[]
  older: Notification[]
} {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay

  const today = notifications.filter(n => {
    const notificationDate = new Date(n.timestamp)
    const todayDate = new Date()
    return notificationDate.toDateString() === todayDate.toDateString()
  })

  const yesterday = notifications.filter(n => {
    const notificationDate = new Date(n.timestamp)
    const yesterdayDate = new Date(now - oneDay)
    return notificationDate.toDateString() === yesterdayDate.toDateString()
  })

  const thisWeek = notifications.filter(n => {
    const diff = now - n.timestamp
    return diff > oneDay && diff <= oneWeek && !yesterday.includes(n)
  })

  const older = notifications.filter(n => {
    const diff = now - n.timestamp
    return diff > oneWeek && !today.includes(n) && !yesterday.includes(n) && !thisWeek.includes(n)
  })

  return { today, yesterday, thisWeek, older }
}
