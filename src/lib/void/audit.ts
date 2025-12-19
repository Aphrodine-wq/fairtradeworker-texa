/**
 * VOID OS Audit Logging System
 */

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'

export interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  entity: string // 'customer' | 'lead' | 'project' | 'invoice' | etc.
  entityId?: string
  changes?: Record<string, { from: any; to: any }>
  ipAddress?: string
  userAgent?: string
  timestamp: number
}

const AUDIT_STORAGE_KEY = 'void-audit-logs'
const MAX_LOGS = 1000
const RETENTION_DAYS = 90

/**
 * Get audit logs
 */
export function getAuditLogs(): AuditLog[] {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY)
    if (stored) {
      const logs = JSON.parse(stored)
      // Filter expired logs
      const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
      return logs.filter((log: AuditLog) => log.timestamp > cutoff)
    }
  } catch (error) {
    console.error('[Audit] Failed to get audit logs:', error)
  }
  return []
}

/**
 * Save audit logs
 */
export function saveAuditLogs(logs: AuditLog[]): void {
  try {
    // Limit to max logs
    const limited = logs.slice(-MAX_LOGS)
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(limited))
  } catch (error) {
    console.error('[Audit] Failed to save audit logs:', error)
  }
}

/**
 * Log audit event
 */
export function logAuditEvent(
  userId: string,
  action: AuditAction,
  entity: string,
  options?: {
    entityId?: string
    changes?: Record<string, { from: any; to: any }>
    ipAddress?: string
    userAgent?: string
  }
): void {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId,
    action,
    entity,
    entityId: options?.entityId,
    changes: options?.changes,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent || navigator.userAgent,
    timestamp: Date.now(),
  }
  
  const logs = getAuditLogs()
  logs.push(log)
  saveAuditLogs(logs)
}

/**
 * Get audit logs for entity
 */
export function getAuditLogsForEntity(entity: string, entityId?: string): AuditLog[] {
  const logs = getAuditLogs()
  return logs.filter(log => {
    if (log.entity !== entity) return false
    if (entityId && log.entityId !== entityId) return false
    return true
  })
}

/**
 * Get audit logs for user
 */
export function getAuditLogsForUser(userId: string): AuditLog[] {
  const logs = getAuditLogs()
  return logs.filter(log => log.userId === userId)
}
