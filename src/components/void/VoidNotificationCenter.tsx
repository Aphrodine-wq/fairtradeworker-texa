/**
 * VOID OS Notification Center
 * Slide-in panel showing all notifications
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell, BellOff } from 'lucide-react'
import { useVoidStore } from '@/lib/void/store'
import { getNotificationIcon, formatNotificationTime, groupNotificationsByDate } from '@/lib/void/notifications'
import type { Notification } from '@/lib/void/notifications'
import '@/styles/void-notifications.css'

interface VoidNotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const iconProps = { className: 'void-notification-icon', size: 20 }
  
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

function NotificationItem({ notification, onAction }: { notification: Notification; onAction: (action: () => void) => void }) {
  const { markAsRead } = useVoidStore()
  const icon = notification.icon || getNotificationIcon(notification.type)

  return (
    <motion.div
      className={`void-notification-item ${notification.read ? 'read' : ''} void-notification-${notification.type}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => {
        if (!notification.read) {
          markAsRead(notification.id)
        }
      }}
    >
      <div className="void-notification-icon-container">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="void-notification-content">
        <div className="void-notification-header">
          <div className="void-notification-title">{notification.title}</div>
          <div className="void-notification-time">
            {formatNotificationTime(notification.timestamp)}
          </div>
        </div>
        {notification.message && (
          <div className="void-notification-message">{notification.message}</div>
        )}
        {notification.actions && notification.actions.length > 0 && (
          <div className="void-notification-actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`void-notification-action ${action.primary ? 'primary' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  action.action()
                  onAction(action.action)
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {!notification.read && (
        <div className="void-notification-unread-dot" />
      )}
    </motion.div>
  )
}

export function VoidNotificationCenter({ isOpen, onClose }: VoidNotificationCenterProps) {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useVoidStore()

  const grouped = groupNotificationsByDate(notifications)
  const hasNotifications = notifications.length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="void-notification-center-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            className="void-system-notification-center void-notification-center"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="void-notification-center-header">
              <div className="void-notification-center-title">
                <Bell className="void-notification-center-title-icon" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="void-notification-center-badge">{unreadCount}</span>
                )}
              </div>
              <div className="void-notification-center-actions">
                {unreadCount > 0 && (
                  <button
                    className="void-notification-center-action"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCircle className="void-notification-center-action-icon" />
                  </button>
                )}
                {hasNotifications && (
                  <button
                    className="void-notification-center-action"
                    onClick={clearAll}
                    title="Clear all"
                  >
                    <BellOff className="void-notification-center-action-icon" />
                  </button>
                )}
                <button
                  className="void-notification-center-action"
                  onClick={onClose}
                  title="Close"
                >
                  <X className="void-notification-center-action-icon" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="void-notification-center-content">
              {!hasNotifications ? (
                <div className="void-notification-center-empty">
                  <BellOff className="void-notification-center-empty-icon" />
                  <div className="void-notification-center-empty-text">No notifications</div>
                </div>
              ) : (
                <>
                  {grouped.today.length > 0 && (
                    <div className="void-notification-group">
                      <div className="void-notification-group-title">TODAY</div>
                      {grouped.today.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onAction={() => {}}
                        />
                      ))}
                    </div>
                  )}

                  {grouped.yesterday.length > 0 && (
                    <div className="void-notification-group">
                      <div className="void-notification-group-title">YESTERDAY</div>
                      {grouped.yesterday.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onAction={() => {}}
                        />
                      ))}
                    </div>
                  )}

                  {grouped.thisWeek.length > 0 && (
                    <div className="void-notification-group">
                      <div className="void-notification-group-title">THIS WEEK</div>
                      {grouped.thisWeek.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onAction={() => {}}
                        />
                      ))}
                    </div>
                  )}

                  {grouped.older.length > 0 && (
                    <div className="void-notification-group">
                      <div className="void-notification-group-title">OLDER</div>
                      {grouped.older.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onAction={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
