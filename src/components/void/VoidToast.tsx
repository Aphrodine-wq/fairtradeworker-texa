/**
 * VOID OS Toast Notification Component
 * Auto-dismissing toast notifications in top-right corner
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useVoidStore } from '@/lib/void/store'
import { getNotificationIcon, formatNotificationTime } from '@/lib/void/notifications'
import type { Notification } from '@/lib/void/notifications'
import '@/styles/void-notifications.css'

interface VoidToastProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function ToastIcon({ type }: { type: Notification['type'] }) {
  const iconProps = { className: 'void-toast-icon', size: 20 }
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} />
    case 'error':
      return <AlertCircle {...iconProps} />
    case 'warning':
      return <AlertTriangle {...iconProps} />
    default:
      return <Info {...iconProps} />
  }
}

export function VoidToast({ notification, onDismiss }: VoidToastProps) {
  const icon = notification.icon || getNotificationIcon(notification.type)

  return (
    <motion.div
      className={`void-toast void-toast-${notification.type}`}
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="void-toast-content">
        <div className="void-toast-icon-container">
          <ToastIcon type={notification.type} />
        </div>
        <div className="void-toast-text">
          <div className="void-toast-title">{notification.title}</div>
          {notification.message && (
            <div className="void-toast-message">{notification.message}</div>
          )}
        </div>
        {notification.actions && notification.actions.length > 0 && (
          <div className="void-toast-actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`void-toast-action ${action.primary ? 'primary' : ''}`}
                onClick={() => {
                  action.action()
                  if (!action.primary) {
                    onDismiss(notification.id)
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <button
          className="void-toast-close"
          onClick={() => onDismiss(notification.id)}
          aria-label="Dismiss"
        >
          <X className="void-toast-close-icon" />
        </button>
      </div>
    </motion.div>
  )
}

export function VoidToastContainer() {
  const { notifications, markAsRead } = useVoidStore()

  // Show only unread, non-persistent notifications as toasts
  const toastNotifications = notifications
    .filter(n => !n.read && !n.persistent)
    .slice(0, 5) // Max 5 toasts at once

  return (
    <div className="void-overlay-toast void-toast-container">
      <AnimatePresence mode="popLayout">
        {toastNotifications.map(notification => (
          <VoidToast
            key={notification.id}
            notification={notification}
            onDismiss={markAsRead}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
