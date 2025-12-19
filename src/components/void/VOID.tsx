import React, { Suspense, lazy, useState } from 'react'
import { useVoidKeyboard } from '@/hooks/useVoidKeyboard'
import { VoidDesktop } from './VoidDesktop'
import { VoidWindowManager } from './VoidWindowManager'
import { VoidBuddy } from './VoidBuddy'
import { VoidVoiceCapture } from './VoidVoiceCapture'
import { VoidToolbar } from './VoidToolbar'
import { VoidTaskbar } from './VoidTaskbar'
import { VoidErrorBoundary } from './VoidErrorBoundary'
import { VoidBootScreen } from './VoidBootScreen'
import { VoidLockScreen } from './VoidLockScreen'
import { VoidSpotlight } from './VoidSpotlight'
import { VoidNotificationCenter } from './VoidNotificationCenter'
import { VoidControlCenter } from './VoidControlCenter'
import { VoidToastContainer } from './VoidToast'
import { VoidDock } from './VoidDock'
import { VoidOfflineIndicator } from './VoidOfflineIndicator'
import { VoidMissionControl } from './VoidMissionControl'
import { VoidClipboardManager } from './VoidClipboardManager'
import { useVoidStore } from '@/lib/void/store'
import { initAccessibility } from '@/lib/void/accessibility'
import { setupInactivityTimer } from '@/lib/void/session'
import { initTheme } from '@/lib/themes'
import { BackgroundSystem } from './BackgroundSystem'
import { WiremapBackground } from './WiremapBackground'
import type { User } from '@/lib/types'
import '@/styles/void-desktop.css'
import '@/styles/void-voice.css'
import '@/styles/void-os-layers.css'
import '@/styles/void-design-system.css'
import '@/styles/void-effects.css'

// Lazy load heavy components
const VoidMobileNav = lazy(() => import('./VoidMobileNav').then(m => ({ default: m.VoidMobileNav })))

interface VOIDProps {
  user: User
  onNavigate?: (page: string) => void
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-[var(--void-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}


export function VOID({ user, onNavigate }: VOIDProps) {
  // Initialize theme immediately before first render (synchronous)
  React.useLayoutEffect(() => {
    try {
      initTheme()
    } catch (error) {
      console.error('[VOID] Theme initialization error:', error)
      // Fallback: ensure at least basic theme is set
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])
  
  // Initialize keyboard shortcuts
  useVoidKeyboard()
  
  // Initialize accessibility
  React.useEffect(() => {
    initAccessibility()
  }, [])
  
  // Setup inactivity timer for auto-lock
  React.useEffect(() => {
    const cleanup = setupInactivityTimer()
    return cleanup
  }, [])

  const { isLocked, spotlightOpen, virtualDesktops, activeDesktopId, wiremapEnabled } = useVoidStore()
  const [missionControlOpen, setMissionControlOpen] = useState(false)
  const [clipboardOpen, setClipboardOpen] = useState(false)
  const [bootComplete, setBootComplete] = useState(false)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Handle boot sequence completion
  const handleBootComplete = () => {
    setBootComplete(true)
  }

  // Show boot screen until boot is complete
  if (!bootComplete) {
    return (
      <VoidBootScreen
        userId={user.id}
        userName={user.fullName || 'User'}
        onComplete={handleBootComplete}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden void-desktop" style={{ backgroundColor: 'var(--void-bg)' }}>
      <VoidErrorBoundary>
        {/* Boot Screen (handled above) */}
        
        {/* Background Layer (z: 0-1) */}
        <div className="absolute inset-0 void-overlay-background" style={{ zIndex: 0 }}>
          <VoidErrorBoundary>
            <BackgroundSystem />
          </VoidErrorBoundary>
          {wiremapEnabled && (
            <VoidErrorBoundary>
              <WiremapBackground />
            </VoidErrorBoundary>
          )}
        </div>
        
        {/* Lock Screen */}
        {isLocked && (
          <VoidErrorBoundary>
            <VoidLockScreen />
          </VoidErrorBoundary>
        )}

        {/* Offline Indicator */}
        <VoidErrorBoundary>
          <VoidOfflineIndicator />
        </VoidErrorBoundary>

        {/* Toast Notifications */}
        <VoidErrorBoundary>
          <VoidToastContainer />
        </VoidErrorBoundary>

        {/* Spotlight Search */}
        {spotlightOpen && (
          <VoidErrorBoundary>
            <VoidSpotlight />
          </VoidErrorBoundary>
        )}

        {/* Notification Center (handled by System Tray) */}
        {/* Control Center (handled by System Tray) */}
        {/* Clipboard Manager */}
        {clipboardOpen && (
          <VoidErrorBoundary>
            <VoidClipboardManager
              isOpen={clipboardOpen}
              onClose={() => setClipboardOpen(false)}
            />
          </VoidErrorBoundary>
        )}

        {/* Mission Control */}
        {missionControlOpen && (
          <VoidErrorBoundary>
            <VoidMissionControl
              isOpen={missionControlOpen}
              onClose={() => setMissionControlOpen(false)}
            />
          </VoidErrorBoundary>
        )}

        {/* Toolbar */}
        <VoidErrorBoundary resetKeys={[user.id]}>
          <VoidToolbar user={user} onNavigate={onNavigate} />
        </VoidErrorBoundary>

        {/* Desktop */}
        <div className="absolute inset-0 pt-16">
          <VoidErrorBoundary>
            <VoidDesktop />
          </VoidErrorBoundary>
        </div>

        {/* Dock (if enabled in settings) */}
        {!isMobile && (
          <VoidErrorBoundary>
            <VoidDock />
          </VoidErrorBoundary>
        )}

        {/* Buddy */}
        <VoidErrorBoundary>
          <VoidBuddy userName={user.fullName || 'there'} />
        </VoidErrorBoundary>

        {/* Voice Capture */}
        <VoidErrorBoundary>
          <VoidVoiceCapture user={user} />
        </VoidErrorBoundary>

        {/* Windows */}
        <VoidErrorBoundary>
          <VoidWindowManager />
        </VoidErrorBoundary>

        {/* Taskbar (Desktop only) */}
        {!isMobile && (
          <VoidErrorBoundary>
            <VoidTaskbar />
          </VoidErrorBoundary>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <Suspense fallback={null}>
            <VoidErrorBoundary>
              <VoidMobileNav />
            </VoidErrorBoundary>
          </Suspense>
        )}
      </VoidErrorBoundary>
    </div>
  )
}

