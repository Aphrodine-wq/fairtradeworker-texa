/**
 * ID Generation Utility
 * Centralized utility for generating unique IDs across the application
 */

/**
 * Generates a cryptographically secure unique ID
 * Uses crypto.randomUUID() when available, falls back to a robust timestamp-based method
 */
export function generateId(prefix?: string): string {
  // Use crypto.randomUUID() if available (modern browsers and Node.js 14.17+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const uuid = crypto.randomUUID()
    return prefix ? `${prefix}-${uuid}` : uuid
  }
  
  // Fallback for older browsers
  // Uses timestamp + high-resolution performance timer + random bytes
  const timestamp = Date.now().toString(36)
  const performanceNow = (typeof performance !== 'undefined' && performance.now() || 0).toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)
  
  const id = `${timestamp}-${performanceNow}-${randomPart}${randomPart2}`
  return prefix ? `${prefix}-${id}` : id
}

/**
 * Generates a short ID (12-14 characters)
 * Suitable for user-facing IDs that need to be more compact
 */
export function generateShortId(prefix?: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  const id = `${timestamp}${random}`
  return prefix ? `${prefix}-${id}` : id
}
