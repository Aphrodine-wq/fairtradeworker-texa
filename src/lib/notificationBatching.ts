/**
 * Smart Notification Batching
 * Groups notifications intelligently and detects urgency
 */

export interface Notification {
  id: string
  type: 'job' | 'bid' | 'message' | 'payment' | 'review' | 'milestone' | 'alert'
  title: string
  message: string
  timestamp: number
  urgent?: boolean
  category?: string
  jobId?: string
}

export interface BatchedNotification {
  group: string
  title: string
  count: number
  notifications: Notification[]
  urgent: boolean
  timestamp: number
}

/**
 * Detect if notification is urgent
 */
export function isUrgent(notification: Notification): boolean {
  // Explicitly marked as urgent
  if (notification.urgent) return true

  // Job matches - time-sensitive
  if (notification.type === 'job' && notification.message.includes('perfect match')) {
    return true
  }

  // Bid accepted - time-sensitive response needed
  if (notification.type === 'bid' && notification.title.toLowerCase().includes('accepted')) {
    return true
  }

  // Payment received - always show immediately
  if (notification.type === 'payment') {
    return true
  }

  // Messages - show immediately
  if (notification.type === 'message') {
    return true
  }

  // Milestone approvals - action needed
  if (notification.type === 'milestone' && notification.title.toLowerCase().includes('approved')) {
    return true
  }

  return false
}

/**
 * Group notifications by type/category for batching
 */
export function groupNotifications(notifications: Notification[]): Map<string, Notification[]> {
  const groups = new Map<string, Notification[]>()

  notifications.forEach(notif => {
    let groupKey = notif.type

    // Further group jobs by category
    if (notif.type === 'job' && notif.category) {
      groupKey = `job-${notif.category}`
    }

    // Group bids by type
    if (notif.type === 'bid') {
      if (notif.title.toLowerCase().includes('accepted')) {
        groupKey = 'bid-accepted'
      } else if (notif.title.toLowerCase().includes('rejected')) {
        groupKey = 'bid-rejected'
      } else {
        groupKey = 'bid-other'
      }
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(notif)
  })

  return groups
}

/**
 * Create batched notifications
 */
export function createBatchedNotifications(notifications: Notification[]): BatchedNotification[] {
  // Separate urgent from non-urgent
  const urgent = notifications.filter(isUrgent)
  const nonUrgent = notifications.filter(n => !isUrgent(n))

  const batches: BatchedNotification[] = []

  // Urgent notifications always sent immediately (not batched)
  urgent.forEach(notif => {
    batches.push({
      group: 'urgent',
      title: notif.title,
      count: 1,
      notifications: [notif],
      urgent: true,
      timestamp: notif.timestamp
    })
  })

  // Batch non-urgent notifications
  const groups = groupNotifications(nonUrgent)
  
  groups.forEach((groupNotifications, groupKey) => {
    if (groupNotifications.length === 0) return

    // If only one notification in group, send individually
    if (groupNotifications.length === 1) {
      batches.push({
        group: groupKey,
        title: groupNotifications[0].title,
        count: 1,
        notifications: groupNotifications,
        urgent: false,
        timestamp: groupNotifications[0].timestamp
      })
      return
    }

    // Create batch title based on type
    let batchTitle = ''
    if (groupKey.startsWith('job-')) {
      const category = groupKey.replace('job-', '')
      batchTitle = `${groupNotifications.length} new ${category} jobs`
    } else if (groupKey === 'bid-accepted') {
      batchTitle = `${groupNotifications.length} bids accepted`
    } else if (groupKey === 'bid-rejected') {
      batchTitle = `${groupNotifications.length} bid updates`
    } else if (groupKey === 'review') {
      batchTitle = `${groupNotifications.length} new reviews`
    } else {
      batchTitle = `${groupNotifications.length} new ${groupKey} notifications`
    }

    batches.push({
      group: groupKey,
      title: batchTitle,
      count: groupNotifications.length,
      notifications: groupNotifications.sort((a, b) => b.timestamp - a.timestamp),
      urgent: false,
      timestamp: Math.max(...groupNotifications.map(n => n.timestamp))
    })
  })

  // Sort by urgency and timestamp
  return batches.sort((a, b) => {
    if (a.urgent && !b.urgent) return -1
    if (!a.urgent && b.urgent) return 1
    return b.timestamp - a.timestamp
  })
}

/**
 * Determine if notifications should be batched based on time window
 */
export function shouldBatchNotifications(
  notifications: Notification[],
  batchWindowMinutes: number = 5
): boolean {
  if (notifications.length <= 1) return false
  
  // Check if any are urgent - don't batch urgent notifications
  if (notifications.some(isUrgent)) return false

  // Check time spread
  const timestamps = notifications.map(n => n.timestamp).sort((a, b) => a - b)
  const timeSpread = timestamps[timestamps.length - 1] - timestamps[0]
  const windowMs = batchWindowMinutes * 60 * 1000

  // If notifications are within the batch window, batch them
  return timeSpread <= windowMs && notifications.length > 1
}

/**
 * Get notification priority score (0-100)
 */
export function getNotificationPriority(notification: Notification): number {
  let score = 50 // Base priority

  // Urgent notifications get high priority
  if (isUrgent(notification)) score += 40

  // Job matches are important
  if (notification.type === 'job' && notification.message.includes('match')) {
    score += 20
  }

  // Recent notifications are higher priority
  const age = Date.now() - notification.timestamp
  const ageHours = age / (1000 * 60 * 60)
  if (ageHours < 1) score += 15
  else if (ageHours < 24) score += 5

  // Payment notifications are always high priority
  if (notification.type === 'payment') score += 30

  // Bid accepted is high priority
  if (notification.type === 'bid' && notification.title.toLowerCase().includes('accepted')) {
    score += 25
  }

  return Math.min(100, score)
}

/**
 * Sort notifications by priority
 */
export function sortByPriority(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => {
    const priorityA = getNotificationPriority(a)
    const priorityB = getNotificationPriority(b)
    
    // First by priority
    if (priorityA !== priorityB) {
      return priorityB - priorityA
    }
    
    // Then by recency
    return b.timestamp - a.timestamp
  })
}
