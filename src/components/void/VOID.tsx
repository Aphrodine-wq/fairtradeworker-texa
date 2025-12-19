import React, { Suspense, lazy, useState, useMemo, useCallback } from 'react'
import { useVoidKeyboard } from '@/hooks/useVoidKeyboard'
import { VoidDesktop } from './VoidDesktop'
import { VoidWindowManager } from './VoidWindowManager'
import { VoidBuddy } from './VoidBuddy'
import { VoidVoiceCapture } from './VoidVoiceCapture'
import { VoidToolbar } from './VoidToolbar'
import { VoidTaskbar } from './VoidTaskbar'
import { VoidBottomNav } from './VoidBottomNav'
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
import { StarWireframe } from './StarWireframe'
import { MediaToolbar } from '@/components/media/MediaToolbar'
import type { User } from '@/lib/types'
import '@/styles/void-desktop.css'
import '@/styles/void-voice.css'
import '@/styles/void-os-layers.css'
import '@/styles/void-design-system.css'
import '@/styles/void-effects.css'

// Lazy load heavy components with optimized loading
const VoidMobileNav = lazy(() => 
  import('./VoidMobileNav').then(m => ({ default: m.VoidMobileNav }))
    .catch(() => ({ default: () => null })) // Graceful fallback
)

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

  // Optimized store selectors - only subscribe to what we need
  const isLocked = useVoidStore(state => state.isLocked)
  const spotlightOpen = useVoidStore(state => state.spotlightOpen)
  const wiremapEnabled = useVoidStore(state => state.wiremapEnabled)
  
  const [missionControlOpen, setMissionControlOpen] = useState(false)
  const [clipboardOpen, setClipboardOpen] = useState(false)
  const [bootComplete, setBootComplete] = useState(false)

  // Memoize mobile detection
  const isMobile = useMemo(() => 
    typeof window !== 'undefined' && window.innerWidth < 768,
    []
  )

  // Memoized callbacks to prevent unnecessary re-renders
  const handleBootComplete = useCallback(() => {
    setBootComplete(true)
  }, [])

  const handleCloseClipboard = useCallback(() => {
    setClipboardOpen(false)
  }, [])

  const handleCloseMissionControl = useCallback(() => {
    setMissionControlOpen(false)
  }, [])

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
          <VoidErrorBoundary>
            <StarWireframe />
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

        {/* Notification Center and Control Center are handled by VoidSystemTray component */}
        {/* They open when clicking the notification bell and music icon respectively */}
        {/* Clipboard Manager */}
        {clipboardOpen && (
          <VoidErrorBoundary>
            <VoidClipboardManager
              isOpen={clipboardOpen}
              onClose={handleCloseClipboard}
            />
          </VoidErrorBoundary>
        )}

        {/* Mission Control */}
        {missionControlOpen && (
          <VoidErrorBoundary>
            <VoidMissionControl
              isOpen={missionControlOpen}
              onClose={handleCloseMissionControl}
            />
          </VoidErrorBoundary>
        )}

        {/* Top Toolbar */}
        <VoidErrorBoundary resetKeys={[user.id]}>
          <VoidToolbar user={user} onNavigate={onNavigate} />
        </VoidErrorBoundary>

        {/* Music Player */}
        <VoidErrorBoundary>
          <MediaToolbar />
        </VoidErrorBoundary>

        {/* Desktop */}
        <div className="absolute inset-0" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <VoidErrorBoundary>
            <VoidDesktop />
          </VoidErrorBoundary>
        </div>
        
        {/* Bottom Navigation */}
        <VoidErrorBoundary>
          <VoidBottomNav user={user} onNavigate={onNavigate} />
        </VoidErrorBoundary>

        {/* Dock (if enabled in settings) */}
        {!isMobile && (
          <VoidErrorBoundary>
            <VoidDock />
          </VoidErrorBoundary>
        )}

        {/* Buddy (includes Voice Capture below panel) */}
        <VoidErrorBoundary>
          <VoidBuddy user={user} />
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

