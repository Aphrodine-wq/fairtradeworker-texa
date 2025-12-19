/**
 * VOID OS Lock Screen Utilities
 */

export interface LockScreenConfig {
  autoLockDelay?: number // milliseconds of inactivity before auto-lock
  pinLength?: number // 4-6 digits
  enableBiometric?: boolean
}

const DEFAULT_CONFIG: LockScreenConfig = {
  autoLockDelay: 5 * 60 * 1000, // 5 minutes
  pinLength: 6,
  enableBiometric: true,
}

let inactivityTimer: NodeJS.Timeout | null = null
let config: LockScreenConfig = DEFAULT_CONFIG

/**
 * Initialize lock screen with configuration
 */
export function initLockScreen(customConfig?: LockScreenConfig): void {
  config = { ...DEFAULT_CONFIG, ...customConfig }
}

/**
 * Start inactivity timer for auto-lock
 */
export function startInactivityTimer(onLock: () => void): void {
  stopInactivityTimer()
  
  if (!config.autoLockDelay || config.autoLockDelay <= 0) {
    return
  }

  const resetTimer = () => {
    stopInactivityTimer()
    inactivityTimer = setTimeout(() => {
      onLock()
    }, config.autoLockDelay!)
  }

  // Reset on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true })
  })

  resetTimer()
}

/**
 * Stop inactivity timer
 */
export function stopInactivityTimer(): void {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer)
    inactivityTimer = null
  }
}

/**
 * Validate PIN format
 */
export function validatePin(pin: string): boolean {
  const length = config.pinLength || 6
  return /^\d+$/.test(pin) && pin.length === length
}

/**
 * Hash PIN for storage (simple obfuscation - not true encryption)
 */
export function hashPin(pin: string): string {
  // Simple hash for client-side storage
  // In production, PIN should be hashed server-side
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Verify PIN
 */
export function verifyPin(inputPin: string, storedHash: string): boolean {
  return hashPin(inputPin) === storedHash
}

/**
 * Check if WebAuthn (biometric) is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!config.enableBiometric) {
    return false
  }

  try {
    return !!window.PublicKeyCredential && 
           PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== undefined
  } catch {
    return false
  }
}

/**
 * Authenticate with biometric
 */
export async function authenticateBiometric(): Promise<boolean> {
  if (!await isBiometricAvailable()) {
    return false
  }

  try {
    // Check if platform authenticator is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    if (!available) {
      return false
    }

    // In a real implementation, this would use WebAuthn API
    // For now, simulate with a simple check
    // TODO: Implement full WebAuthn flow
    return true
  } catch (error) {
    console.error('[LockScreen] Biometric authentication failed:', error)
    return false
  }
}

/**
 * Format time for lock screen display
 */
export function formatLockScreenTime(): { time: string; date: string } {
  const now = new Date()
  
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return { time, date }
}
