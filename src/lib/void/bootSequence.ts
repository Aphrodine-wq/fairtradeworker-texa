/**
 * VOID OS Boot Sequence
 * Handles the complete boot process with 4 phases
 */

export type BootPhase = 'pre-boot' | 'system-init' | 'user-load' | 'desktop-ready' | 'complete'

export interface BootProgress {
  phase: BootPhase
  progress: number // 0-100
  message: string
}

export type BootPhaseHandler = () => Promise<void>

export interface BootSequenceConfig {
  onProgress?: (progress: BootProgress) => void
  onPhaseComplete?: (phase: BootPhase) => void
  onComplete?: () => void
}

/**
 * Phase 0: Pre-Boot (0-100ms)
 * - Check localStorage for session
 * - Validate auth token
 * - Detect device capabilities
 * - Load cached theme
 */
async function phase0PreBoot(onProgress?: (progress: BootProgress) => void): Promise<void> {
  if (onProgress) {
    onProgress({ phase: 'pre-boot', progress: 0, message: 'Initializing...' })
  }

  // Check localStorage for session
  const session = localStorage.getItem('void-session')
  if (onProgress) {
    onProgress({ phase: 'pre-boot', progress: 25, message: 'Checking session...' })
  }

  // Validate auth token if exists
  if (session) {
    try {
      const sessionData = JSON.parse(session)
      if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
        localStorage.removeItem('void-session')
      }
    } catch {
      localStorage.removeItem('void-session')
    }
  }

  if (onProgress) {
    onProgress({ phase: 'pre-boot', progress: 50, message: 'Detecting capabilities...' })
  }

  // Detect device capabilities
  const capabilities = {
    webgl: !!window.WebGLRenderingContext,
    indexeddb: !!window.indexedDB,
    serviceWorker: 'serviceWorker' in navigator,
    webAuthn: !!window.PublicKeyCredential,
    clipboard: !!navigator.clipboard,
  }

  // Store capabilities
  sessionStorage.setItem('void-capabilities', JSON.stringify(capabilities))

  if (onProgress) {
    onProgress({ phase: 'pre-boot', progress: 75, message: 'Loading theme...' })
  }

  // Load cached theme
  const cachedTheme = localStorage.getItem('void-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', cachedTheme)

  if (onProgress) {
    onProgress({ phase: 'pre-boot', progress: 100, message: 'Pre-boot complete' })
  }

  // Extended delay for longer boot animation
  await new Promise(resolve => setTimeout(resolve, 800))
}

/**
 * Phase 1: System Init (100-500ms)
 * - Initialize Zustand stores
 * - Hydrate from IndexedDB
 * - Start WebGL wiremap worker
 * - Preload critical assets
 */
async function phase1SystemInit(onProgress?: (progress: BootProgress) => void): Promise<void> {
  if (onProgress) {
    onProgress({ phase: 'system-init', progress: 0, message: 'Initializing system...' })
  }

  // Initialize stores (Zustand auto-initializes)
  if (onProgress) {
    onProgress({ phase: 'system-init', progress: 20, message: 'Loading stores...' })
  }

  // Hydrate from IndexedDB
  if (onProgress) {
    onProgress({ phase: 'system-init', progress: 40, message: 'Hydrating data...' })
  }

  // Check IndexedDB availability
  if (window.indexedDB) {
    try {
      // IndexedDB hydration happens automatically via Zustand persist
      // Extended delay for longer boot animation
  await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.warn('[Boot] IndexedDB hydration failed:', error)
    }
  }

  if (onProgress) {
    onProgress({ phase: 'system-init', progress: 60, message: 'Starting wiremap...' })
  }

  // WebGL worker is lazy-loaded, just prepare
  // Actual worker starts when WiremapBackground mounts

  if (onProgress) {
    onProgress({ phase: 'system-init', progress: 80, message: 'Preloading assets...' })
  }

  // Preload critical assets (fonts, icons)
  const criticalAssets = [
    // Fonts are loaded via CSS, no action needed
  ]

  await Promise.all(criticalAssets.map(() => Promise.resolve()))

  if (onProgress) {
    onProgress({ phase: 'system-init', progress: 100, message: 'System ready' })
  }

  // Extended delay for longer boot animation
  await new Promise(resolve => setTimeout(resolve, 1000))
}

/**
 * Phase 2: User Load (500-1000ms)
 * - Fetch user profile
 * - Restore window states
 * - Load notifications
 * - Sync offline changes
 */
async function phase2UserLoad(
  onProgress?: (progress: BootProgress) => void,
  userId?: string
): Promise<void> {
  if (onProgress) {
    onProgress({ phase: 'user-load', progress: 0, message: 'Loading user data...' })
  }

  // Fetch user profile (if userId provided)
  if (userId) {
    if (onProgress) {
      onProgress({ phase: 'user-load', progress: 25, message: 'Fetching profile...' })
    }
    // User profile should already be loaded by parent component
    // Extended delay for longer boot animation
  await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (onProgress) {
    onProgress({ phase: 'user-load', progress: 50, message: 'Restoring windows...' })
  }

  // Window states are restored via Zustand persist
  // No additional action needed

  if (onProgress) {
    onProgress({ phase: 'user-load', progress: 75, message: 'Loading notifications...' })
  }

  // Notifications will be loaded when notification system is implemented
  // Extended delay for longer boot animation
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (onProgress) {
    onProgress({ phase: 'user-load', progress: 100, message: 'User data loaded' })
  }

  // Extended delay for longer boot animation
  await new Promise(resolve => setTimeout(resolve, 1000))
}

/**
 * Phase 3: Desktop Ready (1000-1500ms)
 * - Render desktop icons
 * - Initialize Buddy greeting
 * - Connect media services
 * - Fade to desktop (300ms)
 */
async function phase3DesktopReady(
  onProgress?: (progress: BootProgress) => void,
  userName?: string
): Promise<void> {
  if (onProgress) {
    onProgress({ phase: 'desktop-ready', progress: 0, message: 'Preparing desktop...' })
  }

  // Desktop icons are rendered by VoidDesktop component
  if (onProgress) {
    onProgress({ phase: 'desktop-ready', progress: 30, message: 'Rendering icons...' })
  }
  await new Promise(resolve => setTimeout(resolve, 100))

  // Initialize Buddy greeting
  if (onProgress) {
    onProgress({ phase: 'desktop-ready', progress: 50, message: userName ? `Welcome back, ${userName}` : 'Initializing assistant...' })
  }
  await new Promise(resolve => setTimeout(resolve, 100))

  // Connect media services (Spotify, etc.)
  if (onProgress) {
    onProgress({ phase: 'desktop-ready', progress: 75, message: 'Connecting services...' })
  }
  await new Promise(resolve => setTimeout(resolve, 100))

  if (onProgress) {
    onProgress({ phase: 'desktop-ready', progress: 100, message: 'Desktop ready' })
  }

  // Extended final delay before fade
  await new Promise(resolve => setTimeout(resolve, 1500))
}

/**
 * Complete boot sequence
 */
export async function runBootSequence(
  config: BootSequenceConfig = {},
  userId?: string,
  userName?: string
): Promise<void> {
  const { onProgress, onPhaseComplete, onComplete } = config

  try {
    // Phase 0: Pre-Boot
    await phase0PreBoot(onProgress)
    if (onPhaseComplete) onPhaseComplete('pre-boot')

    // Phase 1: System Init
    await phase1SystemInit(onProgress)
    if (onPhaseComplete) onPhaseComplete('system-init')

    // Phase 2: User Load
    await phase2UserLoad(onProgress, userId)
    if (onPhaseComplete) onPhaseComplete('user-load')

    // Phase 3: Desktop Ready
    await phase3DesktopReady(onProgress, userName)
    if (onPhaseComplete) onPhaseComplete('desktop-ready')

    // Mark as complete
    if (onProgress) {
      onProgress({ phase: 'complete', progress: 100, message: 'Ready' })
    }
    if (onPhaseComplete) onPhaseComplete('complete')

    if (onComplete) {
      onComplete()
    }
  } catch (error) {
    console.error('[Boot] Boot sequence failed:', error)
    if (onProgress) {
      onProgress({ phase: 'complete', progress: 100, message: 'Boot complete (with errors)' })
    }
    if (onComplete) {
      onComplete()
    }
  }
}
